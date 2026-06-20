import { cn } from "@/lib/helpers/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" && "bg-primary/10 text-primary",
        variant === "secondary" && "bg-muted text-muted-foreground",
        variant === "success" && "bg-green-50 text-success",
        variant === "warning" && "bg-amber-50 text-warning",
        variant === "outline" && "border border-border text-foreground",
        className
      )}
      {...props}
    />
  );
}
