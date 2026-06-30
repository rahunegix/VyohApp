"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepShell } from "@/components/onboarding/onboarding-step-shell";
import { SaathiCoachStep } from "@/features/onboarding";
import { ONBOARDING_CHAT_PROMPTS } from "@/lib/constants/onboarding-chat";
import { getLocalizedPrompts } from "@/lib/i18n";
import { useOnboardingStore } from "@/store";
import { useLanguageStore } from "@/store/language";
import { SAATHI_COACH_STEPS, ONBOARDING_ROUTES } from "@/config/onboarding";
import { useMemo } from "react";

function buildAnswer(chipIds: string[], chips: { id: string; label: string }[]): string {
  return chipIds
    .map((id) => chips.find((c) => c.id === id)?.label)
    .filter(Boolean)
    .join(". ");
}

export default function CoachPage() {
  const router = useRouter();
  const { setAiAnswer, platform, intent } = useOnboardingStore();
  const { language } = useLanguageStore();
  const prompts = useMemo(() => getLocalizedPrompts(language), [language]);

  const [step, setStep] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const promptConfig = prompts.find((p) => p.key === SAATHI_COACH_STEPS[step]?.key) ??
    ONBOARDING_CHAT_PROMPTS[step];
  const multiSelect = promptConfig?.multiSelect !== false;

  const toggleChip = useCallback(
    (id: string) => {
      setSelectedChips((prev) => {
        if (multiSelect) {
          return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        }
        return prev.includes(id) ? [] : [id];
      });
    },
    [multiSelect]
  );

  const handleContinue = () => {
    const key = SAATHI_COACH_STEPS[step]?.key;
    if (!key || !promptConfig) return;

    const answer = buildAnswer(selectedChips, promptConfig.chips);
    setAiAnswer(key, answer);
    setSelectedChips([]);

    if (step < SAATHI_COACH_STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    router.push(ONBOARDING_ROUTES.basicInfo);
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      setSelectedChips([]);
      return;
    }
    router.push(ONBOARDING_ROUTES.gender);
  };

  const totalSteps = 8 + (platform === "matrimony" || intent === "marriage" ? 1 : 0);

  return (
    <OnboardingStepShell
      backHref={step === 0 ? ONBOARDING_ROUTES.gender : undefined}
      currentStep={3}
      totalSteps={totalSteps}
      footer={null}
    >
      <SaathiCoachStep
        stepIndex={step}
        selectedChips={selectedChips}
        onToggleChip={toggleChip}
        onContinue={handleContinue}
        onBack={handleBack}
        continueDisabled={selectedChips.length === 0}
        multiSelect={multiSelect}
      />
    </OnboardingStepShell>
  );
}
