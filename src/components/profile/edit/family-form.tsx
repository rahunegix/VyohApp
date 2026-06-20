"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  COMMUNITY_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PROFILE_CREATED_BY_OPTIONS,
  FATHER_STATUS_OPTIONS,
  MOTHER_STATUS_OPTIONS,
  GOTRA_OPTIONS,
  MARRIAGE_TIMELINE_OPTIONS,
} from "@/lib/constants";
import { updateProfileFamily } from "@/services/actions";
import { useTranslation } from "@/hooks/use-translation";
import {
  chipClass,
  parseCount,
  ChipGroup,
  SiblingSelect,
  FieldSelect,
  ParentBlock,
  FAMILY_TYPES,
  EditSectionShell,
} from "@/components/profile/edit/shared";
import type { Profile } from "@/types";

export function EditFamilyForm({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (patch: Partial<Profile>) => void;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [familyBackground, setFamilyBackground] = useState<Record<string, string>>(
    profile.family_background ?? {}
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isMarriage = profile.intent === "marriage";

  const setFamily = (key: string, value: string) => {
    setFamilyBackground((prev) => ({ ...prev, [key]: value }));
  };

  const setBrothersCount = (v: string) => {
    setFamily("brothers_count", v);
    const married = parseCount(familyBackground.brothers_married);
    const total = parseCount(v);
    if (married > total) setFamily("brothers_married", "0");
  };

  const setSistersCount = (v: string) => {
    setFamily("sisters_count", v);
    const married = parseCount(familyBackground.sisters_married);
    const total = parseCount(v);
    if (married > total) setFamily("sisters_married", "0");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = await updateProfileFamily({ ...familyBackground, religious_preference: "hindu" });
    setSaving(false);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : t("profile_save_error"));
      return;
    }
    onSaved({ family_background: { ...familyBackground, religious_preference: "hindu" } });
    router.push("/profile/edit");
  };

  return (
    <form onSubmit={handleSave}>
      <EditSectionShell error={error} saving={saving} saveLabel={t("save_changes")}>
        {isMarriage && (
          <>
            <ChipGroup label={t("community")} options={COMMUNITY_OPTIONS} value={familyBackground.community} onSelect={(v) => setFamily("community", v)} t={t} />
            {familyBackground.community === "other" && (
              <Input value={familyBackground.community_other ?? ""} onChange={(e) => setFamily("community_other", e.target.value)} placeholder={t("community_other_ph")} />
            )}
            <ChipGroup label={t("marital_status")} options={MARITAL_STATUS_OPTIONS} value={familyBackground.marital_status} onSelect={(v) => setFamily("marital_status", v)} t={t} />
            <ChipGroup label={t("profile_created_by")} options={PROFILE_CREATED_BY_OPTIONS} value={familyBackground.profile_created_by} onSelect={(v) => setFamily("profile_created_by", v)} t={t} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SiblingSelect label={t("brothers_count")} value={familyBackground.brothers_count} onChange={setBrothersCount} t={t} />
              <SiblingSelect label={t("brothers_married")} value={familyBackground.brothers_married} onChange={(v) => setFamily("brothers_married", v)} maxOption={familyBackground.brothers_count} t={t} />
              <SiblingSelect label={t("sisters_count")} value={familyBackground.sisters_count} onChange={setSistersCount} t={t} />
              <SiblingSelect label={t("sisters_married")} value={familyBackground.sisters_married} onChange={(v) => setFamily("sisters_married", v)} maxOption={familyBackground.sisters_count} t={t} />
            </div>
            <ParentBlock
              title={t("father_details")}
              statusOptions={FATHER_STATUS_OPTIONS}
              status={familyBackground.father_status}
              onStatusChange={(v) => {
                setFamily("father_status", v);
                if (v !== "working") { setFamily("father_field", ""); setFamily("father_field_other", ""); }
                if (v !== "retired") { setFamily("father_retired_field", ""); setFamily("father_retired_field_other", ""); }
              }}
              field={familyBackground.father_field}
              fieldOther={familyBackground.father_field_other}
              onFieldChange={(v) => setFamily("father_field", v)}
              onFieldOtherChange={(v) => setFamily("father_field_other", v)}
              retiredField={familyBackground.father_retired_field}
              retiredFieldOther={familyBackground.father_retired_field_other}
              onRetiredFieldChange={(v) => setFamily("father_retired_field", v)}
              onRetiredFieldOtherChange={(v) => setFamily("father_retired_field_other", v)}
              showRetired
              t={t}
            />
            <ParentBlock
              title={t("mother_details")}
              statusOptions={MOTHER_STATUS_OPTIONS}
              status={familyBackground.mother_status}
              onStatusChange={(v) => {
                setFamily("mother_status", v);
                if (v !== "working") { setFamily("mother_field", ""); setFamily("mother_field_other", ""); }
              }}
              field={familyBackground.mother_field}
              fieldOther={familyBackground.mother_field_other}
              onFieldChange={(v) => setFamily("mother_field", v)}
              onFieldOtherChange={(v) => setFamily("mother_field_other", v)}
              t={t}
            />
            <FieldSelect label={t("gotra")} value={familyBackground.gotra} onChange={(v) => setFamily("gotra", v)} options={GOTRA_OPTIONS} t={t} />
            {familyBackground.gotra === "other" && (
              <Input value={familyBackground.gotra_other ?? ""} onChange={(e) => setFamily("gotra_other", e.target.value)} placeholder={t("gotra_other_ph")} />
            )}
            <FieldSelect label={t("marriage_timeline")} value={familyBackground.seriousness_timeline} onChange={(v) => setFamily("seriousness_timeline", v)} options={MARRIAGE_TIMELINE_OPTIONS} t={t} />
          </>
        )}
        <div>
          <label className="text-sm font-medium">{t("family_type")}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {FAMILY_TYPES.map((item) => (
              <button key={item.value} type="button" onClick={() => setFamily("family_type", item.value)} className={chipClass(familyBackground.family_type === item.value)}>
                {t(item.key)}
              </button>
            ))}
          </div>
        </div>
        {!isMarriage && (
          <div>
            <label className="text-sm font-medium">{t("community_pref")}</label>
            <Input value={familyBackground.community_preference ?? ""} onChange={(e) => setFamily("community_preference", e.target.value)} className="mt-1" placeholder={t("community_ph")} />
          </div>
        )}
      </EditSectionShell>
    </form>
  );
}
