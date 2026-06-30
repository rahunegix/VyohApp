import type { Platform } from "@/lib/platform";
import type { Intent } from "@/types";

/** Saathi coach card keys (3 steps — no slow chat) */
export const SAATHI_COACH_STEPS = [
  { key: "about_self", label: "About You" },
  { key: "partner_fit", label: "Partner Fit" },
  { key: "relationship_values", label: "Relationship Values" },
] as const;

export type SaathiCoachStepKey = (typeof SAATHI_COACH_STEPS)[number]["key"];

export function needsFamilyStep(platform: Platform | null, intent: Intent | null): boolean {
  return platform === "matrimony" || intent === "marriage";
}

export function getOnboardingTotalSteps(platform: Platform | null, intent: Intent | null): number {
  // platform, intent, gender, coach(1), basic-info, photos, lifestyle, [family], preview
  const base = 8;
  return needsFamilyStep(platform, intent) ? base + 1 : base;
}

export const ONBOARDING_ROUTES = {
  platform: "/onboarding/platform",
  intent: "/onboarding/intent",
  gender: "/onboarding/gender",
  coach: "/onboarding/coach",
  basicInfo: "/onboarding/basic-info",
  photos: "/onboarding/photos",
  lifestyle: "/onboarding/lifestyle",
  family: "/onboarding/family",
  preview: "/onboarding/preview",
  success: "/verification/success",
} as const;
