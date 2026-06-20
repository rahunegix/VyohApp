"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Search, Shield, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ChatListItem, ChatRequestCard } from "@/components/chat/chat-components";
import { EmptyState } from "@/components/common/empty-states";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/helpers/utils";
import { DEMO_PROFILES } from "@/services/demo-data";
import type { ChatRequest, Conversation } from "@/types";

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    match_id: "match-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    other_profile: DEMO_PROFILES[0],
    last_message: {
      id: "msg-1",
      conversation_id: "conv-1",
      sender_profile_id: "demo-1",
      message_text: "Would love to know more about your work!",
      message_type: "text",
      read_at: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    unread_count: 2,
  },
  {
    id: "conv-2",
    match_id: "match-2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    other_profile: DEMO_PROFILES[2],
    last_message: {
      id: "msg-2",
      conversation_id: "conv-2",
      sender_profile_id: "current",
      message_text: "That trek sounds amazing — let's plan something!",
      message_type: "text",
      read_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    unread_count: 0,
  },
];

const DEMO_REQUESTS: (ChatRequest & { sender: (typeof DEMO_PROFILES)[number] })[] = [
  {
    id: "req-1",
    sender_profile_id: "demo-2",
    receiver_profile_id: "current",
    message: "Hi! I noticed we have a lot in common. Would love to connect.",
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sender: DEMO_PROFILES[1],
  },
];

type ChatTab = "chats" | "requests";

function ChatPillTabs({
  active,
  onChange,
  chatCount,
  requestCount,
}: {
  active: ChatTab;
  onChange: (tab: ChatTab) => void;
  chatCount: number;
  requestCount: number;
}) {
  const tabs: { id: ChatTab; label: string; count: number }[] = [
    { id: "chats", label: "Messages", count: chatCount },
    { id: "requests", label: "Requests", count: requestCount },
  ];

  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-muted-foreground shadow-sm hover:bg-muted/80"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  selected ? "bg-white/25 text-white" : "bg-primary/10 text-primary"
                )}
              >
                {tab.count > 9 ? "9+" : tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function ChatsPage() {
  const [tab, setTab] = useState<ChatTab>("chats");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState(DEMO_REQUESTS);

  const unreadTotal = DEMO_CONVERSATIONS.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DEMO_CONVERSATIONS;
    return DEMO_CONVERSATIONS.filter((c) => {
      const name = c.other_profile?.full_name?.toLowerCase() ?? "";
      const message = c.last_message?.message_text?.toLowerCase() ?? "";
      return name.includes(q) || message.includes(q);
    });
  }, [search]);

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col bg-muted/20 lg:min-h-dvh">
      <div className="sticky top-0 z-30 bg-white/95 shadow-sm backdrop-blur-lg">
        <PageHeader
          title="Chats"
          subtitle="Consent-based conversations"
          rightAction={
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
              {unreadTotal > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadTotal > 9 ? "9+" : unreadTotal}
                </span>
              )}
            </div>
          }
        />

        <div className="space-y-3 py-3">
          <ChatPillTabs
            active={tab}
            onChange={setTab}
            chatCount={DEMO_CONVERSATIONS.length}
            requestCount={requests.length}
          />

          {tab === "chats" && (
            <div className="px-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="h-11 w-full rounded-2xl border border-border/50 bg-white pl-10 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2">
        {tab === "chats" ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Safe & consent-first</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Contact details stay hidden until both of you agree to share.
                </p>
              </div>
            </motion.div>

            {filteredConversations.length > 0 ? (
              <div className="space-y-2.5">
                {filteredConversations.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <ChatListItem conversation={c} href={`/chats/${c.id}`} />
                  </motion.div>
                ))}
              </div>
            ) : search.trim() ? (
              <EmptyState
                icon="message"
                title="No matches found"
                description="Try a different name or message keyword."
                action={
                  <Button variant="outline" onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon="message"
                title="No conversations yet"
                description="Send a chat request to start connecting. All chats are consent-based."
                action={
                  <Link
                    href="/discover"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
                  >
                    Discover profiles
                  </Link>
                }
              />
            )}
          </>
        ) : (
          <>
            {requests.length > 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm shadow-[var(--shadow-soft)]">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{requests.length} pending</span> — review before connecting
                </span>
              </div>
            )}

            <div className="space-y-3">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <ChatRequestCard
                    key={req.id}
                    request={req}
                    onAccept={() => setRequests((r) => r.filter((x) => x.id !== req.id))}
                    onReject={() => setRequests((r) => r.filter((x) => x.id !== req.id))}
                  />
                ))
              ) : (
                <EmptyState
                  icon="message"
                  title="No pending requests"
                  description="When someone sends you a chat request, it will appear here."
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
