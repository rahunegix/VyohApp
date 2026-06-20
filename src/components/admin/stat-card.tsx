import { cn } from "@/lib/helpers/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "primary" | "success" | "warning" | "danger";
}

const accentMap = {
  default: "border-border",
  primary: "border-primary/30 bg-primary/5",
  success: "border-emerald-200 bg-emerald-50/50",
  warning: "border-amber-200 bg-amber-50/50",
  danger: "border-red-200 bg-red-50/50",
};

export function StatCard({ label, value, hint, accent = "default" }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl border bg-white p-4", accentMap[accent])}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
