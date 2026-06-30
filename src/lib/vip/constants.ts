export type VipApprovalStatus = "pending" | "approved" | "rejected";

export type VipProfessionTier =
  | "entrepreneur"
  | "influencer"
  | "celebrity"
  | "executive"
  | "creative"
  | "other";

export type VipDetails = {
  profession_tier?: VipProfessionTier | string;
  public_role?: string;
  company?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
};

export const VIP_PROFESSION_TIERS: Array<{ value: VipProfessionTier; label: string }> = [
  { value: "entrepreneur", label: "Entrepreneur / Business owner" },
  { value: "executive", label: "Senior executive" },
  { value: "influencer", label: "Influencer / Creator" },
  { value: "celebrity", label: "Celebrity / Public figure" },
  { value: "creative", label: "Artist / Creative professional" },
  { value: "other", label: "Other elite professional" },
];

export type VipAccessState =
  | "subscribed"
  | "member_approved"
  | "member_pending"
  | "member_rejected"
  | "subscribe_required";
