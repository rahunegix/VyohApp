"use client";

import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import { SaathiPresence } from "@/components/saathi/saathi-presence";
import { SAATHI_COPY } from "@/config/ai";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";
import { PageSkeleton } from "@/components/common/page-skeleton";

export default function PhotosPage() {
  const router = useRouter();
  const { photos, setPhotos } = useOnboardingStore();
  const { t, hydrated } = useTranslation();

  if (!hydrated) return <PageSkeleton variant="form" withHeader={false} className="min-h-dvh pb-0" />;

  return (
    <OnboardingStepShell
      backHref="/onboarding/basic-info"
      title={t("add_photos")}
      currentStep={5}
      footer={
        <Button
          onClick={() => router.push("/onboarding/lifestyle")}
          disabled={photos.length < 1}
          className="h-13 w-full text-[17px] font-bold shadow-lg"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <SaathiPresence message={SAATHI_COPY.onboarding.photoNudge} className="mb-6" />
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
