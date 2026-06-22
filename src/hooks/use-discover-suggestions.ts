"use client";

import { useEffect, useState } from "react";
import { filterDiscoverProfiles } from "@/lib/discover/filter-profiles";
import { calculateCompatibility } from "@/lib/matching/compatibility";
import { mapDiscoverProfile } from "@/lib/profiles/map-api-profile";
import { useDiscoverFiltersStore } from "@/store";
import type { DiscoverProfile } from "@/types";

export function useDiscoverSuggestions(): DiscoverProfile[] {
  const filters = useDiscoverFiltersStore((s) => s.applied);
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [myProfile, setMyProfile] = useState<DiscoverProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profilesRes, meRes] = await Promise.all([
          fetch("/api/profiles"),
          fetch("/api/auth/me"),
        ]);
        const profilesJson = await profilesRes.json();
        const meJson = await meRes.json();

        if (cancelled) return;

        const rows = Array.isArray(profilesJson.data) ? profilesJson.data : [];
        const mapped = rows.map((row: Record<string, unknown>) => mapDiscoverProfile(row));
        setProfiles(mapped);

        if (meJson.success && meJson.data?.profile) {
          setMyProfile(mapDiscoverProfile(meJson.data.profile as Record<string, unknown>));
        }
      } catch {
        if (!cancelled) setProfiles([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return filterDiscoverProfiles(
    profiles.map((profile) => ({
      ...profile,
      compatibility: myProfile
        ? calculateCompatibility(myProfile, profile)
        : {
            score: profile.trust_score ?? 70,
            explanation: "Compatibility score based on profile data.",
            strong_matches: [],
            mismatch_warnings: [],
          },
    })),
    filters
  );
}
