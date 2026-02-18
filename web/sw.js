// Minimal service worker to satisfy registration.
// Intentionally no offline caching until we define a caching strategy.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Default network behavior.
});
