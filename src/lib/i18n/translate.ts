import type { AppLanguage } from "./languages";
import { UI_STRINGS, type StringKey } from "./ui-strings";

export function t(lang: AppLanguage, key: StringKey | string): string {
  const strings = UI_STRINGS[lang] as Record<string, string>;
  return strings[key] ?? UI_STRINGS.en[key as StringKey] ?? key;
}
