"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { OptionCard } from "@/components/ui/option-card";
import { PlatformPathSelector } from "@/components/onboarding/platform-path-selector";
import { OnboardingStepShell } from "@/components/onboarding/onboarding-step-shell";
import { PLATFORM_CONFIG, type Platform } from "@/lib/platform";
import { getOnboardingTotalSteps } from "@/config/onboarding";
import { VIP_PROFESSION_TIERS } from "@/lib/vip/constants";
import { RADIUS } from "@/design/tokens";
import { useOnboardingStore } from "@/store";
import { usePlatformStore } from "@/store/platform";
import { withProgress } from "@/lib/progress";

export default function PlatformOnboardingPage() {
  const router = useRouter();
  const {
    platform,
    setPlatform,
    setIntent,
    vipInviteCode,
    setVipInviteCode,
    setVipDetails,
    vipDetails,
    intent,
  } = useOnboardingStore();
  const setActivePlatform = usePlatformStore((s) => s.setActivePlatform);
  const [inviteError, setInviteError] = useState("");
  const [validating, setValidating] = useState(false);
  const [inviteOk, setInviteOk] = useState(false);

  const totalSteps = getOnboardingTotalSteps(platform, intent);

  const choose = (value: Platform) => {
    setPlatform(value);
    setActivePlatform(value);
    setIntent(PLATFORM_CONFIG[value].defaultIntent);
    if (value !== "vip") {
      setInviteError("");
      setInviteOk(false);
    }
  };

  const validateInvite = async () => {
    if (!vipInviteCode?.trim()) {
      setInviteError("Enter your VIP invite code");
      return false;
    }
    setValidating(true);
    setInviteError("");
    try {
      return await withProgress("Checking invite…", async () => {
        const res = await fetch("/api/vip/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: vipInviteCode, action: "validate" }),
        });
        const json = await res.json();
        if (!json.success) {
          setInviteError(json.error || "Invalid code");
          setInviteOk(false);
          return false;
        }
        setInviteOk(true);
        return true;
      });
    } finally {
      setValidating(false);
    }
  };

  const redeemInvite = async () =>
    withProgress("Activating VIP access…", async () => {
      const res = await fetch("/api/vip/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: vipInviteCode }),
      });
      const json = await res.json();
      if (!json.success) {
        setInviteError(json.error || "Could not redeem code");
        return false;
      }
      return true;
    });

  const onContinue = async () => {
    if (!platform) return;
    if (platform === "vip") {
      const valid = inviteOk || (await validateInvite());
      if (!valid) return;
      if (!vipDetails.profession_tier) {
        setInviteError("Select your professional category");
        return;
      }
      const redeemed = await redeemInvite();
      if (!redeemed) return;
    }
    router.push("/onboarding/intent");
  };

  const canContinue =
    platform &&
    (platform !== "vip" || (inviteOk || Boolean(vipInviteCode?.trim())) && vipDetails.profession_tier);

  return (
    <OnboardingStepShell
      backHref="/otp"
      currentStep={0}
      totalSteps={totalSteps}
      footer={
        <Button
          onClick={() => void onContinue()}
          disabled={!canContinue || validating}
          className="h-13 w-full text-[17px] font-bold shadow-[var(--shadow-glow)]"
          size="lg"
        >
          {validating ? "Checking invite…" : "Continue with Saathi"}
        </Button>
      }
    >
      <PlatformPathSelector value={platform} onChange={choose} />

      {platform === "vip" ? (
        <div
          className="mt-6 space-y-4 border border-amber-400/25 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/30 p-5 text-zinc-100 shadow-[var(--shadow-premium)]"
          style={{ borderRadius: RADIUS.card }}
        >
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-300" />
            <p className="text-sm font-bold text-amber-200">Elite invite required</p>
          </div>

          <FormField label="Invite code" error={inviteError || undefined}>
            <Input
              value={vipInviteCode ?? ""}
              onChange={(e) => {
                setVipInviteCode(e.target.value.toUpperCase());
                setInviteOk(false);
              }}
              placeholder="VIP-XXXXXXXX"
              className="border-zinc-700 bg-zinc-900/80 uppercase text-white placeholder:text-zinc-500"
            />
          </FormField>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Your category</p>
            {VIP_PROFESSION_TIERS.map((tier) => (
              <OptionCard
                key={tier.value}
                selected={vipDetails.profession_tier === tier.value}
                onClick={() => setVipDetails({ profession_tier: tier.value })}
                label={tier.label}
                accent="dark"
                className="!p-3"
              />
            ))}
          </div>

          {inviteOk ? (
            <p className="text-xs font-medium text-emerald-400">Invite code verified</p>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-amber-400/40 bg-transparent text-amber-200 hover:bg-amber-400/10"
              onClick={() => void validateInvite()}
              disabled={validating}
            >
              Verify code
            </Button>
          )}
        </div>
      ) : null}
    </OnboardingStepShell>
  );
}
