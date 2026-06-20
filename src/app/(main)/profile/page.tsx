"use client";

import Link from "next/link";
import {
  Shield, Settings, Crown, HelpCircle, ChevronRight,
  Edit2, Sparkles, Users, Heart, Camera, PenLine, BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { DEMO_CURRENT_PROFILE } from "@/services/demo-data";
import { getIntentLabel, getTrustLevel } from "@/lib/helpers/formatters";
import { cn } from "@/lib/helpers/utils";
import { LogoutButton } from "@/components/auth/logout-button";

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
  const profile = DEMO_CURRENT_PROFILE;
  const trust = getTrustLevel(profile.trust_score);

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader title="Profile" transparent className="relative z-10" />

      {/* Hero Section */}
      <div className="relative pt-6 pb-8 px-5 lg:mx-auto lg:max-w-2xl">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-4 group">
            <div className="h-28 w-28 rounded-full overflow-hidden bg-primary/10 border-4 border-white shadow-lg relative">
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary">
                {profile.full_name[0]}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-transform active:scale-95">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">{profile.full_name}</h2>
          <p className="text-sm font-medium text-muted-foreground mb-4">
            {profile.profession} · {profile.city}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-white border-border shadow-sm text-foreground hover:bg-white">{getIntentLabel(profile.intent)}</Badge>
            <Badge variant="success" className="shadow-sm">{trust.label}</Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Trust Score", value: profile.trust_score, suffix: "%", color: "text-success", icon: Shield },
            { label: "Readiness", value: profile.readiness_score, suffix: "%", color: "text-primary", icon: Heart },
            { label: "Completeness", value: 78, suffix: "%", color: "text-blue-500", icon: Sparkles },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center rounded-2xl bg-white border border-border/50 p-4 shadow-[var(--shadow-soft)] transition-transform hover:scale-105">
              <stat.icon className={cn("h-5 w-5 mb-2 opacity-80", stat.color)} />
              <div className="flex items-baseline gap-0.5">
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <span className="text-xs font-semibold text-muted-foreground">{stat.suffix}</span>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-1 text-center">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mb-8">
        <Link href="/profile/preview" className="block">
          <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary/10 border border-primary/20 py-3.5 text-[15px] font-bold text-primary shadow-sm transition-all hover:bg-primary/15 active:scale-[0.98]">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Preview Public Profile
          </button>
        </Link>
      </div>

      {/* Menu List */}
      <div className="px-5 space-y-3">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] active:scale-[0.98]"
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                item.highlight ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="flex-1 text-[15px] font-semibold text-foreground">
                {item.label}
              </span>
              {item.highlight && (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse mr-2" />
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
            </Link>
          );
        })}
      </div>

      <div className="px-5 mt-6">
        <LogoutButton variant="menu" />
      </div>
    </div>
  );
}
