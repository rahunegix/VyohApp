"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Shield, Sparkles, Users } from "lucide-react";
import { APP_TAGLINE } from "@/lib/constants";
import { AppLogo } from "@/components/common/app-logo";
import {
  AUTH_VISUAL_IMAGES,
  getAuthVisualImages,
  type AuthVisualImage,
} from "@/lib/constants/auth-visual-images";
import { WELCOME_SUCCESS_STORIES } from "@/lib/constants/success-stories";
import { SuccessStoryShowcase } from "@/components/auth/success-story-showcase";
import { cn } from "@/lib/helpers/utils";
import type { SuccessStoryView } from "@/lib/success-stories/types";

export type AuthVisualVariant = "welcome" | "login" | "onboarding";

const VARIANT_COPY: Record<
  AuthVisualVariant,
  { eyebrow: string; title: string; subtitle: string }
> = {
  welcome: {
    eyebrow: "Success stories",
    title: "Real couples, real journeys",
    subtitle: "Marriage, long-term love, and dating — all found here with trust and family in mind.",
  },
  login: {
    eyebrow: "Secure sign-in",
    title: "Your journey begins with trust",
    subtitle: "Phone-verified profiles, consent-first chats, and meaningful matches rooted in culture.",
  },
  onboarding: {
    eyebrow: "Building your profile",
    title: "Tell your story authentically",
    subtitle: "Every detail helps us connect you with people who share your values and intent.",
  },
};

function MountainSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 120" className={cn("w-full opacity-30", className)} aria-hidden preserveAspectRatio="none">
      <path
        d="M0 120 L80 40 L160 90 L240 20 L320 70 L400 45 L400 120 Z"
        fill="currentColor"
        className="text-white"
      />
    </svg>
  );
}

const FLOATING_ITEMS = [
  { icon: Heart, label: "Dating", color: "bg-rose-500/20 text-rose-200" },
  { icon: Users, label: "Marriage", color: "bg-amber-500/20 text-amber-200" },
  { icon: Shield, label: "Verified", color: "bg-emerald-500/20 text-emerald-200" },
  { icon: Sparkles, label: "AI Match", color: "bg-violet-500/20 text-violet-200" },
];

function VisualImage({
  image,
  className,
  priority = false,
  sizes,
}: {
  image: AuthVisualImage;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
    </div>
  );
}

function PhotoCollage({
  images,
  compact = false,
}: {
  images: AuthVisualImage[];
  compact?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hero = images[activeIndex] ?? images[0];
  const sideImages = images.filter((_, i) => i !== activeIndex).slice(0, 2);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  if (compact) {
    return (
      <div className="relative h-[108px] w-full overflow-hidden rounded-2xl border border-white/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={hero.src}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <VisualImage image={hero} className="h-full w-full" sizes="320px" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
          <p className="text-[10px] font-semibold text-white/90 drop-shadow-sm">{hero.label}</p>
          <div className="flex gap-1">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Show ${img.label}`}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="grid h-[260px] grid-cols-12 grid-rows-2 gap-2.5">
        <div className="relative col-span-7 row-span-2 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={hero.src}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65 }}
              className="absolute inset-0"
            >
              <VisualImage image={hero} className="h-full w-full" priority sizes="280px" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary/90">Real moments</p>
            <p className="mt-0.5 text-sm font-semibold text-white drop-shadow-md">{hero.label}</p>
          </div>
          <div className="absolute right-3 top-3 z-10 flex gap-1">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Show ${img.label}`}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </div>

        {sideImages.map((image) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show ${image.label}`}
            onClick={() => setActiveIndex(images.indexOf(image))}
            className="relative col-span-5 row-span-1 overflow-hidden rounded-xl border border-white/10 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <VisualImage image={image} className="h-full w-full" sizes="160px" />
            <span className="absolute bottom-2 left-2 right-2 text-left text-[10px] font-semibold leading-tight text-white drop-shadow-sm">
              {image.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((image, i) => (
          <button
            key={`thumb-${image.src}`}
            type="button"
            aria-label={`Show ${image.label}`}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
              i === activeIndex
                ? "border-primary shadow-[0_0_12px_rgba(198,40,40,0.45)]"
                : "border-white/15 opacity-75 hover:opacity-100"
            )}
          >
            <VisualImage image={image} className="h-full w-full" sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function AuthVisualPanel({
  variant = "welcome",
  className,
  featuredStories,
}: {
  variant?: AuthVisualVariant;
  className?: string;
  featuredStories?: SuccessStoryView[];
}) {
  const copy = VARIANT_COPY[variant];
  const images = getAuthVisualImages(variant);
  const welcomeStories =
    featuredStories !== undefined ? featuredStories : WELCOME_SUCCESS_STORIES;
  const storyVariants: AuthVisualVariant[] = ["welcome", "onboarding", "login"];
  const showStoryShowcase =
    welcomeStories.length > 0 && storyVariants.includes(variant);
  const backdrop =
    showStoryShowcase && welcomeStories[0] ? welcomeStories[0] : images[0];

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1a0e08] via-[#241208] to-[#120a06] p-8 text-white lg:p-10",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-25">
          <Image
            src={backdrop.src}
            alt=""
            fill
            className="object-cover blur-2xl scale-110"
            sizes="420px"
            aria-hidden
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0e08]/92 via-[#241208]/88 to-[#120a06]/95" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/25 blur-[80px]" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-amber-500/15 blur-[70px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(252,211,77,0.08),transparent_50%)]" />
      </div>

      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/90">{copy.eyebrow}</p>
        <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight lg:text-[2rem]">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{copy.subtitle}</p>
      </div>

      <div className="relative z-10 my-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {showStoryShowcase ? (
            <SuccessStoryShowcase stories={welcomeStories} theme="dark" />
          ) : variant === "welcome" ? null : (
            <PhotoCollage images={images} />
          )}
        </motion.div>

        <div className="mt-5 grid w-full grid-cols-2 gap-2">
          {FLOATING_ITEMS.map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 backdrop-blur-sm",
                color
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <MountainSilhouette className="mb-4" />
        <div className="flex flex-col gap-2">
          <AppLogo className="h-8" />
          <p className="text-xs text-white/60">{APP_TAGLINE}</p>
        </div>
      </div>
    </div>
  );
}

export function AuthMobileHero({
  variant = "login",
  className,
}: {
  variant?: AuthVisualVariant;
  className?: string;
}) {
  const copy = VARIANT_COPY[variant];
  const images = getAuthVisualImages(variant).slice(0, 4);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#1a0e08] via-[#241208] to-primary/30 px-6 pb-8 pt-14 text-white lg:hidden",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/40 blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-amber-500/25 blur-[50px]" />

      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/90">{copy.eyebrow}</p>
        <h2 className="mt-2 text-xl font-extrabold leading-snug">{copy.title}</h2>
        <p className="mt-2 text-xs leading-relaxed text-white/65">{copy.subtitle}</p>
      </div>

      <div className="relative z-10 mt-4">
        <PhotoCollage images={images} compact />
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        {FLOATING_ITEMS.map(({ icon: Icon, label, color }) => (
          <span
            key={label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm",
              color
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OnboardingDecorStrip({ className }: { className?: string }) {
  const stripImages = AUTH_VISUAL_IMAGES.slice(0, 4);

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-primary/10 bg-gradient-to-r from-primary/5 via-amber-50/80 to-primary/5 px-6 py-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex -space-x-2">
          {stripImages.map((image, i) => (
            <motion.div
              key={image.src}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08, type: "spring" }}
              className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm"
            >
              <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="40px" />
            </motion.div>
          ))}
        </div>
        <p className="text-right text-[11px] font-medium leading-snug text-muted-foreground">
          Hindu · Dating · Marriage
          <br />
          <span className="text-primary">All paths welcome</span>
        </p>
      </div>
    </div>
  );
}
