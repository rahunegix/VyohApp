"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileCard } from "@/components/cards/profile-card";
import { ProfileCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-states";
import { Button } from "@/components/ui/button";
import { InterestList } from "@/components/discover/interest-list";
import { sendInterest } from "@/services/actions";
import { useTranslation } from "@/hooks/use-translation";
import { useShortlistStore, useInterestStore, useDiscoverFiltersStore } from "@/store";
import { useShortlistProfiles } from "@/hooks/use-shortlist-profiles";
import { useReceivedInterests, useSentInterests } from "@/hooks/use-interest-profiles";
import { useDiscoverSuggestions } from "@/hooks/use-discover-suggestions";
import type { DiscoverTabId } from "@/lib/constants/discover-tabs";

export function SuggestionsFeed() {
  const { t } = useTranslation();
  const allProfiles = useDiscoverSuggestions();
  const resetFilters = useDiscoverFiltersStore((s) => s.resetApplied);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const toggleShortlist = useShortlistStore((s) => s.toggle);
  const hasShortlisted = useShortlistStore((s) => s.has);

  useEffect(() => {
    setCurrentIndex(0);
    setLoading(false);
  }, [allProfiles]);

  const profiles = allProfiles;
  const current = profiles[currentIndex];

  const handleSendInterest = async () => {
    if (current) {
      await sendInterest(current.id);
      useInterestStore.getState().addSent(current.id);
    }
    setCurrentIndex((i) => i + 1);
  };

  const handlePass = () => setCurrentIndex((i) => i + 1);

  const handleShortlist = () => {
    if (current) toggleShortlist(current.id);
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-stretch px-4 pb-2 pt-1">
        <ProfileCardSkeleton fill />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex h-full items-center justify-center px-4 pb-2 pt-1">
        <EmptyState
          icon="heart"
          title={t("discover_empty_suggestions_title")}
          description={t("discover_empty_suggestions_desc")}
          action={<Button onClick={resetFilters}>{t("discover_filters_reset")}</Button>}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col px-4 pb-6 pt-4 lg:mx-auto lg:max-w-xl lg:px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="min-h-0 flex-1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <ProfileCard
            profile={current}
            layout="feed"
            className="h-full"
            profileHref={`/matches/${current.id}`}
            onSendInterest={handleSendInterest}
            onShortlist={handleShortlist}
            shortlisted={hasShortlisted(current.id)}
            onPass={handlePass}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function DiscoverTabPanel({ tab }: { tab: DiscoverTabId }) {
  const { t } = useTranslation();
  const shortlistItems = useShortlistProfiles();
  const receivedItems = useReceivedInterests();
  const sentItems = useSentInterests();
  const removeFromShortlist = useShortlistStore((s) => s.remove);
  const acceptReceived = useInterestStore((s) => s.acceptReceived);
  const declineReceived = useInterestStore((s) => s.declineReceived);
  const unsendSent = useInterestStore((s) => s.unsendSent);

  const handleAccept = async (profileId: string) => {
    await sendInterest(profileId);
    acceptReceived(profileId);
    useInterestStore.getState().addSent(profileId);
  };

  if (tab === "suggestions") {
    return (
      <div className="h-full min-h-0">
        <SuggestionsFeed />
      </div>
    );
  }

  if (tab === "shortlist") {
    return (
      <InterestList
        items={shortlistItems}
        emptyIcon="shortlist"
        emptyTitle={t("discover_empty_shortlist_title")}
        emptyDescription={t("discover_empty_shortlist_desc")}
        actions={{ variant: "shortlist", onRemove: removeFromShortlist }}
      />
    );
  }

  if (tab === "received") {
    return (
      <InterestList
        items={receivedItems}
        emptyTitle={t("discover_empty_received_title")}
        emptyDescription={t("discover_empty_received_desc")}
        actions={{
          variant: "received",
          onAccept: handleAccept,
          onDecline: declineReceived,
        }}
      />
    );
  }

  return (
    <InterestList
      items={sentItems}
      emptyTitle={t("discover_empty_sent_title")}
      emptyDescription={t("discover_empty_sent_desc")}
      actions={{ variant: "sent", onUnsend: unsendSent }}
    />
  );
}
