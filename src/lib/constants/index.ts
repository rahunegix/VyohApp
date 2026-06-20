export const APP_NAME = "Saathini";
export const APP_TAGLINE = "From Connection to Commitment";
export const LOGO_PATH = "/images/saathini_logo.svg";
export const PRIMARY_COLOR = "#FF6F00";
export const MOBILE_CONTENT_WIDTH = 480;
export const DESKTOP_SHELL_WIDTH = 960;
export const DESKTOP_SIDEBAR_WIDTH = 240;
/** @deprecated use MOBILE_CONTENT_WIDTH */
export const MAX_CONTENT_WIDTH = MOBILE_CONTENT_WIDTH;

export const INTENTS = [
  { value: "serious", label: "Looking for a relationship", description: "A committed, meaningful partnership at your pace" },
  { value: "marriage", label: "Looking for marriage", description: "Ready to find a life partner with family involvement" },
] as const;

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export const LOOKING_FOR = [
  { value: "male", label: "Men" },
  { value: "female", label: "Women" },
  { value: "everyone", label: "Everyone" },
] as const;

export const REGIONS = [
  { value: "garhwal", label: "Garhwal" },
  { value: "kumaon", label: "Kumaon" },
  { value: "both", label: "Both" },
  { value: "diaspora", label: "Diaspora" },
] as const;

/** Onboarding basic-info — Garhwali / Kumaoni only */
export const ONBOARDING_REGIONS = [
  { value: "garhwal", label: "Garhwali" },
  { value: "kumaon", label: "Kumaoni" },
] as const;

export const EDUCATION_OPTIONS = [
  { value: "10th", key: "edu_10th" },
  { value: "12th", key: "edu_12th" },
  { value: "diploma", key: "edu_diploma" },
  { value: "ba", key: "edu_ba" },
  { value: "bcom", key: "edu_bcom" },
  { value: "bsc", key: "edu_bsc" },
  { value: "btech", key: "edu_btech" },
  { value: "be", key: "edu_be" },
  { value: "mca", key: "edu_mca" },
  { value: "mba", key: "edu_mba" },
  { value: "ma", key: "edu_ma" },
  { value: "msc", key: "edu_msc" },
  { value: "mcom", key: "edu_mcom" },
  { value: "phd", key: "edu_phd" },
  { value: "mbbs", key: "edu_mbbs" },
  { value: "bed", key: "edu_bed" },
  { value: "other", key: "edu_other" },
] as const;

export const PROFESSION_OPTIONS = [
  { value: "software_engineer", key: "prof_software_engineer" },
  { value: "doctor", key: "prof_doctor" },
  { value: "teacher", key: "prof_teacher" },
  { value: "government", key: "prof_government" },
  { value: "business_owner", key: "prof_business_owner" },
  { value: "entrepreneur", key: "prof_entrepreneur" },
  { value: "banker", key: "prof_banker" },
  { value: "lawyer", key: "prof_lawyer" },
  { value: "nurse", key: "prof_nurse" },
  { value: "designer", key: "prof_designer" },
  { value: "accountant", key: "prof_accountant" },
  { value: "engineer", key: "prof_engineer" },
  { value: "student", key: "prof_student" },
  { value: "homemaker", key: "prof_homemaker" },
  { value: "agriculture", key: "prof_agriculture" },
  { value: "tourism", key: "prof_tourism" },
  { value: "other", key: "prof_other" },
] as const;

export const COMMUNITY_OPTIONS = [
  { value: "brahmin", key: "community_brahmin" },
  { value: "rajput", key: "community_rajput" },
  { value: "other", key: "community_other" },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: "never_married", key: "marital_never" },
  { value: "divorced", key: "marital_divorced" },
  { value: "widowed", key: "marital_widowed" },
  { value: "separated", key: "marital_separated" },
] as const;

export const PROFILE_CREATED_BY_OPTIONS = [
  { value: "self", key: "profile_by_self" },
  { value: "parents", key: "profile_by_parents" },
  { value: "siblings", key: "profile_by_siblings" },
  { value: "guardians", key: "profile_by_guardians" },
  { value: "friend", key: "profile_by_friend" },
] as const;

export const SIBLING_COUNT_OPTIONS = ["0", "1", "2", "3", "4", "5", "6+"] as const;

export const SIBLING_COUNT_SELECT_OPTIONS = SIBLING_COUNT_OPTIONS.map((value) => ({
  value,
  key: value === "6+" ? "count_6_plus" : (`count_${value}` as string),
}));

export const PARENT_FIELD_OPTIONS = [
  { value: "government", key: "field_government" },
  { value: "agriculture", key: "field_agriculture" },
  { value: "business", key: "field_business" },
  { value: "teaching", key: "field_teaching" },
  { value: "army_defence", key: "field_army" },
  { value: "banking", key: "field_banking" },
  { value: "healthcare", key: "field_healthcare" },
  { value: "private_job", key: "field_private" },
  { value: "farming", key: "field_farming" },
  { value: "tourism", key: "field_tourism" },
  { value: "other", key: "field_other" },
] as const;

export const FATHER_STATUS_OPTIONS = [
  { value: "not_alive", key: "parent_not_alive" },
  { value: "working", key: "parent_working" },
  { value: "retired", key: "parent_retired" },
] as const;

export const MOTHER_STATUS_OPTIONS = [
  { value: "not_alive", key: "parent_not_alive" },
  { value: "working", key: "parent_working" },
  { value: "homemaker", key: "parent_homemaker" },
] as const;

export const RELIGION_OPTIONS = [
  { value: "hindu", key: "religion_hindu" },
  { value: "spiritual", key: "religion_spiritual" },
  { value: "muslim", key: "religion_muslim" },
  { value: "sikh", key: "religion_sikh" },
  { value: "christian", key: "religion_christian" },
  { value: "buddhist", key: "religion_buddhist" },
  { value: "jain", key: "religion_jain" },
  { value: "other", key: "religion_other" },
] as const;

export const GOTRA_OPTIONS = [
  { value: "bharadwaj", key: "gotra_bharadwaj" },
  { value: "kashyap", key: "gotra_kashyap" },
  { value: "vashishtha", key: "gotra_vashishtha" },
  { value: "gautam", key: "gotra_gautam" },
  { value: "parashar", key: "gotra_parashar" },
  { value: "other", key: "gotra_other" },
  { value: "prefer_not_to_say", key: "gotra_prefer_not" },
] as const;

export const MARRIAGE_TIMELINE_OPTIONS = [
  { value: "within_6_months", key: "timeline_6m" },
  { value: "6_12_months", key: "timeline_6_12m" },
  { value: "1_2_years", key: "timeline_1_2y" },
  { value: "2_3_years", key: "timeline_2_3y" },
  { value: "3_plus_years", key: "timeline_3y_plus" },
  { value: "flexible", key: "timeline_flexible" },
] as const;

export const UTTARAKHAND_DISTRICTS = [
  "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun",
  "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh",
  "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi",
] as const;

export { ONBOARDING_CHAT_PROMPTS, ONBOARDING_PROMPTS } from "@/lib/constants/onboarding-chat";

export const VERIFICATION_BADGES = [
  { key: "mobile_verified", label: "Mobile Verified", icon: "phone" },
  { key: "face_verified", label: "Face Verified", icon: "scan-face" },
  { key: "id_verified", label: "ID Verified", icon: "id-card" },
  { key: "family_verified", label: "Family Verified", icon: "users" },
] as const;

export const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    billing_cycle: "monthly",
    features: ["Limited interests", "Basic discovery", "Chat requests", "Profile creation"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 499,
    billing_cycle: "monthly",
    features: [
      "Unlimited interests",
      "Advanced filters",
      "See who sent interest",
      "Profile boost",
      "Compatibility insights",
      "More contact unlocks",
    ],
  },
  {
    id: "premium_plus",
    name: "Premium Plus",
    price: 999,
    billing_cycle: "monthly",
    features: [
      "Everything in Premium",
      "Family-managed support",
      "Extra visibility",
      "Enhanced trust badge",
      "Priority placement",
    ],
  },
] as const;

export const BOTTOM_NAV_ITEMS = [
  { href: "/discover", label: "Discover", icon: "compass" },
  { href: "/compatibility", label: "Compatibility", icon: "heart-handshake" },
  { href: "/chats", label: "Chats", icon: "message-circle" },
  { href: "/activity", label: "Activity", icon: "bell" },
  { href: "/profile", label: "Profile", icon: "user" },
] as const;

export const REPORT_REASONS = [
  "Fake profile",
  "Inappropriate content",
  "Harassment",
  "Spam",
  "Underage",
  "Other",
] as const;
