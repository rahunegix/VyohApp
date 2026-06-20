"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { PageHeader } from "@/components/common/page-header";
import { CompatibilitySection } from "@/components/profile/compatibility-section";
import { ListSkeleton } from "@/components/ui/skeleton";
import { DEMO_PROFILES, DEMO_CURRENT_PROFILE } from "@/services/demo-data";
import { calculateCompatibility } from "@/lib/matching/compatibility";
import { getIntentLabel } from "@/lib/helpers/formatters";
import type { DiscoverProfile } from "@/types";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CompatibilityPage() {
  const [matches, setMatches] = useState<(DiscoverProfile & { compatibility: ReturnType<typeof calculateCompatibility> })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enriched = DEMO_PROFILES
      .map((p) => ({ ...p, compatibility: calculateCompatibility(DEMO_CURRENT_PROFILE, p) }))
      .sort((a, b) => b.compatibility.score - a.compatibility.score);
    
    // Simulate loading for premium feel
    setTimeout(() => {
      setMatches(enriched);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <PageHeader title="Compatibility Hub" subtitle="Deep insights into your best matches" />
      </div>

      {loading ? (
        <div className="px-4 py-6">
          <ListSkeleton count={3} />
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="px-4 py-6 space-y-5"
        >
          {matches.map((profile) => (
            <motion.div key={profile.id} variants={itemVariants}>
              <div className="rounded-[1.5rem] bg-card overflow-hidden shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] group">
                <Link href={`/matches/${profile.id}`} className="block">
                  {/* Header Area */}
                  <div className="flex items-center gap-4 p-4 pb-0">
                    <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-muted shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      {profile.photos[0] && (
                        <Image src={profile.photos[0].url} alt={profile.full_name} fill className="object-cover" sizes="64px" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate text-foreground">{profile.full_name}, {profile.age}</p>
                      <p className="text-sm font-medium text-muted-foreground truncate mt-0.5">{profile.district}</p>
                      <div className="mt-1.5 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {getIntentLabel(profile.intent)}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Compatibility Ring Area */}
                <div className="p-4">
                  <CompatibilitySection
                    score={profile.compatibility.score}
                    name={profile.full_name.split(" ")[0]}
                    strongMatches={profile.compatibility.strong_matches}
                    warnings={profile.compatibility.mismatch_warnings}
                    className="border-0 shadow-none p-0 bg-transparent"
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
