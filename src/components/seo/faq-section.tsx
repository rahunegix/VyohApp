import type { SeoFaqItem } from "@/lib/seo/types";
import { ChevronDown } from "lucide-react";

export function FaqSection({
  items,
  title = "Frequently asked questions",
}: {
  items: SeoFaqItem[];
  title?: string;
}) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-border/50 bg-muted/20 open:bg-primary/5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
