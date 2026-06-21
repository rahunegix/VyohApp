"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Switch } from "@/components/ui/switch";
import { SettingsMenuGroup, SettingsMenuDivider } from "@/components/ui/settings-menu";
import { cn } from "@/lib/helpers/utils";

const NOTIFICATION_SETTINGS = [
  { key: "interests", label: "Interests", desc: "When someone sends interest in your profile" },
  { key: "matches", label: "Matches", desc: "When you get a mutual match" },
  { key: "messages", label: "Messages", desc: "New chat messages" },
  { key: "requests", label: "Chat Requests", desc: "Incoming connection requests" },
  { key: "verification", label: "Verification", desc: "Verification updates" },
] as const;

export default function NotificationsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    interests: true,
    matches: true,
    messages: true,
    requests: true,
    verification: true,
  });

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/settings" title="Notifications" subtitle="Choose what you hear about" />

      <SettingsMenuGroup className="mx-4 mt-4">
        {NOTIFICATION_SETTINGS.map((item, i) => (
          <div key={item.key}>
            {i > 0 && <SettingsMenuDivider />}
            <div className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={settings[item.key]}
                onCheckedChange={(checked) => setSettings((s) => ({ ...s, [item.key]: checked }))}
                aria-label={item.label}
                className={cn(settings[item.key] && "data-[state=checked]:bg-primary")}
              />
            </div>
          </div>
        ))}
      </SettingsMenuGroup>
    </div>
  );
}
