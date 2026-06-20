"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { MessageBubble, TypingIndicator } from "@/components/chat/chat-components";
import { ChatComposer } from "@/components/chat/chat-composer";
import { DEMO_PROFILES } from "@/services/demo-data";

type ChatMsg = {
  id: string;
  text: string;
  isOwn: boolean;
  time: string;
  status?: "sent" | "delivered" | "read";
};

const DEMO_MESSAGES: ChatMsg[] = [
  { id: "1", text: "Hi! Great to connect with you on Saathini.", isOwn: false, time: "10:30 AM" },
  { id: "2", text: "Hi Ananya! Likewise. I saw we both love trekking.", isOwn: true, time: "10:32 AM", status: "read" },
  { id: "3", text: "Yes! Have you done the Nag Tibba trek?", isOwn: false, time: "10:33 AM" },
  { id: "4", text: "Not yet, but it's on my list! Would love to hear about your experience.", isOwn: true, time: "10:35 AM", status: "delivered" },
];

export default function ChatDetailPage() {
  const params = useParams();
  const [messages, setMessages] = useState<ChatMsg[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const profile = DEMO_PROFILES[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim() || typing) return;
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
    <div className="flex h-dvh flex-col overflow-hidden">
      <PageHeader
        showBack
        backHref="/chats"
        title={profile.full_name}
        subtitle="Contact hidden until mutual consent"
      />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
        <div className="space-y-3">
          <div className="text-center">
            <p className="inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Chat started · Contact details are protected
            </p>
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
        placeholder="Type a message…"
        disabled={typing}
      />
    </div>
  );
}
