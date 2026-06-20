import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAccessToken, type TokenPayload } from "@/lib/auth/jwt";

export const ACCESS_COOKIE = "saathini_access";
export const REFRESH_COOKIE = "saathini_refresh";

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

export async function getAuthUser(request: NextRequest) {
  const payload = await getAuthPayload(request);
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

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { payload, user, profile };
}

export async function getAuthProfileId(request: NextRequest): Promise<string | null> {
  const auth = await getAuthUser(request);
  if (!auth?.profile) return null;
  return Array.isArray(auth.profile) ? auth.profile[0]?.id : auth.profile?.id;
}
