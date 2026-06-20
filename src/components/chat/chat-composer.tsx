"use client";

import { useEffect, useRef } from "react";
import { Send, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder = "Message…",
  disabled = false,
  className,
}: ChatComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <div
      className={cn(
        "app-dock shrink-0 border-t border-border/50 bg-background/80 px-3 py-3 backdrop-blur-xl safe-bottom",
        className
      )}
    >
      <div className="mx-auto flex max-w-[480px] items-end gap-2 lg:max-w-2xl">
        <button 
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:text-foreground active:bg-muted"
          type="button"
        >
          <Plus className="h-5 w-5" />
        </button>

        <div className="relative flex-1">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className="max-h-[120px] min-h-[40px] w-full resize-none rounded-[20px] border border-border/60 bg-white px-4 py-2.5 text-[15px] leading-snug text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        {hasContent ? (
          <button
            onClick={onSend}
            disabled={disabled}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform active:scale-90 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        ) : (
          <button 
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            type="button"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
