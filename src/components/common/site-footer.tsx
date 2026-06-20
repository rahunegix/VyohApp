"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/helpers/utils";

const HIDDEN_PREFIXES = ["/admin", "/welcome"];

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

export function SiteFooter({ className, variant = "light" }: Props) {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const isDark = variant === "dark";

  return (
    <footer
      className={cn(
        "border-t px-5 py-6 safe-bottom",
        isDark
          ? "border-white/10 bg-[#12080c] text-white/60"
          : "border-border/60 bg-muted/30 text-muted-foreground",
        className
      )}
    >
      <div className="mx-auto max-w-3xl space-y-3 text-center text-[11px] leading-relaxed sm:max-w-6xl sm:text-xs">
        <p
          className={cn(
            "font-semibold",
            isDark ? "text-white/80" : "text-foreground/80"
          )}
        >
          Powered By InfoTheme Private Limited
        </p>
        <p>
          The content and images used on this site are copyright protected and copyright
          vests with its respective owners. The usage of the content and images on this
          website is intended to promote the works and no endorsement of the artist shall
          be implied. Unauthorized use is prohibited and punishable by law.
        </p>
      </div>
    </footer>
  );
}
