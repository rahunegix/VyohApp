"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

interface FloatingBackButtonProps {
  onClick?: () => void;
  className?: string;
}

export function FloatingBackButton({ onClick, className }: FloatingBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={onClick ?? (() => router.back())}
      aria-label="Go back"
      className={cn(
        "absolute top-12 left-5 z-50 h-11 w-11 flex items-center justify-center rounded-full",
        "bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-md",
        "transition-transform active:scale-95 hover:bg-black/50",
        className
      )}
    >
      <ArrowLeft className="h-6 w-6" />
    </button>
  );
}
