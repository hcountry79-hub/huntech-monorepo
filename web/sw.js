// ═══════════════════════════════════════════════════════════════════════
// HUNTECH — Service Worker (App Shell Only)
//
// v82i: Tiles are now stored in IndexedDB via ht-offline-tiles.js.
// This SW only handles app-shell pre-caching and CDN caching.
// No tile caching here — eliminates Vary header, opaque response,
// and cache eviction issues that plagued previous versions.
// ═══════════════════════════════════════════════════════════════════════

const SW_VERSION = 'huntech-sw-v82i';
const APP_SHELL_CACHE = 'huntech-shell-v52';

// ── App-shell files to pre-cache on install ───────────────────────────
const APP_SHELL = [
  './',
  './index.html',
  './fly-fishing.html',
  './app.css',
  './main.js',
  './ht-fly-fishing.js',
  './ht-offline-tiles.js',
  './fly-fishing-data.js',
  './config.js',
  './api.js',
  './regulations.js',
  './ht-errors.js',
  './ht-tracking.js',
  './ht-cloud.js',
  './manifest.json',
  './manifest-fly.json',
  './assets/fish-swim.svg',
  './assets/cast-target.svg',
  './assets/angler-bank.svg',
  './assets/angler-wade.svg',
  './assets/fly-module-logo.svg',
  './assets/fly-hero-7.webp',
  './assets/trout-pin.svg',
  './assets/trout-pin-brown.svg',
  './assets/trout-logo.png',
];

// CDN resources — cached on first use
const CDN_PATTERNS = [
  /unpkg\.com\/leaflet/,
  /unpkg\.com\/leaflet-draw/,
  /unpkg\.com\/esri-leaflet/,
  /cdn\.jsdelivr\.net.*leaflet/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
];

// ── INSTALL ───────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then(cache =>
        Promise.allSettled(
          APP_SHELL.map(url =>
            cache.add(url).catch(e =>
              console.log('[SW] skip cache', url, e.message))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────────────
// Clean up ALL old caches (including the old tile cache)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== APP_SHELL_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────────────
// Tiles are NOT intercepted — they go straight to network or IndexedDB
// via the custom L.TileLayer.Offline in ht-offline-tiles.js.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CDN libs → cache-first
  if (_isCdn(url)) {
    event.respondWith(_cdnCF(event.request));
    return;
  }

  // Own origin → network-first, cache fallback
  if (url.origin === self.location.origin) {
    event.respondWith(_netFirst(event.request));
    return;
  }
});

// ── CDN: cache-first ──────────────────────────────────────────────────
async function _cdnCF(req) {
  const c = await caches.open(APP_SHELL_CACHE);
  const hit = await c.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) c.put(req, res.clone());
    return res;
  } catch {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

// ── Own origin: network-first ─────────────────────────────────────────
// KEY: ignoreSearch:true on fallback — HTML loads scripts with ?v=xyz
// cache busters, but pre-cache stores them without query strings.
// Without ignoreSearch the offline fallback won't find them.
async function _netFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const c = await caches.open(APP_SHELL_CACHE);
      c.put(req, res.clone());
    }
    return res;
  } catch {
    // Try exact URL first (includes ?v= if previously cached online)
    const hit = await caches.match(req);
    if (hit) return hit;
    // Then try ignoring query string — matches pre-cached ./app.css
    // against a request for app.css?v=20260227d
    const hitNoQ = await caches.match(req, { ignoreSearch: true });
    if (hitNoQ) return hitNoQ;
    if (req.mode === 'navigate') {
      const url = new URL(req.url);
      const page = url.pathname.split('/').pop() || 'index.html';
      const exact = await caches.match('./' + page);
      if (exact) return exact;
      const fly = await caches.match('./fly-fishing.html');
      if (fly && page.includes('fly')) return fly;
      const idx = await caches.match('./index.html');
      if (idx) return idx;
    }
    return new Response('Offline', { status: 503 });
  }
}

// ── URL classifier ────────────────────────────────────────────────────
function _isCdn(u) { return CDN_PATTERNS.some(p => p.test(u.href)); }

// ── Message channel (cache status) ────────────────────────────────────
self.addEventListener('message', (event) => {
  const d = event.data;
  if (d?.type === 'GET_CACHE_STATUS') {
    _status().then(s => event.ports?.[0]?.postMessage(s));
  }
  // Legacy: CLEAR_TILE_CACHE from old code — just acknowledge
  if (d?.type === 'CLEAR_TILE_CACHE') {
    event.ports?.[0]?.postMessage({ cleared: true });
  }
});

async function _status() {
  try {
    const sc = await caches.open(APP_SHELL_CACHE);
    return {
      shell: (await sc.keys()).length,
      version: SW_VERSION,
    };
  } catch { return { shell: 0, version: SW_VERSION }; }
}
