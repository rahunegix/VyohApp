import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "saathini-dev-secret-change-in-production-min-32-chars"
);

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const MAX_OTP_ATTEMPTS = 5;

export interface TokenPayload {
  sub: string;
  phone: string;
  role: "user" | "admin";
  jti: string;
}

export async function createAccessToken(payload: Omit<TokenPayload, "jti"> & { jti?: string }) {
  const jti = payload.jti ?? crypto.randomUUID().replace(/-/g, "");
  const token = await new SignJWT({ phone: payload.phone, role: payload.role, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(JWT_SECRET);

  return { token, jti, expiresAt: new Date(Date.now() + 15 * 60 * 1000) };
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.sub || typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      phone: String(payload.phone ?? ""),
      role: (payload.role as "user" | "admin") ?? "user",
      jti: String(payload.jti ?? ""),
    };
  } catch {
    return null;
  }
}

export function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export function normalizePhoneStorage(phone: string): string {
  return formatPhoneE164(phone);
}
