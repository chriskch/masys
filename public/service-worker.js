const CACHE_NAME = "masys-logbook-cache-v2";
const OFFLINE_URL = "/offline";
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/favicon.ico",
  "/icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch((error) => console.error("[SW] Precaching failed", error)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((cacheKey) => cacheKey !== CACHE_NAME)
            .map((cacheKey) => caches.delete(cacheKey)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestURL = new URL(request.url);

  // Always bypass caching for API calls
  if (requestURL.pathname.startsWith("/api/")) {
    return;
  }

  // Bypass Next.js internals so we always fetch fresh bundles.
  if (
    requestURL.pathname.startsWith("/_next/") ||
    requestURL.pathname.startsWith("/__nextjs/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  if (!requestURL.protocol.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cacheResponse) => {
      if (cacheResponse) {
        return cacheResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return networkResponse;
        })
        .catch(() => caches.match(OFFLINE_URL));
    }),
  );
});
