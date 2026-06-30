"use client";

import { cn } from "@/lib/helpers/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function StepIndicator({ currentStep, totalSteps, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-[6px] transition-all duration-500 ease-out",
            i < currentStep 
              ? "bg-primary shadow-[0_0_8px_rgba(198,40,40,0.35)]" 
              : i === currentStep 
                ? "bg-primary/50 relative overflow-hidden" 
                : "bg-muted"
          )}
        >
          {i === currentStep && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 bg-primary rounded-[6px]"
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface SelectCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SelectCard({ selected, onClick, title, description, icon, className }: SelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-[6px] p-5 text-left transition-all duration-300 overflow-hidden",
        selected
          ? "border-2 border-primary bg-primary/5 shadow-md scale-[1.02]"
          : "border-2 border-transparent bg-white shadow-sm hover:shadow-md hover:border-primary/20",
        className
      )}
    >
      {selected && (
        <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
      )}
      
      <div className="flex items-center gap-4 relative z-10">
        {icon && (
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
            selected ? "bg-primary text-white shadow-md" : "bg-primary/10 text-primary group-hover:bg-primary/20"
          )}>
            {icon}
          </div>
        )}
        
        <div className="flex-1">
          <p className={cn(
            "font-bold text-[17px] transition-colors duration-300",
            selected ? "text-primary" : "text-foreground"
          )}>{title}</p>
          {description && (
            <p className="mt-1 text-sm font-medium text-muted-foreground/80 leading-snug">{description}</p>
          )}
        </div>
        
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-[6px] transition-all duration-300 shrink-0 border-2",
          selected 
            ? "bg-primary border-primary scale-110 shadow-sm" 
            : "bg-transparent border-border group-hover:border-primary/50"
        )}>
          {selected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
        </div>
      </div>
    </button>
  );
}
