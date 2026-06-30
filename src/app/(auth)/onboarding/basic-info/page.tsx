"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSelect } from "@/components/ui/form-field";
import { SaathiPresence } from "@/components/saathi";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { basicInfoFormSchema } from "@/lib/validation/schemas";
import { UTTARAKHAND_DISTRICTS } from "@/lib/constants";
import { getOnboardingTotalSteps } from "@/config/onboarding";
import {
  getLocalizedRegions,
  getLocalizedEducationOptions,
  getLocalizedProfessionOptions,
  getEducationLabel,
  getProfessionLabel,
} from "@/lib/i18n";
import { appLanguageToUserLanguage, type AppLanguage } from "@/lib/i18n/languages";
import { withProgress } from "@/lib/progress";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";
import { z } from "zod";

type FormValues = z.infer<typeof basicInfoFormSchema>;

function resolveSelectValue(
  select: string,
  custom: string,
  getLabel: (value: string) => string
): string {
  if (!select) return "";
  if (select === "other") return custom.trim();
  return getLabel(select);
}

export default function BasicInfoPage() {
  const router = useRouter();
  const { setBasicInfo, basicInfo, aiAnswers, intent, platform } = useOnboardingStore();
  const { t, language, hydrated } = useTranslation();
  const [generatingBio, setGeneratingBio] = useState(false);
  const [aiGeneratedBio, setAiGeneratedBio] = useState(false);
  const [showRegenerateHint, setShowRegenerateHint] = useState(false);
  const prevLanguage = useRef<AppLanguage | null>(null);

  const regions = getLocalizedRegions(language);
  const educationOptions = getLocalizedEducationOptions(language);
  const professionOptions = getLocalizedProfessionOptions(language);
  const totalSteps = getOnboardingTotalSteps(platform, intent);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(basicInfoFormSchema),
    defaultValues: {
      full_name: basicInfo.full_name ?? "",
      dob: basicInfo.dob ?? "",
      city: basicInfo.city ?? "",
      district: basicInfo.district ?? "",
      village: basicInfo.village ?? "",
      region: (basicInfo.region as FormValues["region"]) ?? "garhwal",
      bio: basicInfo.bio ?? "",
      education_select: "",
      education_custom: "",
      profession_select: "",
      profession_custom: "",
    },
  });

  const educationSelect = watch("education_select");
  const professionSelect = watch("profession_select");
  const fullName = watch("full_name");
  const watched = watch();

  const hasNameForBio = (fullName?.trim().length ?? 0) >= 2;

  useEffect(() => {
    if (!hydrated) return;
    if (prevLanguage.current === null) {
      prevLanguage.current = language;
      return;
    }
    if (prevLanguage.current === language) return;
    prevLanguage.current = language;
    if (aiGeneratedBio && watched.bio?.trim()) {
      setValue("bio", "");
      setAiGeneratedBio(false);
      setShowRegenerateHint(true);
    }
  }, [language, hydrated, aiGeneratedBio, watched.bio, setValue]);

  const onSubmit = (data: FormValues) => {
    const education = resolveSelectValue(
      data.education_select ?? "",
      data.education_custom ?? "",
      (v) => getEducationLabel(language, v)
    );
    const profession = resolveSelectValue(
      data.profession_select ?? "",
      data.profession_custom ?? "",
      (v) => getProfessionLabel(language, v)
    );

    setBasicInfo({
      full_name: data.full_name,
      dob: data.dob,
      city: data.city,
      district: data.district,
      village: data.village,
      region: data.region,
      education,
      profession,
      bio: data.bio,
    });
    router.push("/onboarding/photos");
  };

  const handleGenerateBio = async () => {
    const name = String(watched.full_name ?? "").trim();
    if (name.length < 2) return;

    setGeneratingBio(true);
    try {
      await withProgress(t("generating_bio"), async () => {
        const eduSelect = String(watched.education_select ?? "");
        const eduCustom = String(watched.education_custom ?? "");
        const profSelect = String(watched.profession_select ?? "");
        const profCustom = String(watched.profession_custom ?? "");

        const education = resolveSelectValue(eduSelect, eduCustom, (v) => getEducationLabel(language, v));
        const profession = resolveSelectValue(profSelect, profCustom, (v) => getProfessionLabel(language, v));

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "bio_suggest",
            aiAnswers,
            intent: intent ?? "serious",
            fullName: name,
            education: education || undefined,
            profession: profession || undefined,
            city: watched.city,
            district: watched.district,
            region: watched.region,
            preferredLanguage: appLanguageToUserLanguage(language),
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.bio) {
            setValue("bio", json.bio, { shouldDirty: true });
            setAiGeneratedBio(true);
            setShowRegenerateHint(false);
          }
        }
      });
    } finally {
      setGeneratingBio(false);
    }
  };

  if (!hydrated) return <PageSkeleton variant="form" withHeader={false} className="min-h-dvh pb-0" />;

  return (
    <OnboardingStepShell
      backHref="/onboarding/coach"
      title={t("basic_info")}
      currentStep={4}
      totalSteps={totalSteps}
      footer={
        <Button
          type="submit"
          form="onboarding-basic-info"
          className="h-13 w-full text-[17px] font-bold shadow-[var(--shadow-glow)]"
          size="lg"
        >
          {t("continue")}
        </Button>
      }
    >
      <div className="mb-6 rounded-[6px] border border-primary/10 bg-gradient-to-br from-primary/[0.05] to-white p-4">
        <SaathiPresence message="A few details help me craft a profile that genuinely represents you." />
      </div>

      <OnboardingStepHeading title={t("basic_title")} subtitle={t("basic_subtitle")} />

      <form id="onboarding-basic-info" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label={t("full_name")} required error={errors.full_name?.message}>
          <Input {...register("full_name")} placeholder={t("full_name_ph")} />
        </FormField>

        <FormField label={t("dob")} required error={errors.dob?.message}>
          <Input {...register("dob")} type="date" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={t("city")}>
            <Input {...register("city")} placeholder={t("city_ph")} />
          </FormField>
          <FormField label={t("district")}>
            <FormSelect
              name="district"
              control={control}
              placeholder={t("select")}
              options={UTTARAKHAND_DISTRICTS.map((d) => ({ value: d, label: d }))}
            />
          </FormField>
        </div>

        <FormField label={t("village")}>
          <Input {...register("village")} placeholder={t("village_ph")} />
        </FormField>

        <FormField label={t("region")}>
          <FormSelect
            name="region"
            control={control}
            options={regions.map((r) => ({ value: r.value, label: r.label }))}
          />
        </FormField>

        <FormField
          label={t("education")}
          error={errors.education_select?.message || errors.education_custom?.message}
        >
          <FormSelect
            name="education_select"
            control={control}
            placeholder={t("select")}
            options={educationOptions.map((o) => ({ value: o.value, label: o.label }))}
          />
          {educationSelect === "other" && (
            <Input
              {...register("education_custom")}
              className="mt-2"
              placeholder={t("education_custom_ph")}
            />
          )}
        </FormField>

        <FormField
          label={t("profession")}
          error={errors.profession_select?.message || errors.profession_custom?.message}
        >
          <FormSelect
            name="profession_select"
            control={control}
            placeholder={t("select")}
            options={professionOptions.map((o) => ({ value: o.value, label: o.label }))}
          />
          {professionSelect === "other" && (
            <Input
              {...register("profession_custom")}
              className="mt-2"
              placeholder={t("profession_custom_ph")}
            />
          )}
        </FormField>

        <FormField
          label={t("bio")}
          hint={
            !hasNameForBio
              ? t("name_required_for_bio")
              : showRegenerateHint
                ? t("bio_regenerate_hint")
                : undefined
          }
        >
          <div className="mb-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateBio}
              disabled={generatingBio || !hasNameForBio}
              loading={generatingBio}
              className="h-8 gap-1.5 border-primary/25 px-2.5 text-primary hover:bg-primary/5"
            >
              {!generatingBio && <Sparkles className="h-3.5 w-3.5" />}
              <span className="text-xs font-medium">
                {generatingBio ? t("generating_bio") : t("generate_bio")}
              </span>
            </Button>
          </div>
          <Textarea
            {...register("bio")}
            key={`bio-field-${language}`}
            rows={4}
            placeholder={t("bio_ph")}
          />
        </FormField>
      </form>
    </OnboardingStepShell>
  );
}
