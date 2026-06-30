import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getAuthUserWithRefresh } from "@/lib/auth/api-auth";
import { setAuthCookies } from "@/lib/auth/cookies";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types";
import {
  submitIdVerification,
  submitReferenceVerification,
  submitFaceVerificationForUser,
  submitFaceVerificationReviewForUser,
  verifyReferenceOtp,
  resendReferenceOtp,
  buildVerificationOverview,
  getVerificationOverview,
} from "@/services/verification";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (auth?.profile) {
      const admin = createAdminClient();
      const profile = auth.profile as unknown as Profile;
      const { data: verification } = await admin
        .from("verification_status")
        .select("*")
        .eq("profile_id", profile.id)
        .maybeSingle();
      const overview = await buildVerificationOverview(admin, profile, verification);
      return NextResponse.json({ success: true, data: overview });
    }

    const overview = await getVerificationOverview();
    return NextResponse.json({ success: true, data: overview });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load verification";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "submit_face" || type === "submit_face_review") {
      const { auth, tokens } = await getAuthUserWithRefresh(request);
      if (!auth?.profile) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      const ctx = {
        admin: createAdminClient(),
        profile: auth.profile as unknown as Profile,
        userId: String(auth.user.id),
      };

      const result =
        type === "submit_face_review"
          ? await submitFaceVerificationReviewForUser(ctx, body)
          : await submitFaceVerificationForUser(ctx, body);

      const response = NextResponse.json(result);
      if (tokens) setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
      return response;
    }

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
