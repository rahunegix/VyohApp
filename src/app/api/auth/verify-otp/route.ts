import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyLoginOtp } from "@/lib/auth/custom-auth";
import { setAuthCookies } from "@/lib/auth/cookies";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

const schema = z.object({
  phone: z.string().min(10),
  code: z.string().length(OTP_LENGTH),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const result = await verifyLoginOtp(body.phone, body.code);
    const response = NextResponse.json({
      success: true,
      data: {
        user: result.user,
        profile: result.profile,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
    setAuthCookies(response, result.accessToken, result.refreshToken);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
