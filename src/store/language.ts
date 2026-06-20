"use client";

import { create } from "zustand";
import type { AppLanguage } from "@/lib/i18n/languages";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/languages";
import { getLanguageCookie, setLanguageCookie } from "@/lib/i18n/cookie";
import { detectUserLanguage } from "@/lib/ai/language";

interface LanguageState {
  language: AppLanguage;
  hydrated: boolean;
  setLanguage: (lang: AppLanguage) => void;
  hydrate: () => void;
  detectAndSwitch: (text: string) => AppLanguage;
}

function userLangToApp(lang: "english" | "hindi" | "hinglish"): AppLanguage {
  if (lang === "hindi") return "hi";
  if (lang === "hinglish") return "hinglish";
  return "en";
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: DEFAULT_LANGUAGE,
  hydrated: false,

  hydrate: () => {
    const saved = getLanguageCookie();
    if (saved) set({ language: saved, hydrated: true });
    else set({ hydrated: true });
  },

  setLanguage: (lang) => {
    setLanguageCookie(lang);
    set({ language: lang });
  },

  detectAndSwitch: (text) => {
    if (!text.trim() || text.trim().length < 4) return get().language;
    const detected = userLangToApp(detectUserLanguage(text));
    const current = get().language;
    if (detected !== current) {
      setLanguageCookie(detected);
      set({ language: detected });
      return detected;
    }
    return current;
  },
}));
