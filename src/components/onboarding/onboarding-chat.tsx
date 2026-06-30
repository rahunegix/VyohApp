"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionChip } from "@/components/ui/selection-chip";
import { cn } from "@/lib/helpers/utils";
import type { OnboardingChipOption, OnboardingPromptConfig } from "@/lib/constants/onboarding-chat";
import { useTranslation } from "@/hooks/use-translation";

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
}

interface OnboardingChatProps {
  messages: ChatMessage[];
  typing: boolean;
  currentPrompt: OnboardingPromptConfig;
  selectedChips: string[];
  input: string;
  onChipToggle: (chip: OnboardingChipOption) => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onFinish?: () => void;
  isLastStep: boolean;
  canSend: boolean;
  stepAnswered: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-2xl rounded-bl-md border border-border/40 bg-white px-3 py-2 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-[6px] bg-primary/50"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function OnboardingChat({
  messages,
  typing,
  currentPrompt,
  selectedChips,
  input,
  onChipToggle,
  onInputChange,
  onSend,
  onFinish,
  isLastStep,
  canSend,
  stepAnswered,
}: OnboardingChatProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend && !typing) onSend();
    }
  };

  const selectedCount = selectedChips.length;

  return (
    <div className="grid h-full min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-muted/10">
      <div ref={scrollRef} className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-4 pt-2 hide-scrollbar">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "ai" && (
                  <div className="mr-1.5 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                    msg.role === "ai"
                      ? "rounded-bl-md border border-border/40 bg-white text-foreground"
                      : "rounded-br-md bg-primary text-white"
                  )}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && <TypingIndicator />}
        </div>
      </div>

      <div className="shrink-0 border-t border-border/50 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-bottom">
        {!stepAnswered && (
          <div className="px-4 pb-2 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {currentPrompt.multiSelect ? t("tap_chips") : t("pick_one")}
              </p>
              {selectedCount > 0 && (
                <span className="text-[11px] font-bold text-primary">
                  {selectedCount} {t("selected")}
                </span>
              )}
            </div>
            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto hide-scrollbar">
              {currentPrompt.chips.map((chip) => (
                <SelectionChip
                  key={chip.id}
                  selected={selectedChips.includes(chip.id)}
                  onClick={() => onChipToggle(chip)}
                  label={chip.label}
                  className={cn(typing && "pointer-events-none opacity-50")}
                />
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border/40 px-4 py-3">
          {isLastStep && stepAnswered ? (
            <Button onClick={onFinish} className="h-12 w-full" size="lg">
              {t("generate_profile")}
            </Button>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentPrompt.placeholder}
                rows={1}
                disabled={typing}
                className="max-h-20 min-h-[44px] flex-1 resize-none rounded-[6px] border border-border/60 bg-muted/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
              <Button
                onClick={onSend}
                disabled={!canSend || typing}
                size="icon"
                className="h-11 w-11 shrink-0"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
