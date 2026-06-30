import type { SupabaseClient } from "@supabase/supabase-js";
import { formatAge } from "@/lib/helpers/utils";

export type MobileOnboardingPayload = {
  platform?: string | null;
  intent?: string | null;
  gender?: string | null;
  basicInfo?: {
    fullName?: string;
    dob?: string;
    city?: string;
    district?: string;
    village?: string;
    region?: string;
    bio?: string;
    education?: string;
    profession?: string;
  };
  lifestyle?: Record<string, string>;
  family?: Record<string, string>;
  aiAnswers?: Record<string, string>;
  photos?: string[];
  vipInviteCode?: string | null;
  vipDetails?: Record<string, string>;
};

function deriveLookingFor(gender?: string | null): string {
  if (gender === "male") return "female";
  if (gender === "female") return "male";
  return "everyone";
}

export async function completeProfileFromMobilePayload(
  admin: SupabaseClient,
  profileId: string,
  payload: MobileOnboardingPayload
) {
  const basic = payload.basicInfo ?? {};
  const dob = basic.dob?.trim() || null;
  const age = dob ? formatAge(dob) : null;
  const httpPhotos = (payload.photos ?? []).filter((url) => /^https?:\/\//i.test(url));

  const platform =
    payload.platform === "vip"
      ? "vip"
      : payload.platform === "matrimony"
        ? "matrimony"
        : "dating";

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: basic.fullName?.trim() ?? "",
      gender: payload.gender ?? null,
      looking_for: deriveLookingFor(payload.gender),
      intent: payload.intent ?? null,
      platform,
      dob,
      age,
      city: basic.city?.trim() || null,
      district: basic.district?.trim() || null,
      village: basic.village?.trim() || null,
      region: basic.region ?? null,
      education: basic.education?.trim() || null,
      profession: basic.profession?.trim() || null,
      bio: basic.bio?.trim() || null,
      lifestyle: payload.lifestyle ?? {},
      family_background: {
        ...(payload.family ?? {}),
        religious_preference: "hindu",
      },
      profile_status: platform === "vip" ? "hidden" : "active",
      vip_approval_status: platform === "vip" ? "pending" : null,
      vip_invite_code: platform === "vip" ? payload.vipInviteCode ?? null : null,
      vip_details: platform === "vip" ? payload.vipDetails ?? {} : {},
    })
    .eq("id", profileId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  await admin.from("verification_status").upsert(
    { profile_id: profileId, mobile_verified: true },
    { onConflict: "profile_id" }
  );

  for (const [key, value] of Object.entries(payload.aiAnswers ?? {})) {
    if (!value?.trim()) continue;
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

  if (httpPhotos.length > 0) {
    await admin.from("profile_photos").delete().eq("profile_id", profileId);
    await admin.from("profile_photos").insert(
      httpPhotos.map((url, i) => ({
        profile_id: profileId,
        url,
        sort_order: i,
        is_primary: i === 0,
        is_private: false,
      }))
    );
  }

  return { success: true as const, profileId };
}

export function isProfileOnboardingComplete(profile: Record<string, unknown> | null | undefined) {
  if (!profile) return false;
  return (
    String(profile.profile_status) === "active" &&
    Boolean(String(profile.full_name ?? "").trim())
  );
}
