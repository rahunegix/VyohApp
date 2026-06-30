"use client";

import { motion, Variants } from "framer-motion";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { NotificationRow } from "@/components/ui/notification-row";
import { ListSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-states";
import { formatRelativeTime } from "@/lib/helpers/utils";
import { useActivityFeed } from "@/hooks/use-activity-feed";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function ActivityPage() {
  const { items, loading } = useActivityFeed();

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <PageHeader
          title="Activity"
          subtitle="Your recent updates"
          rightAction={
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
              {items.some((i) => i.unread) && (
                <span className="absolute right-2.5 top-2 h-2 w-2 animate-pulse rounded-[6px] bg-primary ring-2 ring-white" />
              )}
            </div>
          }
        />
      </div>

      {loading ? (
        <div className="mx-4 mt-4">
          <ListSkeleton count={4} />
        </div>
      ) : items.length === 0 ? (
        <div className="mx-4 mt-8">
          <EmptyState
            icon="users"
            title="No activity yet"
            description="Likes, views, and matches will appear here."
          />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-4 mt-4 overflow-hidden rounded-2xl border border-border/50 bg-white shadow-[var(--shadow-soft)] lg:mx-auto lg:max-w-2xl"
        >
          {items.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <NotificationRow
                href={item.href}
                icon={item.icon}
                title={item.title}
                preview={item.preview}
                time={formatRelativeTime(item.time)}
                unread={item.unread}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
