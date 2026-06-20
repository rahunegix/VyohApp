"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          className="h-13 w-full rounded-2xl text-[17px] font-bold shadow-lg"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <OnboardingStepHeading title={t("photos_title")} subtitle={t("photos_subtitle")} />

      <div className="grid grid-cols-3 gap-3">
        {photos.map((url, i) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-sm">
            <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="120px" />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                {t("main")}
              </span>
            )}
            <button
              type="button"
              onClick={() => removePhoto(url)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {photos.length < 6 && (
          <button
            type="button"
            onClick={handleAddDemo}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-primary/5"
          >
            {uploading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t("add")}</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
        <Camera className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">{t("photos_tip")}</p>
      </div>
    </OnboardingStepShell>
  );
}
