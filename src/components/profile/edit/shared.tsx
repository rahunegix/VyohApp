"use client";

import { Input } from "@/components/ui/input";
import { SIBLING_COUNT_SELECT_OPTIONS, PARENT_FIELD_OPTIONS } from "@/lib/constants";
import type { StringKey } from "@/lib/i18n";

export const selectClass =
  "mt-1 flex h-12 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

export const FAMILY_TYPES = [
  { value: "nuclear", key: "family_nuclear" },
  { value: "joint", key: "family_joint" },
  { value: "extended", key: "family_extended" },
] as const;

export function chipClass(selected: boolean) {
  return `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    selected ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
  }`;
}

export function parseCount(value?: string): number {
  if (!value) return -1;
  if (value === "6+") return 6;
  return Number.parseInt(value, 10);
}

export function ChipGroup({
  label,
  options,
  value,
  onSelect,
  t,
}: {
  label: string;
  options: readonly { value: string; key: string }[];
  value?: string;
  onSelect: (v: string) => void;
  t: (key: StringKey | string) => string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
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

export function SiblingSelect({
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
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">{t("select")}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
        ))}
      </select>
    </div>
  );
}

export function FieldSelect({
  label,
  value,
  onChange,
  options,
  t,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: readonly { value: string; key: string }[];
  t: (key: StringKey | string) => string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">{t("select")}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
        ))}
      </select>
    </div>
  );
}

export function ParentBlock({
  title,
  statusOptions,
  status,
  onStatusChange,
  field,
  fieldOther,
  onFieldChange,
  onFieldOtherChange,
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
  field?: string;
  fieldOther?: string;
  onFieldChange: (v: string) => void;
  onFieldOtherChange: (v: string) => void;
  retiredField?: string;
  retiredFieldOther?: string;
  onRetiredFieldChange?: (v: string) => void;
  onRetiredFieldOtherChange?: (v: string) => void;
  showRetired?: boolean;
  t: (key: StringKey | string) => string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
      <p className="text-sm font-semibold">{title}</p>
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
          <FieldSelect
            label={t("parent_field_working")}
            value={field}
            onChange={onFieldChange}
            options={PARENT_FIELD_OPTIONS}
            t={t}
          />
          {field === "other" && (
            <Input
              value={fieldOther ?? ""}
              onChange={(e) => onFieldOtherChange(e.target.value)}
              placeholder={t("field_other_ph")}
            />
          )}
        </>
      )}
      {showRetired && status === "retired" && onRetiredFieldChange && (
        <>
          <FieldSelect
            label={t("parent_field_retired")}
            value={retiredField}
            onChange={onRetiredFieldChange}
            options={PARENT_FIELD_OPTIONS}
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

export function EditSectionShell({
  children,
  error,
  saving,
  saveLabel,
}: {
  children: React.ReactNode;
  error?: string;
  saving: boolean;
  saveLabel: string;
}) {
  return (
    <div className="px-4 py-4 pb-8 space-y-4">
      {children}
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "…" : saveLabel}
      </button>
    </div>
  );
}
