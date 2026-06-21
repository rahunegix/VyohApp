import { createAdminClient } from "@/lib/supabase/admin";
import { sendOTP, type OtpSmsClient } from "@/lib/sms/24x7sms";
import {
  createAccessToken,
  generateOtp,
  generateRefreshToken,
  hashValue,
  normalizePhoneStorage,
  OTP_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
  verifyHash,
  MAX_OTP_ATTEMPTS,
} from "@/lib/auth/session";

export async function sendLoginOtp(phone: string, client: OtpSmsClient = "web") {
  const normalizedPhone = normalizePhoneStorage(phone);
  const admin = createAdminClient();
  const otp = generateOtp();
  const otpHash = await hashValue(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("phone", normalizedPhone)
    .maybeSingle();

  if (existing) {
    await admin
      .from("users")
      .update({
        otp_hash: otpHash,
        otp_expires_at: expiresAt,
        otp_attempts: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await admin.from("users").insert({
      phone: normalizedPhone,
      otp_hash: otpHash,
      otp_expires_at: expiresAt,
      otp_attempts: 0,
    });
  }

  const sms = await sendOTP(normalizedPhone, otp, client);
  if (!sms.success) {
    throw new Error(sms.error || "Failed to send OTP SMS");
  }

  return {
    phone: normalizedPhone,
    message: "OTP sent",
  };
}

export async function verifyLoginOtp(phone: string, code: string) {
  const normalizedPhone = normalizePhoneStorage(phone);
  const admin = createAdminClient();

  const { data: user, error } = await admin
    .from("users")
    .select("*")
    .eq("phone", normalizedPhone)
    .maybeSingle();

  if (error || !user) {
    throw new Error("User not found. Request OTP first.");
  }

  if (!user.otp_hash || !user.otp_expires_at) {
    throw new Error("No OTP pending. Request a new code.");
  }

  if (new Date(user.otp_expires_at) < new Date()) {
    throw new Error("OTP expired. Request a new code.");
  }

  if ((user.otp_attempts ?? 0) >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many attempts. Request a new OTP.");
  }

  const valid = await verifyHash(code, user.otp_hash);
  if (!valid) {
    await admin
      .from("users")
      .update({ otp_attempts: (user.otp_attempts ?? 0) + 1 })
      .eq("id", user.id);
    throw new Error("Invalid OTP code.");
  }

  const refreshToken = generateRefreshToken();
  const refreshHash = await hashValue(refreshToken);
  const { token: accessToken, jti, expiresAt } = await createAccessToken({
    sub: user.id,
    phone: normalizedPhone,
    role: user.role ?? "user",
  });

  await admin
    .from("users")
    .update({
      otp_hash: null,
      otp_expires_at: null,
      otp_attempts: 0,
      access_token: jti,
      refresh_token_hash: refreshHash,
      token_expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  let profile = null;
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile) {
    profile = existingProfile;
  } else {
    const { data: createdProfile } = await admin
      .from("profiles")
      .insert({ user_id: user.id, full_name: "", profile_status: "draft" })
      .select("*")
      .single();
    profile = createdProfile;
  }

  return {
    accessToken,
    refreshToken,
    accessExpiresAt: expiresAt.toISOString(),
    user: { ...user, otp_hash: undefined },
    profile,
  };
}

export async function refreshSession(refreshToken: string) {
  const admin = createAdminClient();
  const { data: users } = await admin
    .from("users")
    .select("*")
    .not("refresh_token_hash", "is", null)
    .eq("is_active", true);

  let matchedUser: (typeof users extends (infer U)[] | null ? U : never) | null = null;

  for (const u of users ?? []) {
    if (u.refresh_token_hash && (await verifyHash(refreshToken, u.refresh_token_hash))) {
      matchedUser = u;
      break;
    }
  }

  if (!matchedUser) {
    throw new Error("Invalid refresh token");
  }

  const newRefresh = generateRefreshToken();
  const newRefreshHash = await hashValue(newRefresh);
  const { token: accessToken, jti, expiresAt } = await createAccessToken({
    sub: matchedUser.id,
    phone: matchedUser.phone ?? "",
    role: matchedUser.role ?? "user",
  });

  await admin
    .from("users")
    .update({
      access_token: jti,
      refresh_token_hash: newRefreshHash,
      token_expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
    })
    .eq("id", matchedUser.id);

  return {
    accessToken,
    refreshToken: newRefresh,
    accessExpiresAt: expiresAt.toISOString(),
  };
}

export async function loginAdminWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const admin = createAdminClient();

  const { data: user, error } = await admin
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .eq("role", "admin")
    .eq("is_active", true)
    .maybeSingle();

  if (error || !user?.password_hash) {
    throw new Error("Invalid email or password.");
  }

  const valid = await verifyHash(password, user.password_hash);
  if (!valid) {
    throw new Error("Invalid email or password.");
  }

  const refreshToken = generateRefreshToken();
  const refreshHash = await hashValue(refreshToken);
  const { token: accessToken, jti, expiresAt } = await createAccessToken({
    sub: user.id,
    phone: user.phone ?? "",
    role: "admin",
  });

  await admin
    .from("users")
    .update({
      access_token: jti,
      refresh_token_hash: refreshHash,
      token_expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return {
    accessToken,
    refreshToken,
    accessExpiresAt: expiresAt.toISOString(),
    user: { ...user, password_hash: undefined, otp_hash: undefined },
  };
}

export async function logoutUser(userId: string) {
  const admin = createAdminClient();
  await admin
    .from("users")
    .update({
      access_token: null,
      refresh_token_hash: null,
      token_expires_at: null,
    })
    .eq("id", userId);
}
