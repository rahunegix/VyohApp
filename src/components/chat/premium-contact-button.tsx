"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { BottomSheet, BottomSheetDoneButton } from "@/components/ui/bottom-sheet";
import { MembershipUpsellModal } from "@/components/subscription/membership-upsell-modal";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { useSubscriptionCreditsStore } from "@/store/subscription-credits";
import {
  WHATSAPP_CALL_CREDIT_COST,
  buildPhoneCallUrl,
  buildWhatsAppCallUrl,
  DEMO_PROFILE_WHATSAPP,
} from "@/lib/subscription/whatsapp-call";
import { cn } from "@/lib/helpers/utils";

type ContactVariant = "phone" | "whatsapp";

const VARIANT_CONFIG: Record<
  ContactVariant,
  {
    label: string;
    upsellReason: string;
    confirmTitle: string;
    confirmAction: string;
    iconClass: string;
    buttonClass: string;
  }
> = {
  phone: {
    label: "Voice call",
    upsellReason: "Upgrade to call matches securely on Saathini",
    confirmTitle: "Voice Call",
    confirmAction: "Start call",
    iconClass: "text-primary",
    buttonClass: "bg-primary/10 text-primary hover:bg-primary/15",
  },
  whatsapp: {
    label: "WhatsApp call",
    upsellReason: "Upgrade to call matches on WhatsApp securely",
    confirmTitle: "WhatsApp Call",
    confirmAction: "Continue to WhatsApp",
    iconClass: "text-[#25D366]",
    buttonClass: "bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/15",
  },
};

interface PremiumContactButtonProps {
  variant: ContactVariant;
  profileId: string;
  profileName: string;
  className?: string;
}

export function PremiumContactButton({
  variant,
  profileId,
  profileName,
  className,
}: PremiumContactButtonProps) {
  const router = useRouter();
  const config = VARIANT_CONFIG[variant];
  const { isPaid, creditsRemaining, loading } = useSubscriptionPlan();
  const deductCredit = useSubscriptionCreditsStore((s) => s.deductCredit);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);

  const phone = DEMO_PROFILE_WHATSAPP[profileId];
  const firstName = profileName.split(" ")[0];

  const handleClick = () => {
    if (loading) return;

    if (!isPaid) {
      setUpsellOpen(true);
      return;
    }

    if (creditsRemaining < WHATSAPP_CALL_CREDIT_COST) {
      setNoCreditsOpen(true);
      return;
    }

    if (!phone) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!phone) return;
    const ok = deductCredit(WHATSAPP_CALL_CREDIT_COST);
    if (!ok) {
      setConfirmOpen(false);
      setNoCreditsOpen(true);
      return;
    }

    const url =
      variant === "whatsapp"
        ? buildWhatsAppCallUrl(phone, profileName)
        : buildPhoneCallUrl(phone);

    if (variant === "whatsapp") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
    setConfirmOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !phone}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-colors active:scale-95 disabled:opacity-40",
          config.buttonClass,
          className
        )}
        aria-label={config.label}
        title={isPaid ? `${creditsRemaining} call credits left` : "Premium required"}
      >
        {variant === "whatsapp" ? (
          <WhatsAppIcon />
        ) : (
          <Phone className="h-[18px] w-[18px]" strokeWidth={2.25} />
        )}
      </button>

      <MembershipUpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        reason={config.upsellReason}
      />

      <BottomSheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={config.confirmTitle}
        centeredTitle
        showClose={false}
        size="default"
        footer={<BottomSheetDoneButton onClick={handleConfirm} label={config.confirmAction} />}
      >
        <div className="flex flex-col items-center py-2 text-center">
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
              variant === "whatsapp" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-primary/10 text-primary"
            )}
          >
            {variant === "whatsapp" ? (
              <WhatsAppIcon className="h-8 w-8" />
            ) : (
              <Phone className="h-8 w-8" strokeWidth={2} />
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Use <span className="font-bold text-primary">{WHATSAPP_CALL_CREDIT_COST} credit</span> to
            connect with <span className="font-semibold text-foreground">{firstName}</span>?
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {creditsRemaining} credits remaining this month
          </p>
        </div>
      </BottomSheet>

      <BottomSheet
        open={noCreditsOpen}
        onOpenChange={setNoCreditsOpen}
        title="No credits left"
        centeredTitle
        showClose={false}
        size="default"
        footer={
          <BottomSheetDoneButton
            onClick={() => {
              setNoCreditsOpen(false);
              router.push("/subscription");
            }}
            label="Upgrade plan"
          />
        }
      >
        <p className="pb-2 text-center text-sm leading-relaxed text-muted-foreground">
          You&apos;ve used all call credits for this month. Upgrade for more WhatsApp and voice calls.
        </p>
      </BottomSheet>
    </>
  );
}

/** @deprecated Use PremiumContactButton with variant="whatsapp" */
export function WhatsAppCallButton(props: Omit<PremiumContactButtonProps, "variant">) {
  return <PremiumContactButton variant="whatsapp" {...props} />;
}
