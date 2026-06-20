"use client";

import * as React from "react";
import { cn } from "@/lib/helpers/utils";

export interface DetailInfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  className?: string;
  valueClassName?: string;
}

export function DetailInfoRow({
  icon,
  label,
  value,
  className,
  valueClassName,
}: DetailInfoRowProps) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div
      className={cn(
        "detail-row flex items-center justify-between py-2.5 px-3 rounded-lg",
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div
        className={cn(
          "text-sm font-medium text-foreground text-right",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  );
}

export interface DetailInfoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DetailInfoGrid({ children, className }: DetailInfoGridProps) {
  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-border/50 overflow-hidden rounded-xl border border-border/30 bg-card",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface DetailInfoChipProps {
  icon: React.ReactNode;
  label?: string; // Optional for chip
  value: string | null | undefined;
  className?: string;
}

export function DetailInfoChip({
  icon,
  label,
  value,
  className,
}: DetailInfoChipProps) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-sm font-medium",
        className
      )}
      title={label}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
