"use client";

import { EditSectionPage } from "@/components/profile/edit/edit-section-page";
import { EditPersonalityForm } from "@/components/profile/edit/personality-form";
import { useTranslation } from "@/hooks/use-translation";

export default function EditPersonalityPage() {
  const { t } = useTranslation();
  return (
    <EditSectionPage title={t("profile_assistant")}>
      {() => <EditPersonalityForm />}
    </EditSectionPage>
  );
}
