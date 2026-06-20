"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Users } from "lucide-react";
import type { SuccessStory } from "@/lib/constants/success-stories";
import { cn } from "@/lib/helpers/utils";

const TYPE_META: Record<
  SuccessStory["type"],
  { icon: typeof Heart; badgeClass: string }
> = {
  marriage: {
    icon: Users,
    badgeClass: "bg-amber-500/25 text-amber-100 border-amber-400/20",
  },
  relationship: {
    icon: Heart,
    badgeClass: "bg-rose-500/25 text-rose-100 border-rose-400/20",
  },
};

const TYPE_META_LIGHT: Record<SuccessStory["type"], { icon: typeof Heart; badgeClass: string }> = {
  marriage: {
    icon: Users,
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  relationship: {
    icon: Heart,
    badgeClass: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  },
};

function StoryImage({
  story,
  className,
  priority = false,
  sizes,
}: {
  story: SuccessStory;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={story.src}
        alt={story.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/25" />
    </div>
  );
}

function StoryBadge({
  story,
  theme,
}: {
  story: SuccessStory;
  theme: "dark" | "light";
}) {
  const meta = theme === "dark" ? TYPE_META[story.type] : TYPE_META_LIGHT[story.type];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        meta.badgeClass
      )}
    >
      <Icon className="h-3 w-3" />
      {story.typeLabel}
    </span>
  );
}

function StoryOverlay({
  story,
  theme,
  compact = false,
}: {
  story: SuccessStory;
  theme: "dark" | "light";
  compact?: boolean;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 p-3">
      <StoryBadge story={story} theme={theme} />
      <p className="mt-2 text-sm font-bold text-white drop-shadow-md">{story.names}</p>
      {!compact && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/85">
          &ldquo;{story.quote}&rdquo;
        </p>
      )}
      <p className="mt-1.5 text-[10px] font-medium text-white/70">
        {story.location} · {story.timeline}
      </p>
    </div>
  );
}

export function SuccessStoryShowcase({
  stories,
  theme = "dark",
  compact = false,
  className,
  sectionLabel = "Success stories",
}: {
  stories: SuccessStory[];
  theme?: "dark" | "light";
  compact?: boolean;
  className?: string;
  sectionLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (stories.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % stories.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [stories.length]);

  if (!stories.length) return null;

  const active = stories[activeIndex] ?? stories[0];
  const sideStories = stories.filter((_, i) => i !== activeIndex).slice(0, 2);

  const frameClass =
    theme === "dark"
      ? "border-white/10 shadow-lg"
      : "border-border/60 shadow-[var(--shadow-soft)]";

  if (compact) {
    return (
      <div className={cn("relative h-[148px] w-full overflow-hidden rounded-2xl border", frameClass, className)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.src}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <StoryImage story={active} className="h-full w-full" sizes="360px" />
            <StoryOverlay story={active} theme={theme} compact />
          </motion.div>
        </AnimatePresence>
        <div className="absolute right-3 top-3 z-10 flex gap-1">
          {stories.map((story, i) => (
            <button
              key={story.src}
              type="button"
              aria-label={`Show ${story.names} story`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p
          className={cn(
            "text-xs font-bold uppercase tracking-[0.18em]",
            theme === "dark" ? "text-primary/90" : "text-primary"
          )}
        >
          {sectionLabel}
        </p>
        <p
          className={cn(
            "text-[11px] font-medium",
            theme === "dark" ? "text-white/55" : "text-muted-foreground"
          )}
        >
          Marriage · Relationship
        </p>
      </div>

      <div className="grid h-[240px] grid-cols-12 grid-rows-2 gap-2.5 lg:h-[220px]">
        <Link
          href={`/success-stories/${active.slug}`}
          className={cn("relative col-span-7 row-span-2 overflow-hidden rounded-2xl border block", frameClass)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.src}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65 }}
              className="absolute inset-0"
            >
              <StoryImage story={active} className="h-full w-full" priority sizes="300px" />
              <StoryOverlay story={active} theme={theme} />
            </motion.div>
          </AnimatePresence>
          <div className="absolute right-3 top-3 z-10 flex gap-1">
            {stories.map((story, i) => (
              <button
                key={story.src}
                type="button"
                aria-label={`Show ${story.names} story`}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </Link>

        {sideStories.map((story) => (
          <Link
            key={story.src}
            href={`/success-stories/${story.slug}`}
            aria-label={`Show ${story.names} story`}
            className={cn(
              "relative col-span-5 row-span-1 overflow-hidden rounded-xl border transition-transform hover:scale-[1.02] active:scale-[0.98]",
              frameClass
            )}
          >
            <StoryImage story={story} className="h-full w-full" sizes="160px" />
            <div className="absolute inset-x-0 bottom-0 z-10 p-2">
              <StoryBadge story={story} theme={theme} />
              <p className="mt-1 text-left text-[10px] font-semibold leading-tight text-white drop-shadow-sm">
                {story.names}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stories.map((story, i) => (
          <button
            key={`thumb-${story.src}`}
            type="button"
            aria-label={`Show ${story.names} story`}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
              i === activeIndex
                ? "border-primary shadow-[0_0_12px_rgba(198,40,40,0.35)]"
                : theme === "dark"
                  ? "border-white/15 opacity-75 hover:opacity-100"
                  : "border-border opacity-80 hover:opacity-100"
            )}
          >
            <StoryImage story={story} className="h-full w-full" sizes="96px" />
            <span className="absolute bottom-1 left-1 right-1 truncate text-[8px] font-semibold text-white">
              {story.typeLabel}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
