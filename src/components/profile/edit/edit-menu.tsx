"use client";

import Link from "next/link";
import {
  User, Compass, Sparkles, Camera, Heart, Users, ChevronRight, Lock,
} from "lucide-react";
import { getLocalizedGenders } from "@/lib/i18n";
import { useTranslation } from "@/hooks/use-translation";
import type { Profile } from "@/types";
import type { StringKey } from "@/lib/i18n";

const MENU_ITEMS: {
  href: string;
  labelKey: StringKey;
  descKey: StringKey;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { href: "/profile/edit/basic-info", labelKey: "basic_info", descKey: "edit_menu_basic_desc", icon: User },
  { href: "/profile/edit/intent", labelKey: "edit_menu_intent", descKey: "edit_menu_intent_desc", icon: Compass },
  { href: "/profile/edit/personality", labelKey: "profile_assistant", descKey: "edit_menu_personality_desc", icon: Sparkles },
  { href: "/profile/edit/photos", labelKey: "add_photos", descKey: "edit_menu_photos_desc", icon: Camera },
  { href: "/profile/edit/lifestyle", labelKey: "lifestyle", descKey: "edit_menu_lifestyle_desc", icon: Heart },
  { href: "/profile/edit/family", labelKey: "family_bg", descKey: "edit_menu_family_desc", icon: Users },
];

export function EditProfileMenu({ profile }: { profile: Profile }) {
  const { t, language } = useTranslation();
  const genderLabel = getLocalizedGenders(language).find((g) => g.value === profile.gender)?.label;

  return (
    <div className="pb-6">
      <p className="px-4 pb-3 text-sm text-muted-foreground">{t("edit_menu_subtitle")}</p>

      <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t("gender_locked")}</p>
          <p className="text-sm font-medium capitalize">{genderLabel ?? profile.gender}</p>
        </div>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/50"
            >
              <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium">{t(item.labelKey)}</span>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{t(item.descKey)}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
