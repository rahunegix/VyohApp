"use client";

import { useEffect, useCallback } from "react";
import { t as translate, type StringKey } from "@/lib/i18n";
import { useLanguageStore } from "@/store/language";

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const hydrated = useLanguageStore((s) => s.hydrated);
  const hydrate = useLanguageStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const t = useCallback(
    (key: StringKey | string) => translate(language, key),
    [language]
  );

  return { t, language, hydrated };
}
