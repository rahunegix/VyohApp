import { NextRequest, NextResponse } from "next/server";
import { getSuccessStoryBySlug } from "@/lib/success-stories/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const story = await getSuccessStoryBySlug(slug);

  if (!story) {
    return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: story });
}
