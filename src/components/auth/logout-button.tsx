"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/phone";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/helpers/utils";

interface LogoutButtonProps {
  variant?: "button" | "menu";
  className?: string;
}

export function LogoutButton({ variant = "button", className }: LogoutButtonProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      logout();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-destructive/5 active:bg-destructive/10 disabled:opacity-50",
          className
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-destructive/10 text-destructive">
          <LogOut className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-destructive">{loading ? "Signing out…" : "Log out"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Sign out on this device</p>
        </div>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      loading={loading}
      onClick={handleLogout}
      className={cn("w-full border-destructive/30 text-destructive hover:bg-destructive/5", className)}
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out…" : "Log out"}
    </Button>
  );
}
