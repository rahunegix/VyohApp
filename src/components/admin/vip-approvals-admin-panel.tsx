"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VIP_PROFESSION_TIERS } from "@/lib/vip/constants";

type VipProfileRow = {
  id: string;
  full_name: string;
  city: string | null;
  profession: string | null;
  bio: string | null;
  vip_approval_status: string | null;
  vip_details: Record<string, unknown> | null;
  vip_invite_code: string | null;
  profile_status: string;
  created_at: string;
  profile_photos?: Array<{ url: string; is_primary: boolean }>;
  users?: { phone?: string; email?: string } | Array<{ phone?: string; email?: string }>;
};

function tierLabel(value?: string) {
  return VIP_PROFESSION_TIERS.find((t) => t.value === value)?.label ?? value ?? "—";
}

export function VipApprovalsAdminPanel({ initialRows }: { initialRows: VipProfileRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [filter, setFilter] = useState("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.vip_approval_status === filter);
  }, [rows, filter]);

  const updateStatus = async (profileId: string, status: "approved" | "rejected") => {
    setLoadingId(profileId);
    try {
      const res = await fetch("/api/admin/vip-approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, status }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Update failed");
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === profileId ? { ...r, ...json.data } : r)));
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="VIP approvals"
        description="Review elite member profiles before they appear in the VIP circle."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-[6px] px-3 py-1 text-xs font-semibold capitalize ${
              filter === s ? "bg-zinc-900 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((row) => {
          const user = Array.isArray(row.users) ? row.users[0] : row.users;
          const details = row.vip_details ?? {};
          const photo = row.profile_photos?.find((p) => p.is_primary)?.url ?? row.profile_photos?.[0]?.url;
          return (
            <div key={row.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap gap-4">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold">{row.full_name}</p>
                    <Badge variant="outline">{row.vip_approval_status ?? "pending"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[row.city, row.profession].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {user?.phone || user?.email || "—"} · Invite: {row.vip_invite_code || "—"}
                  </p>
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Tier:</span>{" "}
                    {tierLabel(String(details.profession_tier ?? ""))}
                    {details.public_role ? ` · ${String(details.public_role)}` : ""}
                    {details.company ? ` · ${String(details.company)}` : ""}
                  </p>
                  {row.bio ? <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{row.bio}</p> : null}
                </div>
              </div>

              {row.vip_approval_status === "pending" ? (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1 bg-zinc-900 hover:bg-zinc-800"
                    disabled={loadingId === row.id}
                    onClick={() => void updateStatus(row.id, "approved")}
                  >
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={loadingId === row.id}
                    onClick={() => void updateStatus(row.id, "rejected")}
                  >
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No VIP profiles in this filter.</p>
        ) : null}
      </div>
    </>
  );
}
