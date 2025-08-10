const CACHE_NAME = "contractai-v1"
const urlsToCache = [
  "/",
  "/dashboard",
  "/wizard",
  "/auth/login",
  "/auth/register",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Handle background sync for offline contract saving
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Sync offline data when connection is restored
  return Promise.resolve()
}
