import type { Platform } from "@/lib/platform";
import { platformPath } from "@/lib/platform";

/** Part 4/7: four primary tabs only */
export const PRIMARY_NAV = [
  { id: "explore", label: "Explore", icon: "compass" as const, path: "/discover" },
  { id: "connect", label: "Connect", icon: "message-circle" as const, path: "/chats" },
  { id: "saathi", label: "Saathi", icon: "sparkles" as const, path: "/saathi" },
  { id: "me", label: "Me", icon: "user" as const, path: "/profile" },
] as const;

export type PrimaryNavId = (typeof PRIMARY_NAV)[number]["id"];
export type PrimaryNavIcon = (typeof PRIMARY_NAV)[number]["icon"];

export function getPrimaryNavItems(platform: Platform) {
  return PRIMARY_NAV.map((item) => ({
    ...item,
    href: platformPath(platform, item.path),
  }));
}
