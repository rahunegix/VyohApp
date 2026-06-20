import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";

export default async function AdminSubscriptionsPage() {
  const admin = createAdminClient();
  const { data: subscriptions } = await admin
    .from("subscriptions")
    .select("id, status, started_at, ends_at, created_at, users(phone, email), subscription_plans(name, price)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <AdminPageHeader title="Subscriptions" description="Active and expired premium memberships." />

      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Plan</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Started</th>
              <th className="text-left p-3">Ends</th>
            </tr>
          </thead>
          <tbody>
            {(subscriptions ?? []).map((s) => {
              const user = Array.isArray(s.users) ? s.users[0] : s.users;
              const plan = Array.isArray(s.subscription_plans) ? s.subscription_plans[0] : s.subscription_plans;
              return (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3">{user?.email || user?.phone || "—"}</td>
                  <td className="p-3">{plan?.name || "—"} {plan?.price ? `(₹${plan.price})` : ""}</td>
                  <td className="p-3">
                    <Badge variant={s.status === "active" ? "success" : "secondary"}>{s.status}</Badge>
                  </td>
                  <td className="p-3">{s.started_at ? new Date(s.started_at).toLocaleDateString() : "—"}</td>
                  <td className="p-3">{s.ends_at ? new Date(s.ends_at).toLocaleDateString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!subscriptions?.length && <p className="p-6 text-sm text-muted-foreground">No subscriptions yet.</p>}
      </div>
    </div>
  );
}
