import { NextRequest, NextResponse } from "next/server";
import { getAuthUserWithRefresh } from "@/lib/auth/api-auth";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function GET(request: NextRequest) {
  const { auth, tokens } = await getAuthUserWithRefresh(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { profiles, ...user } = auth.user as Record<string, unknown>;
  const profile = auth.profile ?? (Array.isArray(profiles) ? profiles[0] : profiles);

  const response = NextResponse.json({
    success: true,
    data: {
      user,
      profile,
      active_platform: auth.platform,
      platforms: auth.platforms,
    },
  });

  if (tokens) {
    setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
  }

  return response;
}
