"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";

export interface AdminPaymentRow {
  id: string;
  user_id: string;
  amount: number;
  payment_status: string;
  provider: string | null;
  provider_ref: string | null;
  created_at: string;
  subscription_plans?: { name: string } | { name: string }[] | null;
}

export function PaymentsAdminPanel({ initialPayments }: { initialPayments: AdminPaymentRow[] }) {
  const totalCompleted = initialPayments
    .filter((p) => p.payment_status === "completed")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description={`${initialPayments.length} records · ₹${totalCompleted.toLocaleString("en-IN")} completed (shown)`}
      />

      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Plan</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Provider</th>
              <th className="text-left p-3">Reference</th>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {initialPayments.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-semibold">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                <td className="p-3">{(Array.isArray(p.subscription_plans) ? p.subscription_plans[0]?.name : p.subscription_plans?.name) || "—"}</td>
                <td className="p-3">
                  <Badge variant={p.payment_status === "completed" ? "success" : p.payment_status === "pending" ? "warning" : "secondary"}>
                    {p.payment_status}
                  </Badge>
                </td>
                <td className="p-3 capitalize">{p.provider || "—"}</td>
                <td className="p-3 font-mono text-xs">{p.provider_ref?.slice(0, 16) || "—"}</td>
                <td className="p-3 font-mono text-xs">{p.user_id.slice(0, 8)}…</td>
                <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!initialPayments.length && <p className="p-6 text-sm text-muted-foreground">No payments yet.</p>}
      </div>
    </>
  );
}
