import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";
import { slugifyStory } from "@/lib/success-stories/types";
import { successStoryPayloadSchema } from "@/lib/success-stories/schemas";

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("success_stories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  try {
    const body = successStoryPayloadSchema.parse(await request.json());
    const slug = body.slug?.trim() || slugifyStory(`${body.names}-${body.story_type}`);

    const admin = createAdminClient();
    const insert = {
      slug,
      story_type: body.story_type,
      names: body.names,
      location: body.location ?? null,
      timeline: body.timeline ?? null,
      quote: body.quote,
      body: body.body ?? null,
      cover_image_url: body.cover_image_url,
      alt_text: body.alt_text ?? null,
      is_featured: body.is_featured ?? false,
      status: body.status ?? "draft",
      sort_order: body.sort_order ?? 0,
      published_at: body.status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin.from("success_stories").insert(insert).select("*").single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
