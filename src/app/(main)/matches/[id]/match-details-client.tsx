"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  MapPin,
  GraduationCap,
  Briefcase,
  MoreHorizontal,
  Flag,
  Ban,
  Share2,
} from "lucide-react";
import { FloatingBackButton } from "@/components/common/floating-back-button";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SettingsMenuDivider, SettingsMenuRow } from "@/components/ui/settings-menu";
import { StaggerChildren, StaggerItem } from "@/components/common/page-transition";
import { PhotoGallery } from "@/components/profile/photo-gallery";
import { FloatingActions } from "@/components/profile/floating-actions";
import { CompatibilitySection } from "@/components/profile/compatibility-section";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { DetailInfoChip } from "@/components/profile/detail-info-row";
import { BannedProfilePage } from "@/components/seo/banned-profile-page";
import { findDiscoverProfile } from "@/data/all-discover-profiles";
import { useEditProfile } from "@/hooks/use-edit-profile";
import { calculateCompatibility } from "@/lib/matching/compatibility";
import { getIntentLabel, formatProfileLocation } from "@/lib/helpers/formatters";
import { sendInterest, sendChatRequest } from "@/services/actions";
import { mapDiscoverProfile } from "@/lib/profiles/map-api-profile";
import { useShortlistStore } from "@/store";
import type { DiscoverProfile } from "@/types";

function ProfileActionsSheet({
  open,
  onOpenChange,
  profileId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Profile options"
      centeredTitle
      showClose={false}
      size="default"
    >
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-[var(--shadow-soft)]">
        <SettingsMenuRow
          href={`/settings/report?profile=${profileId}`}
          icon={Flag}
          label="Report profile"
          description="Tell us if something feels wrong"
        />
        <SettingsMenuDivider />
        <SettingsMenuRow
          icon={Ban}
          label="Block user"
          description="They won't see your profile"
          destructive
          onClick={() => onOpenChange(false)}
        />
        <SettingsMenuDivider />
        <SettingsMenuRow
          icon={Share2}
          label="Share profile"
          description="Send to family or friends"
          onClick={() => onOpenChange(false)}
        />
      </div>
    </BottomSheet>
  );
}

export function MatchDetailsClient({ profileId }: { profileId: string }) {
  const router = useRouter();
  const { profile: myProfile } = useEditProfile();
  const [profile, setProfile] = useState<DiscoverProfile | undefined>(() =>
    findDiscoverProfile(profileId)
  );
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const toggleShortlist = useShortlistStore((s) => s.toggle);
  const isShortlisted = useShortlistStore((s) => s.has(profile?.id ?? ""));

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/profiles?id=${encodeURIComponent(profileId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data) {
          setProfile(mapDiscoverProfile(json.data as Record<string, unknown>));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return <BannedProfilePage profileId={profileId} />;
  }

  const compatibility = myProfile
    ? calculateCompatibility(myProfile, profile)
    : calculateCompatibility(profile, profile);

  const handleChatRequest = async () => {
    await sendChatRequest({
      receiver_profile_id: profile.id,
      message: `Hi ${profile.full_name.split(" ")[0]}, I'd love to connect!`,
    });
    setRequestSent(true);
  };

  const handleSendInterest = async () => {
    await sendInterest(profile.id);
  };

  return (
    <div className="relative min-h-screen bg-muted/20 pb-28">
      <FloatingBackButton />

      <div className="absolute right-5 top-12 z-50">
        <button
          type="button"
          onClick={() => setActionsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-[6px] glass-dark text-white transition-colors hover:bg-black/40"
          aria-label="More options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <PhotoGallery photos={profile.photos} name={profile.full_name} hideBottomGradient />

      <FloatingActions
        onPass={() => router.back()}
        onLike={handleSendInterest}
        onBookmark={() => toggleShortlist(profile.id)}
        isBookmarked={isShortlisted}
      />

      <div className="relative z-10 -mt-10 rounded-t-[6px] bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="mx-auto w-10 pt-3">
          <div className="h-1 rounded-[6px] bg-border/80" />
        </div>

        <StaggerChildren className="space-y-5 px-5 pb-6 pt-4">
          <StaggerItem>
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile.full_name}, {profile.age}
                  </h1>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {formatProfileLocation(profile)}
                  </p>
                </div>
                {profile.verification.face_verified && (
                  <Shield
                    className="h-6 w-6 shrink-0 animate-scale-bounce text-primary"
                    fill="currentColor"
                  />
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <DetailInfoChip icon={<GraduationCap className="h-3.5 w-3.5" />} value={profile.education} />
                <DetailInfoChip icon={<Briefcase className="h-3.5 w-3.5" />} value={profile.profession} />
              </div>

              <div className="mt-4 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Intent</p>
                    <p className="mt-0.5 text-sm font-medium text-primary">{getIntentLabel(profile.intent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trust Score</p>
                    <div className="mt-0.5 flex items-center justify-end gap-1.5">
                      <Shield className="h-4 w-4 text-success" />
                      <span className="text-sm font-bold text-success">{profile.trust_score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <CompatibilitySection
              score={compatibility.score}
              name={profile.full_name.split(" ")[0]}
              strongMatches={compatibility.strong_matches}
              warnings={compatibility.mismatch_warnings}
            />
          </StaggerItem>

          <StaggerItem>
            <ProfileTabs
              bio={profile.bio}
              city={profile.city}
              district={profile.district}
              region={profile.region}
              education={profile.education}
              profession={profile.profession}
              lifestyle={profile.lifestyle}
              familyBackground={profile.family_background}
              personalityTags={profile.personality_tags}
              interestTags={profile.interest_tags}
              valuesTags={profile.values_tags}
            />
          </StaggerItem>
        </StaggerChildren>
      </div>

      <div className="app-dock safe-bottom border-t border-border/50 bg-white/95 p-4 glass">
        <div className="mx-auto flex gap-3 lg:max-w-2xl">
          <Button
            className="flex-1 shadow-[var(--shadow-float)]"
            onClick={handleChatRequest}
            disabled={requestSent}
          >
            {requestSent ? "Request Sent" : "Connect Now"}
          </Button>
          <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary-muted">
            Send Message
          </Button>
        </div>
      </div>

      <ProfileActionsSheet open={actionsOpen} onOpenChange={setActionsOpen} profileId={profile.id} />
    </div>
  );
}
