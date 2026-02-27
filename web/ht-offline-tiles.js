// ═══════════════════════════════════════════════════════════════════════
// HUNTECH — Offline Tile Storage (IndexedDB + Custom Leaflet TileLayer)
//
// Production-grade offline maps using IndexedDB instead of SW Cache API.
// IndexedDB stores raw tile blobs keyed by URL — no Vary header issues,
// no opaque response padding, no cache eviction surprises.
//
// Usage:
//   L.tileLayer.offline(url, options)   — drop-in replacement for L.tileLayer
//   window.htOfflineTiles.saveTiles(urls, onProgress) — bulk download
//   window.htOfflineTiles.count() — number of cached tiles
//   window.htOfflineTiles.clear() — wipe tile cache
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var DB_NAME = 'huntech-tiles';
  var DB_VERSION = 1;
  var STORE_NAME = 'tiles';
  var _db = null;

  // ── Open / create the IndexedDB ──────────────────────────────────────
  function openDB() {
    if (_db) return Promise.resolve(_db);
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME); // key = tile URL string
        }
      };
      req.onsuccess = function (e) {
        _db = e.target.result;
        resolve(_db);
      };
      req.onerror = function () {
        console.error('[HT-Tiles] IndexedDB open failed:', req.error);
        reject(req.error);
      };
    });
  }

  // ── Get a tile blob from IndexedDB ───────────────────────────────────
  function getTile(url) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var req = store.get(url);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  // ── Put a tile blob into IndexedDB ───────────────────────────────────
  function putTile(url, blob) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        var req = store.put(blob, url);
        req.onsuccess = function () { resolve(); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  // ── Count tiles in IndexedDB ─────────────────────────────────────────
  function countTiles() {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var req = store.count();
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  // ── Clear all tiles ──────────────────────────────────────────────────
  function clearTiles() {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        var req = store.clear();
        req.onsuccess = function () { resolve(); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  // ── Bulk save tiles to IndexedDB ─────────────────────────────────────
  // urls: string[]  — tile URLs to fetch and store
  // onProgress(done, total, failed) — called after each tile
  // Returns Promise<{saved, failed, total}>
  function saveTiles(urls, onProgress) {
    var total = urls.length;
    var done = 0;
    var failed = 0;
    var failedUrls = [];
    var BATCH = 6;
    var BATCH_DELAY = 100;

    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    function fetchAndStore(url) {
      return fetch(url, { mode: 'cors', credentials: 'omit' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.blob();
        })
        .then(function (blob) {
          return putTile(url, blob);
        })
        .then(function () {
          done++;
          if (onProgress) onProgress(done, total, failed);
        })
        .catch(function () {
          done++;
          failed++;
          failedUrls.push(url);
          if (onProgress) onProgress(done, total, failed);
        });
    }

    function fetchRetry(url) {
      return sleep(300).then(function () {
        return fetch(url, { mode: 'cors', credentials: 'omit' })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.blob();
          })
          .then(function (blob) {
            return putTile(url, blob);
          })
          .then(function () {
            done++;
            failed--; // recovered
            if (onProgress) onProgress(done, total, failed);
          })
          .catch(function () {
            done++;
            if (onProgress) onProgress(done, total, failed);
          });
      });
    }

    // First pass — batches of 6 with 100ms delay
    var idx = 0;
    function nextBatch() {
      if (idx >= urls.length) return startRetries();
      var batch = urls.slice(idx, idx + BATCH);
      idx += BATCH;
      return Promise.all(batch.map(fetchAndStore))
        .then(function () { return sleep(BATCH_DELAY); })
        .then(nextBatch);
    }

    // Up to 3 retry passes, progressively slower
    var retryPass = 0;
    var MAX_RETRIES = 3;
    function startRetries() {
      if (failedUrls.length === 0 || retryPass >= MAX_RETRIES) {
        return Promise.resolve({ saved: total - failed, failed: failed, total: total });
      }
      retryPass++;
      var retryList = failedUrls.slice();
      failedUrls = [];
      total += retryList.length;
      var batchSize = Math.max(2, 6 - retryPass * 2); // 4, 2, 2
      var delay = 200 * retryPass; // 200, 400, 600ms

      var ri = 0;
      function nextRetryBatch() {
        if (ri >= retryList.length) return startRetries();
        var batch = retryList.slice(ri, ri + batchSize);
        ri += batchSize;
        return Promise.all(batch.map(fetchRetry))
          .then(function () { return sleep(delay); })
          .then(nextRetryBatch);
      }
      return nextRetryBatch();
    }

    return nextBatch();
  }

  // ── Custom Leaflet TileLayer: IndexedDB-first ────────────────────────
  // Checks IndexedDB for the tile blob, serves from there if found.
  // On cache miss, fetches from network normally and stores the result.
  // CRITICAL: A timeout ensures tiles always load even if IndexedDB hangs.
  var IDB_TIMEOUT_MS = 2000; // max ms to wait for IndexedDB + fetch before network fallback

  if (typeof L !== 'undefined' && L.TileLayer) {
    L.TileLayer.Offline = L.TileLayer.extend({
      // ── Single-fetch createTile ────────────────────────────────────
      // v82k: On cache miss we fetch the blob ONCE and use it for BOTH
      // display (via blob URL) AND caching (putTile to IndexedDB).
      // Previous double-fetch (_cacheNetworkTile) silently failed at
      // high zoom levels causing tiles to display but never cache.
      createTile: function (coords, done) {
        var tile = document.createElement('img');
        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

        if (this.options.crossOrigin || this.options.crossOrigin === '') {
          tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
        }
        tile.referrerPolicy = '';
        tile.alt = '';

        var url = this.getTileUrl(coords);
        var srcSet = false; // guard: only set tile.src once

        // Helper: display tile from a blob (creates object URL)
        function setFromBlob(blob) {
          if (srcSet) return;
          clearTimeout(timer);
          srcSet = true;
          var objUrl = URL.createObjectURL(blob);
          tile._htObjUrl = objUrl;
          tile.src = objUrl;
        }

        // Helper: fall back to direct network load (no caching possible)
        function setFromNetwork() {
          if (srcSet) return;
          clearTimeout(timer);
          srcSet = true;
          tile.src = url;
        }

        // Safety timeout — if IndexedDB + fetch take too long, load direct
        var timer = setTimeout(setFromNetwork, IDB_TIMEOUT_MS);

        // Try IndexedDB first, then single-fetch on miss
        getTile(url).then(function (blob) {
          if (srcSet) return; // timeout already fired
          if (blob) {
            // Cache hit — display from stored blob
            setFromBlob(blob);
          } else {
            // Cache miss — single fetch: display AND cache from one request
            fetch(url, { mode: 'cors', credentials: 'omit' })
              .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.blob();
              })
              .then(function (blob) {
                setFromBlob(blob);
                // Background-cache the blob we just fetched
                putTile(url, blob).catch(function () {});
              })
              .catch(function () {
                // CORS fetch failed — fall back to img direct load
                // (img tags bypass CORS, tile displays but can't be cached)
                setFromNetwork();
              });
          }
        }).catch(function () {
          // IndexedDB error — fall back to network
          setFromNetwork();
        });

        return tile;
      },

      _removeTile: function (key) {
        var tile = this._tiles[key];
        if (tile && tile.el && tile.el._htObjUrl) {
          URL.revokeObjectURL(tile.el._htObjUrl);
        }
        L.TileLayer.prototype._removeTile.call(this, key);
      }
    });

    L.tileLayer.offline = function (url, options) {
      return new L.TileLayer.Offline(url, options);
    };
  }

  // ── Expose API ───────────────────────────────────────────────────────
  window.htOfflineTiles = {
    getTile: getTile,
    putTile: putTile,
    count: countTiles,
    clear: clearTiles,
    saveTiles: saveTiles,
    openDB: openDB
  };

  // Pre-open the DB so first tile reads are fast
  openDB().catch(function () {});
})();
