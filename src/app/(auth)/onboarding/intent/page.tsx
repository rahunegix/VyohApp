"use client";

import { useRouter } from "next/navigation";
import { Heart, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectCard } from "@/components/common/step-indicator";
import { StaggerChildren, StaggerItem } from "@/components/common/page-transition";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { getLocalizedIntents } from "@/lib/i18n";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";

const icons = {
  serious: <Heart className="h-5 w-5" />,
  marriage: <Gem className="h-5 w-5" />,
} as const;

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
          className="h-13 w-full rounded-2xl text-[17px] font-bold shadow-lg"
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
            <SelectCard
              selected={intent === i.value}
              onClick={() => setIntent(i.value)}
              title={i.label}
              description={i.description}
              icon={icons[i.value as keyof typeof icons]}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </OnboardingStepShell>
  );
}
