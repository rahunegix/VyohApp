import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { SuccessStoryCard } from "@/components/success-stories/success-story-card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { getPublishedSuccessStories } from "@/lib/success-stories/service";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { PenLine } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    id: "success-stories-list",
    route_path: "/success-stories",
    page_kind: "static",
    slug: null,
    title: "Success Stories — Uttarakhand Matrimony & Relationships | Saathini",
    meta_description:
      "Read real Saathini success stories from Uttarakhand couples — Garhwali & Kumaoni marriage and relationship journeys.",
    meta_keywords: "saathini success stories, uttarakhand matrimony stories, garhwali marriage stories",
    og_title: null,
    og_description: null,
    og_image_url: null,
    canonical_path: "/success-stories",
    robots_index: true,
    robots_follow: true,
    h1: null,
    hero_subtitle: null,
    intro_html: null,
    sections: [],
    faq: [],
    focus_keywords: [],
    related_links: [],
    is_published: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export default async function SuccessStoriesPage() {
  const stories = await getPublishedSuccessStories();

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack title="Success stories" />

      <div className="px-5 py-4 lg:mx-auto lg:max-w-5xl">
        <div className="mb-6 rounded-2xl border border-primary/15 bg-primary/5 p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Real connections from Uttarakhand — relationships built with trust, family values, and consent-first matching on Saathini.
          </p>
          <Link href="/share-your-story" className="mt-4 inline-block">
            <Button className="gap-2">
              <PenLine className="h-4 w-4" />
              Share your story
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <SuccessStoryCard key={story.slug} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}
