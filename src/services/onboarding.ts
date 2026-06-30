"use server";

import { revalidatePath } from "next/cache";
import { getServerAuth } from "@/lib/auth/server-auth";
import { aiBuildProfile } from "@/services/ai";
import { analyzeReadiness } from "@/lib/ai/readiness";
import { compileOnboardingForProfileAI } from "@/lib/onboarding/profile-context";
import { formatAge } from "@/lib/helpers/utils";
import { createEvent, emitEvent } from "@/domains/events";
import { ensureWorkflowsRegistered } from "@/domains/workflows/launch-workflows";
import type { OnboardingState } from "@/types";

export async function completeOnboarding(state: OnboardingState) {
  ensureWorkflowsRegistered();
  const auth = await getServerAuth();
  if (!auth?.user) {
    return { error: "Not signed in. Please verify your phone number again." };
  }

  const { admin, user: appUser } = auth;

  const platform = state.platform ?? "dating";
  const { findProfileIdByUserAndPlatform, hasPlatformColumn, withPlatformField } =
    await import("@/lib/platform/profile-query");

  let profileId =
    (await findProfileIdByUserAndPlatform(admin, appUser.id, platform)) ?? undefined;
  if (!profileId) {
    const { createPlatformProfile } = await import("@/lib/platform/service");
    profileId = await createPlatformProfile(admin, appUser.id, platform);
  }

  if (!profileId) {
    return { error: "Profile not found." };
  }

  let aiProfile = state.aiGeneratedProfile;
  let readiness = null;

  if (state.intent) {
    const profileContext = compileOnboardingForProfileAI(state);
    if (!aiProfile && Object.keys(profileContext).length > 0) {
      const built = await aiBuildProfile(profileContext, state.intent);
      aiProfile = built.data;
    }
    if (Object.keys(state.aiAnswers).length > 0) {
      const ready = await analyzeReadiness(profileContext, state.intent);
      readiness = ready.data;
    }
  }

  const dob = state.basicInfo.dob;
  const age = dob ? formatAge(dob) : null;

  const platformReady = await hasPlatformColumn(admin);
  const profileUpdate = withPlatformField(
    {
      full_name: state.basicInfo.full_name ?? "",
      gender: state.gender,
      looking_for: state.looking_for,
      intent: state.intent,
      dob: dob ?? null,
      age,
      city: state.basicInfo.city ?? null,
      district: state.basicInfo.district ?? null,
      village: state.basicInfo.village ?? null,
      region: state.basicInfo.region ?? null,
      education: state.basicInfo.education ?? null,
      profession: state.basicInfo.profession ?? null,
      bio: state.basicInfo.bio ?? aiProfile?.short_bio ?? null,
      ai_bio: aiProfile?.detailed_bio ?? null,
      ai_profile_summary: aiProfile?.personality_summary ?? null,
      personality_tags: aiProfile?.personality_tags ?? [],
      interest_tags: aiProfile?.interest_tags ?? [],
      values_tags: aiProfile?.values_tags ?? [],
      ai_personality_tags: aiProfile?.personality_tags ?? [],
      ai_interest_tags: aiProfile?.interest_tags ?? [],
      ai_relationship_style: aiProfile?.relationship_style ?? null,
      ai_communication_style: aiProfile?.communication_style ?? null,
      lifestyle: state.lifestyle,
      family_background: {
        ...state.familyBackground,
        religious_preference: "hindu",
      },
      readiness_score: readiness?.overall ?? 0,
      profile_status: platform === "vip" ? "hidden" : "active",
      vip_approval_status: platform === "vip" ? "pending" : null,
      vip_invite_code: platform === "vip" ? state.vipInviteCode : null,
      vip_details: platform === "vip" ? state.vipDetails : {},
    },
    platform,
    platformReady
  );

  const { error: profileError } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", profileId);

  if (profileError) {
    return { error: profileError.message };
  }

  if (readiness) {
    await admin.from("ai_readiness").upsert(
      {
        user_id: appUser.id,
        profile_id: profileId,
        json_result: readiness,
        model_used: "openai",
      },
      { onConflict: "profile_id" }
    );
  }

  await admin
    .from("verification_status")
    .update({ mobile_verified: true })
    .eq("profile_id", profileId);

  for (const [key, value] of Object.entries(state.aiAnswers)) {
    await admin.from("profile_answers").upsert(
      {
        profile_id: profileId,
        question_key: key,
        question_label: key,
        answer_value: value,
      },
      { onConflict: "profile_id,question_key" }
    );
  }

  if (state.photos.length > 0) {
    await admin.from("profile_photos").delete().eq("profile_id", profileId);
    await admin.from("profile_photos").insert(
      state.photos.map((url, i) => ({
        profile_id: profileId,
        url,
        sort_order: i,
        is_primary: i === 0,
        is_private: false,
      }))
    );
  }

  revalidatePath(`/${platform}/discover`);
  revalidatePath(`/${platform}/profile`);

  await emitEvent(
    createEvent(
      "ProfileCompleted",
      { platform, intent: state.intent, profileId },
      {
        userId: appUser.id,
        profileId,
        idempotencyKey: `profile-completed-${profileId}`,
      }
    )
  );

  return { success: true, profileId };
}
