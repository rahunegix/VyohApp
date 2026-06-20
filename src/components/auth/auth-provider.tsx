"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const syncSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          logout();
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (json.data?.user) setUser(json.data.user);
        if (json.data?.profile) setProfile(json.data.profile);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    syncSession();
  }, [setUser, setProfile, setLoading, logout]);

  return <>{children}</>;
}
