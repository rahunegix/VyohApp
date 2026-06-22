"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Eye,
  HeartHandshake,
  MessageCircle,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export type ActivityFeedItem = {
  id: string;
  type: string;
  icon: LucideIcon;
  title: string;
  preview: string;
  time: string;
  href: string;
  unread: boolean;
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  interest: HeartHandshake,
  view: Eye,
  request: MessageCircle,
  match: UserPlus,
  system: Bell,
};

function resolveHref(type: string, metadata?: Record<string, unknown>) {
  const profileId = metadata?.profile_id ?? metadata?.profileId;
  if (profileId) return `/matches/${String(profileId)}`;
  if (type === "request") return "/chats";
  return "/activity";
}

export function useActivityFeed() {
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success || !Array.isArray(json.data)) {
          setItems([]);
          return;
        }
        setItems(
          json.data.map((row: Record<string, unknown>) => {
            const type = String(row.type ?? "system");
            const metadata = row.metadata as Record<string, unknown> | undefined;
            return {
              id: String(row.id),
              type,
              icon: TYPE_ICONS[type] ?? Bell,
              title: String(row.title ?? "Update"),
              preview: String(row.body ?? ""),
              time: String(row.created_at ?? new Date().toISOString()),
              href: resolveHref(type, metadata),
              unread: !row.is_read,
            };
          })
        );
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading };
}
