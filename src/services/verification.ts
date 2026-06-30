"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { getServerAuth } from "@/lib/auth/server-auth";
import { formatPhoneE164 } from "@/lib/auth/phone";
import { OTP_LENGTH, OTP_TTL_MS } from "@/lib/auth/otp-config";
import { generateOtp } from "@/lib/auth/session";
import { calculateTrustScore } from "@/lib/matching/compatibility";
import {
  analyzeFaceVerification,
  faceCheckPassed,
  markFaceVerified,
  submitFaceForReview,
  uploadSelfieVerification,
} from "@/lib/verification/face-check";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEMO_CURRENT_PROFILE, DEMO_VERIFICATION } from "@/services/demo-data";
import type { Profile, VerificationOverview } from "@/types";
import { z } from "zod";

const idSubmitSchema = z.object({
  document_type: z.enum(["aadhaar", "pan", "driving_license", "voter_id", "passport"]),
  document_front_url: z.string().min(1),
  document_back_url: z.string().optional(),
});

const referenceSubmitSchema = z.object({
  reference_type: z.enum(["friend", "family"]),
  contact_name: z.string().min(2),
  relation: z.string().min(2),
  phone: z.string().min(10),
});

const otpSchema = z.object({
  request_id: z.string().uuid(),
  otp: z.string().length(OTP_LENGTH),
});

const faceSubmitSchema = z.object({
  frames: z.array(z.string().min(20)).min(1).max(4),
});

async function getProfileContext() {
  const auth = await getServerAuth();
  if (!auth?.profile) return null;

  const { admin, profile } = auth;

  const { data: verification } = await admin
    .from("verification_status")
    .select("*")
    .eq("profile_id", profile.id)
    .single();

  return { admin, profile, verification };
}

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

function demoOverview(): VerificationOverview {
  return {
    verification: DEMO_VERIFICATION,
    trustScore: DEMO_CURRENT_PROFILE.trust_score,
    profileCompleteness: 78,
    idRequest: null,
    referenceRequest: null,
    faceRequest: null,
  };
}

export async function buildVerificationOverview(
  admin: SupabaseClient,
  profile: Profile,
  verification: Record<string, unknown> | null,
): Promise<VerificationOverview> {
  if (!verification) return demoOverview();

  const [{ data: idRequest }, { data: referenceRequest }, { data: faceRequest }] = await Promise.all([
    admin
      .from("id_verification_requests")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("reference_verification_requests")
      .select("id, profile_id, reference_type, contact_name, relation, phone, otp_verified_at, status, team_notes, rejection_reason, verified_at, created_at, updated_at")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("face_verification_requests")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const trustScore = calculateTrustScore({
    mobile_verified: Boolean(verification.mobile_verified),
    face_verified: Boolean(verification.face_verified),
    id_verified: Boolean(verification.id_verified),
    family_verified: Boolean(verification.family_verified),
    profile_completeness: 78,
    report_count: 0,
    account_age_days: 30,
  });

  return {
    verification: verification as unknown as VerificationOverview["verification"],
    trustScore,
    profileCompleteness: 78,
    idRequest: idRequest ?? null,
    referenceRequest: referenceRequest ?? null,
    faceRequest: faceRequest ?? null,
  };
}

export async function getVerificationOverview(): Promise<VerificationOverview> {
  const ctx = await getProfileContext();
  if (!ctx) return demoOverview();
  return buildVerificationOverview(ctx.admin, ctx.profile, ctx.verification);
}

export async function submitIdVerification(data: unknown) {
  const parsed = idSubmitSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid ID verification data" };

  const ctx = await getProfileContext();
  if (!ctx) return { error: "Not authenticated" };

  const { admin, profile, verification } = ctx;
  if (verification?.id_verified) return { error: "ID already verified" };

  const { data: existing } = await admin
    .from("id_verification_requests")
    .select("status")
    .eq("profile_id", profile.id)
    .in("status", ["pending_review", "verified"])
    .maybeSingle();

  if (existing) return { error: "ID verification already submitted" };

  const { data: row, error } = await admin
    .from("id_verification_requests")
    .insert({
      profile_id: profile.id,
      document_type: parsed.data.document_type,
      document_front_url: parsed.data.document_front_url,
      document_back_url: parsed.data.document_back_url ?? null,
      status: "pending_review",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/trust-center");
  return { success: true, request: row };
}

export async function submitReferenceVerification(data: unknown) {
  const parsed = referenceSubmitSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid reference details" };

  const ctx = await getProfileContext();
  if (!ctx) return { error: "Not authenticated" };

  const { admin, profile, verification } = ctx;
  if (verification?.family_verified) return { error: "Reference already verified" };

  const phone = formatPhoneE164(parsed.data.phone);
  const otp = generateOtp();

  const { data: existing } = await admin
    .from("reference_verification_requests")
    .select("id, status")
    .eq("profile_id", profile.id)
    .in("status", ["pending_otp", "otp_verified", "pending_team_call", "verified"])
    .maybeSingle();

  if (existing) {
    return { error: "A reference verification is already in progress" };
  }

  const { data: row, error } = await admin
    .from("reference_verification_requests")
    .insert({
      profile_id: profile.id,
      reference_type: parsed.data.reference_type,
      contact_name: parsed.data.contact_name.trim(),
      relation: parsed.data.relation.trim(),
      phone,
      otp_hash: hashOtp(otp),
      otp_expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      status: "pending_otp",
    })
    .select("id, reference_type, contact_name, relation, phone, status")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/trust-center");
  return {
    success: true,
    request: row,
  };
}

export async function verifyReferenceOtp(data: unknown) {
  const parsed = otpSchema.safeParse(data);
  if (!parsed.success) return { error: `Enter a valid ${OTP_LENGTH}-digit OTP` };

  const ctx = await getProfileContext();
  if (!ctx) return { error: "Not authenticated" };

  const { admin, profile } = ctx;

  const { data: request, error: fetchError } = await admin
    .from("reference_verification_requests")
    .select("*")
    .eq("id", parsed.data.request_id)
    .eq("profile_id", profile.id)
    .single();

  if (fetchError || !request) return { error: "Verification request not found" };
  if (request.status !== "pending_otp") return { error: "OTP already verified or request closed" };

  if (request.otp_expires_at && new Date(request.otp_expires_at) < new Date()) {
    return { error: "OTP expired. Please start again." };
  }

  const otpHash = hashOtp(parsed.data.otp);
  if (request.otp_hash !== otpHash) return { error: "Incorrect OTP" };

  const { error } = await admin
    .from("reference_verification_requests")
    .update({
      otp_verified_at: new Date().toISOString(),
      status: "pending_team_call",
      otp_hash: null,
    })
    .eq("id", request.id);

  if (error) return { error: error.message };

  revalidatePath("/trust-center");
  return { success: true };
}

export async function submitFaceVerificationForUser(
  ctx: { admin: SupabaseClient; profile: Profile; userId: string },
  data: unknown
) {
  const parsed = faceSubmitSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid selfie data" };

  const { admin, profile, userId } = ctx;

  const { data: verification } = await admin
    .from("verification_status")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (verification?.face_verified) return { error: "Face already verified" };

  const { data: pendingReview } = await admin
    .from("face_verification_requests")
    .select("status")
    .eq("profile_id", profile.id)
    .eq("status", "pending_review")
    .maybeSingle();

  if (pendingReview) {
    return { error: "Face verification is already under review", code: "FACE_PENDING_REVIEW" };
  }

  const { data: photos } = await admin
    .from("profile_photos")
    .select("url")
    .eq("profile_id", profile.id)
    .order("sort_order", { ascending: true })
    .limit(1);

  const profilePhotoUrl = photos?.[0]?.url;
  if (!profilePhotoUrl) {
    return { error: "Upload at least one profile photo before face verification" };
  }

  const devBypass =
    process.env.NODE_ENV !== "production" && process.env.FACE_VERIFY_DEV_BYPASS === "true";

  let analysis;
  if (devBypass) {
    analysis = {
      match: true,
      liveness: true,
      confidence: 95,
      reason: "Dev bypass enabled",
    };
  } else {
    try {
      analysis = await analyzeFaceVerification(profilePhotoUrl, parsed.data.frames);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Face verification failed";
      return { error: message, code: "FACE_REVIEW_AVAILABLE" };
    }
  }

  if (!faceCheckPassed(analysis)) {
    return {
      error: analysis.reason || "Face did not match your profile photos. Try again in good lighting.",
      code: "FACE_REVIEW_AVAILABLE",
      analysis,
    };
  }

  try {
    const selfieUrl = await uploadSelfieVerification(admin, userId, parsed.data.frames[0]);
    const { verification: updated, trustScore } = await markFaceVerified(
      admin,
      profile.id,
      selfieUrl
    );

    revalidatePath("/trust-center");
    revalidatePath("/onboarding/verification");
    revalidatePath("/discover");

    return {
      success: true,
      verification: updated,
      trustScore,
      analysis,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save verification";
    return { error: message };
  }
}

export async function submitFaceVerification(data: unknown) {
  const ctx = await getProfileContext();
  if (!ctx) return { error: "Not authenticated" };

  return submitFaceVerificationForUser(
    { admin: ctx.admin, profile: ctx.profile, userId: ctx.profile.user_id },
    data
  );
}

export async function submitFaceVerificationReviewForUser(
  ctx: { admin: SupabaseClient; profile: Profile; userId: string },
  data: unknown
) {
  const parsed = faceSubmitSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid selfie data" };

  const { admin, profile, userId } = ctx;

  const { data: verification } = await admin
    .from("verification_status")
    .select("face_verified")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (verification?.face_verified) return { error: "Face already verified" };

  const { data: photos } = await admin
    .from("profile_photos")
    .select("url")
    .eq("profile_id", profile.id)
    .order("sort_order", { ascending: true })
    .limit(1);

  const profilePhotoUrl = photos?.[0]?.url ?? null;
  const aiReason = typeof (data as { ai_reason?: string }).ai_reason === "string"
    ? (data as { ai_reason: string }).ai_reason
    : undefined;
  const aiConfidence = typeof (data as { ai_confidence?: number }).ai_confidence === "number"
    ? (data as { ai_confidence: number }).ai_confidence
    : undefined;

  try {
    const result = await submitFaceForReview(
      admin,
      profile.id,
      userId,
      parsed.data.frames[0],
      profilePhotoUrl,
      aiReason,
      aiConfidence
    );

    if (result.error) return result;

    revalidatePath("/trust-center");
    revalidatePath("/onboarding/verification");

    return { success: true, pendingReview: true, request: result.request };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not submit for review";
    return { error: message };
  }
}

export async function resendReferenceOtp(requestId: string) {
  const ctx = await getProfileContext();
  if (!ctx) return { error: "Not authenticated" };

  const { admin, profile } = ctx;
  const otp = generateOtp();

  const { data: request, error: fetchError } = await admin
    .from("reference_verification_requests")
    .select("id, status")
    .eq("id", requestId)
    .eq("profile_id", profile.id)
    .single();

  if (fetchError || !request) return { error: "Request not found" };
  if (request.status !== "pending_otp") return { error: "Cannot resend OTP for this request" };

  const { error } = await admin
    .from("reference_verification_requests")
    .update({
      otp_hash: hashOtp(otp),
      otp_expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    })
    .eq("id", requestId);

  if (error) return { error: error.message };

  return { success: true };
}
