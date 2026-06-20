"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, HeartHandshake, MessageCircle, Bell, User } from "lucide-react";
import { AppLogo } from "@/components/common/app-logo";
import { APP_TAGLINE } from "@/lib/constants";
import { APP_NAV_ITEMS, type AppNavIcon } from "@/lib/constants/nav-items";
import { cn } from "@/lib/helpers/utils";
import { useAppStore } from "@/store";

const icons = {
  compass: Compass,
  "heart-handshake": HeartHandshake,
  "message-circle": MessageCircle,
  bell: Bell,
  user: User,
} satisfies Record<AppNavIcon, typeof Compass>;

export function AppSidebar() {
  const pathname = usePathname();
  const { unreadChats, unreadNotifications } = useAppStore();

  return (
    <aside className="app-sidebar hidden lg:flex">
      <div className="flex h-full w-full flex-col px-4 py-6">
        <div className="mb-8 px-2">
          <Link href="/discover" className="group inline-flex flex-col">
            <AppLogo className="h-8 transition-opacity group-hover:opacity-90" />
            <span className="mt-2 text-xs leading-snug text-muted-foreground">{APP_TAGLINE}</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = icons[item.icon];
            const isActive = pathname.startsWith(item.href);
            const badge =
              item.href === "/chats" ? unreadChats :
              item.href === "/activity" ? unreadNotifications : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                  {badge > 0 && (
                    <span
                      className={cn(
                        "absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                        isActive ? "bg-white text-primary" : "bg-primary text-white"
                      )}
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-xs font-semibold text-foreground">Consent-first connections</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Built for Uttarakhand — safe, verified, meaningful matches.
          </p>
        </div>
      </div>
    </aside>
  );
}
