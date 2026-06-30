"use client";

import { Heart } from "lucide-react";
import { BottomSheet, BottomSheetDoneButton } from "@/components/ui/bottom-sheet";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

interface PaymentConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
  loading?: boolean;
  onConfirm: () => void;
}

export function PaymentConfirmSheet({
  open,
  onOpenChange,
  planId,
  loading,
  onConfirm,
}: PaymentConfirmSheetProps) {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);

  if (!plan) return null;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Payment Method"
      centeredTitle
      showClose={false}
      size="default"
      footer={
        <div className="space-y-3">
          <BottomSheetDoneButton
            onClick={onConfirm}
            label={`Buy Now — ₹${plan.price}/mo`}
            loading={loading}
          />
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            By tapping Buy Now you agree to Saathini subscription terms. Secure checkout via PhonePe.
          </p>
        </div>
      }
    >
      <div className="flex flex-col items-center pb-2 pt-2 text-center">
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-[6px] bg-primary/10">
          <Heart className="h-9 w-9 text-primary" fill="currentColor" />
        </div>

        <div className="w-full space-y-2 border-y border-dashed border-border/70 py-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{plan.name} plan</span>
            <span className="font-semibold">₹{plan.price}</span>
          </div>
          <div className="flex items-center justify-between gap-4 font-bold text-primary">
            <span>Total</span>
            <span>₹{plan.price}</span>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Unlock verified Uttarakhand matches, unlimited interests, and family-trust features on Saathini.
        </p>
      </div>
    </BottomSheet>
  );
}
