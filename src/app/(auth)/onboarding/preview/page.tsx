"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { PublicProfilePreview } from "@/components/profile/public-profile-preview";
import { compileOnboardingForProfileAI } from "@/lib/onboarding/profile-context";
import { getIntentLabelLocalized } from "@/lib/i18n";
import { formatAge } from "@/lib/helpers/utils";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";
import type { ProfileBuilderOutput } from "@/lib/ai/schemas";

export default function PreviewPage() {
  const router = useRouter();
  const onboarding = useOnboardingStore();
  const { aiAnswers, intent, photos, basicInfo, aiGeneratedProfile, setAiGeneratedProfile } = onboarding;
  const { t, language, hydrated } = useTranslation();
  const [aiProfile, setAiProfile] = useState<ProfileBuilderOutput | null>(aiGeneratedProfile);
  const [loading, setLoading] = useState(!aiGeneratedProfile);
  const [error, setError] = useState("");
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!intent || fetchedRef.current) return;
    if (aiGeneratedProfile) {
      setAiProfile(aiGeneratedProfile);
      setLoading(false);
      return;
    }

    fetchedRef.current = true;
    const state = useOnboardingStore.getState();
    const context = compileOnboardingForProfileAI(state, language);

    fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "profile_build", answers: context, intent }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.data) {
          setAiProfile(result.data);
          setAiGeneratedProfile(result.data);
        }
      })
      .catch(() => setError(t("profile_generate_error")))
      .finally(() => setLoading(false));
  }, [intent, language, aiGeneratedProfile, setAiGeneratedProfile, t]);

  if (!hydrated) return null;

  const age = basicInfo.dob ? formatAge(basicInfo.dob) : null;
  const intentLabel = intent ? getIntentLabelLocalized(language, intent) : undefined;
  const displayBio = basicInfo.bio?.trim() || aiProfile?.short_bio || "";
  const personalityTags = aiProfile?.personality_tags ?? [];

  return (
    <OnboardingStepShell
      backHref="/onboarding/family"
      title={t("profile_preview")}
      currentStep={8}
      flushContent
      footer={
        <Button
          onClick={() => router.push("/verification/success")}
          className="h-13 w-full rounded-2xl text-[17px] font-bold shadow-lg"
          size="lg"
          disabled={loading && !aiProfile && Object.keys(aiAnswers).length > 0}
        >
          {t("finish_setup")}
        </Button>
      }
    >
      <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain hide-scrollbar">
        <div className="px-6 pt-5">
          <OnboardingStepHeading title={t("profile_preview")} subtitle={t("preview_as_others_see")} />

        {loading && (
          <p className="mb-4 text-center text-xs text-muted-foreground animate-pulse">{t("generating_profile")}</p>
        )}
        {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}
      </div>

      <div className="px-4 pb-6">
        <PublicProfilePreview
          photoUrl={photos[0]}
          fullName={basicInfo.full_name ?? t("your_name")}
          age={age}
          city={basicInfo.city}
          district={basicInfo.district}
          region={basicInfo.region ?? null}
          intentLabel={intentLabel}
          profession={basicInfo.profession}
          education={basicInfo.education}
          bio={displayBio}
          personalityTags={personalityTags}
          loading={loading && !aiProfile}
          educationLabel={t("education")}
          regionLabel={t("region")}
        />
      </div>
      </div>
    </OnboardingStepShell>
  );
}
