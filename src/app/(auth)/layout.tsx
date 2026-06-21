"use client";

import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { HelpChatTrigger } from "@/components/common/help-chat-widget";
import { AuthVisualPanel, type AuthVisualVariant } from "@/components/auth/auth-visual-panel";
import { useLatestSuccessStories } from "@/hooks/use-latest-success-stories";
import { useLanguageStore } from "@/store/language";
import { useEffect } from "react";

function getVisualVariant(pathname: string): AuthVisualVariant {
  if (pathname.startsWith("/onboarding")) return "onboarding";
  if (pathname === "/login" || pathname === "/otp") return "login";
  return "welcome";
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrate } = useLanguageStore();
  const { stories } = useLatestSuccessStories(3);
  const isWelcome = pathname === "/welcome";
  const isOnboarding = pathname.startsWith("/onboarding");
  const showSwitcher = !isWelcome && !isOnboarding;
  const variant = getVisualVariant(pathname);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isWelcome) {
    return <>{children}</>;
  }

  return (
    <div className="relative h-dvh max-h-dvh overflow-hidden bg-muted/30 lg:min-h-dvh lg:max-h-none lg:overflow-visible lg:flex lg:items-stretch lg:justify-center lg:p-6">
      {showSwitcher && (
        <div className="pointer-events-none fixed right-0 top-4 z-50 p-4 lg:absolute lg:right-8 lg:top-8">
          <div className="pointer-events-auto flex items-center gap-2">
            <HelpChatTrigger />
            <LanguageSwitcher />
          </div>
        </div>
      )}

      <div className="mx-auto flex h-dvh max-h-dvh w-full max-w-[960px] flex-col overflow-hidden bg-white shadow-[var(--shadow-elevated)] lg:h-auto lg:min-h-[640px] lg:max-h-[90dvh] lg:flex-row lg:rounded-[2rem] lg:border lg:border-border/50">
        <AuthVisualPanel
          variant={variant}
          featuredStories={stories}
          className="hidden lg:flex lg:w-[min(420px,44%)] lg:shrink-0 lg:rounded-l-[2rem]"
        />
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:max-h-[90dvh] lg:min-h-[640px] lg:rounded-r-[2rem]">
          {children}
        </div>
      </div>
    </div>
  );
}
