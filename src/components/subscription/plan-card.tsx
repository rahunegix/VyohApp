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
  const isPremiumPlus = plan.id === "premium_plus";
  const isPremium = plan.id === "premium";
  const isFree = plan.id === "free";

  return (
    <div
      className={cn(
        "relative rounded-[2rem] p-6 transition-all duration-300",
        isPremiumPlus ? "bg-gradient-to-br from-primary to-orange-500 text-white shadow-xl scale-[1.02] border-0" : 
        isPremium ? "bg-white border-2 border-primary shadow-lg" : 
        "bg-white border border-border/60 shadow-sm",
        isCurrent && !isPremiumPlus && "ring-4 ring-primary/20",
        "flex flex-col"
      )}
    >
      {/* Popular Badge */}
      {isPremiumPlus && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-md flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Best Value
        </div>
      )}

      {isPremium && (
        <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          Most Popular
        </div>
      )}

      <div className="mb-6 flex-1">
        <h3 className={cn("text-xl font-bold mb-2", isPremiumPlus ? "text-white" : "text-foreground")}>
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1.5">
          {plan.price > 0 ? (
            <>
              <span className={cn("text-4xl font-extrabold tracking-tight", isPremiumPlus ? "text-white" : "text-foreground")}>
                ₹{plan.price}
              </span>
              <span className={cn("text-sm font-medium", isPremiumPlus ? "text-white/80" : "text-muted-foreground")}>
                /month
              </span>
            </>
          ) : (
            <span className="text-4xl font-extrabold tracking-tight text-foreground">Free</span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className={cn("flex items-start gap-3 text-[15px] font-medium leading-tight", isPremiumPlus ? "text-white/95" : "text-foreground/90")}>
            <Check className={cn("h-5 w-5 shrink-0 mt-0.5", isPremiumPlus ? "text-white" : "text-primary")} strokeWidth={3} />
            {feature}
          </li>
        ))}
      </ul>

      {!isCurrent && onSelect && (
        <Button
          onClick={onSelect}
          loading={loading}
          className={cn(
            "w-full rounded-xl py-6 text-base font-bold shadow-md transition-transform active:scale-[0.98]",
            isPremiumPlus ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-white hover:bg-primary/90",
            isFree && "bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-white"
          )}
        >
          {plan.price > 0 ? "Upgrade Now" : "Current Plan"}
        </Button>
      )}

      {isCurrent && (
        <div className={cn(
          "w-full rounded-xl py-3.5 text-center text-sm font-bold uppercase tracking-wide",
          isPremiumPlus ? "bg-white/20 text-white backdrop-blur-md" : "bg-primary/10 text-primary"
        )}>
          Your Current Plan
        </div>
      )}
    </div>
  );
}
