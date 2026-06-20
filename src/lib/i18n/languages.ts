export type AppLanguage = "en" | "hi" | "hinglish";

export const LANGUAGES: {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  description: string;
}[] = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    description: "Continue in English",
  },
  {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिंदी",
    description: "हिंदी में जारी रखें",
  },
  {
    code: "hinglish",
    label: "Hinglish",
    nativeLabel: "Hinglish",
    description: "Hindi + English mix mein baat karein",
  },
];

export const LANGUAGE_COOKIE = "saathini_lang";
export const DEFAULT_LANGUAGE: AppLanguage = "hinglish";

export function appLanguageToUserLanguage(lang: AppLanguage): "english" | "hindi" | "hinglish" {
  if (lang === "hi") return "hindi";
  if (lang === "hinglish") return "hinglish";
  return "english";
}
