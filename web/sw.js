// ═══════════════════════════════════════════════════════════════════════
// HUNTECH — Service Worker with Offline Tile Caching
// ═══════════════════════════════════════════════════════════════════════

const SW_VERSION = 'huntech-sw-v47';
const APP_SHELL_CACHE = 'huntech-shell-v28';
const TILE_CACHE = 'huntech-tiles-v1';

// Max tile cache size (~500 MB at ~30KB avg/tile ≈ 16 000 tiles)
const MAX_TILE_ENTRIES = 16000;

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
  /basemaps\.arcgis\.com/,
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
async function _tileCF(req) {
  const c = await caches.open(TILE_CACHE);
  const hit = await c.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) {
      c.put(req, res.clone());       // fire-and-forget
      _trimTiles(c);                  // keep under quota
    }
    return res;
  } catch {
    return _emptyTile();
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
      const idx = await caches.match('/index.html');
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
