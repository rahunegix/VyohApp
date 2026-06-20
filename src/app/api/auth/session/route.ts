import { NextRequest, NextResponse } from "next/server";
import { refreshSession, logoutUser } from "@/lib/auth/custom-auth";
import { getAuthUser, REFRESH_COOKIE } from "@/lib/auth/api-auth";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  try {
    const refreshToken =
      request.cookies.get(REFRESH_COOKIE)?.value ??
      (await request.json().catch(() => ({}))).refreshToken;

    if (!refreshToken) {
      return NextResponse.json({ success: false, error: "No refresh token" }, { status: 401 });
    }

    const result = await refreshSession(refreshToken);
    const response = NextResponse.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
    setAuthCookies(response, result.accessToken, result.refreshToken);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh failed";
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (auth?.user?.id) {
    await logoutUser(auth.user.id);
  }
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
