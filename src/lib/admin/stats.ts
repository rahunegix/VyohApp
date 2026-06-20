import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminStats() {
  const admin = createAdminClient();

  const [
    users,
    activeUsers,
    admins,
    profiles,
    activeProfiles,
    draftProfiles,
    suspendedProfiles,
    seedProfiles,
    matches,
    likes,
    chatRequests,
    conversations,
    messages,
    payments,
    completedPayments,
    pendingPayments,
    revenue,
    subscriptions,
    activeSubscriptions,
    reports,
    pendingReports,
    pendingVerifications,
    verifiedIds,
    blocks,
    notifications,
    supportTickets,
    recentUsers,
    recentPayments,
    recentReports,
  ] = await Promise.all([
    admin.from("users").select("id", { count: "exact", head: true }),
    admin.from("users").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("users").select("id", { count: "exact", head: true }).eq("role", "admin"),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("profile_status", "active"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("profile_status", "draft"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("profile_status", "suspended"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("profile_origin", "seed"),
    admin.from("matches").select("id", { count: "exact", head: true }),
    admin.from("likes").select("id", { count: "exact", head: true }),
    admin.from("chat_requests").select("id", { count: "exact", head: true }),
    admin.from("conversations").select("id", { count: "exact", head: true }),
    admin.from("messages").select("id", { count: "exact", head: true }),
    admin.from("payments").select("id", { count: "exact", head: true }),
    admin.from("payments").select("id", { count: "exact", head: true }).eq("payment_status", "completed"),
    admin.from("payments").select("id", { count: "exact", head: true }).eq("payment_status", "pending"),
    admin.from("payments").select("amount").eq("payment_status", "completed"),
    admin.from("subscriptions").select("id", { count: "exact", head: true }),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("reports").select("id", { count: "exact", head: true }),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("id_verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    admin.from("verification_status").select("id", { count: "exact", head: true }).eq("id_verified", true),
    admin.from("blocks").select("id", { count: "exact", head: true }),
    admin.from("notifications").select("id", { count: "exact", head: true }),
    admin.from("support_tickets").select("id", { count: "exact", head: true }),
    admin.from("users").select("id, phone, email, role, created_at").order("created_at", { ascending: false }).limit(5),
    admin
      .from("payments")
      .select("id, amount, payment_status, provider, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("reports")
      .select("id, reason, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (revenue.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return {
    counts: {
      users: users.count ?? 0,
      activeUsers: activeUsers.count ?? 0,
      admins: admins.count ?? 0,
      profiles: profiles.count ?? 0,
      activeProfiles: activeProfiles.count ?? 0,
      draftProfiles: draftProfiles.count ?? 0,
      suspendedProfiles: suspendedProfiles.count ?? 0,
      seedProfiles: seedProfiles.count ?? 0,
      matches: matches.count ?? 0,
      likes: likes.count ?? 0,
      chatRequests: chatRequests.count ?? 0,
      conversations: conversations.count ?? 0,
      messages: messages.count ?? 0,
      payments: payments.count ?? 0,
      completedPayments: completedPayments.count ?? 0,
      pendingPayments: pendingPayments.count ?? 0,
      totalRevenue,
      subscriptions: subscriptions.count ?? 0,
      activeSubscriptions: activeSubscriptions.count ?? 0,
      reports: reports.count ?? 0,
      pendingReports: pendingReports.count ?? 0,
      pendingVerifications: pendingVerifications.count ?? 0,
      verifiedIds: verifiedIds.count ?? 0,
      blocks: blocks.count ?? 0,
      notifications: notifications.count ?? 0,
      supportTickets: supportTickets.count ?? 0,
    },
    recent: {
      users: recentUsers.data ?? [],
      payments: recentPayments.data ?? [],
      reports: recentReports.data ?? [],
    },
  };
}
