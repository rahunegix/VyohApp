"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/common/app-sidebar";
import { BottomNav } from "@/components/common/bottom-nav";

const HIDE_NAV_PATTERNS = [/^\/chats\/[^/]+$/];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_PATTERNS.some((p) => p.test(pathname));

  return (
    <div className="lg:flex lg:min-h-dvh lg:w-full">
      <AppSidebar />
      <div className={hideNav ? "app-main min-h-dvh" : "app-main min-h-dvh pb-20 lg:pb-0"}>
        {children}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
