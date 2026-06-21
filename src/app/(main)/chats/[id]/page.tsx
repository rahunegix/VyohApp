"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { MessageBubble, TypingIndicator } from "@/components/chat/chat-components";
import { ChatComposer } from "@/components/chat/chat-composer";
import { PremiumContactButton } from "@/components/chat/premium-contact-button";
import { MembershipUpsellModal } from "@/components/subscription/membership-upsell-modal";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { FREE_CHAT_MESSAGE_LIMIT } from "@/lib/subscription/whatsapp-call";
import { DEMO_PROFILES } from "@/services/demo-data";
import { getInitials } from "@/lib/helpers/utils";

type ChatMsg = {
  id: string;
  text: string;
  isOwn: boolean;
  time: string;
  status?: "sent" | "delivered" | "read";
};

/** Start with one incoming message — free user can send exactly 1 reply */
const DEMO_MESSAGES: ChatMsg[] = [
  { id: "1", text: "Hi! Great to connect with you on Saathini.", isOwn: false, time: "10:30 AM" },
];

const CONV_PROFILE_MAP: Record<string, string> = {
  "conv-1": "demo-1",
  "conv-2": "demo-3",
};

function getProfilePhoto(profile: (typeof DEMO_PROFILES)[number]) {
  const primary = profile.photos.find((p) => p.is_primary) ?? profile.photos[0];
  return primary?.url ?? null;
}

function countOwnMessages(messages: ChatMsg[]) {
  return messages.filter((m) => m.isOwn).length;
}

export default function ChatDetailPage() {
  const params = useParams<{ id: string }>();
  const { isPaid, loading: planLoading } = useSubscriptionPlan();
  const [messages, setMessages] = useState<ChatMsg[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messageUpsellOpen, setMessageUpsellOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const profile = useMemo(() => {
    const profileId = CONV_PROFILE_MAP[params.id ?? ""] ?? "demo-1";
    return DEMO_PROFILES.find((p) => p.id === profileId) ?? DEMO_PROFILES[0];
  }, [params.id]);

  const photoUrl = getProfilePhoto(profile);
  const firstName = profile.full_name.split(" ")[0];

  const ownMessageCount = countOwnMessages(messages);
  const messageLimitReached = !planLoading && !isPaid && ownMessageCount >= FREE_CHAT_MESSAGE_LIMIT;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const openMessageUpsell = useCallback(() => {
    setMessageUpsellOpen(true);
  }, []);

  const handleSend = () => {
    if (!input.trim() || typing) return;

    if (!isPaid && ownMessageCount >= FREE_CHAT_MESSAGE_LIMIT) {
      openMessageUpsell();
      return;
    }

    const text = input.trim();
    setMessages((m) => [
      ...m,
      { id: Date.now().toString(), text, isOwn: true, time: "Now", status: "sent" },
    ]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          text: "That sounds wonderful! Let's plan something.",
          isOwn: false,
          time: "Now",
        },
      ]);
    }, 1500);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#faf8f8]">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-white/95 px-3 py-2.5 backdrop-blur-lg safe-top">
        <div className="flex items-center gap-2">
          <Link
            href="/chats"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
            aria-label="Back to chats"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
          </Link>

          <Link href={`/matches/${profile.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-2 ring-white">
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
                <span className="h-2 w-2 rounded-full bg-success" />
                Online
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5">
            <PremiumContactButton
              variant="phone"
              profileId={profile.id}
              profileName={profile.full_name}
            />
            <PremiumContactButton
              variant="whatsapp"
              profileId={profile.id}
              profileName={profile.full_name}
            />
          </div>
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
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-white/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <Shield className="h-3 w-3 text-primary" />
              {isPaid
                ? "Unlimited messages · Calls use credits"
                : `Free plan: ${FREE_CHAT_MESSAGE_LIMIT} message · Premium for calls`}
            </div>
          </div>

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
