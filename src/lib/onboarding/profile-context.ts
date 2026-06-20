import type { OnboardingState } from "@/types";
import type { AppLanguage } from "@/lib/i18n/languages";
import { getEducationLabel, getProfessionLabel, getIntentLabelLocalized } from "@/lib/i18n";
import { getRegionLabel } from "@/lib/helpers/formatters";
import { formatAge } from "@/lib/helpers/utils";

function labelize(key: string): string {
  return key.replace(/_/g, " ");
}

/** Flatten full onboarding state into one context map for profile AI. */
export function compileOnboardingForProfileAI(
  state: OnboardingState,
  language: AppLanguage = "hinglish"
): Record<string, string> {
  const ctx: Record<string, string> = { ...state.aiAnswers };

  const { basicInfo, lifestyle, familyBackground, intent, gender, looking_for } = state;

  if (intent) ctx.intent = getIntentLabelLocalized(language, intent);
  if (gender) ctx.gender = gender;
  if (looking_for) ctx.looking_for = looking_for;
  if (basicInfo.full_name) ctx.full_name = basicInfo.full_name;
  if (basicInfo.dob) ctx.age = String(formatAge(basicInfo.dob));
  if (basicInfo.city) ctx.city = basicInfo.city;
  if (basicInfo.district) ctx.district = basicInfo.district;
  if (basicInfo.village) ctx.village = basicInfo.village;
  if (basicInfo.region) ctx.region = getRegionLabel(basicInfo.region);
  if (basicInfo.education) {
    ctx.education = basicInfo.education.includes("_")
      ? getEducationLabel(language, basicInfo.education)
      : basicInfo.education;
  }
  if (basicInfo.profession) {
    ctx.profession = basicInfo.profession.includes("_")
      ? getProfessionLabel(language, basicInfo.profession)
      : basicInfo.profession;
  }
  if (basicInfo.bio?.trim()) ctx.user_written_bio = basicInfo.bio.trim();

  for (const [key, value] of Object.entries(lifestyle)) {
    if (value) ctx[`lifestyle_${key}`] = value.replace(/_/g, " ");
  }

  const family = { ...familyBackground, religious_preference: "hindu" };
  for (const [key, value] of Object.entries(family)) {
    if (value?.trim()) ctx[`family_${key}`] = value.trim();
  }

  return ctx;
}

export function formatContextForPrompt(context: Record<string, string>): string {
  return Object.entries(context)
    .map(([k, v]) => `- ${labelize(k)}: ${v}`)
    .join("\n");
}
