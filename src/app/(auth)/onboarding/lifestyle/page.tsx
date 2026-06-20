"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";

export default function LifestylePage() {
  const router = useRouter();
  const { lifestyle, setLifestyle } = useOnboardingStore();
  const { t, hydrated } = useTranslation();

  const lifestyleOptions = useMemo(
    () => [
      {
        key: "smoking",
        label: t("smoking"),
        options: [
          { v: "never", l: t("never") },
          { v: "occasionally", l: t("occasionally") },
          { v: "regularly", l: t("regularly") },
        ],
      },
      {
        key: "drinking",
        label: t("drinking"),
        options: [
          { v: "never", l: t("never") },
          { v: "occasionally", l: t("occasionally") },
          { v: "regularly", l: t("regularly") },
        ],
      },
      {
        key: "food_preference",
        label: t("food"),
        options: [
          { v: "veg", l: t("vegetarian") },
          { v: "non_veg", l: t("non_veg") },
          { v: "eggetarian", l: t("eggetarian") },
        ],
      },
      {
        key: "kids_preference",
        label: t("kids"),
        options: [
          { v: "want", l: t("kids_want") },
          { v: "dont_want", l: t("kids_dont") },
          { v: "open", l: t("kids_open") },
          { v: "have", l: t("kids_have") },
        ],
      },
      {
        key: "relocation",
        label: t("relocation"),
        options: [
          { v: "willing", l: t("relocate_willing") },
          { v: "not_willing", l: t("relocate_not") },
          { v: "open", l: t("relocate_open") },
        ],
      },
    ],
    [t]
  );

  if (!hydrated) return null;

  return (
    <OnboardingStepShell
      backHref="/onboarding/basic-info"
      title={t("lifestyle")}
      currentStep={6}
      footer={
        <Button
          onClick={() => router.push("/onboarding/family")}
          className="h-13 w-full rounded-2xl text-[17px] font-bold shadow-lg"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <OnboardingStepHeading title={t("lifestyle_title")} subtitle={t("lifestyle_subtitle")} />

      <div className="space-y-6">
        {lifestyleOptions.map((section) => (
          <div key={section.key} className="rounded-2xl border border-border/50 bg-muted/20 p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">{section.label}</p>
            <div className="flex flex-wrap gap-2">
              {section.options.map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setLifestyle(section.key, opt.v)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                    lifestyle[section.key] === opt.v
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-foreground shadow-sm hover:bg-primary/5"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </OnboardingStepShell>
  );
}
