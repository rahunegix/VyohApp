import {
  emptyAdminProfileForm,
  tagsToString,
  type AdminProfileFormState,
} from "@/lib/admin/user-profile-schema";

export interface AdminAccountFormState {
  email: string;
  phone: string;
  password: string;
  role: "user" | "admin";
  is_active: boolean;
}

function getProfileFromApiData(data: Record<string, unknown>): AdminProfileFormState {
  const profiles = data.profiles;
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  if (!profile || typeof profile !== "object") return emptyAdminProfileForm();

  const p = profile as Record<string, unknown>;
  const verification = Array.isArray(p.verification_status)
    ? p.verification_status[0]
    : p.verification_status;
  const v = (verification ?? {}) as Record<string, unknown>;
  const photos = (p.profile_photos as Array<{ url: string }> | undefined) ?? [];

  return {
    ...emptyAdminProfileForm(),
    full_name: String(p.full_name ?? ""),
    gender: String(p.gender ?? ""),
    looking_for: String(p.looking_for ?? ""),
    dob: p.dob ? String(p.dob).slice(0, 10) : "",
    city: String(p.city ?? ""),
    district: String(p.district ?? ""),
    village: String(p.village ?? ""),
    region: String(p.region ?? ""),
    education: String(p.education ?? ""),
    profession: String(p.profession ?? ""),
    bio: String(p.bio ?? ""),
    ai_bio: String(p.ai_bio ?? ""),
    ai_profile_summary: String(p.ai_profile_summary ?? ""),
    ai_relationship_style: String(p.ai_relationship_style ?? ""),
    ai_communication_style: String(p.ai_communication_style ?? ""),
    intent: String(p.intent ?? "serious"),
    profile_status: String(p.profile_status ?? "draft"),
    trust_score: Number(p.trust_score ?? 20),
    compatibility_score: Number(p.compatibility_score ?? 0),
    readiness_score: Number(p.readiness_score ?? 0),
    personality_tags: tagsToString(p.personality_tags as string[]),
    interest_tags: tagsToString(p.interest_tags as string[]),
    values_tags: tagsToString(p.values_tags as string[]),
    ai_personality_tags: tagsToString(p.ai_personality_tags as string[]),
    ai_interest_tags: tagsToString(p.ai_interest_tags as string[]),
    lifestyle: (p.lifestyle as Record<string, string>) ?? {},
    family_background: (p.family_background as Record<string, string>) ?? {},
    profile_origin: String(p.profile_origin ?? "member"),
    is_chat_bot: Boolean(p.is_chat_bot),
    bot_chat_enabled: Boolean(p.bot_chat_enabled),
    bot_max_replies: Number(p.bot_max_replies ?? 3),
    admin_notes: String(p.admin_notes ?? ""),
    photo_urls: photos.map((ph) => ph.url),
    mobile_verified: Boolean(v.mobile_verified),
    face_verified: Boolean(v.face_verified),
    id_verified: Boolean(v.id_verified),
    family_verified: Boolean(v.family_verified),
  };
}

export function mapApiUserToForms(data: Record<string, unknown>) {
  return {
    account: {
      email: String(data.email ?? ""),
      phone: String(data.phone ?? "").replace("+91", ""),
      password: "",
      role: (data.role as "user" | "admin") ?? "user",
      is_active: data.is_active !== false,
    } satisfies AdminAccountFormState,
    profile: getProfileFromApiData(data),
  };
}
