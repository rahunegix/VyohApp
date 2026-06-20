"use client";

import { EditSectionPage } from "@/components/profile/edit/edit-section-page";
import { EditLifestyleForm } from "@/components/profile/edit/lifestyle-form";
import { useTranslation } from "@/hooks/use-translation";

export default function EditLifestylePage() {
  const { t } = useTranslation();
  return (
    <EditSectionPage title={t("lifestyle")}>
      {(profile, patchProfile) => (
        <EditLifestyleForm profile={profile} onSaved={patchProfile} />
      )}
    </EditSectionPage>
  );
}
