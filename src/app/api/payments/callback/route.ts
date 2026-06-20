import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decodePhonePeResponse, verifyPhonePeCallback } from "@/lib/payments/phonepe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const base64Response = body.response as string;
    const checksum = request.headers.get("X-VERIFY") || "";

    if (!verifyPhonePeCallback(base64Response, checksum)) {
      return NextResponse.json({ success: false }, { status: 400 });
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
      return NextResponse.json({ success: false }, { status: 404 });
    }

    if (code === "PAYMENT_SUCCESS") {
      await admin
        .from("payments")
        .update({ payment_status: "completed", updated_at: new Date().toISOString() })
        .eq("id", payment.id);

      const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: existingSub } = await admin
        .from("subscriptions")
        .select("id")
        .eq("user_id", payment.user_id)
        .maybeSingle();

      if (existingSub) {
        await admin
          .from("subscriptions")
          .update({
            plan_id: payment.plan_id,
            status: "active",
            started_at: new Date().toISOString(),
            ends_at: endsAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSub.id);
      } else {
        await admin.from("subscriptions").insert({
          user_id: payment.user_id,
          plan_id: payment.plan_id,
          status: "active",
          started_at: new Date().toISOString(),
          ends_at: endsAt,
        });
      }
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
