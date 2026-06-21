"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SelectionChip } from "@/components/ui/selection-chip";
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
          className="h-13 w-full text-[17px] font-bold shadow-lg"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <OnboardingStepHeading title={t("lifestyle_title")} subtitle={t("lifestyle_subtitle")} />

      <div className="space-y-5">
        {lifestyleOptions.map((section) => (
          <div key={section.key} className="rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]">
            <p className="mb-3 text-sm font-semibold text-foreground">{section.label}</p>
            <div className="flex flex-wrap gap-2">
              {section.options.map((opt) => (
                <SelectionChip
                  key={opt.v}
                  selected={lifestyle[section.key] === opt.v}
                  onClick={() => setLifestyle(section.key, opt.v)}
                  label={opt.l}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </OnboardingStepShell>
  );
}
