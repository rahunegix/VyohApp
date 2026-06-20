"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PlanCard } from "@/components/subscription/plan-card";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

export default function SubscriptionPageClient() {
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      setNotice("Payment successful! Your premium plan is being activated.");
    }

    fetch("/api/payments")
      .then((r) => r.json())
      .then((json) => {
        const plan = json.data?.subscription_plans;
        if (json.success && plan?.name) {
          const name = String(plan.name).toLowerCase();
          if (name.includes("plus")) setCurrentPlan("premium_plus");
          else if (name.includes("premium")) setCurrentPlan("premium");
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const handleSelect = async (planId: string) => {
    setLoading(planId);
    try {
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
      if (json.checkout_url) {
        window.location.href = json.checkout_url;
      }
    } catch {
      setNotice("Could not start payment. Try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="bg-gradient-to-br from-primary to-[#ff6b6b] text-white pt-2 pb-12 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <PageHeader
          showBack
          title=""
          transparent
          className="[&_.back-btn]:text-white [&_.back-btn:hover]:bg-white/20 relative z-10"
        />

        <div className="px-6 text-center mt-4 relative z-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-sm">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-shadow-sm">
            Upgrade to Premium
          </h1>
          <p className="text-white/90 text-sm font-medium max-w-[280px] mx-auto">
            Find your perfect match faster with exclusive features and verified profiles.
          </p>
        </div>
      </div>

      {notice && (
        <p className="mx-5 mt-4 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary font-medium">
          {notice}
        </p>
      )}

      <div className="px-5 -mt-6 space-y-6 relative z-20">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={currentPlan === plan.id}
            onSelect={plan.id !== "free" ? () => handleSelect(plan.id) : undefined}
            loading={loading === plan.id}
          />
        ))}
      </div>

      <div className="mt-10 px-6">
        <h3 className="text-center text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">
          Why Choose Saathini Premium?
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Verified & Secure</p>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                Interact with genuine profiles verified by our team.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Family-First Matching</p>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                Built for Uttarakhand culture with trust and family values at the core.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
