import type { Platform } from "@/lib/platform";

/** Part 7 platform theme keys */
export type ThemeVariant = "spark" | "vivah" | "elite";

export const PLATFORM_THEME: Record<Platform, ThemeVariant> = {
  dating: "spark",
  matrimony: "vivah",
  vip: "elite",
};

export const THEME_LABELS: Record<ThemeVariant, { name: string; emotion: string }> = {
  spark: { name: "Spark", emotion: "Romantic · Warm · Hopeful" },
  vivah: { name: "Vivah", emotion: "Trust · Sacred · Family" },
  elite: { name: "Elite", emotion: "Luxury · Private · Power" },
};
