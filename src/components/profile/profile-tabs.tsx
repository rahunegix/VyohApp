"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  Briefcase,
  Cigarette,
  Wine,
  Utensils,
  Baby,
  Plane,
  Users,
  Church,
  HandHelping,
  Sparkles,
  Heart,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DetailInfoRow, DetailInfoGrid } from "@/components/profile/detail-info-row";
import { cn } from "@/lib/helpers/utils";
import { getRegionLabel } from "@/lib/helpers/formatters";
import type { Region } from "@/types";

interface ProfileTabsProps {
  bio: string | null;
  city: string | null;
  district: string | null;
  region: Region | null;
  education: string | null;
  profession: string | null;
  lifestyle: Record<string, string> | null;
  familyBackground: Record<string, string> | null;
  personalityTags: string[];
  interestTags: string[];
  valuesTags: string[];
  className?: string;
}

const LIFESTYLE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  smoking: { label: "Smoking", icon: <Cigarette className="h-4 w-4" /> },
  drinking: { label: "Drinking", icon: <Wine className="h-4 w-4" /> },
  food_preference: { label: "Diet", icon: <Utensils className="h-4 w-4" /> },
  kids_preference: { label: "Children", icon: <Baby className="h-4 w-4" /> },
  relocation: { label: "Relocation", icon: <Plane className="h-4 w-4" /> },
};

const FAMILY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  family_type: { label: "Family Type", icon: <Users className="h-4 w-4" /> },
  religious_preference: { label: "Religion", icon: <Church className="h-4 w-4" /> },
  family_involvement: { label: "Family Role", icon: <HandHelping className="h-4 w-4" /> },
};

function formatValue(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function ProfileTabs({
  bio,
  city,
  district,
  region,
  education,
  profession,
  lifestyle,
  familyBackground,
  personalityTags,
  interestTags,
  valuesTags,
  className,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "family">("personal");

  const regionLabel = region ? getRegionLabel(region) : null;

  return (
    <div className={cn("", className)}>
      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-muted/70 p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={cn(
            "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300",
            activeTab === "personal"
              ? "tab-pill-active"
              : "tab-pill-inactive hover:text-foreground"
          )}
        >
          Personal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("family")}
          className={cn(
            "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300",
            activeTab === "family"
              ? "tab-pill-active"
              : "tab-pill-inactive hover:text-foreground"
          )}
        >
          Family Details
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-4"
        >
          {activeTab === "personal" ? (
            <PersonalTab
              bio={bio}
              city={city}
              district={district}
              regionLabel={regionLabel}
              education={education}
              profession={profession}
              lifestyle={lifestyle}
              personalityTags={personalityTags}
              interestTags={interestTags}
              valuesTags={valuesTags}
            />
          ) : (
            <FamilyTab
              familyBackground={familyBackground}
              valuesTags={valuesTags}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Personal Tab ──────────────────────────────────────────── */

function PersonalTab({
  bio,
  city,
  district,
  regionLabel,
  education,
  profession,
  lifestyle,
  personalityTags,
  interestTags,
  valuesTags,
}: {
  bio: string | null;
  city: string | null;
  district: string | null;
  regionLabel: string | null;
  education: string | null;
  profession: string | null;
  lifestyle: Record<string, string> | null;
  personalityTags: string[];
  interestTags: string[];
  valuesTags: string[];
}) {
  const location = [city, district, regionLabel].filter(Boolean).join(" · ");

  return (
    <div className="space-y-5">
      {/* Bio */}
      {bio && (
        <div className="rounded-2xl bg-muted/40 p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Quote className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Bio</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
        </div>
      )}

      {/* Core Details Grid */}
      <DetailInfoGrid>
        <DetailInfoRow
          icon={<MapPin className="h-4 w-4" />}
          label="Location"
          value={location || null}
        />
        <DetailInfoRow
          icon={<GraduationCap className="h-4 w-4" />}
          label="Education"
          value={education}
        />
        <DetailInfoRow
          icon={<Briefcase className="h-4 w-4" />}
          label="Profession"
          value={profession}
        />
        {lifestyle &&
          Object.entries(lifestyle).map(([key, value]) => {
            const config = LIFESTYLE_LABELS[key];
            if (!config || !value) return null;
            return (
              <DetailInfoRow
                key={key}
                icon={config.icon}
                label={config.label}
                value={formatValue(value)}
              />
            );
          })}
      </DetailInfoGrid>

      {/* Personality Tags */}
      {personalityTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Personality</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {personalityTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-[6px] px-3 py-1 text-xs capitalize"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Interest Tags */}
      {interestTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Heart className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Interests</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {interestTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-[6px] border border-primary/20 bg-primary-muted px-3 py-1 text-xs font-medium text-primary capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Values Tags */}
      {valuesTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">Values</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {valuesTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-[6px] px-3 py-1 text-xs capitalize"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Family Tab ────────────────────────────────────────────── */

function FamilyTab({
  familyBackground,
  valuesTags,
}: {
  familyBackground: Record<string, string> | null;
  valuesTags: string[];
}) {
  const hasData =
    familyBackground && Object.values(familyBackground).some(Boolean);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          Family details not shared yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <DetailInfoGrid>
        {familyBackground &&
          Object.entries(familyBackground).map(([key, value]) => {
            const config = FAMILY_LABELS[key];
            if (!config || !value) return null;
            return (
              <DetailInfoRow
                key={key}
                icon={config.icon}
                label={config.label}
                value={formatValue(value)}
              />
            );
          })}
      </DetailInfoGrid>

      {/* Family values from values_tags */}
      {valuesTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <HandHelping className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Family Values
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {valuesTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-[6px] px-3 py-1 text-xs capitalize"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
