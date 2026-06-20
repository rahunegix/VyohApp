"use server";

import { revalidatePath } from "next/cache";
import { getServerAuth } from "@/lib/auth/server-auth";
import { logoutUser } from "@/lib/auth/custom-auth";
import { generateAIProfile } from "@/lib/ai/profile-assistant";
import { calculateCompatibility, calculateTrustScore, calculateReadinessScore } from "@/lib/matching/compatibility";
import {
  editProfileSchema,
  basicProfileSchema,
  editIntentMatchingSchema,
  editLifestylePayloadSchema,
  editFamilyPayloadSchema,
  editPhotosSchema,
  editAnswersSchema,
  intentSchema,
  chatRequestSchema,
  messageSchema,
  reportSchema,
  blockSchema,
  privacySettingsSchema,
} from "@/lib/validation/schemas";
import { formatAge } from "@/lib/helpers/utils";
import type { Profile } from "@/types";

async function getAuthContext() {
  const auth = await getServerAuth();
  if (!auth?.profile) return null;
  return { admin: auth.admin, profile: auth.profile, user: auth.user };
}

async function getCurrentProfile() {
  const ctx = await getAuthContext();
  return ctx?.profile ?? null;
}

export async function getMyProfile() {
  return getCurrentProfile();
}

export async function updateProfile(data: unknown) {
  const parsed = editProfileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { lifestyle, family_background, intent, dob, ...rest } = parsed.data;
  const age = formatAge(dob);

  if (intent !== profile.intent) {
    await admin.from("intent_history").insert({
      profile_id: profile.id,
      previous_intent: profile.intent,
      new_intent: intent,
      reason: "Updated from edit profile",
    });
  }

  const { error } = await admin
    .from("profiles")
    .update({
      ...rest,
      dob,
      age,
      intent,
      lifestyle: lifestyle ?? profile.lifestyle ?? {},
      family_background: {
        ...(typeof profile.family_background === "object" && profile.family_background
          ? profile.family_background
          : {}),
        ...(family_background ?? {}),
        religious_preference: "hindu",
      },
      profile_status: "active",
    })
    .eq("id", profile.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/discover");
  return { success: true };
}

export async function updateProfileBasicInfo(data: unknown) {
  const parsed = basicProfileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const age = formatAge(parsed.data.dob);
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      dob: parsed.data.dob,
      age,
      city: parsed.data.city,
      district: parsed.data.district,
      village: parsed.data.village ?? null,
      region: parsed.data.region,
      education: parsed.data.education,
      profession: parsed.data.profession,
      bio: parsed.data.bio ?? null,
    })
    .eq("id", profile.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function updateProfileIntentMatching(data: unknown) {
  const parsed = editIntentMatchingSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  if (parsed.data.intent !== profile.intent) {
    await admin.from("intent_history").insert({
      profile_id: profile.id,
      previous_intent: profile.intent,
      new_intent: parsed.data.intent,
      reason: "Updated from edit profile",
    });
  }

  const { error } = await admin
    .from("profiles")
    .update({
      intent: parsed.data.intent,
      looking_for: parsed.data.looking_for,
    })
    .eq("id", profile.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function updateProfileLifestyle(data: unknown) {
  const parsed = editLifestylePayloadSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid lifestyle data" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { error } = await admin
    .from("profiles")
    .update({ lifestyle: parsed.data })
    .eq("id", profile.id);

  if (error) return { error: error.message };
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function updateProfileFamily(data: unknown) {
  const parsed = editFamilyPayloadSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid family data" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { error } = await admin
    .from("profiles")
    .update({
      family_background: {
        ...(typeof profile.family_background === "object" && profile.family_background
          ? profile.family_background
          : {}),
        ...parsed.data,
        religious_preference: "hindu",
      },
    })
    .eq("id", profile.id);

  if (error) return { error: error.message };
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function getMyProfilePhotos(): Promise<string[]> {
  const ctx = await getAuthContext();
  if (!ctx) return [];
  const { admin, profile } = ctx;

  const { data } = await admin
    .from("profile_photos")
    .select("url")
    .eq("profile_id", profile.id)
    .order("sort_order");

  return data?.map((row) => row.url) ?? [];
}

export async function updateMyProfilePhotos(data: unknown) {
  const parsed = editPhotosSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  await admin.from("profile_photos").delete().eq("profile_id", profile.id);

  const { error } = await admin.from("profile_photos").insert(
    parsed.data.photos.map((url, i) => ({
      profile_id: profile.id,
      url,
      sort_order: i,
      is_primary: i === 0,
      is_private: false,
    }))
  );

  if (error) return { error: error.message };
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}

export async function getMyProfileAnswers(): Promise<Record<string, string>> {
  const ctx = await getAuthContext();
  if (!ctx) return {};
  const { admin, profile } = ctx;

  const { data } = await admin
    .from("profile_answers")
    .select("question_key, answer_value")
    .eq("profile_id", profile.id);

  const answers: Record<string, string> = {};
  data?.forEach((row) => {
    answers[row.question_key] = row.answer_value;
  });
  return answers;
}

export async function updateMyProfileAnswers(data: unknown) {
  const parsed = editAnswersSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid answers" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  for (const [key, value] of Object.entries(parsed.data)) {
    if (!value.trim()) continue;
    const { error } = await admin.from("profile_answers").upsert(
      {
        profile_id: profile.id,
        question_key: key,
        question_label: key,
        answer_value: value.trim(),
      },
      { onConflict: "profile_id,question_key" }
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/profile/edit");
  return { success: true };
}

export async function updateIntent(data: unknown) {
  const parsed = intentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;

  await admin.from("intent_history").insert({
    profile_id: profile.id,
    previous_intent: profile.intent,
    new_intent: parsed.data.intent,
    reason: parsed.data.reason,
  });

  const { error } = await admin
    .from("profiles")
    .update({ intent: parsed.data.intent })
    .eq("id", profile.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { success: true };
}

export async function generateProfileFromAI(answers: Record<string, string>, intent: string) {
  const aiProfile = generateAIProfile(answers, intent);
  const ctx = await getAuthContext();

  if (ctx?.profile) {
    const { admin, profile } = ctx;
    await admin.from("profiles").update({
      bio: aiProfile.short_bio,
      ai_bio: aiProfile.long_bio,
      personality_tags: aiProfile.personality_tags,
      interest_tags: aiProfile.interest_tags,
      values_tags: aiProfile.values_tags,
      readiness_score: aiProfile.readiness_score,
    }).eq("id", profile.id);

    for (const [key, value] of Object.entries(answers)) {
      await admin.from("profile_answers").upsert({
        profile_id: profile.id,
        question_key: key,
        question_label: key,
        answer_value: value,
      }, { onConflict: "profile_id,question_key" });
    }
  }

  return { success: true, data: aiProfile };
}

export async function sendInterest(receiverProfileId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { error } = await admin.from("likes").insert({
    sender_profile_id: profile.id,
    receiver_profile_id: receiverProfileId,
  });

  if (error) return { error: error.message };
  revalidatePath("/discover");
  return { success: true };
}

/** @deprecated Use sendInterest */
export const sendLike = sendInterest;

export async function sendChatRequest(data: unknown) {
  const parsed = chatRequestSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { error } = await admin.from("chat_requests").insert({
    sender_profile_id: profile.id,
    receiver_profile_id: parsed.data.receiver_profile_id,
    message: parsed.data.message,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function respondToChatRequest(requestId: string, accept: boolean) {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { error } = await admin
    .from("chat_requests")
    .update({ status: accept ? "accepted" : "rejected" })
    .eq("id", requestId);

  if (error) return { error: error.message };
  revalidatePath("/chats");
  return { success: true };
}

export async function sendMessage(data: unknown) {
  const parsed = messageSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { error } = await admin.from("messages").insert({
    conversation_id: parsed.data.conversation_id,
    sender_profile_id: profile.id,
    message_text: parsed.data.message_text,
    message_type: parsed.data.message_type,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function reportUser(data: unknown) {
  const parsed = reportSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { error } = await admin.from("reports").insert({
    reporter_profile_id: profile.id,
    reported_profile_id: parsed.data.reported_profile_id,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function blockUser(data: unknown) {
  const parsed = blockSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { error } = await admin.from("blocks").insert({
    blocker_profile_id: profile.id,
    blocked_profile_id: parsed.data.blocked_profile_id,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePrivacySettings(data: unknown) {
  const parsed = privacySettingsSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  const { admin } = ctx;
  const { error } = await admin
    .from("privacy_settings")
    .update(parsed.data)
    .eq("profile_id", profile.id);

  if (error) return { error: error.message };
  revalidatePath("/settings/privacy");
  return { success: true };
}

export async function deleteAccount() {
  const auth = await getServerAuth();
  if (!auth?.user) return { error: "Not authenticated" };

  await auth.admin
    .from("users")
    .update({ is_active: false, access_token: null, refresh_token_hash: null })
    .eq("id", auth.user.id);

  await logoutUser(auth.user.id);
  return { success: true };
}

export async function computeCompatibility(profileA: Profile, profileB: Profile) {
  return calculateCompatibility(profileA, profileB);
}
