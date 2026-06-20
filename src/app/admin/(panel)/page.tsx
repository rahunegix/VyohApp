import Link from "next/link";
import { getAdminStats } from "@/lib/admin/stats";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const { counts, recent } = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform overview — users, engagement, revenue & moderation.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Users & profiles</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
          <StatCard label="Total users" value={counts.users} hint={`${counts.activeUsers} active`} accent="primary" />
          <StatCard label="Admins" value={counts.admins} />
          <StatCard label="Profiles" value={counts.profiles} hint={`${counts.activeProfiles} active`} />
          <StatCard label="Draft" value={counts.draftProfiles} accent="warning" />
          <StatCard label="Suspended" value={counts.suspendedProfiles} accent="danger" />
          <StatCard label="Seed profiles" value={counts.seedProfiles} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Engagement</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
          <StatCard label="Matches" value={counts.matches} />
          <StatCard label="Likes" value={counts.likes} />
          <StatCard label="Chat requests" value={counts.chatRequests} />
          <StatCard label="Conversations" value={counts.conversations} />
          <StatCard label="Messages" value={counts.messages} />
          <StatCard label="Blocks" value={counts.blocks} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Revenue & trust</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
          <StatCard label="Revenue" value={`₹${counts.totalRevenue.toLocaleString("en-IN")}`} accent="success" />
          <StatCard label="Payments" value={counts.payments} hint={`${counts.completedPayments} completed`} />
          <StatCard label="Pending pay" value={counts.pendingPayments} accent="warning" />
          <StatCard label="Subscriptions" value={counts.subscriptions} hint={`${counts.activeSubscriptions} active`} />
          <StatCard label="ID verified" value={counts.verifiedIds} />
          <StatCard label="Pending ID review" value={counts.pendingVerifications} accent="warning" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Moderation</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Reports" value={counts.reports} hint={`${counts.pendingReports} pending`} accent="danger" />
          <StatCard label="Notifications" value={counts.notifications} />
          <StatCard label="Support tickets" value={counts.supportTickets} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentCard title="New users" href="/admin/users">
          {recent.users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-t border-border py-2 text-sm first:border-0">
              <span>{u.email || u.phone || u.id.slice(0, 8)}</span>
              <Badge variant="secondary">{u.role}</Badge>
            </div>
          ))}
          {!recent.users.length && <p className="text-sm text-muted-foreground">No users yet.</p>}
        </RecentCard>

        <RecentCard title="Recent payments" href="/admin/payments">
          {recent.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-t border-border py-2 text-sm first:border-0">
              <span>₹{Number(p.amount).toLocaleString("en-IN")}</span>
              <Badge variant={p.payment_status === "completed" ? "success" : "warning"}>{p.payment_status}</Badge>
            </div>
          ))}
          {!recent.payments.length && <p className="text-sm text-muted-foreground">No payments yet.</p>}
        </RecentCard>

        <RecentCard title="Recent reports" href="/admin/reports">
          {recent.reports.map((r) => (
            <div key={r.id} className="border-t border-border py-2 text-sm first:border-0">
              <p className="font-medium truncate">{r.reason}</p>
              <p className="text-xs text-muted-foreground capitalize">{r.status}</p>
            </div>
          ))}
          {!recent.reports.length && <p className="text-sm text-muted-foreground">No reports.</p>}
        </RecentCard>
      </div>

      <div className="flex flex-wrap gap-2">
        <QuickLink href="/admin/users" label="Manage users" />
        <QuickLink href="/admin/profiles" label="Manage profiles" />
        <QuickLink href="/admin/verifications" label="Review verifications" />
        <QuickLink href="/admin/subscriptions" label="Subscriptions" />
        <QuickLink href="/admin/matches" label="Matches" />
      </div>
    </div>
  );
}

function RecentCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Link href={href} className="text-xs font-semibold text-primary hover:underline">View all</Link>
      </div>
      {children}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary">
      {label}
    </Link>
  );
}
