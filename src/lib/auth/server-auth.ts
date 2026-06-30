import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshSession } from "@/lib/auth/custom-auth";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/api-auth";
import { PLATFORM_COOKIE } from "@/lib/platform";
import type { Platform } from "@/lib/platform";
import { findProfileByUserAndPlatform } from "@/lib/platform/profile-query";
import type { Profile } from "@/types";

const isProd = process.env.NODE_ENV === "production";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
};

async function resolveServerPlatform(): Promise<Platform> {
  const cookieStore = await cookies();
  const value = cookieStore.get(PLATFORM_COOKIE)?.value;
  return value === "matrimony" ? "matrimony" : "dating";
}

async function lookupAuthFromAccessToken(token: string, platform?: Platform) {
  const payload = await verifyAccessToken(token);
  if (!payload?.jti) return null;

  const admin = createAdminClient();
  const { data: user } = await admin
    .from("users")
    .select("*")
    .eq("id", payload.sub)
    .eq("access_token", payload.jti)
    .eq("is_active", true)
    .maybeSingle();

  if (!user) return null;
  if (user.token_expires_at && new Date(user.token_expires_at) < new Date()) {
    return null;
  }

  const activePlatform =
    platform ??
    (user.active_platform === "matrimony" ? "matrimony" : "dating");

  const { data: profile } = await findProfileByUserAndPlatform(
    admin,
    user.id,
    activePlatform
  );

  return { admin, user, profile: profile as Profile | null, payload };
}

export async function getServerAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const platform = await resolveServerPlatform();

  if (accessToken) {
    const auth = await lookupAuthFromAccessToken(accessToken, platform);
    if (auth) return auth;
  }

  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  try {
    const refreshed = await refreshSession(refreshToken);
    const auth = await lookupAuthFromAccessToken(refreshed.accessToken, platform);
    if (!auth) return null;

    cookieStore.set(ACCESS_COOKIE, refreshed.accessToken, ACCESS_COOKIE_OPTIONS);
    cookieStore.set(REFRESH_COOKIE, refreshed.refreshToken, REFRESH_COOKIE_OPTIONS);

    return auth;
  } catch {
    return null;
  }
}

export async function getServerProfile(): Promise<Profile | null> {
  const auth = await getServerAuth();
  return auth?.profile ?? null;
}
