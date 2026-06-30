"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTimeGreeting } from "@/config/ai";
import { useUIStore } from "@/store/ui";
import { MOTION, RADIUS } from "@/design/tokens";

interface SaathiBriefProps {
  userName: string;
  matchCount?: number;
  viewCount?: number;
  pendingChats?: number;
  onStart: () => void;
}

export function SaathiBrief({
  userName,
  matchCount = 0,
  viewCount = 0,
  pendingChats = 0,
  onStart,
}: SaathiBriefProps) {
  const dismissed = useUIStore((s) => s.saathiBriefDismissed);
  const dismiss = useUIStore((s) => s.dismissSaathiBrief);

  if (dismissed) return null;

  const greeting = getTimeGreeting(userName);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: MOTION.normal / 1000 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      >
        <motion.div
          initial={{ y: 40, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ duration: MOTION.slow / 1000, type: "spring", damping: 24 }}
          className="w-full max-w-md overflow-hidden border border-white/20 bg-gradient-to-br from-background via-background to-primary/5 p-6 shadow-2xl"
          style={{ borderRadius: RADIUS.sheet }}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[6px] bg-primary/15 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-normal tracking-tight">{greeting}</h2>
          <p className="mt-1 text-muted-foreground">Welcome back.</p>

          <div className="mt-6 space-y-3 text-[15px] leading-relaxed">
            {matchCount > 0 && (
              <p>
                <span className="font-semibold text-primary">{matchCount} people</span> genuinely
                match you today.
              </p>
            )}
            {viewCount > 0 && (
              <p>
                Your profile was viewed <span className="font-semibold">{viewCount} times</span>{" "}
                recently.
              </p>
            )}
            {pendingChats > 0 && (
              <p>
                <span className="font-semibold">{pendingChats} conversation</span>
                {pendingChats > 1 ? "s need" : " needs"} your reply.
              </p>
            )}
            {matchCount === 0 && viewCount === 0 && (
              <p>I&apos;m finding people who genuinely fit you. Ready to explore?</p>
            )}
          </div>

          <p className="mt-6 text-sm font-medium text-muted-foreground">Ready?</p>
          <div className="mt-4 flex flex-col gap-2">
            <Button size="lg" className="w-full" onClick={() => { dismiss(); onStart(); }}>
              Start Discovering
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={dismiss}>
              Skip for now
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
