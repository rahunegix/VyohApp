import { OTP_LENGTH } from "@/lib/auth/otp-config";

/** Pull a fixed-length OTP out of pasted SMS text or autofill payload. */
export function extractOtpCode(text: string, length = OTP_LENGTH): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const exact = trimmed.match(new RegExp(`^\\d{${length}}$`));
  if (exact) return exact[0];

  const bounded = trimmed.match(new RegExp(`(?:^|\\D)(\\d{${length}})(?:\\D|$)`));
  if (bounded?.[1]) return bounded[1];

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= length) {
    return digits.slice(0, length);
  }

  return null;
}

export function codeToDigitArray(code: string, length = OTP_LENGTH): string[] {
  const digits = code.replace(/\D/g, "").slice(0, length).split("");
  while (digits.length < length) digits.push("");
  return digits;
}

export function getWebOtpOrigin(): string | null {
  const configured = process.env.SMS_OTP_WEB_ORIGIN?.trim();
  if (configured) return configured.replace(/^@/, "");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) return null;

  try {
    return new URL(appUrl).hostname;
  } catch {
    return null;
  }
}

/** Expected Web OTP host in the browser (client-side). */
export function getClientWebOtpOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname;
}

export function getExpectedClientWebOtpOrigin(): string {
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (publicUrl) {
    try {
      return new URL(publicUrl).hostname;
    } catch {
      /* fall through */
    }
  }
  return "www.saathini.com";
}

export function isWebOtpOriginMatch(): boolean {
  if (typeof window === "undefined") return true;
  return getClientWebOtpOrigin() === getExpectedClientWebOtpOrigin();
}

export function supportsWebOtpApi(): boolean {
  return typeof window !== "undefined" && "OTPCredential" in window;
}

export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
