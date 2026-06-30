"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InviteRow = {
  id: string;
  code: string;
  label: string | null;
  max_uses: number;
  use_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
};

export function VipInvitesAdminPanel({ initialInvites }: { initialInvites: InviteRow[] }) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [loading, setLoading] = useState(false);

  const createInvite = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vip-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label || undefined, max_uses: Number(maxUses) || 1 }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Could not create invite");
        return;
      }
      setInvites((prev) => [json.data, ...prev]);
      setLabel("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    const res = await fetch("/api/admin/vip-invites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    const json = await res.json();
    if (json.success) {
      setInvites((prev) => prev.map((i) => (i.id === id ? json.data : i)));
    }
  };

  return (
    <>
      <AdminPageHeader
        title="VIP invite codes"
        description="Generate codes for celebrities, influencers, and invited elite members."
      />

      <div className="mb-6 rounded-2xl border border-border bg-white p-4">
        <p className="mb-3 text-sm font-semibold">Create new invite</p>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Label (e.g. Actress — Garhwal)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="Max uses"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className="w-24"
            inputMode="numeric"
          />
          <Button onClick={() => void createInvite()} disabled={loading}>
            {loading ? "Creating…" : "Generate code"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4"
          >
            <div>
              <p className="font-mono text-lg font-bold tracking-wide">{invite.code}</p>
              <p className="text-sm text-muted-foreground">
                {invite.label || "No label"} · {invite.use_count}/{invite.max_uses} used
                {invite.expires_at
                  ? ` · expires ${new Date(invite.expires_at).toLocaleDateString()}`
                  : ""}
              </p>
            </div>
            <Button
              size="sm"
              variant={invite.active ? "outline" : "default"}
              onClick={() => void toggleActive(invite.id, !invite.active)}
            >
              {invite.active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
