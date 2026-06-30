import type { Metadata } from "next";
import { getSeoPageByPath } from "@/lib/seo/service";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { FALLBACK_HOME_SEO } from "@/lib/seo/defaults";
import { getLatestSuccessStories } from "@/lib/success-stories/service";
import { WelcomePageClient } from "@/app/(auth)/welcome/welcome-page-client";

export const dynamic = "force-dynamic";

const HOME_STORY_LIMIT = 3;

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getSeoPageByPath("/")) ?? FALLBACK_HOME_SEO;
  return buildSeoMetadata(page);
}

export default async function HomePage() {
  const stories = await getLatestSuccessStories(HOME_STORY_LIMIT);
  return <WelcomePageClient stories={stories} storyLimit={HOME_STORY_LIMIT} />;
}
