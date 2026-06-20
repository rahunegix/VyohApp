import { APP_NAME, APP_TAGLINE, LOGO_PATH } from "@/lib/constants";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return url || "http://localhost:3000";
}

export const SEO_DEFAULTS = {
  siteName: APP_NAME,
  tagline: APP_TAGLINE,
  defaultOgImage: `${getSiteUrl()}${LOGO_PATH}`,
  twitterHandle: "@saathini",
} as const;
