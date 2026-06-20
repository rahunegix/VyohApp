"use client";

import { cn } from "@/lib/helpers/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: "primary" | "success" | "warning";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  color = "primary",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("space-y-1", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            color === "primary" && "bg-primary",
            color === "success" && "bg-success",
            color === "warning" && "bg-warning"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground text-right">{Math.round(pct)}%</p>
      )}
    </div>
  );
}
