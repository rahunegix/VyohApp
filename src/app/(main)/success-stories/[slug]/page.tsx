import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { getSuccessStoryBySlug } from "@/lib/success-stories/service";
import { SUCCESS_STORY_TYPE_LABELS } from "@/lib/success-stories/types";
import { Heart, PenLine, Users } from "lucide-react";

export default async function SuccessStoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getSuccessStoryBySlug(slug);
  if (!story) notFound();

  const TypeIcon = story.type === "marriage" ? Users : Heart;

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/success-stories" title={story.names} />

      <article className="lg:mx-auto lg:max-w-3xl">
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted">
          <Image src={story.src} alt={story.alt} fill className="object-cover" priority sizes="800px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              <TypeIcon className="h-3.5 w-3.5" />
              {SUCCESS_STORY_TYPE_LABELS[story.type]}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-white">{story.names}</h1>
            <p className="mt-1 text-sm text-white/80">
              {story.location}
              {story.timeline ? ` · ${story.timeline}` : ""}
            </p>
          </div>
        </div>

        <div className="px-5 py-6 space-y-6">
          <blockquote className="rounded-2xl border border-border bg-white p-5 text-lg font-medium leading-relaxed text-foreground shadow-[var(--shadow-soft)]">
            &ldquo;{story.quote}&rdquo;
          </blockquote>

          <div className="prose prose-sm max-w-none text-muted-foreground">
            {story.body.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-4 leading-relaxed last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 text-center">
            <p className="text-sm font-semibold text-foreground">Have your own Saathini story?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share a relationship or marriage story with our community.
            </p>
            <Link href="/share-your-story" className="mt-4 inline-block">
              <Button variant="outline" className="gap-2 bg-white">
                <PenLine className="h-4 w-4" />
                Share your story
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
