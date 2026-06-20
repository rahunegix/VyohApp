"use client";

import { EditSectionPage } from "@/components/profile/edit/edit-section-page";
import { EditBasicInfoForm } from "@/components/profile/edit/basic-info-form";
import { useTranslation } from "@/hooks/use-translation";

export default function EditBasicInfoPage() {
  const { t } = useTranslation();
  return (
    <EditSectionPage title={t("basic_info")}>
      {(profile, patchProfile) => (
        <EditBasicInfoForm profile={profile} onSaved={patchProfile} />
      )}
    </EditSectionPage>
  );
}
