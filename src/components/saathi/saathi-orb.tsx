"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/helpers/utils";

interface SaathiOrbProps {
  className?: string;
}

export function SaathiOrb({ className }: SaathiOrbProps) {
  const setOpen = useUIStore((s) => s.setSaathiSheetOpen);

  return (
    <motion.button
      type="button"
      onClick={() => setOpen(true)}
      whileTap={{ scale: 0.92 }}
      className={cn(
        "fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-[6px] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg ring-4 ring-primary/20 lg:bottom-8",
        className
      )}
      aria-label="Ask Saathi"
    >
      <Sparkles className="h-6 w-6" />
      <span className="absolute inset-0 animate-ping rounded-[6px] bg-primary/30 opacity-40" />
    </motion.button>
  );
}
