"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CircleCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

export interface CompatibilitySectionProps {
  score: number;
  name: string;
  strongMatches?: string[];
  warnings?: string[];
  className?: string;
}

export function CompatibilitySection({
  score,
  name,
  strongMatches = [],
  warnings = [],
  className,
}: CompatibilitySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = strongMatches.length > 0 || warnings.length > 0;

  let statusText = "Low Match";
  let statusClass = "text-muted-foreground";
  if (score >= 80) {
    statusText = "Excellent Match";
    statusClass = "text-success";
  } else if (score >= 60) {
    statusText = "Good Match";
    statusClass = "text-primary";
  } else if (score >= 40) {
    statusText = "Fair Match";
    statusClass = "text-warning";
  }

  // SVG Ring calculation
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-soft)] p-5",
        className
      )}
    >
      {/* Top Header Section */}
      <div className="flex items-center gap-5">
        {/* Animated Ring */}
        <div className="relative flex h-[80px] w-[80px] shrink-0 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            {/* Background Circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="#f0f0f0"
              strokeWidth="5"
            />
            {/* Progress Circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="var(--color-primary)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="animate-ring-fill"
            />
          </svg>
          <div className="flex items-baseline gap-0.5 animate-scale-bounce" style={{ animationDelay: '0.5s' }}>
            <span className="text-2xl font-bold text-primary">{score}</span>
            <span className="text-xs font-semibold text-primary">%</span>
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Compatibility
          </span>
          <span className="text-base font-semibold mt-0.5">with {name}</span>
          <span className={cn("text-sm font-medium mt-1", statusClass)}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Details Toggle */}
      {hasDetails && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{isExpanded ? "Hide details" : "See details"}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {strongMatches.map((match, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CircleCheck className="h-4 w-4 mt-0.5 text-success shrink-0" />
                      <span className="text-sm text-foreground">{match}</span>
                    </div>
                  ))}
                  {warnings.map((warning, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                      <span className="text-sm text-foreground">{warning}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
