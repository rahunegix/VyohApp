import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACCESS_COOKIE } from "@/lib/auth/api-auth";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/profiles", label: "Profiles" },
  { href: "/admin/matches", label: "Matches" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/success-stories", label: "Success stories" },
  { href: "/admin/story-submissions", label: "Story submissions" },
];

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/admin/login");

  const payload = await verifyAccessToken(token);
  if (!payload) redirect("/admin/login");

  const admin = createAdminClient();
  const { data: user } = await admin
    .from("users")
    .select("id, role, phone, email")
    .eq("id", payload.sub)
    .eq("access_token", payload.jti)
    .maybeSingle();

  if (!user || user.role !== "admin") redirect("/discover");
  return user;
}

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const adminUser = await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/20 flex">
      <aside className="w-60 shrink-0 border-r border-border bg-white p-4 flex flex-col">
        <p className="text-lg font-bold text-primary mb-0.5">Saathini Admin</p>
        <p className="text-xs text-muted-foreground mb-6 truncate">{adminUser.email || adminUser.phone}</p>
        <nav className="space-y-0.5 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <AdminLogoutButton />
        <Link href="/discover" className="mt-3 block text-sm text-muted-foreground hover:text-primary">
          ← Back to app
        </Link>
      </aside>
      <main className="flex-1 p-6 overflow-auto max-w-[1400px]">{children}</main>
    </div>
  );
}
