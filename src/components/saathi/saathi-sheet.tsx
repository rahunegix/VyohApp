"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { SaathiPresence } from "./saathi-presence";
import { useUIStore } from "@/store/ui";

const HIDDEN_ON = ["/onboarding", "/login", "/otp", "/", "/admin"];

export function SaathiSheet() {
  const open = useUIStore((s) => s.saathiSheetOpen);
  const setOpen = useUIStore((s) => s.setSaathiSheetOpen);
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const ask = async () => {
    const msg = query.trim();
    if (!msg || loading) return;
    setLoading(true);
    setReply("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "assistant", message: msg }),
      });
      const json = await res.json();
      setReply(json.data?.reply ?? json.reply ?? "I'm here to help with your journey.");
    } catch {
      setReply("Let's try that again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={setOpen} title="Saathi">
      <div className="space-y-4 px-1 pb-6">
        <SaathiPresence message="Ask me about matches, your profile, or what to do next." compact />
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hide my profile for a week…"
          rows={3}
          className="w-full resize-none rounded-[20px] border border-border bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button className="w-full" onClick={ask} loading={loading} disabled={!query.trim()}>
          Ask Saathi
        </Button>
        {reply && (
          <p className="rounded-[20px] bg-primary/5 p-4 text-sm leading-relaxed text-foreground">{reply}</p>
        )}
      </div>
    </BottomSheet>
  );
}
