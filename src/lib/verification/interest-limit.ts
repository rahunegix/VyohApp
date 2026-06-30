import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FREE_INTEREST_LIMIT,
  getActiveSubscription,
  isPaidPlanId,
  normalizePlanId,
} from "@/lib/subscription/service";

export const INTEREST_LIMIT_WITHOUT_FACE = 2;

export async function getSentInterestCount(
  admin: SupabaseClient,
  profileId: string
): Promise<number> {
  const { count } = await admin
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("sender_profile_id", profileId);
  return count ?? 0;
}

export async function assertCanSendInterest(
  admin: SupabaseClient,
  profileId: string,
  faceVerified: boolean,
  userId?: string
): Promise<{ allowed: true; remaining: number } | { allowed: false; error: string; code: string }> {
  if (userId) {
    const sub = await getActiveSubscription(admin, userId);
    const planId = normalizePlanId(sub?.subscription_plans?.name);
    if (isPaidPlanId(planId)) {
      return { allowed: true, remaining: Infinity };
    }
  }

  const sent = await getSentInterestCount(admin, profileId);
  const limit = faceVerified ? FREE_INTEREST_LIMIT : INTEREST_LIMIT_WITHOUT_FACE;

  if (sent >= limit) {
    if (!faceVerified) {
      return {
        allowed: false,
        code: "FACE_VERIFICATION_REQUIRED",
        error: `Verify your face to send more than ${INTEREST_LIMIT_WITHOUT_FACE} interests. Complete Face Check in Trust Center.`,
      };
    }
    return {
      allowed: false,
      code: "PREMIUM_REQUIRED",
      error: `Free plan allows up to ${FREE_INTEREST_LIMIT} interests. Upgrade to Premium for unlimited interests.`,
    };
  }

  return { allowed: true, remaining: limit - sent };
}
