"use client";

import { useEffect, useRef } from "react";
import { Crown, Mic, Send, Smile } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Free limit reached — show premium lock */
  locked?: boolean;
  onLockedInteract?: () => void;
  className?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder = "Your message",
  disabled = false,
  locked = false,
  onLockedInteract,
  className,
}: ChatComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (locked) {
        onLockedInteract?.();
        return;
      }
      if (value.trim() && !disabled) onSend();
    }
  };

  const handleSendClick = () => {
    if (locked) {
      onLockedInteract?.();
      return;
    }
    if (value.trim() && !disabled) onSend();
  };

  const hasContent = value.trim().length > 0;
  const isDisabled = disabled || locked;

  return (
    <div
      className={cn(
        "app-dock shrink-0 border-t border-border/40 bg-white px-4 py-3 safe-bottom",
        locked && "bg-primary/[0.03]",
        className
      )}
    >
      {locked && (
        <button
          type="button"
          onClick={onLockedInteract}
          className="mb-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <Crown className="h-3.5 w-3.5" />
          Upgrade to send more messages
        </button>
      )}

      <div className="mx-auto flex max-w-[480px] items-center gap-2.5 lg:max-w-2xl">
        <div className="relative min-w-0 flex-1">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => !locked && onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => locked && onLockedInteract?.()}
            placeholder={locked ? "Premium required to continue chatting" : placeholder}
            rows={1}
            disabled={isDisabled}
            readOnly={locked}
            className={cn(
              "block max-h-24 min-h-[46px] w-full resize-none rounded-full border border-border/70 bg-white",
              "py-3 pl-4 pr-11 text-[15px] leading-snug text-foreground shadow-sm",
              "placeholder:text-muted-foreground/70",
              "focus:border-primary/35 focus:outline-none focus:ring-2 focus:ring-primary/15",
              "disabled:opacity-50",
              locked && "cursor-pointer bg-muted/30"
            )}
          />
          <button
            type="button"
            disabled={isDisabled}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-40"
            aria-label="Open emoji picker"
          >
            <Smile className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>

        {hasContent && !locked ? (
          <button
            type="button"
            onClick={handleSendClick}
            disabled={disabled}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-float)] transition-transform active:scale-95 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </button>
        ) : (
          <button
            type="button"
            onClick={locked ? onLockedInteract : undefined}
            disabled={disabled && !locked}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/70 bg-white text-primary shadow-sm transition-colors active:scale-95 disabled:opacity-50",
              locked ? "border-primary/30 bg-primary/10" : "hover:border-primary/25 hover:bg-primary/5"
            )}
            aria-label={locked ? "Upgrade to send messages" : "Voice message"}
          >
            {locked ? (
              <Crown className="h-[18px] w-[18px]" strokeWidth={2.25} />
            ) : (
              <Mic className="h-[18px] w-[18px]" strokeWidth={2.25} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
