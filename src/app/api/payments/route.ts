import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/api-auth";
import { createPhonePePayment } from "@/lib/payments/phonepe";

const PLAN_NAME_MAP: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  premium_plus: "Premium Plus",
};

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

  const payment = await createPhonePePayment({
    amountPaise,
    merchantTransactionId,
    userId: auth.user.id,
    mobileNumber: auth.user.phone || "9999999999",
    redirectUrl: `${appUrl}/subscription?status=success`,
    callbackUrl: `${appUrl}/api/payments/callback`,
  });

  if (!payment.success) {
    return NextResponse.json({ success: false, error: payment.error }, { status: 400 });
  }

  await admin.from("payments").insert({
    user_id: auth.user.id,
    plan_id: plan.id,
    amount: plan.price,
    payment_status: "pending",
    provider: "phonepe",
    provider_ref: merchantTransactionId,
  });

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
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("*, subscription_plans(*)")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ success: true, data: subscription });
}
