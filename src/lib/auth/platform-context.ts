import type { NextRequest } from "next/server";
import {
  PLATFORM_COOKIE,
  PLATFORM_HEADER,
  getPlatformFromPathname,
  parsePlatform,
  type Platform,
} from "@/lib/platform";

export function resolvePlatformFromRequest(
  request: NextRequest,
  fallback: Platform = "dating"
): Platform {
  const header = parsePlatform(request.headers.get(PLATFORM_HEADER));
  if (header) return header;

  const cookie = parsePlatform(request.cookies.get(PLATFORM_COOKIE)?.value);
  if (cookie) return cookie;

  const fromPath = getPlatformFromPathname(request.nextUrl.pathname);
  if (fromPath) return fromPath;

  const query = parsePlatform(request.nextUrl.searchParams.get("platform"));
  if (query) return query;

  return fallback;
}
