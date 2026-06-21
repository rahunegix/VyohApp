"use client";

import { useEffect, useState } from "react";
import { BottomSheet, BottomSheetDoneButton } from "@/components/ui/bottom-sheet";
import { SelectionChip } from "@/components/ui/selection-chip";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_DISCOVER_FILTERS,
  DISCOVER_AGE_MAX,
  DISCOVER_AGE_MIN,
  type DiscoverFilters,
} from "@/lib/constants/discover-filters";
import { REGIONS } from "@/lib/constants";
import { getLocalizedIntents } from "@/lib/i18n";
import { useDiscoverFiltersStore } from "@/store";
import { useTranslation } from "@/hooks/use-translation";
import type { Intent, Region } from "@/types";
import type { StringKey } from "@/lib/i18n";

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface DiscoverFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscoverFiltersSheet({ open, onOpenChange }: DiscoverFiltersSheetProps) {
  const { t, language } = useTranslation();
  const applied = useDiscoverFiltersStore((s) => s.applied);
  const setApplied = useDiscoverFiltersStore((s) => s.setApplied);
  const resetApplied = useDiscoverFiltersStore((s) => s.resetApplied);
  const [draft, setDraft] = useState<DiscoverFilters>(applied);

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  const intents = getLocalizedIntents(language);

  const regionLabel = (value: Region) => {
    const key = `region_${value}` as StringKey;
    const translated = t(key);
    if (translated !== key) return translated;
    return REGIONS.find((r) => r.value === value)?.label ?? value;
  };

  const updateDraft = (patch: Partial<DiscoverFilters>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      if (next.ageMin > next.ageMax) {
        if ("ageMin" in patch) next.ageMax = next.ageMin;
        if ("ageMax" in patch) next.ageMin = next.ageMax;
      }
      return next;
    });
  };

  const handleApply = () => {
    setApplied(draft);
    onOpenChange(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_DISCOVER_FILTERS);
    resetApplied();
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("discover_filters_title")}
      description={t("discover_filters_desc")}
      size="tall"
      centeredTitle
      showClose={false}
      footer={
        <div className="space-y-3">
          <BottomSheetDoneButton onClick={handleApply} label={t("discover_filters_apply")} />
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2 text-sm font-semibold text-primary"
          >
            {t("discover_filters_reset")}
          </button>
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        <section>
          <p className="text-sm font-medium">{t("discover_filters_age")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {draft.ageMin} – {draft.ageMax} {t("discover_filters_years")}
          </p>
          <div className="mt-3 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">{t("discover_filters_age_min")}</label>
              <input
                type="range"
                min={DISCOVER_AGE_MIN}
                max={DISCOVER_AGE_MAX}
                value={draft.ageMin}
                onChange={(e) => updateDraft({ ageMin: Number(e.target.value) })}
                className="mt-1 w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("discover_filters_age_max")}</label>
              <input
                type="range"
                min={DISCOVER_AGE_MIN}
                max={DISCOVER_AGE_MAX}
                value={draft.ageMax}
                onChange={(e) => updateDraft({ ageMax: Number(e.target.value) })}
                className="mt-1 w-full accent-primary"
              />
            </div>
          </div>
        </section>

        <section>
          <p className="text-sm font-medium">{t("discover_filters_region")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("discover_filters_any_hint")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {REGIONS.map((region) => (
              <SelectionChip
                key={region.value}
                label={regionLabel(region.value)}
                selected={draft.regions.includes(region.value)}
                onClick={() =>
                  updateDraft({ regions: toggleInList(draft.regions, region.value) })
                }
              />
            ))}
          </div>
        </section>

        <section>
          <p className="text-sm font-medium">{t("discover_filters_intent")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("discover_filters_any_hint")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {intents.map((intent) => (
              <SelectionChip
                key={intent.value}
                label={intent.label}
                selected={draft.intents.includes(intent.value as Intent)}
                onClick={() =>
                  updateDraft({
                    intents: toggleInList(draft.intents, intent.value as Intent),
                  })
                }
              />
            ))}
          </div>
        </section>

        <section>
          <p className="text-sm font-medium">{t("discover_filters_compatibility")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {draft.minCompatibility === 0
              ? t("discover_filters_any")
              : `${draft.minCompatibility}%+`}
          </p>
          <input
            type="range"
            min={0}
            max={90}
            step={10}
            value={draft.minCompatibility}
            onChange={(e) => updateDraft({ minCompatibility: Number(e.target.value) })}
            className="mt-3 w-full accent-primary"
          />
        </section>

        <section className="flex items-center justify-between gap-4 rounded-xl border border-border/50 p-4">
          <div>
            <p className="text-sm font-medium">{t("discover_filters_verified_only")}</p>
            <p className="text-xs text-muted-foreground">{t("discover_filters_verified_only_desc")}</p>
          </div>
          <Switch
            checked={draft.verifiedOnly}
            onCheckedChange={(verifiedOnly) => updateDraft({ verifiedOnly })}
            aria-label={t("discover_filters_verified_only")}
          />
        </section>
      </div>
    </BottomSheet>
  );
}
