import { createAdminClient } from "@/lib/supabase/admin";
import { UsersAdminPanel, type AdminUserRow } from "@/components/admin/users-admin-panel";

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const { data: users } = await admin
    .from("users")
    .select("id, phone, email, role, is_active, created_at, profiles(id, full_name, profile_status, city, intent, trust_score)")
    .order("created_at", { ascending: false })
    .limit(200);

  return <UsersAdminPanel initialUsers={(users ?? []) as AdminUserRow[]} />;
}
