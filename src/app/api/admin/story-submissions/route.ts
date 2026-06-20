import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";
import { slugifyStory } from "@/lib/success-stories/types";

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("story_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  try {
    const body = await request.json();
    const { id, status, admin_notes, publish_as_story } = body as {
      id: string;
      status?: "pending" | "approved" | "rejected";
      admin_notes?: string;
      publish_as_story?: boolean;
    };

    if (!id) {
      return NextResponse.json({ success: false, error: "Submission id required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: submission, error: fetchError } = await admin
      .from("story_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const { data: updated, error } = await admin
      .from("story_submissions")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    let publishedStory = null;
    if (publish_as_story) {
      const names =
        submission.partner_name?.trim()
          ? `${submission.submitter_name} & ${submission.partner_name}`
          : submission.submitter_name;
      const slugBase = slugifyStory(
        submission.title?.trim() || `${names}-${submission.story_type}`
      );
      const cover =
        submission.photo_urls?.[0] ??
        "https://images.unsplash.com/photo-1522673607200-8d87521a1536?auto=format&fit=crop&w=900&q=80";

      const { data: story, error: storyError } = await admin
        .from("success_stories")
        .insert({
          slug: `${slugBase}-${Date.now().toString(36)}`,
          story_type: submission.story_type,
          names,
          location: submission.location,
          timeline: submission.timeline,
          quote: submission.story.slice(0, 280),
          body: submission.story,
          cover_image_url: cover,
          alt_text: names,
          is_featured: false,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (storyError) {
        return NextResponse.json({ success: false, error: storyError.message }, { status: 400 });
      }

      publishedStory = story;
      await admin
        .from("story_submissions")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", id);
    }

    return NextResponse.json({ success: true, data: updated, publishedStory });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
