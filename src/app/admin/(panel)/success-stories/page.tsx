import { createAdminClient } from "@/lib/supabase/admin";
import { SuccessStoriesAdminPanel } from "@/components/admin/success-stories-admin-panel";
import type { SuccessStoryRecord } from "@/lib/success-stories/types";

export default async function AdminSuccessStoriesPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("success_stories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return <SuccessStoriesAdminPanel initialStories={(data ?? []) as SuccessStoryRecord[]} />;
}
