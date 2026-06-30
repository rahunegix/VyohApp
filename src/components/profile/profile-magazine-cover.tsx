"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Shield, Sparkles, Briefcase, Camera, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiCard } from "@/components/saathi";
import { getIntentLabel, getTrustLevel } from "@/lib/helpers/formatters";
import { cn, getInitials } from "@/lib/helpers/utils";
import { RADIUS } from "@/design/tokens";
import type { Profile } from "@/types";

interface ProfileMagazineCoverProps {
  profile: Profile;
  photoUrl?: string | null;
  photoCount?: number;
  className?: string;
}

function computeProfileStrength(profile: Profile, photoCount: number): number {
  let score = 35;
  if (profile.full_name) score += 10;
  if (profile.bio || profile.ai_bio) score += 15;
  if (profile.profession) score += 8;
  if (profile.education) score += 7;
  if (photoCount >= 1) score += 15;
  if (photoCount >= 2) score += 10;
  score += Math.round((profile.trust_score ?? 0) * 0.1);
  return Math.min(100, score);
}

export function ProfileMagazineCover({
  profile,
  photoUrl,
  photoCount = 0,
  className,
}: ProfileMagazineCoverProps) {
  const trust = getTrustLevel(profile.trust_score);
  const strength = computeProfileStrength(profile, photoCount);
  const location = [profile.city, profile.district].filter(Boolean).join(" · ");
  const tags = [...(profile.interest_tags ?? []), ...(profile.values_tags ?? [])].slice(0, 5);
  const visibilityGain = Math.max(8, Math.round((100 - strength) * 0.35));

  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden shadow-[var(--shadow-elevated)]"
        style={{ borderRadius: RADIUS.card }}
      >
        {/* Hero portrait */}
        <div className="relative aspect-[3/4] max-h-[420px] w-full sm:aspect-[4/5]">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={profile.full_name}
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 640px) 100vw, 480px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
              <span className="font-display text-6xl text-primary/40">
                {getInitials(profile.full_name)}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
          <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />

          {/* Top badges */}
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
            <Badge className="border-0 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {getIntentLabel(profile.intent)}
            </Badge>
            <div className="flex items-center gap-1.5 rounded-[6px] bg-white/15 px-2.5 py-1 backdrop-blur-md">
              <Shield className="h-3.5 w-3.5 text-emerald-300" fill="currentColor" />
              <span className="text-[11px] font-semibold text-white">{trust.label}</span>
            </div>
          </div>

          {/* Bottom identity */}
          <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Your profile</p>
            <h1 className="mt-1 font-display text-3xl font-normal tracking-tight text-white sm:text-4xl">
              {profile.full_name}
              {profile.age ? `, ${profile.age}` : ""}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/85">
              {profile.profession && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {profile.profession}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[6px] bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Profile strength ring */}
          <div className="absolute bottom-5 right-5 flex flex-col items-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-[6px] bg-black/40 backdrop-blur-md ring-2 ring-white/20">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(strength / 100) * 175.9} 175.9`}
                  className="text-primary"
                />
              </svg>
              <span className="text-sm font-bold text-white">{strength}%</span>
            </div>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/70">Strength</span>
          </div>
        </div>

        {/* Glass stats strip */}
        <div className="grid grid-cols-3 divide-x divide-border/40 border-t border-border/30 bg-white/95 backdrop-blur-xl">
          {[
            { label: "Trust", value: profile.trust_score, suffix: "%", icon: Shield },
            { label: "Readiness", value: profile.readiness_score, suffix: "%", icon: Sparkles },
            { label: "Photos", value: photoCount, suffix: "", icon: Camera },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-2 py-4">
              <stat.icon className="mb-1.5 h-4 w-4 text-primary/70" />
              <p className="text-lg font-bold text-foreground">
                {stat.value}
                {stat.suffix && (
                  <span className="text-xs font-semibold text-muted-foreground">{stat.suffix}</span>
                )}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Saathi coach nudge */}
      {strength < 90 && (
        <AiCard
          variant="improve"
          title="Saathi"
          body={`You're at ${strength}%. A few small updates could increase visibility by about +${visibilityGain}%.`}
          action={{
            label: "Improve my profile",
            onClick: () => {
              window.location.href = "/profile/readiness";
            },
          }}
          className="mt-4"
        />
      )}

      <div className="mt-4 flex gap-2">
        <Link href="/profile/preview" className="flex-1">
          <Button
            variant="outline"
            className="h-12 w-full border-primary/25 bg-primary/5 font-bold text-primary hover:bg-primary/10"
          >
            Preview public profile
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/profile/edit/photos">
          <Button size="icon" variant="secondary" className="h-12 w-12 shrink-0 rounded-[6px]">
            <Camera className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {(profile.bio || profile.ai_bio) && (
        <div
          className="mt-4 border border-border/50 bg-white/80 p-4 backdrop-blur-sm"
          style={{ borderRadius: RADIUS.card }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">About</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-4">
            {profile.bio || profile.ai_bio}
          </p>
        </div>
      )}
    </div>
  );
}
