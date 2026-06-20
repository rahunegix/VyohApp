"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

export function AuthBackButton({
  href,
  className,
  dark = false,
}: {
  href?: string;
  className?: string;
  dark?: boolean;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label="Go back"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95",
        dark
          ? "bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20"
          : "bg-white shadow-sm border border-border hover:bg-muted/50",
        className
      )}
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
