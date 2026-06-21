"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoUploadGrid } from "@/components/ui/photo-upload-grid";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";

const PLACEHOLDER_PHOTOS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
];

export default function PhotosPage() {
  const router = useRouter();
  const { photos, addPhoto, removePhoto } = useOnboardingStore();
  const { t, hydrated } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleAddDemo = async () => {
    if (photos.length >= 6) return;
    setUploading(true);
    await new Promise((r) => setTimeout(r, 500));
    addPhoto(`${PLACEHOLDER_PHOTOS[0]}&t=${Date.now()}`);
    setUploading(false);
  };

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

      <PhotoUploadGrid
        photos={photos}
        onAdd={handleAddDemo}
        onRemove={removePhoto}
        uploading={uploading}
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
