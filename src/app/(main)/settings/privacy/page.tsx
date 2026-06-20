"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updatePrivacySettings } from "@/services/actions";

const PRIVACY_TOGGLES = [
  { key: "show_photos", label: "Show Photos", desc: "Allow others to see your photos" },
  { key: "show_city", label: "Show City", desc: "Display your city on profile" },
  { key: "show_district", label: "Show District", desc: "Display your district" },
  { key: "show_contact", label: "Show Contact", desc: "Allow contact unlock (premium)" },
  { key: "allow_family_access", label: "Family Access", desc: "Let family manage profile" },
  { key: "allow_search_indexing", label: "Search Indexing", desc: "Appear in search results" },
] as const;

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    show_photos: true,
    show_city: true,
    show_district: true,
    show_contact: false,
    allow_family_access: false,
    allow_search_indexing: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updatePrivacySettings(settings);
    setSaving(false);
  };

  return (
    <div>
      <PageHeader showBack backHref="/settings" title="Privacy" subtitle="You're always in control" />

      <div className="px-4 py-4 space-y-1">
        {PRIVACY_TOGGLES.map((item) => (
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

      <div className="px-4 mt-4">
        <Button onClick={handleSave} loading={saving} className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
