"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

interface SelectionChipProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}

/** Pill chip for filters, interests, tags — inspired by modern dating UI patterns. */
export function SelectionChip({ selected, onClick, label, className }: SelectionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97]",
        selected
          ? "border-primary bg-primary text-white shadow-[var(--shadow-float)]"
          : "border-primary/25 bg-white text-primary hover:border-primary/50 hover:bg-primary/5",
        className
      )}
    >
      {label}
      {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </button>
  );
}

interface SelectPillRowProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  className?: string;
}

/** Full-width pill row for onboarding / bottom sheets (gender, intent, etc.). */
export function SelectPillRow({ selected, onClick, label, description, className }: SelectPillRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-full border-2 px-5 py-4 text-left transition-all active:scale-[0.99]",
        selected
          ? "border-primary bg-primary text-white shadow-[var(--shadow-float)]"
          : "border-border/70 bg-white text-foreground hover:border-primary/30",
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-base font-bold">{label}</p>
        {description && (
          <p className={cn("mt-0.5 text-xs", selected ? "text-white/80" : "text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-white bg-white/20" : "border-border/60"
        )}
      >
        {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}
