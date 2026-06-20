"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { basicInfoFormSchema } from "@/lib/validation/schemas";
import { UTTARAKHAND_DISTRICTS } from "@/lib/constants";
import {
  getLocalizedRegions,
  getLocalizedEducationOptions,
  getLocalizedProfessionOptions,
  getEducationLabel,
  getProfessionLabel,
} from "@/lib/i18n";
import { appLanguageToUserLanguage } from "@/lib/i18n/languages";
import { educationToFormFields, professionToFormFields, resolveSelectValue } from "@/lib/profile/form-helpers";
import { updateProfileBasicInfo } from "@/services/actions";
import { useTranslation } from "@/hooks/use-translation";
import { selectClass, EditSectionShell } from "@/components/profile/edit/shared";
import type { Profile } from "@/types";

type FormValues = z.infer<typeof basicInfoFormSchema>;

export function EditBasicInfoForm({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (patch: Partial<Profile>) => void;
}) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);

  const edu = educationToFormFields(profile.education, language);
  const prof = professionToFormFields(profile.profession, language);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(basicInfoFormSchema),
    defaultValues: {
      full_name: profile.full_name,
      dob: profile.dob,
      city: profile.city ?? "",
      district: profile.district ?? "",
      village: profile.village ?? "",
      region: (profile.region === "kumaon" ? "kumaon" : "garhwal") as FormValues["region"],
      bio: profile.bio ?? "",
      education_select: edu.education_select,
      education_custom: edu.education_custom,
      profession_select: prof.profession_select,
      profession_custom: prof.profession_custom,
    },
  });

  const educationSelect = watch("education_select");
  const professionSelect = watch("profession_select");
  const watched = watch();

  const handleGenerateBio = async () => {
    const name = String(watched.full_name ?? "").trim();
    if (name.length < 2) return;
    setGeneratingBio(true);
    try {
      const education = resolveSelectValue(
        String(watched.education_select ?? ""),
        String(watched.education_custom ?? ""),
        (v) => getEducationLabel(language, v)
      );
      const profession = resolveSelectValue(
        String(watched.profession_select ?? ""),
        String(watched.profession_custom ?? ""),
        (v) => getProfessionLabel(language, v)
      );
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bio_suggest",
          aiAnswers: {},
          intent: profile.intent,
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
        if (json.bio) setValue("bio", json.bio, { shouldDirty: true });
      }
    } finally {
      setGeneratingBio(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setError("");
    const education = resolveSelectValue(data.education_select, data.education_custom ?? "", (v) =>
      getEducationLabel(language, v)
    );
    const profession = resolveSelectValue(data.profession_select, data.profession_custom ?? "", (v) =>
      getProfessionLabel(language, v)
    );
    const result = await updateProfileBasicInfo({ ...data, education, profession });
    setSaving(false);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : t("profile_save_error"));
      return;
    }
    onSaved({
      full_name: data.full_name,
      dob: data.dob,
      city: data.city,
      district: data.district,
      village: data.village ?? null,
      region: data.region,
      education,
      profession,
      bio: data.bio ?? null,
    });
    router.push("/profile/edit");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <EditSectionShell error={error} saving={saving} saveLabel={t("save_changes")}>
        <div>
          <label className="text-sm font-medium">{t("full_name")}</label>
          <Input {...register("full_name")} className="mt-1" />
          {errors.full_name && <p className="mt-1 text-sm text-destructive">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">{t("dob")}</label>
          <Input {...register("dob")} type="date" className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">{t("city")}</label>
            <Input {...register("city")} className="mt-1" />
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
          <Input {...register("village")} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">{t("region")}</label>
          <select {...register("region")} className={selectClass}>
            {getLocalizedRegions(language).map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">{t("education")}</label>
          <select {...register("education_select")} className={selectClass}>
            <option value="">{t("select")}</option>
            {getLocalizedEducationOptions(language).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {educationSelect === "other" && (
            <Input {...register("education_custom")} className="mt-2" placeholder={t("education_custom_ph")} />
          )}
        </div>
        <div>
          <label className="text-sm font-medium">{t("profession")}</label>
          <select {...register("profession_select")} className={selectClass}>
            <option value="">{t("select")}</option>
            {getLocalizedProfessionOptions(language).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {professionSelect === "other" && (
            <Input {...register("profession_custom")} className="mt-2" placeholder={t("profession_custom_ph")} />
          )}
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="text-sm font-medium">{t("bio")}</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateBio}
              disabled={generatingBio}
              loading={generatingBio}
              className="h-8 gap-1.5 border-primary/25 px-2.5 text-primary"
            >
              {!generatingBio && <Sparkles className="h-3.5 w-3.5" />}
              <span className="text-xs">{generatingBio ? t("generating_bio") : t("generate_bio")}</span>
            </Button>
          </div>
          <textarea
            {...register("bio")}
            rows={3}
            placeholder={t("bio_ph")}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </EditSectionShell>
    </form>
  );
}
