"use client";

import { useEffect } from "react";
import { fetchAuthMe } from "@/lib/auth/client-session";
import { useAuthStore } from "@/store";
import { usePlatformStore } from "@/store/platform";
import type { Platform } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, logout } = useAuthStore();
  const setActivePlatform = usePlatformStore((s) => s.setActivePlatform);
  const setAvailablePlatforms = usePlatformStore((s) => s.setAvailablePlatforms);

  useEffect(() => {
    const syncSession = async () => {
      try {
        const res = await fetchAuthMe();
        if (!res.ok) {
          logout();
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (json.data?.user) setUser(json.data.user);
        if (json.data?.profile) setProfile(json.data.profile);
        if (json.data?.active_platform) {
          setActivePlatform(json.data.active_platform as Platform);
        }
        if (Array.isArray(json.data?.platforms)) {
          setAvailablePlatforms(json.data.platforms as Platform[]);
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    syncSession();
  }, [setUser, setProfile, setLoading, logout, setActivePlatform, setAvailablePlatforms]);

  return <>{children}</>;
}
