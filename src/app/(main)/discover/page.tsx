"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { AppLogo } from "@/components/common/app-logo";
import { DiscoverPillTabs } from "@/components/discover/pill-tabs";
import { DiscoverTabPanel } from "@/components/discover/suggestions-feed";
import { DiscoverFiltersSheet } from "@/components/discover/discover-filters-sheet";
import { DiscoverSaathiBrief } from "@/components/discover/discover-saathi-brief";
import { SaathiCommandBar } from "@/components/saathi";
import { useShortlistProfiles } from "@/hooks/use-shortlist-profiles";
import { useReceivedInterests, useSentInterests } from "@/hooks/use-interest-profiles";
import { useDiscoverSuggestions } from "@/hooks/use-discover-suggestions";
import { useTranslation } from "@/hooks/use-translation";
import { PlatformSwitcher } from "@/components/platform/platform-switcher";
import { usePlatform } from "@/components/platform/platform-provider";
import { cn } from "@/lib/helpers/utils";
import { getTimeGreeting } from "@/config/ai";
import { useAuthStore } from "@/store";
import { VipAccessGate } from "@/components/platform/vip-access-gate";
import { useVipAccess } from "@/hooks/use-vip-access";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { withProgress } from "@/lib/progress";
import type { DiscoverTabId } from "@/lib/constants/discover-tabs";

export default function DiscoverPage() {
  const { t, hydrated } = useTranslation();
  const [tab, setTab] = useState<DiscoverTabId>("suggestions");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const shortlistItems = useShortlistProfiles();
  const receivedItems = useReceivedInterests();
  const sentItems = useSentInterests();
  const suggestions = useDiscoverSuggestions();
  const myProfile = useAuthStore((s) => s.profile);

  const counts = {
    suggestions: suggestions.length,
    shortlist: shortlistItems.length,
    received: receivedItems.length,
    sent: sentItems.length,
  };

  const { config, platform } = usePlatform();
  const { vipAccess, vipStatus } = useVipAccess();
  const showVipGate = platform === "vip" && vipAccess === false;

  const firstName = myProfile?.full_name?.split(" ")[0] ?? "";

  const handleSearch = async (query: string) => {
    setSearchLoading(true);
    try {
      await withProgress("Saathi is searching…", async () => {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "search", query }),
        });
        const json = await res.json();
        sessionStorage.setItem(
          "saathini_nl_search",
          JSON.stringify({ query, interpreted: json.data?.interpreted_query ?? query })
        );
      });
    } finally {
      setSearchLoading(false);
    }
  };

  if (!hydrated) {
    return <PageSkeleton variant="discover" withHeader={false} className="h-[calc(100dvh-5rem)] min-h-0 pb-0 lg:h-dvh" />;
  }

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background lg:h-dvh">
      <DiscoverSaathiBrief />
      <div className="px-4 pt-2 lg:hidden">
        <PlatformSwitcher />
        <p className="mt-2 text-center text-[11px] font-medium text-muted-foreground">
          {config.tagline}
        </p>
      </div>
      <PageHeader
        title={
          <>
            <AppLogo className="h-7 lg:hidden" />
            <h1 className="hidden font-display text-lg lg:block">
              {firstName ? getTimeGreeting(firstName) : t("discover_title")}
            </h1>
          </>
        }
        subtitle={config.tagline}
        subtitleClassName="lg:hidden"
      />

      <div className="shrink-0 px-4 pb-2">
        <SaathiCommandBar onSearch={handleSearch} loading={searchLoading} />
      </div>

      <div className="shrink-0 space-y-2 pt-1">
        <DiscoverPillTabs active={tab} onChange={setTab} counts={counts} />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1",
          tab === "suggestions" ? "overflow-hidden" : "overflow-y-auto"
        )}
      >
        {showVipGate ? (
          <div className="flex h-full items-center justify-center py-8">
            <VipAccessGate status={vipStatus} />
          </div>
        ) : (
          <DiscoverTabPanel tab={tab} />
        )}
      </div>

      <DiscoverFiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  );
}
