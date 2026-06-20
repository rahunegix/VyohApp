"use client";

import { useMemo } from "react";
import { DEMO_SUGGESTIONS } from "@/services/demo-interests";
import { DEMO_CURRENT_PROFILE } from "@/services/demo-data";
import { calculateCompatibility } from "@/lib/matching/compatibility";
import { filterDiscoverProfiles } from "@/lib/discover/filter-profiles";
import { useDiscoverFiltersStore } from "@/store";
import type { DiscoverProfile } from "@/types";

export function useDiscoverSuggestions(): DiscoverProfile[] {
  const filters = useDiscoverFiltersStore((s) => s.applied);

  return useMemo(() => {
    const enriched = DEMO_SUGGESTIONS.map((profile) => ({
      ...profile,
      compatibility: calculateCompatibility(DEMO_CURRENT_PROFILE, profile),
    }));
    return filterDiscoverProfiles(enriched, filters);
  }, [filters]);
}
