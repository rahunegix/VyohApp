import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/api-auth";
import { getActiveSubscription, normalizePlanId, isPaidPlanId } from "@/lib/subscription/service";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const transactionId = new URL(request.url).searchParams.get("transaction_id");
  if (!transactionId) {
    return NextResponse.json({ success: false, error: "transaction_id required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("*, subscription_plans(name)")
    .eq("provider_ref", transactionId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
  }

  const sub = await getActiveSubscription(admin, auth.user.id);
  const planId = normalizePlanId(sub?.subscription_plans?.name);

  return NextResponse.json({
    success: true,
    data: {
      payment_status: payment.payment_status,
      activated: payment.payment_status === "completed" && isPaidPlanId(planId),
      plan_id: planId,
      credits_remaining: sub?.call_credits_remaining ?? 0,
    },
  });
}
