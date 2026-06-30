import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshSession } from "@/lib/auth/custom-auth";
import { verifyAccessToken, type TokenPayload } from "@/lib/auth/jwt";
import { resolvePlatformFromRequest } from "@/lib/auth/platform-context";
import type { Platform } from "@/lib/platform";

export const ACCESS_COOKIE = "saathini_access";
export const REFRESH_COOKIE = "saathini_refresh";

export type AuthUserResult = {
  payload: TokenPayload;
  user: { id: string } & Record<string, unknown>;
  profile: ({ id: string } & Record<string, unknown>) | null;
  platform: Platform;
  platforms: Platform[];
};

export async function getTokenFromRequest(request: NextRequest): Promise<string | null> {
  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    return bearer.slice(7);
  }
  return request.cookies.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getAuthPayload(request: NextRequest): Promise<TokenPayload | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  return verifyAccessToken(token);
}

async function loadUserProfiles(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", userId);
  return (data ?? []) as Record<string, unknown>[];
}

async function lookupAuthUser(
  accessToken: string,
  platform?: Platform
): Promise<AuthUserResult | null> {
  const payload = await verifyAccessToken(accessToken);
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

  const profiles = await loadUserProfiles(admin, user.id);
  const platforms = profiles
    .map((p) => p.platform)
    .filter((p): p is Platform => p === "dating" || p === "matrimony" || p === "vip");

  const activePlatform =
    platform ??
    (user.active_platform === "vip"
      ? "vip"
      : user.active_platform === "matrimony"
        ? "matrimony"
        : "dating");

  const profile =
    profiles.find((p) => p.platform === activePlatform) ??
    profiles[0] ??
    null;

  return {
    payload,
    user: user as { id: string } & Record<string, unknown>,
    profile: profile as ({ id: string } & Record<string, unknown>) | null,
    platform: activePlatform,
    platforms,
  };
}

export async function getAuthUser(request: NextRequest) {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  const platform = resolvePlatformFromRequest(request);
  return lookupAuthUser(token, platform);
}

/** Cookie-based sessions: refresh access token when expired but refresh cookie is valid. */
export async function getAuthUserWithRefresh(request: NextRequest): Promise<{
  auth: AuthUserResult | null;
  tokens?: { accessToken: string; refreshToken: string };
}> {
  const token = await getTokenFromRequest(request);
  if (token) {
    const platform = resolvePlatformFromRequest(request);
    const auth = await lookupAuthUser(token, platform);
    if (auth) return { auth };
  }

  const hasBearer = Boolean(request.headers.get("authorization")?.startsWith("Bearer "));
  if (hasBearer) return { auth: null };

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return { auth: null };

  try {
    const result = await refreshSession(refreshToken);
    const platform = resolvePlatformFromRequest(request);
    const auth = await lookupAuthUser(result.accessToken, platform);
    if (!auth) return { auth: null };
    return {
      auth,
      tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
    };
  } catch {
    return { auth: null };
  }
}

export async function refreshAuthPayload(request: NextRequest): Promise<{
  payload: TokenPayload | null;
  tokens?: { accessToken: string; refreshToken: string };
}> {
  const token = await getTokenFromRequest(request);
  if (token) {
    const payload = await verifyAccessToken(token);
    if (payload?.jti) {
      const admin = createAdminClient();
      const { data: user } = await admin
        .from("users")
        .select("id, access_token")
        .eq("id", payload.sub)
        .eq("access_token", payload.jti)
        .eq("is_active", true)
        .maybeSingle();
      if (user) return { payload };
    }
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return { payload: null };

  try {
    const result = await refreshSession(refreshToken);
    const payload = await verifyAccessToken(result.accessToken);
    if (!payload) return { payload: null };
    return {
      payload,
      tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
    };
  } catch {
    return { payload: null };
  }
}

export async function getAuthProfileId(request: NextRequest): Promise<string | null> {
  const auth = await getAuthUser(request);
  if (!auth?.profile) return null;
  const profile = auth.profile as Record<string, unknown>;
  if (Array.isArray(profile)) {
    const id = profile[0]?.id;
    return id ? String(id) : null;
  }
  return profile.id ? String(profile.id) : null;
}
