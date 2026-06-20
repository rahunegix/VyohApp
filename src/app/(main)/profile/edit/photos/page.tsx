"use client";

import { EditSectionPage } from "@/components/profile/edit/edit-section-page";
import { EditPhotosForm } from "@/components/profile/edit/photos-form";
import { useTranslation } from "@/hooks/use-translation";

export default function EditPhotosPage() {
  const { t } = useTranslation();
  return (
    <EditSectionPage title={t("add_photos")}>
      {() => <EditPhotosForm />}
    </EditSectionPage>
  );
}
