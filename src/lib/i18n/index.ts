import type { Intent } from "@/types";
import {
  INTENTS,
  GENDERS,
  ONBOARDING_REGIONS,
  EDUCATION_OPTIONS,
  PROFESSION_OPTIONS,
} from "@/lib/constants";
import type { AppLanguage } from "./languages";
import { t } from "./translate";
import type { StringKey } from "./ui-strings";

export { t } from "./translate";
export { UI_STRINGS } from "./ui-strings";
export type { StringKey } from "./ui-strings";
export { getLocalizedPrompts } from "./onboarding-translations";

export function getLocalizedIntents(lang: AppLanguage) {
  return INTENTS.map((i) => ({
    value: i.value,
    label: t(lang, `intent_${i.value}_label` as StringKey),
    description: t(lang, `intent_${i.value}_desc` as StringKey),
  }));
}

export function getLocalizedGenders(lang: AppLanguage) {
  return GENDERS.map((g) => ({
    value: g.value,
    label: t(lang, `gender_${g.value}` as StringKey),
    description: t(lang, `gender_${g.value}_desc` as StringKey),
  }));
}

export function getLocalizedRegions(lang: AppLanguage) {
  return ONBOARDING_REGIONS.map((r) => ({
    value: r.value,
    label: t(lang, `region_${r.value}` as StringKey),
  }));
}

export function getLocalizedEducationOptions(lang: AppLanguage) {
  return EDUCATION_OPTIONS.map((o) => ({
    value: o.value,
    label: t(lang, o.key as StringKey),
  }));
}

export function getLocalizedProfessionOptions(lang: AppLanguage) {
  return PROFESSION_OPTIONS.map((o) => ({
    value: o.value,
    label: t(lang, o.key as StringKey),
  }));
}

export function getEducationLabel(lang: AppLanguage, value: string): string {
  const opt = EDUCATION_OPTIONS.find((o) => o.value === value);
  return opt ? t(lang, opt.key as StringKey) : value;
}

export function getProfessionLabel(lang: AppLanguage, value: string): string {
  const opt = PROFESSION_OPTIONS.find((o) => o.value === value);
  return opt ? t(lang, opt.key as StringKey) : value;
}

export function getIntentLabelLocalized(lang: AppLanguage, intent: Intent): string {
  return t(lang, `intent_${intent}_label` as StringKey);
}
