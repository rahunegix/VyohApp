"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    router.push("/welcome");
  };

  return (
    <div>
      <PageHeader showBack backHref="/settings" title="Delete Account" />

      <div className="px-6 py-6">
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          This action is permanent. Your profile, messages, and all data will be deleted. This cannot be undone.
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Type <strong>DELETE</strong> to confirm:
        </p>
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-2"
          placeholder="DELETE"
        />

        <Button
          variant="destructive"
          onClick={handleDelete}
          loading={loading}
          disabled={confirm !== "DELETE"}
          className="mt-6 w-full"
        >
          Delete My Account
        </Button>
      </div>
    </div>
  );
}
