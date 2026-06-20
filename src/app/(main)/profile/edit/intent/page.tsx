"use client";

import { EditSectionPage } from "@/components/profile/edit/edit-section-page";
import { EditIntentForm } from "@/components/profile/edit/intent-form";
import { useTranslation } from "@/hooks/use-translation";

export default function EditIntentPage() {
  const { t } = useTranslation();
  return (
    <EditSectionPage title={t("edit_menu_intent")}>
      {(profile, patchProfile) => (
        <EditIntentForm profile={profile} onSaved={patchProfile} />
      )}
    </EditSectionPage>
  );
}
