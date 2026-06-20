import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { SuccessStoryCard } from "@/components/success-stories/success-story-card";
import { Button } from "@/components/ui/button";
import { getPublishedSuccessStories } from "@/lib/success-stories/service";
import { PenLine } from "lucide-react";

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
