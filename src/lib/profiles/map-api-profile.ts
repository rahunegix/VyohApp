import type { DiscoverProfile, ProfilePhoto, VerificationStatus } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

export function mapProfilePhotos(profileId: string, raw: unknown): ProfilePhoto[] {
  const rows = (Array.isArray(raw) ? raw : []) as Record<string, unknown>[];
  const now = nowIso();
  return rows.map((p, i) => ({
    id: String(p.id ?? `photo-${profileId}-${i}`),
    profile_id: String(p.profile_id ?? profileId),
    url: String(p.url ?? ""),
    sort_order: Number(p.sort_order ?? i),
    is_private: Boolean(p.is_private ?? false),
    is_primary: Boolean(p.is_primary ?? i === 0),
    created_at: String(p.created_at ?? now),
    updated_at: String(p.updated_at ?? now),
  }));
}

function mapVerification(profileId: string, row: Record<string, unknown>): VerificationStatus {
  const v = (row.verification_status ?? row.verification) as Record<string, unknown> | undefined;
  const now = nowIso();
  return {
    id: String(v?.id ?? `verification-${profileId}`),
    profile_id: profileId,
    mobile_verified: Boolean(v?.mobile_verified ?? true),
    face_verified: Boolean(v?.face_verified ?? false),
    id_verified: Boolean(v?.id_verified ?? false),
    family_verified: Boolean(v?.family_verified ?? false),
    verified_at: v?.verified_at ? String(v.verified_at) : null,
    created_at: String(v?.created_at ?? now),
    updated_at: String(v?.updated_at ?? now),
  };
}

export function mapDiscoverProfile(row: Record<string, unknown>): DiscoverProfile {
  const id = String(row.id);
  const now = nowIso();
  return {
    id,
    user_id: String(row.user_id ?? ""),
    full_name: String(row.full_name ?? "Member"),
    gender: (row.gender as DiscoverProfile["gender"]) ?? "other",
    looking_for: (row.looking_for as DiscoverProfile["looking_for"]) ?? "everyone",
    dob: String(row.dob ?? ""),
    age: Number(row.age ?? 25),
    city: row.city != null ? String(row.city) : null,
    district: row.district != null ? String(row.district) : null,
    village: row.village != null ? String(row.village) : null,
    region: (row.region as DiscoverProfile["region"]) ?? null,
    education: row.education != null ? String(row.education) : null,
    profession: row.profession != null ? String(row.profession) : null,
    bio: row.bio != null ? String(row.bio) : null,
    ai_bio: row.ai_bio != null ? String(row.ai_bio) : null,
    intent: (row.intent as DiscoverProfile["intent"]) ?? "serious",
    platform: (row.platform as DiscoverProfile["platform"]) ?? "dating",
    cross_platform_visible: Boolean(row.cross_platform_visible ?? false),
    vip_approval_status: (row.vip_approval_status as DiscoverProfile["vip_approval_status"]) ?? null,
    vip_details: (row.vip_details as DiscoverProfile["vip_details"]) ?? {},
    vip_invite_code: row.vip_invite_code != null ? String(row.vip_invite_code) : null,
    profile_status: (row.profile_status as DiscoverProfile["profile_status"]) ?? "active",
    trust_score: Number(row.trust_score ?? 50),
    compatibility_score: Number(row.compatibility_score ?? 70),
    readiness_score: Number(row.readiness_score ?? 70),
    personality_tags: (row.personality_tags as string[]) ?? [],
    interest_tags: (row.interest_tags as string[]) ?? [],
    values_tags: (row.values_tags as string[]) ?? [],
    lifestyle: (row.lifestyle as Record<string, string>) ?? null,
    family_background: (row.family_background as Record<string, string>) ?? null,
    created_at: String(row.created_at ?? now),
    updated_at: String(row.updated_at ?? now),
    photos: mapProfilePhotos(id, row.profile_photos ?? row.photos),
    verification: mapVerification(id, row),
    distance_label: row.distance_label != null ? String(row.distance_label) : undefined,
  };
}
