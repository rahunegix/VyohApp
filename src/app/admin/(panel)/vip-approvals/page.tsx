import { createAdminClient } from "@/lib/supabase/admin";
import { VipApprovalsAdminPanel } from "@/components/admin/vip-approvals-admin-panel";

export default async function AdminVipApprovalsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select(
      "id, full_name, city, profession, bio, vip_approval_status, vip_details, vip_invite_code, profile_status, created_at, profile_photos(url, is_primary), users(phone, email)"
    )
    .eq("platform", "vip")
    .order("created_at", { ascending: false })
    .limit(100);

  return <VipApprovalsAdminPanel initialRows={data ?? []} />;
}
