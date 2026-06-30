"use client";

import { motion } from "framer-motion";
import { Heart, HeartHandshake, Crown } from "lucide-react";
import { THEME_LABELS } from "@/config/theme";
import { RADIUS } from "@/design/tokens";

const PLATFORMS: Array<{
  id: keyof typeof THEME_LABELS;
  icon: typeof Heart;
  gradient: string;
  ring: string;
  iconColor: string;
  dark?: boolean;
}> = [
  {
    id: "spark",
    icon: Heart,
    gradient: "from-rose-500/20 via-fuchsia-500/10 to-orange-400/10",
    ring: "ring-rose-500/30",
    iconColor: "text-rose-500",
  },
  {
    id: "vivah",
    icon: HeartHandshake,
    gradient: "from-amber-500/20 via-yellow-500/10 to-orange-600/10",
    ring: "ring-amber-500/30",
    iconColor: "text-amber-600",
  },
  {
    id: "elite",
    icon: Crown,
    gradient: "from-zinc-900 via-zinc-800 to-amber-900/40",
    ring: "ring-amber-400/40",
    iconColor: "text-amber-400",
    dark: true,
  },
] as const;

export function PlatformShowcase({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Choose your journey
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {PLATFORMS.map((p, i) => {
          const meta = THEME_LABELS[p.id];
          const Icon = p.icon;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className={`relative overflow-hidden border bg-gradient-to-br p-5 ring-1 ${p.gradient} ${p.ring} ${p.dark ? "text-white" : ""}`}
              style={{ borderRadius: RADIUS.card }}
            >
              <div
                className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ${p.dark ? "bg-white/10" : ""}`}
              >
                <Icon className={`h-5 w-5 ${p.iconColor}`} />
              </div>
              <h3 className={`font-display text-xl ${p.dark ? "text-white" : "text-foreground"}`}>
                {meta.name}
              </h3>
              <p className={`mt-1 text-xs ${p.dark ? "text-white/70" : "text-muted-foreground"}`}>
                {meta.emotion}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
