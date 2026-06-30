import { createAdminClient } from "@/lib/supabase/admin";
import { VipInvitesAdminPanel } from "@/components/admin/vip-invites-admin-panel";

export default async function AdminVipInvitesPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("vip_invite_codes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return <VipInvitesAdminPanel initialInvites={data ?? []} />;
}
