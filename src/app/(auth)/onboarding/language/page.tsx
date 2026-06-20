"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthBackButton } from "@/components/auth/auth-back-button";
import { SuccessStoryShowcase } from "@/components/auth/success-story-showcase";
import { AppLogo } from "@/components/common/app-logo";
import { LanguageOptionCard } from "@/components/common/language-switcher";
import { LANGUAGES } from "@/lib/i18n/languages";
import { useLatestSuccessStories } from "@/hooks/use-latest-success-stories";
import { useLanguageStore } from "@/store/language";
import { useTranslation } from "@/hooks/use-translation";

export default function LanguageSelectPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const { t, hydrated } = useTranslation();
  const { stories } = useLatestSuccessStories(3);

  if (!hydrated) return null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain hide-scrollbar px-6 pt-6 pb-4 lg:px-10 lg:py-12">
          <div className="mb-6 flex items-center justify-between lg:mb-8">
            <AuthBackButton href="/" dark={false} />
            <AppLogo className="h-7 w-auto max-w-[128px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
          >
            <Globe className="h-7 w-7 text-primary" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">{t("choose_language")}</h1>
            <p className="mt-2 text-muted-foreground">{t("choose_subtitle")}</p>
          </motion.div>

          {stories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-6 lg:hidden"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                Success stories
              </p>
              <SuccessStoryShowcase stories={stories} theme="light" compact />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 space-y-3 pb-2"
          >
            {LANGUAGES.map((lang, i) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
              >
                <LanguageOptionCard
                  lang={lang.code}
                  selected={language === lang.code}
                  onSelect={() => setLanguage(lang.code)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

      <div className="shrink-0 border-t border-border/50 bg-white px-6 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:px-10">
          <Button
            onClick={() => router.push("/login")}
            size="lg"
            className="h-14 w-full rounded-2xl text-[17px] font-bold shadow-lg"
          >
            {t("continue")}
          </Button>
        </div>
    </div>
  );
}
