import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/api-auth";
import type { Profile } from "@/types";

export async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

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

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { admin, user, profile: profile as Profile | null, payload };
}

export async function getServerProfile(): Promise<Profile | null> {
  const auth = await getServerAuth();
  return auth?.profile ?? null;
}
