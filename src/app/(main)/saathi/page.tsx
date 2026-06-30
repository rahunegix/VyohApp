"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { AiCard, SaathiCommandBar, SaathiPresence } from "@/components/saathi";
import { Button } from "@/components/ui/button";
import { getTimeGreeting, SAATHI_COPY } from "@/config/ai";
import { usePlatform } from "@/components/platform/platform-provider";
import { platformPath } from "@/lib/platform";
import { useAuthStore } from "@/store";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { withProgress } from "@/lib/progress";

export default function SaathiPage() {
  const { platform } = usePlatform();
  const profile = useAuthStore((s) => s.profile);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [daily, setDaily] = useState({
    matchCount: 0,
    viewCount: 0,
    pendingChats: 0,
    coachScore: 0,
    tips: [] as string[],
  });

  const name = profile?.full_name?.split(" ")[0] ?? "there";

  useEffect(() => {
    async function load() {
      try {
        const [meRes, chatsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/chats"),
        ]);
        const me = await meRes.json();
        const chats = await chatsRes.json();
        const unread = Number(chats.data?.unread_total ?? 0);

        if (me.data?.profile?.id) {
          const coachRes = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "profile_coach",
              profile: me.data.profile,
              photoCount: me.data.profile.photos?.length ?? 0,
            }),
          });
          const coach = await coachRes.json();
          const recs = (coach.data?.recommendations ?? []) as { message: string }[];
          setDaily((d) => ({
            ...d,
            pendingChats: unread,
            coachScore: coach.data?.completion_score ?? 0,
            tips: recs.slice(0, 3).map((r) => r.message),
          }));
        }
      } catch {
        // silent
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, []);

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
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "saathini_nl_search",
            JSON.stringify({
              query,
              interpreted: json.data?.interpreted_query ?? query,
              filters: json.data?.filters ?? {},
            })
          );
        }
        window.location.href = platformPath(platform, "/discover");
      });
    } finally {
      setSearchLoading(false);
    }
  };

  if (pageLoading) {
    return <PageSkeleton variant="list" title="Saathi" subtitle="Your relationship guide" />;
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary/5 via-background to-background pb-28">
      <PageHeader title="Saathi" subtitle="Your relationship guide" />

      <div className="space-y-6 px-4 py-4">
        <SaathiPresence message={`${getTimeGreeting(name)}. Here's what matters today.`} />

        <AiCard
          variant="daily"
          title="Today's brief"
          body={
            daily.tips.length > 0
              ? daily.tips.join(" ")
              : "I'm finding people who genuinely fit you. Explore when you're ready."
          }
          action={{
            label: "Start Discovering",
            onClick: () => {
              window.location.href = platformPath(platform, "/discover");
            },
          }}
        />

        {daily.coachScore > 0 && daily.coachScore < 85 && (
          <AiCard
            variant="improve"
            title="Profile strength"
            body={`You're at ${daily.coachScore}%. ${SAATHI_COPY.profile.visibilityGain(27)}`}
            action={{
              label: "Improve my profile",
              onClick: () => {
                window.location.href = platformPath(platform, "/profile/readiness");
              },
            }}
          />
        )}

        <div>
          <h2 className="mb-3 text-sm font-bold text-foreground">Ask Saathi</h2>
          <SaathiCommandBar onSearch={handleSearch} loading={searchLoading} />
        </div>

        <div className="grid gap-3">
          <Link href={platformPath(platform, "/chats")}>
            <Button variant="outline" className="w-full justify-start">
              Connect — {daily.pendingChats > 0 ? `${daily.pendingChats} waiting` : "your conversations"}
            </Button>
          </Link>
          <Link href={platformPath(platform, "/profile")}>
            <Button variant="outline" className="w-full justify-start">
              Me — profile & settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
