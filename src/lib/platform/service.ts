import type { SupabaseClient } from "@supabase/supabase-js";
import type { Platform } from "@/lib/platform";
import { PLATFORM_CONFIG } from "@/lib/platform";
import {
  findProfileIdByUserAndPlatform,
  hasPlatformColumn,
  isPlatformColumnError,
  withPlatformField,
} from "@/lib/platform/profile-query";

export async function createPlatformProfile(
  admin: SupabaseClient,
  userId: string,
  platform: Platform,
  seed?: { full_name?: string }
) {
  const hasPlatform = await hasPlatformColumn(admin);

  const existingId = await findProfileIdByUserAndPlatform(admin, userId, platform);
  if (existingId) return existingId;

  let fullName = seed?.full_name ?? "";

  if (hasPlatform && !fullName) {
    const { data: datingProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .eq("platform", "dating")
      .maybeSingle();
    fullName = datingProfile?.full_name ?? "";
  } else if (!fullName) {
    const { data: anyProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle();
    fullName = anyProfile?.full_name ?? "";
  }

  const insertPayload = withPlatformField(
    {
      user_id: userId,
      intent: PLATFORM_CONFIG[platform].defaultIntent,
      full_name: fullName,
      profile_status: "draft",
    },
    platform,
    hasPlatform
  );

  const { data: profile, error } = await admin
    .from("profiles")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !profile?.id) {
    if (isPlatformColumnError(error?.message)) {
      throw new Error(
        "Database migration required: run src/database/migrations/014_platform.sql (and 015_vip_platform.sql) in Supabase SQL Editor, then reload the schema."
      );
    }
    throw new Error(error?.message ?? "Could not create profile");
  }

  const profileId = profile.id as string;
  await Promise.all([
    admin.from("verification_status").insert({ profile_id: profileId }),
    admin.from("privacy_settings").insert({ profile_id: profileId }),
    admin.from("trust_scores").insert({ profile_id: profileId }),
    admin.from("relationship_readiness").insert({ profile_id: profileId }),
  ]);

  return profileId;
}
