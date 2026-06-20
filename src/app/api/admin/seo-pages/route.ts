import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";
import { seoPagePayloadSchema } from "@/lib/seo/schemas";
import { programmaticRoutePath, slugifySeoPath } from "@/lib/seo/types";

function normalizePayload(body: ReturnType<typeof seoPagePayloadSchema.parse>) {
  const pageKind = body.page_kind ?? "static";
  let routePath = body.route_path.trim();
  let slug = body.slug?.trim() || null;

  if (pageKind === "programmatic") {
    slug = slug || slugifySeoPath(body.title);
    routePath = programmaticRoutePath(slug);
  }

  return {
    route_path: routePath,
    page_kind: pageKind,
    slug,
    title: body.title,
    meta_description: body.meta_description,
    meta_keywords: body.meta_keywords ?? null,
    og_title: body.og_title ?? null,
    og_description: body.og_description ?? null,
    og_image_url: body.og_image_url || null,
    canonical_path: body.canonical_path ?? routePath,
    robots_index: body.robots_index ?? true,
    robots_follow: body.robots_follow ?? true,
    h1: body.h1 ?? null,
    hero_subtitle: body.hero_subtitle ?? null,
    intro_html: body.intro_html ?? null,
    sections: body.sections ?? [],
    faq: body.faq ?? [],
    focus_keywords: body.focus_keywords ?? [],
    related_links: body.related_links ?? [],
    is_published: body.is_published ?? true,
    sort_order: body.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("seo_pages")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("route_path", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  try {
    const body = seoPagePayloadSchema.parse(await request.json());
    const insert = normalizePayload(body);

    const admin = createAdminClient();
    const { data, error } = await admin.from("seo_pages").insert(insert).select("*").single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
