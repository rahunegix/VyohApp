import type { VipApprovalStatus, VipDetails } from "@/lib/vip/constants";

export type Intent = "exploring" | "serious" | "marriage";
export type Platform = "dating" | "matrimony" | "vip";
export type Gender = "male" | "female" | "other";
export type LookingFor = "male" | "female" | "everyone";
export type Region = "garhwal" | "kumaon" | "both" | "diaspora";
export type ProfileStatus = "draft" | "active" | "hidden" | "suspended";
export type ChatRequestStatus = "pending" | "accepted" | "rejected";
export type MatchStatus = "active" | "unmatched" | "blocked";
export type MessageType = "text" | "image" | "voice";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";
export type NotificationType =
  | "like"
  | "match"
  | "chat_request"
  | "message"
  | "verification"
  | "system";

export interface User {
  id: string;
  auth_user_id: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  gender: Gender;
  looking_for: LookingFor;
  dob: string;
  age: number;
  city: string | null;
  district: string | null;
  village: string | null;
  region: Region | null;
  education: string | null;
  profession: string | null;
  bio: string | null;
  ai_bio: string | null;
  intent: Intent;
  platform: Platform;
  cross_platform_visible: boolean;
  vip_approval_status: VipApprovalStatus | null;
  vip_details: VipDetails | null;
  vip_invite_code: string | null;
  profile_status: ProfileStatus;
  trust_score: number;
  compatibility_score: number;
  readiness_score: number;
  personality_tags: string[];
  interest_tags: string[];
  values_tags: string[];
  lifestyle: Record<string, string> | null;
  family_background: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface ProfilePhoto {
  id: string;
  profile_id: string;
  url: string;
  sort_order: number;
  is_private: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface VerificationStatus {
  id: string;
  profile_id: string;
  mobile_verified: boolean;
  face_verified: boolean;
  id_verified: boolean;
  family_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type VerificationRequestStatus =
  | "pending_otp"
  | "otp_verified"
  | "pending_review"
  | "pending_team_call"
  | "verified"
  | "rejected";

export type ReferenceVerificationType = "friend" | "family";

export type IdDocumentType =
  | "aadhaar"
  | "pan"
  | "driving_license"
  | "voter_id"
  | "passport";

export interface IdVerificationRequest {
  id: string;
  profile_id: string;
  document_type: IdDocumentType;
  document_front_url: string;
  document_back_url: string | null;
  status: VerificationRequestStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferenceVerificationRequest {
  id: string;
  profile_id: string;
  reference_type: ReferenceVerificationType;
  contact_name: string;
  relation: string;
  phone: string;
  otp_verified_at: string | null;
  status: VerificationRequestStatus;
  team_notes: string | null;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FaceVerificationRequest {
  id: string;
  profile_id: string;
  selfie_url: string;
  profile_photo_url: string | null;
  ai_confidence: number | null;
  ai_reason: string | null;
  status: VerificationRequestStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationOverview {
  verification: VerificationStatus;
  trustScore: number;
  profileCompleteness: number;
  idRequest: IdVerificationRequest | null;
  referenceRequest: ReferenceVerificationRequest | null;
  faceRequest: FaceVerificationRequest | null;
}

export interface CompatibilityResult {
  score: number;
  explanation: string;
  strong_matches: string[];
  mismatch_warnings: string[];
}

export interface ChatRequest {
  id: string;
  sender_profile_id: string;
  receiver_profile_id: string;
  message: string;
  status: ChatRequestStatus;
  created_at: string;
  updated_at: string;
  sender?: Profile;
}

export interface Conversation {
  id: string;
  match_id: string;
  created_at: string;
  updated_at: string;
  other_profile?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  message_text: string;
  message_type: MessageType;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrivacySettings {
  id: string;
  profile_id: string;
  show_photos: boolean;
  show_city: boolean;
  show_district: boolean;
  show_contact: boolean;
  allow_family_access: boolean;
  allow_search_indexing: boolean;
}

export interface OnboardingState {
  step: number;
  platform: Platform | null;
  vipInviteCode: string | null;
  vipDetails: VipDetails;
  gender: Gender | null;
  looking_for: LookingFor | null;
  intent: Intent | null;
  aiAnswers: Record<string, string>;
  photos: string[];
  basicInfo: Partial<Profile>;
  lifestyle: Record<string, string>;
  familyBackground: Record<string, string>;
  aiGeneratedProfile: import("@/lib/ai/schemas").ProfileBuilderOutput | null;
}

export interface DiscoverProfile extends Profile {
  photos: ProfilePhoto[];
  verification: VerificationStatus;
  compatibility?: CompatibilityResult;
  distance_label?: string;
}
