// Service worker served at /sw.js
import { CACHE_NAME, OFFLINE_URL, PRECACHE_URLS } from "../sw-config";

const sw = `
const CACHE_NAME = "${CACHE_NAME}";
const OFFLINE_URL = "${OFFLINE_URL}";
const PRECACHE_URLS = ${JSON.stringify(PRECACHE_URLS)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((c) => c || caches.match(OFFLINE_URL)))
  );
});
`;

import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(sw, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache",
    },
  });
}
