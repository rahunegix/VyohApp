import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPlanCredits } from "@/lib/subscription/whatsapp-call";

interface SubscriptionCreditsState {
  planId: string;
  creditsRemaining: number;
  setPlanId: (planId: string) => void;
  setCreditsRemaining: (credits: number) => void;
  resetCreditsForPlan: (planId: string) => void;
  deductCredit: (amount?: number) => boolean;
}

export const useSubscriptionCreditsStore = create<SubscriptionCreditsState>()(
  persist(
    (set, get) => ({
      planId: "free",
      creditsRemaining: 0,
      setPlanId: (planId) => {
        const state = get();
        if (state.planId === planId && state.creditsRemaining > 0) return;
        set({ planId, creditsRemaining: getPlanCredits(planId) });
      },
      setCreditsRemaining: (creditsRemaining) => set({ creditsRemaining }),
      resetCreditsForPlan: (planId) => {
        set({ planId, creditsRemaining: getPlanCredits(planId) });
      },
      deductCredit: (amount = 1) => {
        const { creditsRemaining } = get();
        if (creditsRemaining < amount) return false;
        set({ creditsRemaining: creditsRemaining - amount });
        return true;
      },
    }),
    { name: "saathini-subscription-credits" }
  )
);
