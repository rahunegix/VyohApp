"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AdminProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  city: string | null;
  district: string | null;
  intent: string | null;
  gender: string | null;
  looking_for: string | null;
  region: string | null;
  education: string | null;
  profession: string | null;
  bio: string | null;
  profile_status: string;
  profile_origin: string;
  trust_score: number;
  is_chat_bot: boolean;
  admin_notes: string | null;
  created_at: string;
  users?: { phone: string | null; email: string | null } | { phone: string | null; email: string | null }[] | null;
}

function getUserContact(users: AdminProfileRow["users"]) {
  const user = Array.isArray(users) ? users[0] : users;
  return { phone: user?.phone ?? null, email: user?.email ?? null };
}

export function ProfilesAdminPanel({ initialProfiles }: { initialProfiles: AdminProfileRow[] }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let rows = profiles;
    if (statusFilter !== "all") rows = rows.filter((p) => p.profile_status === statusFilter);
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => {
      const contact = getUserContact(p.users);
      return (
        p.full_name?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        contact.phone?.includes(q) ||
        contact.email?.toLowerCase().includes(q)
      );
    });
  }, [profiles, search, statusFilter]);

  const deleteProfile = async (profile: AdminProfileRow) => {
    if (!confirm(`Delete profile "${profile.full_name}" and linked user?`)) return;
    const res = await fetch(`/api/admin/profiles/${profile.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      alert(json.error || "Delete failed");
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    router.refresh();
  };

  return (
    <>
      <AdminPageHeader
        title="Profiles"
        description="Browse profiles — edit opens the full user + profile editor."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, city, contact…"
        onCreate={() => router.push("/admin/users/new")}
        createLabel="New user + profile"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "active", "draft", "hidden", "suspended"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              statusFilter === s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Profile</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">Intent</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Trust</th>
              <th className="text-left p-3">Origin</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const contact = getUserContact(p.users);
              return (
                <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                  <td className="p-3">
                    <p className="font-medium">{p.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{contact.phone || contact.email || "—"}</p>
                  </td>
                  <td className="p-3">{p.city || "—"}</td>
                  <td className="p-3 capitalize">{p.intent || "—"}</td>
                  <td className="p-3">
                    <Badge variant={p.profile_status === "active" ? "success" : "secondary"}>{p.profile_status}</Badge>
                  </td>
                  <td className="p-3">{p.trust_score}</td>
                  <td className="p-3 capitalize">{p.profile_origin}{p.is_chat_bot ? " · bot" : ""}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/users/${p.user_id}`}>
                        <Button variant="ghost" size="sm" title="Edit full profile">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProfile(p)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && <p className="p-6 text-sm text-muted-foreground">No profiles found.</p>}
      </div>
    </>
  );
}
