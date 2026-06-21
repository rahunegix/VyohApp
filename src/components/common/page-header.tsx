"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HelpChatTrigger } from "@/components/common/help-chat-widget";
import { cn } from "@/lib/helpers/utils";

interface PageHeaderProps {
  title?: React.ReactNode;
  subtitle?: string;
  subtitleClassName?: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
  showHelp?: boolean;
  className?: string;
  transparent?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  subtitleClassName,
  showBack = false,
  backHref = "..",
  rightAction,
  showHelp = true,
  className,
  transparent = false,
}: PageHeaderProps) {
  const showActions = Boolean(rightAction) || showHelp;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center gap-3 px-4 py-3",
        !transparent && "border-b border-border/50 bg-white/95 backdrop-blur-lg",
        className
      )}
    >
      {showBack && (
        <Link
          href={backHref}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
        </Link>
      )}
      {title ? (
        <div className="min-w-0 flex-1">
          <div className={cn(typeof title === "string" && "truncate")}>
            {typeof title === "string" ? (
              <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
            ) : (
              title
            )}
          </div>
          {subtitle && (
            <p className={cn("truncate text-sm text-muted-foreground", subtitleClassName)}>
              {subtitle}
            </p>
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}
      {showActions && (
        <div className="flex shrink-0 items-center gap-1">
          {rightAction}
          {showHelp && <HelpChatTrigger />}
        </div>
      )}
    </header>
  );
}
