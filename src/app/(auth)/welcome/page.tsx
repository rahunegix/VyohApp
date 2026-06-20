import type { Metadata } from "next";
import { getSeoPageByPath } from "@/lib/seo/service";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { FALLBACK_HOME_SEO } from "@/lib/seo/defaults";
import { getLatestSuccessStories } from "@/lib/success-stories/service";
import { WelcomePageClient } from "./welcome-page-client";

export const dynamic = "force-dynamic";

const WELCOME_STORY_LIMIT = 3;

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getSeoPageByPath("/welcome")) ?? {
    ...FALLBACK_HOME_SEO,
    route_path: "/welcome",
  };
  return buildSeoMetadata(page);
}

export default async function WelcomePage() {
  const stories = await getLatestSuccessStories(WELCOME_STORY_LIMIT);
  return <WelcomePageClient stories={stories} storyLimit={WELCOME_STORY_LIMIT} />;
}
