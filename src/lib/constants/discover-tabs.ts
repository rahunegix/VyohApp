import type { DiscoverProfile } from "@/types";

export const DISCOVER_TABS = [
  { id: "suggestions", labelKey: "discover_tab_suggestions" },
  { id: "shortlist", labelKey: "discover_tab_shortlist" },
  { id: "received", labelKey: "discover_tab_received" },
  { id: "sent", labelKey: "discover_tab_sent" },
] as const;

export type DiscoverTabId = (typeof DISCOVER_TABS)[number]["id"];

export interface InterestEntry {
  profile: DiscoverProfile;
  at: string;
  mutual?: boolean;
}
