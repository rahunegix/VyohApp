"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/helpers/utils";
import { SAATHI_NAME } from "@/config/ai";

interface SaathiPresenceProps {
  message?: string;
  compact?: boolean;
  className?: string;
}

export function SaathiPresence({ message, compact, className }: SaathiPresenceProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-2 ring-primary/20",
          compact ? "h-10 w-10" : "h-12 w-12"
        )}
      >
        <Sparkles className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{SAATHI_NAME}</p>
        {message && (
          <p className={cn("mt-1 text-foreground", compact ? "text-sm" : "text-[15px] leading-relaxed")}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
