"use client";

import { motion, Variants } from "framer-motion";
import { HeartHandshake, Eye, MessageCircle, UserPlus, Bell } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { NotificationRow } from "@/components/ui/notification-row";
import { formatRelativeTime } from "@/lib/helpers/utils";

const DEMO_ACTIVITY = [
  {
    id: "1",
    type: "interest",
    icon: HeartHandshake,
    title: "Vikram Singh sent interest in your profile",
    preview: "Tap to view his profile and respond",
    time: new Date(Date.now() - 1800000).toISOString(),
    href: "/matches/demo-2",
    unread: true,
  },
  {
    id: "2",
    type: "view",
    icon: Eye,
    title: "Someone viewed your profile",
    preview: "A verified member checked your details",
    time: new Date(Date.now() - 7200000).toISOString(),
    href: "/profile",
    unread: true,
  },
  {
    id: "3",
    type: "request",
    icon: MessageCircle,
    title: "New chat request from Priya Bisht",
    preview: "She'd like to connect with you",
    time: new Date(Date.now() - 86400000).toISOString(),
    href: "/chats",
    unread: false,
  },
  {
    id: "4",
    type: "match",
    icon: UserPlus,
    title: "You matched with Ananya Rawat!",
    preview: "Send a message to start the conversation",
    time: new Date(Date.now() - 172800000).toISOString(),
    href: "/matches/demo-1",
    unread: false,
  },
];

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
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <PageHeader
          title="Activity"
          subtitle="Your recent updates"
          rightAction={
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2 h-2 w-2 animate-pulse rounded-full bg-primary ring-2 ring-white" />
            </div>
          }
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-4 mt-4 overflow-hidden rounded-2xl border border-border/50 bg-white shadow-[var(--shadow-soft)] lg:mx-auto lg:max-w-2xl"
      >
        {DEMO_ACTIVITY.map((item) => (
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
    </div>
  );
}
