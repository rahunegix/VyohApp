"use client";

import {
  User, Compass, Sparkles, Camera, Heart, Users, Lock,
  type LucideIcon,
} from "lucide-react";
import { SettingsMenuGroup, SettingsMenuDivider, SettingsMenuRow } from "@/components/ui/settings-menu";
import { getLocalizedGenders } from "@/lib/i18n";
import { useTranslation } from "@/hooks/use-translation";
import type { Profile } from "@/types";
import type { StringKey } from "@/lib/i18n";

const MENU_ITEMS: {
  href: string;
  labelKey: StringKey;
  descKey: StringKey;
  icon: LucideIcon;
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

      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-border/50 bg-primary/5 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm">
          <Lock className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{t("gender_locked")}</p>
          <p className="text-sm font-semibold capitalize">{genderLabel ?? profile.gender}</p>
        </div>
      </div>

      <SettingsMenuGroup className="mx-4">
        {MENU_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.href}>
              {i > 0 && <SettingsMenuDivider />}
              <SettingsMenuRow
                href={item.href}
                icon={Icon}
                label={t(item.labelKey)}
                description={t(item.descKey)}
              />
            </div>
          );
        })}
      </SettingsMenuGroup>
    </div>
  );
}
