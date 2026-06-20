"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AppLogo } from "@/components/common/app-logo";
import { DiscoverPillTabs } from "@/components/discover/pill-tabs";
import { DiscoverTabPanel } from "@/components/discover/suggestions-feed";
import { DiscoverFiltersSheet } from "@/components/discover/discover-filters-sheet";
import { useShortlistProfiles } from "@/hooks/use-shortlist-profiles";
import { useReceivedInterests, useSentInterests } from "@/hooks/use-interest-profiles";
import { useDiscoverSuggestions } from "@/hooks/use-discover-suggestions";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/helpers/utils";
import { isDiscoverFiltersActive } from "@/lib/constants/discover-filters";
import { useDiscoverFiltersStore } from "@/store";
import type { DiscoverTabId } from "@/lib/constants/discover-tabs";

export default function DiscoverPage() {
  const { t, hydrated } = useTranslation();
  const [tab, setTab] = useState<DiscoverTabId>("suggestions");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const shortlistItems = useShortlistProfiles();
  const receivedItems = useReceivedInterests();
  const sentItems = useSentInterests();
  const suggestions = useDiscoverSuggestions();
  const appliedFilters = useDiscoverFiltersStore((s) => s.applied);
  const filtersActive = isDiscoverFiltersActive(appliedFilters);

  const counts = {
    suggestions: suggestions.length,
    shortlist: shortlistItems.length,
    received: receivedItems.length,
    sent: sentItems.length,
  };

  if (!hydrated) return null;

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col overflow-hidden lg:h-dvh">
      <PageHeader
        title={
          <>
            <AppLogo className="h-7 lg:hidden" />
            <h1 className="hidden text-lg font-semibold lg:block">{t("discover_title")}</h1>
          </>
        }
        subtitle={t("discover_subtitle")}
        subtitleClassName="lg:hidden"
        rightAction={
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
            aria-label={t("discover_filters_title")}
          >
            <SlidersHorizontal className="h-5 w-5" />
            {filtersActive && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        }
      />

      <div className="shrink-0 space-y-2 pt-3">
        <DiscoverPillTabs active={tab} onChange={setTab} counts={counts} />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1",
          tab === "suggestions" ? "overflow-hidden" : "overflow-y-auto"
        )}
      >
        <DiscoverTabPanel tab={tab} />
      </div>

      <DiscoverFiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  );
}
