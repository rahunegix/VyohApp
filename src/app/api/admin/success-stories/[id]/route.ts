import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";
import { slugifyStory } from "@/lib/success-stories/types";
import { successStoryPayloadSchema } from "@/lib/success-stories/schemas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const { id } = await params;

  try {
    const body = successStoryPayloadSchema.partial().parse(await request.json());
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.story_type !== undefined) updates.story_type = body.story_type;
    if (body.names !== undefined) {
      updates.names = body.names;
      if (!body.slug) updates.slug = slugifyStory(`${body.names}-${body.story_type ?? "story"}`);
    }
    if (body.location !== undefined) updates.location = body.location;
    if (body.timeline !== undefined) updates.timeline = body.timeline;
    if (body.quote !== undefined) updates.quote = body.quote;
    if (body.body !== undefined) updates.body = body.body;
    if (body.cover_image_url !== undefined) updates.cover_image_url = body.cover_image_url;
    if (body.alt_text !== undefined) updates.alt_text = body.alt_text;
    if (body.is_featured !== undefined) updates.is_featured = body.is_featured;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === "published") {
        updates.published_at = new Date().toISOString();
      }
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("success_stories")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("success_stories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
