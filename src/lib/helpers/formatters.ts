import type { Profile, Intent, Region } from "@/types";
import { INTENTS, REGIONS } from "@/lib/constants";

export function getIntentLabel(intent: Intent): string {
  return INTENTS.find((i) => i.value === intent)?.label ?? intent;
}

export function getRegionLabel(region: Region | null): string {
  if (!region) return "Not specified";
  return REGIONS.find((r) => r.value === region)?.label ?? region;
}

export function getTrustLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Highly Trusted", color: "text-success" };
  if (score >= 60) return { label: "Trusted", color: "text-primary" };
  if (score >= 40) return { label: "Building Trust", color: "text-warning" };
  return { label: "New", color: "text-muted-foreground" };
}

export function getReadinessLabel(score: number): string {
  if (score >= 80) return "Ready for commitment";
  if (score >= 60) return "Getting ready";
  if (score >= 40) return "Still exploring";
  return "Early stage";
}

export function formatProfileLocation(profile: Profile): string {
  const parts = [profile.city, profile.district, getRegionLabel(profile.region)].filter(Boolean);
  return parts.join(" · ");
}

export function getVerificationCount(verification: {
  mobile_verified: boolean;
  face_verified: boolean;
  id_verified: boolean;
  family_verified: boolean;
}): number {
  return [
    verification.mobile_verified,
    verification.face_verified,
    verification.id_verified,
    verification.family_verified,
  ].filter(Boolean).length;
}
