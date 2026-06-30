"use client";

import { useState } from "react";
import { HeartHandshake, Bookmark, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/helpers/utils";
import { useTranslation } from "@/hooks/use-translation";
import { DiscoverFeedGridCard } from "@/components/discover/discover-feed-grid-card";
import type { InterestEntry } from "@/lib/constants/discover-tabs";

const PAGE_SIZE = 4;

type InterestListActions =
  | {
      variant: "received";
      onAccept: (profileId: string) => void;
      onDecline: (profileId: string) => void;
    }
  | {
      variant: "sent";
      onUnsend: (profileId: string) => void;
    }
  | {
      variant: "shortlist";
      onRemove: (profileId: string) => void;
    };

export function InterestList({
  items,
  emptyTitle,
  emptyDescription,
  emptyIcon = "interest",
  actions,
}: {
  items: InterestEntry[];
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: "interest" | "shortlist";
  actions?: InterestListActions;
}) {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (items.length === 0) {
    const EmptyIcon = emptyIcon === "shortlist" ? Bookmark : HeartHandshake;
    return (
      <div className="px-6 py-16 text-center flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-[6px] bg-muted flex items-center justify-center mb-4">
          <EmptyIcon className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <p className="font-semibold text-lg">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground max-w-[250px] leading-relaxed">{emptyDescription}</p>
      </div>
    );
  }

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {visibleItems.map(({ profile, at, mutual }) => (
          <DiscoverFeedGridCard
            key={`${profile.id}-${at}`}
            profile={profile}
            mutual={mutual}
            footer={
              <div className="flex flex-col h-full justify-between">
                <p className="text-center text-[11px] font-medium text-muted-foreground mb-3">
                  {formatRelativeTime(at)}
                </p>

                {actions?.variant === "received" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex h-9 flex-1 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      onClick={(e) => { e.preventDefault(); actions.onDecline(profile.id); }}
                      aria-label={t("decline_interest")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="flex h-9 flex-1 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all hover:bg-primary/90"
                      onClick={(e) => { e.preventDefault(); actions.onAccept(profile.id); }}
                      aria-label={t("accept_interest")}
                    >
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </button>
                  </div>
                )}

                {actions?.variant === "sent" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full rounded-xl text-xs font-medium border-border hover:bg-muted"
                    onClick={(e) => { e.preventDefault(); actions.onUnsend(profile.id); }}
                  >
                    {t("unsend_interest")}
                  </Button>
                )}

                {actions?.variant === "shortlist" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full rounded-xl text-xs font-medium border-border hover:bg-muted"
                    onClick={(e) => { e.preventDefault(); actions.onRemove(profile.id); }}
                  >
                    {t("remove_shortlist")}
                  </Button>
                )}
              </div>
            }
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="w-full max-w-[200px] rounded-xl font-medium"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            {t("load_more_profiles")}
          </Button>
        </div>
      )}
    </div>
  );
}
