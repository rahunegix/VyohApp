import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "crypto";
export {
  createAccessToken,
  verifyAccessToken,
  formatPhoneE164,
  normalizePhoneStorage,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL_MS,
  OTP_TTL_MS,
  MAX_OTP_ATTEMPTS,
  type TokenPayload,
} from "@/lib/auth/jwt";

export function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

export async function hashValue(value: string): Promise<string> {
  return bcrypt.hash(value, 10);
}

export async function verifyHash(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}
