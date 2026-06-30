import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decodePhonePeResponse, verifyPhonePeCallback } from "@/lib/payments/phonepe";
import { activateSubscriptionForPayment } from "@/lib/subscription/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const base64Response = body.response as string;
    const checksum = request.headers.get("X-VERIFY") || "";

    if (!base64Response) {
      return NextResponse.json({ success: false, error: "Missing response" }, { status: 400 });
    }

    if (!verifyPhonePeCallback(base64Response, checksum)) {
      return NextResponse.json({ success: false, error: "Invalid checksum" }, { status: 400 });
    }

    const decoded = decodePhonePeResponse(base64Response);
    const merchantTransactionId = decoded.data?.merchantTransactionId as string;
    const code = decoded.code as string;

    const admin = createAdminClient();
    const { data: payment } = await admin
      .from("payments")
      .select("*")
      .eq("provider_ref", merchantTransactionId)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    if (payment.payment_status === "completed") {
      return NextResponse.json({ success: true });
    }

    if (code === "PAYMENT_SUCCESS") {
      await activateSubscriptionForPayment(
        admin,
        payment.user_id,
        payment.plan_id,
        payment.id
      );
    } else {
      await admin
        .from("payments")
        .update({ payment_status: "failed", updated_at: new Date().toISOString() })
        .eq("id", payment.id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
