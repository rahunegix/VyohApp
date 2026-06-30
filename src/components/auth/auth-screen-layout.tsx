"use client";

import { motion } from "framer-motion";
import { AuthBackButton } from "@/components/auth/auth-back-button";
import { cn } from "@/lib/helpers/utils";

interface AuthScreenLayoutProps {
  title: string;
  subtitle?: React.ReactNode;
  backHref?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

/** Premium auth/onboarding screen — Saathi-inspired single-task flows. */
export function AuthScreenLayout({
  title,
  subtitle,
  backHref,
  children,
  footer,
  centered = true,
  className,
}: AuthScreenLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-rose-50/30 via-white to-white lg:overflow-y-auto">
      <div
        className={cn(
          "flex flex-1 flex-col px-6 pb-8 pt-6 safe-top lg:px-10 lg:py-12",
          centered && "lg:justify-center",
          className
        )}
      >
        <AuthBackButton href={backHref} className="mb-8" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(centered && "text-center lg:text-left")}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Saathini</p>
          <h1 className="mt-2 font-display text-[1.85rem] font-normal leading-tight tracking-tight text-foreground lg:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <div className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mt-8 flex flex-1 flex-col lg:mt-10 lg:flex-none"
        >
          {children}
        </motion.div>

        {footer && (
          <div className="mt-auto space-y-4 pt-8 lg:mt-10 lg:pt-0">{footer}</div>
        )}
      </div>
    </div>
  );
}
