"use client";

import { PageHeader } from "@/components/common/page-header";
import { EditProfileMenu } from "@/components/profile/edit/edit-menu";
import { useEditProfile } from "@/hooks/use-edit-profile";
import { useTranslation } from "@/hooks/use-translation";

export default function EditProfilePage() {
  const { t, hydrated } = useTranslation();
  const { profile, loading } = useEditProfile();

  if (!hydrated || loading || !profile) {
    return (
      <div>
        <PageHeader showBack backHref="/profile" title={t("edit_profile")} />
        <p className="px-4 py-12 text-center text-sm text-muted-foreground animate-pulse">
          {t("loading_profile")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader showBack backHref="/profile" title={t("edit_profile")} />
      <EditProfileMenu profile={profile} />
    </div>
  );
}
