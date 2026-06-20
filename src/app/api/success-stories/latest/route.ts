import { NextRequest, NextResponse } from "next/server";
import { getLatestSuccessStories } from "@/lib/success-stories/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam) || 3, 1), 12);
  const stories = await getLatestSuccessStories(limit);

  return NextResponse.json(
    { success: true, data: stories },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
