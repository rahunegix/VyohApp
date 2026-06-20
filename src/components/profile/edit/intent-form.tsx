"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Gem } from "lucide-react";
import { SelectCard } from "@/components/common/step-indicator";
import { LOOKING_FOR } from "@/lib/constants";
import { getLocalizedIntents } from "@/lib/i18n";
import { updateProfileIntentMatching } from "@/services/actions";
import { useTranslation } from "@/hooks/use-translation";
import { EditSectionShell, selectClass } from "@/components/profile/edit/shared";
import type { Profile } from "@/types";

const icons = {
  serious: <Heart className="h-5 w-5" />,
  marriage: <Gem className="h-5 w-5" />,
} as const;

export function EditIntentForm({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (patch: Partial<Profile>) => void;
}) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [intent, setIntent] = useState(profile.intent);
  const [lookingFor, setLookingFor] = useState(profile.looking_for);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const intents = getLocalizedIntents(language);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = await updateProfileIntentMatching({ intent, looking_for: lookingFor });
    setSaving(false);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : t("profile_save_error"));
      return;
    }
    onSaved({ intent, looking_for: lookingFor });
    router.push("/profile/edit");
  };

  return (
    <form onSubmit={handleSave}>
      <EditSectionShell error={error} saving={saving} saveLabel={t("save_changes")}>
        <div>
          <label className="text-sm font-medium">{t("intent_label")}</label>
          <div className="mt-3 space-y-2">
            {intents.map((i) => (
              <SelectCard
                key={i.value}
                selected={intent === i.value}
                onClick={() => setIntent(i.value)}
                title={i.label}
                description={i.description}
                icon={icons[i.value as keyof typeof icons]}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">{t("looking_for_label")}</label>
          <select
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value as Profile["looking_for"])}
            className={selectClass}
          >
            {LOOKING_FOR.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </EditSectionShell>
    </form>
  );
}
