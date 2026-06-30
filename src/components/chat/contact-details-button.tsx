"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Contact, MapPin, Phone } from "lucide-react";
import { BottomSheet, BottomSheetDoneButton } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { MembershipUpsellModal } from "@/components/subscription/membership-upsell-modal";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { useSubscriptionCreditsStore } from "@/store/subscription-credits";
import {
  CONTACT_CREDIT_COST,
  buildPhoneCallUrl,
  buildWhatsAppCallUrl,
} from "@/lib/subscription/whatsapp-call";
import { cn } from "@/lib/helpers/utils";

type ContactPayload = {
  phone?: string;
  phone_display?: string;
  phone_masked?: string;
  full_name: string;
  city?: string | null;
};

interface ContactDetailsButtonProps {
  profileId: string;
  profileName: string;
  className?: string;
}

export function ContactDetailsButton({
  profileId,
  profileName,
  className,
}: ContactDetailsButtonProps) {
  const router = useRouter();
  const { isPaid, creditsRemaining, loading } = useSubscriptionPlan();
  const setCreditsRemaining = useSubscriptionCreditsStore((s) => s.setCreditsRemaining);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [contact, setContact] = useState<ContactPayload | null>(null);

  const loadStatus = useCallback(async () => {
    const res = await fetch(
      `/api/payments/contact?targetProfileId=${encodeURIComponent(profileId)}`
    );
    const json = await res.json();
    if (!json.success) return;
    const data = json.data;
    setUnlocked(Boolean(data?.unlocked));
    setCreditsRemaining(Number(data?.credits_remaining ?? 0));
    if (data?.unlocked && data?.contact) {
      setContact(data.contact);
    }
  }, [profileId, setCreditsRemaining]);

  useEffect(() => {
    if (isPaid) void loadStatus();
  }, [isPaid, loadStatus]);

  const openFlow = () => {
    if (loading) return;
    if (!isPaid) {
      setUpsellOpen(true);
      return;
    }
    if (unlocked && contact?.phone) {
      setDetailsOpen(true);
      return;
    }
    if (creditsRemaining < CONTACT_CREDIT_COST) {
      setNoCreditsOpen(true);
      return;
    }
    setConfirmOpen(true);
  };

  const unlockContact = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/payments/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetProfileId: profileId }),
      });
      const json = await res.json();
      if (!json.success) {
        setConfirmOpen(false);
        if (json.code === "PREMIUM_REQUIRED") setUpsellOpen(true);
        else if (json.code === "NO_CREDITS") setNoCreditsOpen(true);
        return;
      }
      setCreditsRemaining(Number(json.data?.credits_remaining ?? 0));
      setContact(json.data?.contact ?? null);
      setUnlocked(true);
      setConfirmOpen(false);
      setDetailsOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const firstName = profileName.split(" ")[0];
  const displayPhone = contact?.phone_display ?? contact?.phone ?? "";

  return (
    <>
      <button
        type="button"
        onClick={openFlow}
        disabled={loading || busy}
        className={cn(
          "flex h-10 items-center gap-1.5 rounded-[6px] bg-primary/10 px-3 text-primary transition-colors hover:bg-primary/15 active:scale-95 disabled:opacity-40",
          className
        )}
        aria-label="View contact details"
        title={
          isPaid
            ? unlocked
              ? "Contact unlocked"
              : `${creditsRemaining} contact credits left`
            : "Premium required"
        }
      >
        <Contact className="h-4 w-4" strokeWidth={2.2} />
        <span className="text-xs font-bold">Contact</span>
      </button>

      <MembershipUpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        reason="Upgrade to view match contact details and connect on call or WhatsApp"
      />

      <BottomSheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="View contact details"
        centeredTitle
        showClose={false}
        size="default"
        footer={
          <BottomSheetDoneButton
            onClick={unlockContact}
            label={busy ? "Unlocking…" : "Use 1 credit & view"}
          />
        }
      >
        <div className="flex flex-col items-center py-2 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
            <Contact className="h-8 w-8" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Use <span className="font-bold text-primary">{CONTACT_CREDIT_COST} contact credit</span> to
            view <span className="font-semibold text-foreground">{firstName}</span>&apos;s phone number?
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {creditsRemaining} credits left · Re-viewing this contact is free
          </p>
        </div>
      </BottomSheet>

      <BottomSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title="Contact details"
        centeredTitle
        showClose={false}
        size="default"
        footer={<BottomSheetDoneButton onClick={() => setDetailsOpen(false)} label="Done" />}
      >
        {contact ? (
          <div className="space-y-4 pb-2">
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 text-center">
              <p className="text-lg font-bold text-foreground">{contact.full_name}</p>
              {contact.city ? (
                <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {contact.city}
                </p>
              ) : null}
              <p className="mt-3 text-2xl font-extrabold tracking-wide text-primary tabular-nums">
                {displayPhone}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Call or WhatsApp from your phone — no extra credit
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl gap-2"
                onClick={() => {
                  if (contact.phone) window.location.href = buildPhoneCallUrl(contact.phone);
                }}
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button
                type="button"
                className="h-12 rounded-xl gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
                onClick={() => {
                  if (contact.phone) {
                    window.open(
                      buildWhatsAppCallUrl(contact.phone, contact.full_name),
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }
                }}
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        ) : null}
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
          You&apos;ve used all contact credits for this month. Each credit unlocks one match&apos;s
          contact details (call & WhatsApp).
        </p>
      </BottomSheet>
    </>
  );
}

/** @deprecated Use ContactDetailsButton */
export function PremiumContactButton({
  profileId,
  profileName,
  className,
}: {
  variant?: string;
  profileId: string;
  profileName: string;
  className?: string;
}) {
  return (
    <ContactDetailsButton
      profileId={profileId}
      profileName={profileName}
      className={className}
    />
  );
}
