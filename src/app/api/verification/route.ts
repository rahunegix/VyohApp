import { NextResponse } from "next/server";
import {
  submitIdVerification,
  submitReferenceVerification,
  verifyReferenceOtp,
  resendReferenceOtp,
  getVerificationOverview,
} from "@/services/verification";

export async function GET() {
  try {
    const overview = await getVerificationOverview();
    return NextResponse.json(overview);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load verification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case "submit_id":
        return NextResponse.json(await submitIdVerification(body));
      case "submit_reference":
        return NextResponse.json(await submitReferenceVerification(body));
      case "verify_reference_otp":
        return NextResponse.json(await verifyReferenceOtp(body));
      case "resend_reference_otp":
        return NextResponse.json(await resendReferenceOtp(body.request_id));
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
