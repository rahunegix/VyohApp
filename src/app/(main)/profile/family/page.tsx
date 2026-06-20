"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FAMILY_RELATION_OPTIONS } from "@/lib/constants/verification";
import { useFamilyAccessStore, type FamilyAccessLevel } from "@/store/family-access";
import { useTranslation } from "@/hooks/use-translation";
import type { StringKey } from "@/lib/i18n";
import { cn } from "@/lib/helpers/utils";
import { Plus, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";

const selectClass =
  "mt-1 flex h-12 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function FamilyAccessPage() {
  const { t, hydrated } = useTranslation();
  const {
    enabled,
    allowViewProfile,
    allowRespondInterests,
    allowEditProfile,
    members,
    setEnabled,
    setAllowViewProfile,
    setAllowRespondInterests,
    setAllowEditProfile,
    addMember,
    removeMember,
  } = useFamilyAccessStore();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [accessLevel, setAccessLevel] = useState<FamilyAccessLevel>("view");
  const [message, setMessage] = useState("");

  const accessToggles = [
    {
      key: "view",
      label: t("family_access_view"),
      desc: t("family_access_view_desc"),
      checked: allowViewProfile,
      onChange: setAllowViewProfile,
      disabled: !enabled,
    },
    {
      key: "respond",
      label: t("family_access_respond"),
      desc: t("family_access_respond_desc"),
      checked: allowRespondInterests,
      onChange: setAllowRespondInterests,
      disabled: !enabled,
    },
    {
      key: "edit",
      label: t("family_access_edit"),
      desc: t("family_access_edit_desc"),
      checked: allowEditProfile,
      onChange: setAllowEditProfile,
      disabled: !enabled,
    },
  ] as const;

  const handleAddMember = () => {
    if (!name.trim() || !relation || phone.replace(/\D/g, "").length < 10) return;
    const relationLabel =
      t(FAMILY_RELATION_OPTIONS.find((o) => o.value === relation)?.key as StringKey) || relation;

    addMember({
      name: name.trim(),
      relation: relationLabel,
      phone,
      verified: false,
      accessLevel,
    });
    setName("");
    setRelation("");
    setPhone("");
    setAccessLevel("view");
    setShowForm(false);
    setMessage(t("family_member_added"));
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader
        showBack
        backHref="/profile"
        title={t("family_access_title")}
        subtitle={t("family_access_subtitle")}
      />

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]">
          <p className="text-sm leading-relaxed text-muted-foreground">{t("family_access_desc")}</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t("family_access_toggle")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("family_access_toggle_desc")}</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} aria-label={t("family_access_toggle")} />
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-white shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="border-b border-border/50 px-4 py-3">
            <p className="text-sm font-semibold">Access permissions</p>
          </div>
          {accessToggles.map((item) => (
            <div
              key={item.key}
              className={cn(
                "flex items-center justify-between gap-4 border-b border-border/40 px-4 py-3 last:border-0",
                item.disabled && "opacity-50"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={item.checked}
                onCheckedChange={item.onChange}
                disabled={item.disabled}
                aria-label={item.label}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <h2 className="text-base font-bold">{t("family_members")}</h2>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-xl"
            onClick={() => setShowForm((v) => !v)}
            disabled={!enabled}
          >
            <Plus className="h-4 w-4" />
            {t("family_add_member")}
          </Button>
        </div>

        {message && (
          <div className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
            {message}
          </div>
        )}

        {showForm && enabled && (
          <div className="space-y-4 rounded-2xl border border-primary/20 bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 text-primary">
              <UserPlus className="h-5 w-5" />
              <p className="font-semibold">{t("family_add_member")}</p>
            </div>
            <div>
              <label className="text-sm font-medium">{t("ref_contact_name")}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder={t("ref_name_ph")} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("ref_relation")}</label>
              <select value={relation} onChange={(e) => setRelation(e.target.value)} className={selectClass}>
                <option value="">{t("select")}</option>
                {FAMILY_RELATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.key as StringKey)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("ref_phone")}</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="mt-1" placeholder="9876543210" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("family_access_level")}</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as FamilyAccessLevel)}
                className={selectClass}
              >
                <option value="view">{t("family_access_view_only")}</option>
                <option value="manage">{t("family_access_full")}</option>
              </select>
            </div>
            <Button onClick={handleAddMember} className="w-full rounded-xl" size="lg">
              {t("family_send_invite")}
            </Button>
          </div>
        )}

        {members.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">{t("family_members_empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-start gap-3 rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{member.name}</p>
                    <Badge variant={member.verified ? "success" : "secondary"} className="text-[10px]">
                      {member.verified ? (
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {t("family_member_verified")}
                        </span>
                      ) : (
                        t("family_member_pending")
                      )}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {member.relation} · {member.phone}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {member.accessLevel === "manage" ? t("family_access_full") : t("family_access_view_only")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(member.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={t("family_remove_member")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
