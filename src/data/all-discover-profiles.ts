import { DEMO_PROFILES } from "@/services/demo-data";
import { SEED_AI_PROFILES } from "@/data/seed-ai-profiles";
import type { DiscoverProfile } from "@/types";

/** All discoverable profiles: legacy demo + AI seed faces */
export const ALL_DISCOVER_PROFILES: DiscoverProfile[] = [
  ...DEMO_PROFILES,
  ...SEED_AI_PROFILES,
];

export function findDiscoverProfile(id: string): DiscoverProfile | undefined {
  return ALL_DISCOVER_PROFILES.find((p) => p.id === id);
}
