"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/helpers/utils";
import { SelectPillRow } from "@/components/ui/selection-chip";
import { LANGUAGES, type AppLanguage } from "@/lib/i18n/languages";
import { useLanguageStore } from "@/store/language";

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, hydrate, hydrated } = useLanguageStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return null;

  const current = LANGUAGES.find((l) => l.code === language);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted"
        aria-label="Change language"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span>{current?.nativeLabel ?? "EN"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border border-border bg-white shadow-lg">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full flex-col items-start px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                  language === lang.code && "bg-primary/5 text-primary"
                )}
              >
                <span className="font-medium">{lang.nativeLabel}</span>
                {!compact && (
                  <span className="text-[10px] text-muted-foreground">{lang.description}</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LanguageOptionCard({
  lang,
  selected,
  onSelect,
}: {
  lang: AppLanguage;
  selected: boolean;
  onSelect: () => void;
}) {
  const item = LANGUAGES.find((l) => l.code === lang)!;
  return (
    <SelectPillRow
      selected={selected}
      onClick={onSelect}
      label={item.nativeLabel}
      description={item.description}
    />
  );
}
