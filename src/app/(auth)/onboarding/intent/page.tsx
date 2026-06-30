"use client";

import { useRouter } from "next/navigation";
import { Compass, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/ui/option-card";
import { StaggerChildren, StaggerItem } from "@/components/common/page-transition";
import { SaathiPresence } from "@/components/saathi";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { getOnboardingTotalSteps } from "@/config/onboarding";
import { getLocalizedIntents } from "@/lib/i18n";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";
import type { Intent } from "@/types";

const INTENT_ICONS: Partial<Record<Intent, React.ReactNode>> = {
  serious: <Heart className="h-5 w-5" />,
  marriage: <Sparkles className="h-5 w-5" />,
  exploring: <Compass className="h-5 w-5" />,
};

export default function IntentPage() {
  const router = useRouter();
  const { intent, setIntent, platform } = useOnboardingStore();
  const { t, language, hydrated } = useTranslation();
  const intents = getLocalizedIntents(language).filter((i) => {
    if (platform === "matrimony") return i.value === "marriage";
    if (platform === "vip") return i.value === "serious";
    return i.value !== "marriage";
  });

  const totalSteps = getOnboardingTotalSteps(platform, intent);

  if (!hydrated) return <PageSkeleton variant="form" withHeader={false} className="min-h-dvh pb-0" />;

  return (
    <OnboardingStepShell
      backHref="/onboarding/platform"
      currentStep={1}
      totalSteps={totalSteps}
      footer={
        <Button
          onClick={() => router.push("/onboarding/gender")}
          disabled={!intent}
          className="h-13 w-full text-[17px] font-bold shadow-[var(--shadow-glow)]"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <div className="mb-6 rounded-[6px] border border-primary/10 bg-gradient-to-br from-primary/[0.05] to-white p-4">
        <SaathiPresence message="Tell me what you're looking for — I'll tailor everything around your intent." />
      </div>

      <OnboardingStepHeading title={t("intent_title")} subtitle={t("intent_subtitle")} />

      <StaggerChildren className="space-y-3">
        {intents.map((i) => (
          <StaggerItem key={i.value}>
            <OptionCard
              selected={intent === i.value}
              onClick={() => setIntent(i.value)}
              label={i.label}
              description={i.description}
              icon={INTENT_ICONS[i.value]}
              accent={i.value === "marriage" ? "amber" : "primary"}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </OnboardingStepShell>
  );
}
