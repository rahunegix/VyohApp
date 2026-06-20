"use client";

import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface AdminReportRow {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter_profile_id: string;
  reported_profile_id: string;
}

export function ReportsAdminPanel({ initialReports }: { initialReports: AdminReportRow[] }) {
  const router = useRouter();

  const updateStatus = async (id: string, status: AdminReportRow["status"]) => {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) {
      alert(json.error || "Update failed");
      return;
    }
    router.refresh();
  };

  const deleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    const res = await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) alert(json.error || "Delete failed");
    else router.refresh();
  };

  return (
    <>
      <AdminPageHeader title="Reports" description="Review and resolve user safety reports." />

      <div className="space-y-3">
        {initialReports.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{r.reason}</p>
                {r.details && <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  Reporter: {r.reporter_profile_id.slice(0, 8)}… · Reported: {r.reported_profile_id.slice(0, 8)}… ·{" "}
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <Badge variant={r.status === "pending" ? "warning" : "secondary"}>{r.status}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["reviewed", "resolved", "dismissed"] as const).map((status) => (
                <Button key={status} size="sm" variant="outline" onClick={() => updateStatus(r.id, status)}>
                  Mark {status}
                </Button>
              ))}
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteReport(r.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {!initialReports.length && <p className="text-sm text-muted-foreground">No reports.</p>}
      </div>
    </>
  );
}
