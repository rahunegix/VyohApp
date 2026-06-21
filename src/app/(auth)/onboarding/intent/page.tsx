"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SelectPillRow } from "@/components/ui/selection-chip";
import { StaggerChildren, StaggerItem } from "@/components/common/page-transition";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { getLocalizedIntents } from "@/lib/i18n";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";

export default function IntentPage() {
  const router = useRouter();
  const { intent, setIntent } = useOnboardingStore();
  const { t, language, hydrated } = useTranslation();
  const intents = getLocalizedIntents(language);

  if (!hydrated) return null;

  return (
    <OnboardingStepShell
      backHref="/otp"
      currentStep={0}
      footer={
        <Button
          onClick={() => router.push("/onboarding/gender")}
          disabled={!intent}
          className="h-13 w-full text-[17px] font-bold shadow-lg"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <OnboardingStepHeading title={t("intent_title")} subtitle={t("intent_subtitle")} />
      <StaggerChildren className="space-y-3">
        {intents.map((i) => (
          <StaggerItem key={i.value}>
            <SelectPillRow
              selected={intent === i.value}
              onClick={() => setIntent(i.value)}
              label={i.label}
              description={i.description}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </OnboardingStepShell>
  );
}
