"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "@/services/actions";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm !== "DELETE") return;
    setLoading(true);
    await deleteAccount();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/settings" title="Delete Account" subtitle="This cannot be undone" />

      <div className="mx-4 mt-4 space-y-6 px-2">
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm leading-relaxed text-destructive">
            This action is permanent. Your profile, messages, and all data will be deleted. This cannot be undone.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-muted-foreground">
            Type <strong className="text-foreground">DELETE</strong> to confirm:
          </p>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-3 rounded-[6px]"
            placeholder="DELETE"
          />

          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={loading}
            disabled={confirm !== "DELETE"}
            className="mt-4 w-full"
          >
            Delete My Account
          </Button>
        </div>
      </div>
    </div>
  );
}
