"use client";

import { useEffect, useState } from "react";
import { normalizePlanId } from "@/lib/subscription/whatsapp-call";
import { useSubscriptionCreditsStore } from "@/store/subscription-credits";

export function useSubscriptionPlan() {
  const planId = useSubscriptionCreditsStore((s) => s.planId);
  const creditsRemaining = useSubscriptionCreditsStore((s) => s.creditsRemaining);
  const setPlanId = useSubscriptionCreditsStore((s) => s.setPlanId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/payments")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const plan = json.data?.subscription_plans;
        if (json.success && plan?.name) {
          setPlanId(normalizePlanId(plan.name));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setPlanId]);

  return {
    planId,
    creditsRemaining,
    loading,
    isPaid: planId !== "free",
    setPlanId,
  };
}
