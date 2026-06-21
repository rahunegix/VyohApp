import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendLoginOtp } from "@/lib/auth/custom-auth";

const schema = z.object({
  phone: z.string().min(10),
  client: z.enum(["web", "android"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const client = body.client ?? "web";
    const result = await sendLoginOtp(body.phone, client);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
