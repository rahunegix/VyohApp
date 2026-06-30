import { NextRequest } from "next/server";
import { verifyAccessToken, type TokenPayload } from "@/lib/auth/jwt";

export const ACCESS_COOKIE = "saathini_access";
export const REFRESH_COOKIE = "saathini_refresh";

/** Edge-safe auth check for middleware — JWT verify only, no DB refresh. */
export async function getMiddlewareAuthPayload(
  request: NextRequest
): Promise<TokenPayload | null> {
  const bearer = request.headers.get("authorization");
  const token =
    (bearer?.startsWith("Bearer ") ? bearer.slice(7) : null) ??
    request.cookies.get(ACCESS_COOKIE)?.value ??
    null;
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.jti ? payload : null;
}
