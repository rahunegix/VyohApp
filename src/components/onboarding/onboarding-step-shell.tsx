"use client";

import { PageHeader } from "@/components/common/page-header";
import { AppLogo } from "@/components/common/app-logo";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { StepIndicator } from "@/components/common/step-indicator";
import { cn } from "@/lib/helpers/utils";

interface OnboardingStepShellProps {
  backHref?: string;
  title?: string;
  currentStep: number;
  totalSteps?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerClassName?: string;
  contentClassName?: string;
  hideStepMeta?: boolean;
  /** Removes inner padding — for full-height chat layouts */
  flushContent?: boolean;
}

export function OnboardingStepShell({
  backHref,
  title,
  currentStep,
  totalSteps = 9,
  children,
  footer,
  footerClassName,
  contentClassName,
  hideStepMeta = false,
  flushContent = false,
}: OnboardingStepShellProps) {
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-rose-50/40 via-white to-white">
      <div className="shrink-0 border-b border-border/40 bg-white/90 backdrop-blur-md">
        <PageHeader
          showBack
          backHref={backHref}
          title={title}
          rightAction={
            <div className="flex items-center justify-between gap-2">
              <AppLogo className="h-7 w-auto max-w-[128px]" />
              <LanguageSwitcher />
            </div>
          }
        />
        {!hideStepMeta && (
          <div className="px-6 py-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="rounded-[6px] border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{progress}%</span>
            </div>
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}
      </div>

      {flushContent ? (
        <div className={cn("flex h-full min-h-0 flex-1 flex-col overflow-hidden", contentClassName)}>
          {children}
        </div>
      ) : (
        <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain hide-scrollbar", contentClassName)}>
          <div className="px-6 py-5 pb-8">{children}</div>
        </div>
      )}

      {footer && (
        <div
          className={cn(
            "shrink-0 border-t border-border/40 bg-white/95 px-6 py-4 shadow-[0_-12px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl safe-bottom",
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export function OnboardingStepHeading({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className="font-display text-2xl font-normal tracking-tight text-foreground lg:text-[1.75rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
