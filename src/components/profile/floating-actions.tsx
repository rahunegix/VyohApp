"use client";

import { X, RotateCcw, HeartHandshake, Info, Bookmark } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

export interface FloatingActionsProps {
  onPass?: () => void;
  onRewind?: () => void;
  onLike?: () => void;
  onInfo?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  className?: string;
  /** When false, skips the default negative top margin (use with absolute positioning) */
  overlap?: boolean;
}

function stopClick(e: React.MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function FloatingActions({
  onPass,
  onRewind,
  onLike,
  onInfo,
  onBookmark,
  isBookmarked,
  className,
  overlap = true,
}: FloatingActionsProps) {
  return (
    <div
      className={cn(
        "relative z-40 flex items-center justify-center gap-3 px-4",
        overlap && "-mt-7",
        className
      )}
    >
      {/* Rewind */}
      {onRewind && (
        <button
          type="button"
          onClick={(e) => { stopClick(e); onRewind(); }}
          className="stagger-1 animate-scale-bounce flex h-[44px] w-[44px] items-center justify-center rounded-[6px] border border-transparent glass text-muted-foreground shadow-[var(--shadow-glass)] transition-all duration-200 hover:border-warning hover:text-warning active:scale-90"
          aria-label="Rewind"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      )}

      {/* Pass */}
      {onPass && (
        <button
          type="button"
          onClick={(e) => { stopClick(e); onPass(); }}
          className="stagger-2 animate-scale-bounce flex h-11 w-11 items-center justify-center rounded-[6px] border border-border/60 bg-white text-muted-foreground shadow-md transition-all duration-200 hover:border-destructive hover:text-destructive hover:shadow-lg active:scale-90"
          aria-label="Pass"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>
      )}

      {/* Like (Center, Larger) */}
      {onLike && (
        <button
          type="button"
          onClick={(e) => { stopClick(e); onLike(); }}
          className="stagger-3 animate-scale-bounce flex h-14 w-14 items-center justify-center rounded-[6px] bg-primary text-white shadow-[var(--shadow-float)] transition-all duration-200 hover:bg-primary/90 hover:shadow-lg active:scale-90"
          aria-label="Send interest"
        >
          <HeartHandshake className="h-6 w-6 animate-pulse-soft" />
        </button>
      )}

      {/* Info */}
      {onInfo && (
        <button
          type="button"
          onClick={(e) => { stopClick(e); onInfo(); }}
          className="stagger-4 animate-scale-bounce flex h-[44px] w-[44px] items-center justify-center rounded-[6px] border border-transparent glass text-muted-foreground shadow-[var(--shadow-glass)] transition-all duration-200 hover:border-primary hover:text-primary active:scale-90"
          aria-label="Info"
        >
          <Info className="h-5 w-5" />
        </button>
      )}

      {/* Bookmark */}
      {onBookmark && (
        <button
          type="button"
          onClick={(e) => { stopClick(e); onBookmark(); }}
          className={cn(
            "stagger-5 animate-scale-bounce flex h-11 w-11 items-center justify-center rounded-[6px] border shadow-md transition-all duration-200 active:scale-90",
            isBookmarked
              ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
              : "border-border/60 bg-white text-muted-foreground hover:border-primary hover:text-primary hover:shadow-lg"
          )}
          aria-label="Bookmark"
        >
          <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
        </button>
      )}
    </div>
  );
}
