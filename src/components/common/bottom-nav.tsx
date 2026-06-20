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
    <nav className="app-dock border-t border-border/50 bg-white/95 backdrop-blur-lg safe-bottom lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
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
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                {badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
