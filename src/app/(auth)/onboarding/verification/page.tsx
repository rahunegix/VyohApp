"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanFace, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { useTranslation } from "@/hooks/use-translation";

export default function VerificationPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);

  const handleRecord = async () => {
    setRecording(true);
    await new Promise((r) => setTimeout(r, 3000));
    setRecording(false);
    setDone(true);
  };

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

      <div className="flex flex-col items-center py-4">
        <div
          className={`relative flex h-56 w-56 items-center justify-center rounded-full border-4 sm:h-64 sm:w-64 ${
            recording ? "border-primary animate-pulse" : done ? "border-success" : "border-border"
          }`}
        >
          <div className="flex h-[92%] w-[92%] items-center justify-center rounded-full bg-muted/80">
            {done ? (
              <Shield className="h-16 w-16 text-success" />
            ) : (
              <ScanFace className={`h-16 w-16 ${recording ? "text-primary" : "text-muted-foreground"}`} />
            )}
          </div>
        </div>
        <p className="mt-5 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
          {recording ? t("verification_recording") : done ? t("verification_done") : t("verification_position")}
        </p>
      </div>

      {!done && (
        <Button onClick={handleRecord} loading={recording} className="w-full" size="lg">
          {recording ? t("recording") : t("start_verification")}
        </Button>
      )}
    </OnboardingStepShell>
  );
}
