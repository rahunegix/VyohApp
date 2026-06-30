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
    <div className="relative min-h-dvh w-full overflow-hidden bg-gradient-to-br from-rose-50/50 via-[#eef0f3] to-white lg:min-h-dvh lg:flex lg:items-stretch">
      {showSwitcher && (
        <div className="pointer-events-none fixed right-0 top-4 z-50 p-4 lg:absolute lg:right-8 lg:top-8">
          <div className="pointer-events-auto flex items-center gap-2">
            <HelpChatTrigger />
            <LanguageSwitcher />
          </div>
        </div>
      )}

      <div className="mx-auto flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-white lg:h-auto lg:min-h-dvh lg:max-h-none lg:flex-row">
        <AuthVisualPanel
          variant={variant}
          featuredStories={stories}
          className="hidden lg:flex lg:w-[min(420px,38vw)] lg:shrink-0"
        />
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:min-h-dvh">
          {children}
        </div>
      </div>
    </div>
  );
}
