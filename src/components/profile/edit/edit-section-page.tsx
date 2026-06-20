"use client";

import { PageHeader } from "@/components/common/page-header";
import { useEditProfile } from "@/hooks/use-edit-profile";
import { useTranslation } from "@/hooks/use-translation";
import type { Profile } from "@/types";

export function EditSectionPage({
  title,
  children,
}: {
  title: string;
  children: (profile: Profile, patchProfile: (patch: Partial<Profile>) => void) => React.ReactNode;
}) {
  const { t, hydrated } = useTranslation();
  const { profile, loading, patchProfile } = useEditProfile();

  if (!hydrated || loading || !profile) {
    return (
      <div>
        <PageHeader showBack backHref="/profile/edit" title={title} />
        <p className="px-4 py-12 text-center text-sm text-muted-foreground animate-pulse">
          {t("loading_profile")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader showBack backHref="/profile/edit" title={title} />
      {children(profile, patchProfile)}
    </div>
  );
}
