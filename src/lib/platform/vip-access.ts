import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizePlanId } from "@/lib/subscription/service";
import type { VipAccessState } from "@/lib/vip/constants";

export const VIP_MONTHLY_PRICE_INR = 20_000;

export async function getActiveVipSubscription(
  admin: SupabaseClient,
  userId: string
): Promise<{ id: string; ends_at: string | null } | null> {
  const { data } = await admin
    .from("subscriptions")
    .select("id, ends_at, status, subscription_plans(name)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const row = (data ?? []).find((sub) => {
    const plan = Array.isArray(sub.subscription_plans)
      ? sub.subscription_plans[0]
      : sub.subscription_plans;
    return normalizePlanId((plan as { name?: string } | null)?.name) === "vip";
  });

  if (!row) return null;
  if (row.ends_at && new Date(String(row.ends_at)) < new Date()) return null;
  return { id: row.id as string, ends_at: row.ends_at as string | null };
}

export async function getVipMemberProfile(
  admin: SupabaseClient,
  userId: string
) {
  const { data } = await admin
    .from("profiles")
    .select("id, profile_status, vip_approval_status, full_name")
    .eq("user_id", userId)
    .eq("platform", "vip")
    .maybeSingle();
  return data;
}

export async function getVipAccessState(
  admin: SupabaseClient,
  userId: string,
  activeProfile?: Record<string, unknown> | null
): Promise<VipAccessState> {
  const vipSub = await getActiveVipSubscription(admin, userId);
  if (vipSub) return "subscribed";

  const vipProfile =
    activeProfile?.platform === "vip"
      ? activeProfile
      : await getVipMemberProfile(admin, userId);

  if (!vipProfile) return "subscribe_required";

  const status = vipProfile.vip_approval_status as string | null;
  if (status === "approved" && vipProfile.profile_status === "active") {
    return "member_approved";
  }
  if (status === "rejected") return "member_rejected";
  if (status === "pending" || !status) return "member_pending";

  return "subscribe_required";
}

/** Paid VIP subscriber or admin-approved VIP member profile. */
export async function hasVipPlatformAccess(
  admin: SupabaseClient,
  userId: string,
  activeProfile?: Record<string, unknown> | null
): Promise<boolean> {
  const state = await getVipAccessState(admin, userId, activeProfile);
  return state === "subscribed" || state === "member_approved";
}

export async function validateVipInviteCode(
  admin: SupabaseClient,
  code: string
): Promise<{ ok: true; inviteId: string } | { ok: false; error: string }> {
  const normalized = code.trim().toUpperCase();
  if (normalized.length < 6) {
    return { ok: false, error: "Invalid invite code" };
  }

  const { data: row } = await admin
    .from("vip_invite_codes")
    .select("id, max_uses, use_count, expires_at, active")
    .eq("code", normalized)
    .maybeSingle();

  if (!row?.id || !row.active) {
    return { ok: false, error: "Invite code not found or inactive" };
  }
  if (row.expires_at && new Date(String(row.expires_at)) < new Date()) {
    return { ok: false, error: "This invite code has expired" };
  }
  if (Number(row.use_count) >= Number(row.max_uses)) {
    return { ok: false, error: "This invite code has reached its use limit" };
  }

  return { ok: true, inviteId: row.id as string };
}

export async function redeemVipInviteCode(
  admin: SupabaseClient,
  userId: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const check = await validateVipInviteCode(admin, code);
  if (!check.ok) return check;

  const { data: existing } = await admin
    .from("vip_invite_redemptions")
    .select("id")
    .eq("invite_code_id", check.inviteId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.id) return { ok: true };

  const { error: redeemError } = await admin.from("vip_invite_redemptions").insert({
    invite_code_id: check.inviteId,
    user_id: userId,
  });

  if (redeemError) {
    return { ok: false, error: redeemError.message };
  }

  const { data: invite } = await admin
    .from("vip_invite_codes")
    .select("use_count")
    .eq("id", check.inviteId)
    .single();

  await admin
    .from("vip_invite_codes")
    .update({ use_count: Number(invite?.use_count ?? 0) + 1 })
    .eq("id", check.inviteId);

  return { ok: true };
}

export async function userHasRedeemedVipInvite(
  admin: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await admin
    .from("vip_invite_redemptions")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  return Boolean(data?.id);
}
