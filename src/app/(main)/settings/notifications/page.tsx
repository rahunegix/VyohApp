"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Switch } from "@/components/ui/switch";

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
    <div>
      <PageHeader showBack backHref="/settings" title="Notifications" />
      <div className="px-4 py-4 space-y-1">
        {NOTIFICATION_SETTINGS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 rounded-xl p-4 hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={settings[item.key]}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, [item.key]: checked }))
              }
              aria-label={item.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
