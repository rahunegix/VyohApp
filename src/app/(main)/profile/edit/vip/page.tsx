"use client";

import { EditSectionPage } from "@/components/profile/edit/edit-section-page";
import { EditVipForm } from "@/components/profile/edit/vip-form";

export default function EditVipPage() {
  return (
    <EditSectionPage title="VIP profile">
      {(profile, patchProfile) => (
        <EditVipForm profile={profile} onSaved={patchProfile} />
      )}
    </EditSectionPage>
  );
}
