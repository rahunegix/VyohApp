"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Shield, Users, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { SuccessStoryShowcase } from "@/components/auth/success-story-showcase";
import { AppLogo } from "@/components/common/app-logo";
import { SiteFooter } from "@/components/common/site-footer";
import { APP_TAGLINE } from "@/lib/constants";
import type { SuccessStoryView } from "@/lib/success-stories/types";
const FEATURES = [
  {
    icon: Heart,
    title: "Modern Dating",
    desc: "Explore connections with intent and respect",
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    icon: Users,
    title: "Hindu Marriage",
    desc: "Family values, rituals, and lifelong commitment",
    color: "text-amber-600 bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    desc: "Phone, face & trust score for safe matching",
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Compatibility",
    desc: "Smart matches rooted in Pahadi culture",
    color: "text-violet-600 bg-violet-500/10",
  },
];

export function WelcomePageClient({
  stories: initialStories,
  storyLimit = 3,
}: {
  stories: SuccessStoryView[];
  storyLimit?: number;
}) {
  const [stories, setStories] = useState(initialStories);

  useEffect(() => {
    let cancelled = false;

    async function loadLatest() {
      try {
        const res = await fetch(`/api/success-stories/latest?limit=${storyLimit}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setStories(json.data);
        }
      } catch {
        // Keep SSR stories on failure
      }
    }

    loadLatest();
    return () => {
      cancelled = true;
    };
  }, [storyLimit]);

  const heroStory = stories[0];
  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#12080c] lg:mx-auto lg:h-auto lg:max-h-none lg:min-h-[640px] lg:max-w-[960px] lg:flex-row lg:shadow-[var(--shadow-elevated)]">
      <AuthVisualPanel
        variant="welcome"
        featuredStories={stories}
        className="hidden min-h-dvh lg:flex lg:w-[min(420px,44%)]"
      />

      <div className="relative flex h-dvh min-h-0 flex-1 flex-col overflow-hidden">
        {heroStory ? (
          <div className="absolute inset-0 z-0 lg:hidden">
            <div className="absolute inset-0">
              <Image
                src={heroStory.src}
                alt=""
                fill
                priority
                className="object-cover opacity-40"
                sizes="100vw"
                aria-hidden
              />
            </div>
            <div className="absolute -top-[10%] -right-[10%] h-[50vh] w-[50vh] rounded-full bg-primary/40 blur-[100px]" />
            <div className="absolute top-[40%] -left-[20%] h-[60vh] w-[60vh] rounded-full bg-orange-500/30 blur-[120px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#12080c]/70 via-[#12080c]/85 to-[#12080c]" />
          </div>
        ) : null}

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden lg:bg-white lg:text-foreground">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain hide-scrollbar px-6 pt-14 pb-4 safe-top lg:px-10 lg:pt-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden mb-6 flex flex-col items-center pt-8 text-center text-white"
            >
              <AppLogo className="h-11" priority />
              <p className="mt-3 text-lg font-medium text-white/90">{APP_TAGLINE}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 lg:hidden"
            >
              {stories.length > 0 && (
                <SuccessStoryShowcase stories={stories} theme="dark" compact />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="hidden lg:block"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Welcome</p>
              <AppLogo className="mt-3 h-9" />
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Uttarakhand&apos;s verified relationship platform — dating, serious relationships, and Hindu marriage paths, all in one trusted place.
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-6 text-center text-[15px] leading-relaxed text-white/75 lg:hidden"
            >
              Real stories from couples who found marriage, long-term love, and dating — all on Saathini.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 hidden lg:block"
            >
              {stories.length > 0 && (
                <SuccessStoryShowcase stories={stories} theme="light" />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-3 lg:mt-2"
            >
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-md lg:border-border/50 lg:bg-muted/30 lg:backdrop-blur-none"
                  >
                    <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${f.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-bold text-white lg:text-foreground">{f.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/65 lg:text-muted-foreground">{f.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            <SiteFooter variant="dark" className="mt-4 border-white/10 bg-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="shrink-0 space-y-3 border-t border-white/10 bg-[#12080c]/95 px-6 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl safe-bottom lg:border-border/50 lg:bg-white/95 lg:px-10 lg:py-5"
          >
            <Link href="/onboarding/language" className="block">
              <Button
                size="lg"
                className="group h-14 w-full rounded-2xl text-lg font-bold shadow-xl lg:h-13 lg:shadow-lg"
              >
                Get Started
                <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <p className="text-center text-xs font-medium text-white/50 lg:text-muted-foreground">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
