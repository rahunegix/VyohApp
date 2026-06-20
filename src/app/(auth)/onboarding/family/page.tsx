"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingStepShell, OnboardingStepHeading } from "@/components/onboarding/onboarding-step-shell";
import {
  COMMUNITY_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PROFILE_CREATED_BY_OPTIONS,
  SIBLING_COUNT_SELECT_OPTIONS,
  FATHER_STATUS_OPTIONS,
  MOTHER_STATUS_OPTIONS,
  PARENT_FIELD_OPTIONS,
  GOTRA_OPTIONS,
  MARRIAGE_TIMELINE_OPTIONS,
} from "@/lib/constants";
import { useOnboardingStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";
import type { StringKey } from "@/lib/i18n";

const FAMILY_TYPES = [
  { value: "nuclear", key: "family_nuclear" },
  { value: "joint", key: "family_joint" },
  { value: "extended", key: "family_extended" },
] as const;

const selectClass =
  "mt-1 flex h-12 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

function chipClass(selected: boolean, compact = false) {
  return `${compact ? "h-9 min-w-[2.25rem] px-3" : "px-4 py-2"} rounded-full text-sm font-medium transition-colors ${
    selected ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
  }`;
}

function parseCount(value?: string): number {
  if (!value) return -1;
  if (value === "6+") return 6;
  return Number.parseInt(value, 10);
}

function fieldIsComplete(value?: string, otherValue?: string) {
  if (!value) return false;
  if (value === "other") return Boolean(otherValue?.trim());
  return true;
}

function isMarriageFamilyComplete(fb: Record<string, string>) {
  if (!fb.community || !fb.marital_status || !fb.profile_created_by) return false;
  if (fb.community === "other" && !fb.community_other?.trim()) return false;

  if (
    fb.brothers_count === undefined ||
    fb.brothers_married === undefined ||
    fb.sisters_count === undefined ||
    fb.sisters_married === undefined
  ) {
    return false;
  }

  const brothers = parseCount(fb.brothers_count);
  const brothersMarried = parseCount(fb.brothers_married);
  const sisters = parseCount(fb.sisters_count);
  const sistersMarried = parseCount(fb.sisters_married);

  if (brothers < 0 || brothersMarried < 0 || sisters < 0 || sistersMarried < 0) return false;
  if (brothersMarried > brothers || sistersMarried > sisters) return false;

  if (!fb.father_status || !fb.mother_status) return false;
  if (fb.father_status === "working" && !fieldIsComplete(fb.father_field, fb.father_field_other)) return false;
  if (fb.father_status === "retired" && !fieldIsComplete(fb.father_retired_field, fb.father_retired_field_other)) return false;
  if (fb.mother_status === "working" && !fieldIsComplete(fb.mother_field, fb.mother_field_other)) return false;

  return true;
}

function ChipGroup({
  label,
  required,
  options,
  value,
  onSelect,
  t,
}: {
  label: string;
  required?: boolean;
  options: readonly { value: string; key: string }[];
  value?: string;
  onSelect: (v: string) => void;
  t: (key: StringKey | string) => string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            className={chipClass(value === item.value)}
          >
            {t(item.key)}
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  t,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: readonly { value: string; key: string }[];
  placeholder: string;
  required?: boolean;
  t: (key: StringKey | string) => string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.key)}
          </option>
        ))}
      </select>
    </div>
  );
}

function CountSelect({
  label,
  value,
  onChange,
  maxOption,
  t,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  maxOption?: string;
  t: (key: StringKey | string) => string;
}) {
  const options = maxOption
    ? SIBLING_COUNT_SELECT_OPTIONS.filter((o) => parseCount(o.value) <= parseCount(maxOption))
    : SIBLING_COUNT_SELECT_OPTIONS;

  return (
    <OptionSelect
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={t("select")}
      required
      t={t}
    />
  );
}

function ParentSection({
  title,
  statusOptions,
  status,
  onStatusChange,
  workingField,
  workingFieldOther,
  onWorkingFieldChange,
  onWorkingFieldOtherChange,
  retiredField,
  retiredFieldOther,
  onRetiredFieldChange,
  onRetiredFieldOtherChange,
  showRetired,
  t,
}: {
  title: string;
  statusOptions: readonly { value: string; key: string }[];
  status?: string;
  onStatusChange: (v: string) => void;
  workingField?: string;
  workingFieldOther?: string;
  onWorkingFieldChange: (v: string) => void;
  onWorkingFieldOtherChange?: (v: string) => void;
  retiredField?: string;
  retiredFieldOther?: string;
  onRetiredFieldChange?: (v: string) => void;
  onRetiredFieldOtherChange?: (v: string) => void;
  showRetired?: boolean;
  t: (key: StringKey | string) => string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
      <p className="text-sm font-semibold">
        {title}
        <span className="ml-1 text-primary">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onStatusChange(item.value)}
            className={chipClass(status === item.value)}
          >
            {t(item.key)}
          </button>
        ))}
      </div>
      {status === "working" && (
        <>
          <OptionSelect
            label={t("parent_field_working")}
            value={workingField}
            onChange={onWorkingFieldChange}
            options={PARENT_FIELD_OPTIONS}
            placeholder={t("select")}
            required
            t={t}
          />
          {workingField === "other" && onWorkingFieldOtherChange && (
            <Input
              value={workingFieldOther ?? ""}
              onChange={(e) => onWorkingFieldOtherChange(e.target.value)}
              placeholder={t("field_other_ph")}
            />
          )}
        </>
      )}
      {showRetired && status === "retired" && onRetiredFieldChange && (
        <>
          <OptionSelect
            label={t("parent_field_retired")}
            value={retiredField}
            onChange={onRetiredFieldChange}
            options={PARENT_FIELD_OPTIONS}
            placeholder={t("select")}
            required
            t={t}
          />
          {retiredField === "other" && onRetiredFieldOtherChange && (
            <Input
              value={retiredFieldOther ?? ""}
              onChange={(e) => onRetiredFieldOtherChange(e.target.value)}
              placeholder={t("field_other_ph")}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function FamilyPage() {
  const router = useRouter();
  const { familyBackground, setFamilyBackground, intent } = useOnboardingStore();
  const { t, hydrated } = useTranslation();

  const isMarriage = intent === "marriage";
  const canContinue = !isMarriage || isMarriageFamilyComplete(familyBackground);

  const setBrothersCount = (v: string) => {
    setFamilyBackground("brothers_count", v);
    const married = parseCount(familyBackground.brothers_married);
    const total = parseCount(v);
    if (married > total) setFamilyBackground("brothers_married", "0");
  };

  const setSistersCount = (v: string) => {
    setFamilyBackground("sisters_count", v);
    const married = parseCount(familyBackground.sisters_married);
    const total = parseCount(v);
    if (married > total) setFamilyBackground("sisters_married", "0");
  };

  useEffect(() => {
    if (familyBackground.religious_preference !== "hindu") {
      setFamilyBackground("religious_preference", "hindu");
    }
  }, [familyBackground.religious_preference, setFamilyBackground]);

  if (!hydrated) return null;

  return (
    <OnboardingStepShell
      backHref="/onboarding/lifestyle"
      title={t("family_bg")}
      currentStep={7}
      footer={
        <Button
          onClick={() => router.push("/onboarding/preview")}
          disabled={!canContinue}
          className="h-13 w-full rounded-2xl text-[17px] font-bold shadow-lg"
          size="lg"
        >
          {t("preview_profile")}
        </Button>
      }
    >
      <OnboardingStepHeading
        title={t("family_title")}
        subtitle={isMarriage ? t("family_subtitle_marriage") : t("family_subtitle_other")}
      />

      <div className="space-y-5">
          {isMarriage && (
            <>
              <p className="text-xs font-medium text-primary">{t("marriage_fields_required")}</p>

              <ChipGroup
                label={t("community")}
                required
                options={COMMUNITY_OPTIONS}
                value={familyBackground.community}
                onSelect={(v) => setFamilyBackground("community", v)}
                t={t}
              />
              {familyBackground.community === "other" && (
                <Input
                  value={familyBackground.community_other ?? ""}
                  onChange={(e) => setFamilyBackground("community_other", e.target.value)}
                  placeholder={t("community_other_ph")}
                />
              )}

              <ChipGroup
                label={t("marital_status")}
                required
                options={MARITAL_STATUS_OPTIONS}
                value={familyBackground.marital_status}
                onSelect={(v) => setFamilyBackground("marital_status", v)}
                t={t}
              />

              <ChipGroup
                label={t("profile_created_by")}
                required
                options={PROFILE_CREATED_BY_OPTIONS}
                value={familyBackground.profile_created_by}
                onSelect={(v) => setFamilyBackground("profile_created_by", v)}
                t={t}
              />

              <div className="border-t border-border/60 pt-2 space-y-4">
                <p className="text-sm font-semibold">{t("siblings_section")}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <CountSelect
                    label={t("brothers_count")}
                    value={familyBackground.brothers_count}
                    onChange={setBrothersCount}
                    t={t}
                  />
                  <CountSelect
                    label={t("brothers_married")}
                    value={familyBackground.brothers_married}
                    onChange={(v) => setFamilyBackground("brothers_married", v)}
                    maxOption={familyBackground.brothers_count ?? "0"}
                    t={t}
                  />
                  <CountSelect
                    label={t("sisters_count")}
                    value={familyBackground.sisters_count}
                    onChange={setSistersCount}
                    t={t}
                  />
                  <CountSelect
                    label={t("sisters_married")}
                    value={familyBackground.sisters_married}
                    onChange={(v) => setFamilyBackground("sisters_married", v)}
                    maxOption={familyBackground.sisters_count ?? "0"}
                    t={t}
                  />
                </div>
              </div>

              <ParentSection
                title={t("father_details")}
                statusOptions={FATHER_STATUS_OPTIONS}
                status={familyBackground.father_status}
                onStatusChange={(v) => {
                  setFamilyBackground("father_status", v);
                  if (v !== "working") {
                    setFamilyBackground("father_field", "");
                    setFamilyBackground("father_field_other", "");
                  }
                  if (v !== "retired") {
                    setFamilyBackground("father_retired_field", "");
                    setFamilyBackground("father_retired_field_other", "");
                  }
                }}
                workingField={familyBackground.father_field}
                workingFieldOther={familyBackground.father_field_other}
                onWorkingFieldChange={(v) => {
                  setFamilyBackground("father_field", v);
                  if (v !== "other") setFamilyBackground("father_field_other", "");
                }}
                onWorkingFieldOtherChange={(v) => setFamilyBackground("father_field_other", v)}
                retiredField={familyBackground.father_retired_field}
                retiredFieldOther={familyBackground.father_retired_field_other}
                onRetiredFieldChange={(v) => {
                  setFamilyBackground("father_retired_field", v);
                  if (v !== "other") setFamilyBackground("father_retired_field_other", "");
                }}
                onRetiredFieldOtherChange={(v) => setFamilyBackground("father_retired_field_other", v)}
                showRetired
                t={t}
              />

              <ParentSection
                title={t("mother_details")}
                statusOptions={MOTHER_STATUS_OPTIONS}
                status={familyBackground.mother_status}
                onStatusChange={(v) => {
                  setFamilyBackground("mother_status", v);
                  if (v !== "working") {
                    setFamilyBackground("mother_field", "");
                    setFamilyBackground("mother_field_other", "");
                  }
                }}
                workingField={familyBackground.mother_field}
                workingFieldOther={familyBackground.mother_field_other}
                onWorkingFieldChange={(v) => {
                  setFamilyBackground("mother_field", v);
                  if (v !== "other") setFamilyBackground("mother_field_other", "");
                }}
                onWorkingFieldOtherChange={(v) => setFamilyBackground("mother_field_other", v)}
                t={t}
              />

              <div className="border-t border-border/60 pt-1" />
            </>
          )}

          <div>
            <label className="text-sm font-medium">{t("family_type")}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {FAMILY_TYPES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFamilyBackground("family_type", item.value)}
                  className={chipClass(familyBackground.family_type === item.value)}
                >
                  {t(item.key)}
                </button>
              ))}
            </div>
          </div>

          {!isMarriage && (
            <div>
              <label className="text-sm font-medium">{t("community_pref")}</label>
              <Input
                value={familyBackground.community_preference ?? ""}
                onChange={(e) => setFamilyBackground("community_preference", e.target.value)}
                className="mt-1"
                placeholder={t("community_ph")}
              />
            </div>
          )}

          {isMarriage && (
            <>
              <OptionSelect
                label={t("gotra")}
                value={familyBackground.gotra}
                onChange={(v) => {
                  setFamilyBackground("gotra", v);
                  if (v !== "other") setFamilyBackground("gotra_other", "");
                }}
                options={GOTRA_OPTIONS}
                placeholder={t("select")}
                t={t}
              />
              {familyBackground.gotra === "other" && (
                <Input
                  value={familyBackground.gotra_other ?? ""}
                  onChange={(e) => setFamilyBackground("gotra_other", e.target.value)}
                  className="mt-1"
                  placeholder={t("gotra_other_ph")}
                />
              )}
              <OptionSelect
                label={t("marriage_timeline")}
                value={familyBackground.seriousness_timeline}
                onChange={(v) => setFamilyBackground("seriousness_timeline", v)}
                options={MARRIAGE_TIMELINE_OPTIONS}
                placeholder={t("select")}
                t={t}
              />
            </>
          )}
        </div>
    </OnboardingStepShell>
  );
}
