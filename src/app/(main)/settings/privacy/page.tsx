"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsMenuGroup, SettingsMenuDivider } from "@/components/ui/settings-menu";
import { updatePrivacySettings } from "@/services/actions";
import { cn } from "@/lib/helpers/utils";

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
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/settings" title="Privacy" subtitle="You're always in control" />

      <SettingsMenuGroup className="mx-4 mt-4">
        {PRIVACY_TOGGLES.map((item, i) => (
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

      <div className="mx-4 mt-6">
        <Button onClick={handleSave} loading={saving} className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
