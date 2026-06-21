"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SelectPillRow } from "@/components/ui/selection-chip";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { getLocalizedGenders } from "@/lib/i18n";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";

export default function GenderPage() {
  const router = useRouter();
  const { gender, setGender } = useOnboardingStore();
  const { t, language, hydrated } = useTranslation();
  const genders = getLocalizedGenders(language);

  const subtitleKey =
    gender === "male"
      ? "gender_subtitle_male"
      : gender === "female"
        ? "gender_subtitle_female"
        : "gender_subtitle";

  if (!hydrated) return null;

  return (
    <OnboardingStepShell
      backHref="/onboarding/intent"
      currentStep={1}
      footer={
        <Button
          onClick={() => router.push("/onboarding/ai-chat")}
          disabled={!gender}
          className="w-full"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <OnboardingStepHeading title={t("gender_title")} subtitle={t(subtitleKey)} />
      <div className="space-y-3">
        {genders.map((g) => (
          <SelectPillRow
            key={g.value}
            selected={gender === g.value}
            onClick={() => setGender(g.value)}
            label={g.label}
            description={g.description}
          />
        ))}
      </div>
    </OnboardingStepShell>
  );
}
