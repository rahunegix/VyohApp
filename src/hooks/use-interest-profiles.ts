"use client";

import { useEffect, useState } from "react";
import type { InterestEntry } from "@/lib/constants/discover-tabs";
import { mapDiscoverProfile } from "@/lib/profiles/map-api-profile";

function mapLikeRows(
  rows: Record<string, unknown>[],
  direction: "sent" | "received"
): InterestEntry[] {
  return rows
    .map((row) => {
      const profileRow =
        direction === "sent"
          ? (row.receiver as Record<string, unknown>)
          : (row.sender as Record<string, unknown>);
      if (!profileRow?.id) return null;
      return {
        profile: mapDiscoverProfile(profileRow),
        at: new Date(String(row.created_at ?? Date.now())).toLocaleDateString(),
      };
    })
    .filter(Boolean) as InterestEntry[];
}

export function useReceivedInterests(): InterestEntry[] {
  const [entries, setEntries] = useState<InterestEntry[]>([]);

  useEffect(() => {
    fetch("/api/likes?direction=received")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setEntries(mapLikeRows(json.data, "received"));
        }
      })
      .catch(() => setEntries([]));
  }, []);

  return entries;
}

export function useSentInterests(): InterestEntry[] {
  const [entries, setEntries] = useState<InterestEntry[]>([]);

  useEffect(() => {
    fetch("/api/likes?direction=sent")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setEntries(mapLikeRows(json.data, "sent"));
        }
      })
      .catch(() => setEntries([]));
  }, []);

  return entries;
}
