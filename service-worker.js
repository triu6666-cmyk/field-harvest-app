const CACHE_NAME = "field-harvest-manager-v56";
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./css/shared-header.css",
  "./js/app-version.js",
  "./js/storage.js",
  "./js/app.js",
  "./pesticides.html",
  "./css/pesticides.css",
  "./js/crop-icons.js",
  "./js/pesticide-data.js",
  "./js/pesticides.js",
  "./docs/pesticide-deep-research-prompt.md",
  "./manifest.webmanifest",
  "./assets/app-icon.svg"
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
