"use client";

import { Bell, Lock, Ban, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsMenuGroup, SettingsMenuDivider, SettingsMenuRow } from "@/components/ui/settings-menu";

const SETTINGS_ITEMS = [
  { href: "/settings/privacy", label: "Privacy Settings", icon: Lock, desc: "Control what others see" },
  { href: "/settings/notifications", label: "Notifications", icon: Bell, desc: "Manage alerts" },
  { href: "/settings/blocked", label: "Blocked Users", icon: Ban, desc: "Manage blocked profiles" },
  { href: "/settings/delete", label: "Delete Account", icon: Trash2, desc: "Permanently remove account", destructive: true },
] as const;

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack title="Settings" subtitle="Account & preferences" />

      <div className="mx-4 mt-4 space-y-6">
        <SettingsMenuGroup>
          {SETTINGS_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.href}>
                {i > 0 && <SettingsMenuDivider />}
                <SettingsMenuRow
                  href={item.href}
                  icon={Icon}
                  label={item.label}
                  description={item.desc}
                  destructive={"destructive" in item && item.destructive}
                />
              </div>
            );
          })}
        </SettingsMenuGroup>

        <div>
          <LogoutButton />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Sign out of your account on this device
          </p>
        </div>
      </div>
    </div>
  );
}
