"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { HeartHandshake, Eye, MessageCircle, UserPlus, Bell } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { formatRelativeTime } from "@/lib/helpers/utils";
import { cn } from "@/lib/helpers/utils";

const DEMO_ACTIVITY = [
  { id: "1", type: "interest", icon: HeartHandshake, title: "Vikram Singh sent interest in your profile", time: new Date(Date.now() - 1800000).toISOString(), href: "/matches/demo-2", unread: true },
  { id: "2", type: "view", icon: Eye, title: "Someone viewed your profile", time: new Date(Date.now() - 7200000).toISOString(), href: "/profile", unread: true },
  { id: "3", type: "request", icon: MessageCircle, title: "New chat request from Priya Bisht", time: new Date(Date.now() - 86400000).toISOString(), href: "/chats", unread: false },
  { id: "4", type: "match", icon: UserPlus, title: "You matched with Ananya Rawat!", time: new Date(Date.now() - 172800000).toISOString(), href: "/matches/demo-1", unread: false },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <PageHeader 
          title="Activity" 
          subtitle="Your recent updates" 
          rightAction={
            <div className="relative h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary animate-pulse ring-2 ring-white" />
            </div>
          }
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-4 py-4 space-y-3 lg:mx-auto lg:max-w-2xl"
      >
        {DEMO_ACTIVITY.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.id} variants={itemVariants}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-start gap-4 rounded-2xl p-4 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] active:scale-[0.98]",
                  item.unread ? "bg-white border border-primary/20" : "bg-white/80 border border-transparent"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                  item.type === 'match' ? "bg-success/10 text-success" :
                  item.type === 'request' ? "bg-blue-500/10 text-blue-500" :
                  "bg-primary/10 text-primary"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={cn(
                    "text-[15px] leading-tight",
                    item.unread ? "font-bold text-foreground" : "font-medium text-foreground/80"
                  )}>
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-muted-foreground tracking-wide">
                    {formatRelativeTime(item.time)}
                  </p>
                </div>
                
                {item.unread && (
                  <div className="shrink-0 mt-2">
                    <span className="block h-2.5 w-2.5 rounded-full bg-primary" />
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
