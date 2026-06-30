"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/common/app-sidebar";
import { BottomNav } from "@/components/common/bottom-nav";
import { FaceVerificationReminder } from "@/components/verification/face-verification-reminder";
import { PlatformProvider } from "@/components/platform/platform-provider";
import { SaathiOrb, SaathiSheet } from "@/components/saathi";

const HIDE_NAV_PATTERNS = [/^\/(dating|matrimony)\/chats\/[^/]+$/, /^\/chats\/[^/]+$/];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_PATTERNS.some((p) => p.test(pathname));

  return (
    <PlatformProvider>
      <div className="app-fullscreen lg:flex lg:min-h-dvh lg:w-full">
        <AppSidebar />
        <div className={hideNav ? "app-main min-h-dvh" : "app-main min-h-dvh pb-20 lg:pb-0"}>
          {children}
          {!hideNav && <BottomNav />}
          <SaathiOrb />
          <SaathiSheet />
          <FaceVerificationReminder />
        </div>
      </div>
    </PlatformProvider>
  );
}
