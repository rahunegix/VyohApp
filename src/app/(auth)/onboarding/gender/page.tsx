"use client";



import { useRouter } from "next/navigation";

import { User, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

import { OptionCard } from "@/components/ui/option-card";

import { SaathiPresence } from "@/components/saathi";

import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { PageSkeleton } from "@/components/common/page-skeleton";

import { getOnboardingTotalSteps } from "@/config/onboarding";

import { getLocalizedGenders } from "@/lib/i18n";

import { useOnboardingStore } from "@/store";

import { useTranslation } from "@/hooks/use-translation";



export default function GenderPage() {

  const router = useRouter();

  const { gender, setGender, platform, intent } = useOnboardingStore();

  const { t, language, hydrated } = useTranslation();

  const genders = getLocalizedGenders(language);

  const totalSteps = getOnboardingTotalSteps(platform, intent);



  const subtitleKey =

    gender === "male"

      ? "gender_subtitle_male"

      : gender === "female"

        ? "gender_subtitle_female"

        : "gender_subtitle";



  if (!hydrated) return <PageSkeleton variant="form" withHeader={false} className="min-h-dvh pb-0" />;



  return (

    <OnboardingStepShell

      backHref="/onboarding/intent"

      currentStep={2}

      totalSteps={totalSteps}

      footer={

        <Button

          onClick={() => router.push("/onboarding/coach")}

          disabled={!gender}

          className="h-13 w-full text-[17px] font-bold shadow-[var(--shadow-glow)]"

          size="lg"

        >

          {t("continue")}

        </Button>

      }

    >

      <div className="mb-6 rounded-[6px] border border-primary/10 bg-gradient-to-br from-primary/[0.05] to-white p-4">

        <SaathiPresence message="This helps me show you the right matches with respect and intent." />

      </div>



      <OnboardingStepHeading title={t("gender_title")} subtitle={t(subtitleKey)} />



      <div className="space-y-3">

        {genders.map((g) => (

          <OptionCard

            key={g.value}

            selected={gender === g.value}

            onClick={() => setGender(g.value)}

            label={g.label}

            description={g.description}

            icon={

              g.value === "female" ? (

                <UserRound className="h-5 w-5" />

              ) : (

                <User className="h-5 w-5" />

              )

            }

          />

        ))}

      </div>

    </OnboardingStepShell>

  );

}


