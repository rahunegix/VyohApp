"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Shield, Users, Sparkles, Mountain, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { SuccessStoryShowcase } from "@/components/auth/success-story-showcase";
import { PlatformShowcase } from "@/components/marketing/platform-showcase";
import { SaathiPresence } from "@/components/saathi";
import { AppLogo } from "@/components/common/app-logo";
import { LanguageOptionCard } from "@/components/common/language-switcher";
import { APP_TAGLINE } from "@/lib/constants";
import { LANGUAGES } from "@/lib/i18n/languages";
import { SAATHI_COPY } from "@/config/ai";
import { getPostAuthPath } from "@/lib/auth/profile";
import { redirectAfterAuth } from "@/lib/auth/redirect-after-auth";
import { useLanguageStore } from "@/store/language";
import { useTranslation } from "@/hooks/use-translation";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { RADIUS } from "@/design/tokens";
import type { SuccessStoryView } from "@/lib/success-stories/types";

const FEATURES = [
  {
    icon: Heart,
    title: "Spark",
    desc: "Modern dating with intent and respect",
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    icon: Users,
    title: "Vivah",
    desc: "Sacred marriage paths with family values",
    color: "text-amber-600 bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Verified",
    desc: "Phone, face & trust for safe matching",
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    icon: Sparkles,
    title: "Saathi",
    desc: "Your AI relationship coach, always guiding",
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
  const router = useRouter();
  const { language, setLanguage, hydrate } = useLanguageStore();
  const { t, hydrated } = useTranslation();
  const [stories, setStories] = useState(initialStories);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.success || !json.data?.profile) return;
        redirectAfterAuth(getPostAuthPath(json.data.profile as Record<string, unknown>));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

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
        // Keep SSR stories
      }
    }
    loadLatest();
    return () => {
      cancelled = true;
    };
  }, [storyLimit]);

  const goToAuth = (mode: "login" | "signup") => {
    sessionStorage.setItem("saathini_auth_mode", mode);
    router.push("/login");
  };

  if (!hydrated) {
    return <PageSkeleton variant="auth" withHeader={false} className="welcome-home min-h-dvh" />;
  }

  const heroStory = stories[0];

  return (
    <div className="welcome-home relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-[#12080c] lg:min-h-dvh lg:flex-row">
      <AuthVisualPanel
        variant="welcome"
        featuredStories={stories}
        className="hidden min-h-dvh lg:flex lg:w-[min(440px,38vw)] lg:shrink-0"
      />

      <div className="relative flex h-dvh min-h-0 flex-1 flex-col overflow-hidden">
        {/* Mobile atmosphere */}
        <div className="absolute inset-0 z-0 lg:hidden">
          {heroStory ? (
            <Image
              src={heroStory.src}
              alt=""
              fill
              priority
              className="object-cover opacity-20"
              sizes="100vw"
              aria-hidden
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a10]/95 via-[#12080c]/98 to-[#0a0508]" />
          <div className="absolute -top-[10%] right-0 h-[40vh] w-[40vh] rounded-full bg-primary/25 blur-[100px]" />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden bg-white lg:bg-gradient-to-br lg:from-[#fffbfb] lg:via-white lg:to-rose-50/40">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain hide-scrollbar px-5 pt-10 pb-4 safe-top sm:px-6 lg:px-12 lg:pt-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center lg:mb-8 lg:text-left"
            >
              <AppLogo className="mx-auto h-11 lg:mx-0 lg:h-12" priority />
              <p className="mt-3 font-display text-[1.65rem] font-normal leading-tight tracking-tight text-foreground lg:text-4xl">
                {t("welcome_tagline")}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground lg:mx-0 lg:max-w-md lg:text-[15px]">
                {t("welcome_desc")}
              </p>
            </motion.div>

            {/* Language — primary action area */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-5 rounded-[6px] border border-border/60 bg-white p-4 shadow-[var(--shadow-soft)] lg:mb-6 lg:p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{t("choose_language")}</h2>
                  <p className="text-xs text-muted-foreground">{t("choose_subtitle")}</p>
                </div>
              </div>
              <div className="space-y-2">
                {LANGUAGES.map((lang, i) => (
                  <motion.div
                    key={lang.code}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                  >
                    <LanguageOptionCard
                      lang={lang.code}
                      selected={language === lang.code}
                      onSelect={() => setLanguage(lang.code)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Saathi */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-5 rounded-[6px] border border-primary/15 bg-gradient-to-r from-primary/[0.06] to-rose-500/[0.04] p-4 lg:mb-6"
            >
              <SaathiPresence message={SAATHI_COPY.onboarding.welcome} compact />
            </motion.div>

            {/* Desktop-only extras */}
            {stories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 hidden lg:block"
              >
                <SuccessStoryShowcase stories={stories} theme="light" />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mb-6 hidden lg:block"
            >
              <PlatformShowcase />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="hidden grid-cols-2 gap-3 lg:grid"
            >
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="border border-border/50 bg-white p-4 shadow-sm"
                    style={{ borderRadius: RADIUS.card }}
                  >
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-[6px] ${f.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{f.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{f.desc}</p>
                  </div>
                );
              })}
            </motion.div>

            <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground lg:hidden">
              <Mountain className="h-4 w-4" />
              <span className="text-xs font-medium">Rooted in Uttarakhand · {APP_TAGLINE}</span>
            </div>
          </div>

          {/* CTA dock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="shrink-0 space-y-2.5 border-t border-border/50 bg-white/95 px-5 py-4 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] backdrop-blur-md safe-bottom sm:px-6 lg:px-12 lg:py-5"
          >
            <Button
              type="button"
              size="lg"
              onClick={() => goToAuth("signup")}
              className="h-13 w-full bg-gradient-to-r from-primary via-rose-600 to-primary text-base font-bold shadow-[var(--shadow-glow)] sm:h-14 sm:text-lg"
            >
              {t("get_started")}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => goToAuth("login")}
              className="h-12 w-full border-border font-bold"
            >
              {t("sign_in")}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">{t("terms_agree")}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
