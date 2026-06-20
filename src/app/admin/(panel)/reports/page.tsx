import { createAdminClient } from "@/lib/supabase/admin";
import { ReportsAdminPanel, type AdminReportRow } from "@/components/admin/reports-admin-panel";

export default async function AdminReportsPage() {
  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("reports")
    .select("id, reason, details, status, created_at, reporter_profile_id, reported_profile_id")
    .order("created_at", { ascending: false })
    .limit(100);

  return <ReportsAdminPanel initialReports={(reports ?? []) as AdminReportRow[]} />;
}
