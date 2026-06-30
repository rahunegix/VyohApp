"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectionChip } from "@/components/ui/selection-chip";
import { SelectField } from "@/components/ui/select-field";
import { SIBLING_COUNT_SELECT_OPTIONS, PARENT_FIELD_OPTIONS } from "@/lib/constants";
import type { StringKey } from "@/lib/i18n";

/** @deprecated Use SelectField — kept for any legacy imports */
export const selectClass =
  "mt-1 flex h-11 w-full rounded-[6px] border border-border/80 bg-background px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

export const FAMILY_TYPES = [
  { value: "nuclear", key: "family_nuclear" },
  { value: "joint", key: "family_joint" },
  { value: "extended", key: "family_extended" },
] as const;

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
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((item) => (
          <SelectionChip
            key={item.value}
            selected={value === item.value}
            onClick={() => onSelect(item.value)}
            label={t(item.key)}
          />
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
    <SelectField
      label={label}
      value={value}
      onValueChange={onChange}
      placeholder={t("select")}
      options={options.map((opt) => ({ value: opt.value, label: t(opt.key) }))}
    />
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
    <SelectField
      label={label}
      value={value}
      onValueChange={onChange}
      placeholder={t("select")}
      options={options.map((opt) => ({ value: opt.value, label: t(opt.key) }))}
    />
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
    <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((item) => (
          <SelectionChip
            key={item.value}
            selected={status === item.value}
            onClick={() => onStatusChange(item.value)}
            label={t(item.key)}
          />
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
    <div className="space-y-4 px-4 py-4 pb-8">
      {children}
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
      <Button type="submit" loading={saving} className="h-12 w-full font-semibold">
        {saveLabel}
      </Button>
    </div>
  );
}
