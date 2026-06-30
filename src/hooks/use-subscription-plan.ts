"use client";

import { useEffect, useState } from "react";
import {
  normalizePlanId,
  isPaidPlanId,
  getPlanCredits,
  WHATSAPP_CALL_CREDIT_COST,
  FREE_CHAT_MESSAGE_LIMIT,
  buildWhatsAppCallUrl,
  buildPhoneCallUrl,
} from "@/lib/subscription/whatsapp-call";
import { useSubscriptionCreditsStore } from "@/store/subscription-credits";

export function useSubscriptionPlan() {
  const planId = useSubscriptionCreditsStore((s) => s.planId);
  const creditsRemaining = useSubscriptionCreditsStore((s) => s.creditsRemaining);
  const setPlanId = useSubscriptionCreditsStore((s) => s.setPlanId);
  const setCreditsRemaining = useSubscriptionCreditsStore((s) => s.setCreditsRemaining);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/payments")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        const id = json.plan_id ?? normalizePlanId(json.data?.subscription_plans?.name);
        setPlanId(id);
        setCreditsRemaining(Number(json.credits_remaining ?? getPlanCredits(id)));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setCreditsRemaining, setPlanId]);

  return {
    planId,
    creditsRemaining,
    loading,
    isPaid: isPaidPlanId(planId),
    setPlanId,
  };
}

export { WHATSAPP_CALL_CREDIT_COST, FREE_CHAT_MESSAGE_LIMIT, buildWhatsAppCallUrl, buildPhoneCallUrl };
