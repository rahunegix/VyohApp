import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Heart, Users } from "lucide-react";
import type { SuccessStoryView } from "@/lib/success-stories/types";
import { cn } from "@/lib/helpers/utils";

const TYPE_META: Record<
  SuccessStoryView["type"],
  { icon: typeof Heart; badgeClass: string }
> = {
  marriage: {
    icon: Users,
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  relationship: {
    icon: Heart,
    badgeClass: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  },
};

export function SuccessStoryCard({
  story,
  className,
}: {
  story: SuccessStoryView;
  className?: string;
}) {
  const meta = TYPE_META[story.type];
  const Icon = meta.icon;

  return (
    <Link
      href={`/success-stories/${story.slug}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] active:scale-[0.99]",
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={story.src}
          alt={story.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 50vw, 280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            meta.badgeClass
          )}
        >
          <Icon className="h-3 w-3" />
          {story.typeLabel}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-lg font-bold text-white">{story.names}</p>
          <p className="mt-1 line-clamp-2 text-sm text-white/85">&ldquo;{story.quote}&rdquo;</p>
          <p className="mt-2 text-xs text-white/70">
            {story.location}
            {story.timeline ? ` · ${story.timeline}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-primary">
        Read full story
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
