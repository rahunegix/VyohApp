import type { Intent, Region } from "@/types";

export interface DiscoverFilters {
  ageMin: number;
  ageMax: number;
  regions: Region[];
  intents: Intent[];
  verifiedOnly: boolean;
  minCompatibility: number;
}

export const DEFAULT_DISCOVER_FILTERS: DiscoverFilters = {
  ageMin: 21,
  ageMax: 45,
  regions: [],
  intents: [],
  verifiedOnly: false,
  minCompatibility: 0,
};

export const DISCOVER_AGE_MIN = 18;
export const DISCOVER_AGE_MAX = 60;

export function isDiscoverFiltersActive(filters: DiscoverFilters): boolean {
  const d = DEFAULT_DISCOVER_FILTERS;
  return (
    filters.ageMin !== d.ageMin ||
    filters.ageMax !== d.ageMax ||
    filters.regions.length > 0 ||
    filters.intents.length > 0 ||
    filters.verifiedOnly ||
    filters.minCompatibility > 0
  );
}
