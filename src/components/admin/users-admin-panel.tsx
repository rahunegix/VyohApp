"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AdminUserRow {
  id: string;
  phone: string | null;
  email: string | null;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    profile_status: string;
    city?: string | null;
    intent?: string | null;
    trust_score?: number;
  } | {
    id: string;
    full_name: string;
    profile_status: string;
    city?: string | null;
    intent?: string | null;
    trust_score?: number;
  }[] | null;
}

function getProfile(user: AdminUserRow) {
  if (!user.profiles) return null;
  return Array.isArray(user.profiles) ? user.profiles[0] : user.profiles;
}

export function UsersAdminPanel({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.phone?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        getProfile(u)?.full_name?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const deleteUser = async (user: AdminUserRow) => {
    if (!confirm(`Delete user ${user.email || user.phone}? This removes their profile and data.`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      alert(json.error || "Delete failed");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    router.refresh();
  };

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Full account + profile editor with every field shown in the app."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search phone, email, name…"
        onCreate={() => router.push("/admin/users/new")}
        createLabel="New user"
      />

      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Profile</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Joined</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const profile = getProfile(u);
              return (
                <tr key={u.id} className="border-t border-border hover:bg-muted/20">
                  <td className="p-3">
                    <p className="font-medium">{u.email || "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.phone || "No phone"}</p>
                  </td>
                  <td className="p-3">
                    <p>{profile?.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {profile?.profile_status || "none"}
                      {profile?.city ? ` · ${profile.city}` : ""}
                    </p>
                  </td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">
                    <Badge variant={u.is_active ? "default" : "secondary"}>
                      {u.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </td>
                  <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/users/${u.id}`}>
                        <Button variant="ghost" size="sm" title="Edit full profile">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteUser(u)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && <p className="p-6 text-sm text-muted-foreground">No users found.</p>}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Tip: use the edit button to open the full tabbed editor (account, matching, lifestyle, family, photos, trust, scores).
      </p>
    </>
  );
}
