import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";

const BUCKET = "profile-photos-public";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_FOLDERS = ["success-stories", "seo", "site"] as const;

function sanitizeFolder(raw: string | null): string {
  const folder = (raw || "site").toLowerCase().replace(/[^a-z0-9-]/g, "");
  return ALLOWED_FOLDERS.includes(folder as (typeof ALLOWED_FOLDERS)[number]) ? folder : "site";
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const form = await request.formData();
  const file = form.get("file");
  const folder = sanitizeFolder(form.get("folder") as string | null);

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ success: false, error: "File must be an image" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ success: false, error: "Image must be under 8MB" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `admin/${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
    cacheControl: "3600",
  });

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 400 });
  }

  const { data: publicUrl } = admin.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    success: true,
    data: { url: publicUrl.publicUrl, path },
  });
}
