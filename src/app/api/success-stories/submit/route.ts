import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/api-auth";
import { storySubmissionSchema } from "@/lib/success-stories/schemas";

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user) {
    return NextResponse.json({ success: false, error: "Please log in to share your story" }, { status: 401 });
  }

  try {
    const body = storySubmissionSchema.parse(await request.json());
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("story_submissions")
      .insert({
        user_id: auth.user.id,
        story_type: body.story_type,
        submitter_name: body.submitter_name,
        partner_name: body.partner_name || null,
        email: body.email?.trim() || auth.user.email || null,
        phone: body.phone?.trim() || auth.user.phone || null,
        location: body.location || null,
        timeline: body.timeline || null,
        title: body.title || null,
        story: body.story,
        consent: body.consent,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid submission";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
