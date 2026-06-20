import { createAdminClient } from "@/lib/supabase/admin";
import { ProfilesAdminPanel, type AdminProfileRow } from "@/components/admin/profiles-admin-panel";

export default async function AdminProfilesPage() {
  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select(
      "id, user_id, full_name, city, district, intent, gender, looking_for, region, education, profession, bio, profile_status, profile_origin, trust_score, is_chat_bot, admin_notes, created_at, users(phone, email)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return <ProfilesAdminPanel initialProfiles={(profiles ?? []) as AdminProfileRow[]} />;
}
