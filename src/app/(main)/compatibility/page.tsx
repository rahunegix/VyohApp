"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ChevronRight, Shield } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { CompatibilitySection } from "@/components/profile/compatibility-section";
import { ListSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-states";
import { calculateCompatibility } from "@/lib/matching/compatibility";
import { getIntentLabel } from "@/lib/helpers/formatters";
import { mapDiscoverProfile } from "@/lib/profiles/map-api-profile";
import type { DiscoverProfile } from "@/types";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function CompatibilityPage() {
  const [matches, setMatches] = useState<
    (DiscoverProfile & { compatibility: ReturnType<typeof calculateCompatibility> })[]
  >([]);
  const [loading, setLoading] = useState(true);

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
        const profiles = rows.map((row: Record<string, unknown>) => mapDiscoverProfile(row));

        let myProfile: DiscoverProfile | null = null;
        if (meJson.success && meJson.data?.profile) {
          myProfile = mapDiscoverProfile(meJson.data.profile as Record<string, unknown>);
        }

        const enriched = profiles
          .map((profile: DiscoverProfile) => ({
            ...profile,
            compatibility: myProfile
              ? calculateCompatibility(myProfile, profile)
              : {
                  score: profile.trust_score ?? 70,
                  explanation: "Compatibility score based on profile data.",
                  strong_matches: [],
                  mismatch_warnings: [],
                },
          }))
          .sort(
            (
              a: DiscoverProfile & { compatibility: ReturnType<typeof calculateCompatibility> },
              b: DiscoverProfile & { compatibility: ReturnType<typeof calculateCompatibility> }
            ) => b.compatibility.score - a.compatibility.score
          );

        setMatches(enriched);
      } catch {
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <PageHeader title="Compatibility Hub" subtitle="Deep insights into your best matches" />
      </div>

      {!loading && matches.length > 0 && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ranked by values, lifestyle, location, and intent — tailored for Uttarakhand matrimony on Saathini.
          </p>
        </div>
      )}

      {loading ? (
        <div className="px-4 py-6">
          <ListSkeleton count={3} />
        </div>
      ) : matches.length === 0 ? (
        <div className="mx-4 mt-8">
          <EmptyState
            icon="heart"
            title="No matches to compare yet"
            description="Complete your profile and explore Discover to see compatibility scores."
          />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4 px-4 py-6"
        >
          {matches.map((profile) => (
            <motion.div key={profile.id} variants={itemVariants}>
              <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-white shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)]">
                <Link href={`/matches/${profile.id}`} className="block">
                  <div className="flex items-center gap-4 p-4 pb-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted shadow-sm ring-2 ring-white">
                      {profile.photos[0] && (
                        <Image
                          src={profile.photos[0].url}
                          alt={profile.full_name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold text-foreground">
                        {profile.full_name}, {profile.age}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-muted-foreground">{profile.district}</p>
                      <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {getIntentLabel(profile.intent)}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                  </div>
                </Link>

                <div className="border-t border-border/40 px-4 py-3">
                  <CompatibilitySection
                    score={profile.compatibility.score}
                    name={profile.full_name.split(" ")[0]}
                    strongMatches={profile.compatibility.strong_matches}
                    warnings={profile.compatibility.mismatch_warnings}
                    className="border-0 bg-transparent p-0 shadow-none"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
