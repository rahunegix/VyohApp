import { NextResponse } from "next/server";
import { getPublishedSuccessStories, getSuccessStoryBySlug } from "@/lib/success-stories/service";

export async function GET() {
  const stories = await getPublishedSuccessStories();
  return NextResponse.json({ success: true, data: stories });
}
