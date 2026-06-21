import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPlanWhatsAppCredits } from "@/lib/subscription/whatsapp-call";

interface SubscriptionCreditsState {
  planId: string;
  creditsRemaining: number;
  setPlanId: (planId: string) => void;
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
        if (state.planId === planId) return;
        set({ planId, creditsRemaining: getPlanWhatsAppCredits(planId) });
      },
      resetCreditsForPlan: (planId) => {
        set({ planId, creditsRemaining: getPlanWhatsAppCredits(planId) });
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
