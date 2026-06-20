import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminVerificationActions } from "@/components/admin/verification-actions";

export default async function AdminVerificationsPage() {
  const admin = createAdminClient();

  const [{ data: idRequests }, { data: referenceRequests }] = await Promise.all([
    admin
      .from("id_verification_requests")
      .select("id, profile_id, document_type, status, created_at, profiles(full_name, users(phone))")
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("reference_verification_requests")
      .select("id, profile_id, reference_type, contact_name, relation, phone, status, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Verifications"
        description="Review ID documents and reference verification requests."
      />

      <section>
        <h2 className="mb-3 font-semibold">ID verification</h2>
        <div className="rounded-2xl border border-border bg-white overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Profile</th>
                <th className="text-left p-3">Document</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Submitted</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(idRequests ?? []).map((r) => {
                const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3">
                      <p className="font-medium">{profile?.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{r.profile_id.slice(0, 8)}…</p>
                    </td>
                    <td className="p-3 capitalize">{r.document_type.replace(/_/g, " ")}</td>
                    <td className="p-3 capitalize">{r.status.replace(/_/g, " ")}</td>
                    <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <AdminVerificationActions request={r} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!idRequests?.length && <p className="p-6 text-sm text-muted-foreground">No ID verification requests.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Reference verification</h2>
        <div className="rounded-2xl border border-border bg-white overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Profile</th>
                <th className="text-left p-3">Reference</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {(referenceRequests ?? []).map((r) => {
                const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3">{profile?.full_name || r.profile_id.slice(0, 8)}</td>
                    <td className="p-3">
                      {r.contact_name} · {r.relation}
                      <span className="ml-1 text-xs text-muted-foreground capitalize">({r.reference_type})</span>
                    </td>
                    <td className="p-3">{r.phone}</td>
                    <td className="p-3 capitalize">{r.status.replace(/_/g, " ")}</td>
                    <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!referenceRequests?.length && (
            <p className="p-6 text-sm text-muted-foreground">No reference verification requests.</p>
          )}
        </div>
      </section>
    </div>
  );
}
