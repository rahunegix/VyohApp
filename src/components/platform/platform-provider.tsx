"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  PLATFORM_CONFIG,
  getPlatformFromPathname,
  type Platform,
} from "@/lib/platform";
import { usePlatformStore } from "@/store/platform";

const PlatformContext = createContext<{
  platform: Platform;
  config: (typeof PLATFORM_CONFIG)[Platform];
}>({
  platform: "dating",
  config: PLATFORM_CONFIG.dating,
});

export function PlatformProvider({
  platform: platformProp,
  children,
}: {
  platform?: Platform;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const setActivePlatform = usePlatformStore((s) => s.setActivePlatform);
  const platform =
    platformProp ?? getPlatformFromPathname(pathname) ?? usePlatformStore.getState().activePlatform;

  useEffect(() => {
    setActivePlatform(platform);
  }, [platform, setActivePlatform]);

  const value = useMemo(
    () => ({ platform, config: PLATFORM_CONFIG[platform] }),
    [platform]
  );

  return (
    <PlatformContext.Provider value={value}>
      <div className={PLATFORM_CONFIG[platform].primaryClass} data-platform={platform}>
        {children}
      </div>
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  return useContext(PlatformContext);
}
