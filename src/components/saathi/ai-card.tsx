"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/helpers/utils";
import { Button } from "@/components/ui/button";
import { MOTION, RADIUS } from "@/design/tokens";

export type AiCardVariant =
  | "insight"
  | "tip"
  | "starter"
  | "improve"
  | "safety"
  | "daily"
  | "pick";

interface AiCardProps {
  variant?: AiCardVariant;
  title?: string;
  body: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const variantStyles: Record<AiCardVariant, string> = {
  insight: "border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3",
  tip: "border-amber-500/20 bg-gradient-to-br from-amber-500/8 to-amber-500/3",
  starter: "border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-violet-500/3",
  improve: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-emerald-500/3",
  safety: "border-orange-500/20 bg-gradient-to-br from-orange-500/8 to-orange-500/3",
  daily: "border-primary/25 bg-gradient-to-br from-primary/10 via-white to-primary/5",
  pick: "border-primary/30 bg-gradient-to-br from-primary/12 to-transparent",
};

export function AiCard({ variant = "insight", title, body, action, className }: AiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.normal / 1000 }}
      className={cn(
        "relative overflow-hidden border p-4 backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
      style={{ borderRadius: RADIUS.card }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          {title && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{title}</p>
          )}
          <p className={cn("text-sm leading-relaxed text-foreground", title && "mt-1")}>{body}</p>
          {action && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 h-8 px-0 text-primary hover:bg-transparent hover:text-primary/80"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
