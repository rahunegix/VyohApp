import { z } from "zod";
import { formatAge } from "@/lib/helpers/utils";

const emptyToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === "" || val === undefined ? null : val), schema.nullable().optional());

const optionalString = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.string().nullable().optional()
);

export const adminProfilePayloadSchema = z.object({
  full_name: z.string().optional(),
  gender: emptyToNull(z.enum(["male", "female", "other"])),
  looking_for: emptyToNull(z.enum(["male", "female", "everyone"])),
  dob: optionalString,
  city: optionalString,
  district: optionalString,
  village: optionalString,
  region: emptyToNull(z.enum(["garhwal", "kumaon", "both", "diaspora"])),
  education: optionalString,
  profession: optionalString,
  bio: optionalString,
  ai_bio: optionalString,
  ai_profile_summary: optionalString,
  ai_relationship_style: optionalString,
  ai_communication_style: optionalString,
  intent: z.enum(["exploring", "serious", "marriage"]).optional(),
  profile_status: z.enum(["draft", "active", "hidden", "suspended"]).optional(),
  trust_score: z.number().min(0).max(100).optional(),
  compatibility_score: z.number().min(0).max(100).optional(),
  readiness_score: z.number().min(0).max(100).optional(),
  personality_tags: z.union([z.array(z.string()), z.string()]).optional(),
  interest_tags: z.union([z.array(z.string()), z.string()]).optional(),
  values_tags: z.union([z.array(z.string()), z.string()]).optional(),
  ai_personality_tags: z.union([z.array(z.string()), z.string()]).optional(),
  ai_interest_tags: z.union([z.array(z.string()), z.string()]).optional(),
  lifestyle: z.record(z.string(), z.string()).optional(),
  family_background: z.record(z.string(), z.string()).optional(),
  profile_origin: z.enum(["member", "seed"]).optional(),
  is_chat_bot: z.boolean().optional(),
  bot_chat_enabled: z.boolean().optional(),
  bot_max_replies: z.number().min(0).max(20).optional(),
  admin_notes: optionalString,
  photo_urls: z.array(z.string()).optional(),
  mobile_verified: z.boolean().optional(),
  face_verified: z.boolean().optional(),
  id_verified: z.boolean().optional(),
  family_verified: z.boolean().optional(),
});

export const adminUserPayloadSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(8).optional().or(z.literal("")),
  role: z.enum(["user", "admin"]).optional(),
  is_active: z.boolean().optional(),
  profile: adminProfilePayloadSchema.optional(),
});

export type AdminUserPayload = z.infer<typeof adminUserPayloadSchema>;
export type AdminProfilePayload = z.infer<typeof adminProfilePayloadSchema>;

export function parseTags(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((t) => t.trim()).filter(Boolean);
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function tagsToString(tags: string[] | null | undefined): string {
  return (tags ?? []).join(", ");
}

export function buildProfileUpdate(payload: AdminProfilePayload) {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const assign = <K extends keyof AdminProfilePayload>(key: K) => {
    if (payload[key] !== undefined) update[key as string] = payload[key];
  };

  [
    "full_name", "gender", "looking_for", "dob", "city", "district", "village", "region",
    "education", "profession", "bio", "ai_bio", "ai_profile_summary", "ai_relationship_style",
    "ai_communication_style", "intent", "profile_status", "trust_score", "compatibility_score",
    "readiness_score", "lifestyle", "family_background", "profile_origin", "is_chat_bot",
    "bot_chat_enabled", "bot_max_replies", "admin_notes",
  ].forEach((k) => assign(k as keyof AdminProfilePayload));

  if (payload.personality_tags !== undefined) {
    update.personality_tags = parseTags(payload.personality_tags);
  }
  if (payload.interest_tags !== undefined) {
    update.interest_tags = parseTags(payload.interest_tags);
  }
  if (payload.values_tags !== undefined) {
    update.values_tags = parseTags(payload.values_tags);
  }
  if (payload.ai_personality_tags !== undefined) {
    update.ai_personality_tags = parseTags(payload.ai_personality_tags);
  }
  if (payload.ai_interest_tags !== undefined) {
    update.ai_interest_tags = parseTags(payload.ai_interest_tags);
  }

  if (payload.dob) {
    update.age = formatAge(payload.dob);
  }

  return update;
}

export const LIFESTYLE_FIELDS = [
  { key: "smoking", label: "Smoking", options: ["never", "occasionally", "regularly"] },
  { key: "drinking", label: "Drinking", options: ["never", "occasionally", "regularly"] },
  { key: "food_preference", label: "Food", options: ["veg", "non_veg", "eggetarian"] },
  { key: "kids_preference", label: "Kids", options: ["want", "dont_want", "open", "have"] },
  { key: "relocation", label: "Relocation", options: ["willing", "not_willing", "open"] },
] as const;

export const FAMILY_FIELDS = [
  { key: "family_type", label: "Family type", options: ["nuclear", "joint"] },
  { key: "religious_preference", label: "Religion", options: ["hindu", "spiritual", "other"] },
  { key: "family_involvement", label: "Family involvement", options: ["low", "moderate", "high"] },
  { key: "marital_status", label: "Marital status", options: ["never_married", "divorced", "widowed"] },
  { key: "profile_created_by", label: "Profile created by", options: ["self", "parent", "sibling", "relative"] },
  { key: "community", label: "Community", options: ["garhwali", "kumaoni", "other"] },
  { key: "gotra", label: "Gotra", options: [] },
  { key: "marriage_timeline", label: "Marriage timeline", options: ["6_months", "1_year", "2_years", "flexible"] },
  { key: "brothers_count", label: "Brothers", options: [] },
  { key: "sisters_count", label: "Sisters", options: [] },
] as const;

export function emptyAdminProfileForm() {
  return {
    full_name: "",
    gender: "",
    looking_for: "",
    dob: "",
    city: "",
    district: "",
    village: "",
    region: "",
    education: "",
    profession: "",
    bio: "",
    ai_bio: "",
    ai_profile_summary: "",
    ai_relationship_style: "",
    ai_communication_style: "",
    intent: "serious",
    profile_status: "draft",
    trust_score: 20,
    compatibility_score: 0,
    readiness_score: 0,
    personality_tags: "",
    interest_tags: "",
    values_tags: "",
    ai_personality_tags: "",
    ai_interest_tags: "",
    lifestyle: {} as Record<string, string>,
    family_background: {} as Record<string, string>,
    profile_origin: "member",
    is_chat_bot: false,
    bot_chat_enabled: false,
    bot_max_replies: 3,
    admin_notes: "",
    photo_urls: [] as string[],
    mobile_verified: false,
    face_verified: false,
    id_verified: false,
    family_verified: false,
  };
}

export type AdminProfileFormState = ReturnType<typeof emptyAdminProfileForm>;
