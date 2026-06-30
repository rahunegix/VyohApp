"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Eye, Filter, Heart, Shield, Sparkles, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { cn } from "@/lib/helpers/utils";
import {
  DEFAULT_UPSELL_TIER_ID,
  MEMBERSHIP_UPSELL_FEATURES,
  UPSELL_BILLING_TIERS,
} from "@/lib/subscription/whatsapp-call";

const FEATURE_ICONS = {
  heart: Heart,
  whatsapp: WhatsAppIcon,
  eye: Eye,
  filter: Filter,
  sparkles: Sparkles,
} as const;

interface MembershipUpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

export function MembershipUpsellModal({
  open,
  onOpenChange,
  reason = "Upgrade to view match contact details and connect on call or WhatsApp",
}: MembershipUpsellModalProps) {
  const router = useRouter();
  const [featureIndex, setFeatureIndex] = useState(0);
  const [selectedTierId, setSelectedTierId] = useState(DEFAULT_UPSELL_TIER_ID);
  const [mounted, setMounted] = useState(false);

  const feature = MEMBERSHIP_UPSELL_FEATURES[featureIndex];
  const FeatureIcon = FEATURE_ICONS[feature.icon];
  const selectedTier =
    UPSELL_BILLING_TIERS.find((t) => t.id === selectedTierId) ?? UPSELL_BILLING_TIERS[1];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => {
      setFeatureIndex((i) => (i + 1) % MEMBERSHIP_UPSELL_FEATURES.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleContinue = useCallback(() => {
    onOpenChange(false);
    router.push(
      `/subscription?plan=${selectedTier.planId}&tier=${selectedTier.id}&from=upsell`
    );
  }, [onOpenChange, router, selectedTier.id, selectedTier.planId]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[250] flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/55 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="membership-upsell-title"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-t-[6px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)] sm:max-w-[320px] sm:rounded-[6px] sm:shadow-[var(--shadow-elevated)]"
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-[6px] bg-border/80" />
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:right-2.5 sm:top-2.5"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Header band */}
            <div className="relative overflow-hidden border-b border-primary/10 bg-gradient-to-b from-primary/[0.08] via-primary/[0.04] to-white px-5 pb-4 pt-5 text-center sm:px-4 sm:pb-3 sm:pt-4">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="pointer-events-none absolute -left-4 top-8 h-16 w-16 rounded-full bg-[#D4AF37]/10 blur-xl" />

              <div className="relative mx-auto mb-2.5 inline-flex items-center gap-1.5 rounded-[6px] border border-[#D4AF37]/30 bg-gradient-to-r from-[#FFF8E7] to-white px-3 py-1 shadow-sm">
                <Crown className="h-3.5 w-3.5 text-[#B8860B]" fill="#D4AF37" strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8B6914]">
                  Premium
                </span>
              </div>

              <h2
                id="membership-upsell-title"
                className="relative text-[1.5rem] font-black leading-[1.15] tracking-tight text-primary sm:text-[1.35rem]"
              >
                Get Saathini Gold
              </h2>

              {reason && (
                <div className="relative mx-auto mt-2.5 flex max-w-[280px] items-start gap-2 rounded-xl border border-primary/10 bg-white/70 px-3 py-2 text-left shadow-sm backdrop-blur-sm sm:mt-2 sm:max-w-none sm:py-1.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#25D366]/10 text-[#25D366]">
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[11px] font-medium leading-snug text-foreground/85 sm:text-[10px]">
                    {reason}
                  </p>
                  <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden />
                </div>
              )}
            </div>

            <div className="px-5 pb-7 pt-4 text-center sm:px-4 sm:pb-5 sm:pt-3">
              {/* Feature hero */}
              <div className="relative mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center sm:h-[4rem] sm:w-[4rem]">
                <div className="absolute inset-0 rounded-full bg-primary/12 blur-lg" />
                <div className="relative flex h-full w-full items-center justify-center rounded-[6px] bg-gradient-to-br from-primary to-[#8B1A1A] shadow-[0_6px_20px_rgba(198,40,40,0.3)]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.22 }}
                      className="flex items-center justify-center text-white"
                    >
                      {feature.icon === "whatsapp" ? (
                        <WhatsAppIcon className="h-7 w-7 text-white sm:h-6 sm:w-6" />
                      ) : (
                        <FeatureIcon
                          className="h-7 w-7 sm:h-6 sm:w-6"
                          fill={feature.icon === "heart" ? "currentColor" : undefined}
                          strokeWidth={2}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-3 min-h-[3rem] sm:mt-2 sm:min-h-[2.75rem]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-base font-bold text-foreground sm:text-[15px]">{feature.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-[11px]">
                      {feature.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-3 flex justify-center gap-1.5 sm:mt-2">
                {MEMBERSHIP_UPSELL_FEATURES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFeatureIndex(i)}
                    className={cn(
                      "rounded-[6px] transition-all duration-300",
                      i === featureIndex
                        ? "h-1.5 w-5 bg-primary"
                        : "h-1.5 w-1.5 bg-primary/20 hover:bg-primary/35"
                    )}
                    aria-label={`Feature ${i + 1}`}
                  />
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-1">
                {UPSELL_BILLING_TIERS.map((tier) => {
                  const selected = selectedTierId === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTierId(tier.id)}
                      className={cn(
                        "relative flex flex-col items-center rounded-xl border-2 px-1 py-2.5 transition-all duration-200 active:scale-[0.98] sm:py-2",
                        selected
                          ? "border-primary bg-primary/[0.04]"
                          : "border-border/50 bg-white hover:border-primary/25"
                      )}
                    >
                      {tier.saveLabel && (
                        <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-primary px-1.5 py-px text-[8px] font-bold uppercase text-white shadow-sm">
                          {tier.saveLabel}
                        </span>
                      )}

                      <span
                        className={cn(
                          "text-[10px] font-semibold leading-tight sm:text-[9px]",
                          selected ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {tier.label}
                      </span>

                      <span
                        className={cn(
                          "mt-1 text-lg font-black tabular-nums leading-none sm:text-base",
                          selected ? "text-primary" : "text-foreground"
                        )}
                      >
                        ₹{tier.monthlyPrice}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-medium sm:text-[8px]",
                          selected ? "text-primary/70" : "text-muted-foreground"
                        )}
                      >
                        /mo
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground sm:text-[8px]">
                ₹{selectedTier.monthlyPrice * selectedTier.months} billed for {selectedTier.label} · Cancel anytime
              </p>

              <button
                type="button"
                onClick={handleContinue}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_6px_20px_rgba(198,40,40,0.32)] transition-transform active:scale-[0.98] hover:bg-primary/90 sm:mt-3 sm:h-11 sm:text-xs"
              >
                Continue
              </button>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="mt-3 text-[11px] font-semibold text-muted-foreground/75 transition-colors hover:text-foreground sm:mt-2 sm:text-[10px]"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
