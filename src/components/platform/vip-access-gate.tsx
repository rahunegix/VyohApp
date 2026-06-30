"use client";

import Link from "next/link";
import { Clock, Crown, Lock, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/helpers/utils";
import { VIP_MONTHLY_PRICE_INR } from "@/lib/platform";
import type { VipAccessState } from "@/lib/vip/constants";

export function VipAccessGate({ status }: { status?: VipAccessState | null }) {
  const priceLabel = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(VIP_MONTHLY_PRICE_INR);

  if (status === "member_pending") {
    return (
      <div className="mx-4 flex flex-col items-center rounded-3xl border border-amber-500/20 bg-zinc-950 px-6 py-10 text-center text-zinc-100 shadow-2xl">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[6px] border border-amber-500/30 bg-zinc-900">
          <Clock className="h-8 w-8 text-amber-400" strokeWidth={1.75} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90">Under review</p>
        <h2 className="mt-2 text-xl font-bold text-white">VIP profile submitted</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
          Our team is verifying your elite profile. You&apos;ll get access to the VIP circle once approved.
        </p>
      </div>
    );
  }

  if (status === "member_rejected") {
    return (
      <div className="mx-4 flex flex-col items-center rounded-3xl border border-red-500/20 bg-zinc-950 px-6 py-10 text-center text-zinc-100 shadow-2xl">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[6px] border border-red-500/30 bg-zinc-900">
          <XCircle className="h-8 w-8 text-red-400" strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-bold text-white">VIP application not approved</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
          You can still subscribe as a VIP member to access the elite network.
        </p>
        <Link
          href="/subscription?plan=vip"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-6 h-12 rounded-xl bg-white font-bold text-zinc-950 hover:bg-zinc-100",
          )}
        >
          Subscribe to VIP — {priceLabel}/mo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-4 flex flex-col items-center rounded-3xl border border-white/10 bg-zinc-950 px-6 py-10 text-center text-zinc-100 shadow-2xl">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[6px] border border-amber-500/30 bg-zinc-900">
        <Crown className="h-8 w-8 text-amber-400" strokeWidth={1.75} />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90">Saathini VIP</p>
      <h2 className="mt-2 text-xl font-bold text-white">Elite circle · invite-only</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
        Meet Uttarakhand&apos;s top entrepreneurs, influencers, actresses, and celebrities.
        Subscribe at {priceLabel}/month or join with an invite code as a verified public figure.
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <Link
          href="/subscription?plan=vip"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 rounded-xl bg-white font-bold text-zinc-950 hover:bg-zinc-100",
          )}
        >
          <Lock className="mr-2 h-4 w-4" />
          Subscribe to VIP
        </Link>
        <p className="text-[11px] text-zinc-500">
          Public figures: complete onboarding with your VIP invite code for team verification.
        </p>
      </div>
    </div>
  );
}
