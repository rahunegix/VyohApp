import { createAdminClient } from "@/lib/supabase/admin";
import { StorySubmissionsAdminPanel } from "@/components/admin/story-submissions-admin-panel";
import type { StorySubmissionRecord } from "@/lib/success-stories/types";

export default async function AdminStorySubmissionsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("story_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <StorySubmissionsAdminPanel initialSubmissions={(data ?? []) as StorySubmissionRecord[]} />
  );
}
