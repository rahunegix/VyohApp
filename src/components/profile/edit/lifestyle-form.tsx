"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileLifestyle } from "@/services/actions";
import { useTranslation } from "@/hooks/use-translation";
import { chipClass, EditSectionShell } from "@/components/profile/edit/shared";
import type { Profile } from "@/types";

export function EditLifestyleForm({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (patch: Partial<Profile>) => void;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [lifestyle, setLifestyle] = useState<Record<string, string>>(profile.lifestyle ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const lifestyleOptions = useMemo(
    () => [
      { key: "smoking", label: t("smoking"), options: [
        { v: "never", l: t("never") }, { v: "occasionally", l: t("occasionally") }, { v: "regularly", l: t("regularly") },
      ]},
      { key: "drinking", label: t("drinking"), options: [
        { v: "never", l: t("never") }, { v: "occasionally", l: t("occasionally") }, { v: "regularly", l: t("regularly") },
      ]},
      { key: "food_preference", label: t("food"), options: [
        { v: "veg", l: t("vegetarian") }, { v: "non_veg", l: t("non_veg") }, { v: "eggetarian", l: t("eggetarian") },
      ]},
      { key: "kids_preference", label: t("kids"), options: [
        { v: "want", l: t("kids_want") }, { v: "dont_want", l: t("kids_dont") }, { v: "open", l: t("kids_open") }, { v: "have", l: t("kids_have") },
      ]},
      { key: "relocation", label: t("relocation"), options: [
        { v: "willing", l: t("relocate_willing") }, { v: "not_willing", l: t("relocate_not") }, { v: "open", l: t("relocate_open") },
      ]},
    ],
    [t]
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = await updateProfileLifestyle(lifestyle);
    setSaving(false);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : t("profile_save_error"));
      return;
    }
    onSaved({ lifestyle });
    router.push("/profile/edit");
  };

  return (
    <form onSubmit={handleSave}>
      <EditSectionShell error={error} saving={saving} saveLabel={t("save_changes")}>
        {lifestyleOptions.map((section) => (
          <div key={section.key}>
            <p className="text-sm font-medium mb-2">{section.label}</p>
            <div className="flex flex-wrap gap-2">
              {section.options.map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setLifestyle((prev) => ({ ...prev, [section.key]: opt.v }))}
                  className={chipClass(lifestyle[section.key] === opt.v)}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        ))}
      </EditSectionShell>
    </form>
  );
}
