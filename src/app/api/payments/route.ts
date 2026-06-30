import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/api-auth";
import { createPhonePePayment } from "@/lib/payments/phonepe";
import {
  activateSubscriptionForPayment,
  getActiveSubscription,
  normalizePlanId,
  isPaidPlanId,
  isVipPlanId,
} from "@/lib/subscription/service";
import { getActiveVipSubscription, getVipAccessState, hasVipPlatformAccess } from "@/lib/platform/vip-access";

const PLAN_NAME_MAP: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  premium_plus: "Premium Plus",
  vip: "VIP",
};

async function buildSubscriptionPayload(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  sub: Awaited<ReturnType<typeof getActiveSubscription>>
) {
  const vipSub = await getActiveVipSubscription(admin, userId);
  const vipAccess = await hasVipPlatformAccess(admin, userId);
  const vipStatus = await getVipAccessState(admin, userId);

  if (!sub) {
    return {
      subscription: null,
      plan_id: "free",
      is_paid: false,
      credits_remaining: 0,
      vip_active: Boolean(vipSub),
      vip_access: vipAccess,
      vip_status: vipStatus,
    };
  }

  const planId = normalizePlanId(sub.subscription_plans?.name);
  return {
    subscription: sub,
    plan_id: planId,
    is_paid: isPaidPlanId(planId),
    credits_remaining: sub.call_credits_remaining,
    vip_active: Boolean(vipSub) || isVipPlanId(planId),
    vip_access: vipAccess,
    vip_status: vipStatus,
  };
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await request.json();
  const admin = createAdminClient();
  const planName = PLAN_NAME_MAP[planId] ?? planId;

  const { data: plan } = await admin
    .from("subscription_plans")
    .select("*")
    .eq("name", planName)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });
  }

  if (Number(plan.price) <= 0) {
    return NextResponse.json({ success: false, error: "Free plan does not require payment" }, { status: 400 });
  }

  const merchantTransactionId = `SP_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const amountPaise = Math.round(Number(plan.price) * 100);

  const { data: pendingPayment, error: insertError } = await admin
    .from("payments")
    .insert({
      user_id: auth.user.id,
      plan_id: plan.id,
      amount: plan.price,
      payment_status: "pending",
      provider: "phonepe",
      provider_ref: merchantTransactionId,
    })
    .select("id")
    .single();

  if (insertError || !pendingPayment) {
    return NextResponse.json({ success: false, error: insertError?.message ?? "Could not create payment" }, { status: 400 });
  }

  const devBypass = process.env.PAYMENT_DEV_BYPASS === "true";

  if (devBypass) {
    await activateSubscriptionForPayment(admin, auth.user.id, plan.id, pendingPayment.id);
    return NextResponse.json({
      success: true,
      dev_bypass: true,
      transaction_id: merchantTransactionId,
      redirect_url: `${appUrl}/subscription?status=success&transaction_id=${merchantTransactionId}`,
    });
  }

  const payment = await createPhonePePayment({
    amountPaise,
    merchantTransactionId,
    userId: auth.user.id,
    mobileNumber: String(auth.user.phone || "9999999999"),
    redirectUrl: `${appUrl}/subscription?status=success&transaction_id=${merchantTransactionId}`,
    callbackUrl: `${appUrl}/api/payments/callback`,
  });

  if (!payment.success) {
    await admin
      .from("payments")
      .update({ payment_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", pendingPayment.id);
    return NextResponse.json({ success: false, error: payment.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    checkout_url: payment.checkoutUrl,
    transaction_id: merchantTransactionId,
  });
}

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const sub = await getActiveSubscription(admin, auth.user.id);
  const payload = await buildSubscriptionPayload(admin, auth.user.id as string, sub);

  return NextResponse.json({
    success: true,
    data: payload.subscription,
    ...payload,
  });
}
