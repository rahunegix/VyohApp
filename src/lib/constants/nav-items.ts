import type { Platform } from "@/lib/platform";
import { getPrimaryNavItems, type PrimaryNavIcon } from "@/config/nav";

export function getNavItems(platform: Platform) {
  return getPrimaryNavItems(platform);
}

/** @deprecated use getNavItems(platform) */
export const APP_NAV_ITEMS = getNavItems("dating");

export type AppNavIcon = PrimaryNavIcon;
