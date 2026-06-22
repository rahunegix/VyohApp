"use client";

import { useEffect, useState } from "react";
import { getMyProfile } from "@/services/actions";
import { useAuthStore } from "@/store";
import type { Profile } from "@/types";

export function useEditProfile() {
  const authProfile = useAuthStore((s) => s.profile);
  const setAuthProfile = useAuthStore((s) => s.setProfile);
  const [profile, setProfile] = useState<Profile | null>(authProfile);
  const [loading, setLoading] = useState(!authProfile);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fromDb = await getMyProfile();
      if (cancelled) return;
      if (fromDb) {
        setProfile(fromDb);
        setAuthProfile(fromDb);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authProfile, setAuthProfile]);

  const patchProfile = (patch: Partial<Profile>) => {
    if (!profile) return;
    const next = { ...profile, ...patch };
    setProfile(next);
    setAuthProfile(next);
  };

  return { profile, loading, patchProfile };
}
