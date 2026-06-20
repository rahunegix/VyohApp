import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";

const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  looking_for: z.enum(["male", "female", "everyone"]).optional().nullable(),
  intent: z.enum(["exploring", "serious", "marriage"]).optional().nullable(),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  region: z.enum(["garhwal", "kumaon", "both", "diaspora"]).optional().nullable(),
  education: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  profile_status: z.enum(["draft", "active", "hidden", "suspended"]).optional(),
  trust_score: z.number().min(0).max(100).optional(),
  profile_origin: z.enum(["member", "seed"]).optional(),
  is_chat_bot: z.boolean().optional(),
  admin_notes: z.string().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const { id } = await params;

  try {
    const body = updateProfileSchema.parse(await request.json());
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("profiles")
      .update({ ...body, updated_at: new Date().toISOString() })
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

  const { data: profile } = await admin.from("profiles").select("user_id").eq("id", id).maybeSingle();

  const { error } = await admin.from("profiles").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  if (profile?.user_id) {
    await admin.from("users").delete().eq("id", profile.user_id);
  }

  return NextResponse.json({ success: true });
}
