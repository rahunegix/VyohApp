"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** default: ~88dvh max | tall: ~92dvh | full: nearly full screen on mobile */
  size?: "default" | "tall" | "full";
  /** Center title like reference dating apps */
  centeredTitle?: boolean;
  showClose?: boolean;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  size = "default",
  centeredTitle = false,
  showClose = true,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!mounted) return null;

  const maxHeightClass =
    size === "full"
      ? "max-h-[min(96dvh,720px)]"
      : size === "tall"
        ? "max-h-[min(92dvh,700px)]"
        : "max-h-[min(88dvh,680px)]";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center"
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "bottom-sheet-title" : undefined}
            className={cn(
              "relative z-10 flex w-full max-w-[480px] flex-col overflow-hidden bg-white",
              maxHeightClass,
              "rounded-t-[var(--radius-sheet)] shadow-[0_-20px_60px_rgba(0,0,0,0.18)]",
              className
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 bg-white px-5 pb-4 pt-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-[6px] bg-muted-foreground/20" />
              <div
                className={cn(
                  "flex items-start gap-3",
                  centeredTitle && "flex-col items-center text-center"
                )}
              >
                <div className={cn("min-w-0 flex-1", centeredTitle && "w-full")}>
                  {title && (
                    <h2
                      id="bottom-sheet-title"
                      className="text-xl font-bold leading-tight tracking-tight"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {showClose && !centeredTitle && (
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2 hide-scrollbar">
              {children}
            </div>

            {footer && (
              <div className="shrink-0 border-t border-border/40 bg-white px-5 pt-3 shadow-[0_-12px_32px_rgba(0,0,0,0.06)] pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Full-width pill Done button for bottom sheet footers */
export function BottomSheetDoneButton({
  onClick,
  label = "Done",
  disabled,
  loading,
}: {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="ui-btn-pill flex h-14 w-full items-center justify-center bg-primary text-base font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        label
      )}
    </button>
  );
}
