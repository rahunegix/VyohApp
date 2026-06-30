import "server-only";
import bcrypt from "bcryptjs";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

/** Edge-safe random helpers (Web Crypto — no Node `crypto` import). */
function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

function secureRandomHex(byteLength: number): string {
  const buf = new Uint8Array(byteLength);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateOtp(): string {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(secureRandomInt(min, max + 1));
}

export function generateRefreshToken(): string {
  return secureRandomHex(48);
}

export async function hashValue(value: string): Promise<string> {
  return bcrypt.hash(value, 10);
}

export async function verifyHash(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}
