"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageCircle, Sparkles, User } from "lucide-react";
import { getNavItems, type AppNavIcon } from "@/lib/constants/nav-items";
import { cn } from "@/lib/helpers/utils";
import { useAppStore } from "@/store";
import { usePlatform } from "@/components/platform/platform-provider";
import { RADIUS } from "@/design/tokens";

const icons = {
  compass: Compass,
  "message-circle": MessageCircle,
  sparkles: Sparkles,
  user: User,
} satisfies Record<AppNavIcon, typeof Compass>;

export function BottomNav() {
  const pathname = usePathname();
  const { unreadChats } = useAppStore();
  const { platform } = usePlatform();
  const navItems = getNavItems(platform);

  return (
    <nav className="app-dock safe-bottom pointer-events-none px-3 pb-2 lg:hidden">
      <div
        className="pointer-events-auto mx-auto flex max-w-md items-center justify-around border border-border/50 bg-white/90 px-1 py-1.5 shadow-lg backdrop-blur-xl"
        style={{ borderRadius: RADIUS.sheet }}
      >
        {navItems.map((item) => {
          const Icon = icons[item.icon];
          const isActive = pathname.startsWith(item.href);
          const badge = item.href.includes("/chats") ? unreadChats : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary shadow-[var(--shadow-glow)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                {badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-[6px] bg-primary px-1 text-[10px] font-bold text-white ring-2 ring-white">
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
