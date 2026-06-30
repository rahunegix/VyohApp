import type { SupabaseClient } from "@supabase/supabase-js";

export const PLAN_CONTACT_CREDITS: Record<string, number> = {
  free: 0,
  premium: 20,
  premium_plus: 40,
  vip: 100,
};

export const VIP_MONTHLY_PRICE_INR = 20_000;

/** @deprecated use PLAN_CONTACT_CREDITS */
export const PLAN_WHATSAPP_CREDITS = PLAN_CONTACT_CREDITS;

export const CONTACT_CREDIT_COST = 1;

export const FREE_INTEREST_LIMIT = 5;
export const FREE_CHAT_MESSAGE_LIMIT = 1;

export function normalizePlanId(planName?: string | null): string {
  if (!planName) return "free";
  const lower = planName.toLowerCase();
  if (lower.includes("vip")) return "vip";
  if (lower.includes("plus")) return "premium_plus";
  if (lower.includes("premium")) return "premium";
  return "free";
}

export function isVipPlanId(planId: string): boolean {
  return planId === "vip";
}

export function getPlanCredits(planId: string): number {
  return PLAN_CONTACT_CREDITS[planId] ?? 0;
}

export type ContactDetails = {
  phone: string;
  full_name: string;
  city: string | null;
};

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length >= 10 ? digits.slice(-10) : digits;
  if (local.length < 6) return "••••••••••";
  return `+91 ${local.slice(0, 2)}•• •••${local.slice(-3)}`;
}

export function formatDisplayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length >= 10 ? digits.slice(-10) : digits;
  if (local.length !== 10) return phone;
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

export async function hasContactUnlock(
  admin: SupabaseClient,
  userId: string,
  targetProfileId: string
): Promise<boolean> {
  const { data } = await admin
    .from("contact_unlocks")
    .select("id")
    .eq("user_id", userId)
    .eq("target_profile_id", targetProfileId)
    .maybeSingle();
  return Boolean(data?.id);
}

export async function getContactDetailsForProfile(
  admin: SupabaseClient,
  myProfileId: string,
  otherProfileId: string
): Promise<ContactDetails | null> {
  const phone = await getMatchContactPhone(admin, myProfileId, otherProfileId);
  if (!phone) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, city")
    .eq("id", otherProfileId)
    .maybeSingle();

  return {
    phone,
    full_name: String(profile?.full_name ?? "Member"),
    city: profile?.city != null ? String(profile.city) : null,
  };
}

export async function unlockContactForUser(
  admin: SupabaseClient,
  userId: string,
  myProfileId: string,
  targetProfileId: string
): Promise<
  | {
      ok: true;
      details: ContactDetails;
      credits_remaining: number;
      newly_unlocked: boolean;
    }
  | { ok: false; error: string; code?: string }
> {
  const sub = await getActiveSubscription(admin, userId);
  const planId = normalizePlanId(sub?.subscription_plans?.name);

  if (!sub || !isPaidPlanId(planId)) {
    return { ok: false, error: "Premium subscription required", code: "PREMIUM_REQUIRED" };
  }

  const details = await getContactDetailsForProfile(admin, myProfileId, targetProfileId);
  if (!details) {
    return {
      ok: false,
      error: "Contact details are available only for active matches",
      code: "NOT_MATCHED",
    };
  }

  const alreadyUnlocked = await hasContactUnlock(admin, userId, targetProfileId);
  if (alreadyUnlocked) {
    return {
      ok: true,
      details,
      credits_remaining: sub.call_credits_remaining,
      newly_unlocked: false,
    };
  }

  const credit = await deductContactCredit(admin, userId, CONTACT_CREDIT_COST);
  if (!credit.ok) {
    return { ok: false, error: credit.error, code: "NO_CREDITS" };
  }

  await admin.from("contact_unlocks").insert({
    user_id: userId,
    target_profile_id: targetProfileId,
  });

  return {
    ok: true,
    details,
    credits_remaining: credit.remaining,
    newly_unlocked: true,
  };
}

export function isPaidPlanId(planId: string): boolean {
  return planId !== "free";
}

export type ActiveSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  ends_at: string | null;
  call_credits_remaining: number;
  subscription_plans: {
    id: string;
    name: string;
    price: number;
    billing_cycle: string;
    features: unknown;
  } | null;
};

export async function getActiveSubscription(
  admin: SupabaseClient,
  userId: string
): Promise<ActiveSubscription | null> {
  const { data } = await admin
    .from("subscriptions")
    .select("*, subscription_plans(*)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  if (data.ends_at && new Date(String(data.ends_at)) < new Date()) return null;

  const plan = Array.isArray(data.subscription_plans)
    ? data.subscription_plans[0]
    : data.subscription_plans;

  return {
    ...(data as ActiveSubscription),
    subscription_plans: plan ?? null,
    call_credits_remaining: Number(data.call_credits_remaining ?? 0),
  };
}

export async function activateSubscriptionForPayment(
  admin: SupabaseClient,
  userId: string,
  planId: string,
  paymentId: string
) {
  const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: plan } = await admin
    .from("subscription_plans")
    .select("name")
    .eq("id", planId)
    .maybeSingle();

  const planSlug = normalizePlanId(plan?.name);
  const credits = getPlanCredits(planSlug);

  const { data: existingSub } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let subscriptionId: string;

  if (existingSub) {
    const { data: updated } = await admin
      .from("subscriptions")
      .update({
        plan_id: planId,
        status: "active",
        started_at: new Date().toISOString(),
        ends_at: endsAt,
        call_credits_remaining: credits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSub.id)
      .select("id")
      .single();
    subscriptionId = updated!.id;
  } else {
    const { data: inserted } = await admin
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_id: planId,
        status: "active",
        started_at: new Date().toISOString(),
        ends_at: endsAt,
        call_credits_remaining: credits,
      })
      .select("id")
      .single();
    subscriptionId = inserted!.id;
  }

  await admin
    .from("payments")
    .update({
      payment_status: "completed",
      subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  return { subscriptionId, credits, endsAt };
}

export async function getMatchContactPhone(
  admin: SupabaseClient,
  myProfileId: string,
  otherProfileId: string
): Promise<string | null> {
  const { data: match } = await admin
    .from("matches")
    .select("id, profile_a_id, profile_b_id")
    .eq("match_status", "active")
    .or(
      `and(profile_a_id.eq.${myProfileId},profile_b_id.eq.${otherProfileId}),and(profile_a_id.eq.${otherProfileId},profile_b_id.eq.${myProfileId})`
    )
    .maybeSingle();

  if (!match) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("user_id")
    .eq("id", otherProfileId)
    .maybeSingle();

  if (!profile?.user_id) return null;

  const { data: user } = await admin
    .from("users")
    .select("phone")
    .eq("id", profile.user_id)
    .maybeSingle();

  const phone = user?.phone ? String(user.phone).replace(/\D/g, "") : "";
  return phone.length >= 10 ? phone : null;
}

export async function deductContactCredit(
  admin: SupabaseClient,
  userId: string,
  amount = 1
): Promise<{ ok: true; remaining: number } | { ok: false; error: string }> {
  const sub = await getActiveSubscription(admin, userId);
  if (!sub) return { ok: false, error: "Premium subscription required" };

  const remaining = sub.call_credits_remaining;
  if (remaining < amount) {
    return { ok: false, error: "No contact credits remaining this month" };
  }

  const next = remaining - amount;
  await admin
    .from("subscriptions")
    .update({ call_credits_remaining: next, updated_at: new Date().toISOString() })
    .eq("id", sub.id);

  return { ok: true, remaining: next };
}
