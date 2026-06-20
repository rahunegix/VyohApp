"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import { basicInfoFormSchema } from "@/lib/validation/schemas";
import { UTTARAKHAND_DISTRICTS } from "@/lib/constants";
import {
  getLocalizedRegions,
  getLocalizedEducationOptions,
  getLocalizedProfessionOptions,
  getEducationLabel,
  getProfessionLabel,
} from "@/lib/i18n";
import { appLanguageToUserLanguage, type AppLanguage } from "@/lib/i18n/languages";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";
import { z } from "zod";

type FormValues = z.infer<typeof basicInfoFormSchema>;

const selectClass =
  "mt-1 flex h-12 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

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
  const { setBasicInfo, basicInfo, aiAnswers, intent } = useOnboardingStore();
  const { t, language, hydrated } = useTranslation();
  const [generatingBio, setGeneratingBio] = useState(false);
  const [aiGeneratedBio, setAiGeneratedBio] = useState(false);
  const [showRegenerateHint, setShowRegenerateHint] = useState(false);
  const prevLanguage = useRef<AppLanguage | null>(null);

  const regions = getLocalizedRegions(language);
  const educationOptions = getLocalizedEducationOptions(language);
  const professionOptions = getLocalizedProfessionOptions(language);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
    router.push("/onboarding/lifestyle");
  };

  const handleGenerateBio = async () => {
    const name = String(watched.full_name ?? "").trim();
    if (name.length < 2) return;

    setGeneratingBio(true);
    try {
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
    } finally {
      setGeneratingBio(false);
    }
  };

  if (!hydrated) return null;

  return (
    <OnboardingStepShell
      backHref="/onboarding/verification"
      title={t("basic_info")}
      currentStep={5}
      footer={
        <Button type="submit" form="onboarding-basic-info" className="h-13 w-full rounded-2xl text-[17px] font-bold shadow-lg" size="lg">
          {t("continue")}
        </Button>
      }
    >
      <OnboardingStepHeading title={t("basic_title")} subtitle={t("basic_subtitle")} />

      <form id="onboarding-basic-info" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("full_name")}</label>
            <Input {...register("full_name")} className="mt-1" placeholder={t("full_name_ph")} />
            {errors.full_name && <p className="mt-1 text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">{t("dob")}</label>
            <Input {...register("dob")} type="date" className="mt-1" />
            {errors.dob && <p className="mt-1 text-sm text-destructive">{errors.dob.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t("city")}</label>
              <Input {...register("city")} className="mt-1" placeholder={t("city_ph")} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("district")}</label>
              <select {...register("district")} className={selectClass}>
                <option value="">{t("select")}</option>
                {UTTARAKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{t("village")}</label>
            <Input {...register("village")} className="mt-1" placeholder={t("village_ph")} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("region")}</label>
            <select {...register("region")} className={selectClass}>
              {regions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">{t("education")}</label>
            <select {...register("education_select")} className={selectClass}>
              <option value="">{t("select")}</option>
              {educationOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {educationSelect === "other" && (
              <Input
                {...register("education_custom")}
                className="mt-2"
                placeholder={t("education_custom_ph")}
              />
            )}
            {errors.education_select && (
              <p className="mt-1 text-sm text-destructive">{errors.education_select.message}</p>
            )}
            {errors.education_custom && (
              <p className="mt-1 text-sm text-destructive">{errors.education_custom.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">{t("profession")}</label>
            <select {...register("profession_select")} className={selectClass}>
              <option value="">{t("select")}</option>
              {professionOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {professionSelect === "other" && (
              <Input
                {...register("profession_custom")}
                className="mt-2"
                placeholder={t("profession_custom_ph")}
              />
            )}
            {errors.profession_select && (
              <p className="mt-1 text-sm text-destructive">{errors.profession_select.message}</p>
            )}
            {errors.profession_custom && (
              <p className="mt-1 text-sm text-destructive">{errors.profession_custom.message}</p>
            )}
          </div>
          <div key={language}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-sm font-medium">{t("bio")}</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateBio}
                disabled={generatingBio || !hasNameForBio}
                loading={generatingBio}
                className="h-8 shrink-0 gap-1.5 border-primary/25 px-2.5 text-primary hover:bg-primary/5"
              >
                {!generatingBio && <Sparkles className="h-3.5 w-3.5" />}
                <span className="text-xs font-medium">
                  {generatingBio ? t("generating_bio") : t("generate_bio")}
                </span>
              </Button>
            </div>

            <textarea
              {...register("bio")}
              key={`bio-field-${language}`}
              rows={3}
              placeholder={t("bio_ph")}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {!hasNameForBio && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">{t("name_required_for_bio")}</p>
            )}
            {showRegenerateHint && hasNameForBio && (
              <p className="mt-1.5 text-[11px] text-primary">{t("bio_regenerate_hint")}</p>
            )}
          </div>
      </form>
    </OnboardingStepShell>
  );
}
