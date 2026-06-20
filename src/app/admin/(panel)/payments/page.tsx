import { createAdminClient } from "@/lib/supabase/admin";
import { PaymentsAdminPanel, type AdminPaymentRow } from "@/components/admin/payments-admin-panel";

export default async function AdminPaymentsPage() {
  const admin = createAdminClient();
  const { data: payments } = await admin
    .from("payments")
    .select("id, user_id, amount, payment_status, provider, provider_ref, created_at, subscription_plans(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return <PaymentsAdminPanel initialPayments={(payments ?? []) as AdminPaymentRow[]} />;
}
