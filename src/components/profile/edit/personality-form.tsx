"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyProfileAnswers, updateMyProfileAnswers } from "@/services/actions";
import { getLocalizedPrompts } from "@/lib/i18n";
import { useTranslation } from "@/hooks/use-translation";
import { EditSectionShell } from "@/components/profile/edit/shared";

export function EditPersonalityForm() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const prompts = useMemo(() => getLocalizedPrompts(language), [language]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfileAnswers().then((data) => {
      setAnswers(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = await updateMyProfileAnswers(answers);
    setSaving(false);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : t("profile_save_error"));
      return;
    }
    router.push("/profile/edit");
  };

  if (loading) {
    return <p className="px-4 py-12 text-center text-sm text-muted-foreground animate-pulse">{t("loading_profile")}</p>;
  }

  return (
    <form onSubmit={handleSave}>
      <EditSectionShell error={error} saving={saving} saveLabel={t("save_changes")}>
        <p className="text-sm text-muted-foreground">{t("edit_menu_personality_desc")}</p>
        {prompts.map((prompt) => (
          <div key={prompt.key}>
            <label className="text-sm font-medium">{prompt.label}</label>
            <textarea
              value={answers[prompt.key] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [prompt.key]: e.target.value }))}
              rows={3}
              placeholder={prompt.placeholder}
              className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        ))}
      </EditSectionShell>
    </form>
  );
}
