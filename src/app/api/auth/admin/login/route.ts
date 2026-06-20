import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginAdminWithPassword } from "@/lib/auth/custom-auth";
import { setAuthCookies } from "@/lib/auth/cookies";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const result = await loginAdminWithPassword(body.email, body.password);

    const response = NextResponse.json({
      success: true,
      data: { user: result.user },
    });

    setAuthCookies(response, result.accessToken, result.refreshToken);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
