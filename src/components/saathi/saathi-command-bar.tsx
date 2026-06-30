"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/helpers/utils";
import { RADIUS } from "@/design/tokens";

interface SaathiCommandBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

const HINTS = [
  "Someone spiritual from Garhwal",
  "Improve my profile",
  "Someone who enjoys mountains",
];

export function SaathiCommandBar({
  onSearch,
  loading,
  placeholder = "Ask Saathi anything…",
  className,
}: SaathiCommandBarProps) {
  const [query, setQuery] = useState("");

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex items-center gap-2 border border-border/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md"
        style={{ borderRadius: RADIUS.input }}
      >
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          disabled={loading}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {HINTS.map((hint) => (
          <button
            key={hint}
            type="button"
            onClick={() => {
              setQuery(hint);
              onSearch(hint);
            }}
            className="rounded-[6px] border border-border/50 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
}
