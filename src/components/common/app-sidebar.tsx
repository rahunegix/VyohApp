"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageCircle, Sparkles, User } from "lucide-react";
import { AppLogo } from "@/components/common/app-logo";
import { getNavItems, type AppNavIcon } from "@/lib/constants/nav-items";
import { cn } from "@/lib/helpers/utils";
import { useAppStore } from "@/store";
import { PlatformSwitcher } from "@/components/platform/platform-switcher";
import { usePlatform } from "@/components/platform/platform-provider";

const icons = {
  compass: Compass,
  "message-circle": MessageCircle,
  sparkles: Sparkles,
  user: User,
} satisfies Record<AppNavIcon, typeof Compass>;

export function AppSidebar() {
  const pathname = usePathname();
  const { unreadChats } = useAppStore();
  const { platform, config } = usePlatform();
  const navItems = getNavItems(platform);

  return (
    <aside className="app-sidebar hidden lg:flex">
      <div className="flex h-full w-full flex-col px-4 py-6">
        <div className="mb-6 px-2">
          <Link href={getNavItems(platform)[0].href} className="group inline-flex flex-col">
            <AppLogo className="h-8 transition-opacity group-hover:opacity-90" />
            <span className="mt-1 text-sm font-bold text-foreground">{config.label}</span>
            <span className="mt-1 text-xs leading-snug text-muted-foreground">{config.tagline}</span>
          </Link>
          <div className="mt-4">
            <PlatformSwitcher />
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = icons[item.icon];
            const isActive = pathname.startsWith(item.href);
            const badge = item.href.includes("/chats") ? unreadChats : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-[6px] bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-primary/5 p-4">
          <p className="text-xs font-semibold text-primary">Consent-first connections</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Saathi guides you from connection to commitment.
          </p>
        </div>
      </div>
    </aside>
  );
}
