"use client";

import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";

export default function PhotosPage() {
  const router = useRouter();
  const { photos, setPhotos } = useOnboardingStore();
  const { t, hydrated } = useTranslation();

  if (!hydrated) return null;

  return (
    <OnboardingStepShell
      backHref="/onboarding/ai-chat"
      title={t("add_photos")}
      currentStep={3}
      footer={
        <Button
          onClick={() => router.push("/onboarding/verification")}
          disabled={photos.length < 1}
          className="h-13 w-full text-[17px] font-bold shadow-lg"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <OnboardingStepHeading title={t("photos_title")} subtitle={t("photos_subtitle")} />

      <ProfilePhotoUploader
        photos={photos}
        onChange={setPhotos}
        uploadImmediately
        mainLabel={t("main")}
        addLabel={t("add")}
      />

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
        <Camera className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">{t("photos_tip")}</p>
      </div>
    </OnboardingStepShell>
  );
}
