"use client";

import { useMemo } from "react";
import { useInterestStore } from "@/store";
import { findDiscoverProfile } from "@/data/all-discover-profiles";
import type { InterestEntry } from "@/lib/constants/discover-tabs";

function resolveEntries(
  entries: { profileId: string; at: string; mutual?: boolean }[]
): InterestEntry[] {
  const resolved: InterestEntry[] = [];

  for (const entry of entries) {
      const profile = findDiscoverProfile(entry.profileId);
    if (!profile) continue;
    resolved.push({ profile, at: entry.at, mutual: entry.mutual });
  }

  return resolved;
}

export function useReceivedInterests(): InterestEntry[] {
  const received = useInterestStore((s) => s.received);
  return useMemo(() => resolveEntries(received), [received]);
}

export function useSentInterests(): InterestEntry[] {
  const sent = useInterestStore((s) => s.sent);
  return useMemo(() => resolveEntries(sent), [sent]);
}
