"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

export function SettingsMenuGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-white shadow-[var(--shadow-soft)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SettingsMenuRow({
  href,
  onClick,
  icon: Icon,
  label,
  description,
  destructive,
  trailing,
}: {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  description?: string;
  destructive?: boolean;
  trailing?: React.ReactNode;
}) {
  const inner = (
    <>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px]",
          destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", destructive && "text-destructive")}>{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {trailing ?? <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </>
  );

  const className =
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/60";

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

export function SettingsMenuDivider() {
  return <div className="mx-4 h-px bg-border/60" />;
}
