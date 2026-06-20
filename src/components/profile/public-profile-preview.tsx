"use client";

import Image from "next/image";
import { MapPin, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/helpers/utils";
import { getRegionLabel } from "@/lib/helpers/formatters";
import type { Region } from "@/types";

export interface PublicProfilePreviewProps {
  photoUrl?: string;
  fullName: string;
  age?: number | null;
  city?: string | null;
  district?: string | null;
  region?: Region | null;
  intentLabel?: string;
  profession?: string | null;
  education?: string | null;
  bio: string;
  personalityTags?: string[];
  faceVerified?: boolean;
  loading?: boolean;
  className?: string;
  educationLabel?: string;
  regionLabel?: string;
}

function formatLocation(
  city?: string | null,
  district?: string | null,
  region?: Region | null
): string {
  const parts = [city, district, region ? getRegionLabel(region) : null].filter(Boolean);
  return parts.join(" · ") || "Uttarakhand";
}

function PreviewSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-t-3xl bg-muted" />
      <div className="px-5 -mt-16 relative z-10 pb-5">
        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)] space-y-3">
          <div className="h-7 w-48 rounded bg-muted" />
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-muted" />
            <div className="h-6 w-24 rounded-full bg-muted" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicProfilePreview({
  photoUrl,
  fullName,
  age,
  city,
  district,
  region,
  intentLabel,
  profession,
  education,
  bio,
  personalityTags = [],
  faceVerified = true,
  loading = false,
  className,
  educationLabel = "Education",
  regionLabel = "Region",
}: PublicProfilePreviewProps) {
  if (loading) return <PreviewSkeleton />;

  const location = formatLocation(city, district, region);
  const displayName = age ? `${fullName}, ${age}` : fullName;
  const regionDisplay = region ? getRegionLabel(region) : null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-border/40 bg-background shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="relative aspect-[4/5] bg-muted">
        {photoUrl ? (
          <Image src={photoUrl} alt={fullName} fill className="object-cover" sizes="480px" priority />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/10 text-4xl font-semibold text-primary">
            {getInitials(fullName)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="px-5 -mt-16 relative z-10 pb-5">
        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight">{displayName}</h1>
              <p className="flex items-center gap-1 text-muted-foreground mt-1 text-sm">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            </div>
            {faceVerified && (
              <Shield className="h-6 w-6 shrink-0 text-primary" fill="currentColor" aria-label="Verified" />
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {intentLabel && <Badge>{intentLabel}</Badge>}
            {profession && <Badge variant="secondary">{profession}</Badge>}
            {education && <Badge variant="outline">{education}</Badge>}
          </div>

          {bio && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{bio}</p>
          )}

          {personalityTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {personalityTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {(education || regionDisplay) && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {education && (
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{educationLabel}</p>
                <p className="text-sm font-medium mt-0.5">{education}</p>
              </div>
            )}
            {regionDisplay && (
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{regionLabel}</p>
                <p className="text-sm font-medium mt-0.5 capitalize">{regionDisplay}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Compact discover-feed card — how others first see you while scrolling. */
export function DiscoverFeedPreview({
  photoUrl,
  fullName,
  age,
  city,
  district,
  intentLabel,
  bio,
  faceVerified = true,
  className,
}: Pick<
  PublicProfilePreviewProps,
  "photoUrl" | "fullName" | "age" | "city" | "district" | "intentLabel" | "bio" | "faceVerified" | "className"
>) {
  const location = [city, district].filter(Boolean).join(", ") || "Uttarakhand";
  const displayName = age ? `${fullName}, ${age}` : fullName;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="relative aspect-[3/4] w-full bg-muted">
        {photoUrl ? (
          <Image src={photoUrl} alt={fullName} fill className="object-cover" sizes="480px" />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/10 text-4xl font-semibold text-primary">
            {getInitials(fullName)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            {faceVerified && <Shield className="h-4 w-4 text-primary" fill="currentColor" />}
          </div>
          <p className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </p>
          {intentLabel && (
            <div className="mt-2">
              <Badge className="bg-white/20 text-white backdrop-blur-sm border-0">{intentLabel}</Badge>
            </div>
          )}
        </div>
      </div>
      {bio && (
        <div className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
        </div>
      )}
    </div>
  );
}
