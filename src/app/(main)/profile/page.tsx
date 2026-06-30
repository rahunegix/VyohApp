"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Shield, Settings, Crown, HelpCircle,
  Edit2, Sparkles, Users, Heart, PenLine, BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ProfileMagazineCover } from "@/components/profile/profile-magazine-cover";
import { SettingsMenuGroup, SettingsMenuDivider, SettingsMenuRow } from "@/components/ui/settings-menu";
import { useEditProfile } from "@/hooks/use-edit-profile";
import { LogoutButton } from "@/components/auth/logout-button";
import { ListSkeleton, MagazineCoverSkeleton } from "@/components/ui/skeleton";
import { RADIUS } from "@/design/tokens";

const MENU_ITEMS = [
  { href: "/profile/edit", label: "Edit Profile", icon: Edit2, highlight: false },
  { href: "/trust-center", label: "Trust Center", icon: Shield, highlight: false },
  { href: "/profile/readiness", label: "Relationship Readiness", icon: Heart, highlight: false },
  { href: "/profile/ai-summary", label: "AI Summary", icon: Sparkles, highlight: true },
  { href: "/profile/family", label: "Family Access", icon: Users, highlight: false },
  { href: "/subscription", label: "Subscription", icon: Crown, highlight: true },
  { href: "/success-stories", label: "Success Stories", icon: BookOpen, highlight: false },
  { href: "/share-your-story", label: "Share your story", icon: PenLine, highlight: false },
  { href: "/settings", label: "Settings & Privacy", icon: Settings, highlight: false },
  { href: "/help", label: "Help & Support", icon: HelpCircle, highlight: false },
];

export default function ProfilePage() {
  const { profile, loading } = useEditProfile();
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/profiles/photos")
      .then((r) => r.json())
      .then((json) => {
        const rows = Array.isArray(json.data) ? json.data : [];
        setPhotos(rows.map((row: { url?: string }) => row.url).filter(Boolean) as string[]);
      })
      .catch(() => undefined);
  }, []);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-24">
        <PageHeader title="Me" transparent className="relative z-10" />
        <div className="px-4 py-4">
          <MagazineCoverSkeleton />
          <div className="mt-6">
            <ListSkeleton count={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-24">
      <PageHeader title="Me" transparent className="relative z-10" />

      <div className="relative px-4 pb-8 pt-2 lg:mx-auto lg:max-w-lg lg:px-6">
        <ProfileMagazineCover
          profile={profile}
          photoUrl={photos[0] ?? null}
          photoCount={photos.length}
        />

        <div className="mx-0 mt-6" style={{ borderRadius: RADIUS.card }}>
          <SettingsMenuGroup>
            {MENU_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.href}>
                  {i > 0 && <SettingsMenuDivider />}
                  <SettingsMenuRow
                    href={item.href}
                    icon={Icon}
                    label={item.label}
                    trailing={
                      item.highlight ? (
                        <span className="mr-1 h-2 w-2 animate-pulse rounded-[6px] bg-primary" />
                      ) : undefined
                    }
                  />
                </div>
              );
            })}
          </SettingsMenuGroup>
        </div>

        <div className="mt-4">
          <SettingsMenuGroup>
            <LogoutButton variant="menu" />
          </SettingsMenuGroup>
        </div>
      </div>
    </div>
  );
}
