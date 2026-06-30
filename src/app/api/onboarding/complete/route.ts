import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  completeProfileFromMobilePayload,
  type MobileOnboardingPayload,
} from "@/lib/onboarding/complete-profile-mobile";

const schema = z.object({
  platform: z.enum(["dating", "matrimony", "vip"]).nullable().optional(),
  intent: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  basicInfo: z
    .object({
      fullName: z.string().optional(),
      dob: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      village: z.string().optional(),
      region: z.string().optional(),
      bio: z.string().optional(),
      education: z.string().optional(),
      profession: z.string().optional(),
    })
    .optional(),
  lifestyle: z.record(z.string(), z.string()).optional(),
  family: z.record(z.string(), z.string()).optional(),
  aiAnswers: z.record(z.string(), z.string()).optional(),
  photos: z.array(z.string()).optional(),
  vipInviteCode: z.string().nullable().optional(),
  vipDetails: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth?.profile?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = schema.parse(await request.json()) as MobileOnboardingPayload;
    const admin = createAdminClient();
    await completeProfileFromMobilePayload(admin, auth.profile.id, body);

    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", auth.profile.id)
      .single();

    return NextResponse.json({ success: true, data: { profile } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete onboarding";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
