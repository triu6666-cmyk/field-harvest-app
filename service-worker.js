const CACHE_NAME = "field-harvest-manager-v46";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./shared-header.css",
  "./app-version.js",
  "./storage.js",
  "./app.js",
  "./pesticides.html",
  "./pesticides.css",
  "./crop-icons.js",
  "./pesticide-data.js",
  "./pesticides.js",
  "./pesticide-deep-research-prompt.md",
  "./manifest.webmanifest",
  "./app-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isAppAsset = requestUrl.origin === self.location.origin;
  const isFreshnessCritical = event.request.mode === "navigate"
    || ["document", "script", "style"].includes(event.request.destination);

  if (isAppAsset && isFreshnessCritical) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
          return response;
        } catch {
          return caches.match(event.request);
        }
      })()
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => (
      cachedResponse || fetch(event.request)
    ))
  );
});
