import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateTrustScore } from "@/lib/matching/compatibility";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/profiles/upload-profile-photo";

const FACE_MATCH_MIN_CONFIDENCE = 72;

type FaceAnalysis = {
  match: boolean;
  liveness: boolean;
  confidence: number;
  reason: string;
};

async function toVisionDataUrl(source: string): Promise<string> {
  if (source.startsWith("data:")) return source;

  const res = await fetch(source, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) {
    throw new Error(`Could not load profile photo (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

export async function analyzeFaceVerification(
  profilePhotoUrl: string,
  selfieDataUrls: string[]
): Promise<FaceAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Face verification is not configured (OPENAI_API_KEY missing)");
  }

  if (!selfieDataUrls.length) {
    throw new Error("At least one selfie frame is required");
  }

  const profileDataUrl = await toVisionDataUrl(profilePhotoUrl);

  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    {
      type: "text",
      text: `You are a strict face-verification system for a matrimony/dating app.
Image 1 is the user's PROFILE photo. Images 2+ are short selfie frames from a live video scan.
Decide if:
1) The selfie shows the SAME person as the profile photo (match).
2) The selfies show a LIVE person (liveness) — reject printed photos, screens, or masks.
3) Give confidence 0-100.

Return ONLY valid JSON: {"match":boolean,"liveness":boolean,"confidence":number,"reason":string}`,
    },
    { type: "image_url", image_url: { url: profileDataUrl } },
    ...selfieDataUrls.slice(0, 4).map((url) => ({
      type: "image_url" as const,
      image_url: { url },
    })),
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini",
      messages: [{ role: "user", content }],
      max_tokens: 300,
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Face analysis failed: ${res.status} ${err}`);
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content?.trim() ?? "{}";
  const parsed = JSON.parse(raw) as Partial<FaceAnalysis>;

  return {
    match: Boolean(parsed.match),
    liveness: Boolean(parsed.liveness),
    confidence: Number(parsed.confidence ?? 0),
    reason: String(parsed.reason ?? "Unable to verify"),
  };
}

function decodeDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function uploadSelfieVerification(
  admin: SupabaseClient,
  userId: string,
  selfieDataUrl: string
): Promise<string> {
  const { buffer, contentType } = decodeDataUrl(selfieDataUrl);
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `${userId}/face-verify/${Date.now()}.${ext}`;

  const { error } = await admin.storage.from(PROFILE_PHOTOS_BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });

  if (error) throw new Error(error.message);

  const { data } = admin.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function faceCheckPassed(analysis: FaceAnalysis): boolean {
  return (
    analysis.match &&
    analysis.liveness &&
    analysis.confidence >= FACE_MATCH_MIN_CONFIDENCE
  );
}

export async function markFaceVerified(
  admin: SupabaseClient,
  profileId: string,
  videoUrl: string,
  _verification: Record<string, unknown> | null
) {
  await admin.from("profile_videos").insert({
    profile_id: profileId,
    url: videoUrl,
    type: "selfie_verification",
    is_verified_intro: true,
  });

  const { data: updated, error } = await admin
    .from("verification_status")
    .update({
      face_verified: true,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", profileId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const trustScore = calculateTrustScore({
    mobile_verified: Boolean(updated?.mobile_verified),
    face_verified: true,
    id_verified: Boolean(updated?.id_verified),
    family_verified: Boolean(updated?.family_verified),
    profile_completeness: 78,
    report_count: 0,
    account_age_days: 30,
  });

  await admin.from("profiles").update({ trust_score: trustScore }).eq("id", profileId);

  return { verification: updated, trustScore };
}

export async function submitFaceForReview(
  admin: SupabaseClient,
  profileId: string,
  userId: string,
  selfieDataUrl: string,
  profilePhotoUrl: string | null,
  aiReason?: string,
  aiConfidence?: number
) {
  const { data: existing } = await admin
    .from("face_verification_requests")
    .select("id, status")
    .eq("profile_id", profileId)
    .in("status", ["pending_review"])
    .maybeSingle();

  if (existing) {
    return { error: "Face verification is already under review" };
  }

  const selfieUrl = await uploadSelfieVerification(admin, userId, selfieDataUrl);

  const { data: row, error } = await admin
    .from("face_verification_requests")
    .insert({
      profile_id: profileId,
      selfie_url: selfieUrl,
      profile_photo_url: profilePhotoUrl,
      ai_reason: aiReason ?? null,
      ai_confidence: aiConfidence ?? null,
      status: "pending_review",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await admin.from("profile_videos").insert({
    profile_id: profileId,
    url: selfieUrl,
    type: "selfie_verification_pending",
    is_verified_intro: false,
  });

  return { success: true, request: row };
}
