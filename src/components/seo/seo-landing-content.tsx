import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SeoPageView } from "@/lib/seo/types";
import type { SuccessStoryView } from "@/lib/success-stories/types";
import { FaqSection } from "@/components/seo/faq-section";
import { SuccessStoryShowcase } from "@/components/auth/success-story-showcase";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/common/app-logo";

const ONBOARDING_START = "/";

function HeroCtaBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "flex justify-center" : "pt-2"}>
      <Link href={ONBOARDING_START}>
        <Button size="lg" className="h-12 rounded-xl px-7 text-base font-semibold">
          Create your profile
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      {!compact && (
        <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-start">
          <Link href="/success-stories">
            <Button variant="outline" size="lg" className="h-11 w-full rounded-xl sm:w-auto">
              Success Stories
            </Button>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-primary">
            Already a member? Log in
          </Link>
        </div>
      )}
    </div>
  );
}

export function SeoLandingContent({
  page,
  showHeroCta = true,
  latestStories = [],
}: {
  page: SeoPageView;
  showHeroCta?: boolean;
  latestStories?: SuccessStoryView[];
}) {
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-5 py-10 lg:px-8">
      <header className="space-y-4 text-center lg:text-left">
        {page.route_path === "/" && (
          <div className="flex justify-center lg:justify-start">
            <AppLogo className="h-10" />
          </div>
        )}
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Saathini Matrimony</p>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground lg:text-4xl">
          {page.h1 || page.title}
        </h1>
        {page.hero_subtitle && (
          <p className="text-base text-muted-foreground lg:text-lg">{page.hero_subtitle}</p>
        )}
        {page.intro_html && (
          <div
            className="prose prose-sm max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: page.intro_html }}
          />
        )}
        {showHeroCta && <HeroCtaBlock />}
      </header>

      {latestStories.length > 0 && page.route_path === "/" && (
        <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Latest stories</p>
              <h2 className="mt-1 text-lg font-bold text-foreground">Real couples on Saathini</h2>
            </div>
            <Link href="/success-stories" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <SuccessStoryShowcase
            stories={latestStories}
            theme="light"
            compact
            sectionLabel="Latest success stories"
          />
        </section>
      )}

      {page.focus_keywords.length > 0 && (
        <section className="flex flex-wrap gap-2">
          {page.focus_keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-[6px] border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
            >
              {keyword}
            </span>
          ))}
        </section>
      )}

      {page.sections.map((section) => (
        <section
          key={section.title}
          className="rounded-2xl border border-border/60 bg-white p-6 shadow-[var(--shadow-card)]"
        >
          <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          {section.bullets?.length ? (
            <ul className="mt-4 space-y-2">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-[6px] bg-primary" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <FaqSection items={page.faq} />

      {showHeroCta && page.route_path === "/" && (
        <section className="rounded-2xl border border-border/60 bg-muted/30 p-6 text-center">
          <p className="text-lg font-bold text-foreground">Ready to find your match?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Garhwali & Kumaoni singles on Saathini — free to join, 2-minute setup.
          </p>
          <div className="mt-5">
            <HeroCtaBlock compact />
          </div>
        </section>
      )}

      {page.related_links.length > 0 && (
        <section className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Related pages
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {page.related_links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
