"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VerificationRow {
  id: string;
  profile_id: string;
  document_type: string;
  status: string;
  created_at: string;
}

export function AdminVerificationActions({ request }: { request: VerificationRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (status: "verified" | "rejected") => {
    setLoading(status);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id, status }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Update failed");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  if (request.status === "verified" || request.status === "rejected") {
    return <span className="text-xs text-muted-foreground capitalize">{request.status}</span>;
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={!!loading}
        onClick={() => updateStatus("verified")}
        className="rounded-lg bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading === "verified" ? "…" : "Approve"}
      </button>
      <button
        type="button"
        disabled={!!loading}
        onClick={() => updateStatus("rejected")}
        className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading === "rejected" ? "…" : "Reject"}
      </button>
    </div>
  );
}
