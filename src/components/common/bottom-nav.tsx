"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, HeartHandshake, MessageCircle, Bell, User } from "lucide-react";
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

export function BottomNav() {
  const pathname = usePathname();
  const { unreadChats, unreadNotifications } = useAppStore();

  return (
    <nav className="app-dock border-t border-border/40 bg-white/98 backdrop-blur-xl safe-bottom lg:hidden">
      <div className="flex items-center justify-around px-1 py-1.5">
        {APP_NAV_ITEMS.map((item) => {
          const Icon = icons[item.icon];
          const isActive = pathname.startsWith(item.href);
          const badge =
            item.href === "/chats"
              ? unreadChats
              : item.href === "/activity"
                ? unreadNotifications
                : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors",
                isActive ? "nav-active-bar text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-[22px] w-[22px]", isActive && "stroke-[2.5]")} />
                {badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
