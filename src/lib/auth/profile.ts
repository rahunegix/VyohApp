import type { Platform } from "@/lib/platform";
import { platformPath } from "@/lib/platform";

export function isProfileOnboardingComplete(
  profile: Record<string, unknown> | null | undefined
): boolean {
  if (!profile) return false;
  const hasName = Boolean(String(profile.full_name ?? "").trim());
  if (!hasName) return false;

  if (profile.platform === "vip") {
    return hasName;
  }

  return String(profile.profile_status) === "active" && hasName;
}

export function getPostAuthPath(
  profile: Record<string, unknown> | null | undefined,
  platform: Platform = "dating"
): `/dating/discover` | `/matrimony/discover` | "/onboarding/platform" {
  if (isProfileOnboardingComplete(profile)) {
    return platformPath(platform, "/discover") as `/dating/discover` | `/matrimony/discover`;
  }
  return "/onboarding/platform";
}
