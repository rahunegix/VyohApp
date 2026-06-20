import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapApiUserToForms } from "@/lib/admin/map-api-user-to-forms";
import { UserProfileEditor } from "@/components/admin/user-profile-editor";
export default async function AdminEditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("users")
    .select("*, profiles(*, profile_photos(*), verification_status(*))")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const { account, profile } = mapApiUserToForms(data as Record<string, unknown>);

  return (
    <UserProfileEditor
      mode="edit"
      userId={id}
      initialAccount={account}
      initialProfile={profile}
    />
  );
}
