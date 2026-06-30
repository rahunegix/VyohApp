"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { MessageBubble, TypingIndicator } from "@/components/chat/chat-components";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ContactDetailsButton } from "@/components/chat/contact-details-button";
import { MembershipUpsellModal } from "@/components/subscription/membership-upsell-modal";
import { AiCard } from "@/components/saathi";
import { SAATHI_COPY } from "@/config/ai";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { FREE_CHAT_MESSAGE_LIMIT } from "@/lib/subscription/whatsapp-call";
import { getInitials } from "@/lib/helpers/utils";
import { mapDiscoverProfile } from "@/lib/profiles/map-api-profile";
import type { DiscoverProfile } from "@/types";

type ChatMsg = {
  id: string;
  text: string;
  isOwn: boolean;
  time: string;
  status?: "sent" | "delivered" | "read";
};

function getProfilePhoto(profile: DiscoverProfile) {
  const primary = profile.photos.find((p) => p.is_primary) ?? profile.photos[0];
  return primary?.url ?? null;
}

function countOwnMessages(messages: ChatMsg[]) {
  return messages.filter((m) => m.isOwn).length;
}

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Now";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatDetailPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id ?? "";
  const { isPaid, loading: planLoading } = useSubscriptionPlan();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [profile, setProfile] = useState<DiscoverProfile | null>(null);
  const [myProfileId, setMyProfileId] = useState("");
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messageUpsellOpen, setMessageUpsellOpen] = useState(false);
  const [conversationStarter, setConversationStarter] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [meRes, chatsRes, messagesRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/chats"),
          fetch(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`),
        ]);

        const meJson = await meRes.json();
        const chatsJson = await chatsRes.json();
        const messagesJson = await messagesRes.json();

        if (cancelled) return;

        const profileId = String(meJson.data?.profile?.id ?? "");
        setMyProfileId(profileId);

        const convRows = (chatsJson.data?.conversations ?? []) as Record<string, unknown>[];
        const match = convRows.find((row) => String(row.conversation_id) === conversationId);
        if (match?.profile) {
          setProfile(mapDiscoverProfile(match.profile as Record<string, unknown>));
        }

        if (messagesJson.success && Array.isArray(messagesJson.data)) {
          setMessages(
            messagesJson.data.map((row: Record<string, unknown>) => ({
              id: String(row.id),
              text: String(row.message_text ?? ""),
              isOwn: String(row.sender_profile_id) === profileId,
              time: formatMessageTime(String(row.created_at ?? "")),
              status: "sent" as const,
            }))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (conversationId) load();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!profile || !myProfileId || messages.length > 0) return;
    let cancelled = false;

    async function loadStarters() {
      try {
        const meRes = await fetch("/api/auth/me");
        const me = await meRes.json();
        const myProf = me.data?.profile;
        if (!myProf || cancelled) return;

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "conversation_starters",
            profileA: myProf,
            profileB: profile,
          }),
        });
        const json = await res.json();
        const starter =
          json.data?.shared_interest_questions?.[0] ??
          json.data?.ice_breakers?.[0] ??
          null;
        if (!cancelled && starter) setConversationStarter(starter);
      } catch {
        // silent
      }
    }

    loadStarters();
    return () => {
      cancelled = true;
    };
  }, [profile, myProfileId, messages.length]);

  const photoUrl = profile ? getProfilePhoto(profile) : null;
  const firstName = profile?.full_name.split(" ")[0] ?? "Chat";

  const ownMessageCount = countOwnMessages(messages);
  const messageLimitReached = !planLoading && !isPaid && ownMessageCount >= FREE_CHAT_MESSAGE_LIMIT;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const openMessageUpsell = useCallback(() => {
    setMessageUpsellOpen(true);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || typing) return;

    if (!isPaid && ownMessageCount >= FREE_CHAT_MESSAGE_LIMIT) {
      openMessageUpsell();
      return;
    }

    const text = input.trim();
    const optimistic: ChatMsg = {
      id: `local-${Date.now()}`,
      text,
      isOwn: true,
      time: "Now",
      status: "sent",
    };
    setMessages((m) => [...m, optimistic]);
    setInput("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, text }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      const row = json.data as Record<string, unknown>;
      setMessages((m) =>
        m.map((msg) =>
          msg.id === optimistic.id
            ? {
                id: String(row.id),
                text: String(row.message_text ?? text),
                isOwn: String(row.sender_profile_id) === myProfileId,
                time: formatMessageTime(String(row.created_at ?? "")),
                status: "sent",
              }
            : msg
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-dvh flex-col bg-[#faf8f8] p-4">
        <ListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#faf8f8]">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-white/95 px-3 py-2.5 backdrop-blur-lg safe-top">
        <div className="flex items-center gap-2">
          <Link
            href="/chats"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] text-primary transition-colors hover:bg-primary/5"
            aria-label="Back to chats"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
          </Link>

          {profile ? (
            <Link href={`/matches/${profile.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[6px] bg-primary/10 ring-2 ring-white">
                {photoUrl ? (
                  <Image src={photoUrl} alt={profile.full_name} fill className="object-cover" sizes="44px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                    {getInitials(profile.full_name)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-foreground">
                  {firstName}, {profile.age}
                </p>
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <span className="h-2 w-2 rounded-[6px] bg-success" />
                  Active
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <p className="truncate text-[15px] font-bold text-foreground">Conversation</p>
            </div>
          )}

          {profile ? (
            <ContactDetailsButton profileId={profile.id} profileName={profile.full_name} />
          ) : null}
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
        <div className="space-y-1">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Today</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="mb-3 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-[6px] border border-primary/10 bg-white/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <Shield className="h-3 w-3 text-primary" />
              {isPaid
                ? "Unlimited messages · Contact uses credits"
                : `Free plan: ${FREE_CHAT_MESSAGE_LIMIT} message · Premium for contact details`}
            </div>
          </div>

          {conversationStarter && messages.length === 0 && (
            <AiCard
              variant="starter"
              title={SAATHI_COPY.chat.starterIntro}
              body={`${SAATHI_COPY.chat.starterPrompt}: "${conversationStarter}"`}
              action={{
                label: "Use this opener",
                onClick: () => setInput(conversationStarter),
              }}
              className="mb-4"
            />
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              isOwn={msg.isOwn}
              timestamp={msg.time}
              status={msg.isOwn ? msg.status : undefined}
            />
          ))}
          {typing && <TypingIndicator />}
        </div>
      </div>

      <ChatComposer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={typing}
        locked={messageLimitReached}
        onLockedInteract={openMessageUpsell}
      />

      <MembershipUpsellModal
        open={messageUpsellOpen}
        onOpenChange={setMessageUpsellOpen}
        reason="Upgrade to send unlimited messages on Saathini"
      />
    </div>
  );
}
