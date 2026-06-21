"use client";

import Link from "next/link";
import { MapPin, Shield, GraduationCap, Briefcase, HeartHandshake, Bookmark, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { PhotoGallery } from "@/components/profile/photo-gallery";
import { cn } from "@/lib/helpers/utils";
import { getIntentLabel, formatProfileLocation } from "@/lib/helpers/formatters";
import { FloatingActions } from "@/components/profile/floating-actions";
import type { DiscoverProfile } from "@/types";

interface ProfileCardProps {
  profile: DiscoverProfile;
  onSendInterest?: () => void;
  onShortlist?: () => void;
  shortlisted?: boolean;
  onPass?: () => void;
  onView?: () => void;
  profileHref?: string;
  layout?: "default" | "feed";
  className?: string;
}

export function ProfileCard({
  profile,
  onSendInterest,
  onShortlist,
  shortlisted = false,
  onPass,
  onView,
  profileHref,
  layout = "default",
  className,
}: ProfileCardProps) {
  const isFeed = layout === "feed";

  const hasFloatingActions = isFeed && (onSendInterest || onShortlist || onPass);

  if (isFeed) {
    const detailLine = [profile.profession, profile.education].filter(Boolean).join(" · ");

    return (
      <div
        className={cn(
          "relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] bg-black shadow-[var(--shadow-elevated)]",
          className
        )}
      >
        {profileHref && (
          <Link
            href={profileHref}
            className="absolute inset-0 z-[1]"
            aria-label={`View ${profile.full_name}'s profile`}
          />
        )}

        <div className="relative min-h-0 flex-1">
          <PhotoGallery
            photos={profile.photos ?? []}
            name={profile.full_name}
            isolateInteractions
            hideBottomGradient
            className="h-full w-full !aspect-auto min-h-[280px]"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 card-photo-gradient pb-[4.5rem] pt-20" />

          <div className="pointer-events-none absolute inset-x-0 bottom-[4.5rem] z-20 px-4 text-white">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Badge className="border-0 bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                {getIntentLabel(profile.intent)}
              </Badge>
              {profile.compatibility && (
                <Badge className="border-0 bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  {profile.compatibility.score}% Match
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-xl font-extrabold tracking-tight drop-shadow-sm sm:text-2xl">
                {profile.full_name}, {profile.age}
              </h2>
              {profile.verification?.face_verified && (
                <Shield className="h-4 w-4 shrink-0 drop-shadow-sm" fill="currentColor" />
              )}
            </div>

            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-white/90 drop-shadow-sm sm:text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatProfileLocation(profile)}</span>
            </p>

            {detailLine && (
              <p className="mt-1 truncate text-[11px] text-white/80 sm:text-xs">{detailLine}</p>
            )}
          </div>
        </div>

        {hasFloatingActions && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center px-3">
            <div className="pointer-events-auto">
              <FloatingActions
                overlap={false}
                onPass={onPass}
                onLike={onSendInterest}
                onBookmark={onShortlist}
                isBookmarked={shortlisted}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const photoSection = (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-hidden rounded-t-[2rem]",
        "aspect-square rounded-[2rem]"
      )}
    >
      <PhotoGallery
        photos={profile.photos ?? []}
        name={profile.full_name}
        isolateInteractions
        className={cn("h-full", "aspect-square")}
      />
    </div>
  );

  const contentSection = (
    <div className="relative z-0 flex flex-1 flex-col rounded-b-[2rem] bg-white px-5 pb-5 pt-6">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {getIntentLabel(profile.intent)}
          </Badge>
          {profile.compatibility && (
            <Badge className="bg-primary text-white border-0 text-xs font-bold">
              {profile.compatibility.score}% Match
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-bold text-2xl text-foreground truncate">
            {profile.full_name}, {profile.age}
          </h2>
          {profile.verification?.face_verified && (
            <Shield className="h-5 w-5 text-primary shrink-0" fill="currentColor" />
          )}
        </div>

        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
          {formatProfileLocation(profile)}
        </p>

        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4">
          <div className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground line-clamp-1" title={profile.education ?? undefined}>
              {profile.education}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground line-clamp-1" title={profile.profession ?? undefined}>
              {profile.profession}
            </span>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-2 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              &ldquo;{profile.bio}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const profileBody = (
    <div className="flex h-full w-full flex-col">
      {photoSection}
      {profileHref ? (
        <Link href={profileHref} className="flex min-h-0 flex-1 flex-col">
          {contentSection}
        </Link>
      ) : (
        <div
          className={cn("flex flex-1 flex-col", onView && "cursor-pointer")}
          onClick={onView}
          onKeyDown={onView ? (e) => e.key === "Enter" && onView() : undefined}
          role={onView ? "button" : undefined}
          tabIndex={onView ? 0 : undefined}
        >
          {contentSection}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-elevated)]",
        "aspect-[3/4] h-auto min-h-[500px]",
        className
      )}
    >
      {profileBody}

      {(onSendInterest || onShortlist || onPass) && (
        <div className="flex shrink-0 items-center justify-center gap-4 p-4 border-t border-border/50 bg-white">
          {onPass && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPass(); }}
              className="flex items-center justify-center rounded-full border-2 border-border bg-white text-muted-foreground transition-all active:scale-95 hover:border-destructive hover:text-destructive h-12 w-12"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>
          )}
          {onShortlist && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShortlist(); }}
              className={cn(
                "flex items-center justify-center rounded-full border-2 transition-all active:scale-95 h-12 w-12",
                shortlisted ? "border-primary bg-primary/10 text-primary" : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              <Bookmark className={cn("h-5 w-5", shortlisted && "fill-current")} />
            </button>
          )}
          {onSendInterest && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSendInterest(); }}
              className="flex items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all active:scale-95 hover:bg-primary/90 h-14 w-14"
            >
              <HeartHandshake className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Keeping this for backwards compatibility if used elsewhere
export function CompatibilityCard({
  score,
  name,
  strongMatches,
  warnings,
}: {
  score: number;
  name: string;
  strongMatches: string[];
  warnings: string[];
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Compatibility with</p>
          <p className="text-lg font-semibold">{name}</p>
        </div>
        <div className="text-3xl font-bold text-primary">{score}%</div>
      </div>
      <ProgressBar value={score} className="mb-4" />
      {strongMatches.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {strongMatches.map((m) => (
            <p key={m} className="text-sm text-success flex items-center gap-1.5">
              <span>✓</span> {m}
            </p>
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="space-y-1.5">
          {warnings.map((w) => (
            <p key={w} className="text-sm text-warning flex items-center gap-1.5">
              <span>!</span> {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
