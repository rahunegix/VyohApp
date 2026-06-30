"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EditSectionShell } from "@/components/profile/edit/shared";
import { VIP_PROFESSION_TIERS, type VipDetails } from "@/lib/vip/constants";
import { updateVipProfile } from "@/services/actions";
import type { Profile } from "@/types";

export function EditVipForm({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (patch: Partial<Profile>) => void;
}) {
  const router = useRouter();
  const initial = (profile.vip_details ?? {}) as VipDetails;
  const [details, setDetails] = useState<VipDetails>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (key: keyof VipDetails, value: string) => {
    setDetails((d) => ({ ...d, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = await updateVipProfile(details);
    setSaving(false);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : "Could not save");
      return;
    }
    onSaved({ vip_details: details });
    router.push("/profile/edit");
  };

  return (
    <form onSubmit={handleSave}>
      <EditSectionShell error={error} saving={saving} saveLabel="Save VIP details">
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-amber-300">
          <Crown className="h-5 w-5" />
          <p className="text-sm font-semibold">Saathini VIP public profile</p>
        </div>

        {profile.vip_approval_status === "pending" ? (
          <p className="mb-4 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
            Your VIP profile is under team review.
          </p>
        ) : null}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Professional category</label>
            <select
              value={details.profession_tier ?? ""}
              onChange={(e) => setField("profession_tier", e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">Select…</option>
              {VIP_PROFESSION_TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Public role / title</label>
            <Input
              value={details.public_role ?? ""}
              onChange={(e) => setField("public_role", e.target.value)}
              placeholder="e.g. Founder, Actress, Content creator"
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Company / brand</label>
            <Input
              value={details.company ?? ""}
              onChange={(e) => setField("company", e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Instagram</label>
            <Input
              value={details.instagram ?? ""}
              onChange={(e) => setField("instagram", e.target.value)}
              placeholder="@username"
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">LinkedIn</label>
            <Input
              value={details.linkedin ?? ""}
              onChange={(e) => setField("linkedin", e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">YouTube</label>
            <Input
              value={details.youtube ?? ""}
              onChange={(e) => setField("youtube", e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </EditSectionShell>
    </form>
  );
}
