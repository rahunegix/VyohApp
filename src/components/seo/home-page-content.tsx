import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CirclePlay,
  Compass,
  Heart,
  MessageCircleHeart,
  MapPin,
  ShieldCheck,
  Shield,
  Sparkles,
  Stars,
  Users,
} from "lucide-react";
import type { SeoPageView } from "@/lib/seo/types";
import type { SuccessStoryView } from "@/lib/success-stories/types";
import { FaqSection } from "@/components/seo/faq-section";
import { SuccessStoryShowcase } from "@/components/auth/success-story-showcase";
import { AppLogo } from "@/components/common/app-logo";
import { HelpChatTrigger } from "@/components/common/help-chat-widget";
import { Button } from "@/components/ui/button";
import { APP_TAGLINE } from "@/lib/constants";

const ONBOARDING_START = "/onboarding/language";
const HERO_IMAGE_URL =
  "https://okcyohdpvoobhjiuspkr.supabase.co/storage/v1/object/public/profile-photos-public/admin/success-stories/1781970690439-36ed89e4.jpg";

const TRUST_ITEMS = [
  { icon: Shield, label: "Phone & face verified" },
  { icon: MapPin, label: "All 13 Uttarakhand districts" },
  { icon: Sparkles, label: "2-minute profile setup" },
];

const SECTION_ICONS = [Heart, Users, Shield, Sparkles];
const STATS = [
  { value: "13", label: "Districts covered" },
  { value: "2 min", label: "Average signup time" },
  { value: "100%", label: "Consent-first matching" },
];
const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#stories", label: "Stories" },
  { href: "#faq", label: "FAQ" },
];
const QUICK_FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified first",
    body: "Phone and identity checks keep matching safer and more genuine.",
  },
  {
    icon: MessageCircleHeart,
    title: "Intent-first chat",
    body: "Start with respectful, consent-first conversations before family introductions.",
  },
  {
    icon: Compass,
    title: "Local community focus",
    body: "Built around Garhwali and Kumaoni culture, districts, and family preferences.",
  },
];
const HOW_IT_WORKS = [
  { step: "01", title: "Create profile", body: "Join free using OTP and complete your basics in under 2 minutes." },
  { step: "02", title: "Get quality matches", body: "Discover compatible singles by intent, region, and trust indicators." },
  { step: "03", title: "Connect with confidence", body: "Chat respectfully, involve family when ready, and move forward." },
];

function PrimaryCta({ className, nav = false }: { className?: string; nav?: boolean }) {
  return (
    <Link href={ONBOARDING_START} className={className}>
      <Button
        size="lg"
        className={
          nav
            ? "h-10 rounded-[6px] bg-[linear-gradient(120deg,#c62828,#a71f1f)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-float)] hover:brightness-105"
            : "h-12 rounded-[6px] bg-[linear-gradient(120deg,#c62828,#a71f1f)] px-7 text-base font-semibold text-white shadow-[var(--shadow-float)] hover:brightness-105"
        }
      >
        {nav ? "Start free" : "Create your profile"}
        {nav && <Sparkles className="h-4 w-4" />}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );
}

function SiteNav() {
  return (
    <>
      <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-background to-primary/5 px-5 py-2 text-center text-xs text-muted-foreground">
        Free to join today - verified matching built for Garhwali and Kumaoni families.
      </div>
      <header className="sticky top-0 z-40 border-b border-border/40 bg-white/70 backdrop-blur-xl safe-top">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" aria-label="Saathini home">
            <AppLogo className="h-9" priority />
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/success-stories"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Success Stories
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <HelpChatTrigger />
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="h-10 rounded-[6px] px-4 font-semibold">
                Log in
              </Button>
            </Link>
            <PrimaryCta nav className="hidden sm:block" />
            <Link href={ONBOARDING_START} className="sm:hidden">
              <Button size="sm" className="h-9 rounded-[6px] px-4 font-semibold">
                Join free
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export function HomePageContent({
  page,
  latestStories = [],
}: {
  page: SeoPageView;
  latestStories?: SuccessStoryView[];
}) {
  const heroImageSrc = HERO_IMAGE_URL;
  const heroImageAlt = "Indian couple celebrating together";

  return (
    <div className="marketing-page relative isolate overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_10%_0%,rgba(198,40,40,0.18),transparent_45%),radial-gradient(circle_at_85%_5%,rgba(198,40,40,0.1),transparent_30%)]" />
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl animate-pulse-soft" />
        <div className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-rose-300/25 blur-3xl animate-pulse-soft" />
        <svg
          aria-hidden
          className="pointer-events-none absolute right-[6%] top-10 hidden h-40 w-40 text-primary/20 lg:block"
          viewBox="0 0 160 160"
          fill="none"
        >
          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="80" cy="80" r="46" stroke="currentColor" strokeWidth="1.5" />
          <path d="M80 20V140M20 80H140" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-[var(--shadow-soft)]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Premium Uttarakhand matrimony platform
            </p>
            <h1 className="text-3xl font-black leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-6xl">
              {page.h1 || page.title}
            </h1>
            {page.hero_subtitle && (
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                {page.hero_subtitle}
              </p>
            )}
            {page.intro_html && (
              <div
                className="prose prose-sm max-w-xl text-muted-foreground prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.intro_html }}
              />
            )}

            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <PrimaryCta />
              <Link href="/success-stories">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full rounded-[6px] border-border/70 bg-white/70 backdrop-blur sm:w-auto"
                >
                  <CirclePlay className="h-4 w-4" />
                  View success stories
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Free to join · Phone OTP verification · {APP_TAGLINE}
            </p>
            <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/60 bg-white/85 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur"
                >
                  <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-[var(--shadow-elevated)] sm:aspect-[5/6]">
              {heroImageSrc ? (
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/10 via-white to-primary/5 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">Real matches. Real stories.</p>
                  <p className="text-sm text-muted-foreground">
                    Garhwali & Kumaoni singles finding marriage and serious relationships on Saathini.
                  </p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-6 pt-16">
                <p className="text-sm font-medium text-white/90">Trusted by Uttarakhand families</p>
                <p className="mt-1 text-xs text-white/70">
                  Verified profiles · Consent-first matching · Local community focus
                </p>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-5 hidden max-w-[220px] rounded-2xl border border-border/60 bg-white/90 p-4 shadow-[var(--shadow-card)] backdrop-blur lg:block">
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <BadgeCheck className="h-3.5 w-3.5" />
                Safety first
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">We review trust indicators before profiles go live.</p>
            </div>
            <div className="absolute -top-6 -right-4 hidden rounded-2xl border border-primary/20 bg-white/90 px-4 py-3 shadow-[var(--shadow-card)] backdrop-blur lg:block">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Stars className="h-3.5 w-3.5" />
                Modern + traditional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick value cards */}
      <section className="border-b border-border/40 py-8 lg:py-10">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 sm:grid-cols-3 lg:px-8">
          {QUICK_FEATURES.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-border/60 bg-white/80 p-5 shadow-[var(--shadow-soft)] backdrop-blur transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Feature sections from SEO content */}
      {page.sections.length > 0 && (
        <section id="features" className="border-b border-border/40 bg-muted/30 py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Why Saathini</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                Built for Pahadi culture, not generic portals
              </h2>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {page.sections.map((section, index) => {
                const Icon = SECTION_ICONS[index % SECTION_ICONS.length];
                return (
                  <article
                    key={section.title}
                    className="rounded-2xl border border-border/60 bg-white p-6 shadow-[var(--shadow-soft)]"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                    {section.bullets?.length ? (
                      <ul className="mt-4 space-y-2.5">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2.5 text-sm text-foreground">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how-it-works" className="border-b border-border/40 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Simple process</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
              Find your match in 3 clear steps
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <article key={item.step} className="rounded-2xl border border-border/60 bg-white p-6 shadow-[var(--shadow-soft)]">
                <p className="text-xs font-bold tracking-[0.2em] text-primary">{item.step}</p>
                <h3 className="mt-2 text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Success stories */}
      {latestStories.length > 0 && (
        <section id="stories" className="py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Success stories</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                  Real couples on Saathini
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Marriage and relationship journeys from Garhwali and Kumaoni communities across Uttarakhand.
                </p>
              </div>
              <Link
                href="/success-stories"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                View all stories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[var(--shadow-card)] lg:p-6">
              <SuccessStoryShowcase
                stories={latestStories}
                theme="light"
                compact
                sectionLabel="Latest success stories"
              />
            </div>
          </div>
        </section>
      )}

      {/* Keywords — subtle SEO chips */}
      {page.focus_keywords.length > 0 && (
        <section className="border-y border-border/40 bg-muted/20 py-8">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2 px-5 lg:px-8">
            {page.focus_keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {page.faq.length > 0 && (
        <section id="faq" className="py-14 lg:py-20">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <FaqSection items={page.faq} />
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="border-t border-primary/20 bg-[linear-gradient(120deg,#9f1f1f,#c62828,#8f1a1a)]">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center lg:px-8 lg:py-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
            Ready to find your match?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85 lg:text-base">
            Join Garhwali & Kumaoni singles on Saathini. Set up your profile in under two minutes with phone OTP.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={ONBOARDING_START}>
              <Button
                size="lg"
                variant="secondary"
                className="h-12 rounded-[6px] bg-white px-8 text-base font-semibold text-primary hover:bg-white/95"
              >
                Get started — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="ghost"
                className="h-12 rounded-[6px] text-white hover:bg-white/10 hover:text-white"
              >
                Already a member? Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Related SEO links */}
      {page.related_links.length > 0 && (
        <section className="border-t border-border/40 bg-muted/20 py-10">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explore</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {page.related_links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border border-border bg-white px-4 py-2.5 text-[9px] font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
