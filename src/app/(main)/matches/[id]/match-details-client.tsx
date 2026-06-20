"use client";

import { useState } from "react";
import Link from "next/link";
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
import { StaggerChildren, StaggerItem } from "@/components/common/page-transition";
import { PhotoGallery } from "@/components/profile/photo-gallery";
import { FloatingActions } from "@/components/profile/floating-actions";
import { CompatibilitySection } from "@/components/profile/compatibility-section";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { DetailInfoChip } from "@/components/profile/detail-info-row";
import { BannedProfilePage } from "@/components/seo/banned-profile-page";
import { findDiscoverProfile } from "@/data/all-discover-profiles";
import { DEMO_CURRENT_PROFILE } from "@/services/demo-data";
import { calculateCompatibility } from "@/lib/matching/compatibility";
import { getIntentLabel, formatProfileLocation } from "@/lib/helpers/formatters";
import { sendInterest, sendChatRequest } from "@/services/actions";
import { useShortlistStore } from "@/store";

function MoreMenu({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full glass-dark text-white hover:bg-black/40 transition-colors"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-border/50 bg-white p-2 shadow-lg animate-fade-up">
            <Link
              href={`/settings/report?profile=${profileId}`}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Flag className="h-4 w-4" />
              Report Profile
            </Link>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <Ban className="h-4 w-4" />
              Block User
            </button>
            <div className="my-1 h-px w-full bg-border/50" />
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
              <Share2 className="h-4 w-4" />
              Share Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function MatchDetailsClient({ profileId }: { profileId: string }) {
  const router = useRouter();
  const profile = findDiscoverProfile(profileId);
  const [requestSent, setRequestSent] = useState(false);
  const toggleShortlist = useShortlistStore((s) => s.toggle);
  const isShortlisted = useShortlistStore((s) => s.has(profile?.id ?? ""));

  if (!profile) {
    return <BannedProfilePage profileId={profileId} />;
  }

  const compatibility = calculateCompatibility(DEMO_CURRENT_PROFILE, profile);

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
    <div className="pb-24 bg-muted/20 min-h-screen relative">
      <FloatingBackButton />

      <div className="absolute top-12 right-5 z-50">
        <MoreMenu profileId={profile.id} />
      </div>

      <PhotoGallery photos={profile.photos} name={profile.full_name} />

      <FloatingActions
        onPass={() => router.back()}
        onLike={handleSendInterest}
        onBookmark={() => toggleShortlist(profile.id)}
        isBookmarked={isShortlisted}
      />

      <StaggerChildren className="px-5 mt-4 space-y-5">
        <StaggerItem>
          <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.full_name}, {profile.age}
                </h1>
                <p className="flex items-center gap-1.5 text-muted-foreground mt-1 text-sm">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {formatProfileLocation(profile)}
                </p>
              </div>
              {profile.verification.face_verified && (
                <Shield className="h-6 w-6 shrink-0 text-primary animate-scale-bounce" fill="currentColor" />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <DetailInfoChip icon={<GraduationCap className="h-3.5 w-3.5" />} value={profile.education} />
              <DetailInfoChip icon={<Briefcase className="h-3.5 w-3.5" />} value={profile.profession} />
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Intent</p>
                  <p className="text-sm font-medium mt-0.5 text-primary">{getIntentLabel(profile.intent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Trust Score</p>
                  <div className="flex items-center gap-1.5 justify-end mt-0.5">
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

      <div className="app-dock bg-white/90 glass border-t border-border/50 p-4 safe-bottom">
        <div className="flex gap-3 mx-auto lg:max-w-2xl">
          <Button
            className="flex-1 shadow-[var(--shadow-float)] rounded-xl"
            onClick={handleChatRequest}
            disabled={requestSent}
          >
            {requestSent ? "Message Request Sent" : "Connect Now"}
          </Button>
          <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary-muted rounded-xl">
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}
