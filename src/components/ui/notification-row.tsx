"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

interface NotificationRowProps {
  href: string;
  icon: LucideIcon;
  title: string;
  time: string;
  unread?: boolean;
  preview?: string;
}

export function NotificationRow({
  href,
  icon: Icon,
  title,
  time,
  unread,
  preview,
}: NotificationRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-start gap-3 border-b border-border/40 px-4 py-4 transition-colors last:border-b-0 active:bg-muted/30",
        unread ? "bg-primary/[0.04]" : "bg-white"
      )}
    >
      <div className="relative shrink-0">
        <div className="h-11 w-11 overflow-hidden rounded-xl bg-muted ring-1 ring-border/40">
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {unread && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-[6px] bg-primary ring-2 ring-white" />
        )}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-medium text-muted-foreground">{time}</p>
        <p className={cn("mt-0.5 text-sm leading-snug", unread ? "font-bold text-foreground" : "font-medium text-foreground/85")}>
          {title}
        </p>
        {preview && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{preview}</p>
        )}
      </div>
    </Link>
  );
}
