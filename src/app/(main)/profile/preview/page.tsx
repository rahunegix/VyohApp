"use client";

import { useRouter } from "next/navigation";
import { Shield, MapPin, GraduationCap, Briefcase, Eye } from "lucide-react";
import { FloatingBackButton } from "@/components/common/floating-back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerChildren, StaggerItem } from "@/components/common/page-transition";
import { PhotoGallery } from "@/components/profile/photo-gallery";
import { DetailInfoChip } from "@/components/profile/detail-info-row";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { DEMO_CURRENT_PROFILE, DEMO_CURRENT_PROFILE_PHOTOS, DEMO_VERIFICATION } from "@/services/demo-data";
import { getIntentLabel, formatProfileLocation } from "@/lib/helpers/formatters";

export default function ProfilePreviewPage() {
  const router = useRouter();
  const profile = DEMO_CURRENT_PROFILE;

  const previewProfile = {
    ...profile,
    full_name: profile.full_name === "You" ? "Your Name" : profile.full_name,
    verification: DEMO_VERIFICATION,
  };

  return (
    <div className="pb-24 bg-muted/20 min-h-screen relative">
      <FloatingBackButton />

      <div className="absolute top-12 right-5 z-50">
        <Badge className="bg-primary/90 text-white border-0 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase shadow-md gap-1.5">
          <Eye className="h-3 w-3" />
          Preview
        </Badge>
      </div>

      <PhotoGallery
        photos={DEMO_CURRENT_PROFILE_PHOTOS}
        name={previewProfile.full_name.split(" ")[0]}
      />

      <StaggerChildren className="px-5 mt-4 space-y-5">
        <StaggerItem>
          <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {previewProfile.full_name}, {profile.age}
                </h1>
                <p className="flex items-center gap-1.5 text-muted-foreground mt-1 text-sm">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {formatProfileLocation(previewProfile)}
                </p>
              </div>
              {DEMO_VERIFICATION.face_verified && (
                <Shield className="h-6 w-6 shrink-0 text-primary animate-scale-bounce" fill="currentColor" />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <DetailInfoChip
                icon={<GraduationCap className="h-3.5 w-3.5" />}
                value={profile.education}
              />
              <DetailInfoChip
                icon={<Briefcase className="h-3.5 w-3.5" />}
                value={profile.profession}
              />
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
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              This is how others see your profile in discover and match views.
            </p>
            <p className="text-xs text-primary font-medium mt-1">
              Swipe photos above to preview your gallery
            </p>
          </div>
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
            onClick={() => router.push("/profile/edit")}
          >
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary-muted rounded-xl"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
