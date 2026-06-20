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

  const photoSection = (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-hidden rounded-t-[2rem]",
        isFeed ? "h-[60%]" : "aspect-square rounded-[2rem]"
      )}
    >
      <PhotoGallery
        photos={profile.photos ?? []}
        name={profile.full_name}
        isolateInteractions
        className={cn("h-full", isFeed ? "aspect-auto" : "aspect-square")}
      />
    </div>
  );

  const contentSection = (
    <div
      className={cn(
        "flex-1 bg-white relative flex flex-col pb-5 px-5 rounded-b-[2rem] z-0",
        hasFloatingActions ? "pt-12" : "pt-6"
      )}
    >
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

        {isFeed && profile.bio && (
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
    <div className="flex flex-col h-full w-full">
      {photoSection}
      {profileHref ? (
        <Link
          href={profileHref}
          className="flex-1 flex flex-col min-h-0"
        >
          {contentSection}
        </Link>
      ) : (
        <div
          className={cn("flex-1 flex flex-col", onView && "cursor-pointer")}
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
        "relative rounded-[2rem] bg-card shadow-[var(--shadow-elevated)] flex flex-col",
        isFeed ? "h-full" : "aspect-[3/4] h-auto min-h-[500px] overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col h-full w-full min-h-0">
        {profileBody}
      </div>

      {hasFloatingActions && (
        <div className="absolute left-0 right-0 z-50 flex justify-center pointer-events-none top-[calc(60%-1.75rem)]">
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

      {/* Legacy Actions Bar for Default layout */}
      {(onSendInterest || onShortlist || onPass) && !isFeed && (
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
