import type { AppLanguage } from "./languages";
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE } from "./languages";

const MAX_AGE = 60 * 60 * 24 * 365;

export function setLanguageCookie(lang: AppLanguage) {
  if (typeof document === "undefined") return;
  document.cookie = `${LANGUAGE_COOKIE}=${lang};path=/;max-age=${MAX_AGE};SameSite=Lax`;
}

export function getLanguageCookie(): AppLanguage | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANGUAGE_COOKIE}=([^;]*)`));
  const value = match?.[1];
  if (value === "en" || value === "hi" || value === "hinglish") return value;
  return null;
}

export function getLanguageOrDefault(): AppLanguage {
  return getLanguageCookie() ?? DEFAULT_LANGUAGE;
}
