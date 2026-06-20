"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  emptyAdminProfileForm,
  FAMILY_FIELDS,
  LIFESTYLE_FIELDS,
  type AdminProfileFormState,
} from "@/lib/admin/user-profile-schema";
import type { AdminAccountFormState } from "@/lib/admin/map-api-user-to-forms";
import { AdminPhotoUploader, uploadPendingPhotoUrls } from "@/components/admin/admin-photo-uploader";

const TABS = [
  { id: "account", label: "Account" },
  { id: "basic", label: "Basic info" },
  { id: "matching", label: "Matching" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "family", label: "Family" },
  { id: "photos", label: "Photos" },
  { id: "trust", label: "Trust" },
  { id: "scores", label: "Scores & tags" },
  { id: "admin", label: "Admin" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  mode: "create" | "edit";
  userId?: string;
  initialAccount?: Partial<AdminAccountFormState>;
  initialProfile?: Partial<AdminProfileFormState>;
}

export function UserProfileEditor({ mode, userId, initialAccount, initialProfile }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("account");
  const [account, setAccount] = useState<AdminAccountFormState>({
    email: initialAccount?.email ?? "",
    phone: initialAccount?.phone ?? "",
    password: initialAccount?.password ?? "",
    role: initialAccount?.role ?? "user",
    is_active: initialAccount?.is_active ?? true,
  });
  const [profile, setProfile] = useState<AdminProfileFormState>({
    ...emptyAdminProfileForm(),
    ...initialProfile,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>(initialProfile?.photo_urls ?? []);

  const setLifestyle = (key: string, value: string) => {
    setProfile((p) => ({ ...p, lifestyle: { ...p.lifestyle, [key]: value } }));
  };

  const setFamily = (key: string, value: string) => {
    setProfile((p) => ({ ...p, family_background: { ...p.family_background, [key]: value } }));
  };

  const save = async () => {
    setLoading(true);
    setError("");
    try {
      let photo_urls = photos.filter(Boolean);
      const hasPendingUploads = photo_urls.some((url) => url.startsWith("data:"));

      const payload = {
        ...account,
        password: account.password || undefined,
        profile: {
          ...profile,
          photo_urls: hasPendingUploads && mode === "create" ? [] : photo_urls,
        },
      };

      const url = mode === "create" ? "/api/admin/users" : `/api/admin/users/${userId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Save failed");
        return;
      }

      const savedUserId = (json.data?.id as string | undefined) ?? userId;

      if (savedUserId && photo_urls.some((p) => p.startsWith("data:"))) {
        photo_urls = await uploadPendingPhotoUrls(savedUserId, photo_urls);
        const patchRes = await fetch(`/api/admin/users/${savedUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: { photo_urls } }),
        });
        const patchJson = await patchRes.json();
        if (!patchJson.success) {
          setError(patchJson.error || "Photos uploaded but profile update failed");
          return;
        }
        setPhotos(photo_urls);
      }

      if (mode === "create" && savedUserId) {
        router.push(`/admin/users/${savedUserId}`);
        router.refresh();
        return;
      }

      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!userId || !confirm("Delete this user and all profile data?")) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      alert(json.error || "Delete failed");
      return;
    }
    router.push("/admin/users");
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/users" className="rounded-lg p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === "create" ? "Create user" : profile.full_name || "Edit user"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Full account + profile editor — all fields visible in the app profile
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {mode === "edit" && userId && (
            <Button variant="outline" className="text-destructive" onClick={deleteUser}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <Button loading={loading} onClick={save}>
            <Save className="h-4 w-4" />
            {mode === "create" ? "Create user" : "Save all changes"}
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              tab === t.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        {tab === "account" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><Input value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} /></Field>
            <Field label="Phone (+91)"><Input value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} placeholder="9876543210" /></Field>
            <Field label={mode === "create" ? "Password (required for admin)" : "New password (optional)"}>
              <Input type="password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} />
            </Field>
            <Field label="Role">
              <Select value={account.role} onChange={(v) => setAccount({ ...account, role: v as "user" | "admin" })} options={[["user", "Member"], ["admin", "Admin"]]} />
            </Field>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={account.is_active} onChange={(e) => setAccount({ ...account, is_active: e.target.checked })} />
              Active account (uncheck to suspend)
            </label>
          </div>
        )}

        {tab === "basic" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></Field>
            <Field label="Date of birth"><Input type="date" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} /></Field>
            <Field label="City"><Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></Field>
            <Field label="District"><Input value={profile.district} onChange={(e) => setProfile({ ...profile, district: e.target.value })} /></Field>
            <Field label="Village"><Input value={profile.village} onChange={(e) => setProfile({ ...profile, village: e.target.value })} /></Field>
            <Field label="Region">
              <Select value={profile.region} onChange={(v) => setProfile({ ...profile, region: v })} options={[["", "—"], ["garhwal", "Garhwal"], ["kumaon", "Kumaon"], ["both", "Both"], ["diaspora", "Diaspora"]]} />
            </Field>
            <Field label="Education"><Input value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })} /></Field>
            <Field label="Profession"><Input value={profile.profession} onChange={(e) => setProfile({ ...profile, profession: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Bio"><Textarea rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></Field></div>
            <div className="sm:col-span-2"><Field label="AI bio"><Textarea rows={3} value={profile.ai_bio} onChange={(e) => setProfile({ ...profile, ai_bio: e.target.value })} /></Field></div>
            <Field label="AI profile summary"><Textarea rows={2} value={profile.ai_profile_summary} onChange={(e) => setProfile({ ...profile, ai_profile_summary: e.target.value })} /></Field>
            <Field label="AI relationship style"><Input value={profile.ai_relationship_style} onChange={(e) => setProfile({ ...profile, ai_relationship_style: e.target.value })} /></Field>
            <Field label="AI communication style"><Input value={profile.ai_communication_style} onChange={(e) => setProfile({ ...profile, ai_communication_style: e.target.value })} /></Field>
          </div>
        )}

        {tab === "matching" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Gender">
              <Select value={profile.gender} onChange={(v) => setProfile({ ...profile, gender: v })} options={[["", "—"], ["male", "Male"], ["female", "Female"], ["other", "Other"]]} />
            </Field>
            <Field label="Looking for">
              <Select value={profile.looking_for} onChange={(v) => setProfile({ ...profile, looking_for: v })} options={[["", "—"], ["male", "Men"], ["female", "Women"], ["everyone", "Everyone"]]} />
            </Field>
            <Field label="Intent">
              <Select value={profile.intent} onChange={(v) => setProfile({ ...profile, intent: v })} options={[["exploring", "Exploring"], ["serious", "Serious"], ["marriage", "Marriage"]]} />
            </Field>
            <Field label="Profile status">
              <Select value={profile.profile_status} onChange={(v) => setProfile({ ...profile, profile_status: v })} options={[["draft", "Draft"], ["active", "Active"], ["hidden", "Hidden"], ["suspended", "Suspended"]]} />
            </Field>
          </div>
        )}

        {tab === "lifestyle" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {LIFESTYLE_FIELDS.map((field) => (
              <Field key={field.key} label={field.label}>
                <Select
                  value={profile.lifestyle[field.key] ?? ""}
                  onChange={(v) => setLifestyle(field.key, v)}
                  options={[["", "—"], ...field.options.map((o) => [o, o] as [string, string])]}
                />
              </Field>
            ))}
          </div>
        )}

        {tab === "family" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {FAMILY_FIELDS.map((field) =>
              field.options.length ? (
                <Field key={field.key} label={field.label}>
                  <Select
                    value={profile.family_background[field.key] ?? ""}
                    onChange={(v) => setFamily(field.key, v)}
                    options={[["", "—"], ...field.options.map((o) => [o, o] as [string, string])]}
                  />
                </Field>
              ) : (
                <Field key={field.key} label={field.label}>
                  <Input
                    value={profile.family_background[field.key] ?? ""}
                    onChange={(e) => setFamily(field.key, e.target.value)}
                  />
                </Field>
              )
            )}
          </div>
        )}

        {tab === "photos" && (
          <AdminPhotoUploader userId={userId} photos={photos} onChange={setPhotos} />
        )}

        {tab === "trust" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["mobile_verified", "Mobile verified"],
              ["face_verified", "Face verified"],
              ["id_verified", "ID verified"],
              ["family_verified", "Family / reference verified"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={profile[key as keyof AdminProfileFormState] as boolean}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.checked } as AdminProfileFormState)}
                />
                {label}
              </label>
            ))}
          </div>
        )}

        {tab === "scores" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Trust score (0–100)"><Input type="number" min={0} max={100} value={profile.trust_score} onChange={(e) => setProfile({ ...profile, trust_score: Number(e.target.value) })} /></Field>
            <Field label="Compatibility score"><Input type="number" min={0} max={100} value={profile.compatibility_score} onChange={(e) => setProfile({ ...profile, compatibility_score: Number(e.target.value) })} /></Field>
            <Field label="Readiness score"><Input type="number" min={0} max={100} value={profile.readiness_score} onChange={(e) => setProfile({ ...profile, readiness_score: Number(e.target.value) })} /></Field>
            <Field label="Personality tags (comma separated)"><Input value={profile.personality_tags} onChange={(e) => setProfile({ ...profile, personality_tags: e.target.value })} /></Field>
            <Field label="Interest tags"><Input value={profile.interest_tags} onChange={(e) => setProfile({ ...profile, interest_tags: e.target.value })} /></Field>
            <Field label="Values tags"><Input value={profile.values_tags} onChange={(e) => setProfile({ ...profile, values_tags: e.target.value })} /></Field>
            <Field label="AI personality tags"><Input value={profile.ai_personality_tags} onChange={(e) => setProfile({ ...profile, ai_personality_tags: e.target.value })} /></Field>
            <Field label="AI interest tags"><Input value={profile.ai_interest_tags} onChange={(e) => setProfile({ ...profile, ai_interest_tags: e.target.value })} /></Field>
          </div>
        )}

        {tab === "admin" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Profile origin">
              <Select value={profile.profile_origin} onChange={(v) => setProfile({ ...profile, profile_origin: v })} options={[["member", "Member"], ["seed", "Seed / bot"]]} />
            </Field>
            <Field label="Bot max replies"><Input type="number" min={0} max={20} value={profile.bot_max_replies} onChange={(e) => setProfile({ ...profile, bot_max_replies: Number(e.target.value) })} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={profile.is_chat_bot} onChange={(e) => setProfile({ ...profile, is_chat_bot: e.target.checked })} /> Chat bot profile</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={profile.bot_chat_enabled} onChange={(e) => setProfile({ ...profile, bot_chat_enabled: e.target.checked })} /> Bot replies enabled</label>
            <div className="sm:col-span-2"><Field label="Admin notes"><Textarea rows={3} value={profile.admin_notes} onChange={(e) => setProfile({ ...profile, admin_notes: e.target.value })} /></Field></div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary">Tab: {TABS.find((t) => t.id === tab)?.label}</Badge>
        <Badge variant={account.is_active ? "success" : "outline"}>{account.is_active ? "Active" : "Suspended"}</Badge>
        <Badge variant="outline" className="capitalize">{profile.profile_status}</Badge>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      className="h-10 w-full rounded-xl border border-border px-3 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(([v, l]) => (
        <option key={v || "empty"} value={v}>{l}</option>
      ))}
    </select>
  );
}
