import { EDUCATION_OPTIONS, PROFESSION_OPTIONS } from "@/lib/constants";
import { getEducationLabel, getProfessionLabel } from "@/lib/i18n";
import type { AppLanguage } from "@/lib/i18n/languages";

export function educationToFormFields(
  stored: string | null | undefined,
  language: AppLanguage
): { education_select: string; education_custom: string } {
  if (!stored?.trim()) return { education_select: "", education_custom: "" };
  for (const option of EDUCATION_OPTIONS) {
    if (option.value === stored || getEducationLabel(language, option.value) === stored) {
      return { education_select: option.value, education_custom: "" };
    }
  }
  return { education_select: "other", education_custom: stored };
}

export function professionToFormFields(
  stored: string | null | undefined,
  language: AppLanguage
): { profession_select: string; profession_custom: string } {
  if (!stored?.trim()) return { profession_select: "", profession_custom: "" };
  for (const option of PROFESSION_OPTIONS) {
    if (option.value === stored || getProfessionLabel(language, option.value) === stored) {
      return { profession_select: option.value, profession_custom: "" };
    }
  }
  return { profession_select: "other", profession_custom: stored };
}

export function resolveSelectValue(
  select: string,
  custom: string,
  getLabel: (value: string) => string
): string {
  if (!select) return "";
  if (select === "other") return custom.trim();
  return getLabel(select);
}
