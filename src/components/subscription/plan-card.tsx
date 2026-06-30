"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/helpers/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

interface PlanCardProps {
  plan: (typeof SUBSCRIPTION_PLANS)[number];
  isCurrent?: boolean;
  onSelect?: () => void;
  loading?: boolean;
}

export function PlanCard({ plan, isCurrent, onSelect, loading }: PlanCardProps) {
  const isVip = plan.id === "vip";
  const isPremiumPlus = plan.id === "premium_plus";
  const isPremium = plan.id === "premium";

  const isDarkPlan = isPremiumPlus || isVip;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[6px] p-6 transition-all duration-300",
        isVip
          ? "scale-[1.02] border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white shadow-2xl"
          : isPremiumPlus
          ? "scale-[1.02] border-0 bg-gradient-to-br from-primary to-[#8B1A1A] text-white shadow-xl"
          : isPremium
            ? "border-2 border-primary bg-white shadow-lg"
            : "border border-border/60 bg-white shadow-sm",
        isCurrent && !isPremiumPlus && !isVip && "ring-4 ring-primary/20"
      )}
    >
      {isVip && (
        <div className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-[6px] bg-amber-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-950 shadow-md">
          Elite Circle
        </div>
      )}
      {isPremiumPlus && (
        <div className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-[6px] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-md">
          <Sparkles className="h-3.5 w-3.5" /> Best Value
        </div>
      )}

      {isPremium && (
        <div className="absolute -top-3 left-6 rounded-[6px] bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          Most Popular
        </div>
      )}

      <div className="mb-6 flex-1">
        <h3 className={cn("mb-2 text-xl font-bold", isDarkPlan ? "text-white" : "text-foreground")}>
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1.5">
          {plan.price > 0 ? (
            <>
              <span
                className={cn(
                  "text-4xl font-extrabold tracking-tight",
                  isDarkPlan ? "text-white" : "text-foreground"
                )}
              >
                ₹{plan.price}
              </span>
              <span
                className={cn("text-sm font-medium", isDarkPlan ? "text-white/80" : "text-muted-foreground")}
              >
                /month
              </span>
            </>
          ) : (
            <span className="text-4xl font-extrabold tracking-tight text-foreground">Free</span>
          )}
        </div>
      </div>

      <ul className="mb-8 space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={cn(
              "flex items-start gap-3 text-[15px] font-medium leading-tight",
              isDarkPlan ? "text-white/95" : "text-foreground/90"
            )}
          >
            <Check
              className={cn("mt-0.5 h-5 w-5 shrink-0", isDarkPlan ? "text-amber-300" : "text-primary")}
              strokeWidth={3}
            />
            {feature}
          </li>
        ))}
      </ul>

      {!isCurrent && onSelect && (
        <Button
          onClick={onSelect}
          loading={loading}
          className={cn(
            "w-full py-6 text-base font-bold shadow-md",
            isVip
              ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
              : isPremiumPlus
                ? "bg-white text-primary hover:bg-white/90"
                : "bg-primary text-white hover:bg-primary/90"
          )}
        >
          {plan.price > 0 ? "Upgrade Now" : "Current Plan"}
        </Button>
      )}

      {isCurrent && (
        <div
          className={cn(
            "w-full rounded-[6px] py-3.5 text-center text-sm font-bold uppercase tracking-wide",
            isDarkPlan ? "bg-white/20 text-white backdrop-blur-md" : "bg-primary/10 text-primary"
          )}
        >
          Your Current Plan
        </div>
      )}
    </div>
  );
}
