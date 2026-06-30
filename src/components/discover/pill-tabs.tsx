"use client";

import { cn } from "@/lib/helpers/utils";
import { DISCOVER_TABS, type DiscoverTabId } from "@/lib/constants/discover-tabs";
import { useTranslation } from "@/hooks/use-translation";
import type { StringKey } from "@/lib/i18n";

export function DiscoverPillTabs({
  active,
  onChange,
  counts,
}: {
  active: DiscoverTabId;
  onChange: (tab: DiscoverTabId) => void;
  counts?: Partial<Record<DiscoverTabId, number>>;
}) {
  const { t } = useTranslation();

  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
      {DISCOVER_TABS.map((tab) => {
        const selected = active === tab.id;
        const count = counts?.[tab.id] ?? 0;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-[6px] px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "bg-primary text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {t(tab.labelKey as StringKey)}
            {count > 0 && (
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-[6px] px-1 text-[10px] font-bold",
                  selected ? "bg-white/25 text-white" : "bg-primary/10 text-primary"
                )}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
