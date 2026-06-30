import { NextResponse, type NextRequest } from "next/server";
import { getMiddlewareAuthPayload, ACCESS_COOKIE } from "@/lib/auth/middleware-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PLATFORM_COOKIE,
  getPlatformFromPathname,
  isPlatform,
  platformPath,
  type Platform,
} from "@/lib/platform";
import { findProfileByUserAndPlatform } from "@/lib/platform/profile-query";

const AUTH_ROUTES = ["/welcome", "/login", "/otp"];
const ONBOARDING_ROUTES = ["/onboarding", "/verification"];
const ADMIN_LOGIN = "/admin/login";
const MARKETING_ROUTES = [
  "/matrimony",
  "/success-stories",
  "/share-your-story",
  "/help",
  "/trust-center",
  "/p/",
];

const LEGACY_APP_ROUTES = [
  "/discover",
  "/compatibility",
  "/chats",
  "/activity",
  "/profile",
];

function resolveRequestPlatform(request: NextRequest, fallback: Platform = "dating"): Platform {
  const fromPath = getPlatformFromPathname(request.nextUrl.pathname);
  if (fromPath) return fromPath;
  const cookie = request.cookies.get(PLATFORM_COOKIE)?.value;
  return isPlatform(cookie) ? cookie : fallback;
}

function isMarketingRoute(path: string) {
  if (path.startsWith("/dating/")) return false;
  if (path.startsWith("/vip/")) return false;
  if (
    /^\/matrimony\/(discover|compatibility|chats|activity|profile|saathi)(\/|$)/.test(path)
  ) {
    return false;
  }
  return MARKETING_ROUTES.some((r) => path.startsWith(r));
}

function isAdminPanelRoute(path: string) {
  return path.startsWith("/admin") && !path.startsWith(ADMIN_LOGIN);
}

export async function middleware(request: NextRequest) {
  const host = request.nextUrl.hostname;

  // Web OTP SMS binds to www.saathini.com — keep apex on the same host.
  if (host === "saathini.com") {
    const url = request.nextUrl.clone();
    url.hostname = "www.saathini.com";
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const isPublic =
    path === "/" ||
    AUTH_ROUTES.some((r) => path.startsWith(r)) ||
    isMarketingRoute(path) ||
    path.startsWith(ADMIN_LOGIN) ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/payments/callback") ||
    path.startsWith("/sw.js") ||
    path.startsWith("/icons");

  const payload = await getMiddlewareAuthPayload(request);

  const finish = (res: NextResponse) => res;

  if (!payload) {
    if (isAdminPanelRoute(path)) {
      return finish(NextResponse.redirect(new URL(ADMIN_LOGIN, request.url)));
    }
    if (!isPublic && !path.startsWith("/api")) {
      return finish(NextResponse.redirect(new URL("/", request.url)));
    }
    return finish(response);
  }

  const admin = createAdminClient();
  const { data: appUser } = await admin
    .from("users")
    .select("id, role, access_token")
    .eq("id", payload.sub)
    .eq("access_token", payload.jti)
    .maybeSingle();

  if (!appUser) {
    const redirectPath = isAdminPanelRoute(path) ? ADMIN_LOGIN : "/";
    const redirect = NextResponse.redirect(new URL(redirectPath, request.url));
    redirect.cookies.set(ACCESS_COOKIE, "", { maxAge: 0 });
    return finish(redirect);
  }

  const isAdmin = appUser.role === "admin";

  if (path.startsWith(ADMIN_LOGIN) && isAdmin) {
    return finish(NextResponse.redirect(new URL("/admin", request.url)));
  }

  if (isAdminPanelRoute(path) && !isAdmin) {
    return finish(NextResponse.redirect(new URL("/dating/discover", request.url)));
  }

  if (isAdmin) {
    return finish(response);
  }

  let profileStatus: string | null = null;
  let hasName = false;

  const platform = resolveRequestPlatform(request);

  const { data: profile } = await findProfileByUserAndPlatform(
    admin,
    appUser.id,
    platform
  );

  profileStatus = profile?.profile_status ?? null;
  hasName = Boolean(profile?.full_name?.trim());

  const legacyRoute = LEGACY_APP_ROUTES.find(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  if (legacyRoute) {
    const suffix = path.slice(legacyRoute.length);
    const redirect = NextResponse.redirect(
      new URL(platformPath(platform, `${legacyRoute}${suffix}`), request.url)
    );
    redirect.cookies.set(PLATFORM_COOKIE, platform, { path: "/", maxAge: 365 * 24 * 60 * 60 });
    return finish(redirect);
  }

  const onboardingComplete = profileStatus === "active" && hasName;
  const isOnboardingRoute = ONBOARDING_ROUTES.some((r) => path.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));

  if (onboardingComplete) {
    if (isAuthRoute || path === "/" || isOnboardingRoute) {
      return finish(
        NextResponse.redirect(new URL(platformPath(platform, "/discover"), request.url))
      );
    }
  } else if (
    !isOnboardingRoute &&
    !isMarketingRoute(path) &&
    !path.startsWith("/api") &&
    !isAdminPanelRoute(path) &&
    !path.startsWith("/sw.js")
  ) {
    return finish(NextResponse.redirect(new URL("/onboarding/platform", request.url)));
  }

  return finish(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json).*)"],
};
