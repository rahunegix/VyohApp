import { NextResponse, type NextRequest } from "next/server";
import { isDevOtpBypass } from "@/lib/auth/dev";
import { getAuthPayload, ACCESS_COOKIE } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const AUTH_ROUTES = ["/welcome", "/login", "/otp"];
const ONBOARDING_ROUTES = ["/onboarding", "/verification"];
const ADMIN_LOGIN = "/admin/login";

function isAdminPanelRoute(path: string) {
  return path.startsWith("/admin") && !path.startsWith(ADMIN_LOGIN);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  if (isDevOtpBypass) {
    return response;
  }

  const isPublic =
    path === "/" ||
    AUTH_ROUTES.some((r) => path.startsWith(r)) ||
    ONBOARDING_ROUTES.some((r) => path.startsWith(r)) ||
    path.startsWith(ADMIN_LOGIN) ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/payments/callback") ||
    path.startsWith("/sw.js") ||
    path.startsWith("/icons");

  const payload = await getAuthPayload(request);

  if (!payload) {
    if (isAdminPanelRoute(path)) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }
    if (!isPublic && !path.startsWith("/api")) {
      return NextResponse.redirect(new URL("/welcome", request.url));
    }
    return response;
  }

  const admin = createAdminClient();
  const { data: appUser } = await admin
    .from("users")
    .select("id, role, access_token")
    .eq("id", payload.sub)
    .eq("access_token", payload.jti)
    .maybeSingle();

  if (!appUser) {
    const redirectPath = isAdminPanelRoute(path) ? ADMIN_LOGIN : "/welcome";
    const redirect = NextResponse.redirect(new URL(redirectPath, request.url));
    redirect.cookies.set(ACCESS_COOKIE, "", { maxAge: 0 });
    return redirect;
  }

  const isAdmin = appUser.role === "admin";

  if (path.startsWith(ADMIN_LOGIN) && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminPanelRoute(path) && !isAdmin) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  if (isAdmin) {
    return response;
  }

  let profileStatus: string | null = null;
  let hasName = false;

  const { data: profile } = await admin
    .from("profiles")
    .select("profile_status, full_name")
    .eq("user_id", appUser.id)
    .maybeSingle();

  profileStatus = profile?.profile_status ?? null;
  hasName = Boolean(profile?.full_name?.trim());

  const onboardingComplete = profileStatus === "active" && hasName;
  const isOnboardingRoute = ONBOARDING_ROUTES.some((r) => path.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));

  if (onboardingComplete) {
    if (isAuthRoute || path === "/" || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/discover", request.url));
    }
  } else if (
    !isOnboardingRoute &&
    !path.startsWith("/api") &&
    !isAdminPanelRoute(path) &&
    !path.startsWith("/sw.js")
  ) {
    return NextResponse.redirect(new URL("/onboarding/intent", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)"],
};
