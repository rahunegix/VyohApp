import type { SupabaseClient } from "@supabase/supabase-js";
import type { Platform } from "@/lib/platform";

let platformColumnReady: boolean | null = null;

export function isPlatformColumnError(message?: string | null): boolean {
  if (!message) return false;
  return /could not find the ['"]platform['"] column/i.test(message);
}

/** Detect whether migration 014+ has been applied (cached per process). */
export async function hasPlatformColumn(admin: SupabaseClient): Promise<boolean> {
  if (platformColumnReady !== null) return platformColumnReady;
  const { error } = await admin.from("profiles").select("platform").limit(1);
  if (error && isPlatformColumnError(error.message)) {
    platformColumnReady = false;
    return false;
  }
  platformColumnReady = true;
  return true;
}

export async function findProfileByUserAndPlatform(
  admin: SupabaseClient,
  userId: string,
  platform?: Platform
) {
  const hasPlatform = await hasPlatformColumn(admin);

  if (hasPlatform && platform) {
    return admin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", platform)
      .maybeSingle();
  }

  return admin.from("profiles").select("*").eq("user_id", userId).maybeSingle();
}

export async function findProfileIdByUserAndPlatform(
  admin: SupabaseClient,
  userId: string,
  platform?: Platform
): Promise<string | null> {
  const { data, error } = await findProfileByUserAndPlatform(admin, userId, platform);
  if (error || !data?.id) return null;
  return data.id as string;
}

export function withPlatformField<T extends Record<string, unknown>>(
  payload: T,
  platform: Platform,
  hasPlatform: boolean
): T & { platform?: Platform } {
  if (!hasPlatform) return payload;
  return { ...payload, platform };
}
