import { fetchAuthMe } from "@/lib/auth/client-session";

type FaceApiResult = {
  success?: boolean;
  error?: string;
  code?: string;
  trustScore?: number;
  pendingReview?: boolean;
  analysis?: { reason?: string; confidence?: number };
};

async function postVerification(body: Record<string, unknown>): Promise<FaceApiResult> {
  await fetchAuthMe();

  const res = await fetch("/api/verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as FaceApiResult;
  if (res.status === 401) {
    return { error: "Session expired. Please log in again to verify your face." };
  }
  return json;
}

export async function submitFaceVerificationClient(frames: string[]) {
  return postVerification({ type: "submit_face", frames });
}

export async function submitFaceReviewClient(
  frames: string[],
  aiReason?: string,
  aiConfidence?: number
) {
  return postVerification({
    type: "submit_face_review",
    frames,
    ai_reason: aiReason,
    ai_confidence: aiConfidence,
  });
}
