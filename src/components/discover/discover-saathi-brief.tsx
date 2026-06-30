"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import { SaathiBrief } from "@/components/saathi";

export function DiscoverSaathiBrief() {
  const profile = useAuthStore((s) => s.profile);
  const [stats, setStats] = useState({ matches: 0, views: 0, pending: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [profilesRes, chatsRes] = await Promise.all([
          fetch("/api/profiles"),
          fetch("/api/chats"),
        ]);
        const profiles = await profilesRes.json();
        const chats = await chatsRes.json();
        const count = Array.isArray(profiles.data) ? profiles.data.length : 0;
        setStats({
          matches: Math.min(count, 6),
          views: 0,
          pending: Number(chats.data?.unread_total ?? 0),
        });
      } catch {
        // silent
      }
    }
    load();
  }, []);

  const name = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <SaathiBrief
      userName={name}
      matchCount={stats.matches}
      viewCount={stats.views}
      pendingChats={stats.pending}
      onStart={() => {}}
    />
  );
}
