"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SelectCard } from "@/components/common/step-indicator";
import { StaggerChildren, StaggerItem } from "@/components/common/page-transition";
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
          className="h-13 w-full rounded-2xl text-[17px] font-bold shadow-lg"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <OnboardingStepHeading title={t("gender_title")} subtitle={t(subtitleKey)} />
      <StaggerChildren className="space-y-3">
        {genders.map((g) => (
          <StaggerItem key={g.value}>
            <SelectCard
              selected={gender === g.value}
              onClick={() => setGender(g.value)}
              title={g.label}
              description={g.description}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </OnboardingStepShell>
  );
}
