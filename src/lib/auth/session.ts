import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "crypto";
import { OTP_LENGTH } from "@/lib/auth/otp-config";
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
export { OTP_LENGTH, OTP_TTL_MINUTES } from "@/lib/auth/otp-config";

export function generateOtp(): string {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(randomInt(min, max + 1));
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
