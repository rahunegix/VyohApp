"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/helpers/utils";
import { RADIUS } from "@/design/tokens";

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  accent?: "primary" | "amber" | "dark";
  className?: string;
}

const ACCENT_STYLES = {
  primary: {
    selected: "border-primary bg-gradient-to-br from-primary/12 via-primary/6 to-transparent ring-2 ring-primary/25 shadow-[var(--shadow-glow)]",
    icon: "bg-primary/15 text-primary",
    check: "border-primary bg-primary text-white",
  },
  amber: {
    selected: "border-amber-500 bg-gradient-to-br from-amber-500/12 via-amber-400/6 to-transparent ring-2 ring-amber-500/25",
    icon: "bg-amber-500/15 text-amber-600",
    check: "border-amber-500 bg-amber-600 text-white",
  },
  dark: {
    selected: "border-amber-400/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/40 ring-2 ring-amber-400/30 text-white",
    icon: "bg-amber-400/15 text-amber-300",
    check: "border-amber-400 bg-amber-400 text-zinc-900",
  },
} as const;

export function OptionCard({
  selected,
  onClick,
  label,
  description,
  icon,
  accent = "primary",
  className,
}: OptionCardProps) {
  const styles = ACCENT_STYLES[accent];
  const isDark = accent === "dark" && selected;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group relative flex w-full items-start gap-4 border border-border/70 bg-white p-4 text-left shadow-sm transition-all duration-200",
        "hover:border-primary/25 hover:shadow-[var(--shadow-soft)]",
        selected && styles.selected,
        className
      )}
      style={{ borderRadius: RADIUS.card }}
    >
      {icon && (
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] transition-colors",
            selected ? styles.icon : "bg-muted/80 text-muted-foreground group-hover:bg-primary/8 group-hover:text-primary"
          )}
        >
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1 pt-0.5">
        <p className={cn("text-base font-bold tracking-tight", isDark ? "text-white" : "text-foreground")}>
          {label}
        </p>
        {description && (
          <p
            className={cn(
              "mt-1 text-sm leading-snug",
              isDark ? "text-white/70" : selected ? "text-foreground/75" : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        )}
      </div>

      <div
        className={cn(
          "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2 transition-all",
          selected ? styles.check : "border-border/60 bg-background"
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </div>
    </motion.button>
  );
}
