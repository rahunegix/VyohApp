"use client";

import { useEffect, useState } from "react";
import { filterDiscoverProfiles } from "@/lib/discover/filter-profiles";
import { calculateCompatibility } from "@/lib/matching/compatibility";
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
        const mapped: DiscoverProfile[] = rows.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          full_name: String(row.full_name ?? "Member"),
          age: Number(row.age ?? 25),
          city: String(row.city ?? ""),
          district: String(row.district ?? ""),
          region: row.region as DiscoverProfile["region"],
          education: String(row.education ?? ""),
          profession: String(row.profession ?? ""),
          bio: String(row.bio ?? ""),
          intent: row.intent as DiscoverProfile["intent"],
          trust_score: Number(row.trust_score ?? 50),
          photos: ((row.photos ?? row.profile_photos ?? []) as Record<string, unknown>[]).map(
            (p, i) => ({
              id: String(p.id ?? i),
              url: String(p.url ?? ""),
              sort_order: Number(p.sort_order ?? i),
              is_primary: Boolean(p.is_primary ?? i === 0),
              is_private: Boolean(p.is_private ?? false),
            })
          ),
          personality_tags: (row.personality_tags as string[]) ?? [],
          interest_tags: (row.interest_tags as string[]) ?? [],
          values_tags: (row.values_tags as string[]) ?? [],
          lifestyle: (row.lifestyle as Record<string, string>) ?? {},
          family_background: (row.family_background as Record<string, string>) ?? {},
          verification: {
            mobile_verified: Boolean(
              (row.verification_status as Record<string, unknown>)?.mobile_verified
            ),
            face_verified: Boolean(
              (row.verification_status as Record<string, unknown>)?.face_verified
            ),
            id_verified: Boolean(
              (row.verification_status as Record<string, unknown>)?.id_verified
            ),
          },
        }));

        setProfiles(mapped);

        if (meJson.success && meJson.data?.profile) {
          const p = meJson.data.profile as Record<string, unknown>;
          setMyProfile({
            id: String(p.id),
            full_name: String(p.full_name ?? ""),
            age: Number(p.age ?? 25),
            city: String(p.city ?? ""),
            district: String(p.district ?? ""),
            region: p.region as DiscoverProfile["region"],
            education: String(p.education ?? ""),
            profession: String(p.profession ?? ""),
            bio: String(p.bio ?? ""),
            intent: p.intent as DiscoverProfile["intent"],
            trust_score: Number(p.trust_score ?? 50),
            photos: [],
            personality_tags: [],
            interest_tags: [],
            values_tags: [],
            lifestyle: (p.lifestyle as Record<string, string>) ?? {},
            family_background: (p.family_background as Record<string, string>) ?? {},
            verification: { mobile_verified: true, face_verified: false, id_verified: false },
          });
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
        : { score: profile.trust_score ?? 70, strong_matches: [], mismatch_warnings: [] },
    })),
    filters
  );
}
