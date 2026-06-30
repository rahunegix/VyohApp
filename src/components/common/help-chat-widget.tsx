"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Headphones,
  X,
  Send,
  Phone,
  MessageCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/helpers/utils";
import {
  APP_NAME,
  MAX_HELP_CHAT_QUESTIONS,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DISPLAY,
} from "@/lib/constants";
import { useHelpChatStore, type HelpChatMessage } from "@/store/help-chat";

const HIDDEN_PATTERNS = [
  /^\/admin/,
  /^\/$/,
  /^\/onboarding\/ai-chat$/,
  /^\/chats\/[^/]+$/,
];

const QUICK_PROMPTS = [
  "How does verification work?",
  "What are Premium plans?",
  "How do I improve my profile?",
  "I need to talk to an agent",
];

const WELCOME_MESSAGE = `Hi! I'm ${APP_NAME} AI. Ask me anything about profiles, matches, verification, or safety. For urgent help, call our agent at ${SUPPORT_PHONE_DISPLAY}.`;

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-muted px-3 py-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-[6px] bg-muted-foreground/40 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function buildConversationContext(
  messages: HelpChatMessage[],
  pathname: string
): string {
  const history = messages
    .slice(-10)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");
  return `Current page: ${pathname}\n${history ? `Conversation:\n${history}` : ""}`.trim();
}

export function HelpChatTrigger({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isOpen, open, close } = useHelpChatStore();

  if (HIDDEN_PATTERNS.some((p) => p.test(pathname))) return null;

  return (
    <button
      type="button"
      onClick={() => (isOpen ? close() : open())}
      className={cn(
        "flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[6px] px-2.5 transition-colors sm:px-3",
        isOpen
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      aria-label={isOpen ? "Close help" : "Open help chat"}
      aria-expanded={isOpen}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
      <span className="hidden text-sm font-semibold sm:inline">Help</span>
    </button>
  );
}

export function HelpChatPanel() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const welcomedRef = useRef(false);

  const {
    isOpen,
    messages,
    questionCount,
    close,
    addMessage,
    incrementQuestions,
    resetSession,
  } = useHelpChatStore();

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hidden = HIDDEN_PATTERNS.some((p) => p.test(pathname));
  const questionsLeft = MAX_HELP_CHAT_QUESTIONS - questionCount;
  const limitReached = questionCount >= MAX_HELP_CHAT_QUESTIONS;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, isOpen]);

  useEffect(() => {
    if (!isOpen || welcomedRef.current || messages.length > 0) return;
    welcomedRef.current = true;
    addMessage({
      id: "welcome",
      role: "assistant",
      text: WELCOME_MESSAGE,
    });
  }, [isOpen, messages.length, addMessage]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing || limitReached) return;

      const userMsg: HelpChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
      };
      addMessage(userMsg);
      incrementQuestions();
      setInput("");
      setTyping(true);

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "assistant",
            message: trimmed,
            context: buildConversationContext([...messages, userMsg], pathname),
          }),
        });

        const data = await res.json();
        const reply =
          data?.data?.reply ??
          (limitReached
            ? `You've reached the chat limit. Please call our agent at ${SUPPORT_PHONE_DISPLAY} for further help.`
            : "Sorry, I couldn't process that. Please try again or call our agent.");

        addMessage({
          id: `ai-${Date.now()}`,
          role: "assistant",
          text: reply,
        });
      } catch {
        addMessage({
          id: `err-${Date.now()}`,
          role: "assistant",
          text: `Something went wrong. Please call our agent at ${SUPPORT_PHONE_DISPLAY}.`,
        });
      } finally {
        setTyping(false);
      }
    },
    [typing, limitReached, addMessage, incrementQuestions, messages, pathname]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleReset = () => {
    resetSession();
    welcomedRef.current = false;
    addMessage({
      id: `welcome-${Date.now()}`,
      role: "assistant",
      text: WELCOME_MESSAGE,
    });
    welcomedRef.current = true;
  };

  if (hidden || !mounted) return null;

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 360 }}
          className={cn(
            "fixed z-[200] flex flex-col overflow-hidden bg-white",
            "inset-0 h-dvh w-full safe-top",
            "lg:inset-auto lg:bottom-6 lg:right-[max(1rem,calc((100vw-min(960px,100vw))/2+1rem))]",
            "lg:top-auto lg:left-auto lg:h-[min(560px,calc(100dvh-3rem))] lg:w-[min(380px,calc(100vw-2rem))]",
            "lg:rounded-2xl lg:border lg:border-border/60 lg:shadow-2xl"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Help chat"
        >
            {/* Header */}
            <div className="shrink-0 bg-primary text-white">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-white/20">
                  <Headphones className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{APP_NAME} Help</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-[6px] bg-emerald-300" />
                    AI assistant · Agent available
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-white/15 transition-colors hover:bg-white/25"
                  aria-label="Close help chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Agent contact strip */}
              <div className="flex items-center gap-2 border-t border-white/15 bg-primary/90 px-4 py-2.5">
                <Phone className="h-4 w-4 shrink-0 text-white/90" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                    Contact Agent
                  </p>
                  <a
                    href={`tel:+91${SUPPORT_PHONE}`}
                    className="text-sm font-semibold text-white hover:underline"
                  >
                    {SUPPORT_PHONE_DISPLAY}
                  </a>
                </div>
                <a
                  href={`https://wa.me/91${SUPPORT_PHONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 items-center gap-1 rounded-lg bg-white/15 px-2.5 text-[11px] font-medium text-white transition-colors hover:bg-white/25"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 hide-scrollbar"
            >
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "assistant" && (
                      <div className="mr-1.5 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.role === "assistant"
                          ? "rounded-bl-md bg-muted text-foreground"
                          : "rounded-br-md bg-primary text-white"
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && <TypingIndicator />}
              </div>

              {!limitReached && messages.length <= 1 && !typing && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-[6px] border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border/60 bg-white px-3 py-2.5 safe-bottom">
              {limitReached ? (
                <div className="space-y-2 text-center">
                  <p className="text-xs text-muted-foreground">
                    You&apos;ve used all {MAX_HELP_CHAT_QUESTIONS} AI questions for this session.
                  </p>
                  <a
                    href={`tel:+91${SUPPORT_PHONE}`}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white"
                  >
                    <Phone className="h-4 w-4" />
                    Call Agent — {SUPPORT_PHONE_DISPLAY}
                  </a>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex w-full items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Start new chat
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                      Powered by Saathini-Ai · {questionsLeft} question{questionsLeft !== 1 ? "s" : ""} left
                    </p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
                      aria-label="Reset chat"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything about Saathini…"
                      rows={1}
                      disabled={typing}
                      className="max-h-20 min-h-[40px] flex-1 resize-none rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                    />
                    <Button
                      onClick={() => void sendMessage(input)}
                      disabled={!input.trim() || typing}
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-xl"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
}

/** Global help chat panel — trigger via HelpChatTrigger in headers. */
export function HelpChatWidget() {
  return <HelpChatPanel />;
}

/** Opens the global help widget from anywhere (e.g. Help page). */
export function openHelpChat() {
  useHelpChatStore.getState().open();
}
