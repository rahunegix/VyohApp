import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";
import { seoPagePayloadSchema } from "@/lib/seo/schemas";
import { programmaticRoutePath, slugifySeoPath } from "@/lib/seo/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const { id } = await params;

  try {
    const body = seoPagePayloadSchema.partial().parse(await request.json());
    const pageKind = body.page_kind;
    const patch: Record<string, unknown> = {
      ...body,
      og_image_url: body.og_image_url || null,
      updated_at: new Date().toISOString(),
    };

    if (pageKind === "programmatic" || body.slug || body.title) {
      const slug =
        body.slug?.trim() ||
        (body.title ? slugifySeoPath(body.title) : undefined);
      if (slug) {
        patch.slug = slug;
        patch.route_path = programmaticRoutePath(slug);
        if (!body.canonical_path) patch.canonical_path = patch.route_path;
      }
    }

    if (body.route_path && pageKind !== "programmatic") {
      patch.route_path = body.route_path.trim();
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("seo_pages")
      .update(patch)
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
  const { error } = await admin.from("seo_pages").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
