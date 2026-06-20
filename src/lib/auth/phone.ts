import { DEV_OTP_CODE, isDevOtpBypass } from "@/lib/auth/dev";
import { formatPhoneE164, normalizePhoneStorage } from "@/lib/auth/session";

export { formatPhoneE164 };

export async function sendPhoneOtp(phone: string) {
  const formatted = formatPhoneE164(phone);

  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: formatted }),
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to send OTP");
  }

  return {
    phone: json.data.phone as string,
    devMode: json.data.devMode as boolean,
  };
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const formatted = normalizePhoneStorage(phone);

  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: formatted, code: token }),
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Invalid OTP");
  }

  return json.data;
}

export async function getSession() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function signOut() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

export { isDevOtpBypass, DEV_OTP_CODE };
