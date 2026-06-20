import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";

export default async function AdminMatchesPage() {
  const admin = createAdminClient();

  const [{ data: matches }, { count: likesCount }, { count: chatReqCount }] = await Promise.all([
    admin.from("matches").select("id, matched_at, match_status, profile_a_id, profile_b_id").order("matched_at", { ascending: false }).limit(100),
    admin.from("likes").select("id", { count: "exact", head: true }),
    admin.from("chat_requests").select("id", { count: "exact", head: true }),
  ]);

  const profileIds = [...new Set((matches ?? []).flatMap((m) => [m.profile_a_id, m.profile_b_id]))];
  const { data: profiles } = profileIds.length
    ? await admin.from("profiles").select("id, full_name, city").in("id", profileIds)
    : { data: [] as { id: string; full_name: string; city: string | null }[] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <AdminPageHeader
        title="Matches & interest"
        description={`${matches?.length ?? 0} matches · ${likesCount ?? 0} likes · ${chatReqCount ?? 0} chat requests`}
      />

      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Profile A</th>
              <th className="text-left p-3">Profile B</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Matched</th>
            </tr>
          </thead>
          <tbody>
            {(matches ?? []).map((m) => {
              const a = profileMap.get(m.profile_a_id);
              const b = profileMap.get(m.profile_b_id);
              return (
                <tr key={m.id} className="border-t border-border">
                  <td className="p-3">
                    <p className="font-medium">{a?.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{a?.city || ""}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{b?.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{b?.city || ""}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant={m.match_status === "active" ? "success" : "secondary"}>{m.match_status}</Badge>
                  </td>
                  <td className="p-3">{new Date(m.matched_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!matches?.length && <p className="p-6 text-sm text-muted-foreground">No matches yet.</p>}
      </div>
    </div>
  );
}
