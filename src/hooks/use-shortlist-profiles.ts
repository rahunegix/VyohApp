"use client";

import { useMemo } from "react";
import { useShortlistStore } from "@/store";
import { findDiscoverProfile } from "@/data/all-discover-profiles";
import type { InterestEntry } from "@/lib/constants/discover-tabs";

export function useShortlistProfiles(): InterestEntry[] {
  const entries = useShortlistStore((s) => s.entries);

  return useMemo(
    () =>
      entries
        .map((entry) => {
          const profile = findDiscoverProfile(entry.profileId);
          if (!profile) return null;
          return { profile, at: entry.at };
        })
        .filter((item): item is InterestEntry => item !== null),
    [entries]
  );
}
