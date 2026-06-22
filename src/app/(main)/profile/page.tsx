"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Shield, Settings, Crown, HelpCircle,
  Edit2, Sparkles, Users, Heart, Camera, PenLine, BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SettingsMenuGroup, SettingsMenuDivider, SettingsMenuRow } from "@/components/ui/settings-menu";
import { useEditProfile } from "@/hooks/use-edit-profile";
import { getIntentLabel, getTrustLevel } from "@/lib/helpers/formatters";
import { cn, getInitials } from "@/lib/helpers/utils";
import { LogoutButton } from "@/components/auth/logout-button";
import { ListSkeleton } from "@/components/ui/skeleton";

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
  const [primaryPhoto, setPrimaryPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profiles/photos")
      .then((r) => r.json())
      .then((json) => {
        const rows = Array.isArray(json.data) ? json.data : [];
        const first = rows[0] as { url?: string } | undefined;
        if (first?.url) setPrimaryPhoto(first.url);
      })
      .catch(() => undefined);
  }, []);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-muted/20 pb-24">
        <PageHeader title="Profile" transparent className="relative z-10" />
        <div className="px-5 py-8">
          <ListSkeleton count={4} />
        </div>
      </div>
    );
  }

  const trust = getTrustLevel(profile.trust_score);

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader title="Profile" transparent className="relative z-10" />

      <div className="relative px-5 pb-8 pt-6 lg:mx-auto lg:max-w-2xl">
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="group relative mb-4">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-primary/10 shadow-lg">
              {primaryPhoto ? (
                <Image src={primaryPhoto} alt={profile.full_name} fill className="object-cover" sizes="112px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary">
                  {getInitials(profile.full_name)}
                </div>
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:bg-primary/90 active:scale-95"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <h2 className="mb-1 text-2xl font-bold text-foreground">{profile.full_name}</h2>
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            {profile.profession} · {profile.city}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="border-border bg-white text-foreground shadow-sm hover:bg-white">
              {getIntentLabel(profile.intent)}
            </Badge>
            <Badge variant="success" className="shadow-sm">
              {trust.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mb-6 px-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Trust Score", value: profile.trust_score, suffix: "%", color: "text-success", icon: Shield },
            { label: "Readiness", value: profile.readiness_score, suffix: "%", color: "text-primary", icon: Heart },
            { label: "Completeness", value: 78, suffix: "%", color: "text-primary", icon: Sparkles },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]"
            >
              <stat.icon className={cn("mb-2 h-5 w-5 opacity-80", stat.color)} />
              <div className="flex items-baseline gap-0.5">
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <span className="text-xs font-semibold text-muted-foreground">{stat.suffix}</span>
              </div>
              <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 px-5">
        <Link
          href="/profile/preview"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 w-full border-primary/25 bg-primary/5 font-bold text-primary hover:bg-primary/10"
          )}
        >
          <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-primary" />
          Preview Public Profile
        </Link>
      </div>

      <div className="mx-4">
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
                      <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-primary" />
                    ) : undefined
                  }
                />
              </div>
            );
          })}
        </SettingsMenuGroup>
      </div>

      <div className="mx-4 mt-6">
        <SettingsMenuGroup>
          <LogoutButton variant="menu" />
        </SettingsMenuGroup>
      </div>
    </div>
  );
}
