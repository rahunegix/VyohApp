"use client";

import { PageHeader } from "@/components/common/page-header";
import {
  Skeleton,
  ProfileCardSkeleton,
  ChatListSkeleton,
  ListSkeleton,
  FormSkeleton,
  MagazineCoverSkeleton,
  SubscriptionSkeleton,
} from "@/components/ui/skeleton";
import { cn } from "@/lib/helpers/utils";

export type PageSkeletonVariant =
  | "list"
  | "discover"
  | "profile"
  | "magazine"
  | "form"
  | "chat"
  | "auth"
  | "subscription"
  | "settings";

interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
  /** Show a sticky page header placeholder */
  withHeader?: boolean;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  className?: string;
}

function HeaderSkeleton({
  title,
  subtitle,
  showBack,
}: {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  if (title) {
    return <PageHeader showBack={showBack} title={title} subtitle={subtitle} />;
  }
  return (
    <div className="border-b border-border/40 px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        {showBack ? <Skeleton className="h-9 w-9 rounded-[6px]" /> : <span />}
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-9 rounded-[6px]" />
      </div>
      <Skeleton className="mt-3 h-4 w-40" />
    </div>
  );
}

export function PageSkeleton({
  variant = "list",
  withHeader = true,
  title,
  subtitle,
  showBack,
  className,
}: PageSkeletonProps) {
  return (
    <div className={cn("min-h-screen bg-muted/20 pb-24", className)}>
      {withHeader && <HeaderSkeleton title={title} subtitle={subtitle} showBack={showBack} />}

      {variant === "discover" && (
        <div className="flex h-[calc(100dvh-5rem)] flex-col overflow-hidden px-4 pt-2">
          <Skeleton className="mb-3 h-10 w-full rounded-[6px]" />
          <Skeleton className="mb-3 h-12 w-full rounded-xl" />
          <div className="mb-3 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-[6px]" />
            ))}
          </div>
          <ProfileCardSkeleton fill />
        </div>
      )}

      {variant === "profile" && (
        <div className="px-4 py-6">
          <ListSkeleton count={5} />
        </div>
      )}

      {variant === "magazine" && (
        <div className="px-4 py-4">
          <MagazineCoverSkeleton />
          <div className="mt-6 space-y-2">
            <ListSkeleton count={4} />
          </div>
        </div>
      )}

      {variant === "form" && (
        <div className="px-6 py-6">
          <Skeleton className="mb-6 h-24 w-full rounded-[6px]" />
          <Skeleton className="mb-2 h-8 w-2/3" />
          <Skeleton className="mb-6 h-4 w-full" />
          <FormSkeleton fields={6} />
        </div>
      )}

      {variant === "chat" && <ChatListSkeleton />}

      {variant === "auth" && (
        <div className="flex flex-1 flex-col px-6 py-8">
          <Skeleton className="mb-8 h-9 w-9 rounded-[6px]" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-3 h-10 w-3/4" />
          <Skeleton className="mt-3 h-16 w-full" />
          <div className="mt-10 space-y-4">
            <FormSkeleton fields={2} />
          </div>
        </div>
      )}

      {variant === "subscription" && <SubscriptionSkeleton />}

      {variant === "settings" && (
        <div className="mx-4 mt-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {variant === "list" && (
        <div className="px-4 py-4">
          <ListSkeleton count={5} />
        </div>
      )}
    </div>
  );
}
