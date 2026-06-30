"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useProgressStore } from "@/store/progress";
import { cn } from "@/lib/helpers/utils";

/**
 * Global blocking loader — matches BikePe ProgressDialog pattern:
 * dimmed overlay + white card with spinner + message.
 */
export function ProgressDialog() {
  const visible = useProgressStore((s) => s.visible);
  const title = useProgressStore((s) => s.title);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1a1a1a]/60 p-6 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={title}
    >
      <div
        className={cn(
          "flex min-w-[200px] max-w-[min(320px,90vw)] items-center gap-3 rounded-[6px] bg-white px-5 py-4",
          "shadow-[0_12px_40px_rgba(0,0,0,0.22)]"
        )}
      >
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-foreground" aria-hidden />
        <p className="text-sm font-semibold leading-snug text-foreground">{title}</p>
      </div>
    </div>,
    document.body
  );
}
