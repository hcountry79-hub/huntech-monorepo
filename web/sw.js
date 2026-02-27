// ═══════════════════════════════════════════════════════════════════════
// HUNTECH — Service Worker with Offline Tile Caching
// ═══════════════════════════════════════════════════════════════════════

const SW_VERSION = 'huntech-sw-v82f';
const APP_SHELL_CACHE = 'huntech-shell-v49';
const TILE_CACHE = 'huntech-tiles-v1';

// Max tile cache size (~750 MB at ~30KB avg/tile ≈ 25 000 tiles)
const MAX_TILE_ENTRIES = 25000;

// ── App-shell files to pre-cache on install ───────────────────────────
const APP_SHELL = [
  './',
  './index.html',
  './fly-fishing.html',
  './app.css',
  './main.js', 
  './ht-fly-fishing.js',
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

// Map tile host patterns — cached aggressively
const TILE_PATTERNS = [
  /server\.arcgisonline\.com/,
  /services\.arcgisonline\.com/,
  /basemaps?\.arcgis\.com/,
  /basemap\.nationalmap\.gov/,
  /tile\.openstreetmap\.org/,
  /tile\.opentopomap\.org/,
  /api\.mapbox\.com/,
  /mt[0-3]\.google\.com/,
  /tiles\.arcgis\.com/,
  /imagery\.arcgis\.com/,
  /elevation3d\.arcgis\.com/,
  /naip\.mrlc\.gov/,
  /map1\.vis\.earthdata\.nasa\.gov/,
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
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== APP_SHELL_CACHE && k !== TILE_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Map tiles → cache-first, fallback to transparent PNG
  if (_isTile(url)) {
    event.respondWith(_tileCF(event.request));
    return;
  }

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

// ── Tile: cache-first ─────────────────────────────────────────────────
// KEY DESIGN NOTES:
// 1. ignoreVary:true  — Esri returns "Vary: Origin". Download uses a CORS
//    request (has Origin header) but Leaflet <img> sends no-cors (no Origin).
//    Without ignoreVary the cached tile won't match the <img> request.
// 2. CORS fetch first — avoids "opaque response" which Chrome pads to 7 MB
//    against storage quota.  All active tile providers (Esri, USGS, OSM)
//    send CORS headers, so the CORS path succeeds in practice.
// 3. No-cors fallback — for any tile server without CORS headers.
let _trimCounter = 0;
async function _tileCF(req) {
  const c = await caches.open(TILE_CACHE);
  const url = req.url;
  const hit = await c.match(url, { ignoreVary: true });
  if (hit) return hit;
  try {
    // CORS fetch — non-opaque, quota-friendly
    const res = await fetch(new Request(url, { mode: 'cors', credentials: 'omit' }));
    if (res.ok) {
      c.put(url, res.clone());
      if (++_trimCounter % 200 === 0) _trimTiles(c);
    }
    return res;
  } catch {
    // Fallback for non-CORS tile servers (Google, NASA, etc.)
    try {
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') {
        c.put(url, res.clone());
        if (++_trimCounter % 200 === 0) _trimTiles(c);
      }
      return res;
    } catch {
      return _emptyTile();
    }
  }
}

async function _trimTiles(cache) {
  try {
    const keys = await cache.keys();
    if (keys.length > MAX_TILE_ENTRIES) {
      const cut = Math.floor(keys.length * 0.1);
      for (let i = 0; i < cut; i++) cache.delete(keys[i]);
    }
  } catch { /* quota — ignore */ }
}

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
async function _netFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const c = await caches.open(APP_SHELL_CACHE);
      c.put(req, res.clone());
    }
    return res;
  } catch {
    const hit = await caches.match(req);
    if (hit) return hit;
    if (req.mode === 'navigate') {
      // Try the exact page first, then fly module, then shed
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

// ── URL classifiers ───────────────────────────────────────────────────
function _isTile(u) { return TILE_PATTERNS.some(p => p.test(u.href)); }
function _isCdn(u)  { return CDN_PATTERNS.some(p => p.test(u.href)); }

// ── Transparent 1×1 PNG (offline tile placeholder) ────────────────────
function _emptyTile() {
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12' +
    'NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABl0RVh0Q29tbWVudA' +
    'BDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAANSURBVAjXY2BgYPgPAAEEAQBBCuSYAA' +
    'AAAElFTkSuQmCC';
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return new Response(buf.buffer, {
    headers: { 'Content-Type': 'image/png' },
  });
}

// ── Message channel (cache status / clear) ────────────────────────────
self.addEventListener('message', (event) => {
  const d = event.data;
  if (d?.type === 'GET_CACHE_STATUS') {
    _status().then(s => event.ports?.[0]?.postMessage(s));
  }
  if (d?.type === 'CLEAR_TILE_CACHE') {
    caches.delete(TILE_CACHE).then(() =>
      event.ports?.[0]?.postMessage({ cleared: true })
    );
  }
});

async function _status() {
  try {
    const tc = await caches.open(TILE_CACHE);
    const sc = await caches.open(APP_SHELL_CACHE);
    return {
      tiles: (await tc.keys()).length,
      shell: (await sc.keys()).length,
      version: SW_VERSION,
    };
  } catch { return { tiles: 0, shell: 0, version: SW_VERSION }; }
}
