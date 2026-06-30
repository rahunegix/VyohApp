"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { FaceVerificationCapture } from "@/components/verification/face-verification-capture";
import { useTranslation } from "@/hooks/use-translation";

export default function VerificationPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [done, setDone] = useState(false);

  if (!hydrated) return null;

  return (
    <OnboardingStepShell
      backHref="/onboarding/photos"
      title={t("face_verification")}
      currentStep={4}
      footer={
        <div className="space-y-2.5">
          {done && (
            <Button
              onClick={() => router.push("/onboarding/basic-info")}
              className="h-13 w-full text-[17px] font-bold shadow-lg"
              size="lg"
            >
              {t("continue")}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => router.push("/onboarding/basic-info")}
            className="w-full"
          >
            {t("skip_for_now")}
          </Button>
        </div>
      }
    >
      <OnboardingStepHeading title={t("verification_title")} subtitle={t("verification_subtitle")} />

      <FaceVerificationCapture
        onVerified={() => setDone(true)}
        onPendingReview={() => setDone(true)}
        showStartButton={!done}
      />
    </OnboardingStepShell>
  );
}
