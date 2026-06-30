"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PlanCard } from "@/components/subscription/plan-card";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { PaymentConfirmSheet } from "@/components/subscription/payment-confirm-sheet";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { withProgress } from "@/lib/progress";
import { useSubscriptionCreditsStore } from "@/store/subscription-credits";

type PlanRow = {
  id: string;
  name: string;
  price: number;
  features: string[];
};

export default function SubscriptionPageClient() {
  const searchParams = useSearchParams();
  const setPlanId = useSubscriptionCreditsStore((s) => s.setPlanId);
  const setCredits = useSubscriptionCreditsStore((s) => s.setCreditsRemaining);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [creditsRemaining, setCreditsRemainingLocal] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmPlanId, setConfirmPlanId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const loadSubscription = useCallback(async () => {
    const res = await fetch("/api/payments");
    const json = await res.json();
    if (json.success) {
      const planId = json.plan_id ?? "free";
      setCurrentPlan(planId);
      setPlanId(planId);
      const credits = Number(json.credits_remaining ?? 0);
      setCreditsRemainingLocal(credits);
      setCredits(credits);
    }
  }, [setCredits, setPlanId]);

  useEffect(() => {
    fetch("/api/payments/plans")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setPlans(json.data);
        }
      })
      .finally(() => setPageLoading(false));

    void loadSubscription();
  }, [loadSubscription]);

  useEffect(() => {
    const preselect = searchParams.get("plan");
    if (preselect === "vip" && !pageLoading) {
      setConfirmPlanId("vip");
      setSheetOpen(true);
    }
  }, [searchParams, pageLoading]);

  useEffect(() => {
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transaction_id");
    if (status !== "success") return;

    setNotice("Payment received. Activating your plan…");

    let attempts = 0;
    const poll = setInterval(async () => {
      attempts += 1;
      if (transactionId) {
        const res = await fetch(`/api/payments/status?transaction_id=${encodeURIComponent(transactionId)}`);
        const json = await res.json();
        if (json.success && json.data?.activated) {
          setNotice("Premium activated! Enjoy unlimited interests and contact credits.");
          clearInterval(poll);
          await loadSubscription();
          return;
        }
      } else {
        await loadSubscription();
        if (currentPlan !== "free") {
          setNotice("Premium activated!");
          clearInterval(poll);
        }
      }
      if (attempts >= 12) {
        clearInterval(poll);
        setNotice("Payment processing may take a minute. Pull to refresh if plan is not active yet.");
      }
    }, 2500);

    return () => clearInterval(poll);
  }, [searchParams, loadSubscription, currentPlan]);

  const startCheckout = async (planId: string) => {
    setLoading(planId);
    try {
      await withProgress("Starting payment…", async () => {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });
        const json = await res.json();
        if (!json.success) {
          setNotice(json.error || "Payment failed");
          return;
        }
        const url = json.checkout_url ?? json.redirect_url;
        if (url) {
          window.location.href = url;
        }
      });
    } catch {
      setNotice("Could not start payment. Try again.");
    } finally {
      setLoading(null);
      setSheetOpen(false);
    }
  };

  const handleSelect = (planId: string) => {
    setConfirmPlanId(planId);
    setSheetOpen(true);
  };

  const displayPlans =
    plans.length > 0
      ? plans
      : [
          { id: "free", name: "Free", price: 0, features: ["Limited interests"] },
          { id: "premium", name: "Premium", price: 499, features: ["Unlimited interests"] },
          { id: "premium_plus", name: "Premium Plus", price: 999, features: ["Everything in Premium"] },
        ];

  if (pageLoading) {
    return <PageSkeleton variant="subscription" withHeader={false} />;
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="relative overflow-hidden rounded-b-[6px] bg-gradient-to-br from-primary via-[#A61E1E] to-[#7B1515] pb-12 pt-2 text-white shadow-md">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <PageHeader
          showBack
          title=""
          transparent
          className="relative z-10 [&_.back-btn]:text-white [&_.back-btn:hover]:bg-white/20"
        />

        <div className="relative z-10 mt-4 px-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-sm backdrop-blur-md">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Upgrade to Premium</h1>
          <p className="mx-auto max-w-[280px] text-sm font-medium text-white/90">
            Find your Uttarakhand match faster with verified profiles and family-trust features.
          </p>
          {currentPlan !== "free" ? (
            <p className="mt-3 text-xs font-semibold text-white/80">
              Active plan · {creditsRemaining} contact credits left
            </p>
          ) : null}
        </div>
      </div>

      {notice && (
        <p className="mx-5 mt-4 rounded-[6px] bg-primary/10 px-4 py-3 text-center text-sm font-medium text-primary">
          {notice}
        </p>
      )}

      <div className="relative z-20 -mt-6 space-y-6 px-5">
        {displayPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={{
                id: plan.id,
                name: plan.name,
                price: plan.price,
                billing_cycle: "monthly",
                features: plan.features,
              } as unknown as (typeof SUBSCRIPTION_PLANS)[number]}
              isCurrent={currentPlan === plan.id}
              onSelect={plan.id !== "free" ? () => handleSelect(plan.id) : undefined}
              loading={loading === plan.id}
            />
          ))}
      </div>

      <div className="mt-10 px-6">
        <h3 className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Why Choose Saathini Premium?
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Verified & Secure</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                Interact with genuine profiles verified by our team.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Family-First Matching</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                Built for Uttarakhand culture with trust and family values at the core.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PaymentConfirmSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        planId={confirmPlanId}
        loading={!!loading}
        onConfirm={() => confirmPlanId && startCheckout(confirmPlanId)}
      />
    </div>
  );
}
