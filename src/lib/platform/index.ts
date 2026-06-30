export type Platform = "dating" | "matrimony" | "vip";

export const PLATFORMS: Platform[] = ["dating", "matrimony", "vip"];

export const PLATFORM_COOKIE = "saathini_platform";
export const PLATFORM_HEADER = "x-saathini-platform";

export const VIP_MONTHLY_PRICE_INR = 20_000;

export const PLATFORM_CONFIG: Record<
  Platform,
  {
    label: string;
    shortLabel: string;
    tagline: string;
    description: string;
    defaultIntent: "serious" | "marriage" | "exploring";
    primaryClass: string;
    accentColor: string;
  }
> = {
  dating: {
    label: "Saathini Spark",
    shortLabel: "Dating",
    tagline: "Meet. Match. Connect.",
    description: "Modern dating for Uttarakhand — swipe, chat, and connect at your pace.",
    defaultIntent: "serious",
    primaryClass: "platform-dating",
    accentColor: "#C62828",
  },
  matrimony: {
    label: "Saathini Vivah",
    shortLabel: "Matrimony",
    tagline: "Rishta with trust.",
    description: "Serious marriage matches with family values, verification, and respect.",
    defaultIntent: "marriage",
    primaryClass: "platform-matrimony",
    accentColor: "#B45309",
  },
  vip: {
    label: "Saathini VIP",
    shortLabel: "VIP",
    tagline: "Elite. Private. Uttarakhand.",
    description:
      "An exclusive circle for successful entrepreneurs, influencers, actresses, and top celebrities of Uttarakhand.",
    defaultIntent: "exploring",
    primaryClass: "platform-vip",
    accentColor: "#0A0A0A",
  },
};

export function isPlatform(value: string | null | undefined): value is Platform {
  return value === "dating" || value === "matrimony" || value === "vip";
}

export function parsePlatform(value: string | null | undefined): Platform | null {
  return isPlatform(value) ? value : null;
}

export function platformPath(platform: Platform, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith(`/${platform}/`)) return normalized;
  return `/${platform}${normalized === "/" ? "" : normalized}`;
}

export function getPlatformFromPathname(pathname: string): Platform | null {
  if (pathname.startsWith("/vip")) return "vip";
  if (pathname.startsWith("/matrimony")) return "matrimony";
  if (pathname.startsWith("/dating")) return "dating";
  return null;
}

export function stripPlatformPrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/(dating|matrimony|vip)/, "");
  return stripped || "/discover";
}
