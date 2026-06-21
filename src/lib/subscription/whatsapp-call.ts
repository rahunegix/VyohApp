import { SUBSCRIPTION_PLANS } from "@/lib/constants";

export const WHATSAPP_CALL_CREDIT_COST = 1;

/** Free plan: only this many chat messages per conversation */
export const FREE_CHAT_MESSAGE_LIMIT = 1;

/** Monthly WhatsApp call credits included per plan */
export const PLAN_WHATSAPP_CREDITS: Record<string, number> = {
  free: 0,
  premium: 10,
  premium_plus: 25,
};

/** Demo contact numbers unlocked after credit use (consent-based flow) */
export const DEMO_PROFILE_WHATSAPP: Record<string, string> = {
  "demo-1": "9876543210",
  "demo-2": "9876501234",
  "demo-3": "9876512345",
};

export function normalizePlanId(planName?: string | null): string {
  if (!planName) return "free";
  const lower = planName.toLowerCase();
  if (lower.includes("plus")) return "premium_plus";
  if (lower.includes("premium")) return "premium";
  return "free";
}

export function isPaidPlan(planId: string): boolean {
  return planId !== "free";
}

export function getPlanWhatsAppCredits(planId: string): number {
  return PLAN_WHATSAPP_CREDITS[planId] ?? 0;
}

export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

export function buildWhatsAppCallUrl(phone: string, matchName: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  const text = encodeURIComponent(
    `Hi ${matchName.split(" ")[0]}, I'd like to connect on Saathini.`
  );
  return `https://wa.me/${normalized}?text=${text}`;
}

export function buildPhoneCallUrl(phone: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  return `tel:+${normalized}`;
}

export const MEMBERSHIP_UPSELL_FEATURES = [
  {
    title: "Unlimited Interests",
    description: "Send as many interests as you want",
    icon: "heart" as const,
  },
  {
    title: "WhatsApp Call Access",
    description: "Connect with verified Uttarakhand matches securely",
    icon: "whatsapp" as const,
  },
  {
    title: "See Who Likes You",
    description: "Know who's interested before you respond",
    icon: "eye" as const,
  },
  {
    title: "Advanced Filters",
    description: "Find Garhwali & Kumaoni matches that fit your values",
    icon: "filter" as const,
  },
  {
    title: "Profile Boost",
    description: "Get seen by more verified profiles in your region",
    icon: "sparkles" as const,
  },
] as const;

/** Horizontal billing tiers — reference dating-app upsell pattern */
export const UPSELL_BILLING_TIERS = [
  {
    id: "12_months",
    label: "12 months",
    months: 12,
    monthlyPrice: 349,
    saveLabel: null as string | null,
    planId: "premium_plus",
  },
  {
    id: "6_months",
    label: "6 months",
    months: 6,
    monthlyPrice: 399,
    saveLabel: "Save 20%",
    planId: "premium",
  },
  {
    id: "1_month",
    label: "1 month",
    months: 1,
    monthlyPrice: 499,
    saveLabel: null as string | null,
    planId: "premium",
  },
] as const;

export const DEFAULT_UPSELL_TIER_ID = "6_months";

export const UPSELL_PLAN_OPTIONS = SUBSCRIPTION_PLANS.filter((p) => p.id !== "free").map((plan) => ({
  id: plan.id,
  label: plan.id === "premium_plus" ? "Premium Plus" : "Premium",
  price: plan.price,
  badge: plan.id === "premium_plus" ? "Best value" : "Popular",
}));
