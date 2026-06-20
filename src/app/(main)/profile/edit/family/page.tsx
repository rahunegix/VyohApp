"use client";

import { EditSectionPage } from "@/components/profile/edit/edit-section-page";
import { EditFamilyForm } from "@/components/profile/edit/family-form";
import { useTranslation } from "@/hooks/use-translation";

export default function EditFamilyPage() {
  const { t } = useTranslation();
  return (
    <EditSectionPage title={t("family_bg")}>
      {(profile, patchProfile) => (
        <EditFamilyForm profile={profile} onSaved={patchProfile} />
      )}
    </EditSectionPage>
  );
}
