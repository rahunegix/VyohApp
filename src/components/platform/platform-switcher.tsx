"use client";

import { useRouter, usePathname } from "next/navigation";
import { Crown, Heart, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/helpers/utils";
import {
  PLATFORMS,
  PLATFORM_CONFIG,
  platformPath,
  stripPlatformPrefix,
  type Platform,
} from "@/lib/platform";
import { usePlatformStore } from "@/store/platform";
import { useAuthStore } from "@/store";

const ICONS = {
  dating: Heart,
  matrimony: HeartHandshake,
  vip: Crown,
} as const;

const ACTIVE_STYLES: Record<Platform, string> = {
  dating: "bg-primary text-white shadow-sm",
  matrimony: "bg-amber-600 text-white shadow-sm",
  vip: "bg-zinc-900 text-amber-300 shadow-sm ring-1 ring-amber-500/40",
};

export function PlatformSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const activePlatform = usePlatformStore((s) => s.activePlatform);
  const availablePlatforms = usePlatformStore((s) => s.availablePlatforms);
  const setActivePlatform = usePlatformStore((s) => s.setActivePlatform);
  const setAvailablePlatforms = usePlatformStore((s) => s.setAvailablePlatforms);

  const switchTo = async (platform: Platform) => {
    if (platform === activePlatform) return;

    if (isAuthenticated) {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch", platform }),
      });
      const json = await res.json();
      if (!json.success) {
        if (json.code === "PROFILE_MISSING") {
          const createRes = await fetch("/api/platform", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create", platform }),
          });
          const created = await createRes.json();
          if (!created.success) return;
          setAvailablePlatforms([...new Set([...availablePlatforms, platform])]);
          router.push("/onboarding/gender");
          return;
        }
        return;
      }
      setAvailablePlatforms([...new Set([...availablePlatforms, platform])]);
    }

    setActivePlatform(platform);
    const tail = stripPlatformPrefix(pathname);
    router.push(platformPath(platform, tail));
  };

  return (
    <div
      className={cn(
        "flex rounded-[6px] border border-border/60 bg-muted/40 p-0.5",
        className
      )}
      role="tablist"
      aria-label="Switch platform"
    >
      {PLATFORMS.map((platform) => {
        const Icon = ICONS[platform];
        const active = activePlatform === platform;
        const config = PLATFORM_CONFIG[platform];
        return (
          <button
            key={platform}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => void switchTo(platform)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-[6px] px-2 py-2 text-[10px] font-bold transition-all sm:gap-1.5 sm:px-3 sm:text-xs",
              active ? ACTIVE_STYLES[platform] : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            <span className="truncate">{config.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
