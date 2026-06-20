import type { DiscoverFilters } from "@/lib/constants/discover-filters";
import type { DiscoverProfile } from "@/types";

export function filterDiscoverProfiles(
  profiles: DiscoverProfile[],
  filters: DiscoverFilters
): DiscoverProfile[] {
  return profiles.filter((profile) => {
    if (profile.age < filters.ageMin || profile.age > filters.ageMax) return false;

    if (
      filters.regions.length > 0 &&
      profile.region &&
      !filters.regions.includes(profile.region)
    ) {
      return false;
    }

    if (filters.intents.length > 0 && !filters.intents.includes(profile.intent)) {
      return false;
    }

    if (filters.verifiedOnly && !profile.verification?.face_verified) {
      return false;
    }

    if (
      filters.minCompatibility > 0 &&
      (profile.compatibility?.score ?? 0) < filters.minCompatibility
    ) {
      return false;
    }

    return true;
  });
}
