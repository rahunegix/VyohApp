import { DEMO_PROFILES } from "@/services/demo-data";
import { SEED_AI_PROFILES } from "@/data/seed-ai-profiles";
import type { InterestEntry } from "@/lib/constants/discover-tabs";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

/** Discover swipe deck — demo + AI seed profiles */
export const DEMO_SUGGESTIONS = [
  ...DEMO_PROFILES,
  ...SEED_AI_PROFILES,
];
/** Someone sent interest in your profile */
export const DEMO_INTEREST_RECEIVED: InterestEntry[] = [
  { profile: DEMO_PROFILES[1], at: hoursAgo(2) },
  { profile: DEMO_PROFILES[2], at: hoursAgo(8) },
];

/** Interest you sent — waiting for response */
export const DEMO_INTEREST_SENT: InterestEntry[] = [
  { profile: DEMO_PROFILES[0], at: hoursAgo(12), mutual: true },
  { profile: DEMO_PROFILES[2], at: hoursAgo(5) },
];
