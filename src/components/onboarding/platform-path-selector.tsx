"use client";

import { Crown, Heart, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import { SaathiPresence } from "@/components/saathi";
import { OptionCard } from "@/components/ui/option-card";
import { SAATHI_COPY } from "@/config/ai";
import { THEME_LABELS, PLATFORM_THEME } from "@/config/theme";
import { PLATFORMS, PLATFORM_CONFIG, type Platform } from "@/lib/platform";

const ICONS = {
  dating: Heart,
  matrimony: HeartHandshake,
  vip: Crown,
} as const;

const ACCENTS: Record<Platform, "primary" | "amber" | "dark"> = {
  dating: "primary",
  matrimony: "amber",
  vip: "dark",
};

interface PlatformPathSelectorProps {
  value: Platform | null;
  onChange: (platform: Platform) => void;
}

export function PlatformPathSelector({ value, onChange }: PlatformPathSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[6px] border border-primary/10 bg-gradient-to-br from-primary/[0.06] via-white to-rose-50/40 p-4 shadow-[var(--shadow-soft)]">
        <SaathiPresence message={SAATHI_COPY.onboarding.welcome} />
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Choose your journey
        </p>
        <h2 className="mt-2 font-display text-2xl font-normal tracking-tight text-foreground">
          Three paths, one trusted home
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Spark for modern dating, Vivah for sacred marriage, Elite for invite-only VIP circles.
        </p>
      </div>

      <div className="space-y-3">
        {PLATFORMS.map((platform, i) => {
          const Icon = ICONS[platform];
          const theme = THEME_LABELS[PLATFORM_THEME[platform]];
          const config = PLATFORM_CONFIG[platform];

          return (
            <motion.div
              key={platform}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <OptionCard
                selected={value === platform}
                onClick={() => onChange(platform)}
                accent={ACCENTS[platform]}
                label={theme.name}
                description={`${config.tagline} · ${theme.emotion}`}
                icon={<Icon className="h-5 w-5" strokeWidth={2} />}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
