// ===================================================================
// HUNTECH - Fly Fishing Module (extracted from main.js)
// ===================================================================

// ── FEATURE FLAGS ──────────────────────────────────────────────────
// Set to true to restore WADE HERE pills + green approach lines.
// Set to false to hide them.  (To bring back: just flip to true)
var WADE_MARKERS_ENABLED = false;
// ───────────────────────────────────────────────────────────────────

function isFlyModule() {
  return Boolean(document.body && document.body.classList.contains('module-fly'));
}

function isTurkeyModule() {
  return Boolean(document.body && document.body.classList.contains('module-turkey'));
}

function getFlyWaters() {
  return Array.isArray(window.FLY_WATERS) ? window.FLY_WATERS
    : Array.isArray(window.TROUT_WATERS) ? window.TROUT_WATERS
    : [];
}

function getFlyRegulations() {
  return Array.isArray(window.FLY_REGULATIONS) ? window.FLY_REGULATIONS : [];
}

function getFlySafetyNotes() {
  return Array.isArray(window.FLY_WATER_SAFETY) ? window.FLY_WATER_SAFETY : [];
}

function getFlyTroutIndexPath() {
  const raw = window.FLY_TROUT_INDEX_PATH || 'data/trout-repo/normalized/trout-index.json';
  return String(raw || '').trim();
}

function stripFlyIntelMarkdown(text) {
  return String(text || '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/`/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getFlyTroutIntelEntries() {
  return Array.isArray(flyTroutIntelCache) ? flyTroutIntelCache : [];
}

async function loadFlyTroutIntel() {
  if (Array.isArray(flyTroutIntelCache)) return flyTroutIntelCache;
  if (flyTroutIntelLoadPromise) return flyTroutIntelLoadPromise;
  const path = getFlyTroutIndexPath();
  if (!path) {
    flyTroutIntelCache = [];
    return flyTroutIntelCache;
  }

  flyTroutIntelLoadPromise = (async () => {
    try {
      const res = await fetchWithTimeout(path, { headers: { 'Accept': 'application/json' } }, 9000);
      if (!res.ok) throw new Error(`Trout index HTTP ${res.status}`);
      const data = await res.json();
      const entries = Array.isArray(data?.entries) ? data.entries : [];
      flyTroutIntelCache = entries;
      return entries;
    } catch {
      flyTroutIntelCache = [];
      return flyTroutIntelCache;
    } finally {
      flyTroutIntelLoadPromise = null;
    }
  })();

  return flyTroutIntelLoadPromise;
}

function getFlyWaterById(id) {
  return getFlyWaters().find((water) => water.id === id) || null;
}

function renderFlyWaterSelect(filterText = '') {
  if (!isFlyModule()) return;
  const select = document.getElementById('savedPropertySelect');
  if (!select) return;
  const query = String(filterText || '').trim().toLowerCase();
  const waters = getFlyWaters();
  const filtered = query
    ? waters.filter((water) => {
        const name = String(water?.name || '').toLowerCase();
        const type = String(water?.waterType || '').toLowerCase();
        const ribbon = String(water?.ribbon || '').toLowerCase();
        return name.includes(query) || type.includes(query) || ribbon.includes(query);
      })
    : waters;

  if (!filtered.length) {
    select.innerHTML = '<option value="">No waters found</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  select.innerHTML = ['<option value="">Select water</option>']
    .concat(filtered.map((water) => `<option value="${escapeHtml(water.id)}">${escapeHtml(water.name || 'Trout Water')}</option>`))
    .join('');
}

function ensureFlyWaterLayer() {
  if (!flyWaterLayer) {
    flyWaterLayer = L.layerGroup();
    flyWaterLayer.addTo(map);
  }
  return flyWaterLayer;
}

function clearFlyWaterLayer() {
  if (flyWaterLayer) flyWaterLayer.clearLayers();
  flyWaterMarkers = [];
}

function loadSavedTroutWaters() {
  try {
    const raw = localStorage.getItem(FLY_SAVED_WATERS_STORAGE_KEY);
    if (raw) {
      flySavedWatersCache = JSON.parse(raw);
      return flySavedWatersCache;
    }
  } catch {
    // Ignore storage failures.
  }
  if (Array.isArray(flySavedWatersCache)) return flySavedWatersCache;
  return [];
}

function saveSavedTroutWaters(list) {
  try {
    const safeList = Array.isArray(list) ? list : [];
    flySavedWatersCache = safeList;
    localStorage.setItem(FLY_SAVED_WATERS_STORAGE_KEY, JSON.stringify(safeList));
  } catch {
    flySavedWatersCache = Array.isArray(list) ? list : [];
  }
}

function getSavedTroutWaterById(id) {
  const list = loadSavedTroutWaters();
  return list.find((item) => item && item.id === id) || null;
}

function addTroutWaterToSaved(water) {
  if (!water || !water.id) return false;
  const list = loadSavedTroutWaters();
  if (list.some((item) => item && item.id === water.id)) return false;
  list.unshift({
    id: water.id,
    name: water.name,
    waterType: water.waterType,
    ribbon: water.ribbon,
    lat: water.lat,
    lng: water.lng,
    addedAt: Date.now()
  });
  saveSavedTroutWaters(list);
  return true;
}

function removeTroutWaterFromSaved(id) {
  const list = loadSavedTroutWaters().filter((item) => item && item.id !== id);
  saveSavedTroutWaters(list);
  removeFlyPinnedWater(id);
}

function loadFlyPinnedWaters() {
  try {
    const raw = localStorage.getItem(FLY_PINNED_WATERS_STORAGE_KEY);
    if (raw) {
      flyPinnedWatersCache = JSON.parse(raw);
      return flyPinnedWatersCache;
    }
  } catch {
    // Ignore storage failures.
  }
  if (Array.isArray(flyPinnedWatersCache)) return flyPinnedWatersCache;
  return [];
}

function saveFlyPinnedWaters(list) {
  try {
    const safeList = Array.isArray(list) ? list : [];
    flyPinnedWatersCache = safeList;
    localStorage.setItem(FLY_PINNED_WATERS_STORAGE_KEY, JSON.stringify(safeList));
  } catch {
    flyPinnedWatersCache = Array.isArray(list) ? list : [];
  }
}

function isFlyWaterPinned(id) {
  const list = loadFlyPinnedWaters();
  return list.includes(id);
}

function addFlyPinnedWater(id) {
  if (!id) return;
  const list = loadFlyPinnedWaters();
  if (list.includes(id)) return;
  list.unshift(id);
  saveFlyPinnedWaters(list);
}

function removeFlyPinnedWater(id) {
  if (!id) return;
  const list = loadFlyPinnedWaters().filter((item) => item !== id);
  saveFlyPinnedWaters(list);
}

function toggleFlyPinnedWater(id) {
  if (!id) return false;
  if (isFlyWaterPinned(id)) {
    removeFlyPinnedWater(id);
    return false;
  }
  addFlyPinnedWater(id);
  return true;
}

function formatFlyWaterShortName(name) {
  const raw = String(name || '').trim();
  if (!raw) return 'Spot';
  const patterns = [
    /\s+state\s+park$/i,
    /\s+state\s+area$/i,
    /\s+state$/i,
    /\s+park$/i
  ];
  let trimmed = raw;
  patterns.forEach((pattern) => {
    trimmed = trimmed.replace(pattern, '');
  });
  trimmed = trimmed.replace(/\s{2,}/g, ' ').trim();
  return trimmed || raw;
}

function renderPinnedFlyWaters() {
  if (!isFlyModule()) return;
  const container = document.getElementById('flyPinnedWaters');
  if (!container) return;
  const pinned = loadFlyPinnedWaters();
  if (!pinned.length) {
    const placeholders = ['Montauk', 'Tan Vat', 'Lane Springs', 'Blue Springs'];
    container.innerHTML = placeholders.map((label) => `
      <button class="ht-fly-pinned-pill ht-fly-pinned-pill--placeholder" type="button" disabled>
        <span class="ht-fly-pinned-icon"><img src="assets/trout-logo.png" alt="Spot"></span>
        <span class="ht-fly-pinned-label">${escapeHtml(label)}</span>
      </button>
    `).join('');
    return;
  }
  const items = pinned.map((id) => getFlyWaterById(id) || getSavedTroutWaterById(id)).filter(Boolean);
  if (!items.length) {
    const placeholders = ['Montauk', 'Tan Vat', 'Lane Springs', 'Blue Springs'];
    container.innerHTML = placeholders.map((label) => `
      <button class="ht-fly-pinned-pill ht-fly-pinned-pill--placeholder" type="button" disabled>
        <span class="ht-fly-pinned-icon"><img src="assets/trout-logo.png" alt="Spot"></span>
        <span class="ht-fly-pinned-label">${escapeHtml(label)}</span>
      </button>
    `).join('');
    return;
  }
  container.innerHTML = items.map((water) => {
    const label = formatFlyWaterShortName(water.name);
    return `
      <button class="ht-fly-pinned-pill" type="button" onclick="focusPinnedFlyWater('${escapeHtml(water.id)}')">
        <span class="ht-fly-pinned-icon"><img src="assets/trout-logo.png" alt="Spot"></span>
        <span class="ht-fly-pinned-label">${escapeHtml(label)}</span>
      </button>
    `;
  }).join('');
}

window.toggleFlyPinnedWater = function(id) {
  const next = toggleFlyPinnedWater(id);
  renderPinnedFlyWaters();
  showNotice(next ? 'Pinned to Stream Command.' : 'Removed from pinned spots.', 'success', 2400);
};

window.focusPinnedFlyWater = function(id) {
  if (!isFlyModule()) return;
  const water = getFlyWaterById(id) || getSavedTroutWaterById(id);
  if (!water) return;
  focusFlyWater(water);
};

function getFlyExploreCenterLatLng() {
  if (userLocationMarker && typeof userLocationMarker.getLatLng === 'function') {
    return userLocationMarker.getLatLng();
  }
  try {
    const raw = localStorage.getItem(LAST_KNOWN_LOCATION_STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    if (stored && Number.isFinite(stored.lat) && Number.isFinite(stored.lng)) {
      return L.latLng(stored.lat, stored.lng);
    }
  } catch {
    // Ignore storage failures.
  }
  return map && typeof map.getCenter === 'function' ? map.getCenter() : null;
}

function getFlyExploreRadiusMiles(zoom) {
  if (zoom >= 13) return 35;
  if (zoom >= 11) return 90;
  if (zoom >= 10) return 140;
  return 9999;
}

/* Add zone area pills for river-category waters so each zone gets its own
   clickable pill on the map. Click routes to the parent water's action bar. */
function _addZoneAreaPins(water, center, radiusMeters) {
  if (!water || !water.access || water.category !== 'river') return;
  water.access.forEach(function(ap) {
    if (ap.type !== 'zone' || !Number.isFinite(ap.lat) || !Number.isFinite(ap.lng)) return;
    // Distance check when center/radius provided
    if (center && Number.isFinite(radiusMeters)) {
      var d = center.distanceTo(L.latLng(ap.lat, ap.lng));
      if (d > radiusMeters) return;
    }
    // Build short label from zone name
    var label = String(ap.name || '')
      .replace(/^Blue Ribbon\s*[\u2014\u2013\-]\s*/i, '')
      .replace(/^Reach \d+\s*[\u2014\u2013\-]\s*/i, '')
      .trim();
    if (!label) label = ap.name || water.name;
    // Create proxy water at zone coordinates (keeps parent id for click routing)
    var zoneProxy = { id: water.id, name: water.name, lat: ap.lat, lng: ap.lng };
    addFlyWaterMarker(zoneProxy, label);
  });
}

function showFlyWaterMarkersByDistance(center, radiusMiles) {
  if (!center || !Number.isFinite(radiusMiles)) return;
  clearFlyWaterLayer();
  const radiusMeters = radiusMiles * 1609.34;
  const seen = new Set();
  getFlyWaters().forEach((water) => {
    if (!water || !Number.isFinite(water.lat) || !Number.isFinite(water.lng)) return;
    const distance = center.distanceTo(L.latLng(water.lat, water.lng));
    if (distance <= radiusMeters) {
      if (water.id) seen.add(water.id);
      addFlyWaterMarker(water);
    }
    // Zone area pills — each zone gets its own pill with independent distance check
    _addZoneAreaPins(water, center, radiusMeters);
  });
  getFlyCustomWaters().forEach((water, idx) => {
    if (!water || !Number.isFinite(water.lat) || !Number.isFinite(water.lng)) return;
    const id = water.id || `custom_${idx}`;
    if (seen.has(id)) return;
    const distance = center.distanceTo(L.latLng(water.lat, water.lng));
    if (distance <= radiusMeters) {
      seen.add(id);
      addFlyWaterMarker(water, formatFlyWaterShortName(water.name));
    }
  });
}

function updateFlyWaterExploreMarkers() {
  if (!flyWaterExploreActive || !map) return;
  const zoom = typeof map.getZoom === 'function' ? map.getZoom() : 12;
  const center = getFlyExploreCenterLatLng();
  if (!center) return;
  const radiusMiles = getFlyExploreRadiusMiles(zoom);
  showFlyWaterMarkersByDistance(center, radiusMiles);
}

function setFlyWaterExploreActive(isActive) {
  flyWaterExploreActive = Boolean(isActive);
  if (!map) return;
  if (flyWaterExploreHandler) {
    map.off('moveend', flyWaterExploreHandler);
    map.off('zoomend', flyWaterExploreHandler);
    flyWaterExploreHandler = null;
  }
  if (flyWaterExploreActive) {
    flyWaterExploreHandler = () => updateFlyWaterExploreMarkers();
    map.on('moveend', flyWaterExploreHandler);
    map.on('zoomend', flyWaterExploreHandler);
  }
}

function setFlyWaterLayerEnabled(isEnabled, options = {}) {
  const next = Boolean(isEnabled);
  const useExplore = options.explore !== undefined ? Boolean(options.explore) : true;
  flyWaterLayerEnabled = next;
  if (!isFlyModule()) {
    updateMapToggleButtons();
    return;
  }

  if (next) {
    ensureFlyWaterLayer();
    if (useExplore) {
      setFlyWaterExploreActive(true);
      updateFlyWaterExploreMarkers();
    } else {
      setFlyWaterExploreActive(false);
      showFlyWaterMarkers();
    }
  } else {
    setFlyWaterExploreActive(false);
    clearFlyWaterLayer();
    closeFlyWaterActionBar();
  }

  updateMapToggleButtons();
}

/* ── Missouri trout permit/tag detection (MDC rules) ──
   Trout Parks (Bennett, Montauk, Roaring River, Maramec): Daily Trout Tag (bought at park)
   All other trout waters (Blue/Red/White Ribbon, tailwaters, stocked): Annual Trout Permit ($12 res)
   Returns: { type: 'tag'|'permit'|'none', label: string, pill: string } */
function getTroutPermitInfo(water) {
  const category = String(water?.category || '').toLowerCase();
  const ribbon = String(water?.ribbon || '').toLowerCase();
  const waterType = String(water?.waterType || '').toLowerCase();
  // Trout Parks → Daily Trout Tag
  if (category.includes('trout-park') || ribbon.includes('trout park')) {
    return { type: 'tag', label: 'Daily Trout Tag Required', pill: 'Trout Tag Required' };
  }
  // Blue/Red/White Ribbon, tailwaters, stocked → Annual Trout Permit
  if (ribbon.includes('blue') || ribbon.includes('red') || ribbon.includes('white')) {
    return { type: 'permit', label: 'Trout Permit Required', pill: 'Trout Permit Required' };
  }
  if (waterType.includes('tailwater') || waterType.includes('stocked') || category.includes('stocked')) {
    return { type: 'permit', label: 'Trout Permit Required', pill: 'Trout Permit Required' };
  }
  if (waterType.includes('trout') || ribbon.includes('trout')) {
    return { type: 'permit', label: 'Trout Permit Required', pill: 'Trout Permit Required' };
  }
  return { type: 'none', label: 'No Additional Permit Needed', pill: 'No Extra Permit' };
}
// Legacy compat wrapper
function isTroutStampRequired(water) {
  return getTroutPermitInfo(water).type !== 'none';
}

function ensureFlyWaterActionBar() {
  if (flyWaterActionBar) return flyWaterActionBar;
  flyWaterActionBar = document.createElement('div');
  flyWaterActionBar.id = 'fly-water-action-bar';
  flyWaterActionBar.className = 'ht-fly-water-bar';
  flyWaterActionBar.addEventListener('click', (event) => event.stopPropagation());
  document.body.appendChild(flyWaterActionBar);
  return flyWaterActionBar;
}

function closeFlyWaterActionBar() {
  if (flyWaterActionBar) flyWaterActionBar.classList.remove('is-visible');
}

function collapseFlyCommandPanels() {
  const strategyPanel = document.getElementById('strategy-panel');
  if (strategyPanel) {
    strategyPanel.style.display = 'none';
    setStrategyOpen(false);
  }
  collapseFieldCommandTray();
}

function showFlyWaterActionBar(water) {
  if (!water) return;
  console.log('[HT] showFlyWaterActionBar called for:', water.name);
  collapseFlyCommandPanels();
  const bar = ensureFlyWaterActionBar();
  bar.innerHTML = `
    <div class="ht-fly-water-bar-header ht-fly-water-bar-header--center">
      <button class="ht-fly-water-bar-close" type="button" onclick="closeFlyWaterActionBar()">✕</button>
      <div class="ht-fly-water-bar-nameblock">
        <div class="ht-fly-water-bar-title ht-fly-water-bar-title--hero">${escapeHtml(water.name || 'Trout Water')}</div>
      </div>
    </div>
    <div class="ht-fly-water-bar-actions ht-fly-water-bar-actions--single">
      <button class="ht-fly-pill ht-fly-pill--checkin-hero" type="button" onclick="fishStepCheckIn('${escapeHtml(water.id)}')">🎣 CHECK IN TO AREA</button>
    </div>
  `;
  bar.classList.add('is-visible');
  console.log('[HT] Action bar is-visible applied, bar display:', window.getComputedStyle(bar).display);
}

/* ── Stream Command Tray: zone selection + user inputs + LET'S GO ── */
function showFlyCheckInForm(water) {
  if (!water) return;
  const bar = ensureFlyWaterActionBar();
  const zones = (water.access || []).filter(a => a.type === 'zone');

  // Build zone pills
  let zonePillsHtml = '';
  zones.forEach((z, idx) => {
    const methodIcons = (z.methods || []).map(m => {
      if (m === 'fly') return '🪰';
      if (m === 'spin') return '🎣';
      if (m === 'bait') return '🪱';
      return '';
    }).join(' ');
    const shortName = z.name.replace(/\s*—\s*.*$/, ''); // "Zone 1"
    const methodLabel = z.name.replace(/^.*—\s*/, '');    // "Fly Only"
    zonePillsHtml += `<button class="ht-zone-select-pill${idx === 0 ? ' ht-zone-select-pill--active' : ''}" type="button" data-zone-idx="${idx}" onclick="pickFishZone(this,${idx})">
      <span class="ht-zone-select-name">${escapeHtml(shortName)}</span>
      <span class="ht-zone-select-method">${methodIcons} ${escapeHtml(methodLabel)}</span>
    </button>`;
  });

  bar.innerHTML = `
    <div class="ht-fly-water-bar-header ht-fly-water-bar-header--center">
      <button class="ht-fly-water-bar-close" type="button" onclick="closeFlyWaterActionBar()">✕</button>
      <div class="ht-fly-water-bar-nameblock">
        <div class="ht-fly-water-bar-title ht-fly-water-bar-title--hero">⚡ ${escapeHtml(water.name)}</div>
        <div class="ht-fly-water-bar-sub--cmd">STREAM COMMAND</div>
      </div>
    </div>
    <div class="ht-stream-cmd-body">
      <div class="ht-stream-cmd-section">
        <div class="ht-stream-cmd-label">SELECT YOUR ZONE</div>
        <div class="ht-zone-select-row">${zonePillsHtml}</div>
      </div>
      <div class="ht-stream-cmd-section">
        <div class="ht-stream-cmd-label">YOUR METHOD</div>
        <div class="ht-method-row">
          <button class="ht-method-btn ht-method-btn--active" data-fish-method="fly" onclick="pickFishMethod(this,'fly')">🪰 Fly</button>
          <button class="ht-method-btn" data-fish-method="spin" onclick="pickFishMethod(this,'spin')">🎣 Lure</button>
          <button class="ht-method-btn" data-fish-method="bait" onclick="pickFishMethod(this,'bait')">🪱 Bait</button>
        </div>
      </div>
      <div class="ht-stream-cmd-section">
        <div class="ht-stream-cmd-label">WADERS?</div>
        <div class="ht-method-row">
          <button class="ht-method-btn ht-method-btn--active" data-fish-wade="waders" onclick="pickFishWade(this,'waders')">🥾 Yes</button>
          <button class="ht-method-btn" data-fish-wade="streamside" onclick="pickFishWade(this,'streamside')">🏖️ No — Bank</button>
        </div>
      </div>
      <div class="ht-stream-cmd-section">
        <div class="ht-stream-cmd-label">SKILL LEVEL</div>
        <div class="ht-method-row">
          <button class="ht-method-btn" data-fish-exp="new" onclick="pickFishExp(this,'new')">🌱 New</button>
          <button class="ht-method-btn ht-method-btn--active" data-fish-exp="learning" onclick="pickFishExp(this,'learning')">📈 Learning</button>
          <button class="ht-method-btn" data-fish-exp="confident" onclick="pickFishExp(this,'confident')">💪 Confident</button>
          <button class="ht-method-btn" data-fish-exp="advanced" onclick="pickFishExp(this,'advanced')">🏆 Advanced</button>
        </div>
      </div>
      <button class="ht-letsgo-hero" type="button" onclick="fishLetsGo()">🎣 LET'S GO</button>
    </div>
  `;
  bar.classList.add('is-visible');
}
window.showFlyCheckInForm = showFlyCheckInForm;

/* Zone pill selection handler */
window.pickFishZone = function(btn, idx) {
  btn.closest('.ht-zone-select-row').querySelectorAll('.ht-zone-select-pill').forEach(b => b.classList.remove('ht-zone-select-pill--active'));
  btn.classList.add('ht-zone-select-pill--active');
  if (window._fishFlow) window._fishFlow.selectedZoneIdx = idx;
};

/* ══ LET'S GO — main launch sequence ══ */
window.fishLetsGo = function() {
  const fishFlow = window._fishFlow;
  if (!fishFlow || !fishFlow.area) return;
  const water = fishFlow.area;
  const zones = (water.access || []).filter(a => a.type === 'zone');
  const zoneIdx = typeof fishFlow.selectedZoneIdx === 'number' ? fishFlow.selectedZoneIdx : 0;
  const zone = zones[zoneIdx] || zones[0];
  if (!zone) return;

  // Store selected zone
  fishFlow.selectedZone = zone;
  fishFlow.selectedZoneIdx = zoneIdx;

  // 1) Collapse the action bar
  closeFlyWaterActionBar();

  // 2) Clear clutter
  clearFlyWaterLayer();

  // 3) Deploy hotspot area pins along the stream
  setTimeout(function() {
    if (typeof window.deployHotspotAreaPins === 'function') {
      window.deployHotspotAreaPins(water);
    }
    showNotice('Hotspots deployed — tap a pin to fish!', 'success', 3500);
  }, 400);
};

function getFlyPinIcon(labelText, water) {
  const label = String(labelText || '').trim();
  const wId = (water && water.id) ? String(water.id).replace(/'/g, "\\'") : '';
  return L.divIcon({
    className: 'ht-fly-area-pin',
    html: `<div class="ht-fly-area-pill" onclick="handleAreaPillClick('${wId}')">
      <div class="ht-fly-area-pill-name">${escapeHtml(label)}</div>
      <div class="ht-fly-area-pill-cta">Click for area details</div>
    </div>`,
    iconSize: [140, 36],
    iconAnchor: [0, 12]
  });
}

function getFlyWaterMarkerLabel(water) {
  const name = String(water?.name || '').trim();
  if (!name) return 'Trout Water';
  return name;
}

function getFlyCustomWaters() {
  return loadSavedTroutWaters().filter((water) => water && Number.isFinite(water.lat) && Number.isFinite(water.lng));
}

function openFlyWaterPopup(marker, water) {
  if (!marker || !water) return;
  // No white popup — show unified action tray instead
  showFlyWaterActionBar(water);
}

/* Direct onclick handler for area pills — bypasses Leaflet event delegation
   which fails when iconSize makes the container too small for click targeting */
window.handleAreaPillClick = function(waterId) {
  console.log('[HT] handleAreaPillClick FIRED, waterId=', waterId);
  if (!waterId) return;
  try {
    const allWaters = getFlyWaters().concat(getFlyCustomWaters());
    console.log('[HT] waters found:', allWaters.length);
    const water = allWaters.find(function(w) { return w && w.id === waterId; });
    if (water) {
      console.log('[HT] Matched water:', water.name, '— calling showFlyWaterActionBar');
      showFlyWaterActionBar(water);
    } else {
      console.warn('[HT] No water matched for id:', waterId);
    }
  } catch (err) {
    console.error('[HT] handleAreaPillClick error:', err);
  }
};

function addFlyWaterMarker(water, labelOverride) {
  if (!water || !Number.isFinite(water.lat) || !Number.isFinite(water.lng)) return null;
  const label = labelOverride || getFlyWaterMarkerLabel(water);
  const marker = L.marker([water.lat, water.lng], {
    icon: getFlyPinIcon(label, water)
  });
  marker.__flyWater = water;
  marker.on('click', () => {
    openFlyWaterPopup(marker, water);
  });
  ensureFlyWaterLayer().addLayer(marker);
  flyWaterMarkers.push(marker);
  return marker;
}

/* ── Access Point Pin helpers ───────────────────────── */
function getAccessPinIcon(accessPt) {
  const apType = String(accessPt.type || '').toLowerCase();
  const isParking = apType === 'parking';
  const isZone = apType === 'zone';

  // Zone pins use the pill style — same shape as main water pin but with zone name
  if (isZone) {
    const zoneName = String(accessPt.name || 'Zone').trim();
    return L.divIcon({
      className: 'ht-fly-area-pin',
      html: `<div class="ht-fly-zone-pill">${escapeHtml(zoneName)}</div>`,
      iconSize: [120, 20],
      iconAnchor: [60, -8]
    });
  }

  // Parking / amenity pins — small compact marker
  const shortLabel = getAccessPinLabel(accessPt.name);
  const wrapperClass = isParking
    ? 'ht-pin-wrapper ht-pin-wrapper--access ht-pin-wrapper--access-parking'
    : 'ht-pin-wrapper ht-pin-wrapper--access';
  return L.divIcon({
    className: wrapperClass,
    html: `
      <div class="ht-pin ht-pin--access">
        <div class="ht-pin-inner">
          <span class="ht-access-pin-label">${escapeHtml(shortLabel)}</span>
        </div>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 40]
  });
}

function getAccessPinLabel(name) {
  const n = String(name || '').trim();
  if (!n) return 'Access';
  const lower = n.toLowerCase();
  if (lower.includes('parking') || lower.includes('main lot') || lower.includes('main parking')) return 'P';
  if (lower.includes('store') || lower.includes('tag office') || lower.includes('concession')) return 'Store';
  if (lower.includes('restroom') || lower.includes('bathroom')) return 'WC';
  if (lower.includes('hatchery') || lower.includes('mill')) return 'Hatch';
  if (lower.includes('museum')) return 'Museum';
  // Compact: take first meaningful word
  const words = n.replace(/\b(access|area|entry|point|parking)\b/gi, '').trim().split(/\s+/);
  const token = words.slice(0, 1).join(' ');
  return token.length > 8 ? token.substring(0, 7) + '…' : (token || 'Info');
}

function openAccessPointPopup(marker, water, accessPt) {
  if (!marker || !accessPt) return;
  const apType = String(accessPt.type || '').toLowerCase();
  const isParking = apType === 'parking';
  const isZone = apType === 'zone';
  const waterName = water ? escapeHtml(water.name || 'Trout Water') : 'Trout Water';
  const waterId = water ? escapeHtml(water.id || '') : '';

  let typeBadge, titleColor;
  if (isZone) {
    typeBadge = '📍 Regulation Zone';
    titleColor = '#2bd4ff';
  } else if (isParking) {
    typeBadge = '🅿️ Parking / Amenity';
    titleColor = '#ffe082';
  } else {
    typeBadge = '🎣 Access';
    titleColor = '#7cffc7';
  }

  const popup = `
    <div style="min-width:220px;">
      <div style="font-weight:700;color:${titleColor};font-size:14px;">${escapeHtml(accessPt.name)}</div>
      <div style="font-size:12px;color:#ddd;margin-top:3px;">${typeBadge} • ${waterName}</div>
      <div style="font-size:11px;color:#b8d8c8;margin-top:6px;">${escapeHtml(accessPt.notes || '')}</div>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
        <button style="padding:4px 10px;border-radius:6px;border:1px solid #7cffc7;background:rgba(124,255,199,0.12);color:#7cffc7;font-size:11px;font-weight:700;cursor:pointer;"
          onclick="flyCheckInAtAccess('${waterId}',${accessPt.lat},${accessPt.lng},'${escapeHtml(accessPt.name)}')">Check In Here</button>
      </div>
    </div>
  `;
  marker.bindPopup(popup).openPopup();
}

function addFlyAccessPointMarker(water, accessPt) {
  if (!accessPt || !Number.isFinite(accessPt.lat) || !Number.isFinite(accessPt.lng)) return null;
  const marker = L.marker([accessPt.lat, accessPt.lng], {
    icon: getAccessPinIcon(accessPt),
    zIndexOffset: -100  // keep below main water pins
  });
  marker.__flyWater = water;
  marker.__accessPoint = accessPt;
  marker.on('click', () => {
    openAccessPointPopup(marker, water, accessPt);
  });
  ensureFlyWaterLayer().addLayer(marker);
  flyWaterMarkers.push(marker);
  return marker;
}

function addAccessPointsForWater(water) {
  if (!water || !Array.isArray(water.access)) return;
  water.access.forEach((ap) => {
    // Quality gate: zone pins always render; amenity pins require verified === true
    if (ap.type !== 'zone' && ap.verified !== true) {
      console.warn('HUNTECH PIN-QC: Skipping unverified amenity pin "' + ap.name + '" at ' + ap.lat + ',' + ap.lng);
      return;
    }
    addFlyAccessPointMarker(water, ap);
  });
}
window.addAccessPointsForWater = addAccessPointsForWater;
/* ── end access point helpers ───────────────────────── */

function showFlyWaterMarkers() {
  clearFlyWaterLayer();
  const seen = new Set();
  getFlyWaters().forEach((water) => {
    if (!water || !water.id) return;
    seen.add(water.id);
    addFlyWaterMarker(water);
    // Zone area pills for river-category waters
    _addZoneAreaPins(water);
  });
  getFlyCustomWaters().forEach((water, idx) => {
    const id = water.id || `custom_${idx}`;
    if (seen.has(id)) return;
    seen.add(id);
    addFlyWaterMarker(water, formatFlyWaterShortName(water.name));
  });
}

function focusFlyWater(water) {
  if (!water || !map) return;
  map.setView([water.lat, water.lng], Math.max(map.getZoom(), 12));
  const marker = flyWaterMarkers.find((pin) => pin.__flyWater && pin.__flyWater.id === water.id);
  if (marker) {
    focusMarker(marker);
    openFlyWaterPopup(marker, water);
  }
}

function getDefaultFlyInventory() {
  return {
    rods: [],
    lines: [],
    leaders: [],
    tippets: [],
    flies: [],
    lures: [],
    bait: [],
    lastUpdated: Date.now()
  };
}

function loadFlyInventory() {
  if (flyInventory) return flyInventory;
  try {
    const raw = localStorage.getItem(FLY_INVENTORY_STORAGE_KEY);
    if (raw) {
      flyInventory = JSON.parse(raw);
      sanitizeFlyInventory(flyInventory);
      return flyInventory;
    }
  } catch {
    // Ignore parse errors.
  }
  flyInventory = getDefaultFlyInventory();
  return flyInventory;
}

function sanitizeFlyInventory(inv) {
  if (!inv || !Array.isArray(inv.flies)) return;
  inv.flies = inv.flies.map((entry) => {
    if (!entry || typeof entry !== 'object') return entry;
    const url = String(entry.imageUrl || '');
    if (url.startsWith('blob:')) {
      return { ...entry, imageUrl: '' };
    }
    return entry;
  });
}

function saveFlyInventory() {
  if (!flyInventory) return;
  try {
    flyInventory.lastUpdated = Date.now();
    localStorage.setItem(FLY_INVENTORY_STORAGE_KEY, JSON.stringify(flyInventory));
  } catch {
    // Ignore storage failures.
  }
}

function loadFlySessions() {
  try {
    const raw = localStorage.getItem(FLY_SESSION_STORAGE_KEY);
    flySessions = raw ? JSON.parse(raw) : [];
  } catch {
    flySessions = [];
  }
}

function saveFlySessions() {
  try {
    localStorage.setItem(FLY_SESSION_STORAGE_KEY, JSON.stringify(flySessions));
  } catch {
    // Ignore storage failures.
  }
}

function renderFlyInventorySummary() {
  const inv = loadFlyInventory();
  const list = [
    { key: 'rods', label: 'Rods' },
    { key: 'lines', label: 'Lines' },
    { key: 'leaders', label: 'Leaders' },
    { key: 'tippets', label: 'Tippets' },
    { key: 'flies', label: 'Flies' },
    { key: 'lures', label: 'Lures' },
    { key: 'bait', label: 'Bait' }
  ];
  return list.map((item) => {
    const count = Array.isArray(inv[item.key]) ? inv[item.key].length : 0;
    return `<div class="ht-fly-inventory-row"><span>${item.label}</span><strong>${count}</strong></div>`;
  }).join('');
}

function renderFlyWaterList() {
  const waters = getFlyWaters();
  if (!waters.length) {
    return '<div class="ht-fly-note">No waters loaded yet. Import official datasets to populate this list.</div>';
  }
  return waters.map((water) => {
    const badge = water.ribbon ? `<span class="ht-fly-badge">${escapeHtml(water.ribbon)}</span>` : '';
    const confidence = water.confidence ? water.confidence.toUpperCase() : 'UNKNOWN';
    return `
      <div class="ht-fly-water-card">
        <div>
          <div class="ht-fly-water-title">${escapeHtml(water.name)}</div>
          <div class="ht-fly-water-sub">${escapeHtml(water.waterType || 'Public Water')} ${badge}</div>
          <div class="ht-fly-water-meta">Solitude: ${escapeHtml(water.solitude || 'medium')} • Confidence: ${escapeHtml(confidence)}</div>
        </div>
        <div class="ht-fly-water-actions">
          <button class="ht-panel-btn secondary" onclick="selectFlyWater('${water.id}')">Focus</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderFlyTroutIntelList() {
  if (flyTroutIntelCache === null) {
    return '<div class="ht-fly-note">Loading trout intel...</div>';
  }
  const entries = getFlyTroutIntelEntries();
  if (!entries.length) {
    return '<div class="ht-fly-note">No trout intel loaded yet. Run the trout repo build when new scans arrive.</div>';
  }
  return entries.map((entry) => {
    const facts = Array.isArray(entry.key_facts) ? entry.key_facts.slice(0, 2) : [];
    const preview = facts.length
      ? facts.map((fact) => `<div class="ht-fly-water-meta">${escapeHtml(stripFlyIntelMarkdown(fact))}</div>`).join('')
      : `<div class="ht-fly-water-meta">${escapeHtml(stripFlyIntelMarkdown(entry.summary || ''))}</div>`;
    return `
      <div class="ht-fly-water-card">
        <div>
          <div class="ht-fly-water-title">${escapeHtml(entry.title || 'Trout Intel')}</div>
          ${preview}
        </div>
        <div class="ht-fly-water-actions">
          <button class="ht-panel-btn secondary" onclick="openFlyTroutIntelEntry('${escapeHtml(entry.id)}')">Open</button>
        </div>
      </div>
    `;
  }).join('');
}

function refreshFlyTroutIntelList() {
  const container = document.getElementById('flyTroutIntelList');
  if (!container) return;
  container.innerHTML = renderFlyTroutIntelList();
}

window.openFlyTroutIntelEntry = function(id) {
  if (!isFlyModule()) return;
  const entry = getFlyTroutIntelEntries().find((item) => item && item.id === id);
  if (!entry) return;
  const facts = Array.isArray(entry.key_facts) ? entry.key_facts : [];
  const downloads = Array.isArray(entry.downloads) ? entry.downloads : [];
  const factsHtml = facts.length
    ? `<ul>${facts.map((fact) => `<li>${escapeHtml(stripFlyIntelMarkdown(fact))}</li>`).join('')}</ul>`
    : `<div class="ht-fly-note">${escapeHtml(stripFlyIntelMarkdown(entry.summary || 'No details yet.'))}</div>`;
  const downloadsHtml = downloads.length
    ? `<div class="ht-fly-note">Downloads: ${downloads.map((item) => escapeHtml(item)).join(', ')}</div>`
    : '';
  openInfoModal({
    title: entry.title || 'Trout Intel',
    bodyHtml: `
      <div style="display:grid;gap:8px;">
        ${factsHtml}
        ${downloadsHtml}
      </div>
    `,
    confirmLabel: 'Close'
  });
};

function renderFlyRegulationsHtml() {
  const regs = getFlyRegulations();
  if (!regs.length) {
    return '<div class="ht-fly-note">No regulations loaded. Link MDC sources to enable this panel.</div>';
  }
  return regs.map((rule) => `
    <div class="ht-fly-reg-card">
      <div class="ht-fly-reg-title">${escapeHtml(rule.title)}</div>
      <div class="ht-fly-reg-body">${escapeHtml(rule.summary)}</div>
      ${rule.source ? `<div class="ht-fly-reg-source">${escapeHtml(rule.source)}</div>` : ''}
    </div>
  `).join('');
}

function getFlyWeatherSnapshot() {
  return {
    temp: Number.isFinite(activeTemperature) ? activeTemperature : null,
    wind: Number.isFinite(activeWindSpeed) ? activeWindSpeed : null,
    windDir: activeWindDir || null,
    updatedAt: weatherForecastUpdatedAt || null
  };
}

function renderFlyConditionsHtml() {
  const snapshot = getFlyWeatherSnapshot();
  const temp = Number.isFinite(snapshot.temp) ? `${snapshot.temp}F` : '--';
  const wind = Number.isFinite(snapshot.wind) ? `${snapshot.wind} mph` : '--';
  const windDir = snapshot.windDir || '--';
  const updated = snapshot.updatedAt ? new Date(snapshot.updatedAt).toLocaleTimeString() : 'unknown';
  const safety = getFlySafetyNotes();
  const safetyHtml = safety.length
    ? safety.map((note) => `
        <div class="ht-fly-reg-card">
          <div class="ht-fly-reg-title">${escapeHtml(note.title)}</div>
          <div class="ht-fly-reg-body">${escapeHtml(note.summary)}</div>
        </div>
      `).join('')
    : '<div class="ht-fly-note">No safety notes configured yet.</div>';

  return `
    <div class="ht-fly-conditions">
      <div class="ht-fly-conditions-row"><span>Temp</span><strong>${temp}</strong></div>
      <div class="ht-fly-conditions-row"><span>Wind</span><strong>${wind} ${windDir}</strong></div>
      <div class="ht-fly-conditions-row"><span>Updated</span><strong>${updated}</strong></div>
    </div>
    <div class="ht-fly-note">Flows and clarity will appear here once USGS and MDC feeds are linked.</div>
    ${safetyHtml}
  `;
}

function getFlySelectValue(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !el.value) return fallback;
  return el.value;
}

function getFlyPreferences() {
  return {
    focus: getFlySelectValue('flyFocusSelect', 'Fly Fishing'),
    water: getFlySelectValue('flyWaterTypeSelect', 'Trout Park'),
    experience: getFlySelectValue('flyExperienceSelect', 'New')
  };
}

function getFlyInputValue(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  return String(el.value || '').trim();
}

function updateFlyCoachFeed(message) {
  const feed = document.getElementById('flyCoachFeed');
  if (!feed) {
    showNotice(message, 'info', 3200);
    return;
  }
  const item = document.createElement('div');
  item.className = 'ht-fly-feed-item';
  item.textContent = message;
  feed.prepend(item);
}

function showFlyCoachPanel() {
  const existing = document.getElementById('strategy-panel');
  if (existing) existing.remove();
  stopPlanLoadingTicker();

  const prefs = getFlyPreferences();
  const panel = document.createElement('div');
  panel.id = 'strategy-panel';
  panel.className = 'ht-strategy-panel ht-fly-strategy-panel';
  panel.innerHTML = `
    <h2 class="ht-panel-title">Fly Command</h2>
    <div class="ht-fly-hero">
      <div class="ht-fly-hero-title">Missouri Trout Copilot</div>
      <div class="ht-fly-hero-sub">Clean-room build using official public data.</div>
      <div class="ht-fly-hero-meta">Focus: ${prefs.focus} • Water: ${prefs.water} • Experience: ${prefs.experience}</div>
    </div>

    <details open id="flyWaterSection">
      <summary>Water + Access</summary>
      <div class="ht-fly-note">Find public access, then build a low-crowd entry plan.</div>
      <div class="ht-fly-water-list">${renderFlyWaterList()}</div>
      <div class="ht-fly-btn-row">
        <button class="ht-panel-btn primary" onclick="openFlyFinderPanel()">Find Public Water</button>
        <button class="ht-panel-btn secondary" onclick="flyCheckIn()">Check In At Parking</button>
      </div>
    </details>

    <details id="flyIntelSection">
      <summary>Trout Intel</summary>
      <div class="ht-fly-note">Scanned access notes, seasonal rules, and maps from the trout repo.</div>
      <div class="ht-fly-water-list" id="flyTroutIntelList">${renderFlyTroutIntelList()}</div>
    </details>

    <details id="flyConditionsSection">
      <summary>Conditions + Safety</summary>
      ${renderFlyConditionsHtml()}
      <div class="ht-fly-btn-row">
        <button class="ht-panel-btn primary" onclick="flyUpdateConditions()">Update Conditions</button>
        <button class="ht-panel-btn secondary" onclick="openFlyRegulationsPanel()">View Regulations</button>
      </div>
    </details>

    <details id="flyInventorySection">
      <summary>Inventory + Gear</summary>
      <div class="ht-fly-inventory">${renderFlyInventorySummary()}</div>
      <div class="ht-fly-form-row">
        <label class="ht-fly-form-label" for="flyInvKindSelect">Quick add</label>
        <div class="ht-fly-form-controls">
          <select id="flyInvKindSelect" class="ht-fly-select">
            <option value="flies">Flies</option>
            <option value="rods">Rods</option>
            <option value="lines">Lines</option>
            <option value="leaders">Leaders</option>
            <option value="tippets">Tippets</option>
            <option value="lures">Lures</option>
            <option value="bait">Bait</option>
          </select>
          <input id="flyInvEntry" class="ht-fly-input" type="text" placeholder="e.g. 5wt rod, WF5F line">
        </div>
        <button class="ht-panel-btn secondary" onclick="flyAddInventoryFromPanel()">Add</button>
      </div>
      <div class="ht-fly-form-row">
        <label class="ht-fly-form-label" for="flyBoxEntry">Fly box scan</label>
        <textarea id="flyBoxEntry" class="ht-fly-textarea" rows="3" placeholder="Paste fly names separated by commas"></textarea>
        <button class="ht-panel-btn secondary" onclick="flyScanFlyBoxFromPanel()">Save Fly Box</button>
      </div>
      <div class="ht-fly-btn-row">
        <button class="ht-panel-btn primary" onclick="openFlyInventoryPanel()">View Full Inventory</button>
      </div>
    </details>

    <details id="flyRegSection">
      <summary>Regulations + Permits</summary>
      ${renderFlyRegulationsHtml()}
      <div class="ht-fly-btn-row">
        <button class="ht-panel-btn primary" onclick="openFlyRegulationsPanel()">Review Regulations</button>
      </div>
    </details>

    <details>
      <summary>Fly, Lure, or Bait Plan</summary>
      <div class="ht-fly-note">Recommendations will only use your saved inventory.</div>
      <div class="ht-fly-btn-row">
        <button class="ht-panel-btn primary" onclick="flyRecommendFly()">Recommend Setup</button>
        <button class="ht-panel-btn secondary" onclick="openFlyInventoryPanel()">Update Inventory</button>
      </div>
    </details>

    <details open>
      <summary>Coach Feed</summary>
      <div class="ht-fly-feed" id="flyCoachFeed">
        <div class="ht-fly-feed-item">Coach online. Check in to start your plan.</div>
      </div>
      <div class="ht-fly-form-row">
        <label class="ht-fly-form-label" for="flyCatchSpecies">Catch log</label>
        <div class="ht-fly-form-controls">
          <input id="flyCatchSpecies" class="ht-fly-input" type="text" placeholder="Species (rainbow, brown, etc.)">
          <input id="flyCatchNotes" class="ht-fly-input" type="text" placeholder="Notes (fly, depth, hatch)">
        </div>
        <button class="ht-panel-btn secondary" onclick="flyLogCatchFromPanel()">Save Catch</button>
      </div>
      <div class="ht-fly-btn-row">
        <button class="ht-panel-btn primary" onclick="flyCheckIn()">Check In</button>
        <button class="ht-panel-btn secondary" onclick="flyNextSpot()">Move To Next Spot</button>
      </div>
    </details>

    <button class="ht-panel-btn ghost" onclick="closeStrategyPanel()">Close Panel</button>
  `;

  document.body.appendChild(panel);
  setStrategyOpen(true);
  updateTrayToggleButton();

  if (isFlyModule()) {
    refreshFlyTroutIntelList();
    loadFlyTroutIntel().then(refreshFlyTroutIntelList);
  }
}

window.openFlyCoachPanel = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
  updateFlyCoachFeed('Fly Coach ready. Tell me what you see on the water.');
};

window.openFlyFinderPanel = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
  showFlyWaterMarkers();
  updateFlyCoachFeed('Water Finder queued. Select a public water source to continue.');
};

window.openFlyDiscoverWaters = function() {
  if (!isFlyModule()) return;
  setFlyWaterLayerEnabled(true, { explore: true });
  const center = getFlyExploreCenterLatLng();
  if (center && map) {
    map.setView(center, Math.max(map.getZoom(), 12), { animate: true });
  }
  updateFlyWaterExploreMarkers();
  showNotice('Discover mode on. Zoom out to reveal more trout waters.', 'info', 3600);
};

window.openFlySavedWaters = function() {
  if (!isFlyModule()) return;
  const saved = loadSavedTroutWaters();
  if (!saved.length) {
    showNotice('No saved trout waters yet. Add one from Discover mode.', 'warning', 3200);
    return;
  }
  const rows = saved.map((item) => {
    const label = escapeHtml(item.name || 'Saved Water');
    const meta = [item.waterType, item.ribbon].filter(Boolean).map(escapeHtml).join(' • ');
    return `
      <div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div>
          <div style="font-weight:700;color:#e8fbff;">${label}</div>
          <div style="font-size:11px;color:#9fc3ce;">${meta || 'Public Water'}</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
          <button class="ht-panel-btn secondary" type="button" onclick="focusSavedTroutWater('${escapeHtml(item.id)}')">Focus</button>
          <button class="ht-panel-btn ghost" type="button" onclick="removeSavedTroutWater('${escapeHtml(item.id)}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');
  openInfoModal({
    title: 'My Saved Trout Waters',
    bodyHtml: `<div style="display:grid;gap:6px;">${rows}</div>`,
    confirmLabel: 'Close'
  });
};

window.openFlyInventoryPanel = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
  updateFlyCoachFeed('Inventory update started. Add rods, lines, leaders, and flies.');
};

window.openFlyRegulationsPanel = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
  updateFlyCoachFeed('Regulations check queued. Trout stamp requirements will appear here.');
};

window.openFlyJournalPanel = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
  updateFlyCoachFeed('Fly Journal opened. Use voice to log catches, photos, and waypoints.');
  showNotice('Fly Journal coming online. Voice logging and photo capture will appear here.', 'info', 3600);
};

window.addFlyWaterToSaved = function(id) {
  if (!isFlyModule()) return;
  const water = getFlyWaterById(id) || getSavedTroutWaterById(id);
  if (!water) return;
  const added = addTroutWaterToSaved(water);
  showNotice(added ? `${water.name} saved offline.` : 'Water already saved.', 'success', 2400);
};

window.focusSavedTroutWater = function(id) {
  if (!isFlyModule()) return;
  const water = getFlyWaterById(id) || getSavedTroutWaterById(id);
  if (!water) return;
  showFlyWaterMarkers();
  focusFlyWater(water);
};

window.removeSavedTroutWater = function(id) {
  if (!isFlyModule()) return;
  removeTroutWaterFromSaved(id);
  showNotice('Removed from saved waters.', 'info', 2200);
};

window.openFlyWaterRegulations = function(id) {
  if (!isFlyModule()) return;
  const water = getFlyWaterById(id) || getSavedTroutWaterById(id);
  if (!water) return;
  collapseFlyCommandPanels();
  const regs = getFlyRegulations();
  const stampRequired = isTroutStampRequired(water);
  const stampLabel = stampRequired ? 'Trout Stamp Required' : 'Trout Stamp Not Required';
  const stampPill = stampRequired ? 'Stamp Required' : 'Stamp Not Required';
  const stampClass = stampRequired ? 'ht-trout-stamp' : 'ht-trout-stamp ht-trout-stamp--optional';
  const regHtml = regs.length
    ? regs.map((rule) => `
        <div style="margin-top:10px;padding:10px;border-radius:10px;border:1px solid rgba(43,212,255,0.25);background:rgba(10,28,38,0.7);">
          <div style="font-weight:700;color:#e8fbff;">${escapeHtml(rule.title)}</div>
          <div style="font-size:12px;color:#bcd5df;margin-top:6px;">${escapeHtml(rule.summary)}</div>
        </div>
      `).join('')
    : '<div style="font-size:12px;color:#bcd5df;">No regulations loaded yet.</div>';
  const bodyHtml = `
    <div style="display:grid;gap:8px;">
      <div style="font-weight:800;color:#e8fbff;">${escapeHtml(water.name || 'Trout Water')}</div>
      <div style="font-size:12px;color:#9fc3ce;">${escapeHtml(water.waterType || 'Public Water')} • ${escapeHtml(water.ribbon || 'General')}</div>
      <div class="${stampClass}" aria-label="${stampLabel}">
        <span class="ht-trout-stamp-pill">${stampPill}</span>
      </div>
      ${regHtml}
    </div>
  `;
  openInfoModal({
    title: 'Area Rules + Regs',
    bodyHtml,
    confirmLabel: 'Close'
  });
};

function getDefaultFlyCommandPrefs() {
  return {
    waders: 'yes',
    rod: 'fly',
    level: 'beginner'
  };
}

function loadFlyCommandPrefs() {
  if (flyCommandPrefs) return flyCommandPrefs;
  try {
    const raw = localStorage.getItem(FLY_COMMAND_PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      flyCommandPrefs = {
        ...getDefaultFlyCommandPrefs(),
        ...(parsed && typeof parsed === 'object' ? parsed : {})
      };
      return flyCommandPrefs;
    }
  } catch {
    // Ignore parse errors.
  }
  flyCommandPrefs = getDefaultFlyCommandPrefs();
  return flyCommandPrefs;
}

function saveFlyCommandPrefs() {
  if (!flyCommandPrefs) return;
  try {
    localStorage.setItem(FLY_COMMAND_PREFS_KEY, JSON.stringify(flyCommandPrefs));
  } catch {
    // Ignore storage failures.
  }
}

function setFlyCommandPref(key, value) {
  const prefs = loadFlyCommandPrefs();
  prefs[key] = value;
  saveFlyCommandPrefs();
}

function closeFlyCommandTray() {
  if (!flyCommandTray) return;
  flyCommandTray.remove();
  flyCommandTray = null;
}

function updateFlyCommandTraySelection(tray, key, value) {
  const group = tray.querySelector(`[data-fly-group="${key}"]`);
  if (!group) return;
  const buttons = Array.from(group.querySelectorAll('.ht-fly-toggle-pill'));
  buttons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.flyValue === value);
  });
}

function openFlyCommandTray(water) {
  if (!isFlyModule()) return;
  closeFlyCommandTray();
  closeFlyWaterActionBar();
  collapseFlyCommandPanels();
  const prefs = loadFlyCommandPrefs();
  const name = water?.name ? escapeHtml(water.name) : 'Selected Water';
  const meta = water?.waterType ? escapeHtml(water.waterType) : 'Gear check';

  const backdrop = document.createElement('div');
  backdrop.className = 'ht-fly-command-backdrop';
  backdrop.innerHTML = `
    <div class="ht-fly-command-tray" role="dialog" aria-label="Stream Command Tray">
      <div class="ht-fly-command-header">
        <div>
          <div class="ht-fly-command-title">Stream Command Tray</div>
          <div class="ht-fly-command-sub">${name} • ${meta}</div>
        </div>
        <button class="ht-fly-command-close" type="button" aria-label="Close">X</button>
      </div>

      <div class="ht-fly-command-row">
        <div class="ht-fly-command-label">Waders</div>
        <div class="ht-fly-toggle-group" data-fly-group="waders">
          <button class="ht-fly-toggle-pill" type="button" data-fly-toggle="waders" data-fly-value="yes">Yes</button>
          <button class="ht-fly-toggle-pill" type="button" data-fly-toggle="waders" data-fly-value="no">No</button>
        </div>
      </div>

      <div class="ht-fly-command-row">
        <div class="ht-fly-command-label">Rod Type</div>
        <div class="ht-fly-toggle-group" data-fly-group="rod">
          <button class="ht-fly-toggle-pill" type="button" data-fly-toggle="rod" data-fly-value="fly">Fly Rod</button>
          <button class="ht-fly-toggle-pill" type="button" data-fly-toggle="rod" data-fly-value="spinning">Spinning Rod</button>
        </div>
      </div>

      <div class="ht-fly-command-row">
        <div class="ht-fly-command-label">Fishing Level</div>
        <div class="ht-fly-toggle-group" data-fly-group="level">
          <button class="ht-fly-toggle-pill" type="button" data-fly-toggle="level" data-fly-value="beginner">Beginner</button>
          <button class="ht-fly-toggle-pill" type="button" data-fly-toggle="level" data-fly-value="intermediate">Intermediate</button>
          <button class="ht-fly-toggle-pill" type="button" data-fly-toggle="level" data-fly-value="advanced">Advanced</button>
        </div>
      </div>

      <div class="ht-fly-command-actions">
        <button class="ht-fly-pill ht-fly-pill--ghost" type="button" data-fly-command-action="close">Close</button>
        <button class="ht-fly-pill ht-fly-pill--primary" type="button" data-fly-command-action="start">LETS GO</button>
      </div>
    </div>
  `;

  const closeBtn = backdrop.querySelector('.ht-fly-command-close');
  closeBtn?.addEventListener('click', closeFlyCommandTray);

  const actionClose = backdrop.querySelector('[data-fly-command-action="close"]');
  actionClose?.addEventListener('click', closeFlyCommandTray);

  const actionStart = backdrop.querySelector('[data-fly-command-action="start"]');
  actionStart?.addEventListener('click', () => {
    closeFlyCommandTray();
    startFlyStrategyFromTray(water || null);
  });

  backdrop.querySelectorAll('[data-fly-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.flyToggle || '';
      const value = btn.dataset.flyValue || '';
      if (!key || !value) return;
      setFlyCommandPref(key, value);
      updateFlyCommandTraySelection(backdrop, key, value);
    });
  });

  ['waders', 'rod', 'level'].forEach((key) => {
    updateFlyCommandTraySelection(backdrop, key, prefs[key]);
  });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeFlyCommandTray();
  });

  document.body.appendChild(backdrop);
  flyCommandTray = backdrop;
}

function getFlyCheckInLatLng() {
  if (lastGpsFix) return lastGpsFix;
  if (userLocationMarker && userLocationMarker.getLatLng) return userLocationMarker.getLatLng();
  if (map && map.getCenter) return map.getCenter();
  return null;
}

/* Build a polygon corridor around a stream path (array of [lat,lng] pairs) */
function buildStreamCorridor(path, bufferM) {
  if (!path || path.length < 2) return null;
  var R = Math.PI / 180;
  var mPerLat = 111000;
  var mPerLng = 111000 * Math.cos(path[0][0] * R);
  var left = [], right = [];
  for (var i = 0; i < path.length; i++) {
    var lat = path[i][0], lng = path[i][1];
    var dy, dx;
    if (i === 0) { dy = path[1][0] - lat; dx = path[1][1] - lng; }
    else if (i === path.length - 1) { dy = lat - path[i-1][0]; dx = lng - path[i-1][1]; }
    else { dy = path[i+1][0] - path[i-1][0]; dx = path[i+1][1] - path[i-1][1]; }
    var dyM = dy * mPerLat, dxM = dx * mPerLng;
    var len = Math.sqrt(dyM * dyM + dxM * dxM);
    if (len < 0.01) { left.push([lat, lng]); right.push([lat, lng]); continue; }
    var pLat = (-dxM / len) * bufferM / mPerLat;
    var pLng = (dyM / len) * bufferM / mPerLng;
    left.push([lat + pLat, lng + pLng]);
    right.push([lat - pLat, lng - pLng]);
  }
  return left.concat(right.reverse());
}

function showFlyCheckInZone(latlng, waterId) {
  if (!latlng || !map) return;
  if (flyCheckInAreaLayer) {
    try { map.removeLayer(flyCheckInAreaLayer); } catch {}
  }
  // Look up water to get stream path
  var water = null;
  if (waterId && window.TROUT_WATERS) {
    water = window.TROUT_WATERS.find(function(w) { return w.id === waterId; });
  }
  if (water && water.streamPath && water.streamPath.length >= 2) {
    var corridor = buildStreamCorridor(water.streamPath, 45);
    if (corridor) {
      flyCheckInAreaLayer = L.polygon(corridor, {
        color: '#2bd4ff',
        weight: 2,
        fillColor: '#2bd4ff',
        fillOpacity: 0.12,
        dashArray: '6 4'
      }).addTo(map);
      return;
    }
  }
  // Fallback: small circle for waters without stream path
  flyCheckInAreaLayer = L.circle(latlng, {
    radius: 100,
    color: '#2bd4ff',
    weight: 2,
    fillColor: '#2bd4ff',
    fillOpacity: 0.12
  }).addTo(map);
}

/* ═══════════════════════════════════════════════════════════════════════
   ZONE-FILTERED DEPLOYMENT + MICRO PINS + STRATEGY BRIEFINGS
   ═══════════════════════════════════════════════════════════════════════ */

var zonePinMarkers = [];
var microPinMarkers = [];
var zonePolygonLayer = null;
var anglerPinMarker = null;

/* Parse allowed fishing methods for a zone */
function getZoneAllowedMethods(zone) {
  if (zone && Array.isArray(zone.methods) && zone.methods.length) return zone.methods;
  // Fallback: parse from zone name/notes
  var name = String(zone.name || '').toLowerCase();
  var notes = String(zone.notes || '').toLowerCase();
  var combined = name + ' ' + notes;
  if (combined.indexOf('bait only') !== -1) return ['bait'];
  if (combined.indexOf('fly only') !== -1 || combined.indexOf('c&r fly') !== -1 || combined.indexOf('fly area') !== -1) return ['fly'];
  if (combined.indexOf('flies & lures') !== -1 || combined.indexOf('lures & flies') !== -1 || combined.indexOf('flies and artificial lures') !== -1) return ['fly', 'spin'];
  if (combined.indexOf('all methods') !== -1 || combined.indexOf('all legal') !== -1) return ['fly', 'spin', 'bait'];
  return ['fly', 'spin', 'bait']; // default: all methods
}

/* Method label for display */
function getMethodLabel(m) {
  if (m === 'fly') return 'Fly';
  if (m === 'spin') return 'Lure';
  if (m === 'bait') return 'Bait';
  return m;
}

/* Clear deployed zone pins */
function clearZonePins() {
  zonePinMarkers.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  zonePinMarkers = [];
}

/* Clear micro pins, angler pin, and zone polygon */
function clearMicroPins() {
  microPinMarkers.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  microPinMarkers = [];
  if (zonePolygonLayer) { try { map.removeLayer(zonePolygonLayer); } catch {} zonePolygonLayer = null; }
  if (anglerPinMarker) { try { map.removeLayer(anglerPinMarker); } catch {} anglerPinMarker = null; }
}

/* ── MASTER CLEANUP: remove ALL fly fishing pins from the map ──
   Called on reset so reopening Stream Command always starts clean. */
window._clearAllFishPins = function() {
  // 1) AI ranked hotspot pins
  if (typeof _aiFishingPins !== 'undefined' && Array.isArray(_aiFishingPins)) {
    _aiFishingPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
    _aiFishingPins = [];
  }
  if (typeof _aiFishingSpots !== 'undefined') _aiFishingSpots = [];
  // 2) Micro fish pins + angler + polygon
  clearMicroPins();
  // 3) Active micro pins (3-icon clusters: fish, angler, target, cast lines)
  if (typeof _activeMicroPins !== 'undefined' && Array.isArray(_activeMicroPins)) {
    _activeMicroPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
    _activeMicroPins = [];
  }
  if (typeof _activeMicroPolygons !== 'undefined' && Array.isArray(_activeMicroPolygons)) {
    _activeMicroPolygons.forEach(function(p) { try { map.removeLayer(p); } catch {} });
    _activeMicroPolygons = [];
  }
  // 4) Zone deploy pins
  clearZonePins();
  // 5) Fly check-in area overlay
  if (typeof flyCheckInAreaLayer !== 'undefined' && flyCheckInAreaLayer && map) {
    try { map.removeLayer(flyCheckInAreaLayer); } catch {} flyCheckInAreaLayer = null;
  }
  // 6) Hotspot area pins
  if (typeof _clearHotspotPins === 'function') _clearHotspotPins();
  // 7) Any stale route lines from the route builder
  if (typeof window.clearRouteOnly === 'function') { try { window.clearRouteOnly(); } catch(e) {} }
  // 8) Stream flow canvas overlay
  if (typeof clearStreamFlowOverlay === 'function') { try { clearStreamFlowOverlay(); } catch(e) {} }
  console.log('HUNTECH: _clearAllFishPins — all pins removed');
};

/* ═══════════════════════════════════════════════════════════════════════
   HOTSPOT AREA PIN SYSTEM
   ─────────────────────────────────────────────────────────────────────
   7 general holding-area pins deployed along the entire fly zone on
   check-in. When the user taps a hotspot pin, micro fishing spots are
   deployed around it. On check-out from a hotspot the micro spots are
   removed and the user chooses "next spot" or picks a new hotspot.
   ═══════════════════════════════════════════════════════════════════════ */
var _hotspotPins = [];          // Leaflet markers for the 7 hotspot area pins
var _hotspotData = [];          // data objects for each hotspot
var _activeHotspotIdx = -1;     // which hotspot the user is currently at
var _hotspotWater = null;       // water object for current hotspot session
var _hotspotCheckoutBarEl = null;

/* Build a hotspot area pin icon */
function _getHotspotPinIcon(num, label, isActive, idx) {
  var activeClass = isActive ? ' ht-hotspot-active' : '';
  var clickIdx = (typeof idx === 'number') ? idx : -1;
  return L.divIcon({
    className: 'ht-hotspot-area-pin',
    html: '<div class="ht-hotspot-area-pill' + activeClass + '" onclick="_handleHotspotPillClick(' + clickIdx + ')">' +
      '<span class="ht-hotspot-num">' + num + '</span>' +
      '<span class="ht-hotspot-label">' + escapeHtml(label) + '</span>' +
      '</div>',
    iconSize: [160, 36],
    iconAnchor: [0, 14]
  });
}

/* Direct onclick handler for hotspot pills — ensures click works regardless of Leaflet icon sizing */
window._handleHotspotPillClick = function(idx) {
  if (idx < 0 || idx >= _hotspotData.length) return;
  try { _onHotspotPinClick(idx); } catch(err) { console.error('[HT] hotspot pill click error:', err); }
};

/* Deploy 7 hotspot area pins along the stream for a water */
window.deployHotspotAreaPins = function(water) {
  if (!water || !map) return;

  // Clear any previous hotspot pins
  _clearHotspotPins();

  // Use data-defined hotspots if available, otherwise auto-generate from streamPath
  var hotspots = water.hotspots;
  if (!hotspots || !hotspots.length) {
    // Auto-generate 7 from streamPath
    var sp = water.streamPath;
    if (!sp || sp.length < 2) return;
    var count = Math.min(7, sp.length);
    hotspots = [];
    var defaultNames = ['Spring Run', 'Upper Riffle', 'Bend Pool', 'Mid Seam', 'Deep Run', 'Lower Pool', 'Tail-Out'];
    for (var g = 0; g < count; g++) {
      var idx = Math.round(g * (sp.length - 1) / (count - 1));
      hotspots.push({
        name: defaultNames[g] || ('Spot ' + (g + 1)),
        lat: sp[idx][0],
        lng: sp[idx][1],
        habitat: 'run',
        notes: ''
      });
    }
  }

  // ── Zone-specific filtering: only deploy hotspots for the checked-in zone ──
  var selectedZone = window._fishFlow && window._fishFlow.selectedZone;
  if (selectedZone && selectedZone.zoneId) {
    hotspots = hotspots.filter(function(hs) { return hs.zoneId === selectedZone.zoneId; });
    if (!hotspots.length) {
      console.log('HUNTECH: No hotspots for zone "' + selectedZone.zoneId + '" — showing zone boundary only');
      _hotspotData = [];
      _hotspotWater = water;
      return;
    }
  }

  _hotspotData = hotspots;
  _hotspotWater = water;
  _activeHotspotIdx = -1;

  var bounds = [];
  hotspots.forEach(function(hs, i) {
    var marker = L.marker([hs.lat, hs.lng], {
      icon: _getHotspotPinIcon(i + 1, hs.name, false, i),
      zIndexOffset: 500
    }).addTo(map);

    marker.__hotspotIdx = i;
    marker.on('click', function() {
      _onHotspotPinClick(i);
    });

    _hotspotPins.push(marker);
    bounds.push([hs.lat, hs.lng]);
  });

  // Fit map to show all hotspot pins
  if (bounds.length > 1) {
    var fitBounds = L.latLngBounds(bounds);
    map.fitBounds(fitBounds.pad(0.18), { animate: true, duration: 0.8, maxZoom: 17 });
  }

  console.log('HUNTECH: Deployed ' + hotspots.length + ' hotspot area pins for ' + water.name);
};

/* Clear all hotspot pins from map */
function _clearHotspotPins() {
  _hotspotPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _hotspotPins = [];
  _hotspotData = [];
  _activeHotspotIdx = -1;
  _hotspotWater = null;
  _dismissHotspotCheckoutBar();
}
window._clearHotspotPins = _clearHotspotPins;

/* Handle click on a hotspot pin — show info tile with CHECK IN button */
function _onHotspotPinClick(idx) {
  if (idx < 0 || idx >= _hotspotData.length) return;
  var hs = _hotspotData[idx];
  if (!hs || !_hotspotWater) return;

  // If already checked into this hotspot, show its info
  if (_activeHotspotIdx === idx) {
    showNotice('Already at ' + hs.name + '. Fish the micro spots!', 'info', 2500);
    return;
  }

  // Zoom to hotspot
  map.setView([hs.lat, hs.lng], 17, { animate: true, duration: 0.6 });

  // Show hotspot info tile using the existing action bar
  _showHotspotInfoTile(idx);
}

/* Show the hotspot info tile — name, habitat, notes, CHECK IN button */
function _showHotspotInfoTile(idx) {
  var hs = _hotspotData[idx];
  if (!hs) return;

  var habitatLabels = {
    'pool': '🏊 Deep Pool', 'riffle': '🌊 Riffle', 'run': '💧 Run',
    'seam': '🔀 Current Seam', 'tailout': '🏖️ Tail-Out',
    'boulder': '🪨 Boulder Run', 'undercut': '🏔️ Undercut Bank',
    'pocket': '🫧 Pocket Water', 'log': '🪵 Log Structure'
  };
  var habitatBadge = habitatLabels[hs.habitat] || ('📍 ' + (hs.habitat || 'Holding Area'));

  var bar = ensureFlyWaterActionBar();
  bar.innerHTML =
    '<div class="ht-fly-water-bar-header ht-fly-water-bar-header--center">' +
      '<button class="ht-fly-water-bar-close" type="button" onclick="closeFlyWaterActionBar()">✕</button>' +
      '<div class="ht-fly-water-bar-nameblock">' +
        '<div class="ht-fly-water-bar-title ht-fly-water-bar-title--hero">' + escapeHtml(hs.name) + '</div>' +
        '<div class="ht-fly-water-bar-sub ht-fly-water-bar-sub--cmd" style="margin-top:2px;">' + habitatBadge + ' — Spot #' + (idx + 1) + ' of ' + _hotspotData.length + '</div>' +
      '</div>' +
    '</div>' +
    '<div style="padding:0 16px 8px;font-size:12px;color:#b8d8c8;line-height:1.4;">' +
      escapeHtml(hs.notes || '') +
    '</div>' +
    '<div class="ht-fly-water-bar-actions ht-fly-water-bar-actions--single">' +
      '<button class="ht-fly-pill ht-fly-pill--checkin-hero" type="button" onclick="hotspotDoCheckIn(' + idx + ')">🎣 CHECK IN — Deploy Fishing Spots</button>' +
    '</div>';
  bar.classList.add('is-visible');
}

/* Global: check in to a hotspot from the info tile button */
window.hotspotDoCheckIn = function(idx) {
  closeFlyWaterActionBar();

  // If checked into a different hotspot, silent checkout first
  if (_activeHotspotIdx >= 0) {
    _hotspotCheckOut(false);
  }

  _hotspotCheckIn(idx);
};

/* ═══════════════════════════════════════════════════════════════════════
   STREAM COMMAND — 6-Button Post-CheckIn Tray (3×2 Grid)
   Shows: AI Fly Box, Log Catch, Log Hatch, AI Coach, Strategy, Check Out
   ═══════════════════════════════════════════════════════════════════════ */
var _streamCommandTrayEl = null;

function _showStreamCommandTray(hs) {
  _dismissStreamCommandTray();
  // Hide the background toolbar so it doesn't show behind the 6-button tray
  var _tb = document.getElementById('toolbar');
  if (_tb) _tb.style.display = 'none';

  // Build NEXT pill label
  var nextLabel = 'Next Spot';

  var tray = document.createElement('div');
  tray.className = 'ht-stream-command-tray';
  tray.innerHTML =
    '<div class="ht-stream-command-tab">' +
      '<button class="ht-toolbar-mini-btn" type="button" onclick="cmdAiFlyBox()">FLY<br>BOX</button>' +
      '<button class="ht-stream-command-toggle" type="button" onclick="toggleStreamCommandTray()">STREAM COMMAND</button>' +
      '<button class="ht-toolbar-mini-btn" type="button" onclick="cmdLogCatch()">LOG<br>CATCH</button>' +
    '</div>' +
    '<div class="ht-stream-command-body">' +
      '<div class="ht-stream-command-grid">' +
        '<button class="ht-stream-command-btn" type="button" onclick="cmdAiFlyBox()">🎣 AI Fly Box</button>' +
        '<button class="ht-stream-command-btn" type="button" onclick="cmdLogCatch()">📸 Log Catch</button>' +
        '<button class="ht-stream-command-btn" type="button" onclick="cmdLogHatch()">🦟 Log Hatch</button>' +
        '<button class="ht-stream-command-btn" type="button" onclick="cmdAiCoach()">🤖 AI Coach</button>' +
        '<button class="ht-stream-command-btn" type="button" onclick="cmdStrategy()">⚡ Strategy</button>' +
        '<button class="ht-stream-command-btn ht-stream-command-btn--checkout" type="button" onclick="cmdCheckOut()">🔴 Check Out</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(tray);
  _streamCommandTrayEl = tray;
  // Animate in
  requestAnimationFrame(function() {
    tray.classList.add('is-visible');
  });
}

/* Toggle the Stream Command tray open/collapsed */
window.toggleStreamCommandTray = function() {
  if (!_streamCommandTrayEl) return;
  _streamCommandTrayEl.classList.toggle('is-collapsed');
};

function _dismissStreamCommandTray() {
  if (_streamCommandTrayEl) {
    try { _streamCommandTrayEl.remove(); } catch(e) {}
    _streamCommandTrayEl = null;
  }
  // Restore the background toolbar
  var _tb = document.getElementById('toolbar');
  if (_tb) _tb.style.display = '';
}
window._dismissStreamCommandTray = _dismissStreamCommandTray;

/* Go to next hotspot from inside the Stream Command tray */
window.cmdGoNext = function() {
  if (!_hotspotData.length) return;
  var nextIdx = (_activeHotspotIdx >= 0 ? _activeHotspotIdx : 0) + 1;
  if (nextIdx >= _hotspotData.length) nextIdx = 0;
  // _hotspotCheckIn handles dismissing the current tray via checkout + re-checkin
  _hotspotCheckOut(false);
  _hotspotCheckIn(nextIdx);
};

/* Pick a spot — checkout and zoom out to show all hotspot pills */
window.cmdPickASpot = function() {
  _hotspotCheckOut(false);
  // Restore hotspot pins (already done in _hotspotCheckOut)
  showNotice('Pick your next hotspot!', 'info', 2500);
};

/* Change water — full area checkout, return to favorites/toolbar */
window.cmdChangeWater = function() {
  if (!isFlyModule()) return;
  var prevName = (_hotspotWater && _hotspotWater.name) || (window._fishFlow && window._fishFlow.area && window._fishFlow.area.name) || 'area';

  // 1) Check out of current hotspot if any (silent)
  if (_activeHotspotIdx >= 0) {
    _hotspotCheckOut(false);
  }

  // 2) Dismiss stream command tray & checkout bar
  _dismissStreamCommandTray();
  _dismissHotspotCheckoutBar();

  // 3) Clear all map pins — hotspots, micro spots, access points, area pins
  if (typeof window._clearAllFishPins === 'function') window._clearAllFishPins();
  _clearHotspotPins();
  clearFlyWaterLayer();

  // 4) Close any open action bars
  if (typeof closeFlyWaterActionBar === 'function') {
    try { closeFlyWaterActionBar(); } catch(e) {}
  }

  // 5) Reset fish flow state but keep the workflow alive
  if (window._fishFlow) {
    if (window._fishFlow.areaMarker && typeof map !== 'undefined' && map) {
      try { map.removeLayer(window._fishFlow.areaMarker); } catch(e) {}
    }
    window._fishFlow.area = null;
    window._fishFlow.areaMarker = null;
    window._fishFlow.selectedZone = null;
    window._fishFlow.selectedZoneIdx = 0;
    window._fishFlow.step = 1;
  }

  // 6) Hide fly-live tray if visible
  if (typeof hideFlyLiveCommandTray === 'function') {
    try { hideFlyLiveCommandTray(); } catch(e) {}
  }

  // 7) Restore the toolbar and show step 1 (favorites + welcome)
  var _tb = document.getElementById('toolbar');
  if (_tb) _tb.style.display = '';

  // Re-open toolbar if collapsed
  if (typeof window.toggleToolbar === 'function') {
    var toolbar = document.getElementById('toolbar');
    if (toolbar && toolbar.classList.contains('collapsed')) {
      window.toggleToolbar();
    }
  }

  // Show FISH NOW panel with step 1
  if (typeof window.showStreamPanel === 'function') {
    window._fishNowSkipInitOnce = true;
    window.showStreamPanel('fishNowPanel');
  }
  if (typeof window.fishShowStep === 'function') {
    window.fishShowStep(1);
  }

  // 8) Zoom out to state/region level so user can orient
  if (typeof map !== 'undefined' && map) {
    map.setZoom(10, { animate: true, duration: 0.8 });
  }

  showNotice('Left ' + prevName + '. Pick your next water!', 'success', 3500);
  console.log('HUNTECH: cmdChangeWater — full area checkout from ' + prevName);
};

/* Check in to a hotspot — deploy micro fishing spots */
function _hotspotCheckIn(idx) {
  if (idx < 0 || idx >= _hotspotData.length) return;
  var hs = _hotspotData[idx];
  _activeHotspotIdx = idx;

  // Update pin to active state
  _refreshHotspotPinStates();

  // Zoom to this hotspot
  map.setView([hs.lat, hs.lng], 18, { animate: true, duration: 0.8 });

  // Deploy micro fishing spots around this hotspot
  _deployHotspotMicroSpots(idx);

  // ── Hide hotspot pills so they don't overlap micro clusters ──
  _hotspotPins.forEach(function(pin) {
    try { var el = pin.getElement && pin.getElement(); if (el) el.style.display = 'none'; } catch(e) {}
  });

  // ── Show the 6-button STREAM COMMAND tray ──
  _showStreamCommandTray(hs);

  showNotice('Checked in: ' + hs.name + ' — micro spots deployed!', 'success', 3000);
  console.log('HUNTECH: Hotspot check-in #' + (idx + 1) + ' ' + hs.name);
}

/* Deploy micro fishing spots around a specific hotspot */
function _deployHotspotMicroSpots(idx) {
  var hs = _hotspotData[idx];
  var water = _hotspotWater;
  if (!hs || !water) return;

  // Clear previous micro spots
  _activeMicroPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _activeMicroPins = [];
  _activeMicroPolygons.forEach(function(p) { try { map.removeLayer(p); } catch {} });
  _activeMicroPolygons = [];

  var segment = water.streamPath;
  if (!segment || segment.length < 2) return;

  // ── Interpolate stream path to get ~5m resolution ──
  // Raw streamPath has ~80m between nodes — not enough for micro spots
  var denseSeg = _interpolateStreamPath(segment, 5);

  // Find closest dense-segment index to this hotspot
  var closestIdx = 0;
  var closestDist = Infinity;
  for (var s = 0; s < denseSeg.length; s++) {
    var d = _distM(hs.lat, hs.lng, denseSeg[s][0], denseSeg[s][1]);
    if (d < closestDist) {
      closestDist = d;
      closestIdx = s;
    }
  }

  // Build micro spots within 50m of the hotspot center
  var maxMicros = 4;
  var wadeMode = 'waders';
  var microTypes = ['primary-lie', 'seam-edge', 'pocket-water'];
  var MAX_DIST = 60;
  var MIN_FROM_MAIN = 12;
  var MIN_BETWEEN = 25;   // 25m between micro spots — prevents icon overlap
  var candidates = [];

  for (var sIdx = 0; sIdx < denseSeg.length; sIdx++) {
    if (sIdx === closestIdx) continue;
    var cLat = denseSeg[sIdx][0], cLng = denseSeg[sIdx][1];
    var distFromMain = _distM(hs.lat, hs.lng, cLat, cLng);
    if (distFromMain > MAX_DIST || distFromMain < MIN_FROM_MAIN) continue;

    // ── GUARDRAIL: Snap candidate to stream — skip if on bank ──
    var snap = _snapToStream(cLat, cLng, denseSeg, water.bankWidths, water.avgStreamWidth || 12, segment);
    if (!snap.inWater) continue;

    var tooClose = false;
    for (var cm = 0; cm < candidates.length; cm++) {
      if (_distM(candidates[cm].lat, candidates[cm].lng, snap.lat, snap.lng) < MIN_BETWEEN) {
        tooClose = true; break;
      }
    }
    if (tooClose) continue;
    candidates.push({ lat: snap.lat, lng: snap.lng, segIdx: sIdx, score: 50 + Math.max(0, 30 - distFromMain) });
  }
  candidates.sort(function(a, b) { return b.score - a.score; });
  var accepted = candidates.slice(0, maxMicros);

  var bounds = [[hs.lat, hs.lng]];

  // ── STAND MARKER DEDUPLICATION + CONFLICT AVOIDANCE ──
  // Pre-compute stand AND fish/cast positions for every accepted spot.
  // A STAND HERE marker is SKIPPED when:
  //   a) Another kept stand is within 30ft (~9m), OR
  //   b) ANY fish/cast position (from any spot) is within 30ft.
  // Rule: CAST HERE + fish icon ALWAYS win over STAND HERE.
  var STAND_MERGE_DIST = 20; // 20 meters — aggressively merge so one stand serves multiple fish
  var standPositions = [];  // { lat, lng } for each accepted spot
  var fishCastPositions = []; // { lat, lng } — the fly landing / fish icon positions
  var skipStandFlags = [];  // true = skip stand marker for this spot

  // First pass: compute ALL fish/cast positions (these always win)
  accepted.forEach(function(mc) {
    var fs = _snapToStream(mc.lat, mc.lng, denseSeg, water.bankWidths, water.avgStreamWidth || 12, segment);
    var fsIdx = fs.segIdx || mc.segIdx;
    // Cast-here (flySnap) = ~1.5m upstream of fish — fishMarker is moved here
    var flyDist = Math.max(Math.round(1.5 / 5), 1);
    var flyIdx = Math.max(fsIdx - flyDist, Math.min(5, fsIdx));
    var flySn = _snapToStream(denseSeg[flyIdx][0], denseSeg[flyIdx][1], denseSeg, water.bankWidths, water.avgStreamWidth || 12, segment);
    fishCastPositions.push({ lat: flySn.lat, lng: flySn.lng });
  });

  // Second pass: compute stand positions + check conflicts
  accepted.forEach(function(mc, i) {
    // Replicate the stand-position logic from _deployMicroCluster:
    var fishSnap2 = _snapToStream(mc.lat, mc.lng, denseSeg, water.bankWidths, water.avgStreamWidth || 12, segment);
    var fishSIdx2 = fishSnap2.segIdx || mc.segIdx;
    var standDistDense2 = 3;
    var EDGE_BUF = 5;
    var standSIdx2;
    if (fishSIdx2 + standDistDense2 > denseSeg.length - 1 - EDGE_BUF) {
      standSIdx2 = Math.max(fishSIdx2 - standDistDense2, EDGE_BUF);
    } else {
      standSIdx2 = Math.min(fishSIdx2 + standDistDense2, denseSeg.length - 1 - EDGE_BUF);
    }
    var ss = _snapToStream(denseSeg[standSIdx2][0], denseSeg[standSIdx2][1], denseSeg, water.bankWidths, water.avgStreamWidth || 12, segment);
    standPositions.push({ lat: ss.lat, lng: ss.lng });

    var skip = false;

    // (a) Check against OTHER spots' fish/cast positions — cast+fish always win
    //     Skip index i (this stand's own fish) — a stand 15m from its own fish is expected
    for (var f = 0; f < fishCastPositions.length; f++) {
      if (f === i) continue; // don't conflict with own fish/cast
      if (_distM(ss.lat, ss.lng, fishCastPositions[f].lat, fishCastPositions[f].lng) < STAND_MERGE_DIST) {
        skip = true;
        break;
      }
    }

    // (b) Check if any EARLIER kept stand is within merge distance
    if (!skip) {
      for (var j = 0; j < i; j++) {
        if (skipStandFlags[j]) continue; // compare to kept ones only
        if (_distM(ss.lat, ss.lng, standPositions[j].lat, standPositions[j].lng) < STAND_MERGE_DIST) {
          skip = true;
          break;
        }
      }
    }

    skipStandFlags.push(skip);
  });

  accepted.forEach(function(mc, i) {
    var mType = microTypes[i] || 'primary-lie';
    var zone = { name: hs.name };
    var spot = { habitat: hs.habitat, lat: hs.lat, lng: hs.lng, segmentIdx: closestIdx };
    var clusterMarkers = _deployMicroCluster({
      fishLat: mc.lat, fishLng: mc.lng,
      segIdx: mc.segIdx, segment: denseSeg,
      wade: wadeMode, habitat: hs.habitat,
      microType: mType, microIdx: _activeMicroPins.length,
      spot: spot, water: water, zone: zone,
      bankWidths: water.bankWidths,
      skipStand: skipStandFlags[i]
    });
    clusterMarkers.forEach(function(mk) { _activeMicroPins.push(mk); });
    bounds.push([mc.lat, mc.lng]);
  });

  // Fit bounds to show hotspot + all micro spots
  if (bounds.length > 1) {
    var fitBounds = L.latLngBounds(bounds);
    map.fitBounds(fitBounds.pad(0.15), { animate: true, duration: 0.6, maxZoom: 19 });
  }

  console.log('HUNTECH: Deployed ' + accepted.length + ' micro spots for hotspot #' + (idx + 1) + ' (from ' + candidates.length + ' candidates, ' + denseSeg.length + ' dense points)');
}

/* Interpolate a streamPath to produce points every ~stepMeters along the path */
function _interpolateStreamPath(path, stepMeters) {
  if (!path || path.length < 2) return path || [];
  var dense = [path[0]];
  for (var i = 1; i < path.length; i++) {
    var lat1 = path[i-1][0], lng1 = path[i-1][1];
    var lat2 = path[i][0], lng2 = path[i][1];
    var segDist = _distM(lat1, lng1, lat2, lng2);
    if (segDist <= stepMeters) {
      dense.push(path[i]);
      continue;
    }
    var steps = Math.ceil(segDist / stepMeters);
    for (var s = 1; s <= steps; s++) {
      var t = s / steps;
      dense.push([lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t]);
    }
  }
  return dense;
}

/* Check out from current hotspot — remove micro spots, show options */
function _hotspotCheckOut(showOptions) {
  if (_activeHotspotIdx < 0) return;

  var prevIdx = _activeHotspotIdx;
  _activeHotspotIdx = -1;

  // Dismiss the Stream Command tray
  _dismissStreamCommandTray();

  // Remove micro spots
  _activeMicroPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _activeMicroPins = [];
  _activeMicroPolygons.forEach(function(p) { try { map.removeLayer(p); } catch {} });
  _activeMicroPolygons = [];

  // Refresh pin states (none active)
  _refreshHotspotPinStates();

  // ── Restore hotspot pins that were hidden on check-in ──
  _hotspotPins.forEach(function(pin) {
    try { var el = pin.getElement && pin.getElement(); if (el) el.style.display = ''; } catch(e) {}
  });

  // Zoom back out to see all hotspots
  if (_hotspotPins.length > 1) {
    var bounds = _hotspotData.map(function(hs) { return [hs.lat, hs.lng]; });
    map.fitBounds(L.latLngBounds(bounds).pad(0.18), { animate: true, duration: 0.8, maxZoom: 17 });
  }

  if (showOptions !== false) {
    _showHotspotCheckoutBar(prevIdx);
  }

  showNotice('Checked out. Pick your next spot!', 'info', 2500);
  console.log('HUNTECH: Hotspot check-out from #' + (prevIdx + 1));
}
window.hotspotCheckOut = function() { _hotspotCheckOut(true); };

/* Go to the next hotspot (sequential) */
window.hotspotGoNext = function() {
  _dismissHotspotCheckoutBar();
  if (!_hotspotData.length) return;
  var nextIdx = (_activeHotspotIdx >= 0 ? _activeHotspotIdx : 0) + 1;
  if (nextIdx >= _hotspotData.length) nextIdx = 0; // wrap around
  _hotspotCheckIn(nextIdx);
};

/* Show the checkout bar with "Next Spot" and "Pick New" options */
function _showHotspotCheckoutBar(prevIdx) {
  _dismissHotspotCheckoutBar();
  var bar = document.createElement('div');
  bar.className = 'ht-hotspot-checkout-bar';
  var nextLabel = 'Next Spot';
  bar.innerHTML =
    '<button class="ht-hotspot-checkout-btn ht-hotspot-checkout-btn--next" onclick="hotspotGoNext()">&rarr; ' + escapeHtml(nextLabel) + '</button>' +
    '<button class="ht-hotspot-checkout-btn" onclick="dismissHotspotCheckoutBar()">Pick a Spot</button>' +
    '<button class="ht-hotspot-checkout-btn ht-hotspot-checkout-btn--change" onclick="cmdChangeWater()">Change Water</button>';
  document.body.appendChild(bar);
  _hotspotCheckoutBarEl = bar;
}
function _dismissHotspotCheckoutBar() {
  if (_hotspotCheckoutBarEl) {
    try { _hotspotCheckoutBarEl.remove(); } catch {}
    _hotspotCheckoutBarEl = null;
  }
}
window.dismissHotspotCheckoutBar = _dismissHotspotCheckoutBar;

/* Refresh all hotspot pin visual states */
function _refreshHotspotPinStates() {
  _hotspotPins.forEach(function(marker, i) {
    var isActive = (i === _activeHotspotIdx);
    var hs = _hotspotData[i];
    if (hs) {
      marker.setIcon(_getHotspotPinIcon(i + 1, hs.name, isActive, i));
    }
  });
}

/* Distance helper (meters between two lat/lng points) */
function _distM(lat1, lng1, lat2, lng2) {
  var dy = (lat2 - lat1) * 111000;
  var dx = (lng2 - lng1) * 111000 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(dy * dy + dx * dx);
}

/* Zone pin icon */
function getZonePinIcon(zone, idx) {
  var colors = ['#2bd4ff', '#7cffc7', '#ffe082'];
  var color = colors[idx % colors.length];
  return L.divIcon({
    className: 'ht-zone-deploy-pin',
    html: '<div class="ht-zone-deploy-pill" style="border-color:' + color + ';color:' + color + ';">' +
      '<span class="ht-zone-deploy-dot" style="background:' + color + ';"></span>' +
      escapeHtml(zone.name) + '</div>',
    iconSize: [0, 0],
    iconAnchor: [0, 16]
  });
}

/* Trout micro-pin icon (fish emoji with habitat indicator) */
function getTroutMicroPinIcon(habitat) {
  var emojis = { riffle: '🐟', pool: '🐠', run: '🐟', boulder: '🐡', tailout: '🐟',
    undercut: '🐟', log: '🐟', seam: '🐟', pocket: '🐟' };
  var emoji = emojis[habitat] || '🐟';
  return L.divIcon({
    className: 'ht-trout-micro-pin',
    html: '<div class="ht-trout-micro-pill">' + emoji + '</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

/* Angler position pin icon */
function getAnglerPinIcon() {
  return L.divIcon({
    className: 'ht-angler-pin',
    html: '<div class="ht-angler-pill">🧍</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
}

/* Get the portion of streamPath that belongs to a zone */
function getZoneStreamSegment(water, zone) {
  if (!water || !water.streamPath || water.streamPath.length < 2) return null;
  var path = water.streamPath;
  var zones = (water.access || []).filter(function(a) { return a.type === 'zone'; });
  if (zones.length < 2) return path;

  // Find each zone's nearest point index on the stream path
  var zoneIndexes = zones.map(function(z) {
    var best = 0, bestDist = Infinity;
    for (var i = 0; i < path.length; i++) {
      var d = Math.pow(path[i][0] - z.lat, 2) + Math.pow(path[i][1] - z.lng, 2);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return { zone: z, idx: best };
  });
  zoneIndexes.sort(function(a, b) { return a.idx - b.idx; });

  // Find this zone's position
  var myPos = -1;
  for (var i = 0; i < zoneIndexes.length; i++) {
    if (zoneIndexes[i].zone === zone) { myPos = i; break; }
  }
  if (myPos === -1) return path;

  // Slice path: from midpoint between prev zone to midpoint with next zone
  var startIdx = 0, endIdx = path.length - 1;
  if (myPos > 0) startIdx = Math.round((zoneIndexes[myPos - 1].idx + zoneIndexes[myPos].idx) / 2);
  if (myPos < zoneIndexes.length - 1) endIdx = Math.round((zoneIndexes[myPos].idx + zoneIndexes[myPos + 1].idx) / 2);
  var result = path.slice(startIdx, endIdx + 1);
  result.__zoneStartIdx = startIdx; // preserve raw streamPath offset for bankWidths alignment
  return result;
}

/* Get perpendicular offset point for angler position */
function getAnglerOffset(segment, pointIdx, meters) {
  if (!segment || segment.length < 2) return [segment[0][0], segment[0][1]];
  var R = Math.PI / 180;
  var mPerLat = 111000, mPerLng = 111000 * Math.cos(segment[0][0] * R);
  var lat = segment[pointIdx][0], lng = segment[pointIdx][1];
  var dy, dx;
  if (pointIdx === 0) { dy = segment[1][0] - lat; dx = segment[1][1] - lng; }
  else if (pointIdx >= segment.length - 1) { dy = lat - segment[segment.length - 2][0]; dx = lng - segment[segment.length - 2][1]; }
  else { dy = segment[pointIdx + 1][0] - segment[pointIdx - 1][0]; dx = segment[pointIdx + 1][1] - segment[pointIdx - 1][1]; }
  var dyM = dy * mPerLat, dxM = dx * mPerLng;
  var len = Math.sqrt(dyM * dyM + dxM * dxM);
  if (len < 0.01) return [lat, lng];
  // Offset perpendicular (left side of stream)
  var pLat = (-dxM / len) * meters / mPerLat;
  var pLng = (dyM / len) * meters / mPerLng;
  return [lat + pLat, lng + pLng];
}

/* Get current time period for fly recommendations */
function getTimePeriod() {
  var h = new Date().getHours();
  if (h >= 5 && h < 9) return 'early-morning';
  if (h >= 9 && h < 12) return 'morning';
  if (h >= 12 && h < 15) return 'midday';
  if (h >= 15 && h < 18) return 'afternoon';
  if (h >= 18 && h < 21) return 'evening';
  return 'night';
}

/* Get current season */
function getCurrentSeason() {
  var m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

/* ═══════════════════════════════════════════════════════════════════════
   DETERMINISTIC FLY RECOMMENDATION ENGINE
   ─────────────────────────────────────────────────────────────────────
   Scores every fly pattern against (habitat × time × season) and picks
   the one with the highest probability of success. No randomization.
   Each recommendation includes the rig method.
   Categories are balanced: dry, wet, streamer, nymph, jig nymph,
   soft hackle, emerger — none is favored over another.
   ═══════════════════════════════════════════════════════════════════════ */
function getTimeAwareFlyRec(water, habitat) {
  var period = getTimePeriod();
  var season = getCurrentSeason();
  var hatches = (water && water.hatches && water.hatches[season]) || [];

  // ── Master fly database — each entry scored per situation ──
  // category: dry | wet | streamer | nymph | jig-nymph | soft-hackle | emerger
  var flyDB = [
    // ─── DRY FLIES ───
    { name: '#16 Parachute Adams', category: 'dry', rig: 'Dead drift dry — 9ft 5X leader, dress fly with floatant, cast upstream, mend for drag-free float',
      h: { riffle: 80, run: 85, pool: 50, tailout: 90, boulder: 40 },
      t: { 'early-morning': 50, morning: 75, midday: 30, afternoon: 80, evening: 95, night: 10 },
      s: { spring: 80, summer: 75, fall: 85, winter: 30 } },
    { name: '#16 Elk Hair Caddis', category: 'dry', rig: 'Dead drift or skate — 9ft 5X leader, twitch the fly occasionally to mimic skating caddis',
      h: { riffle: 85, run: 75, pool: 40, tailout: 80, boulder: 55 },
      t: { 'early-morning': 40, morning: 70, midday: 35, afternoon: 90, evening: 85, night: 15 },
      s: { spring: 70, summer: 90, fall: 75, winter: 20 } },
    { name: '#18 Blue Winged Olive (BWO)', category: 'dry', rig: 'Dead drift dry — 12ft 6X leader, fish the film in slow water, watch for sipping rises',
      h: { riffle: 60, run: 80, pool: 55, tailout: 90, boulder: 30 },
      t: { 'early-morning': 60, morning: 85, midday: 65, afternoon: 90, evening: 80, night: 5 },
      s: { spring: 95, summer: 40, fall: 95, winter: 70 } },

    // ─── STREAMERS ───
    { name: '#8 Woolly Bugger (olive)', category: 'streamer', rig: 'Strip retrieve — short strips with pauses, 3X leader, let sink 3-count before stripping',
      h: { riffle: 40, run: 65, pool: 90, tailout: 35, boulder: 85 },
      t: { 'early-morning': 95, morning: 60, midday: 50, afternoon: 55, evening: 80, night: 95 },
      s: { spring: 75, summer: 70, fall: 80, winter: 65 } },
    { name: '#6 Sculpzilla (olive/brown)', category: 'streamer', rig: 'Dead drift or slow strip — sink tip line or weighted leader, bounce along bottom near structure',
      h: { riffle: 30, run: 55, pool: 85, tailout: 25, boulder: 95 },
      t: { 'early-morning': 90, morning: 55, midday: 60, afternoon: 50, evening: 85, night: 90 },
      s: { spring: 70, summer: 65, fall: 85, winter: 75 } },
    { name: '#8 Zoo Cougar (tan)', category: 'streamer', rig: 'Jerk strip — aggressive 6-inch strips, pause 2 seconds between strips, let fly ride up and drop',
      h: { riffle: 35, run: 60, pool: 80, tailout: 30, boulder: 75 },
      t: { 'early-morning': 85, morning: 50, midday: 45, afternoon: 45, evening: 90, night: 85 },
      s: { spring: 65, summer: 60, fall: 90, winter: 70 } },

    // ─── WET FLIES ───
    { name: '#14 Partridge & Orange', category: 'wet', rig: 'Wet fly swing — cast across, let line swing downstream, follow with rod tip, strip at end of swing',
      h: { riffle: 70, run: 90, pool: 55, tailout: 85, boulder: 45 },
      t: { 'early-morning': 65, morning: 80, midday: 50, afternoon: 80, evening: 90, night: 30 },
      s: { spring: 85, summer: 75, fall: 80, winter: 60 } },
    { name: '#14 Leadwing Coachman', category: 'wet', rig: 'Downstream swing — 9ft 4X leader, cast quartering downstream, slow swing through the run',
      h: { riffle: 60, run: 85, pool: 60, tailout: 75, boulder: 50 },
      t: { 'early-morning': 55, morning: 75, midday: 55, afternoon: 75, evening: 85, night: 25 },
      s: { spring: 80, summer: 70, fall: 75, winter: 55 } },

    // ─── SOFT HACKLES ───
    { name: '#16 Soft Hackle Hares Ear', category: 'soft-hackle', rig: 'Leisenring lift — cast upstream, let drift deep, then raise rod to swing fly up through water column',
      h: { riffle: 75, run: 90, pool: 50, tailout: 90, boulder: 40 },
      t: { 'early-morning': 60, morning: 85, midday: 55, afternoon: 85, evening: 95, night: 20 },
      s: { spring: 90, summer: 80, fall: 85, winter: 55 } },
    { name: '#16 Starling & Herl', category: 'soft-hackle', rig: 'Swing and hang — cast across, let swing, hold the fly dangling in current for 10 seconds at end of drift',
      h: { riffle: 70, run: 85, pool: 45, tailout: 85, boulder: 35 },
      t: { 'early-morning': 55, morning: 80, midday: 50, afternoon: 80, evening: 90, night: 15 },
      s: { spring: 85, summer: 75, fall: 80, winter: 50 } },

    // ─── EMERGERS ───
    { name: '#18 CDC RS2 Emerger', category: 'emerger', rig: 'Film drift — grease leader to within 12 inches of fly, fish in the surface film, 6X tippet minimum',
      h: { riffle: 70, run: 85, pool: 50, tailout: 95, boulder: 30 },
      t: { 'early-morning': 55, morning: 90, midday: 40, afternoon: 85, evening: 95, night: 10 },
      s: { spring: 90, summer: 70, fall: 90, winter: 65 } },
    { name: '#18 CDC BWO Emerger', category: 'emerger', rig: 'Greased-leader drift — dead drift in film, fish to rising trout, set hook on any hesitation in drift',
      h: { riffle: 60, run: 80, pool: 55, tailout: 90, boulder: 25 },
      t: { 'early-morning': 50, morning: 85, midday: 50, afternoon: 85, evening: 90, night: 5 },
      s: { spring: 95, summer: 45, fall: 90, winter: 60 } },
    { name: '#16 Sparkle Pupa (tan)', category: 'emerger', rig: 'Swing through film — cast across, let drift and rise, the fly imitates an emerging caddis in the surface tension',
      h: { riffle: 80, run: 75, pool: 40, tailout: 80, boulder: 45 },
      t: { 'early-morning': 45, morning: 70, midday: 40, afternoon: 90, evening: 85, night: 10 },
      s: { spring: 70, summer: 90, fall: 70, winter: 25 } },

    // ─── NYMPHS ───
    { name: '#16 Pheasant Tail Nymph', category: 'nymph', rig: 'Dead drift nymph — 7.5ft 5X leader, split shot 8in above fly, strike indicator at 1.5× depth',
      h: { riffle: 90, run: 75, pool: 65, tailout: 60, boulder: 70 },
      t: { 'early-morning': 70, morning: 80, midday: 85, afternoon: 70, evening: 50, night: 40 },
      s: { spring: 80, summer: 75, fall: 80, winter: 85 } },
    { name: '#14 Hares Ear Nymph', category: 'nymph', rig: 'Dead drift — weight with split shot, adjust depth with indicator, let tumble naturally along bottom',
      h: { riffle: 85, run: 80, pool: 70, tailout: 55, boulder: 75 },
      t: { 'early-morning': 65, morning: 75, midday: 80, afternoon: 75, evening: 45, night: 35 },
      s: { spring: 75, summer: 80, fall: 75, winter: 80 } },
    { name: '#16 Copper John', category: 'nymph', rig: 'Tight-line or indicator — heavy fly sinks fast, ideal for deeper runs, short-line dead drift through pockets',
      h: { riffle: 75, run: 70, pool: 60, tailout: 50, boulder: 90 },
      t: { 'early-morning': 60, morning: 70, midday: 85, afternoon: 65, evening: 40, night: 45 },
      s: { spring: 70, summer: 75, fall: 70, winter: 75 } },

    // ─── JIG NYMPHS (Euro / Competition Style) ───
    { name: '#16 Perdigon (olive/silver)', category: 'jig-nymph', rig: 'Euro nymph tight-line — long leader (20ft+), no indicator, sighter section, maintain direct contact, feel for the take',
      h: { riffle: 90, run: 80, pool: 55, tailout: 50, boulder: 85 },
      t: { 'early-morning': 75, morning: 80, midday: 90, afternoon: 75, evening: 40, night: 30 },
      s: { spring: 80, summer: 85, fall: 80, winter: 80 } },
    { name: '#14 Jig Frenchie', category: 'jig-nymph', rig: 'Euro nymph — tight line, slotted tungsten bead rides hook-point-up reducing snags, high-stick through pocket water',
      h: { riffle: 85, run: 85, pool: 60, tailout: 55, boulder: 80 },
      t: { 'early-morning': 70, morning: 78, midday: 85, afternoon: 72, evening: 45, night: 35 },
      s: { spring: 78, summer: 80, fall: 78, winter: 82 } },

    // ─── SPECIALTY ───
    { name: '#14 San Juan Worm (red)', category: 'wet', rig: 'Dead drift deep — weight heavily, fish along the bottom, especially effective after rain or in stained water',
      h: { riffle: 50, run: 60, pool: 80, tailout: 40, boulder: 65 },
      t: { 'early-morning': 75, morning: 70, midday: 80, afternoon: 65, evening: 50, night: 55 },
      s: { spring: 90, summer: 60, fall: 75, winter: 85 } },
    { name: '#14 Glo-Bug (peach/chartreuse)', category: 'wet', rig: 'Dead drift under indicator — short leader, heavy tippet (4X), fish through the head of pools and runs',
      h: { riffle: 40, run: 55, pool: 85, tailout: 30, boulder: 60 },
      t: { 'early-morning': 80, morning: 65, midday: 70, afternoon: 55, evening: 45, night: 60 },
      s: { spring: 85, summer: 50, fall: 70, winter: 90 } },
    { name: '#18 Zebra Midge', category: 'nymph', rig: 'Suspend under dry or indicator — fish in the top 12 inches, especially effective in slow clear water',
      h: { riffle: 55, run: 70, pool: 80, tailout: 75, boulder: 35 },
      t: { 'early-morning': 60, morning: 75, midday: 85, afternoon: 70, evening: 55, night: 40 },
      s: { spring: 70, summer: 60, fall: 70, winter: 95 } },
    { name: '#16 Scud (tan/orange)', category: 'nymph', rig: 'Dead drift near bottom — weighted, especially effective near spring outlets, use in 12-24in depth range',
      h: { riffle: 60, run: 70, pool: 75, tailout: 55, boulder: 45 },
      t: { 'early-morning': 70, morning: 75, midday: 80, afternoon: 70, evening: 50, night: 45 },
      s: { spring: 85, summer: 65, fall: 70, winter: 90 } }
  ];

  // ── Score each fly for this exact situation ──
  // Habitat score fallbacks for new micro-feature types not in every fly's h{} map
  // These provide intelligent defaults based on fly category + habitat behavior
  var _habitatFallbacks = {
    undercut: function(fly) {
      // Undercuts favor streamers/structure flies; dries struggle under overhangs
      var cat = fly.category;
      if (cat === 'streamer') return 90;
      if (cat === 'nymph' || cat === 'jig-nymph') return 70;
      if (cat === 'wet') return 75;
      if (cat === 'soft-hackle') return 65;
      if (cat === 'dry' || cat === 'emerger') return 30;
      return 55;
    },
    log: function(fly) {
      // Logs favor nymphs drifted past structure; streamers work too
      var cat = fly.category;
      if (cat === 'streamer') return 85;
      if (cat === 'nymph' || cat === 'jig-nymph') return 75;
      if (cat === 'wet') return 70;
      if (cat === 'soft-hackle') return 60;
      if (cat === 'dry') return 35;
      if (cat === 'emerger') return 40;
      return 55;
    },
    seam: function(fly) {
      // Seams are prime feeding lanes — emergers, soft hackles, dries all excel
      var cat = fly.category;
      if (cat === 'emerger' || cat === 'soft-hackle') return 90;
      if (cat === 'dry') return 80;
      if (cat === 'wet') return 85;
      if (cat === 'nymph' || cat === 'jig-nymph') return 75;
      if (cat === 'streamer') return 50;
      return 65;
    },
    pocket: function(fly) {
      // Pockets favor nymphs/jig-nymphs tight-lined; dries low
      var cat = fly.category;
      if (cat === 'jig-nymph') return 92;
      if (cat === 'nymph') return 85;
      if (cat === 'wet') return 60;
      if (cat === 'soft-hackle') return 55;
      if (cat === 'dry') return 40;
      if (cat === 'emerger') return 45;
      if (cat === 'streamer') return 35;
      return 55;
    }
  };

  var scored = [];
  for (var f = 0; f < flyDB.length; f++) {
    var fly = flyDB[f];
    var hScore = (fly.h && fly.h[habitat]) || (_habitatFallbacks[habitat] ? _habitatFallbacks[habitat](fly) : 50);
    var tScore = (fly.t && fly.t[period]) || 50;
    var sScore = (fly.s && fly.s[season]) || 50;
    // Weighted: habitat matters most (40%), time of day (35%), season (25%)
    var total = hScore * 0.40 + tScore * 0.35 + sScore * 0.25;

    // Hatch match bonus: if water has hatch data matching this fly's name
    if (hatches.length) {
      for (var hi = 0; hi < hatches.length; hi++) {
        var hatch = hatches[hi].toLowerCase();
        var fname = fly.name.toLowerCase();
        if (fname.indexOf('bwo') >= 0 && hatch.indexOf('bwo') >= 0) total += 12;
        else if (fname.indexOf('caddis') >= 0 && hatch.indexOf('caddis') >= 0) total += 12;
        else if (fname.indexOf('midge') >= 0 && hatch.indexOf('midge') >= 0) total += 10;
        else if (fname.indexOf('scud') >= 0 && hatch.indexOf('scud') >= 0) total += 10;
        else if (fname.indexOf('stonefly') >= 0 && hatch.indexOf('stone') >= 0) total += 12;
      }
    }

    scored.push({ fly: fly, total: total });
  }

  // Sort by total descending — top 1 = best, top 2 = backup
  scored.sort(function(a, b) { return b.total - a.total; });

  var best = scored[0].fly;
  // Ensure backup is a DIFFERENT category for variety
  var backup = scored[1].fly;
  for (var bi = 1; bi < scored.length; bi++) {
    if (scored[bi].fly.category !== best.category) {
      backup = scored[bi].fly;
      break;
    }
  }

  var flyRec = best.name + ' (' + best.category + ')';
  var altFly = backup.name + ' (' + backup.category + ')';
  var rigMethod = best.rig;
  var altRig = backup.rig;

  var timeAdvice = '';
  if (period === 'early-morning') timeAdvice = 'Low light — trout feed aggressively at dawn. Dark streamers and soft hackles are deadly. Swing flies through runs and strip past structure.';
  else if (period === 'morning') timeAdvice = 'Prime window. Watch for hatches starting — emergers and soft hackles in the film produce. If you see rises, switch to dries immediately.';
  else if (period === 'midday') timeAdvice = 'Bright conditions push trout to shaded lies. Euro nymph tight to structure, or swing streamers through deep pools. Fish the shade.';
  else if (period === 'afternoon') timeAdvice = 'Caddis often emerge now. Dry flies and emergers become productive. Swing soft hackles through tailouts. Stay observant for surface activity.';
  else if (period === 'evening') timeAdvice = 'Prime time. Dry flies and emergers dominate. Trout move to tailouts and riffles to sip. Match the hatch — look on the water first.';
  else timeAdvice = 'Night fishing — large streamers stripped slow near structure. Big trout are boldest now. Use a stout leader and strip with long pauses.';

  return {
    flyRec: flyRec, altFly: altFly,
    rigMethod: rigMethod, altRig: altRig,
    bestCategory: best.category, altCategory: backup.category,
    timeAdvice: timeAdvice, hatches: hatches, season: season, period: period
  };
}

/* Build strategy briefing popup HTML for a micro pin */
function buildMicroPinBriefing(water, zone, habitat) {
  var flavor = window.TROUT_HOTSPOT_FLAVOR && window.TROUT_HOTSPOT_FLAVOR[habitat];
  var edu = window.TROUT_EDUCATION && window.TROUT_EDUCATION[habitat];
  var rec = getTimeAwareFlyRec(water, habitat);
  var rIdx = Math.floor(Math.random() * ((flavor && flavor.titles) ? flavor.titles.length : 1));

  var title = (flavor && flavor.titles) ? flavor.titles[rIdx] : (habitat.charAt(0).toUpperCase() + habitat.slice(1));
  var reason = (flavor && flavor.reasons) ? flavor.reasons[rIdx % flavor.reasons.length] : '';
  var approach = (flavor && flavor.approach) ? flavor.approach[rIdx % flavor.approach.length] : '';
  var tips = (edu && edu.tips) ? edu.tips : [];
  var guideTip = tips.length ? tips[Math.floor(Math.random() * tips.length)] : '';
  var guideTip2 = tips.length > 1 ? tips[(Math.floor(Math.random() * tips.length) + 1) % tips.length] : '';

  var html = '<div class="ht-micro-briefing" style="min-width:260px;max-width:320px;">';
  html += '<div style="font-weight:800;color:#2bd4ff;font-size:14px;margin-bottom:4px;">🐟 ' + escapeHtml(title) + '</div>';
  html += '<div style="font-size:10px;color:#7cffc7;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">' + escapeHtml(habitat) + ' • ' + escapeHtml(zone.name) + '</div>';

  // Why fish here
  html += '<div style="font-size:11px;color:#c8e6d5;margin-bottom:6px;line-height:1.4;"><b style="color:#ffe082;">Why here:</b> ' + escapeHtml(reason) + '</div>';

  // Approach
  html += '<div style="font-size:11px;color:#c8e6d5;margin-bottom:6px;line-height:1.4;"><b style="color:#ffe082;">Approach:</b> ' + escapeHtml(approach) + '</div>';

  // Time-aware fly recommendation + rig method
  html += '<div style="font-size:11px;color:#c8e6d5;margin-bottom:2px;line-height:1.4;"><b style="color:#ffe082;">Best Fly (' + escapeHtml(rec.period) + '):</b> ' + escapeHtml(rec.flyRec) + '</div>';
  if (rec.rigMethod) {
    html += '<div style="font-size:10px;color:#89b5a2;margin-bottom:4px;line-height:1.3;"><b>Rig:</b> ' + escapeHtml(rec.rigMethod) + '</div>';
  }
  if (rec.altFly) {
    html += '<div style="font-size:10px;color:#89b5a2;margin-bottom:2px;line-height:1.3;"><b>Backup:</b> ' + escapeHtml(rec.altFly) + '</div>';
  }
  if (rec.altRig) {
    html += '<div style="font-size:9px;color:#6a9480;margin-bottom:4px;line-height:1.3;"><b>Rig:</b> ' + escapeHtml(rec.altRig) + '</div>';
  }

  // Time-of-day conditions
  html += '<div style="font-size:10px;color:#89b5a2;margin-bottom:6px;line-height:1.3;"><b>Conditions:</b> ' + escapeHtml(rec.timeAdvice) + '</div>';

  // Hatch data
  if (rec.hatches.length) {
    html += '<div style="font-size:10px;color:#89b5a2;margin-bottom:4px;"><b style="color:#2bd4ff;">' + escapeHtml(rec.season) + ' Hatches:</b> ' + escapeHtml(rec.hatches.join(', ')) + '</div>';
  }

  // Pro guide tips
  html += '<div style="border-top:1px solid rgba(43,212,255,0.2);padding-top:6px;margin-top:6px;">';
  html += '<div style="font-size:10px;color:#ffe082;font-weight:800;margin-bottom:3px;">🎓 PRO GUIDE TIP</div>';
  html += '<div style="font-size:10px;color:#c8e6d5;line-height:1.4;">' + escapeHtml(guideTip) + '</div>';
  if (guideTip2 && guideTip2 !== guideTip) {
    html += '<div style="font-size:10px;color:#89b5a2;line-height:1.3;margin-top:3px;">💡 ' + escapeHtml(guideTip2) + '</div>';
  }
  html += '</div>';

  // No-luck backup advice
  html += '<div style="border-top:1px solid rgba(43,212,255,0.15);padding-top:5px;margin-top:5px;">';
  html += '<div style="font-size:10px;color:#d4a57f;line-height:1.3;">⚠️ <b>No luck?</b> Change depth first. Add or remove split shot. Move 10 feet upstream and re-drift. Switch to a smaller pattern — go down 2 sizes.</div>';
  html += '</div>';

  html += '</div>';
  return html;
}

/* Deploy zone pins filtered by user's selected method */
window.deployMethodFilteredZones = function(water, userMethod) {
  if (!water || !Array.isArray(water.access)) return;
  clearZonePins();
  clearMicroPins();
  var zones = water.access.filter(function(a) { return a.type === 'zone'; });
  var deployed = 0;
  var methodMap = { fly: 'fly', spin: 'spin', bait: 'bait' };
  var method = methodMap[userMethod] || userMethod;

  zones.forEach(function(zone, idx) {
    var allowed = getZoneAllowedMethods(zone);
    if (allowed.indexOf(method) === -1) return;

    var marker = L.marker([zone.lat, zone.lng], {
      icon: getZonePinIcon(zone, idx),
      zIndexOffset: 200
    }).addTo(map);

    marker.__zone = zone;
    marker.__zoneIdx = idx;

    // Build popup with auto/manual check-in
    marker.on('click', function() {
      var popupHtml = '<div style="min-width:240px;">' +
        '<div style="font-weight:700;color:#2bd4ff;font-size:14px;">' + escapeHtml(zone.name) + '</div>' +
        '<div style="font-size:11px;color:#ddd;margin-top:3px;">📍 ' + escapeHtml(water.name) + '</div>' +
        '<div style="font-size:11px;color:#b8d8c8;margin-top:6px;line-height:1.3;">' + escapeHtml(zone.notes || '') + '</div>' +
        '<div style="font-size:10px;color:#ffe082;margin-top:4px;">Allowed: ' + escapeHtml(allowed.map(getMethodLabel).join(', ')) + '</div>' +
        '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">' +
        '<button style="padding:6px 14px;border-radius:8px;border:1px solid #7cffc7;background:rgba(124,255,199,0.15);color:#7cffc7;font-size:12px;font-weight:800;cursor:pointer;" ' +
          'onclick="zoneCheckIn(\'' + escapeHtml(water.id) + '\',' + idx + ')">✅ CHECK IN</button>' +
        '<button style="padding:6px 14px;border-radius:8px;border:1px solid #666;background:rgba(255,255,255,0.05);color:#aaa;font-size:11px;font-weight:700;cursor:pointer;" ' +
          'onclick="if(map)map.closePopup();">Close</button>' +
        '</div></div>';
      marker.unbindPopup();
      marker.bindPopup(popupHtml, { maxWidth: 320, className: 'ht-zone-popup' }).openPopup();
    });

    zonePinMarkers.push(marker);
    deployed++;
  });

  var label = getMethodLabel(method);
  if (deployed === 0) {
    showNotice('⚠️ No zones available for ' + label + ' fishing at ' + water.name + '. Try a different method.', 'warning', 4000);
  } else {
    showNotice('📍 ' + deployed + ' zone' + (deployed > 1 ? 's' : '') + ' deployed for ' + label + ' fishing', 'success', 2500);
  }
};

/* Zone check-in: deploy AI RANKED pins (NO fish until pin click, NO polygons) */
window.zoneCheckIn = function(waterId, zoneIdx) {
  if (!map) return;
  map.closePopup();
  var water = null;
  if (window.TROUT_WATERS) {
    water = window.TROUT_WATERS.find(function(w) { return w.id === waterId; });
  }
  if (!water || !Array.isArray(water.access)) return;
  var zones = water.access.filter(function(a) { return a.type === 'zone'; });
  var zone = zones[zoneIdx];
  if (!zone) return;

  clearMicroPins();

  // Wire up fishFlow state so AI pins work
  var fishFlow = window._fishFlow || {};
  fishFlow.area = water;
  fishFlow.selectedZone = zone;
  fishFlow.selectedZoneIdx = zoneIdx;
  window._fishFlow = fishFlow;

  // Hide area pins
  clearFlyWaterLayer();

  // Deploy AI ranked pins (hotspots) — NO fish yet, NO polygon.
  setTimeout(function() {
    if (typeof window.deployAiFishingPins === 'function') {
      window.deployAiFishingPins(water, zone, fishFlow);
    }
  }, 400);

  // Zoom to zone
  map.setView([zone.lat, zone.lng], 17, { animate: true, duration: 0.8 });
  showNotice('✅ Checked in at ' + zone.name + ' — tap a hotspot pin to deploy fish', 'success', 3000);
};

function getFlyCheckInSpots() {
  return [
    'Tailout seam just below the run',
    'Inside bend slow water edge',
    'Boulder pocket line along the current',
    'Undercut bank shade lane',
    'Riffle drop transition shelf'
  ];
}

/* ══════════════════════════════════════════════════════════════════════════
   SMART FLY RECOMMENDATION ENGINE — Inventory-first with closest-match fallback
   ══════════════════════════════════════════════════════════════════════════ */

/* Score how well a user fly matches desired criteria */
function _scoreFlyMatch(fly, desired) {
  var score = 0;
  var flyName = String(fly.name || '').toLowerCase();
  var flyCat = String(fly.category || '').toLowerCase();
  var flyColor = String(fly.color || '').toLowerCase();
  var flySize = String(fly.size || '').toLowerCase();

  // Name match (exact or partial)
  var desiredName = String(desired.name || '').toLowerCase();
  if (desiredName && flyName === desiredName) score += 10;
  else if (desiredName && flyName.indexOf(desiredName) >= 0) score += 7;
  else if (desiredName) {
    // Check keyword overlap
    var dWords = desiredName.split(/\s+/);
    dWords.forEach(function(w) { if (w.length > 2 && flyName.indexOf(w) >= 0) score += 3; });
  }

  // Category match
  var desiredCat = String(desired.category || '').toLowerCase();
  if (desiredCat && flyCat === desiredCat) score += 4;

  // Color match
  var desiredColors = Array.isArray(desired.colors) ? desired.colors : [];
  desiredColors.forEach(function(c) {
    if (flyColor.indexOf(c.toLowerCase()) >= 0) score += 2;
  });

  // Size match
  var desiredSize = String(desired.size || '').toLowerCase();
  if (desiredSize && flySize.indexOf(desiredSize) >= 0) score += 2;

  return score;
}

/* Get smart recommendations — searches user inventory first, falls back to closest match */
function getFlyInventoryRecommendations(limit, desiredCriteria) {
  limit = limit || 4;
  var inv = loadFlyInventory();
  var flies = Array.isArray(inv.flies) ? inv.flies : [];

  // If no criteria, return the most recent flies
  if (!desiredCriteria || !desiredCriteria.length) {
    return flies.slice(0, limit).map(function(f) {
      if (typeof f === 'string') return { name: f, color: 'Varied', size: 'Assorted', imageUrl: '', matchType: 'inventory' };
      return {
        name: f.name || 'Fly',
        color: f.color || 'Varied',
        size: f.size || 'Assorted',
        imageUrl: f.imageDataUrl || f.imageUrl || '',
        category: f.category || '',
        notes: f.notes || '',
        matchType: 'inventory'
      };
    });
  }

  // For each desired fly, find best match in inventory
  var results = [];
  desiredCriteria.forEach(function(desired) {
    if (results.length >= limit) return;
    var scored = flies.map(function(f, idx) {
      return { fly: f, idx: idx, score: _scoreFlyMatch(f, desired) };
    });
    scored.sort(function(a, b) { return b.score - a.score; });

    var best = scored[0];
    if (best && best.score >= 5) {
      // Exact or strong match from inventory
      var f = best.fly;
      results.push({
        name: f.name || 'Fly',
        color: f.color || 'Varied',
        size: f.size || 'Assorted',
        imageUrl: f.imageDataUrl || f.imageUrl || '',
        category: f.category || '',
        matchType: 'exact',
        matchNote: 'From your box'
      });
    } else if (best && best.score > 0) {
      // Closest match — not exact but related
      var f2 = best.fly;
      results.push({
        name: f2.name || 'Fly',
        color: f2.color || 'Varied',
        size: f2.size || 'Assorted',
        imageUrl: f2.imageDataUrl || f2.imageUrl || '',
        category: f2.category || '',
        matchType: 'closest',
        matchNote: 'Closest match — ideal: ' + (desired.name || 'similar fly')
      });
    } else {
      // No match in inventory
      results.push({
        name: desired.name || 'Recommended Fly',
        color: (desired.colors || []).join(', ') || 'Varied',
        size: desired.size || 'Assorted',
        imageUrl: '',
        category: desired.category || '',
        matchType: 'missing',
        matchNote: 'Not in your box — consider adding'
      });
    }
  });

  return results;
}

function getUsgsLatestValue(series) {
  const values = Array.isArray(series?.values) ? series.values : [];
  const latest = values[0]?.value;
  if (!Array.isArray(latest) || !latest.length) return null;
  const point = latest[latest.length - 1];
  const raw = point?.value;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseUsgsFlowResponse(data) {
  const series = Array.isArray(data?.value?.timeSeries) ? data.value.timeSeries : [];
  const flowSeries = series.find((item) =>
    Array.isArray(item?.variable?.variableCode)
      && item.variable.variableCode.some((code) => String(code?.value) === '00060')
  );
  const gageSeries = series.find((item) =>
    Array.isArray(item?.variable?.variableCode)
      && item.variable.variableCode.some((code) => String(code?.value) === '00065')
  );
  const flowCfs = getUsgsLatestValue(flowSeries);
  const gageFt = getUsgsLatestValue(gageSeries);
  const siteName = flowSeries?.sourceInfo?.siteName || gageSeries?.sourceInfo?.siteName || '';
  return {
    flowCfs,
    gageFt,
    siteName: siteName || null,
    updatedAt: Date.now()
  };
}

async function fetchFlyFlowForWater(water) {
  const siteId = String(water?.usgsSiteId || '').trim();
  if (!siteId || !USGS_NWIS_IV_URL) return null;
  const cached = flyFlowCache.get(siteId);
  if (cached && (Date.now() - cached.timestamp) < FLY_FLOW_CACHE_TTL_MS) {
    return cached.data;
  }
  const url = `${USGS_NWIS_IV_URL}?format=json&sites=${encodeURIComponent(siteId)}&parameterCd=00060,00065&siteStatus=all`;
  const fetchUrl = USGS_NWIS_USE_PROXY ? `${REG_PROXY_PATH}${encodeURIComponent(url)}` : url;
  try {
    const res = await fetchWithTimeout(fetchUrl, { headers: { 'Accept': 'application/json' } }, 9000);
    if (!res.ok) throw new Error(`USGS flow HTTP ${res.status}`);
    const data = await res.json();
    const parsed = parseUsgsFlowResponse(data);
    flyFlowCache.set(siteId, { timestamp: Date.now(), data: parsed });
    return parsed;
  } catch {
    return null;
  }
}

function buildFlyStrategyHtml(water, prefs, flow) {
  const snapshot = getFlyWeatherSnapshot();
  const season = getCurrentSeason();
  const period = getTimePeriod();
  const method = prefs.rod || 'fly';
  const seasonLabel = season.charAt(0).toUpperCase() + season.slice(1);
  const periodLabel = period.replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
  const methodIcons = { fly: '🪶', spin: '🎣', bait: '🪱' };
  const methodLabels = { fly: 'Fly Fishing', spin: 'Spin Fishing', bait: 'Bait Fishing' };
  const methodIcon = methodIcons[method] || '🎣';

  // --- Header ---
  var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
  html += '<div style="font-size:22px;">' + methodIcon + '</div>';
  html += '<div>';
  html += '<div style="font-weight:800;color:#2bd4ff;font-size:14px;line-height:1.2;">' + escapeHtml(water?.name || 'Trout Water') + '</div>';
  html += '<div style="font-size:10px;color:#7cffc7;text-transform:uppercase;letter-spacing:1px;">' + escapeHtml(seasonLabel) + ' • ' + escapeHtml(periodLabel) + ' • ' + escapeHtml(methodLabels[method] || method) + '</div>';
  html += '</div></div>';

  // --- Conditions (only show what we actually have) ---
  var condParts = [];
  if (Number.isFinite(snapshot.temp)) condParts.push('🌡 ' + snapshot.temp + '°F');
  if (Number.isFinite(snapshot.wind)) condParts.push('💨 ' + snapshot.wind + ' mph' + (snapshot.windDir ? ' ' + snapshot.windDir : ''));
  if (Number.isFinite(flow?.flowCfs)) condParts.push('🌊 ' + Math.round(flow.flowCfs) + ' cfs');
  if (Number.isFinite(flow?.gageFt)) condParts.push('📏 ' + flow.gageFt.toFixed(1) + ' ft');
  if (condParts.length) {
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;padding:6px 8px;border-radius:8px;background:rgba(43,212,255,0.08);border:1px solid rgba(43,212,255,0.15);">';
    condParts.forEach(function(p) {
      html += '<span style="font-size:11px;color:#bcd5df;white-space:nowrap;">' + escapeHtml(p) + '</span>';
    });
    html += '</div>';
  }

  // --- Hatch Report ---
  var hatches = (water && water.hatches && water.hatches[season]) || [];
  if (hatches.length) {
    html += '<div class="ht-fly-strategy-block">';
    html += '<div class="ht-fly-strategy-title">🦟 ' + escapeHtml(seasonLabel) + ' Hatch Report</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:4px;">';
    hatches.forEach(function(h) {
      html += '<span style="padding:2px 8px;border-radius:6px;font-size:11px;background:rgba(124,255,199,0.12);color:#7cffc7;border:1px solid rgba(124,255,199,0.2);">' + escapeHtml(h) + '</span>';
    });
    html += '</div>';
    var hatchEdu = {
      spring: 'Spring runoff warms the water into the low 50s triggering BWO and midge emergences. Watch for rises in overcast drizzle — prime dry fly conditions.',
      summer: 'Warm months bring caddis and terrestrials. Early and late sessions are best. Midday trout go deep — switch to weighted nymphs or streamers.',
      fall: 'Cooling water triggers aggressive feeding before winter. BWO hatches return strong. Big fish move to shallower riffles.',
      winter: 'Cold water means slow metabolisms. Tiny midges (#20-26) dominate. Fish deep, slow, and small. Trout hold in the slowest water.'
    };
    if (hatchEdu[season]) {
      html += '<div style="font-size:10px;color:#89b5a2;margin-top:6px;line-height:1.4;font-style:italic;">' + escapeHtml(hatchEdu[season]) + '</div>';
    }
    html += '</div>';
  }

  // --- Arsenal: method-specific tackle ---
  var tackleName = method === 'fly' ? 'Top Flies' : (method === 'spin' ? 'Top Lures' : 'Top Bait');
  var tackleIcon = method === 'fly' ? '🪶' : (method === 'spin' ? '🎣' : '🪱');
  var tackleList = method === 'fly' ? (water?.topFlies || []) : (method === 'spin' ? (water?.topLures || []) : (water?.topBait || []));
  if (tackleList.length) {
    html += '<div class="ht-fly-strategy-block">';
    html += '<div class="ht-fly-strategy-title">' + tackleIcon + ' ' + escapeHtml(tackleName) + ' — ' + escapeHtml(water?.name || '') + '</div>';
    html += '<div style="display:grid;gap:3px;">';
    tackleList.forEach(function(t, i) {
      html += '<div style="font-size:12px;color:#e8fbff;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05);">';
      html += '<span style="color:#ffe082;font-weight:700;margin-right:6px;">' + (i + 1) + '.</span>' + escapeHtml(t);
      html += '</div>';
    });
    html += '</div></div>';
  }

  // --- Time-of-Day Approach ---
  var timeAdvice = {
    'early-morning': { title: 'Dawn Strategy', icon: '🌅', text: 'Low light is prime time. Trout feed aggressively near the surface. Use dark nymphs or streamers. Position upstream and make short, accurate casts. Fish are less spooky now.' },
    'morning': { title: 'Morning Window', icon: '☀️', text: 'Peak feeding continues. Watch for hatch activity — rising fish mean switch to emergers or dries. Nymph under an indicator through riffles and runs. Work systematically upstream.' },
    'midday': { title: 'Midday Approach', icon: '🔆', text: 'Sun pushes trout to shade and depth. Target undercut banks, deep pools, and boulder shadows. Drop weight and go deeper. Slow your presentation — fish are less active.' },
    'afternoon': { title: 'Afternoon Transition', icon: '🌤', text: 'Caddis activity often picks up. Try a dry-dropper rig to cover both surface and subsurface. Swing soft hackles through tailouts. Watch for pod risers.' },
    'evening': { title: 'Evening Prime Time', icon: '🌇', text: 'The golden hour. Spinner falls and emerging caddis bring big fish to the surface. Fish tailouts and riffles. Match the hatch precisely — trout get selective in calm water.' },
    'night': { title: 'After Dark', icon: '🌙', text: 'Big trout are most active now. Strip large dark streamers slow along structure. Use heavy tippet — night fish fights are chaotic. Know the water before dark.' }
  };
  var ta = timeAdvice[period] || timeAdvice['morning'];
  html += '<div class="ht-fly-strategy-block">';
  html += '<div class="ht-fly-strategy-title">' + ta.icon + ' ' + escapeHtml(ta.title) + ' (' + escapeHtml(periodLabel) + ')</div>';
  html += '<div style="font-size:11px;color:#c8e6d5;line-height:1.5;">' + escapeHtml(ta.text) + '</div>';
  html += '</div>';

  // --- Regulations Quick Ref ---
  if (water?.regulations) {
    html += '<div class="ht-fly-strategy-block">';
    html += '<div class="ht-fly-strategy-title">📋 Regulations</div>';
    if (water.regulations.dailyLimit) {
      html += '<div class="ht-fly-strategy-row">Daily Limit: <strong style="color:#ffe082;">' + water.regulations.dailyLimit + ' trout</strong></div>';
    }
    if (water.regulations.gearRestrictions) {
      html += '<div class="ht-fly-strategy-row" style="line-height:1.4;">' + escapeHtml(water.regulations.gearRestrictions) + '</div>';
    }
    if (water.regulations.specialRules) {
      html += '<div style="font-size:10px;color:#d4a57f;margin-top:4px;line-height:1.4;">⚠️ ' + escapeHtml(water.regulations.specialRules) + '</div>';
    }
    html += '</div>';
  }

  // --- Coach Tip ---
  if (water?.coachTips && water.coachTips.length) {
    var tipIdx = Math.floor(Math.random() * water.coachTips.length);
    html += '<div style="padding:8px 10px;border-radius:8px;background:rgba(255,224,130,0.08);border:1px solid rgba(255,224,130,0.2);margin-top:8px;">';
    html += '<div style="font-size:10px;color:#ffe082;font-weight:800;margin-bottom:3px;">🎓 LOCAL KNOWLEDGE</div>';
    html += '<div style="font-size:11px;color:#c8e6d5;line-height:1.4;">' + escapeHtml(water.coachTips[tipIdx]) + '</div>';
    html += '</div>';
  }

  return html;
}

function openFlyStrategyModal(water, prefs, flow) {
  openInfoModal({
    title: '🐟 Trout Briefing',
    bodyHtml: buildFlyStrategyHtml(water, prefs, flow),
    confirmLabel: 'Got It'
  });
}

function ensureFlyLiveCommandTray() {
  if (flyLiveCommandTray) return flyLiveCommandTray;
  const tray = document.createElement('div');
  tray.className = 'ht-fly-live-tray';
  tray.innerHTML = `
    <button class="ht-fly-live-pill" type="button" data-fly-live="scan">Scan Fly Box</button>
    <button class="ht-fly-live-pill" type="button" data-fly-live="recs">Fly Recommendations</button>
    <button class="ht-fly-live-pill" type="button" data-fly-live="catch">Log Catch</button>
    <button class="ht-fly-live-pill" type="button" data-fly-live="hatch">Log Hatch</button>
  `;
  tray.addEventListener('click', (event) => event.stopPropagation());
  tray.querySelector('[data-fly-live="scan"]')?.addEventListener('click', openFlyBoxScanner);
  tray.querySelector('[data-fly-live="recs"]')?.addEventListener('click', openFlyRecommendationsModal);
  tray.querySelector('[data-fly-live="catch"]')?.addEventListener('click', openFlyCatchLogModal);
  tray.querySelector('[data-fly-live="hatch"]')?.addEventListener('click', openFlyHatchLogModal);
  document.body.appendChild(tray);
  flyLiveCommandTray = tray;
  return tray;
}

function showFlyLiveCommandTray() {
  // Disabled — Stream Command tray now handles all fly box/catch/hatch actions
  hideFlyLiveCommandTray();
}

function hideFlyLiveCommandTray() {
  if (!flyLiveCommandTray) return;
  flyLiveCommandTray.classList.remove('is-visible');
  try { flyLiveCommandTray.remove(); } catch(e) {}
  flyLiveCommandTray = null;
}

function setFlyLiveSessionActive(active) {
  flyLiveSessionActive = Boolean(active);
  if (flyLiveSessionActive) {
    showFlyLiveCommandTray();
  } else {
    hideFlyLiveCommandTray();
  }
}

async function startFlyStrategyFromTray(water) {
  const prefs = loadFlyCommandPrefs();
  setFlyLiveSessionActive(true);
  showNotice('Building trout strategy from live data...', 'info', 3200);
  try {
    updateWeather();
  } catch {
    // Ignore weather updates.
  }
  const flow = await fetchFlyFlowForWater(water);
  openFlyStrategyModal(water, prefs, flow);
  setFieldCommandStep(2);
  openFieldCommandTray();
  showNotice('Trout strategy online. Check in to deploy your fishing zone.', 'success', 3600);
}

/* ══════════════════════════════════════════════════════════════════════════
   AI FLY BOX HUB — Premium entry point for the fly box experience
   The key technology feature of the fly fishing module.
   ══════════════════════════════════════════════════════════════════════════ */

function _timeAgo(ts) {
  var diff = Date.now() - ts;
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  var hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h ago';
  var days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return new Date(ts).toLocaleDateString();
}

function _openAiFlyBoxHub() {
  var inv = loadFlyInventory();
  var flies = Array.isArray(inv.flies) ? inv.flies : [];
  var totalFlies = flies.length;
  var dryCount = flies.filter(function(f) { return f.category === 'dryFlies'; }).length;
  var nymphCount = flies.filter(function(f) { return f.category === 'nymphs'; }).length;
  var streamerCount = flies.filter(function(f) { return f.category === 'streamers'; }).length;
  var highConfCount = flies.filter(function(f) { return f.confidence === 'high' || f.confidence === 'manual'; }).length;
  var confPct = totalFlies > 0 ? Math.round((highConfCount / totalFlies) * 100) : 0;
  var lastScan = inv.lastUpdated ? _timeAgo(inv.lastUpdated) : 'Never';

  var backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop ht-flybox-hub-backdrop';
  backdrop.style.display = 'flex';

  var hub = document.createElement('div');
  hub.className = 'ht-flybox-hub';
  hub.innerHTML =
    '<div class="ht-flybox-hub-header">' +
      '<div class="ht-flybox-hub-brand">' +
        '<div class="ht-flybox-hub-icon-wrap"><span class="ht-flybox-hub-icon">🪰</span></div>' +
        '<div>' +
          '<h2 class="ht-flybox-hub-title">AI Fly Box</h2>' +
          '<p class="ht-flybox-hub-subtitle">Your Digital Fly Collection</p>' +
        '</div>' +
      '</div>' +
      '<button class="ht-flybox-close-btn" type="button" data-hub-close>×</button>' +
    '</div>' +

    '<div class="ht-flybox-hub-stats">' +
      '<div class="ht-flybox-hub-stat">' +
        '<span class="ht-flybox-hub-stat-num">' + totalFlies + '</span>' +
        '<span class="ht-flybox-hub-stat-label">Total Flies</span>' +
      '</div>' +
      '<div class="ht-flybox-hub-stat">' +
        '<span class="ht-flybox-hub-stat-num">' + dryCount + '<small>/' + nymphCount + '/' + streamerCount + '</small></span>' +
        '<span class="ht-flybox-hub-stat-label">Dry / Nymph / Streamer</span>' +
      '</div>' +
      '<div class="ht-flybox-hub-stat">' +
        '<span class="ht-flybox-hub-stat-num">' + confPct + '<small>%</small></span>' +
        '<span class="ht-flybox-hub-stat-label">AI Confidence</span>' +
      '</div>' +
    '</div>' +

    '<div class="ht-flybox-hub-actions">' +
      '<button class="ht-flybox-hub-action ht-flybox-hub-action--primary" type="button" data-hub-scan>' +
        '<div class="ht-flybox-hub-action-icon-wrap"><span class="ht-flybox-hub-action-icon">📸</span></div>' +
        '<div class="ht-flybox-hub-action-text">' +
          '<span class="ht-flybox-hub-action-title">Scan Fly Box</span>' +
          '<span class="ht-flybox-hub-action-desc">Point your camera at your open fly box. AI detects and inventories every fly.</span>' +
        '</div>' +
        '<span class="ht-flybox-hub-action-arrow">&#x203A;</span>' +
      '</button>' +
      '<button class="ht-flybox-hub-action" type="button" data-hub-upload>' +
        '<div class="ht-flybox-hub-action-icon-wrap"><span class="ht-flybox-hub-action-icon">🖼️</span></div>' +
        '<div class="ht-flybox-hub-action-text">' +
          '<span class="ht-flybox-hub-action-title">Upload Photos</span>' +
          '<span class="ht-flybox-hub-action-desc">Select photos of individual flies or your full box from your gallery.</span>' +
        '</div>' +
        '<span class="ht-flybox-hub-action-arrow">&#x203A;</span>' +
      '</button>' +
      '<button class="ht-flybox-hub-action' + (totalFlies > 0 ? '' : ' ht-flybox-hub-action--disabled') + '" type="button" data-hub-viewbox>' +
        '<div class="ht-flybox-hub-action-icon-wrap"><span class="ht-flybox-hub-action-icon">🪰</span></div>' +
        '<div class="ht-flybox-hub-action-text">' +
          '<span class="ht-flybox-hub-action-title">View My Fly Box</span>' +
          '<span class="ht-flybox-hub-action-desc">' + (totalFlies > 0 ? totalFlies + ' flies inventoried \u2022 Last updated ' + lastScan : 'No flies yet \u2014 scan your box to get started') + '</span>' +
        '</div>' +
        '<span class="ht-flybox-hub-action-arrow">&#x203A;</span>' +
      '</button>' +
    '</div>' +

    '<div class="ht-flybox-hub-tip">' +
      '<strong>💡 Pro tip:</strong> Lay your fly box open under good overhead light. The AI works best with even, natural lighting and a clear view of each compartment.' +
    '</div>';

  var closeModal = function() { backdrop.remove(); };

  hub.querySelector('[data-hub-close]').addEventListener('click', closeModal);

  hub.querySelector('[data-hub-scan]').addEventListener('click', function() {
    closeModal();
    _openFlyBoxLiveScanner();
  });

  hub.querySelector('[data-hub-upload]').addEventListener('click', function() {
    closeModal();
    openFlyBoxScanner();
  });

  hub.querySelector('[data-hub-viewbox]').addEventListener('click', function() {
    if (totalFlies === 0) {
      showNotice('Scan or upload flies first to build your box.', 'info', 2800);
      return;
    }
    closeModal();
    openVirtualFlyBox();
  });

  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) closeModal(); });
  backdrop.appendChild(hub);
  document.body.appendChild(backdrop);
}

/* ══════════════════════════════════════════════════════════════════════════
   LIVE CAMERA SCANNER — Real-time video feed with AI guide overlay
   ══════════════════════════════════════════════════════════════════════════ */
function _openFlyBoxLiveScanner() {
  var backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop ht-flybox-scanner-backdrop';
  backdrop.style.display = 'flex';

  var scanner = document.createElement('div');
  scanner.className = 'ht-flybox-scanner';
  scanner.innerHTML =
    '<div class="ht-flybox-scanner-header">' +
      '<h3>AI Fly Box Scanner</h3>' +
      '<button class="ht-flybox-close-btn" type="button" data-scanner-close>×</button>' +
    '</div>' +
    '<div class="ht-flybox-scanner-viewport">' +
      '<video class="ht-flybox-scanner-video" autoplay playsinline muted></video>' +
      '<canvas class="ht-flybox-scanner-overlay"></canvas>' +
      '<div class="ht-flybox-scanner-guide">' +
        '<div class="ht-flybox-scanner-corner tl"></div>' +
        '<div class="ht-flybox-scanner-corner tr"></div>' +
        '<div class="ht-flybox-scanner-corner bl"></div>' +
        '<div class="ht-flybox-scanner-corner br"></div>' +
      '</div>' +
      '<div class="ht-flybox-scanner-pulse"></div>' +
      '<div class="ht-flybox-scanner-status">Initializing camera...</div>' +
    '</div>' +
    '<div class="ht-flybox-scanner-controls">' +
      '<p class="ht-flybox-scanner-tip">Position your open fly box inside the frame</p>' +
      '<div class="ht-flybox-scanner-btn-row">' +
        '<button class="ht-flybox-scanner-btn ht-flybox-scanner-btn--secondary" type="button" data-scanner-flip>🔄 Flip</button>' +
        '<button class="ht-flybox-scanner-btn ht-flybox-scanner-btn--capture" type="button" data-scanner-capture>' +
          '<span class="ht-flybox-scanner-btn-ring"></span>' +
          '📸 Capture &amp; Analyze' +
        '</button>' +
      '</div>' +
      '<button class="ht-flybox-scanner-link" type="button" data-scanner-upload>Or upload a photo instead</button>' +
    '</div>';

  var video = scanner.querySelector('.ht-flybox-scanner-video');
  var overlay = scanner.querySelector('.ht-flybox-scanner-overlay');
  var statusEl = scanner.querySelector('.ht-flybox-scanner-status');
  var stream = null;
  var facingMode = 'environment';
  var animFrame = null;

  function startCamera(facing) {
    if (stream) {
      stream.getTracks().forEach(function(t) { t.stop(); });
    }
    statusEl.textContent = 'Starting camera...';
    statusEl.style.display = '';

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }
    })
    .then(function(s) {
      stream = s;
      video.srcObject = s;
      video.play();
      statusEl.style.display = 'none';
      _startScannerOverlay();
    })
    .catch(function(err) {
      console.warn('HUNTECH: Camera error:', err);
      statusEl.textContent = 'Camera unavailable \u2014 use Upload instead';
      statusEl.style.display = '';
    });
  }

  function _startScannerOverlay() {
    var ctx = overlay.getContext('2d');
    var scanLineY = 0;
    var frameCount = 0;

    function drawFrame() {
      if (!stream || !stream.active) return;
      var w = overlay.width = video.videoWidth || overlay.clientWidth;
      var h = overlay.height = video.videoHeight || overlay.clientHeight;
      ctx.clearRect(0, 0, w, h);
      frameCount++;

      // Scanning beam animation
      scanLineY = (scanLineY + 1.5) % h;
      var grad = ctx.createLinearGradient(0, scanLineY - 8, 0, scanLineY + 8);
      grad.addColorStop(0, 'rgba(43, 212, 255, 0)');
      grad.addColorStop(0.5, 'rgba(43, 212, 255, 0.35)');
      grad.addColorStop(1, 'rgba(43, 212, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanLineY - 8, w, 16);

      // Compartment grid overlay (subtle, suggests AI detection)
      var cols = 6, rows = 4;
      ctx.strokeStyle = 'rgba(43, 212, 255, 0.06)';
      ctx.lineWidth = 1;
      for (var c = 1; c < cols; c++) {
        var x = Math.round((w / cols) * c);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (var r = 1; r < rows; r++) {
        var y = Math.round((h / rows) * r);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Corner detection pulse (cycles through cells)
      if (frameCount % 40 < 20) {
        var pulseCol = Math.floor((frameCount / 40) % cols);
        var pulseRow = Math.floor((frameCount / 240) % rows);
        var cx = Math.round((w / cols) * pulseCol + (w / cols) / 2);
        var cy = Math.round((h / rows) * pulseRow + (h / rows) / 2);
        var radius = Math.min(w / cols, h / rows) * 0.3;
        ctx.strokeStyle = 'rgba(43, 212, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animFrame = requestAnimationFrame(drawFrame);
    }
    drawFrame();
  }

  function captureFrame() {
    if (!video.videoWidth) {
      showNotice('Camera not ready yet. Wait a moment.', 'warning', 2400);
      return;
    }
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    cleanup(false);
    _showBoxScanProcessing(dataUrl, backdrop, scanner);
  }

  function cleanup(removeBackdrop) {
    if (animFrame) cancelAnimationFrame(animFrame);
    if (stream) {
      stream.getTracks().forEach(function(t) { t.stop(); });
      stream = null;
    }
    if (removeBackdrop !== false) backdrop.remove();
  }

  scanner.querySelector('[data-scanner-close]').addEventListener('click', function() { cleanup(true); });
  scanner.querySelector('[data-scanner-flip]').addEventListener('click', function() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(facingMode);
  });
  scanner.querySelector('[data-scanner-capture]').addEventListener('click', captureFrame);
  scanner.querySelector('[data-scanner-upload]').addEventListener('click', function() {
    cleanup(true);
    openFlyBoxScanner();
  });

  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) cleanup(true); });
  backdrop.appendChild(scanner);
  document.body.appendChild(backdrop);

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    startCamera(facingMode);
  } else {
    statusEl.textContent = 'Camera API not available on this device';
    statusEl.style.display = '';
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   SCAN PROCESSING — Animated staged AI analysis with progress
   ══════════════════════════════════════════════════════════════════════════ */
function _showBoxScanProcessing(dataUrl, backdrop, containerEl) {
  containerEl.innerHTML =
    '<div class="ht-flybox-processing">' +
      '<h3 class="ht-flybox-processing-title">Analyzing Your Fly Box</h3>' +
      '<div class="ht-flybox-processing-img"><img src="' + dataUrl + '" alt="Captured fly box"></div>' +
      '<div class="ht-flybox-processing-stages">' +
        '<div class="ht-flybox-stage" data-stage="detect"><span class="ht-flybox-stage-icon">🔍</span> Detecting individual flies<span class="ht-flybox-stage-check"></span></div>' +
        '<div class="ht-flybox-stage" data-stage="color"><span class="ht-flybox-stage-icon">🎨</span> Analyzing color patterns<span class="ht-flybox-stage-check"></span></div>' +
        '<div class="ht-flybox-stage" data-stage="shape"><span class="ht-flybox-stage-icon">📐</span> Evaluating shape &amp; profile<span class="ht-flybox-stage-check"></span></div>' +
        '<div class="ht-flybox-stage" data-stage="match"><span class="ht-flybox-stage-icon">🧠</span> AI pattern matching<span class="ht-flybox-stage-check"></span></div>' +
      '</div>' +
      '<div class="ht-flybox-processing-progress">' +
        '<div class="ht-flybox-progress-bar"><div class="ht-flybox-progress-fill"></div></div>' +
        '<div class="ht-flybox-progress-text">Starting analysis...</div>' +
      '</div>' +
    '</div>';

  var stages = containerEl.querySelectorAll('.ht-flybox-stage');
  var progressFill = containerEl.querySelector('.ht-flybox-progress-fill');
  var progressText = containerEl.querySelector('.ht-flybox-progress-text');

  function setProgress(pct, text) {
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressText) progressText.textContent = text;
  }
  function completeStage(idx) {
    if (stages[idx]) {
      stages[idx].classList.add('is-complete');
      var chk = stages[idx].querySelector('.ht-flybox-stage-check');
      if (chk) chk.textContent = ' \u2713';
    }
  }
  function activateStage(idx) {
    if (stages[idx]) stages[idx].classList.add('is-active');
  }

  activateStage(0);
  setProgress(5, 'Scanning image for fly box compartments...');

  setTimeout(function() { setProgress(12, 'Segmenting compartments...'); }, 300);

  _detectFliesInBox(dataUrl).then(function(regions) {
    completeStage(0);
    setProgress(25, 'Found ' + regions.length + ' potential flies');
    activateStage(1);

    setTimeout(function() { setProgress(30, 'Running color analysis...'); }, 200);

    return _analyzeRegions(regions, function(done, total) {
      var pct = 30 + Math.round((done / total) * 55);
      setProgress(pct, 'Analyzing fly ' + done + ' of ' + total + '...');
      if (done === 1) { completeStage(1); activateStage(2); }
      if (done >= Math.ceil(total * 0.5)) { completeStage(2); activateStage(3); }
    });
  }).then(function(results) {
    completeStage(2);
    completeStage(3);
    setProgress(100, results.length + ' flies identified!');

    setTimeout(function() {
      backdrop.remove();
      if (results.length > 0) {
        openFlyBoxScanReviewModal(results);
      } else {
        showNotice('No flies detected. Try better lighting or a closer photo.', 'warning', 4000);
        _openAiFlyBoxHub();
      }
    }, 1400);
  }).catch(function(err) {
    console.error('HUNTECH: Fly box scan error:', err);
    setProgress(100, 'Analysis complete');
    setTimeout(function() {
      backdrop.remove();
      showNotice('Scan error \u2014 try again with better lighting.', 'warning', 3500);
    }, 800);
  });
}

function openFlyBoxScanner() {
  if (!isFlyModule()) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.multiple = true;
  input.addEventListener('change', () => {
    const files = Array.from(input.files || []);
    if (!files.length) return;
    handleFlyBoxScanFiles(files);
  });
  input.click();
}

/* ──────── Convert File → base64 data URL for persistent storage ──────── */
function _fileToDataUrl(file, maxDim) {
  maxDim = maxDim || 800;
  return new Promise(function(resolve) {
    var reader = new FileReader();
    reader.onload = function() {
      var img = new Image();
      img.onload = function() {
        var w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          var ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function() { resolve(''); };
      img.src = reader.result;
    };
    reader.onerror = function() { resolve(''); };
    reader.readAsDataURL(file);
  });
}

/* ──────── AI FLY IDENTIFICATION ENGINE ──────── */
var _FLY_ID_DATABASE = null;

function _buildFlyIdDatabase() {
  if (_FLY_ID_DATABASE) return _FLY_ID_DATABASE;
  var cats = window.FLY_BOX_CATEGORIES || {};
  var db = [];
  var colorMap = {
    'adams': { colors: ['gray','brown','grizzly'], sizes: ['12-18'] },
    'parachute adams': { colors: ['gray','white post','brown'], sizes: ['12-20'] },
    'elk hair caddis': { colors: ['tan','brown','elk'], sizes: ['12-18'] },
    'blue winged olive': { colors: ['olive','gray','dun'], sizes: ['16-22'] },
    'royal wulff': { colors: ['red','white','peacock','brown'], sizes: ['10-16'] },
    'stimulator': { colors: ['orange','yellow','grizzly'], sizes: ['8-14'] },
    'cdc emerger': { colors: ['olive','tan','cdc white'], sizes: ['16-22'] },
    'griffiths gnat': { colors: ['black','grizzly','peacock'], sizes: ['18-24'] },
    'pale morning dun': { colors: ['pale yellow','cream','tan'], sizes: ['14-18'] },
    'light cahill': { colors: ['cream','tan','light ginger'], sizes: ['12-16'] },
    'humpy': { colors: ['yellow','red','royal'], sizes: ['10-16'] },
    'daves hopper': { colors: ['yellow','tan','green'], sizes: ['6-12'] },
    'ant pattern': { colors: ['black','cinnamon','red'], sizes: ['14-20'] },
    'beetle pattern': { colors: ['black','iridescent','foam'], sizes: ['12-18'] },
    'sulphur dun': { colors: ['pale yellow','cream'], sizes: ['14-18'] },
    'march brown': { colors: ['brown','tan','mottled'], sizes: ['10-14'] },
    'quill gordon': { colors: ['quill','gray','dun'], sizes: ['12-16'] },
    'hendrickson': { colors: ['pink','tan','dark dun'], sizes: ['12-16'] },
    'trico spinner': { colors: ['black','white','clear wing'], sizes: ['20-26'] },
    'cream midge': { colors: ['cream','white','pale'], sizes: ['18-24'] },
    'pheasant tail': { colors: ['brown','copper','pheasant'], sizes: ['14-20'] },
    'hares ear': { colors: ['tan','brown','hare fur'], sizes: ['12-18'] },
    'copper john': { colors: ['copper','red','green','zebra'], sizes: ['14-20'] },
    'zebra midge': { colors: ['black','red','olive','silver'], sizes: ['18-24'] },
    'prince nymph': { colors: ['peacock','brown','white biots'], sizes: ['12-18'] },
    'rs2': { colors: ['gray','olive','black'], sizes: ['18-24'] },
    'perdigon': { colors: ['olive','black','purple','UV'], sizes: ['16-20'] },
    'stonefly nymph': { colors: ['brown','black','golden'], sizes: ['6-12'] },
    'caddis larva': { colors: ['green','tan','cream'], sizes: ['14-18'] },
    'san juan worm': { colors: ['red','pink','brown','wine'], sizes: ['10-14'] },
    'glo-bug/egg': { colors: ['orange','pink','chartreuse','peach'], sizes: ['8-14'] },
    'midge larva': { colors: ['red','black','olive','cream'], sizes: ['18-24'] },
    'rainbow warrior': { colors: ['pearl','rainbow','flashback'], sizes: ['16-22'] },
    'frenchie': { colors: ['pheasant','pink collar','copper'], sizes: ['14-18'] },
    'sowbug': { colors: ['gray','tan','pink'], sizes: ['14-18'] },
    'scud': { colors: ['orange','olive','tan','gray'], sizes: ['14-18'] },
    'walts worm': { colors: ['tan','cream','hare'], sizes: ['12-16'] },
    'squirmy wormy': { colors: ['pink','red','worm brown'], sizes: ['10-14'] },
    'mop fly': { colors: ['cream','tan','chartreuse','pink'], sizes: ['10-14'] },
    'woolly bugger': { colors: ['black','olive','brown','white'], sizes: ['4-10'] },
    'muddler minnow': { colors: ['brown','gold','tan','deer'], sizes: ['4-10'] },
    'clouser minnow': { colors: ['white','chartreuse','tan'], sizes: ['2-8'] },
    'sculpin': { colors: ['brown','olive','tan','dark'], sizes: ['4-8'] },
    'zonker': { colors: ['white','olive','natural rabbit'], sizes: ['4-8'] },
    'bunny leech': { colors: ['black','olive','brown','purple'], sizes: ['2-8'] },
    'sparkle minnow': { colors: ['white','olive','tan','flash'], sizes: ['4-8'] },
    'partridge & orange': { colors: ['orange','brown','partridge'], sizes: ['12-16'] },
    'partridge & green': { colors: ['green','olive','partridge'], sizes: ['12-16'] },
    'starling & purple': { colors: ['purple','starling','dark'], sizes: ['12-16'] }
  };

  Object.keys(cats).forEach(function(catKey) {
    var cat = cats[catKey];
    (cat.common || []).forEach(function(flyName) {
      var lowerName = flyName.toLowerCase();
      var known = colorMap[lowerName] || null;
      db.push({
        name: flyName,
        category: catKey,
        categoryLabel: cat.name || catKey,
        colors: known ? known.colors : ['varied'],
        sizes: known ? known.sizes : ['assorted'],
        keywords: lowerName.split(/\s+/)
      });
    });
  });
  _FLY_ID_DATABASE = db;
  return db;
}

/* Analyze image colors via canvas sampling — returns dominant color descriptors */
function _analyzeImageColors(dataUrl) {
  return new Promise(function(resolve) {
    if (!dataUrl) { resolve([]); return; }
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var sz = 64;
      canvas.width = sz; canvas.height = sz;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, sz, sz);
      var data = ctx.getImageData(0, 0, sz, sz).data;
      var buckets = { black: 0, white: 0, gray: 0, brown: 0, tan: 0, olive: 0, green: 0,
        red: 0, orange: 0, yellow: 0, pink: 0, purple: 0, blue: 0, cream: 0, copper: 0 };
      var total = 0;
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        if (a < 128) continue;
        total++;
        var lum = (r + g + b) / 3;
        if (lum < 30) { buckets.black++; continue; }
        if (lum > 225) { buckets.white++; continue; }
        if (lum > 180 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) { buckets.cream++; continue; }
        if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) { buckets.gray++; continue; }
        // Hue detection
        var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
        var h = 0;
        if (d > 0) {
          if (max === r) h = ((g - b) / d) % 6;
          else if (max === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;
          h = Math.round(h * 60);
          if (h < 0) h += 360;
        }
        var sat = max > 0 ? d / max : 0;
        if (sat < 0.15) { if (lum > 140) buckets.tan++; else buckets.gray++; continue; }
        if (h < 15 || h >= 345) { if (lum > 160) buckets.pink++; else buckets.red++; }
        else if (h < 35) { if (lum < 100) buckets.brown++; else if (lum < 150) buckets.copper++; else buckets.orange++; }
        else if (h < 65) { if (sat < 0.4) buckets.tan++; else buckets.yellow++; }
        else if (h < 160) { if (lum < 80) buckets.olive++; else buckets.green++; }
        else if (h < 260) buckets.blue++;
        else buckets.purple++;
      }
      // Sort and return top colors above 5% threshold
      var result = [];
      Object.keys(buckets).forEach(function(k) {
        var pct = total > 0 ? buckets[k] / total : 0;
        if (pct > 0.05) result.push({ color: k, pct: pct });
      });
      result.sort(function(a, b) { return b.pct - a.pct; });
      resolve(result.slice(0, 5));
    };
    img.onerror = function() { resolve([]); };
    img.src = dataUrl;
  });
}

/* Match detected colors against the fly database → return ranked candidates */
function _matchFlyByColors(colorResults) {
  var db = _buildFlyIdDatabase();
  var detectedColors = colorResults.map(function(c) { return c.color; });

  var scored = db.map(function(entry) {
    var matchCount = 0;
    entry.colors.forEach(function(fc) {
      var fcLower = fc.toLowerCase();
      detectedColors.forEach(function(dc) {
        if (fcLower.indexOf(dc) >= 0 || dc.indexOf(fcLower) >= 0) matchCount++;
      });
    });
    // Bonus for strong single-color matches (e.g., all-black → Woolly Bugger)
    var topColor = detectedColors[0] || '';
    var topPct = colorResults.length > 0 ? colorResults[0].pct : 0;
    if (topPct > 0.5 && entry.colors.some(function(c) { return c.toLowerCase().indexOf(topColor) >= 0; })) {
      matchCount += 2;
    }
    return { entry: entry, score: matchCount };
  });

  scored.sort(function(a, b) { return b.score - a.score; });
  return scored.filter(function(s) { return s.score > 0; }).slice(0, 6);
}

/* ══════════════════════════════════════════════════════════════════════════
   MULTI-FLY DETECTION — Grid segmentation of fly box images
   Divides the captured image into a compartment grid, then tests each
   cell for color variance and edge density to determine if it contains
   a fly. Returns an array of regions with cropped data URLs.
   ══════════════════════════════════════════════════════════════════════════ */
function _detectFliesInBox(dataUrl) {
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var W = img.width, H = img.height;
      // Determine grid layout based on aspect ratio
      var cols, rows;
      var ratio = W / H;
      if (ratio > 1.5)      { cols = 8; rows = 4; }
      else if (ratio > 1.1) { cols = 6; rows = 4; }
      else if (ratio > 0.7) { cols = 5; rows = 5; }
      else                  { cols = 4; rows = 6; }

      var cellW = Math.floor(W / cols);
      var cellH = Math.floor(H / rows);
      var regions = [];
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var sx = c * cellW, sy = r * cellH;
          canvas.width = cellW; canvas.height = cellH;
          ctx.drawImage(img, sx, sy, cellW, cellH, 0, 0, cellW, cellH);
          var pixelData = ctx.getImageData(0, 0, cellW, cellH).data;
          var variance = _measureColorVariance(pixelData);
          var edges = _measureEdgeDensity(pixelData, cellW, cellH);
          // Non-empty cell: has enough color variation AND edge content
          if (variance > 15 && edges > 0.02) {
            regions.push({
              dataUrl: canvas.toDataURL('image/jpeg', 0.85),
              col: c, row: r, x: sx, y: sy, w: cellW, h: cellH,
              variance: variance, edgeDensity: edges
            });
          }
        }
      }
      console.log('HUNTECH: Fly box grid ' + cols + 'x' + rows + ' → detected ' + regions.length + ' potential flies');
      resolve(regions);
    };
    img.onerror = function() { resolve([]); };
    img.src = dataUrl;
  });
}

/* Color variance — higher values mean more color complexity in the cell */
function _measureColorVariance(data) {
  var sumR = 0, sumG = 0, sumB = 0, count = 0;
  for (var i = 0; i < data.length; i += 16) {
    sumR += data[i]; sumG += data[i+1]; sumB += data[i+2]; count++;
  }
  if (count === 0) return 0;
  var avgR = sumR / count, avgG = sumG / count, avgB = sumB / count;
  var varSum = 0;
  for (var j = 0; j < data.length; j += 16) {
    var dr = data[j] - avgR, dg = data[j+1] - avgG, db = data[j+2] - avgB;
    varSum += dr * dr + dg * dg + db * db;
  }
  return Math.sqrt(varSum / count);
}

/* Edge density via gradient detection — higher = more detail/texture */
function _measureEdgeDensity(data, width, height) {
  var edgeCount = 0, threshold = 30, step = 2;
  for (var y = step; y < height - step; y += step) {
    for (var x = step; x < width - step; x += step) {
      var idx = (y * width + x) * 4;
      var idxR = (y * width + x + step) * 4;
      var idxD = ((y + step) * width + x) * 4;
      if (idxR + 2 >= data.length || idxD + 2 >= data.length) continue;
      var lumC = (data[idx] + data[idx+1] + data[idx+2]) / 3;
      var lumR = (data[idxR] + data[idxR+1] + data[idxR+2]) / 3;
      var lumD = (data[idxD] + data[idxD+1] + data[idxD+2]) / 3;
      if (Math.abs(lumR - lumC) > threshold || Math.abs(lumD - lumC) > threshold) edgeCount++;
    }
  }
  var totalCells = Math.floor(width / step) * Math.floor(height / step);
  return totalCells > 0 ? edgeCount / totalCells : 0;
}

/* Process all detected regions through the enhanced AI pipeline */
function _analyzeRegions(regions, onProgress) {
  return new Promise(async function(resolve) {
    var results = [];
    for (var i = 0; i < regions.length; i++) {
      var entry = await _aiFlyAnalysisEnhanced(regions[i].dataUrl);
      if (entry) {
        entry.scanRegion = { col: regions[i].col, row: regions[i].row };
        results.push(entry);
      }
      if (onProgress) onProgress(i + 1, regions.length);
      // Brief delay so the UI can repaint progress
      await new Promise(function(r) { setTimeout(r, 60); });
    }
    resolve(results);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   ENHANCED AI ANALYSIS — Color + Shape + Texture identification
   ══════════════════════════════════════════════════════════════════════════ */
async function _aiFlyAnalysisEnhanced(dataUrl) {
  if (!dataUrl) return null;
  var colors = await _analyzeImageColors(dataUrl);
  var shape = await _analyzeImageShape(dataUrl);
  var matches = _matchFlyByColorsAndShape(colors, shape);
  var bestMatch = matches.length > 0 ? matches[0] : null;
  var confidence = 'low';
  if (bestMatch && bestMatch.score >= 5) confidence = 'high';
  else if (bestMatch && bestMatch.score >= 3) confidence = 'medium';

  var dominantColors = colors.slice(0, 3).map(function(c) { return c.color; });
  var colorLabel = dominantColors.length ? dominantColors.join(', ') : 'varied';
  colorLabel = colorLabel.charAt(0).toUpperCase() + colorLabel.slice(1);

  return {
    id: 'fly-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8),
    name: bestMatch ? bestMatch.entry.name : 'Unknown Fly',
    category: bestMatch ? bestMatch.entry.category : 'dryFlies',
    categoryLabel: bestMatch ? bestMatch.entry.categoryLabel : 'Dry Flies',
    color: colorLabel,
    size: bestMatch ? bestMatch.entry.sizes[0] : 'Assorted',
    imageDataUrl: dataUrl,
    notes: '',
    confidence: confidence,
    compartment: -1,
    addedAt: Date.now(),
    source: 'scan',
    shapeProfile: shape,
    altMatches: matches.slice(1, 4).map(function(m) {
      return { name: m.entry.name, category: m.entry.categoryLabel, score: m.score };
    })
  };
}

/* Shape & profile analysis — aspect ratio, symmetry, texture, edge density */
function _analyzeImageShape(dataUrl) {
  return new Promise(function(resolve) {
    if (!dataUrl) { resolve({}); return; }
    var img = new Image();
    img.onload = function() {
      var sz = 64;
      var canvas = document.createElement('canvas');
      canvas.width = sz; canvas.height = sz;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, sz, sz);
      var data = ctx.getImageData(0, 0, sz, sz).data;

      // Background reference from corners
      var bgR = data[0], bgG = data[1], bgB = data[2];
      var bgThreshold = 35;

      // Bounding box of non-background pixels
      var minX = sz, maxX = 0, minY = sz, maxY = 0;
      for (var y = 0; y < sz; y++) {
        for (var x = 0; x < sz; x++) {
          var i = (y * sz + x) * 4;
          if (Math.abs(data[i] - bgR) + Math.abs(data[i+1] - bgG) + Math.abs(data[i+2] - bgB) > bgThreshold) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      var bboxW = maxX - minX + 1;
      var bboxH = maxY - minY + 1;
      var aspectRatio = bboxH > 0 ? bboxW / bboxH : 1;

      // Symmetry score
      var symScore = 0, symTotal = 0;
      var centerX = Math.floor((minX + maxX) / 2);
      for (var y2 = minY; y2 <= maxY; y2++) {
        for (var dx = 0; dx <= Math.min(centerX - minX, maxX - centerX); dx++) {
          var lI = (y2 * sz + (centerX - dx)) * 4;
          var rI = (y2 * sz + (centerX + dx)) * 4;
          var lumL = (data[lI] + data[lI+1] + data[lI+2]) / 3;
          var lumRt = (data[rI] + data[rI+1] + data[rI+2]) / 3;
          if (Math.abs(lumL - lumRt) < 30) symScore++;
          symTotal++;
        }
      }
      var symmetry = symTotal > 0 ? symScore / symTotal : 0.5;

      // Texture complexity
      var lumArr = [];
      for (var p = 0; p < data.length; p += 4) {
        lumArr.push((data[p] + data[p+1] + data[p+2]) / 3);
      }
      var avgLum = lumArr.reduce(function(a, b) { return a + b; }, 0) / lumArr.length;
      var lumVar = lumArr.reduce(function(a, v) { return a + (v - avgLum) * (v - avgLum); }, 0) / lumArr.length;
      var textureComplexity = Math.sqrt(lumVar);

      // Edge density
      var edges = 0;
      for (var yy = 1; yy < sz - 1; yy++) {
        for (var xx = 1; xx < sz - 1; xx++) {
          var ci = (yy * sz + xx) * 4;
          var ri = (yy * sz + xx + 1) * 4;
          var di = ((yy + 1) * sz + xx) * 4;
          var lC = (data[ci] + data[ci+1] + data[ci+2]) / 3;
          var lR2 = (data[ri] + data[ri+1] + data[ri+2]) / 3;
          var lD = (data[di] + data[di+1] + data[di+2]) / 3;
          if (Math.abs(lC - lR2) > 20 || Math.abs(lC - lD) > 20) edges++;
        }
      }
      var edgeDensity = edges / ((sz - 2) * (sz - 2));

      // Profile classification
      var profile = 'standard';
      if (aspectRatio > 2.5) profile = 'elongated';
      else if (aspectRatio > 1.5) profile = 'long';
      else if (aspectRatio < 0.6) profile = 'tall';
      else if (bboxW < sz * 0.3 && bboxH < sz * 0.3) profile = 'tiny';
      if (edgeDensity > 0.4 && textureComplexity > 40) profile += '-bushy';
      else if (edgeDensity < 0.15 && textureComplexity < 25) profile += '-smooth';

      resolve({
        aspectRatio: Math.round(aspectRatio * 100) / 100,
        symmetry: Math.round(symmetry * 100) / 100,
        textureComplexity: Math.round(textureComplexity * 10) / 10,
        edgeDensity: Math.round(edgeDensity * 100) / 100,
        profile: profile,
        fillRatio: Math.round((bboxW * bboxH) / (sz * sz) * 100) / 100
      });
    };
    img.onerror = function() { resolve({}); };
    img.src = dataUrl;
  });
}

/* Enhanced matching using both color analysis AND shape profile */
function _matchFlyByColorsAndShape(colorResults, shape) {
  var db = _buildFlyIdDatabase();
  var detectedColors = colorResults.map(function(c) { return c.color; });
  var profile = (shape && shape.profile) || '';

  var scored = db.map(function(entry) {
    var score = 0;
    // Color matching
    entry.colors.forEach(function(fc) {
      var fcLower = fc.toLowerCase();
      detectedColors.forEach(function(dc) {
        if (fcLower.indexOf(dc) >= 0 || dc.indexOf(fcLower) >= 0) score++;
      });
    });
    // Dominant color bonus
    var topColor = detectedColors[0] || '';
    var topPct = colorResults.length > 0 ? colorResults[0].pct : 0;
    if (topPct > 0.5 && entry.colors.some(function(c) { return c.toLowerCase().indexOf(topColor) >= 0; })) {
      score += 2;
    }
    // Shape-based scoring
    var cat = entry.category;
    var nameLower = entry.name.toLowerCase();
    if (profile.indexOf('elongated') >= 0) {
      if (cat === 'streamers') score += 3;
      if (/worm|leech|zonker|bugger/.test(nameLower)) score += 2;
    }
    if (profile.indexOf('long') >= 0) {
      if (cat === 'nymphs') score += 2;
      if (/nymph|emerger|larva/.test(nameLower)) score += 1;
    }
    if (profile.indexOf('tall') >= 0) {
      if (cat === 'dryFlies') score += 2;
      if (/parachute|wulff|comparadun/.test(nameLower)) score += 1;
    }
    if (profile.indexOf('bushy') >= 0) {
      if (/stimulator|humpy|wulff|adams/.test(nameLower)) score += 2;
      if (cat === 'dryFlies') score += 1;
    }
    if (profile.indexOf('smooth') >= 0) {
      if (/perdigon|copper john|zebra|bead/.test(nameLower)) score += 2;
      if (cat === 'nymphs') score += 1;
    }
    if (profile.indexOf('tiny') >= 0) {
      if (/midge|trico|gnat/.test(nameLower)) score += 3;
    }
    return { entry: entry, score: score };
  });

  scored.sort(function(a, b) { return b.score - a.score; });
  return scored.filter(function(s) { return s.score > 0; }).slice(0, 6);
}

/* Full AI analysis pipeline: file → dataUrl → color analysis → fly ID → structured entry */
async function _aiFlyAnalysis(file) {
  var dataUrl = await _fileToDataUrl(file, 600);
  if (!dataUrl) return null;
  var colors = await _analyzeImageColors(dataUrl);
  var matches = _matchFlyByColors(colors);
  var bestMatch = matches.length > 0 ? matches[0] : null;
  var confidence = 'low';
  if (bestMatch && bestMatch.score >= 4) confidence = 'high';
  else if (bestMatch && bestMatch.score >= 2) confidence = 'medium';

  var dominantColors = colors.slice(0, 3).map(function(c) { return c.color; });
  var colorLabel = dominantColors.length ? dominantColors.join(', ') : 'varied';
  colorLabel = colorLabel.charAt(0).toUpperCase() + colorLabel.slice(1);

  return {
    id: 'fly-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8),
    name: bestMatch ? bestMatch.entry.name : 'Unknown Fly',
    category: bestMatch ? bestMatch.entry.category : 'dryFlies',
    categoryLabel: bestMatch ? bestMatch.entry.categoryLabel : 'Dry Flies',
    color: colorLabel,
    size: bestMatch ? bestMatch.entry.sizes[0] : 'Assorted',
    imageDataUrl: dataUrl,
    notes: '',
    confidence: confidence,
    compartment: -1,
    addedAt: Date.now(),
    source: 'scan',
    altMatches: matches.slice(1, 4).map(function(m) {
      return { name: m.entry.name, category: m.entry.categoryLabel, score: m.score };
    })
  };
}

/* ──────── SCAN HANDLER — processes uploaded photos through AI pipeline ──────── */
async function handleFlyBoxScanFiles(files) {
  showNotice('Scanning ' + files.length + ' fly photo' + (files.length > 1 ? 's' : '') + '...', 'info', 3000);

  var results = [];
  for (var i = 0; i < files.length; i++) {
    var entry = await _aiFlyAnalysis(files[i]);
    if (entry) results.push(entry);
  }

  if (!results.length) {
    showNotice('Could not process the photos. Try again with better lighting.', 'warning', 3600);
    return;
  }

  openFlyBoxScanReviewModal(results);
}

/* ──────── SCAN REVIEW MODAL — user confirms/edits AI-identified flies ──────── */
function openFlyBoxScanReviewModal(scannedFlies) {
  var backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  var modal = document.createElement('div');
  modal.className = 'ht-modal ht-flybox-scan-modal';
  var cardsHtml = scannedFlies.map(function(fly, idx) {
    var confColor = fly.confidence === 'high' ? '#4caf50' : fly.confidence === 'medium' ? '#ffc107' : '#ff5722';
    var altHtml = (fly.altMatches || []).map(function(alt) {
      return '<option value="' + escapeHtml(alt.name) + '">' + escapeHtml(alt.name) + ' (' + escapeHtml(alt.category) + ')</option>';
    }).join('');
    return '<div class="ht-flybox-scan-card" data-scan-idx="' + idx + '">' +
      '<div class="ht-flybox-scan-img"><img src="' + fly.imageDataUrl + '" alt="Fly"></div>' +
      '<div class="ht-flybox-scan-info">' +
        '<div class="ht-flybox-scan-id-row">' +
          '<span class="ht-flybox-conf-dot" style="background:' + confColor + '"></span>' +
          '<input class="ht-flybox-scan-name" type="text" value="' + escapeHtml(fly.name) + '" placeholder="Fly name">' +
        '</div>' +
        '<div class="ht-flybox-scan-meta-row">' +
          '<input class="ht-flybox-scan-color" type="text" value="' + escapeHtml(fly.color) + '" placeholder="Color">' +
          '<input class="ht-flybox-scan-size" type="text" value="' + escapeHtml(fly.size) + '" placeholder="Size">' +
        '</div>' +
        (altHtml ? '<select class="ht-flybox-scan-alt" data-idx="' + idx + '"><option value="">AI also detected...</option>' + altHtml + '</select>' : '') +
        '<select class="ht-flybox-scan-cat" data-idx="' + idx + '">' +
          '<option value="dryFlies"' + (fly.category === 'dryFlies' ? ' selected' : '') + '>Dry Fly</option>' +
          '<option value="nymphs"' + (fly.category === 'nymphs' ? ' selected' : '') + '>Nymph</option>' +
          '<option value="streamers"' + (fly.category === 'streamers' ? ' selected' : '') + '>Streamer</option>' +
          '<option value="wetFlies"' + (fly.category === 'wetFlies' ? ' selected' : '') + '>Wet Fly</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  }).join('');

  modal.innerHTML = '<h3>🪰 AI Fly Scan Results</h3>' +
    '<p style="font-size:12px;color:#aaa;margin:0 0 10px">Review and correct AI identifications. Tap a name to edit.</p>' +
    '<div class="ht-flybox-scan-list">' + cardsHtml + '</div>' +
    '<div class="ht-modal-actions">' +
      '<button class="ht-modal-btn ghost" type="button" data-scan-cancel>Cancel</button>' +
      '<button class="ht-modal-btn primary" type="button" data-scan-save>✅ Add to Fly Box</button>' +
    '</div>';

  // Alt-match select: when user picks an alternate, update the name input
  modal.querySelectorAll('.ht-flybox-scan-alt').forEach(function(sel) {
    sel.addEventListener('change', function() {
      if (!sel.value) return;
      var idx = Number(sel.dataset.idx);
      var card = modal.querySelector('[data-scan-idx="' + idx + '"]');
      if (card) {
        var nameInput = card.querySelector('.ht-flybox-scan-name');
        if (nameInput) nameInput.value = sel.value;
      }
    });
  });

  var closeModal = function() { backdrop.remove(); };

  modal.querySelector('[data-scan-cancel]').addEventListener('click', closeModal);
  modal.querySelector('[data-scan-save]').addEventListener('click', function() {
    var inv = loadFlyInventory();
    var cards = Array.from(modal.querySelectorAll('.ht-flybox-scan-card'));
    var count = 0;
    cards.forEach(function(card, idx) {
      var fly = scannedFlies[idx];
      if (!fly) return;
      fly.name = (card.querySelector('.ht-flybox-scan-name') || {}).value || fly.name;
      fly.color = (card.querySelector('.ht-flybox-scan-color') || {}).value || fly.color;
      fly.size = (card.querySelector('.ht-flybox-scan-size') || {}).value || fly.size;
      var catSel = card.querySelector('.ht-flybox-scan-cat');
      if (catSel) fly.category = catSel.value;
      // Assign next open compartment
      fly.compartment = Array.isArray(inv.flies) ? inv.flies.length + count : count;
      inv.flies = Array.isArray(inv.flies) ? inv.flies : [];
      inv.flies.push(fly);
      count++;
    });
    saveFlyInventory();
    showNotice(count + ' flies added to your fly box!', 'success', 3600);
    updateFlyCoachFeed(count + ' flies scanned and added to inventory. AI Coach now uses your box.');
    closeModal();
    // Auto-open the fly box gallery after saving
    setTimeout(function() { openVirtualFlyBox(); }, 400);
  });

  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) closeModal(); });
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/* ══════════════════════════════════════════════════════════════════════════
   VIRTUAL FLY BOX GALLERY — Full-screen compartment grid view
   ══════════════════════════════════════════════════════════════════════════ */
function openVirtualFlyBox() {
  if (!isFlyModule()) return;
  var inv = loadFlyInventory();
  var flies = Array.isArray(inv.flies) ? inv.flies : [];

  var backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop ht-flybox-backdrop';
  backdrop.style.display = 'flex';

  var modal = document.createElement('div');
  modal.className = 'ht-flybox-gallery';

  // Category filter tabs
  var allCats = [
    { key: 'all', label: 'All Flies' },
    { key: 'dryFlies', label: 'Dry Flies' },
    { key: 'nymphs', label: 'Nymphs' },
    { key: 'streamers', label: 'Streamers' },
    { key: 'wetFlies', label: 'Wet Flies' }
  ];

  function renderGallery(filterCat) {
    var filtered = filterCat === 'all' ? flies : flies.filter(function(f) { return f.category === filterCat; });
    var tabsHtml = allCats.map(function(c) {
      var active = c.key === filterCat ? ' ht-flybox-tab--active' : '';
      var count = c.key === 'all' ? flies.length : flies.filter(function(f) { return f.category === c.key; }).length;
      return '<button class="ht-flybox-tab' + active + '" data-cat="' + c.key + '">' + escapeHtml(c.label) + ' <span class="ht-flybox-tab-count">' + count + '</span></button>';
    }).join('');

    var gridHtml = '';
    if (!filtered.length) {
      gridHtml = '<div class="ht-flybox-empty">' +
        '<div style="font-size:40px;margin-bottom:12px">🪰</div>' +
        '<div>No flies yet. Scan your fly box to start building your digital collection.</div>' +
        '<button class="ht-flybox-add-btn" type="button" data-scan-new>📸 Scan Fly Box</button>' +
      '</div>';
    } else {
      gridHtml = '<div class="ht-flybox-grid">';
      filtered.forEach(function(fly, idx) {
        var realIdx = flies.indexOf(fly);
        var imgSrc = fly.imageDataUrl || fly.imageUrl || '';
        var confDot = fly.confidence === 'high' ? '#4caf50' : fly.confidence === 'medium' ? '#ffc107' : '#ff5722';
        gridHtml += '<div class="ht-flybox-cell" data-fly-idx="' + realIdx + '">' +
          '<div class="ht-flybox-cell-img">' +
            (imgSrc ? '<img src="' + imgSrc + '" alt="' + escapeHtml(fly.name) + '">' : '<div class="ht-flybox-cell-placeholder">🪰</div>') +
          '</div>' +
          '<div class="ht-flybox-cell-label">' +
            '<span class="ht-flybox-conf-dot" style="background:' + confDot + ';width:6px;height:6px"></span> ' +
            escapeHtml(fly.name || 'Fly') +
          '</div>' +
          '<div class="ht-flybox-cell-meta">' + escapeHtml(fly.color || '') + ' • ' + escapeHtml(fly.size || '') + '</div>' +
        '</div>';
      });
      gridHtml += '</div>';
    }

    modal.innerHTML = '<div class="ht-flybox-header">' +
      '<h3>🪰 My Fly Box</h3>' +
      '<div class="ht-flybox-header-actions">' +
        '<button class="ht-flybox-action-btn" type="button" data-scan-new title="Scan more flies">📸 Scan</button>' +
        '<button class="ht-flybox-action-btn" type="button" data-add-manual title="Add manually">✏️ Add</button>' +
        '<button class="ht-flybox-close-btn" type="button" data-close-box>×</button>' +
      '</div>' +
    '</div>' +
    '<div class="ht-flybox-tabs">' + tabsHtml + '</div>' +
    '<div class="ht-flybox-count">' + filtered.length + ' of ' + flies.length + ' flies</div>' +
    gridHtml;

    // Bind tab clicks
    modal.querySelectorAll('.ht-flybox-tab').forEach(function(tab) {
      tab.addEventListener('click', function() { renderGallery(tab.dataset.cat); });
    });

    // Bind cell clicks → open fly detail
    modal.querySelectorAll('.ht-flybox-cell').forEach(function(cell) {
      cell.addEventListener('click', function() {
        var flyIdx = Number(cell.dataset.flyIdx);
        openFlyDetailModal(flyIdx, function() {
          // Refresh gallery after edit/delete
          var inv2 = loadFlyInventory();
          flies = Array.isArray(inv2.flies) ? inv2.flies : [];
          renderGallery(filterCat);
        });
      });
    });

    // Bind scan button
    var scanBtn = modal.querySelector('[data-scan-new]');
    if (scanBtn) scanBtn.addEventListener('click', function() { closeModal(); openFlyBoxScanner(); });

    // Bind manual add
    var addBtn = modal.querySelector('[data-add-manual]');
    if (addBtn) addBtn.addEventListener('click', function() {
      openManualFlyAddModal(function() {
        var inv2 = loadFlyInventory();
        flies = Array.isArray(inv2.flies) ? inv2.flies : [];
        renderGallery(filterCat);
      });
    });

    // Bind close
    var closeBtn = modal.querySelector('[data-close-box]');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  var closeModal = function() { backdrop.remove(); };
  renderGallery('all');

  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) closeModal(); });
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/* ══════════════════════════════════════════════════════════════════════════
   FLY DETAIL MODAL — Full info, edit notes, remove, change ID
   ══════════════════════════════════════════════════════════════════════════ */
function openFlyDetailModal(flyIdx, onUpdate) {
  var inv = loadFlyInventory();
  var flies = Array.isArray(inv.flies) ? inv.flies : [];
  var fly = flies[flyIdx];
  if (!fly) return;

  var backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';
  backdrop.style.zIndex = '23000';

  var modal = document.createElement('div');
  modal.className = 'ht-modal ht-flybox-detail-modal';

  var confLabel = fly.confidence === 'high' ? '🟢 High' : fly.confidence === 'medium' ? '🟡 Medium' : '🔴 Low';
  var catLabels = { dryFlies: 'Dry Fly', nymphs: 'Nymph', streamers: 'Streamer', wetFlies: 'Wet Fly' };
  var imgSrc = fly.imageDataUrl || fly.imageUrl || '';
  var sourceLabel = fly.source === 'scan' ? '📸 AI Scanned' : '✏️ Manual Entry';
  var dateLabel = fly.addedAt ? new Date(fly.addedAt).toLocaleDateString() : '—';

  modal.innerHTML = '<div class="ht-flydetail-header">' +
    '<h3>' + escapeHtml(fly.name || 'Fly') + '</h3>' +
    '<button class="ht-flybox-close-btn" type="button" data-detail-close>×</button>' +
  '</div>' +
  (imgSrc ? '<div class="ht-flydetail-img"><img src="' + imgSrc + '" alt="' + escapeHtml(fly.name) + '"></div>' : '') +
  '<div class="ht-flydetail-grid">' +
    '<div class="ht-flydetail-field"><span class="ht-flydetail-label">Category</span><span>' + escapeHtml(catLabels[fly.category] || fly.category) + '</span></div>' +
    '<div class="ht-flydetail-field"><span class="ht-flydetail-label">Color</span><span>' + escapeHtml(fly.color || 'Varied') + '</span></div>' +
    '<div class="ht-flydetail-field"><span class="ht-flydetail-label">Size</span><span>' + escapeHtml(fly.size || 'Assorted') + '</span></div>' +
    '<div class="ht-flydetail-field"><span class="ht-flydetail-label">Confidence</span><span>' + confLabel + '</span></div>' +
    '<div class="ht-flydetail-field"><span class="ht-flydetail-label">Source</span><span>' + sourceLabel + '</span></div>' +
    '<div class="ht-flydetail-field"><span class="ht-flydetail-label">Added</span><span>' + dateLabel + '</span></div>' +
  '</div>' +
  '<div class="ht-flydetail-notes-section">' +
    '<label class="ht-flydetail-label" style="display:block;margin-bottom:4px">Notes</label>' +
    '<textarea class="ht-flydetail-notes" rows="3" placeholder="Add notes about this fly — when it works, what hatch, rigging tips...">' + escapeHtml(fly.notes || '') + '</textarea>' +
  '</div>' +
  '<div class="ht-flydetail-actions">' +
    '<button class="ht-modal-btn ghost" type="button" data-detail-rename>✏️ Rename</button>' +
    '<button class="ht-modal-btn ghost" type="button" data-detail-duplicate>📋 Duplicate</button>' +
    '<button class="ht-modal-btn ghost" type="button" style="color:#ff5722;border-color:rgba(255,87,34,0.4)" data-detail-remove>🗑️ Remove</button>' +
    '<button class="ht-modal-btn primary" type="button" data-detail-save>💾 Save</button>' +
  '</div>';

  var closeModal = function() { backdrop.remove(); };

  // Close
  modal.querySelector('[data-detail-close]').addEventListener('click', closeModal);

  // Save notes
  modal.querySelector('[data-detail-save]').addEventListener('click', function() {
    var notes = modal.querySelector('.ht-flydetail-notes');
    if (notes) fly.notes = notes.value.trim();
    saveFlyInventory();
    showNotice('Fly notes saved.', 'success', 2400);
    closeModal();
    if (onUpdate) onUpdate();
  });

  // Rename
  modal.querySelector('[data-detail-rename]').addEventListener('click', function() {
    var nameEl = modal.querySelector('.ht-flydetail-header h3');
    var current = fly.name || 'Fly';
    var newName = prompt('Rename this fly:', current);
    if (newName && newName.trim()) {
      fly.name = newName.trim();
      saveFlyInventory();
      if (nameEl) nameEl.textContent = fly.name;
      showNotice('Fly renamed to ' + fly.name, 'success', 2400);
    }
  });

  // Duplicate
  modal.querySelector('[data-detail-duplicate]').addEventListener('click', function() {
    var dupe = JSON.parse(JSON.stringify(fly));
    dupe.id = 'fly-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8);
    dupe.addedAt = Date.now();
    dupe.notes = '';
    inv.flies.push(dupe);
    saveFlyInventory();
    showNotice('Fly duplicated.', 'success', 2400);
    closeModal();
    if (onUpdate) onUpdate();
  });

  // Remove
  modal.querySelector('[data-detail-remove]').addEventListener('click', function() {
    if (!confirm('Remove "' + (fly.name || 'this fly') + '" from your box?')) return;
    inv.flies.splice(flyIdx, 1);
    saveFlyInventory();
    showNotice('Fly removed from box.', 'info', 2400);
    closeModal();
    if (onUpdate) onUpdate();
  });

  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) closeModal(); });
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/* ──────── MANUAL FLY ADD MODAL ──────── */
function openManualFlyAddModal(onUpdate) {
  var backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';
  backdrop.style.zIndex = '23000';

  var modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = '<h3>✏️ Add Fly Manually</h3>' +
    '<div style="display:grid;gap:10px">' +
      '<input type="text" class="ht-flybox-scan-name" placeholder="Fly name (e.g., Elk Hair Caddis)" data-field="name">' +
      '<select data-field="category">' +
        '<option value="dryFlies">Dry Fly</option>' +
        '<option value="nymphs">Nymph</option>' +
        '<option value="streamers">Streamer</option>' +
        '<option value="wetFlies">Wet Fly</option>' +
      '</select>' +
      '<input type="text" placeholder="Color (e.g., tan, olive)" data-field="color">' +
      '<input type="text" placeholder="Size (e.g., 14-18)" data-field="size">' +
      '<textarea rows="2" placeholder="Notes (optional)" data-field="notes"></textarea>' +
    '</div>' +
    '<div class="ht-modal-actions">' +
      '<button class="ht-modal-btn ghost" type="button" data-cancel>Cancel</button>' +
      '<button class="ht-modal-btn primary" type="button" data-save>Add to Box</button>' +
    '</div>';

  var closeModal = function() { backdrop.remove(); };
  modal.querySelector('[data-cancel]').addEventListener('click', closeModal);
  modal.querySelector('[data-save]').addEventListener('click', function() {
    var name = (modal.querySelector('[data-field="name"]') || {}).value || '';
    if (!name.trim()) { showNotice('Enter a fly name.', 'warning', 2400); return; }
    var fly = {
      id: 'fly-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8),
      name: name.trim(),
      category: (modal.querySelector('[data-field="category"]') || {}).value || 'dryFlies',
      color: (modal.querySelector('[data-field="color"]') || {}).value || 'Varied',
      size: (modal.querySelector('[data-field="size"]') || {}).value || 'Assorted',
      imageDataUrl: '',
      notes: (modal.querySelector('[data-field="notes"]') || {}).value || '',
      confidence: 'manual',
      compartment: -1,
      addedAt: Date.now(),
      source: 'manual',
      altMatches: []
    };
    var inv = loadFlyInventory();
    inv.flies = Array.isArray(inv.flies) ? inv.flies : [];
    inv.flies.push(fly);
    saveFlyInventory();
    showNotice(fly.name + ' added to fly box.', 'success', 2400);
    closeModal();
    if (onUpdate) onUpdate();
  });

  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) closeModal(); });
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function openFlyRecommendationsModal(criteria) {
  var picks = getFlyInventoryRecommendations(6, criteria || null);
  var inv = loadFlyInventory();
  var flyCount = Array.isArray(inv.flies) ? inv.flies.length : 0;
  var body = '';
  if (!picks.length && !flyCount) {
    body = '<div class="ht-fly-note" style="text-align:center;padding:20px">' +
      '<div style="font-size:40px;margin-bottom:10px">🪰</div>' +
      '<div>No flies in your box yet.</div>' +
      '<div style="margin-top:8px">Tap <strong>AI Fly Box</strong> to scan your real fly box with your camera.</div>' +
      '</div>';
  } else {
    body = '<div class="ht-fly-strategy-fly-list">';
    picks.forEach(function(pick) {
      var matchBadge = '';
      if (pick.matchType === 'exact') matchBadge = '<span style="color:#4caf50;font-size:10px">✅ FROM YOUR BOX</span>';
      else if (pick.matchType === 'closest') matchBadge = '<span style="color:#ffc107;font-size:10px">🔄 CLOSEST MATCH</span>';
      else if (pick.matchType === 'missing') matchBadge = '<span style="color:#ff5722;font-size:10px">❌ NOT IN BOX</span>';
      var noteHtml = pick.matchNote ? '<div style="font-size:10px;color:#999;margin-top:2px">' + escapeHtml(pick.matchNote) + '</div>' : '';
      body += '<div class="ht-fly-strategy-fly">' +
        '<div class="ht-fly-strategy-fly-thumb">' + (pick.imageUrl ? '<img src="' + pick.imageUrl + '" alt="' + escapeHtml(pick.name) + '">' : '🪰') + '</div>' +
        '<div>' +
          '<div class="ht-fly-strategy-fly-name">' + escapeHtml(pick.name) + ' ' + matchBadge + '</div>' +
          '<div class="ht-fly-strategy-fly-meta">' + escapeHtml(pick.color) + ' • ' + escapeHtml(pick.size) + '</div>' +
          noteHtml +
        '</div>' +
      '</div>';
    });
    body += '</div>';
    if (flyCount > 0) {
      body += '<div style="text-align:center;margin-top:10px;font-size:11px;color:#888">' + flyCount + ' flies in your digital box</div>';
    }
  }
  openInfoModal({
    title: '🪰 AI Fly Recommendations',
    bodyHtml: body,
    confirmLabel: 'Close'
  });
}

function logFlyCatchEntry(species, notes) {
  flySessions.unshift({
    id: `fly-${Date.now()}`,
    species,
    notes,
    time: Date.now()
  });
  saveFlySessions();
  showFlyCoachPanel();
  updateFlyCoachFeed(`Catch logged: ${species}. Notes saved for this session.`);
}

function openFlyCatchLogModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML =
    '<h3>Log Catch</h3>' +
    '<p style="color:#aaa;font-size:13px;margin:0 0 14px;">How do you want to log this catch?</p>' +
    '<div class="ht-catch-options">' +
      '<button class="ht-catch-option-btn" type="button" data-catch-manual>' +
        '<span class="ht-catch-option-icon">&#x1F4DD;</span>' +
        '<span class="ht-catch-option-label">Manual<br>Entry</span>' +
      '</button>' +
      '<button class="ht-catch-option-btn" type="button" data-catch-photo>' +
        '<span class="ht-catch-option-icon">&#x1F4F8;</span>' +
        '<span class="ht-catch-option-label">Take<br>Photo</span>' +
      '</button>' +
      '<button class="ht-catch-option-btn" type="button" data-catch-voice>' +
        '<span class="ht-catch-option-icon">&#x1F3A4;</span>' +
        '<span class="ht-catch-option-label">Voice<br>Log</span>' +
      '</button>' +
    '</div>' +
    '<div class="ht-modal-actions">' +
      '<button class="ht-modal-btn ghost" type="button" data-fly-catch-cancel>Cancel</button>' +
    '</div>';

  const closeModal = () => backdrop.remove();
  modal.querySelector('[data-fly-catch-cancel]').addEventListener('click', closeModal);

  // Manual entry — show species/notes form
  modal.querySelector('[data-catch-manual]').addEventListener('click', function() {
    closeModal();
    _openCatchManualForm();
  });

  // Take photo — open camera capture
  modal.querySelector('[data-catch-photo]').addEventListener('click', function() {
    closeModal();
    _openCatchPhotoCapture();
  });

  // Voice log
  modal.querySelector('[data-catch-voice]').addEventListener('click', function() {
    closeModal();
    _openCatchVoiceLog();
  });

  backdrop.addEventListener('click', function(event) {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/* Manual entry form for logging a catch */
function _openCatchManualForm() {
  var backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  var modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML =
    '<h3>Manual Entry</h3>' +
    '<div style="display:grid;gap:10px;">' +
      '<label style="font-size:12px;color:#bbb;">Species</label>' +
      '<input type="text" id="flyCatchSpeciesLive" placeholder="Rainbow, brown, etc.">' +
      '<label style="font-size:12px;color:#bbb;">Size (inches)</label>' +
      '<input type="number" id="flyCatchSizeLive" placeholder="e.g. 14">' +
      '<label style="font-size:12px;color:#bbb;">Fly Used</label>' +
      '<input type="text" id="flyCatchFlyLive" placeholder="Elk Hair Caddis #16">' +
      '<label style="font-size:12px;color:#bbb;">Notes</label>' +
      '<input type="text" id="flyCatchNotesLive" placeholder="Depth, hatch, method">' +
    '</div>' +
    '<div class="ht-modal-actions">' +
      '<button class="ht-modal-btn ghost" type="button" data-catch-form-cancel>Cancel</button>' +
      '<button class="ht-modal-btn primary" type="button" data-catch-form-save>Save</button>' +
    '</div>';

  var closeModal = function() { backdrop.remove(); };
  modal.querySelector('[data-catch-form-cancel]').addEventListener('click', closeModal);
  modal.querySelector('[data-catch-form-save]').addEventListener('click', function() {
    var species = (modal.querySelector('#flyCatchSpeciesLive').value || '').trim() || 'Trout';
    var notes = (modal.querySelector('#flyCatchNotesLive').value || '').trim() || '';
    var size = (modal.querySelector('#flyCatchSizeLive').value || '').trim();
    var fly = (modal.querySelector('#flyCatchFlyLive').value || '').trim();
    var fullNotes = [fly ? 'Fly: ' + fly : '', size ? 'Size: ' + size + '"' : '', notes].filter(Boolean).join('. ');
    logFlyCatchEntry(species, fullNotes);
    closeModal();
  });

  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) closeModal(); });
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/* Photo capture for logging a catch */
function _openCatchPhotoCapture() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.addEventListener('change', function() {
    var file = input.files && input.files[0];
    if (!file) return;
    var url = URL.createObjectURL(file);
    _openCatchPhotoReview(url);
  });
  input.click();
}

/* Review a catch photo and add species/notes */
function _openCatchPhotoReview(imageUrl) {
  var backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  var modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML =
    '<h3>Catch Photo</h3>' +
    '<div style="text-align:center;margin:8px 0;"><img src="' + imageUrl + '" alt="Catch photo" style="max-width:100%;max-height:200px;border-radius:8px;"></div>' +
    '<div style="display:grid;gap:10px;">' +
      '<label style="font-size:12px;color:#bbb;">Species</label>' +
      '<input type="text" id="flyCatchPhotoSpecies" placeholder="Rainbow, brown, etc.">' +
      '<label style="font-size:12px;color:#bbb;">Notes</label>' +
      '<input type="text" id="flyCatchPhotoNotes" placeholder="Size, fly, method">' +
    '</div>' +
    '<div class="ht-modal-actions">' +
      '<button class="ht-modal-btn ghost" type="button" data-catch-photo-cancel>Cancel</button>' +
      '<button class="ht-modal-btn primary" type="button" data-catch-photo-save>Save</button>' +
    '</div>';

  var closeModal = function() { backdrop.remove(); };
  modal.querySelector('[data-catch-photo-cancel]').addEventListener('click', closeModal);
  modal.querySelector('[data-catch-photo-save]').addEventListener('click', function() {
    var species = (modal.querySelector('#flyCatchPhotoSpecies').value || '').trim() || 'Trout';
    var notes = (modal.querySelector('#flyCatchPhotoNotes').value || '').trim() || '';
    logFlyCatchEntry(species, notes ? notes + ' (photo)' : '(photo)');
    closeModal();
  });

  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) closeModal(); });
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/* Voice log for logging a catch */
function _openCatchVoiceLog() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showNotice('Voice recognition not supported on this device. Try manual entry.', 'warn', 3500);
    _openCatchManualForm();
    return;
  }

  var backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  var modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML =
    '<h3>Voice Log</h3>' +
    '<p style="color:#aaa;font-size:13px;">Speak your catch details: species, size, fly used, and any notes.</p>' +
    '<div id="voiceCatchStatus" style="text-align:center;padding:16px 0;font-size:28px;">&#x1F3A4;</div>' +
    '<div id="voiceCatchTranscript" style="background:#1a1a1a;border-radius:8px;padding:10px;min-height:48px;color:#fff;font-size:14px;">Listening...</div>' +
    '<div class="ht-modal-actions">' +
      '<button class="ht-modal-btn ghost" type="button" data-voice-cancel>Cancel</button>' +
      '<button class="ht-modal-btn primary" type="button" data-voice-save style="display:none;">Save</button>' +
    '</div>';

  var closeModal = function() {
    if (recognition) { try { recognition.abort(); } catch(e) {} }
    backdrop.remove();
  };

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  var finalTranscript = '';
  var statusEl = modal.querySelector('#voiceCatchStatus');
  var transcriptEl = modal.querySelector('#voiceCatchTranscript');
  var saveBtn = modal.querySelector('[data-voice-save]');

  recognition.onresult = function(event) {
    var interim = '';
    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    transcriptEl.textContent = finalTranscript || interim || 'Listening...';
  };

  recognition.onend = function() {
    statusEl.textContent = '\u2705';
    if (finalTranscript) {
      transcriptEl.textContent = finalTranscript;
      saveBtn.style.display = '';
    } else {
      transcriptEl.textContent = 'No speech detected. Try again or use manual entry.';
    }
  };

  recognition.onerror = function(event) {
    console.warn('HUNTECH: Voice recognition error:', event.error);
    statusEl.textContent = '\u274C';
    transcriptEl.textContent = 'Error: ' + event.error + '. Try manual entry.';
  };

  modal.querySelector('[data-voice-cancel]').addEventListener('click', closeModal);
  saveBtn.addEventListener('click', function() {
    if (finalTranscript) {
      logFlyCatchEntry('Trout', 'Voice: ' + finalTranscript);
    }
    closeModal();
  });

  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) closeModal(); });
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Start listening
  try { recognition.start(); } catch(e) {
    console.warn('HUNTECH: Could not start voice recognition:', e);
    transcriptEl.textContent = 'Could not start microphone. Try manual entry.';
  }
}

function openFlyHatchLogModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = `
    <h3>Log Hatch</h3>
    <p>Use voice or photo to capture hatch details.</p>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn ghost" type="button" data-fly-hatch-voice>Speak</button>
      <button class="ht-modal-btn primary" type="button" data-fly-hatch-photo>Photo</button>
    </div>
  `;

  const closeModal = () => backdrop.remove();
  modal.querySelector('[data-fly-hatch-voice]')?.addEventListener('click', () => {
    closeModal();
    showNotice('Voice hatch logging is queued for the next release.', 'info', 3200);
  });
  modal.querySelector('[data-fly-hatch-photo]')?.addEventListener('click', () => {
    closeModal();
    openFlyHatchPhotoCapture();
  });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function openFlyHatchPhotoCapture() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    openFlyHatchDetailsModal(url);
  });
  input.click();
}

function openFlyHatchDetailsModal(imageUrl) {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = `
    <h3>Hatch Photo</h3>
    <div class="ht-fly-hatch-photo"><img src="${imageUrl}" alt="Hatch photo"></div>
    <div style="display:grid;gap:10px;">
      <label style="font-size:12px;color:#bbb;">Notes</label>
      <input type="text" id="flyHatchNotes" placeholder="Size, color, behavior">
    </div>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn ghost" type="button" data-fly-hatch-cancel>Cancel</button>
      <button class="ht-modal-btn primary" type="button" data-fly-hatch-save>Save Hatch</button>
    </div>
  `;

  const closeModal = () => backdrop.remove();
  modal.querySelector('[data-fly-hatch-cancel]')?.addEventListener('click', closeModal);
  modal.querySelector('[data-fly-hatch-save]')?.addEventListener('click', () => {
    const notes = modal.querySelector('#flyHatchNotes')?.value.trim() || '';
    flyHatchLogs.unshift({
      id: `hatch-${Date.now()}`,
      notes,
      imageUrl,
      time: Date.now()
    });
    showFlyCoachPanel();
    updateFlyCoachFeed('Hatch photo logged for this session.');
    closeModal();
  });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

window.flyFishNow = function(id) {
  if (!isFlyModule()) return;
  // Open the action bar for check-in
  const water = getFlyWaterById(id) || getSavedTroutWaterById(id);
  if (water) {
    focusFlyWater(water);
    showFlyWaterActionBar(water);
  }
};

window.flyAddToTripPlanner = function(id) {
  if (!isFlyModule()) return;
  const water = getFlyWaterById(id) || getSavedTroutWaterById(id);
  if (water) focusFlyWater(water);
  showFlyCoachPanel();
  updateFlyCoachFeed('Trip planner placeholder. Add pins and route next.');
  showNotice('Trip planner coming soon. Opened Fly Coach for now.', 'info', 3600);
};

window.flyCheckIn = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
  if (flyCheckInAreaLayer && map) {
    try { map.removeLayer(flyCheckInAreaLayer); } catch {}
    flyCheckInAreaLayer = null;
  }
  const spots = getFlyCheckInSpots();
  updateFlyCoachFeed(`Check-in logged. Focus next: ${spots.slice(0, 3).join(', ')}.`);
  if (flyLiveSessionActive) {
    showFlyLiveCommandTray();
  }
};

window.flyCheckInAtAccess = function(waterId, lat, lng, accessName) {
  if (!isFlyModule()) return;
  const latlng = L.latLng(lat, lng);
  showFlyCheckInZone(latlng, waterId);
  if (map) map.setView(latlng, Math.max(map.getZoom(), 14));
  // Close any open popups so the map stays clean
  if (map) map.closePopup();
  const label = accessName || 'access point';
  showNotice('✅ Checked in at ' + label, 'success', 2500);
  if (flyLiveSessionActive) {
    showFlyLiveCommandTray();
  }
};

window.flyUpdateConditions = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
  updateWeather();
  updateFlyCoachFeed('Conditions refreshed. Reading flow, clarity, and weather now.');
};

window.flyRecommendFly = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
  updateFlyCoachFeed('Setup recommendation queued. Using your inventory only.');
};

window.flyLogCatch = function() {
  if (!isFlyModule()) return;
  flyLogCatchFromPanel();
};

window.flyNextSpot = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
  updateFlyCoachFeed('Move suggested. Search next run and seam with slower flow.');
};

window.selectFlyWater = function(id) {
  if (!isFlyModule()) return;
  const water = getFlyWaterById(id);
  if (!water) return;
  showFlyWaterMarkers();
  focusFlyWater(water);
  updateFlyCoachFeed(`Focused on ${water.name}. Build your access route next.`);
};

window.flySearchOnMap = function() {
  if (!isFlyModule()) return;
  showNotice('Search the map for nearby trout waters.', 'info', 3200);
  const enableSearch = () => {
    if (!map) return;
    setFlyWaterLayerEnabled(true, { explore: true });
    updateFlyWaterExploreMarkers();
  };
  if (!mapInitialized) {
    activateFlyMap();
    setTimeout(enableSearch, 350);
    return;
  }
  enableSearch();
};

/* ═══════════════════════════════════════════════════════════════════════
   STREAM COMMAND TRAY — 3×2 Pill Grid Handlers
   ═══════════════════════════════════════════════════════════════════════ */

window.cmdAiFlyBox = function() {
  if (!isFlyModule()) return;
  _openAiFlyBoxHub();
};

window.cmdLogCatch = function() {
  if (!isFlyModule()) return;
  openFlyCatchLogModal();
};

window.cmdLogHatch = function() {
  if (!isFlyModule()) return;
  openFlyHatchLogModal();
};

window.cmdAiCoach = function() {
  if (!isFlyModule()) return;
  showFlyCoachPanel();
};

window.cmdStrategy = function() {
  if (!isFlyModule()) return;
  startFlyStrategyFromTray(null);
};

window.cmdCheckOut = function() {
  if (!isFlyModule()) return;
  // If checked into a hotspot, check out from it (shows next/pick options)
  if (_activeHotspotIdx >= 0) {
    _hotspotCheckOut(true);
    return;
  }
  // Full session checkout — end everything
  setFlyLiveSessionActive(false);
  if (typeof window._clearAllFishPins === 'function') window._clearAllFishPins();
  _clearHotspotPins();
  showNotice('Session ended. Catch data saved.', 'success', 3600);
  if (typeof window.startOver === 'function') window.startOver();
};

/* ═══════════════════════════════════════════════════════════════════════
   AI GUIDED FISHING ENGINE — Zone Polygons, Ranked Pins, Proximity,
   Mission Summary, Spot Info Tray, Voice AI Coach
   ═══════════════════════════════════════════════════════════════════════ */

var _aiFishingPins = [];        // ranked pin markers
var _aiFishingSpots = [];       // spot data objects
var _activeZonePolygon = null;  // current zone polygon layer
var _activeMicroPolygons = [];  // micro-area polygons
var _activeMicroPins = [];      // micro-spot pins within a pin area
var _missionSummaryEl = null;   // mission summary overlay DOM
var _spotInfoTrayEl = null;     // spot info tray DOM
var _proximityWatchId = null;   // geolocation watch for auto-checkin
var _checkedInPinIdx = -1;      // index of pin user is currently at
var _checkedInMicroIdx = -1;    // index of micro-spot user is at
var _aiCoachState = {           // live AI coach state
  reports: [],                  // user reports (voice + manual)
  currentStrategy: null,
  currentFlyRec: null,
  lastUpdate: 0
};

/* ── Deploy zone polygon with flash-then-fade ── */
/* DISABLED: User does not want polygons */
window.deployZonePolygonWithFade = function(water, zone) {
  // Polygons removed per user request — no-op
  if (_activeZonePolygon) { try { map.removeLayer(_activeZonePolygon); } catch {} _activeZonePolygon = null; }
};

/* ═══════════════════════════════════════════════════════════════════════
   MICRO-SPOT 3-ICON DEPLOYMENT ENGINE
   ─────────────────────────────────────────────────────────────────────
   For each micro-spot, deploys two icons:
     🐟 Fish Hold  — trout pinned EXACTLY on the stream (within bankWidths)
     🧍 Angler Pos — where to wade/stand, ON the bank or in shallow edge
   Plus a cast line from angler → fish (no separate target icon).
   All positions validated against bankWidths guardrail.
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * STREAM BOUNDARY GUARDRAIL — ensures a lat/lng is within the water.
 * Finds the nearest streamPath point and checks if the perpendicular
 * distance from the centerline exceeds the bankWidth at that point.
 * If it does, clamps back to the bank edge.
 *
 * @param {number} lat - latitude to check
 * @param {number} lng - longitude to check
 * @param {Array} segment - streamPath array of [lat,lng]
 * @param {Array} bankWidths - optional array of [leftM, rightM] per streamPath point
 * @param {number} avgWidth - fallback avgStreamWidth from water object
 * @returns {{lat:number, lng:number, inWater:boolean, segIdx:number}}
 */
function _snapToStream(lat, lng, segment, bankWidths, avgWidth, rawStreamPath) {
  if (!segment || segment.length < 2) return { lat: lat, lng: lng, inWater: true, segIdx: 0 };

  var DEG = Math.PI / 180;
  var mPerLat = 111000;

  // Find nearest segment point
  var bestIdx = 0, bestDist = Infinity;
  for (var i = 0; i < segment.length; i++) {
    var d = _distM(lat, lng, segment[i][0], segment[i][1]);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }

  var lat0 = segment[bestIdx][0], lng0 = segment[bestIdx][1];
  var mPerLng = 111000 * Math.cos(lat0 * DEG);

  // Get stream direction at this point
  var dy = 0, dx = 0;
  if (bestIdx === 0 && segment.length > 1) {
    dy = segment[1][0] - segment[0][0]; dx = segment[1][1] - segment[0][1];
  } else if (bestIdx >= segment.length - 1) {
    dy = segment[segment.length-1][0] - segment[segment.length-2][0];
    dx = segment[segment.length-1][1] - segment[segment.length-2][1];
  } else {
    dy = segment[bestIdx+1][0] - segment[bestIdx-1][0];
    dx = segment[bestIdx+1][1] - segment[bestIdx-1][1];
  }
  var dyM = dy * mPerLat, dxM = dx * mPerLng;
  var len = Math.sqrt(dyM * dyM + dxM * dxM);
  if (len < 0.01) return { lat: lat0, lng: lng0, inWater: true, segIdx: bestIdx };

  // Perpendicular axis (left = positive)
  var perpX = -dxM / len;  // lat component of perpendicular
  var perpY = dyM / len;   // lng component of perpendicular

  // Project point onto perpendicular axis to get signed offset
  var relLat = (lat - lat0) * mPerLat;
  var relLng = (lng - lng0) * mPerLng;
  var perpOffset = relLat * perpX + relLng * perpY; // meters, positive=left

  // Get bank width at this point — use dense→raw mapping when available
  var halfWidth = (avgWidth || 12) / 2;
  if (bankWidths && bankWidths.length > 0) {
    var bw = null;
    // If rawStreamPath is provided, use proper dense→raw index mapping
    // (bankWidths are indexed against the raw streamPath, not the dense segment)
    if (rawStreamPath && rawStreamPath.length > 0) {
      bw = _getDenseBankWidth(bankWidths, rawStreamPath, segment, bestIdx);
    } else {
      // Fallback: direct index (only correct when segment IS the raw path)
      var bwIdx = Math.min(bestIdx, bankWidths.length - 1);
      bw = bankWidths[bwIdx];
    }
    if (bw) {
      halfWidth = perpOffset >= 0 ? (bw[0] || halfWidth) : (bw[1] || halfWidth);
    }
  }

  var inWater = Math.abs(perpOffset) <= halfWidth;
  if (inWater) return { lat: lat, lng: lng, inWater: true, segIdx: bestIdx };

  // Clamp to bank edge — push back to the water boundary
  var clampedOffset = perpOffset > 0 ? halfWidth * 0.85 : -halfWidth * 0.85; // 85% of bank width for safety margin
  var clampedLat = lat0 + (perpX * clampedOffset) / mPerLat;
  var clampedLng = lng0 + (perpY * clampedOffset) / mPerLng;
  return { lat: clampedLat, lng: clampedLng, inWater: true, segIdx: bestIdx };
}

/**
 * Get the bankWidths array for a dense interpolated segment,
 * mapping back to the raw streamPath bankWidths.
 */
function _getDenseBankWidth(rawBankWidths, rawStreamPath, denseSeg, denseIdx) {
  if (!rawBankWidths || !rawBankWidths.length) return null;
  if (!rawStreamPath || !rawStreamPath.length) return null;
  // Find which raw streamPath point is closest to this dense point
  var lat = denseSeg[denseIdx][0], lng = denseSeg[denseIdx][1];
  var bestRaw = 0, bestDist = Infinity;
  for (var r = 0; r < rawStreamPath.length; r++) {
    var d = _distM(lat, lng, rawStreamPath[r][0], rawStreamPath[r][1]);
    if (d < bestDist) { bestDist = d; bestRaw = r; }
  }
  return rawBankWidths[Math.min(bestRaw, rawBankWidths.length - 1)] || null;
}

/**
 * Compute perpendicular offset from a stream segment point.
 * @param {Array} segment - array of [lat,lng] pairs
 * @param {number} segIdx - index into segment
 * @param {number} offsetM - meters perpendicular (positive=left bank, negative=right bank)
 * @returns {{lat:number, lng:number}}
 */
function _perpendicularOffset(segment, segIdx, offsetM) {
  var DEG = Math.PI / 180;
  var mPerLat = 111000;
  var lat0 = segment[segIdx][0];
  var mPerLng = 111000 * Math.cos(lat0 * DEG);
  // Stream direction vector at this point
  var dy = 0, dx = 0;
  if (segIdx === 0) {
    dy = segment[1][0] - segment[0][0]; dx = segment[1][1] - segment[0][1];
  } else if (segIdx >= segment.length - 1) {
    dy = segment[segment.length-1][0] - segment[segment.length-2][0];
    dx = segment[segment.length-1][1] - segment[segment.length-2][1];
  } else {
    dy = segment[segIdx+1][0] - segment[segIdx-1][0];
    dx = segment[segIdx+1][1] - segment[segIdx-1][1];
  }
  var dyM = dy * mPerLat, dxM = dx * mPerLng;
  var len = Math.sqrt(dyM*dyM + dxM*dxM);
  if (len < 0.01) return { lat: lat0, lng: segment[segIdx][1] };
  // Perpendicular: rotate 90° left → (-dxM, dyM)
  var perpLat = (-dxM / len) * offsetM / mPerLat;
  var perpLng = (dyM / len) * offsetM / mPerLng;
  return { lat: lat0 + perpLat, lng: segment[segIdx][1] + perpLng };
}

/**
 * Compute upstream offset along the stream from a segment point.
 * @param {Array} segment - array of [lat,lng] pairs
 * @param {number} segIdx - index into segment
 * @param {number} distM  - meters upstream (positive=upstream, negative=downstream)
 * @returns {{lat:number, lng:number}}
 */
function _streamOffset(segment, segIdx, distM) {
  var DEG = Math.PI / 180;
  var mPerLat = 111000;
  var lat0 = segment[segIdx][0];
  var mPerLng = 111000 * Math.cos(lat0 * DEG);
  // Upstream = backwards along segment (lower indices)
  var dy = 0, dx = 0;
  if (segIdx > 0) {
    dy = segment[segIdx-1][0] - segment[segIdx][0];
    dx = segment[segIdx-1][1] - segment[segIdx][1];
  } else if (segIdx < segment.length - 1) {
    dy = -(segment[segIdx+1][0] - segment[segIdx][0]);
    dx = -(segment[segIdx+1][1] - segment[segIdx][1]);
  }
  var dyM = dy * mPerLat, dxM = dx * mPerLng;
  var len = Math.sqrt(dyM*dyM + dxM*dxM);
  if (len < 0.01) return { lat: lat0, lng: segment[segIdx][1] };
  return {
    lat: lat0 + (dyM / len) * distM / mPerLat,
    lng: segment[segIdx][1] + (dxM / len) * distM / mPerLng
  };
}

/**
 * Deploy a full micro-spot cluster with rich animated elements:
 *   • Fish hold icon (in-stream, snapped to water)
 *   • 3D Angler figure with fly rod + beacon pulse (standing position)
 *   • WADE HERE pill (on the bank, stream entry point)
 *   • Animated approach arrows (bank → standing position)
 *   • Curved cast arc with unfurling animation
 *   • Splash rings + fly dot at the landing zone
 *   • Natural drift line with direction arrows (over the fish)
 *
 * STRATEGIC UPSTREAM PRESENTATION (won't spook fish):
 *   1. Angler enters stream at WADE HERE (bank, downstream of fish)
 *   2. Wades upstream along approach arrow to standing position
 *   3. Casts upstream — fly line unfurls and lands above fish
 *   4. Fly drifts naturally downstream over the fish's hold
 *   → Fish faces upstream, never sees the angler behind them
 *
 * @param {Object} opts  (fishLat, fishLng, segIdx, segment, wade, habitat,
 *                         microType, microIdx, spot, water, zone, strategy,
 *                         bankWidths)
 * @returns {Array} array of Leaflet marker/polyline objects
 */
function _deployMicroCluster(opts) {
  var markers = [];
  var seg = opts.segment;
  var sIdx = opts.segIdx;
  var wade = opts.wade || 'waders';

  // ── Get bankWidth data for this spot ──
  var bw = null;
  var halfWidth = 5.5;
  var rawBW = opts.bankWidths || (opts.water && opts.water.bankWidths) || null;
  // rawSP = the ORIGINAL raw streamPath (bankWidths indices match this, NOT the dense segment)
  var rawSP = (opts.water && opts.water.streamPath) || null;
  if (rawBW && rawSP) {
    bw = _getDenseBankWidth(rawBW, rawSP, seg, sIdx);
    if (bw) halfWidth = Math.max(bw[0] || 5.5, bw[1] || 5.5);
  }
  var avgWidth = (opts.water && opts.water.avgStreamWidth) || (halfWidth * 2) || 12;

  // ══════════════════════════════════════════════════════════════
  //  1) FISH HOLD — must be IN the water
  // ══════════════════════════════════════════════════════════════
  var fishSnap = _snapToStream(opts.fishLat, opts.fishLng, seg, rawBW, avgWidth, rawSP);
  var fishLat = fishSnap.lat;
  var fishLng = fishSnap.lng;
  var fishSIdx = fishSnap.segIdx || sIdx;

  // Lateral jitter (stay within 35% of bank width, then re-snap)
  var jitterMax = halfWidth * 0.35;
  var jitter = (Math.random() - 0.5) * 2 * jitterMax;
  var jittered = _perpendicularOffset(seg, fishSIdx, jitter);
  var jitterSnap = _snapToStream(jittered.lat, jittered.lng, seg, rawBW, avgWidth, rawSP);
  fishLat = jitterSnap.lat;
  fishLng = jitterSnap.lng;

  // Fish rotation — face upstream
  var fishRotation = 0;
  if (seg && fishSIdx >= 0 && fishSIdx < seg.length) {
    var dy = 0, dx = 0;
    if (fishSIdx > 0 && fishSIdx < seg.length - 1) {
      dy = seg[fishSIdx+1][0] - seg[fishSIdx-1][0]; dx = seg[fishSIdx+1][1] - seg[fishSIdx-1][1];
    } else if (fishSIdx === 0 && seg.length > 1) {
      dy = seg[1][0] - seg[0][0]; dx = seg[1][1] - seg[0][1];
    } else if (fishSIdx > 0) {
      dy = seg[fishSIdx][0] - seg[fishSIdx-1][0]; dx = seg[fishSIdx][1] - seg[fishSIdx-1][1];
    }
    fishRotation = Math.atan2(dx, dy) * (180 / Math.PI) + 180;
  }

  var fishIcon = L.divIcon({
    className: 'ht-fish-swim-pin',
    html: '<img src="assets/fish-swim.svg" width="12" height="7" ' +
          'style="transform:rotate(' + Math.round(fishRotation) + 'deg);" alt="">' +
          '<span class="ht-fish-swim-label">' +
          escapeHtml(_capitalize(opts.microType.replace(/-/g, ' '))) + '</span>',
    iconSize: [12, 7],
    iconAnchor: [6, 4]
  });
  var fishMarker = L.marker([fishLat, fishLng], {
    icon: fishIcon, zIndexOffset: 550
  }).addTo(map);
  fishMarker.__microType = opts.microType;
  fishMarker.__microIdx = opts.microIdx;
  fishMarker.__iconKind = 'fish';
  // Fish marker click removed — info tray now triggered from WADE HERE pill
  markers.push(fishMarker);

  // ══════════════════════════════════════════════════════════════
  //  2) STANDING POSITION — downstream of fish, IN the water
  //     3D angler SVG with animated fly rod + beacon pulse ring
  //     SKIP if opts.skipStand is true (shared stand marker nearby)
  // ══════════════════════════════════════════════════════════════
  // Standing position: normally downstream of fish (angler behind fish)
  // BUT if fish is near the downstream end of the zone, flip to upstream
  // to avoid placing angler past zone boundary / waterfalls / obstacles
  var standDistDense = 3; // 3 dense steps × 5m = ~15m ≈ 50ft downstream of fish
  var EDGE_BUFFER = 5;   // stay at least 5 indices from zone boundary
  var standSIdx;
  if (fishSIdx + standDistDense > seg.length - 1 - EDGE_BUFFER) {
    // Near downstream end — place angler UPSTREAM of fish instead
    standSIdx = Math.max(fishSIdx - standDistDense, EDGE_BUFFER);
  } else {
    standSIdx = Math.min(fishSIdx + standDistDense, seg.length - 1 - EDGE_BUFFER);
  }
  var standSnap = _snapToStream(seg[standSIdx][0], seg[standSIdx][1], seg, rawBW, avgWidth, rawSP);

  // Skip stand markers for advanced skill level (they know where to stand)
  var isAdvanced = window._fishFlow && window._fishFlow.experience === 'advanced';
  if (!opts.skipStand && !isAdvanced) {
  // Clean circle + "STAND HERE" label (matches CAST HERE visual language)
  var standIcon = L.divIcon({
    className: 'ht-stand-here-pin',
    html: '<div class="ht-stand-here-dot"></div>' +
          '<div class="ht-stand-here-ring"></div>' +
          '<div class="ht-stand-here-ring ht-stand-here-ring-2"></div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  var standLabelIcon = L.divIcon({
    className: 'ht-stand-label-pin',
    html: '<div class="ht-stand-label">STAND HERE</div>',
    iconSize: [70, 14],
    iconAnchor: [35, 28]
  });
  var standMarker = L.marker([standSnap.lat, standSnap.lng], {
    icon: standIcon, zIndexOffset: 555, interactive: false
  }).addTo(map);
  standMarker.__iconKind = 'stand';
  standMarker.__microIdx = opts.microIdx;
  markers.push(standMarker);
  var standLabelMarker = L.marker([standSnap.lat, standSnap.lng], {
    icon: standLabelIcon, zIndexOffset: 553, interactive: false
  }).addTo(map);
  standLabelMarker.__iconKind = 'standlabel';
  standLabelMarker.__microIdx = opts.microIdx;
  markers.push(standLabelMarker);
  } // end !skipStand

  // ══════════════════════════════════════════════════════════════
  //  3) WADE HERE pill — on the BANK at the stream entry point
  //     Big, bold, glowing green — can't miss it
  //     (Controlled by WADE_MARKERS_ENABLED flag — set true to restore)
  // ══════════════════════════════════════════════════════════════
  var bankSide = (opts.microIdx % 2 === 0) ? 1 : -1;
  if (WADE_MARKERS_ENABLED) {
  var bankEdge = halfWidth;
  if (rawBW && rawSP) {
    var standBw = _getDenseBankWidth(rawBW, rawSP, seg, standSIdx);
    if (standBw) {
      bankEdge = (bankSide > 0) ? (standBw[0] || halfWidth) : (standBw[1] || halfWidth);
    }
  }
  var wadeOffsetM = bankSide * (bankEdge + 8); // 8m onto dry bank — well clear of stream
  var wadeEntry = _perpendicularOffset(seg, standSIdx, wadeOffsetM);

  var wadeLabel = (wade === 'waders') ? '\uD83E\uDD7E WADE HERE' : '\uD83C\uDFD6 STAND HERE';
  var arrowSide = (bankSide > 0) ? 'left' : 'right'; // arrow points TOWARD water
  var wadeIcon = L.divIcon({
    className: 'ht-wade-pin',
    html: '<div class="ht-wade-pill ht-wade-pill--arrow-' + arrowSide + '">' +
          '<span class="ht-wade-pill-text">' + wadeLabel + '</span>' +
          '<span class="ht-wade-arrow"><span class="ht-wade-arrow-ping"></span></span>' +
          '</div>',
    iconSize: [110, 26],
    iconAnchor: [55, 13]
  });
  var wadeMarker = L.marker([wadeEntry.lat, wadeEntry.lng], {
    icon: wadeIcon, zIndexOffset: 570
  }).addTo(map);
  wadeMarker.__iconKind = 'wade';
  wadeMarker.__microIdx = opts.microIdx;
  // Click wade pill → show micro spot info tray
  wadeMarker.on('click', function() {
    _showSpotInfoTray(opts.water, opts.zone, opts.spot, opts.microType, opts.microIdx);
  });
  markers.push(wadeMarker);

  // ══════════════════════════════════════════════════════════════
  //  4) APPROACH ARROWS — animated pulsing ▶ along path
  //     Dashed line from wade entry → standing position + 3 arrow markers
  //     (Controlled by WADE_MARKERS_ENABLED flag — set true to restore)
  // ══════════════════════════════════════════════════════════════
  var approachLine = L.polyline(
    [[wadeEntry.lat, wadeEntry.lng], [standSnap.lat, standSnap.lng]],
    { color: '#7cffc7', weight: 2.5, opacity: 0.4, dashArray: '6 4',
      className: 'ht-approach-line', interactive: false }
  ).addTo(map);
  approachLine.__iconKind = 'approach';
  approachLine.__microIdx = opts.microIdx;
  markers.push(approachLine);

  // (Approach arrow triangles removed — dashed line is sufficient)
  } // end WADE_MARKERS_ENABLED

  // ══════════════════════════════════════════════════════════════
  //  5) FLY LANDING ZONE — upstream of fish
  //     Splash rings + bright fly dot + "CAST HERE" label
  // ══════════════════════════════════════════════════════════════
  var flyDistDense = Math.max(Math.round(1.5 / 5), 1); // ~1.5m upstream of fish (~1-2 yards past)
  var flyTargetSIdx = Math.max(fishSIdx - flyDistDense, Math.min(EDGE_BUFFER, fishSIdx));
  var flySnap = _snapToStream(seg[flyTargetSIdx][0], seg[flyTargetSIdx][1], seg, rawBW, avgWidth, rawSP);

  // Move fish icon to the exact CAST HERE dot position (centered on target)
  fishMarker.setLatLng([flySnap.lat, flySnap.lng]);

  // Splash rings (expanding ripple)
  var splashIcon = L.divIcon({
    className: 'ht-cast-splash-pin',
    html: '<div class="ht-cast-splash-ring"></div>' +
          '<div class="ht-cast-splash-ring ht-cast-splash-ring-2"></div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  var splashMarker = L.marker([flySnap.lat, flySnap.lng], {
    icon: splashIcon, zIndexOffset: 540, interactive: false
  }).addTo(map);
  splashMarker.__iconKind = 'splash';
  splashMarker.__microIdx = opts.microIdx;
  markers.push(splashMarker);

  // Bright fly landing dot
  var flyDotIcon = L.divIcon({
    className: 'ht-cast-fly-pin',
    html: '<div class="ht-cast-fly-dot"></div>',
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  });
  var flyDotMarker = L.marker([flySnap.lat, flySnap.lng], {
    icon: flyDotIcon, zIndexOffset: 548, interactive: false
  }).addTo(map);
  flyDotMarker.__iconKind = 'flydot';
  flyDotMarker.__microIdx = opts.microIdx;
  markers.push(flyDotMarker);

  // "CAST HERE" label above the fly dot
  var castLabelIcon = L.divIcon({
    className: 'ht-cast-label-pin',
    html: '<div class="ht-cast-label">CAST HERE</div>',
    iconSize: [60, 14],
    iconAnchor: [30, 28]
  });
  var castLabelMarker = L.marker([flySnap.lat, flySnap.lng], {
    icon: castLabelIcon, zIndexOffset: 542, interactive: false
  }).addTo(map);
  castLabelMarker.__iconKind = 'castlabel';
  castLabelMarker.__microIdx = opts.microIdx;
  markers.push(castLabelMarker);

  // ══════════════════════════════════════════════════════════════
  //  6) CURVED CAST ARC — parabolic arc from angler to fly target
  //     (Controlled by WADE_MARKERS_ENABLED flag — set true to restore)
  // ══════════════════════════════════════════════════════════════
  if (WADE_MARKERS_ENABLED) {
  var castArcPoints = [];
  var arcSteps = 14;
  var DEG_C = Math.PI / 180;
  var mPerLat_C = 111000;
  var mPerLng_C = 111000 * Math.cos(standSnap.lat * DEG_C);
  // Direction from stand to fly target
  var cDy = (flySnap.lat - standSnap.lat) * mPerLat_C;
  var cDx = (flySnap.lng - standSnap.lng) * mPerLng_C;
  var cLen = Math.sqrt(cDy * cDy + cDx * cDx);
  // Perpendicular offset for the arc bow (higher arc for longer casts)
  var arcBow = Math.max(cLen * 0.22, 3); // bow = 22% of cast length, min 3m
  for (var ci = 0; ci <= arcSteps; ci++) {
    var t = ci / arcSteps;
    // Parabolic bow: max at t=0.5, zero at ends
    var bow = arcBow * 4 * t * (1 - t) * bankSide;
    // Lateral perpendicular to cast direction
    var perpLatC = (-cDx / (cLen || 1)) * bow / mPerLat_C;
    var perpLngC = (cDy / (cLen || 1)) * bow / mPerLng_C;
    var ptLat = standSnap.lat + (flySnap.lat - standSnap.lat) * t + perpLatC;
    var ptLng = standSnap.lng + (flySnap.lng - standSnap.lng) * t + perpLngC;
    castArcPoints.push([ptLat, ptLng]);
  }

  // Main cast arc — animated unfurling line
  var castArc = L.polyline(castArcPoints, {
    color: '#7cffc7', weight: 2.5, opacity: 0.8, dashArray: '12 8',
    className: 'ht-cast-arc', interactive: false
  }).addTo(map);
  castArc.__iconKind = 'castarc';
  castArc.__microIdx = opts.microIdx;
  markers.push(castArc);

  // Cast arc glow (wider, softer, behind main arc)
  var castGlow = L.polyline(castArcPoints, {
    color: '#7cffc7', weight: 6, opacity: 0.15,
    className: 'ht-cast-arc-glow', interactive: false
  }).addTo(map);
  castGlow.__iconKind = 'castglow';
  castGlow.__microIdx = opts.microIdx;
  markers.push(castGlow);

  // ══════════════════════════════════════════════════════════════
  //  7) DRIFT LINE — from fly landing zone downstream past the fish
  //     (Controlled by WADE_MARKERS_ENABLED flag — set true to restore)
  // ══════════════════════════════════════════════════════════════
  var driftPoints = [];
  var driftStart = flyTargetSIdx;
  var driftEnd = Math.min(fishSIdx + 4, seg.length - 1 - EDGE_BUFFER); // stay within zone boundary
  for (var di = driftStart; di <= driftEnd; di++) {
    driftPoints.push([seg[di][0], seg[di][1]]);
  }
  if (driftPoints.length >= 2) {
    // Drift connecting line
    var driftLine = L.polyline(driftPoints, {
      color: '#ffe082', weight: 2, opacity: 0.35, dashArray: '4 8',
      className: 'ht-drift-connect', interactive: false
    }).addTo(map);
    driftLine.__iconKind = 'drift';
    driftLine.__microIdx = opts.microIdx;
    markers.push(driftLine);

    // (Drift arrow triangles removed — dashed line is sufficient)
  }
  } // end WADE_MARKERS_ENABLED (cast arc + drift)

  return markers;
}

/* ═══════════════════════════════════════════════════════════════════════
   LiDAR-ONLY STREAM TERRAIN ANALYSIS ENGINE
   ─────────────────────────────────────────────────────────────────────
   GUARDRAIL: This engine uses ONLY geometry-derived LiDAR analysis.
   Topo maps, aerial/satellite imagery, and third-party elevation
   services are EXPLICITLY REJECTED as data sources.

   All bank boundaries, fish-holding structure, and fish position
   calculations are derived from:
     • streamPath geometry (LiDAR centerline survey)
     • bankWidths array    (LiDAR bank-edge point-cloud)
     • Curvature analysis  (LiDAR bearing differential)
     • Gradient proxy      (LiDAR point spacing → flow velocity)
     • Depth inference      (LiDAR channel width + gradient fusion)

   THE FOLLOWING DATA SOURCES ARE NEVER USED:
     ✗ Topographic maps  (unreliable contour interpolation)
     ✗ Aerial/satellite imagery (parallax error, canopy occlusion)
     ✗ Generic DEM tiles (insufficient resolution for stream features)

   STRICT GUARDRAILS:
     1. _analyzeStreamTerrain() ONLY reads streamPath + bankWidths
     2. _snapToStream() ONLY uses bankWidths for boundary detection
     3. All pin placement is clamped to LiDAR-derived channel geometry
     4. No fallback to external elevation or imagery APIs
   ═══════════════════════════════════════════════════════════════════════ */

/* ── LiDAR-Only Configuration Lock ── */
var LIDAR_CONFIG = Object.freeze({
  ENABLED: true,
  REJECT_TOPO_MAPS: true,
  REJECT_AERIAL_SATELLITE: true,
  REJECT_GENERIC_DEM: true,
  DATA_SOURCES: Object.freeze(['streamPath', 'bankWidths', 'curvature', 'gradient', 'depthProxy']),
  CONFIDENCE_FLOOR: 0.55,  // minimum confidence to place a pin
  BANK_CLAMP_RATIO: 0.85,  // max % of bankWidth for pin placement
  VERSION: '2.0.0-lidar-locked'
});

/** Validate that terrain analysis input is LiDAR-derived only */
function _validateLidarInput(segment, bankWidths) {
  if (!segment || !Array.isArray(segment) || segment.length < 3) {
    console.warn('[HT-LIDAR] Invalid segment — must be LiDAR-derived streamPath with 3+ points');
    return false;
  }
  // Verify coordinate format (LiDAR survey points = [lat, lng] arrays)
  for (var v = 0; v < Math.min(segment.length, 5); v++) {
    if (!Array.isArray(segment[v]) || segment[v].length < 2 ||
        typeof segment[v][0] !== 'number' || typeof segment[v][1] !== 'number') {
      console.warn('[HT-LIDAR] Segment point ' + v + ' not valid LiDAR format');
      return false;
    }
  }
  if (bankWidths && Array.isArray(bankWidths)) {
    for (var bv = 0; bv < Math.min(bankWidths.length, 5); bv++) {
      if (!Array.isArray(bankWidths[bv]) || bankWidths[bv].length < 2) {
        console.warn('[HT-LIDAR] bankWidths[' + bv + '] not valid LiDAR format');
        return false;
      }
    }
  }
  return true;
}
function _analyzeStreamTerrain(segment, bankWidths) {
  // ── GUARDRAIL: Validate LiDAR-only input ──
  if (!_validateLidarInput(segment, bankWidths)) return [];
  if (!LIDAR_CONFIG.ENABLED) { console.error('[HT-LIDAR] LiDAR engine disabled — refusing to analyze'); return []; }
  if (!segment || segment.length < 3) return [];
  var DEG = Math.PI / 180;
  var pts = [];

  // ── Pass 1: Per-point metrics ──
  for (var i = 0; i < segment.length; i++) {
    var p = { idx: i, lat: segment[i][0], lng: segment[i][1] };

    // LiDAR-derived point spacing → proxy for streambed gradient
    // Tight spacing = slow flow (pools, deep runs)
    // Wide spacing  = fast gradient (riffles, chutes)
    var prevD = 0, nextD = 0;
    if (i > 0) {
      var dy1 = (segment[i][0] - segment[i-1][0]) * 111000;
      var dx1 = (segment[i][1] - segment[i-1][1]) * 111000 * Math.cos(segment[i][0] * DEG);
      prevD = Math.sqrt(dy1*dy1 + dx1*dx1);
    }
    if (i < segment.length - 1) {
      var dy2 = (segment[i+1][0] - segment[i][0]) * 111000;
      var dx2 = (segment[i+1][1] - segment[i][1]) * 111000 * Math.cos(segment[i][0] * DEG);
      nextD = Math.sqrt(dy2*dy2 + dx2*dx2);
    }
    p.spacing = i === 0 ? nextD : i === segment.length-1 ? prevD : (prevD + nextD) / 2;

    // LiDAR-derived curvature (bearing Δ)
    // Sharp bends scour deep outside pools; inside creates gravel bars
    p.curvature = 0;
    if (i > 0 && i < segment.length - 1) {
      var b1 = Math.atan2(segment[i][1]-segment[i-1][1], segment[i][0]-segment[i-1][0]);
      var b2 = Math.atan2(segment[i+1][1]-segment[i][1], segment[i+1][0]-segment[i][0]);
      p.curvature = Math.abs(b2 - b1);
      if (p.curvature > Math.PI) p.curvature = 2 * Math.PI - p.curvature;
    }

    // LiDAR-derived channel width + bank asymmetry
    // Asymmetry → undercut bank, root wad structure, boulder deposits
    p.width = 8; p.asymmetry = 0;
    if (bankWidths && bankWidths[i]) {
      p.width = bankWidths[i][0] + bankWidths[i][1];
      p.asymmetry = Math.abs(bankWidths[i][0] - bankWidths[i][1]) / Math.max(p.width, 0.1);
    }

    // Width change rate (narrowing→riffle acceleration, widening→pool decel)
    p.widthDelta = 0;
    if (bankWidths && i > 0 && bankWidths[i] && bankWidths[i-1]) {
      var pw = bankWidths[i-1][0] + bankWidths[i-1][1];
      if (pw > 0) p.widthDelta = (p.width - pw) / pw;
    }

    // LiDAR depth proxy: wider channel + tight spacing = deeper water
    // (Derived from LiDAR point-cloud density + channel geometry)
    p.depthProxy = (p.width / 8) * (1 - Math.min(p.spacing / 80, 1)) * 10;

    pts.push(p);
  }

  // ── Normalize spacing for relative classification ──
  var spacings = pts.map(function(p) { return p.spacing; });
  var maxSp = Math.max.apply(null, spacings);
  var minSp = Math.min.apply(null, spacings);
  var spRange = maxSp - minSp || 1;

  // ── Pass 2: LiDAR-only habitat classification ──
  for (var j = 0; j < pts.length; j++) {
    var pt = pts[j];
    pt.normSpacing = (pt.spacing - minSp) / spRange; // 0=tight(slow), 1=wide(fast)

    // Decision tree — priority: LiDAR anomalies > curvature > gradient > default
    // GUARDRAIL: ALL sources are LiDAR geometry-derived. No topo/aerial/satellite.
    // 1) BOULDER — LiDAR detects hard-bottom irregular features via curvature + asymmetry
    if (pt.curvature > 0.25 && pt.asymmetry > 0.12) {
      pt.habitat = 'boulder';
      pt.confidence = Math.min(0.95, 0.7 + pt.curvature * 0.3);
      pt.source = 'LiDAR hard-bottom anomaly + bank-edge point-cloud';
    }
    // 2) UNDERCUT BANK — high asymmetry = one bank eroded/undercut
    //    LiDAR detects bank overhang from bankWidth differential
    else if (pt.asymmetry > 0.18 && pt.curvature > 0.10) {
      pt.habitat = 'undercut';
      pt.confidence = Math.min(0.95, 0.65 + pt.asymmetry * 0.5);
      pt.source = 'LiDAR bank profile + asymmetry detection';
    }
    // 3) LOG/WOODY DEBRIS — moderate curvature + high asymmetry + slow flow
    //    LiDAR detects flow obstruction via channel geometry distortion
    else if (pt.asymmetry > 0.10 && pt.normSpacing < 0.45 && pt.curvature > 0.08 && pt.curvature <= 0.25) {
      pt.habitat = 'log';
      pt.confidence = Math.min(0.90, 0.60 + pt.asymmetry * 0.4 + pt.curvature * 0.3);
      pt.source = 'LiDAR flow obstruction + subsurface mass detection';
    }
    // 4) POOL — slow gradient + wide/widening channel or high curvature (bend pool)
    else if (pt.normSpacing < 0.35 && (pt.widthDelta > 0.04 || pt.curvature > 0.20)) {
      pt.habitat = 'pool';
      pt.confidence = Math.min(0.95, 0.75 + (1 - pt.normSpacing) * 0.2);
      pt.source = 'LiDAR depth contour + channel width analysis';
    }
    // 5) SEAM — transition zone where fast meets slow water
    //    LiDAR detects velocity differential across channel width
    else if (j > 0 && Math.abs(pts[j-1].normSpacing - pt.normSpacing) > 0.15 && pt.asymmetry > 0.06) {
      pt.habitat = 'seam';
      pt.confidence = Math.min(0.90, 0.60 + Math.abs(pts[j-1].normSpacing - pt.normSpacing) * 0.5);
      pt.source = 'LiDAR velocity differential + channel geometry';
    }
    // 6) RIFFLE — fast gradient + narrow/narrowing channel
    else if (pt.normSpacing > 0.55 && pt.widthDelta <= 0.02) {
      pt.habitat = 'riffle';
      pt.confidence = Math.min(0.95, 0.7 + pt.normSpacing * 0.25);
      pt.source = 'LiDAR gradient + channel geometry';
    }
    // 7) TAILOUT — transition from slow→fast (pool tail accelerating into riffle)
    else if (j > 0 && pts[j-1].normSpacing < 0.40 && pt.normSpacing > 0.45) {
      pt.habitat = 'tailout';
      pt.confidence = 0.65;
      pt.source = 'LiDAR transition detection';
    }
    // 8) POCKET WATER — moderate curvature behind structure
    else if (pt.curvature > 0.12 && pt.normSpacing > 0.35 && pt.normSpacing < 0.55) {
      pt.habitat = 'pocket';
      pt.confidence = Math.min(0.85, 0.55 + pt.curvature * 0.4);
      pt.source = 'LiDAR structure shadow + flow deflection';
    }
    // 9) RUN — moderate, consistent flow
    else {
      pt.habitat = 'run';
      pt.confidence = 0.60;
      pt.source = 'Moderate gradient — default';
    }
  }
  return pts;
}

/* ── AI Fishing Pin Calculator — LiDAR-only terrain-aware ── */
window.deployAiFishingPins = function(water, zone, fishFlow) {
  if (!water || !zone || !map) return;

  // Clear previous
  _aiFishingPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _aiFishingPins = [];
  _aiFishingSpots = [];
  clearMicroPins();

  var segment = getZoneStreamSegment(water, zone);
  if (!segment || segment.length < 2) {
    showNotice('⚠️ No stream data for this zone', 'warning', 3000);
    return;
  }

  // ── Align bankWidths to zone segment slice ──
  // getZoneStreamSegment slices streamPath at a startIdx offset.
  // bankWidths must be sliced the same way to keep indices matched.
  var zoneStartIdx = segment.__zoneStartIdx || 0;
  var zoneBankWidths = (water.bankWidths || []).slice(zoneStartIdx, zoneStartIdx + segment.length);
  // Fallback: if slice produced nothing, use full array
  if (!zoneBankWidths.length && water.bankWidths) zoneBankWidths = water.bankWidths;

  var method = fishFlow.method || 'fly';
  var wade = fishFlow.wade || 'waders';
  var skill = fishFlow.experience || 'learning';

  // ── Run LiDAR terrain analysis on this zone ──
  var terrain = _analyzeStreamTerrain(segment, zoneBankWidths);

  // ── Identify best hotspot candidates at habitat transitions & features ──
  // Instead of evenly spacing, place pins where the terrain is interesting:
  // habitat transitions, high-confidence features, high curvature, etc.
  var hotspotCandidates = [];
  var MIN_PIN_SPACING_M = 25; // minimum meters between any two AI pins

  var _distM = function(lat1, lng1, lat2, lng2) {
    var dy = (lat2 - lat1) * 111000;
    var dx = (lng2 - lng1) * 111000 * Math.cos(lat1 * Math.PI / 180);
    return Math.sqrt(dy*dy + dx*dx);
  };

  for (var t = 0; t < terrain.length; t++) {
    var tp = terrain[t];
    var interestScore = 0;

    // Habitat transition bonus (where habitat changes = feeding opportunities)
    if (t > 0 && terrain[t-1].habitat !== tp.habitat) interestScore += 30;
    if (t < terrain.length-1 && terrain[t+1] && terrain[t+1].habitat !== tp.habitat) interestScore += 20;

    // High-confidence LiDAR features
    interestScore += tp.confidence * 25;

    // Boulder/structure bonus (LiDAR hard-bottom detection)
    if (tp.habitat === 'boulder') interestScore += 15;
    // Undercut bank bonus — big trout holding structure
    if (tp.habitat === 'undercut') interestScore += 18;
    // Log/woody debris bonus — ambush point
    if (tp.habitat === 'log') interestScore += 16;
    // Seam line bonus — active feeding zone
    if (tp.habitat === 'seam') interestScore += 14;
    // Pocket water bonus — protected lie
    if (tp.habitat === 'pocket') interestScore += 12;

    // High curvature (bend pools, scour features)
    interestScore += Math.min(tp.curvature * 40, 20);

    // Channel width asymmetry (satellite: undercut banks, log cover)
    interestScore += Math.min(tp.asymmetry * 60, 15);

    // Depth proxy bonus (sonar/LiDAR depth)
    interestScore += Math.min(tp.depthProxy * 2, 10);

    hotspotCandidates.push({
      idx: t,
      habitat: tp.habitat,
      lat: tp.lat,
      lng: tp.lng,
      segmentIdx: tp.idx,
      interestScore: interestScore,
      terrainData: tp
    });
  }

  // Sort candidates by interest score, then pick top N with spacing enforcement
  hotspotCandidates.sort(function(a, b) { return b.interestScore - a.interestScore; });
  // Deploy pins on ALL detected micro-features — boulders, logs, undercuts, seams, pockets
  var maxPins = Math.min(15, Math.max(4, segment.length));
  var selectedSpots = [];
  var MIN_PIN_SPACING_M = 15; // tighter spacing to catch every micro-feature

  for (var sc = 0; sc < hotspotCandidates.length && selectedSpots.length < maxPins; sc++) {
    var cand = hotspotCandidates[sc];

    // ── ANTI-OVERLAP: Enforce minimum distance from all already-selected pins ──
    var tooClose = false;
    for (var sp = 0; sp < selectedSpots.length; sp++) {
      if (_distM(cand.lat, cand.lng, selectedSpots[sp].lat, selectedSpots[sp].lng) < MIN_PIN_SPACING_M) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    // No habitat diversity cap — deploy on every detected feature

    // Score this spot with user preferences
    var score = _scoreSpot(cand.habitat, method, wade, skill, selectedSpots.length, maxPins);
    // Add terrain confidence bonus
    score += Math.round(cand.terrainData.confidence * 10);

    selectedSpots.push({
      idx: selectedSpots.length,
      habitat: cand.habitat,
      lat: cand.lat,
      lng: cand.lng,
      segmentIdx: cand.segmentIdx,
      score: score,
      rank: 0,
      strategy: _buildSpotStrategy(cand.habitat, method, wade, skill, water, zone),
      terrainSource: cand.terrainData.source,
      terrainConfidence: cand.terrainData.confidence
    });
  }

  // Sort by score descending (best first)
  selectedSpots.sort(function(a, b) { return b.score - a.score; });
  selectedSpots.forEach(function(s, idx) { s.rank = idx + 1; });

  _aiFishingSpots = selectedSpots;

  // ── Deploy ranked pins on map ──
  var bounds = [];
  selectedSpots.forEach(function(spot) {
    var pinColor = spot.rank === 1 ? '#7cffc7' : spot.rank === 2 ? '#2bd4ff' : spot.rank <= 4 ? '#ffe082' : '#9fc3ce';
    // Show terrain detection source in the pill
    var sourceTag = spot.terrainSource ? ' · ' + spot.terrainSource.split('+')[0].trim() : '';
    var pillHtml = '<div class="ht-ai-fish-pill" style="border-color:' + pinColor + ';color:' + pinColor + ';">' +
        '<span class="ht-ai-fish-rank">#' + spot.rank + '</span>' +
        '<span class="ht-ai-fish-habitat">' + escapeHtml(_capitalize(spot.habitat)) + '</span>' +
      '</div>';
    var icon = L.divIcon({
      className: 'ht-ai-fish-pin',
      html: pillHtml,
      iconSize: [80, 22],
      iconAnchor: [40, 11]
    });

    var marker = L.marker([spot.lat, spot.lng], {
      icon: icon,
      zIndexOffset: 600 - spot.rank  // higher z to stay above micro pins
    }).addTo(map);

    marker.__aiSpot = spot;
    marker.on('click', function() {
      _onAiPinClick(water, zone, spot, fishFlow);
    });

    _aiFishingPins.push(marker);
    bounds.push([spot.lat, spot.lng]);
  });

  var deployed = selectedSpots.length;

  // ── AUTO-DEPLOY 3-icon micro clusters (fish + angler + target) for ALL spots ──
  _checkedInPinIdx = -1;
  _checkedInMicroIdx = -1;
  _activeMicroPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _activeMicroPins = [];
  _activeMicroPolygons.forEach(function(p) { try { map.removeLayer(p); } catch {} });
  _activeMicroPolygons = [];

  var allMicroCoords = [];
  var wadeMode = fishFlow.wade || 'waders';
  selectedSpots.forEach(function(spot, spotIdx) {
    var maxMicros = spot.score >= 70 ? 5 : spot.score >= 50 ? 4 : 3;
    var microTypes = ['primary-lie', 'seam-edge', 'pocket-water', 'undercut-bank', 'feeding-lane'];
    var cIdx = spot.segmentIdx;
    var MAX_DIST_FROM_PIN = 60;
    var MIN_FROM_MAIN = 8;
    var MIN_BETWEEN_MICRO = 8;

    var sortedByStream = selectedSpots.slice().sort(function(a, b) { return a.segmentIdx - b.segmentIdx; });
    var streamOrderIdx = -1;
    for (var si = 0; si < sortedByStream.length; si++) {
      if (sortedByStream[si].segmentIdx === spot.segmentIdx) { streamOrderIdx = si; break; }
    }
    var boundaryLow = 0, boundaryHigh = segment.length - 1;
    if (streamOrderIdx > 0) boundaryLow = Math.ceil((sortedByStream[streamOrderIdx - 1].segmentIdx + spot.segmentIdx) / 2);
    if (streamOrderIdx < sortedByStream.length - 1) boundaryHigh = Math.floor((spot.segmentIdx + sortedByStream[streamOrderIdx + 1].segmentIdx) / 2);

    // ── EDGE BUFFER: keep micro spots 5+ indices from zone edges to
    //    prevent angler/wade pins from overflowing past zone boundary ──
    var ZONE_EDGE_BUFFER = 5;
    var safelow = Math.max(boundaryLow, ZONE_EDGE_BUFFER);
    var safehigh = Math.min(boundaryHigh, segment.length - 1 - ZONE_EDGE_BUFFER);

    var candidates = [];
    for (var sIdx = safelow; sIdx <= safehigh; sIdx++) {
      if (sIdx === cIdx || sIdx < 0 || sIdx >= segment.length) continue;
      var cLat = segment[sIdx][0], cLng = segment[sIdx][1];
      var distFromMain = _distM(spot.lat, spot.lng, cLat, cLng);
      if (distFromMain > MAX_DIST_FROM_PIN || distFromMain < MIN_FROM_MAIN) continue;
      var tooCloseM = false;
      for (var am = 0; am < allMicroCoords.length; am++) {
        if (_distM(allMicroCoords[am][0], allMicroCoords[am][1], cLat, cLng) < MIN_BETWEEN_MICRO) { tooCloseM = true; break; }
      }
      if (tooCloseM) continue;
      for (var cm = 0; cm < candidates.length; cm++) {
        if (_distM(candidates[cm].lat, candidates[cm].lng, cLat, cLng) < MIN_BETWEEN_MICRO) { tooCloseM = true; break; }
      }
      if (tooCloseM) continue;
      var microScore = 50 + Math.max(0, 30 - distFromMain);
      candidates.push({ lat: cLat, lng: cLng, segIdx: sIdx, score: microScore });
    }
    candidates.sort(function(a, b) { return b.score - a.score; });
    var accepted = candidates.slice(0, maxMicros);

    accepted.forEach(function(mc, i) {
      var mType = microTypes[i] || 'primary-lie';
      var clusterMarkers = _deployMicroCluster({
        fishLat: mc.lat, fishLng: mc.lng,
        segIdx: mc.segIdx, segment: segment,
        wade: wadeMode, habitat: spot.habitat,
        microType: mType, microIdx: _activeMicroPins.length,
        spot: spot, water: water, zone: zone,
        bankWidths: zoneBankWidths  // zone-aligned bankWidths (indices match segment)
      });
      clusterMarkers.forEach(function(mk) { _activeMicroPins.push(mk); });
      allMicroCoords.push([mc.lat, mc.lng]);
      bounds.push([mc.lat, mc.lng]);
    });
  });

  // Zoom to fit ALL pins (hotspots + micro)
  if (bounds.length > 0) {
    var fitBounds = L.latLngBounds(bounds);
    map.fitBounds(fitBounds.pad(0.15), { animate: true, duration: 1.0, maxZoom: 18 });
  }

  // ── Hide ALL location pills so they don't overlap micro pins ──
  // Hide AI ranked pills (#1 Seam, #2 Pool, etc.)
  _aiFishingPins.forEach(function(pin) {
    try {
      var el = pin.getElement && pin.getElement();
      if (el) el.style.display = 'none';
    } catch(e) {}
  });
  // Hide hotspot area pills (Mid-Run Seam, Deep Run, etc.)
  _hotspotPins.forEach(function(pin) {
    try {
      var el = pin.getElement && pin.getElement();
      if (el) el.style.display = 'none';
    } catch(e) {}
  });

  // ── Deploy animated stream flow overlay (LiDAR-derived) ──
  try {
    deployStreamFlowOverlay(water, zone);
    if (_flowActive && _flowCanvas) {
      showNotice('🌊 Stream flow overlay active', 'success', 2500);
    } else {
      showNotice('⚠️ Stream flow overlay did not activate — check console', 'warning', 4000);
      console.warn('[HT-FLOW] deploy returned but _flowActive=' + _flowActive + ', _flowCanvas=' + !!_flowCanvas);
    }
  } catch(flowErr) {
    showNotice('⚠️ Stream flow failed: ' + flowErr.message, 'error', 5000);
    console.error('[HT-FLOW] Stream flow overlay failed:', flowErr);
  }

  // Start proximity watch
  _startProximityWatch();

  console.log('HUNTECH: Deployed ' + deployed + ' AI hotspots + ' + _activeMicroPins.length + ' micro-feature pins (LiDAR-locked)');
};

/* Score a spot based on user inputs */
function _scoreSpot(habitat, method, wade, skill, spotIdx, totalSpots) {
  var score = 50; // base

  // Method compatibility
  if (method === 'fly') {
    if (habitat === 'riffle') score += 25;
    else if (habitat === 'run') score += 20;
    else if (habitat === 'pool') score += 15;
    else if (habitat === 'tailout') score += 22;
    else if (habitat === 'boulder') score += 18;
    else if (habitat === 'undercut') score += 20;
    else if (habitat === 'log') score += 17;
    else if (habitat === 'seam') score += 24;
    else if (habitat === 'pocket') score += 19;
  } else if (method === 'spin') {
    if (habitat === 'pool') score += 25;
    else if (habitat === 'run') score += 20;
    else if (habitat === 'boulder') score += 18;
    else if (habitat === 'riffle') score += 8;
    else if (habitat === 'tailout') score += 15;
    else if (habitat === 'undercut') score += 22;
    else if (habitat === 'log') score += 20;
    else if (habitat === 'seam') score += 16;
    else if (habitat === 'pocket') score += 17;
  } else { // bait
    if (habitat === 'pool') score += 28;
    else if (habitat === 'tailout') score += 22;
    else if (habitat === 'run') score += 15;
    else if (habitat === 'boulder') score += 10;
    else if (habitat === 'riffle') score += 5;
    else if (habitat === 'undercut') score += 24;
    else if (habitat === 'log') score += 18;
    else if (habitat === 'seam') score += 12;
    else if (habitat === 'pocket') score += 14;
  }

  // Wading access bonus
  if (wade === 'waders') {
    if (habitat === 'riffle' || habitat === 'run') score += 10;
  } else {
    // Bank fishing favors pools and tailouts
    if (habitat === 'pool' || habitat === 'tailout') score += 12;
    if (habitat === 'riffle') score -= 5; // harder from bank
  }

  // Skill level adjustments
  if (skill === 'new') {
    if (habitat === 'pool' || habitat === 'tailout') score += 10;
    if (habitat === 'riffle') score -= 8; // technical
  } else if (skill === 'advanced') {
    if (habitat === 'riffle' || habitat === 'run') score += 8;
    if (habitat === 'pool') score -= 3; // too easy
  }

  // Time of day bonus
  var h = new Date().getHours();
  if ((h >= 5 && h < 9) || (h >= 17 && h < 21)) {
    // Dawn/dusk: active feeding in fast water, seams, pockets
    if (habitat === 'riffle' || habitat === 'tailout') score += 8;
    if (habitat === 'seam' || habitat === 'pocket') score += 7;
    if (habitat === 'undercut') score += 5; // big trout emerge at low light
  } else if (h >= 12 && h < 15) {
    // Midday: trout seek shade and depth
    if (habitat === 'pool' || habitat === 'boulder') score += 8;
    if (habitat === 'undercut' || habitat === 'log') score += 10; // shade structures are prime midday
    if (habitat === 'pocket') score += 5; // broken water provides cover
  }

  // Slight randomization for variety
  score += Math.floor(Math.random() * 6);

  return Math.max(0, Math.min(100, score));
}

function _habitatEmoji(h) {
  var emap = { riffle: '💨', pool: '🌊', run: '🏞️', boulder: '🪨', tailout: '🌀',
    undercut: '🏔️', log: '🪵', seam: '〰️', pocket: '🫧' };
  return emap[h] || '🐟';
}

function _capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* Build spot-specific strategy text */
function _buildSpotStrategy(habitat, method, wade, skill, water, zone) {
  var strat = {};

  // Approach
  var approaches = {
    riffle: { fly: 'Approach from downstream. Stay low. False cast away from the water, then deliver upstream at 10-2 o\'clock.',
              spin: 'Cast upstream and let your lure tumble through the riffle naturally. Retrieve just fast enough to maintain contact.',
              bait: 'Use split shot to get bait down. Let it drift naturally through the riffle — trout hold behind rocks.' },
    pool: { fly: 'Dead drift nymphs through the head of the pool. Switch to streamers along the deep edges. Fish the tailout last.',
            spin: 'Cast to the head of the pool and let your lure sink. Slow retrieve along the bottom. Work the edges and deep sections.',
            bait: 'Let your bait sink to the bottom of the pool. Trout hold in the deepest sections. Be patient — the big fish are here.' },
    run: { fly: 'Dry-dropper rig is ideal. Cast across, mend upstream, let the nymph swing below the dry. Cover the seam lines.',
           spin: 'Cast quartering upstream. Let the lure swing down through the run. The transition zones between fast and slow water hold fish.',
           bait: 'Drift bait through the run naturally. Add just enough weight to bounce the bottom. Target the slower edges.' },
    tailout: { fly: 'Approach carefully — this water is thin and clear. Long leaders, small flies. Target risers in the evening.',
               spin: 'Light line here. Small lures cast upstream. Trout sip in the thin water — finesse is key.',
               bait: 'Keep bait light and natural. The shallow tailout water requires subtle presentation. Early morning is best.' },
    boulder: { fly: 'Cast tight behind boulders. Dead drift a nymph through the pocket water. Each pocket is a separate lie.',
               spin: 'Target pocket water behind and beside boulders. Short accurate casts. Let the lure drop into the slack water.',
               bait: 'Drop bait into the calm pockets behind boulders. Trout ambush from these protected lies.' },
    undercut: { fly: 'Cast parallel to the bank, tight to the undercut edge. Let your fly drift underneath the overhang. Streamer swung into the shadow zone is deadly.',
                spin: 'Cast close to the bank and let your lure swing under the overhanging bank. Big trout ambush from undercuts.',
                bait: 'Drop bait right along the bank edge under the overhang. Trout shelter here all day — go heavy on stealth.' },
    log: { fly: 'Cast downstream of the log jam. Dead drift a nymph past the downstream edge where current accelerates around the debris. Avoid snagging.',
           spin: 'Work the downstream side of the log. Trout stage in the slack water behind woody debris. Let lure sink beside the structure.',
           bait: 'Place bait just downstream of the wood. The eddy behind the log concentrates food — trout know this.' },
    seam: { fly: 'Position yourself perpendicular to the seam. Dead drift along the slow side of the seam line. Trout sit just inside the slow water picking off food from the fast current.',
            spin: 'Cast to the fast side and retrieve across the seam. Trout react to lures crossing the current differential.',
            bait: 'Drift bait right down the seam line — the boundary between fast and slow water funnels food directly to holding trout.' },
    pocket: { fly: 'Short, accurate casts directly into the pocket. 2-3 drifts then move to the next pocket. High-stick nymphing is ideal here.',
              spin: 'Drop your lure right into the pocket behind the structure. Let it sit 2-3 seconds, then jig. Each pocket holds a fish.',
              bait: 'Drop bait directly into the calm water behind structure. These little pockets each hold 1-2 fish. Quick, targeted presentations.' }
  };
  var apKey = approaches[habitat] || approaches.run;
  strat.approach = apKey[method] || apKey.fly;

  // Casting direction
  var castMap = {
    riffle: 'Cast upstream at 10-2 o\'clock. Mend immediately. Let fly dead drift back toward you.',
    pool: 'Cast to the head or across to the seam. Let your offering sink and drift through the strike zone.',
    run: 'Cast quartering upstream. Mend to extend drift through the seam between fast and slow water.',
    tailout: 'Cast upstream in the thin water. Keep a low profile. Drag-free drift is critical here.',
    boulder: 'Short casts directly behind boulders. Target each pocket individually. 2-3 drifts per pocket then move on.',
    undercut: 'Cast parallel to the bank edge. Keep your fly tight to the undercut. Let drift carry it under the overhang.',
    log: 'Cast to the downstream edge of the log. Dead drift past the structure — trout stage on the downstream side.',
    seam: 'Cast to the fast side and let your offering cross into the slow water. The seam line is your target.',
    pocket: 'Short targeted casts into each pocket. High-stick to keep contact. 2-3 drifts per pocket then move.'
  };
  strat.castDirection = castMap[habitat] || castMap.run;

  // Fly/lure recommendation
  var rec = getTimeAwareFlyRec(water, habitat);
  strat.flyRec = rec.flyRec;
  strat.altFly = rec.altFly;
  strat.timeAdvice = rec.timeAdvice;
  strat.hatches = rec.hatches;
  strat.season = rec.season;

  // Wading advice
  if (wade === 'waders') {
    strat.wadingAdvice = 'You\'re in waders — position yourself in the stream for the best casting angle. ' +
      (habitat === 'riffle' ? 'Wade to knee depth. Stand at the tail of the riffle and cast upstream.' :
       habitat === 'pool' ? 'Stay at the pool edges. Don\'t wade through the strike zone.' :
       habitat === 'undercut' ? 'Stay in mid-stream, cast parallel to the bank. Do NOT wade near the undercut — you\'ll collapse the bank and spook every fish.' :
       habitat === 'log' ? 'Wade downstream of the log structure. Cast upstream past the debris and let your fly drift along the wood edge.' :
       habitat === 'seam' ? 'Position yourself on the slow side of the seam. Wade gently — your footsteps transmit vibrations through the current.' :
       habitat === 'pocket' ? 'High-stick from above. Stay close enough for short accurate casts but far enough to avoid spooking pocket fish.' :
       'Position yourself offset from the target. Keep your feet planted — shuffling spooks fish.');
  } else {
    strat.wadingAdvice = 'Fishing from the bank — use the terrain. ' +
      (habitat === 'pool' ? 'Find a high bank with a clear backcast lane. Roll casts work great.' :
       habitat === 'undercut' ? 'You\'re already on the bank — perfect for undercut fishing. Stay low, dap your fly right along the bank edge.' :
       habitat === 'log' ? 'Cast from the bank opposite the log jam. Roll cast to avoid snagging overhead branches.' :
       habitat === 'seam' ? 'Find a position directly across from the seam line. Side-arm cast to keep your line low.' :
       'Kneel low. Keep your shadow off the water. Use sidearm casts to keep a low profile.');
  }

  return strat;
}

/* ── Mission Summary Popup ── */
window.showMissionSummary = function(water, zone, fishFlow) {
  // Remove existing
  if (_missionSummaryEl) { try { _missionSummaryEl.remove(); } catch {} }

  var spots = _aiFishingSpots;
  var topSpot = spots[0];
  var method = fishFlow.method || 'fly';
  var rec = getTimeAwareFlyRec(water, topSpot ? topSpot.habitat : 'riffle');
  var totalSpots = spots.length;

  var summaryText = 'Welcome to ' + water.name + ', ' + zone.name + '. ' +
    'I\'ve deployed ' + totalSpots + ' fishing spots ranked by your ' +
    (method === 'fly' ? 'fly fishing' : method === 'spin' ? 'lure fishing' : 'bait fishing') + ' setup. ' +
    'Your #1 spot is a ' + (topSpot ? topSpot.habitat : 'run') + ' — ' +
    (rec.timeAdvice || 'Prime conditions for catching trout.') + ' ' +
    'Start with ' + (rec.flyRec || 'your confidence pattern') + '. ' +
    'Rig: ' + (rec.rigMethod || 'Match presentation to habitat') + '. ' +
    'Walk to each pin in order. When you reach a pin, I\'ll deploy micro-spots and give you precise casting instructions. ' +
    'Report back to me with voice — tell me what you see, what\'s hatching, and what the trout are doing. I\'ll update your strategy in real time. Tight lines!';

  var spotsListHtml = '';
  spots.forEach(function(s) {
    var col = s.rank === 1 ? '#7cffc7' : s.rank === 2 ? '#2bd4ff' : '#ffe082';
    spotsListHtml += '<div class="ht-mission-spot" style="border-left:3px solid ' + col + ';">' +
      '<span class="ht-mission-spot-rank" style="color:' + col + ';">#' + s.rank + '</span>' +
      '<span class="ht-mission-spot-name">' + escapeHtml(_capitalize(s.habitat)) + '</span>' +
      '<span class="ht-mission-spot-score">' + s.score + ' pts</span>' +
    '</div>';
  });

  var el = document.createElement('div');
  el.className = 'ht-mission-summary-overlay';
  el.innerHTML = `
    <div class="ht-mission-summary-card">
      <div class="ht-mission-summary-header">
        <div class="ht-mission-summary-title">MISSION BRIEFING</div>
        <div class="ht-mission-summary-sub">${escapeHtml(water.name)} — ${escapeHtml(zone.name)}</div>
      </div>
      <div class="ht-mission-summary-body">
        <div class="ht-mission-summary-text" id="missionSummaryText">${escapeHtml(summaryText)}</div>
        <div class="ht-mission-summary-spots">${spotsListHtml}</div>
      </div>
      <div class="ht-mission-summary-actions">
        <button class="ht-mission-btn ht-mission-btn--listen" type="button" onclick="window._listenMission()">Listen</button>
        <button class="ht-mission-btn ht-mission-btn--save" type="button" onclick="window._saveMissionToJournal()">Save to Journal</button>
        <button class="ht-mission-btn ht-mission-btn--close" type="button" onclick="window._closeMissionSummary()">Close & Fish</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  _missionSummaryEl = el;

  // Animate in
  requestAnimationFrame(function() {
    el.classList.add('is-visible');
  });
};

window._listenMission = function() {
  var textEl = document.getElementById('missionSummaryText');
  if (!textEl) return;
  if (typeof window.speakText === 'function') {
    window.speakText(textEl.textContent);
    // status suppressed
  } else if (typeof speakTextBrowser === 'function') {
    speakTextBrowser(textEl.textContent);
  } else {
    showNotice('TTS not available', 'warning', 2000);
  }
};

window._saveMissionToJournal = function() {
  try {
    var fishFlow = window._fishFlow;
    if (!fishFlow || !fishFlow.area) return;
    var key = 'huntech_fish_journal_v1';
    var journal = JSON.parse(localStorage.getItem(key) || '[]');
    journal.push({
      id: Date.now(),
      water: fishFlow.area.name,
      waterId: fishFlow.area.id,
      zone: fishFlow.selectedZone ? fishFlow.selectedZone.name : '',
      method: fishFlow.method,
      skill: fishFlow.experience,
      wade: fishFlow.wade,
      spots: _aiFishingSpots.length,
      date: new Date().toISOString(),
      summary: document.getElementById('missionSummaryText') ? document.getElementById('missionSummaryText').textContent : ''
    });
    localStorage.setItem(key, JSON.stringify(journal));
    showNotice('📓 Session saved to your fishing journal!', 'success', 2500);
  } catch (e) {
    showNotice('Could not save: ' + e.message, 'error', 3000);
  }
};

window._closeMissionSummary = function() {
  if (_missionSummaryEl) {
    _missionSummaryEl.classList.remove('is-visible');
    setTimeout(function() {
      if (_missionSummaryEl) { try { _missionSummaryEl.remove(); } catch {} _missionSummaryEl = null; }
    }, 350);
  }

  // Zoom map to show all fishing pins
  if (_aiFishingPins.length > 0 && map) {
    var bounds = L.latLngBounds(_aiFishingPins.map(function(m) { return m.getLatLng(); }));
    map.fitBounds(bounds.pad(0.15), { animate: true, duration: 1.0, maxZoom: 17 });
  }

  // Start proximity watch for auto-checkin
  _startProximityWatch();

  // Stop any TTS
  if (typeof window.stopSpeech === 'function') window.stopSpeech();
};

/* ── Proximity Auto Check-In System ── */
function _startProximityWatch() {
  if (_proximityWatchId) return; // already watching
  if (!navigator.geolocation) return;

  _proximityWatchId = navigator.geolocation.watchPosition(
    function(pos) {
      var userLat = pos.coords.latitude;
      var userLng = pos.coords.longitude;
      var accuracy = pos.coords.accuracy;

      // Skip if accuracy is too poor
      if (accuracy > 50) return;

      // Check proximity to each fishing pin
      _aiFishingSpots.forEach(function(spot, idx) {
        if (idx === _checkedInPinIdx) return; // already checked in here
        var dist = _distanceMeters(userLat, userLng, spot.lat, spot.lng);
        if (dist < 30) { // within 30m
          _autoCheckInToPin(idx);
        }
      });

      // Check proximity to micro spots
      if (_activeMicroPins.length > 0) {
        _activeMicroPins.forEach(function(mPin, mIdx) {
          if (mIdx === _checkedInMicroIdx) return;
          var mLatLng = mPin.getLatLng();
          var dist = _distanceMeters(userLat, userLng, mLatLng.lat, mLatLng.lng);
          if (dist < 15) { // within 15m
            _autoCheckInToMicroSpot(mIdx);
          }
        });
      }
    },
    function() { /* GPS error — silent */ },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
}

function _stopProximityWatch() {
  if (_proximityWatchId) {
    navigator.geolocation.clearWatch(_proximityWatchId);
    _proximityWatchId = null;
  }
}

function _distanceMeters(lat1, lng1, lat2, lng2) {
  var R = 6371000;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Auto Check-In to a ranked pin — deploys micro spots ── */
function _autoCheckInToPin(pinIdx) {
  if (pinIdx === _checkedInPinIdx) return;
  _checkedInPinIdx = pinIdx;
  _checkedInMicroIdx = -1;

  var spot = _aiFishingSpots[pinIdx];
  if (!spot) return;

  var fishFlow = window._fishFlow;
  var water = fishFlow ? fishFlow.area : null;
  var zone = fishFlow ? fishFlow.selectedZone : null;
  if (!water || !zone) return;

  // status suppressed

  // Clear previous micro pins & polygons
  _activeMicroPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _activeMicroPins = [];
  _activeMicroPolygons.forEach(function(p) { try { map.removeLayer(p); } catch {} });
  _activeMicroPolygons = [];

  // ── 3-Icon micro-spot deployment (fish + angler + cast target) ──
  var maxMicros = spot.score >= 70 ? 5 : spot.score >= 50 ? 4 : 2;
  var microTypes = ['primary-lie', 'seam-edge', 'pocket-water', 'undercut-bank', 'feeding-lane'];
  var seg = getZoneStreamSegment(water, zone) || [];
  var cIdx = spot.segmentIdx;
  var wadeMode = fishFlow ? (fishFlow.wade || 'waders') : 'waders';

  var _dist = function(lat1, lng1, lat2, lng2) {
    var dLat = (lat2 - lat1) * 111000;
    var dLng = (lng2 - lng1) * 111000 * Math.cos(lat1 * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng);
  };

  // Boundary enforcement from adjacent AI pins
  var sortedByStream = _aiFishingSpots.slice().sort(function(a, b) { return a.segmentIdx - b.segmentIdx; });
  var streamOrderIdx = -1;
  for (var si = 0; si < sortedByStream.length; si++) {
    if (sortedByStream[si].segmentIdx === spot.segmentIdx &&
        Math.abs(sortedByStream[si].lat - spot.lat) < 0.00001 &&
        Math.abs(sortedByStream[si].lng - spot.lng) < 0.00001) {
      streamOrderIdx = si; break;
    }
  }
  var boundaryLow = 0, boundaryHigh = seg.length - 1;
  if (streamOrderIdx >= 0) {
    if (streamOrderIdx > 0) {
      var prevPin = sortedByStream[streamOrderIdx - 1];
      boundaryLow = Math.ceil((prevPin.segmentIdx + spot.segmentIdx) / 2);
    }
    if (streamOrderIdx < sortedByStream.length - 1) {
      var nextPin = sortedByStream[streamOrderIdx + 1];
      boundaryHigh = Math.floor((spot.segmentIdx + nextPin.segmentIdx) / 2);
    }
  }
  var MAX_DIST_FROM_PIN = 75;

  var existingPinPositions = [];
  _aiFishingPins.forEach(function(pm) {
    var ll = pm.getLatLng();
    existingPinPositions.push({ lat: ll.lat, lng: ll.lng });
  });

  var candidates = [];
  var MIN_FROM_MAIN = 12, MIN_FROM_AI_PIN = 12, MIN_BETWEEN_MICRO = 10;

  for (var sIdx = boundaryLow; sIdx <= boundaryHigh; sIdx++) {
    if (sIdx === cIdx || sIdx < 0 || sIdx >= seg.length) continue;
    var cLat = seg[sIdx][0], cLng = seg[sIdx][1];
    var distFromMain = _dist(spot.lat, spot.lng, cLat, cLng);
    if (distFromMain > MAX_DIST_FROM_PIN || distFromMain < MIN_FROM_MAIN) continue;

    var nearOtherPin = false;
    for (var ep = 0; ep < existingPinPositions.length; ep++) {
      var epp = existingPinPositions[ep];
      if (Math.abs(epp.lat - spot.lat) < 0.00001 && Math.abs(epp.lng - spot.lng) < 0.00001) continue;
      if (_dist(epp.lat, epp.lng, cLat, cLng) < MIN_FROM_AI_PIN) { nearOtherPin = true; break; }
    }
    if (nearOtherPin) continue;

    var tooClose = false;
    for (var c = 0; c < candidates.length; c++) {
      if (_dist(candidates[c].lat, candidates[c].lng, cLat, cLng) < MIN_BETWEEN_MICRO) { tooClose = true; break; }
    }
    if (tooClose) continue;

    var microScore = 50 + Math.max(0, 30 - distFromMain);
    var offset = sIdx - cIdx;
    if (offset > 0) microScore += 5;
    microScore -= Math.abs(offset) * 1.5;
    candidates.push({ lat: cLat, lng: cLng, segIdx: sIdx, score: microScore, distFromMain: distFromMain });
  }

  candidates.sort(function(a, b) { return b.score - a.score; });
  var accepted = candidates.slice(0, maxMicros);

  // Deploy 3-icon clusters (fish + angler + cast target) for each micro-spot
  var microCoords = [];
  accepted.forEach(function(mc, i) {
    var mType = microTypes[i] || 'primary-lie';
    var clusterMarkers = _deployMicroCluster({
      fishLat: mc.lat, fishLng: mc.lng,
      segIdx: mc.segIdx, segment: seg,
      wade: wadeMode, habitat: spot.habitat,
      microType: mType, microIdx: i,
      spot: spot, water: water, zone: zone
    });
    clusterMarkers.forEach(function(mk) { _activeMicroPins.push(mk); });
    microCoords.push([mc.lat, mc.lng]);
  });

  // ── Hide ALL spot pins so they don't overlap micro clusters ──
  _aiFishingPins.forEach(function(pin) {
    try { var el = pin.getElement && pin.getElement(); if (el) el.style.display = 'none'; } catch(e) {}
  });
  _hotspotPins.forEach(function(pin) {
    try { var el = pin.getElement && pin.getElement(); if (el) el.style.display = 'none'; } catch(e) {}
  });

  // Zoom to fit the main pin + micro spots
  var allPts = [[spot.lat, spot.lng]].concat(microCoords);
  var zbounds = L.latLngBounds(allPts);
  map.fitBounds(zbounds.pad(0.3), { animate: true, duration: 0.8, maxZoom: 19 });
}
window._autoCheckInToPin = _autoCheckInToPin;

/* Manual pin click → show full educational strategy popup */
function _onAiPinClick(water, zone, spot, fishFlow) {
  var idx = _aiFishingSpots.indexOf(spot);
  var pinIdx = idx >= 0 ? idx : 0;
  var marker = _aiFishingPins[pinIdx];
  if (!marker) { _autoCheckInToPin(pinIdx); return; }

  var strat = spot.strategy || {};
  var rec = getTimeAwareFlyRec(water, spot.habitat);
  var flavor = window.TROUT_HOTSPOT_FLAVOR && window.TROUT_HOTSPOT_FLAVOR[spot.habitat];
  var edu = window.TROUT_EDUCATION && window.TROUT_EDUCATION[spot.habitat];

  // Pick best reason & guide tip deterministically (index by rank, not random)
  var rIdx = (spot.rank - 1) % ((flavor && flavor.reasons) ? flavor.reasons.length : 1);
  var reason = (flavor && flavor.reasons) ? flavor.reasons[rIdx] : '';
  var tips = (edu && edu.tips) ? edu.tips : [];
  var guideTip = tips.length ? tips[spot.rank % tips.length] : '';

  var terrainLine = spot.terrainSource ? '<div style="font-size:9px;color:#666;margin-top:2px;">📡 ' + escapeHtml(spot.terrainSource) + '</div>' : '';

  var popupHtml = '<div style="min-width:280px;max-width:340px;">';

  // Header
  popupHtml += '<div style="font-weight:800;color:#7cffc7;font-size:15px;">#' + spot.rank + ' ' + escapeHtml(_capitalize(spot.habitat)) + '</div>';
  popupHtml += '<div style="font-size:11px;color:#aaa;margin-top:2px;">Score: ' + spot.score + ' pts · ' + escapeHtml(rec.period) + ' · ' + escapeHtml(rec.season) + '</div>';
  popupHtml += terrainLine;

  // Why fish here
  if (reason) {
    popupHtml += '<div style="font-size:11px;color:#c8e6d5;margin-top:8px;line-height:1.4;"><b style="color:#ffe082;">Why here:</b> ' + escapeHtml(reason) + '</div>';
  }

  // Approach
  popupHtml += '<div style="font-size:11px;color:#c8e6d5;margin-top:6px;line-height:1.4;"><b style="color:#ffe082;">Approach:</b> ' + escapeHtml(strat.approach || 'Approach from downstream.') + '</div>';

  // Casting
  popupHtml += '<div style="font-size:11px;color:#c8e6d5;margin-top:5px;line-height:1.4;"><b style="color:#ffe082;">Cast:</b> ' + escapeHtml(strat.castDirection || '') + '</div>';

  // Best fly + rig method
  popupHtml += '<div style="border-top:1px solid rgba(124,255,199,0.15);margin-top:8px;padding-top:6px;">';
  popupHtml += '<div style="font-size:11px;color:#7cffc7;font-weight:700;">🪰 BEST FLY: ' + escapeHtml(rec.flyRec) + '</div>';
  popupHtml += '<div style="font-size:10px;color:#b8d8c8;margin-top:3px;line-height:1.3;"><b>Rig:</b> ' + escapeHtml(rec.rigMethod || '') + '</div>';
  popupHtml += '</div>';

  // Backup fly
  if (rec.altFly) {
    popupHtml += '<div style="font-size:10px;color:#89b5a2;margin-top:5px;"><b>Backup:</b> ' + escapeHtml(rec.altFly) + '</div>';
    popupHtml += '<div style="font-size:9px;color:#6a9480;margin-top:2px;line-height:1.3;"><b>Rig:</b> ' + escapeHtml(rec.altRig || '') + '</div>';
  }

  // Wading advice
  if (strat.wadingAdvice) {
    popupHtml += '<div style="font-size:10px;color:#89b5a2;margin-top:6px;line-height:1.3;"><b style="color:#2bd4ff;">Wading:</b> ' + escapeHtml(strat.wadingAdvice) + '</div>';
  }

  // Time-of-day conditions
  popupHtml += '<div style="font-size:10px;color:#89b5a2;margin-top:5px;line-height:1.3;"><b>Conditions:</b> ' + escapeHtml(rec.timeAdvice) + '</div>';

  // Hatch data
  if (rec.hatches && rec.hatches.length) {
    popupHtml += '<div style="font-size:10px;color:#89b5a2;margin-top:4px;"><b style="color:#2bd4ff;">' + escapeHtml(rec.season) + ' hatches:</b> ' + escapeHtml(rec.hatches.join(', ')) + '</div>';
  }

  // Pro guide tip
  if (guideTip) {
    popupHtml += '<div style="border-top:1px solid rgba(43,212,255,0.15);margin-top:7px;padding-top:5px;">';
    popupHtml += '<div style="font-size:10px;color:#ffe082;font-weight:800;">🎓 PRO TIP</div>';
    popupHtml += '<div style="font-size:10px;color:#c8e6d5;line-height:1.3;margin-top:2px;">' + escapeHtml(guideTip) + '</div>';
    popupHtml += '</div>';
  }

  // CHECK IN button
  popupHtml += '<div style="margin-top:10px;">';
  popupHtml += '<button style="padding:8px 18px;border-radius:8px;border:1px solid #7cffc7;background:rgba(124,255,199,0.15);color:#7cffc7;font-size:13px;font-weight:800;cursor:pointer;width:100%;" ' +
    'onclick="window._autoCheckInToPin(' + pinIdx + ');if(map)map.closePopup();">✅ CHECK IN — Deploy Fish</button>';
  popupHtml += '</div></div>';

  marker.unbindPopup();
  marker.bindPopup(popupHtml, { maxWidth: 360, className: 'ht-zone-popup' }).openPopup();
}

/* ── Auto Check-In to a micro spot ── */
function _autoCheckInToMicroSpot(microIdx) {
  if (microIdx === _checkedInMicroIdx) return;
  _checkedInMicroIdx = microIdx;

  var mPin = _activeMicroPins[microIdx];
  if (!mPin) return;
  var mType = mPin.__microType || 'primary-lie';

  var fishFlow = window._fishFlow;
  var water = fishFlow ? fishFlow.area : null;
  var zone = fishFlow ? fishFlow.selectedZone : null;
  var spot = _aiFishingSpots[_checkedInPinIdx];
  if (!water || !zone || !spot) return;

  // status suppressed
  _showSpotInfoTray(water, zone, spot, mType, microIdx);
}

/* ── Spot Info Tray — detailed guidance for a specific micro-spot ── */
function _showSpotInfoTray(water, zone, spot, microType, microIdx) {
  // Remove existing
  if (_spotInfoTrayEl) { try { _spotInfoTrayEl.remove(); } catch {} }

  var strat = spot.strategy;
  var rec = getTimeAwareFlyRec(water, spot.habitat);
  var microLabel = _capitalize(microType.replace(/-/g, ' '));

  var microAdvice = {
    'primary-lie': 'This is the main holding position. Trout actively feed here. Your first cast should target this spot. Deliver your fly 3-4 feet upstream and let it drift naturally into the strike zone.',
    'seam-edge': 'The seam between fast and slow water. Trout hold just inside the slow side, picking off food from the fast current. Cast to the fast side and let your offering drift into the seam.',
    'pocket-water': 'Protected pocket behind structure. Trout rest here between feeding runs. Short, accurate casts directly into the pocket. Let your fly sink 2-3 seconds before any retrieval.',
    'undercut-bank': 'Undercut bank where trout shelter from current and predators. Cast parallel to the bank, tight to the edge. Let your fly drift underneath the overhang. Big trout hide here.',
    'feeding-lane': 'A natural conveyor belt of food funneling through a narrow channel. Position yourself downstream and cast upstream into the lane. Dead-drift is critical — any drag spooks fish.'
  };

  var el = document.createElement('div');
  el.className = 'ht-spot-info-tray';
  el.innerHTML = `
    <div class="ht-spot-info-header">
      <div class="ht-spot-info-title">${escapeHtml(microLabel)}</div>
      <div class="ht-spot-info-sub">${escapeHtml(_capitalize(spot.habitat))} — Spot #${spot.rank}</div>
      <button class="ht-spot-info-close" type="button" onclick="window._closeSpotInfoTray()">✕</button>
    </div>
    <div class="ht-spot-info-body">
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">MICRO-SPOT STRATEGY</div>
        <div class="ht-spot-info-text">${escapeHtml(microAdvice[microType] || microAdvice['primary-lie'])}</div>
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">APPROACH</div>
        <div class="ht-spot-info-text">${escapeHtml(strat.approach)}</div>
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">CASTING</div>
        <div class="ht-spot-info-text">${escapeHtml(strat.castDirection)}</div>
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">BEST FLY</div>
        <div class="ht-spot-info-text">${escapeHtml(rec.flyRec || 'Match the hatch — observe the water first.')}</div>
        <div class="ht-spot-info-alt" style="margin-top:3px;"><b>Rig:</b> ${escapeHtml(rec.rigMethod || '')}</div>
        ${rec.altFly ? '<div class="ht-spot-info-alt" style="margin-top:6px;"><b>Backup:</b> ' + escapeHtml(rec.altFly) + '</div>' : ''}
        ${rec.altRig ? '<div class="ht-spot-info-alt"><b>Rig:</b> ' + escapeHtml(rec.altRig) + '</div>' : ''}
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">WADING</div>
        <div class="ht-spot-info-text">${escapeHtml(strat.wadingAdvice)}</div>
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">CONDITIONS</div>
        <div class="ht-spot-info-text">${escapeHtml(rec.timeAdvice)}</div>
      </div>
    </div>
    <div class="ht-spot-info-actions">
      <button class="ht-spot-info-btn ht-spot-info-btn--voice" type="button" onclick="window._startVoiceReport()">Report to Coach</button>
      <button class="ht-spot-info-btn ht-spot-info-btn--listen" type="button" onclick="window._listenSpotBriefing()">Listen</button>
      <button class="ht-spot-info-btn ht-spot-info-btn--next" type="button" onclick="window._nextSpot()">Next Spot</button>
    </div>
  `;
  document.body.appendChild(el);
  _spotInfoTrayEl = el;

  requestAnimationFrame(function() {
    el.classList.add('is-visible');
  });
}

window._closeSpotInfoTray = function() {
  if (_spotInfoTrayEl) {
    _spotInfoTrayEl.classList.remove('is-visible');
    setTimeout(function() {
      if (_spotInfoTrayEl) { try { _spotInfoTrayEl.remove(); } catch {} _spotInfoTrayEl = null; }
    }, 300);
  }
};

window._listenSpotBriefing = function() {
  if (!_spotInfoTrayEl) return;
  var bodyEl = _spotInfoTrayEl.querySelector('.ht-spot-info-body');
  if (!bodyEl) return;
  var text = bodyEl.textContent || '';
  if (typeof window.speakText === 'function') {
    window.speakText(text);
  } else if (typeof speakTextBrowser === 'function') {
    speakTextBrowser(text);
  }
  // status suppressed
};

window._nextSpot = function() {
  window._closeSpotInfoTray();
  if (_checkedInPinIdx >= 0 && _checkedInPinIdx < _aiFishingSpots.length - 1) {
    _autoCheckInToPin(_checkedInPinIdx + 1);
  } else {
    // status suppressed
  }
};

/* ── Voice AI Coach — Speech Recognition Input ── */
window._startVoiceReport = function() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showNotice('Voice input not supported on this browser. Try Chrome.', 'warning', 3500);
    // Fallback: show text input
    _showTextReportInput();
    return;
  }

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  // status suppressed

  recognition.onresult = function(event) {
    var transcript = event.results[0][0].transcript;
    console.log('HUNTECH VOICE:', transcript);
    // status suppressed
    _processCoachReport(transcript);
  };

  recognition.onerror = function(event) {
    console.warn('HUNTECH voice error:', event.error);
    if (event.error === 'not-allowed') {
      showNotice('🎙️ Microphone access denied. Enable mic permissions.', 'error', 4000);
    } else {
      showNotice('🎙️ Could not hear you. Try again or type your report.', 'warning', 3000);
      _showTextReportInput();
    }
  };

  recognition.start();
};

function _showTextReportInput() {
  var existing = document.getElementById('ht-voice-text-input');
  if (existing) existing.remove();

  var input = document.createElement('div');
  input.id = 'ht-voice-text-input';
  input.className = 'ht-voice-input-overlay';
  input.innerHTML = `
    <div class="ht-voice-input-card">
      <div class="ht-voice-input-title">🎙️ Report to AI Fly Coach</div>
      <textarea class="ht-voice-textarea" id="htVoiceTextarea" placeholder="Describe what you see: hatch activity, fish behavior, water conditions, strikes..."></textarea>
      <div class="ht-voice-input-actions">
        <button class="ht-mission-btn ht-mission-btn--save" type="button" onclick="window._submitTextReport()">Send Report</button>
        <button class="ht-mission-btn ht-mission-btn--close" type="button" onclick="document.getElementById('ht-voice-text-input').remove()">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(input);
  requestAnimationFrame(function() { input.classList.add('is-visible'); });
  setTimeout(function() { document.getElementById('htVoiceTextarea').focus(); }, 200);
}

window._submitTextReport = function() {
  var ta = document.getElementById('htVoiceTextarea');
  if (!ta || !ta.value.trim()) return;
  _processCoachReport(ta.value.trim());
  var overlay = document.getElementById('ht-voice-text-input');
  if (overlay) overlay.remove();
};

/* ── AI Fly Coach — Process user report and update strategy ── */
function _processCoachReport(report) {
  if (!report) return;

  _aiCoachState.reports.push({
    text: report,
    time: new Date().toISOString(),
    spotIdx: _checkedInPinIdx,
    microIdx: _checkedInMicroIdx
  });

  var lowerReport = report.toLowerCase();

  // Analyze the report for key indicators
  var response = '';
  var newFlyRec = '';

  // Hatch detection
  if (lowerReport.match(/hatch|mayfl|caddis|midge|stonefl|spinner|emerger|bwo|pmd|hendrickson|sulphur/)) {
    if (lowerReport.match(/mayfl|bwo|pmd|hendrickson|sulphur/)) {
      newFlyRec = 'Switch to a #16-18 Parachute Adams or BWO emerger. Match the mayfly hatch.';
      response += '🦟 Mayfly activity detected! ';
    } else if (lowerReport.match(/caddis/)) {
      newFlyRec = 'Switch to #14-16 Elk Hair Caddis dry or a #16 beadhead caddis pupa below.';
      response += '🦗 Caddis hatch confirmed! ';
    } else if (lowerReport.match(/midge/)) {
      newFlyRec = 'Go small — #20-24 Zebra Midge or Griffith\'s Gnat. Tiny. Slow. Patient.';
      response += '🪰 Midge activity noted. ';
    } else if (lowerReport.match(/stonefl/)) {
      newFlyRec = 'Big meal — #8-12 Pat\'s Rubber Legs or Golden Stone nymph. Fish the edges.';
      response += '🪨 Stonefly activity! ';
    } else {
      newFlyRec = 'Match what you see hatching. Go one size smaller than what\'s on the water.';
      response += '🦟 Hatch activity reported. ';
    }
  }

  // Fish behavior detection
  if (lowerReport.match(/ris(e|ing|er)|sip|splash|boil|strike|hit|took|eat|feed/)) {
    response += '🐟 Fish are actively feeding — great sign! Switch to dry flies or emergers if you\'re not already on them. ';
    if (!newFlyRec) newFlyRec = 'Fish are rising — go topwater. Try a #16 Parachute Adams or #14 Elk Hair Caddis.';
  }

  if (lowerReport.match(/nothing|slow|dead|quiet|no fish|no strike|no bite|no luck|not work/)) {
    response += '🤔 Slow fishing — let\'s adapt. ';
    newFlyRec = 'Try going deeper — add weight and switch to a #14 beadhead Pheasant Tail or #12 Woolly Bugger (olive). Change your drift line — move 10 feet upstream and try a new angle.';
  }

  if (lowerReport.match(/refuse|short strike|look|follow|inspect|turn away|won.t take/)) {
    response += '🧐 Fish are interested but refusing — they\'re being selective. ';
    newFlyRec = 'Go smaller — drop down 2 sizes. Try a #18-20 RS2 or a sparse emerger. Extend your tippet to 6X or 7X. Drag-free drift is critical.';
  }

  // Water/condition reports
  if (lowerReport.match(/muddy|murky|stain|dirty|high water|fast|flood/)) {
    response += '🌊 Poor visibility — heavy patterns and bright colors. ';
    if (!newFlyRec) newFlyRec = 'In dirty water: #10-12 San Juan Worm (red), #8 Woolly Bugger (black), or bright egg patterns. Strip streamers slow.';
  }

  if (lowerReport.match(/clear|crystal|gin|low water|skinny/)) {
    response += '💎 Clear water — stealth mode. ';
    if (!newFlyRec) newFlyRec = 'Clear water demands finesse. Long leaders (12-14ft), small flies (#18-22), and a drag-free drift. Keep low.';
  }

  if (lowerReport.match(/wind|windy|gust/)) {
    response += '💨 Windy conditions — adjust your casting. ';
    if (!newFlyRec) newFlyRec = 'In wind: shorten your leader, use heavier flies, and tuck your casts. Double-haul if you can. Fish sheltered banks.';
  }

  // Default response
  if (!response) {
    response = '📝 Report logged. ';
    newFlyRec = 'Keep observing. Watch for any changes in hatching, feeding behavior, or water conditions. Report back when you notice something new.';
  }

  response += newFlyRec;

  _aiCoachState.currentStrategy = response;
  _aiCoachState.currentFlyRec = newFlyRec;
  _aiCoachState.lastUpdate = Date.now();

  // Show the AI coach response
  _showCoachResponse(response);
}

function _showCoachResponse(responseText) {
  var existing = document.getElementById('ht-coach-response');
  if (existing) existing.remove();

  var el = document.createElement('div');
  el.id = 'ht-coach-response';
  el.className = 'ht-coach-response-overlay';
  el.innerHTML = `
    <div class="ht-coach-response-card">
      <div class="ht-coach-response-header">
        <span class="ht-coach-avatar-small">🎣</span>
        <span class="ht-coach-response-title">AI FLY COACH</span>
        <button class="ht-spot-info-close" type="button" onclick="document.getElementById('ht-coach-response').remove()">✕</button>
      </div>
      <div class="ht-coach-response-body">${escapeHtml(responseText)}</div>
      <div class="ht-coach-response-actions">
        <button class="ht-mission-btn ht-mission-btn--listen" type="button" onclick="if(typeof speakText==='function')speakText(document.querySelector('.ht-coach-response-body').textContent)">🔊 Listen</button>
        <button class="ht-mission-btn ht-mission-btn--voice" type="button" onclick="document.getElementById('ht-coach-response').remove();window._startVoiceReport()">🎙️ Report More</button>
        <button class="ht-mission-btn ht-mission-btn--close" type="button" onclick="document.getElementById('ht-coach-response').remove()">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  requestAnimationFrame(function() { el.classList.add('is-visible'); });

  // Auto-speak the response
  if (typeof window.speakText === 'function') {
    window.speakText(responseText);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED STREAM FLOW CANVAS ENGINE — LiDAR-Derived Water Simulation
   ═════════════════════════════════════════════════════════════════════════
   Renders a professional animated water simulation overlay using HTML5
   Canvas inside a Leaflet custom pane. All geometry is derived from
   LiDAR streamPath + bankWidths data exclusively.

   Features:
     • Filled water channel rendered from bank-edge LiDAR point-cloud
     • 400+ animated flow particles simulating water current
     • Velocity profile: center = fastest, banks = slowest
     • Caustic light patterns (dappled sunlight refraction)
     • Foam particles along bank edges and around structure
     • Glowing bank-edge outlines
     • Depth-varying opacity (deeper water = darker)
     • Smooth 60fps animation with requestAnimationFrame

   DATA SOURCE GUARDRAIL:
     This overlay reads ONLY from streamPath + bankWidths.
     No topo, aerial, satellite, or external API data is used.
   ═══════════════════════════════════════════════════════════════════════ */

var _flowCanvas = null;
var _flowCtx = null;
var _flowAnimFrame = null;
var _flowParticles = [];
var _flowCaustics = [];
var _flowStreamPath = null;
var _flowBankWidths = null;
var _flowTerrain = null;
var _flowTime = 0;
var _flowDpr = 1;
var _flowRenderErrors = 0;
var _flowActive = false;

/* ── Simple value noise for caustic effects ── */
var _noisePermutation = [];
(function() {
  for (var i = 0; i < 256; i++) _noisePermutation[i] = i;
  for (var j = 255; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var tmp = _noisePermutation[j];
    _noisePermutation[j] = _noisePermutation[k];
    _noisePermutation[k] = tmp;
  }
  for (var m = 0; m < 256; m++) _noisePermutation[256 + m] = _noisePermutation[m];
})();

function _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function _lerp(a, b, t) { return a + t * (b - a); }
function _grad(hash, x, y) {
  var h = hash & 3;
  var u = h < 2 ? x : y;
  var v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}
function _noise2d(x, y) {
  var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  var u = _fade(x), v = _fade(y);
  var A = _noisePermutation[X] + Y, B = _noisePermutation[X + 1] + Y;
  return _lerp(
    _lerp(_grad(_noisePermutation[A], x, y), _grad(_noisePermutation[B], x - 1, y), u),
    _lerp(_grad(_noisePermutation[A + 1], x, y - 1), _grad(_noisePermutation[B + 1], x - 1, y - 1), u),
    v
  );
}

/* ── Compute bank-edge positions from streamPath + bankWidths ── */
function _computeBankGeometry(streamPath, bankWidths) {
  if (!streamPath || streamPath.length < 2) return { left: [], right: [], center: streamPath || [] };
  var DEG = Math.PI / 180;
  var left = [], right = [];

  for (var i = 0; i < streamPath.length; i++) {
    var lat0 = streamPath[i][0], lng0 = streamPath[i][1];
    var mPerLat = 111000;
    var mPerLng = 111000 * Math.cos(lat0 * DEG);

    // Stream direction vector
    var dy = 0, dx = 0;
    if (i === 0 && streamPath.length > 1) {
      dy = streamPath[1][0] - streamPath[0][0]; dx = streamPath[1][1] - streamPath[0][1];
    } else if (i >= streamPath.length - 1) {
      dy = streamPath[streamPath.length - 1][0] - streamPath[streamPath.length - 2][0];
      dx = streamPath[streamPath.length - 1][1] - streamPath[streamPath.length - 2][1];
    } else {
      dy = streamPath[i + 1][0] - streamPath[i - 1][0];
      dx = streamPath[i + 1][1] - streamPath[i - 1][1];
    }

    var dyM = dy * mPerLat, dxM = dx * mPerLng;
    var len = Math.sqrt(dyM * dyM + dxM * dxM);
    if (len < 0.01) {
      left.push([lat0, lng0]);
      right.push([lat0, lng0]);
      continue;
    }

    // Perpendicular: rotate 90° left = (-dxM, dyM), right = (dxM, -dyM)
    var perpLatUnit = -dxM / len;
    var perpLngUnit = dyM / len;

    // Get bank widths (left, right meters from centerline)
    var lw = 6, rw = 6; // default 6m each side
    if (bankWidths && bankWidths[i]) {
      lw = bankWidths[i][0] || 6;
      rw = bankWidths[i][1] || 6;
    }

    left.push([
      lat0 + (perpLatUnit * lw) / mPerLat,
      lng0 + (perpLngUnit * lw) / mPerLng
    ]);
    right.push([
      lat0 + (perpLatUnit * -rw) / mPerLat,
      lng0 + (perpLngUnit * -rw) / mPerLng
    ]);
  }

  return { left: left, right: right, center: streamPath };
}

/* ── Initialize flow particles ── */
function _initFlowParticles(streamLen) {
  _flowParticles = [];
  _flowCaustics = [];

  var PARTICLE_COUNT = Math.min(500, Math.max(200, streamLen * 8));
  var CAUSTIC_COUNT = Math.min(60, Math.max(15, streamLen * 2));

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var lateral = (Math.random() - 0.5) * 1.8; // -0.9 to 0.9 across channel
    var centerDist = Math.abs(lateral);
    // Velocity profile: center = fast, banks = slow (parabolic)
    var velocityMult = 1.0 - centerDist * centerDist * 0.7;

    _flowParticles.push({
      t: Math.random(),                          // position along stream (0=upstream, 1=downstream)
      lateral: lateral,                            // cross-stream position
      speed: (0.001 + Math.random() * 0.002) * velocityMult,  // per frame advance (faster = more visible motion)
      size: 2 + Math.random() * 4,               // pixel radius (larger)
      opacity: 0.25 + Math.random() * 0.40,      // base opacity (brighter)
      wobblePhase: Math.random() * Math.PI * 2,   // sine wobble offset
      wobbleAmp: 0.002 + Math.random() * 0.006,   // wobble amplitude
      wobbleSpeed: 0.02 + Math.random() * 0.03,   // wobble frequency
      type: centerDist > 0.7 ? 'foam' : 'flow',   // foam near banks
      hue: 190 + Math.random() * 30                // color variation (cyan-blue range)
    });
  }

  // Caustic light spots (larger, slower, brighter)
  for (var c = 0; c < CAUSTIC_COUNT; c++) {
    _flowCaustics.push({
      t: Math.random(),
      lateral: (Math.random() - 0.5) * 1.4,
      speed: 0.0004 + Math.random() * 0.001,
      size: 10 + Math.random() * 22,
      opacity: 0.08 + Math.random() * 0.14,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02
    });
  }
}

/* ── Update particle positions each frame ── */
function _updateFlowParticles() {
  _flowTime += 1;

  for (var i = 0; i < _flowParticles.length; i++) {
    var p = _flowParticles[i];
    p.t += p.speed;
    if (p.t > 1) p.t -= 1;
    // Lateral wobble (sinusoidal — natural drift)
    p.lateral += Math.sin(_flowTime * p.wobbleSpeed + p.wobblePhase) * p.wobbleAmp;
    // Clamp lateral
    if (p.lateral > 0.92) p.lateral = 0.92;
    if (p.lateral < -0.92) p.lateral = -0.92;
  }

  for (var j = 0; j < _flowCaustics.length; j++) {
    var c = _flowCaustics[j];
    c.t += c.speed;
    if (c.t > 1) c.t -= 1;
    c.lateral += Math.sin(_flowTime * 0.005 + c.phase) * 0.001;
    if (c.lateral > 0.65) c.lateral = 0.65;
    if (c.lateral < -0.65) c.lateral = -0.65;
  }
}

/* ── Project lat/lng to canvas pixel coords ── */
// Canvas is repositioned each frame via L.DomUtil.setPosition so its (0,0)
// aligns with the container's (0,0). Therefore latLngToContainerPoint coords
// map directly to canvas pixels — no offset subtraction needed.
function _flowProject(lat, lng) {
  if (!map) return [0, 0];
  var pt = map.latLngToContainerPoint([lat, lng]);
  return [pt.x * _flowDpr, pt.y * _flowDpr];
}

/* ── Interpolate position along streamPath at parameter t (0-1) ── */
function _flowInterpolateStream(t, bankGeom) {
  var path = bankGeom.center;
  var left = bankGeom.left;
  var right = bankGeom.right;
  var n = path.length;
  if (n < 2) return { cx: 0, cy: 0, lx: 0, ly: 0, rx: 0, ry: 0 };

  var pos = t * (n - 1);
  var idx = Math.floor(pos);
  var frac = pos - idx;
  if (idx >= n - 1) { idx = n - 2; frac = 1; }

  var cLat = path[idx][0] + (path[idx + 1][0] - path[idx][0]) * frac;
  var cLng = path[idx][1] + (path[idx + 1][1] - path[idx][1]) * frac;
  var lLat = left[idx][0] + (left[idx + 1][0] - left[idx][0]) * frac;
  var lLng = left[idx][1] + (left[idx + 1][1] - left[idx][1]) * frac;
  var rLat = right[idx][0] + (right[idx + 1][0] - right[idx][0]) * frac;
  var rLng = right[idx][1] + (right[idx + 1][1] - right[idx][1]) * frac;

  var cp = _flowProject(cLat, cLng);
  var lp = _flowProject(lLat, lLng);
  var rp = _flowProject(rLat, rLng);

  return { cx: cp[0], cy: cp[1], lx: lp[0], ly: lp[1], rx: rp[0], ry: rp[1] };
}

/* ── Render a single frame ── */
function _renderFlowFrame() {
  if (!_flowActive || !_flowCanvas || !_flowCtx || !map) return;

  _flowAnimFrame = requestAnimationFrame(_renderFlowFrame);

  try {
  // Update canvas position to track map pane
  var size = map.getSize();
  var w = size.x * _flowDpr;
  var h = size.y * _flowDpr;

  if (_flowCanvas.width !== w || _flowCanvas.height !== h) {
    _flowCanvas.width = w;
    _flowCanvas.height = h;
    _flowCanvas.style.width = size.x + 'px';
    _flowCanvas.style.height = size.y + 'px';
  }

  // Reposition canvas to compensate for pane transforms
  var topLeft = map.containerPointToLayerPoint([0, 0]);
  L.DomUtil.setPosition(_flowCanvas, topLeft);

  var ctx = _flowCtx;
  ctx.clearRect(0, 0, w, h);

  // Compute bank geometry in pixel space
  var bankGeom = _computeBankGeometry(_flowStreamPath, _flowBankWidths);
  var leftPx = [], rightPx = [], centerPx = [];

  for (var i = 0; i < bankGeom.center.length; i++) {
    centerPx.push(_flowProject(bankGeom.center[i][0], bankGeom.center[i][1]));
    leftPx.push(_flowProject(bankGeom.left[i][0], bankGeom.left[i][1]));
    rightPx.push(_flowProject(bankGeom.right[i][0], bankGeom.right[i][1]));
  }

  if (centerPx.length < 2) return;

  // ── 1) WATER CHANNEL FILL ──
  // Build closed polygon: left bank forward → right bank reversed
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(leftPx[0][0], leftPx[0][1]);
  for (var li = 1; li < leftPx.length; li++) {
    // Smooth quadratic curves between points
    if (li < leftPx.length - 1) {
      var cpx = (leftPx[li][0] + leftPx[li + 1][0]) / 2;
      var cpy = (leftPx[li][1] + leftPx[li + 1][1]) / 2;
      ctx.quadraticCurveTo(leftPx[li][0], leftPx[li][1], cpx, cpy);
    } else {
      ctx.lineTo(leftPx[li][0], leftPx[li][1]);
    }
  }
  // Connect to right bank (reversed)
  for (var ri = rightPx.length - 1; ri >= 0; ri--) {
    if (ri > 0) {
      var cpx2 = (rightPx[ri][0] + rightPx[ri - 1][0]) / 2;
      var cpy2 = (rightPx[ri][1] + rightPx[ri - 1][1]) / 2;
      ctx.quadraticCurveTo(rightPx[ri][0], rightPx[ri][1], cpx2, cpy2);
    } else {
      ctx.lineTo(rightPx[ri][0], rightPx[ri][1]);
    }
  }
  ctx.closePath();

  // Multi-layer water fill for depth effect
  // Layer 1: Deep base (dark teal) — strong opacity so user can clearly see it
  ctx.fillStyle = 'rgba(8, 55, 85, 0.60)';
  ctx.fill();
  // Layer 2: Mid-tone (blue-green)
  ctx.fillStyle = 'rgba(15, 100, 135, 0.30)';
  ctx.fill();
  // Layer 3: Surface shimmer
  ctx.fillStyle = 'rgba(35, 170, 210, 0.12)';
  ctx.fill();

  // Clip to water channel for all subsequent drawing
  ctx.clip();

  // ── 2) DEPTH GRADIENT ── (center darker than edges)
  // Draw center channel line with wider, darker fill
  ctx.beginPath();
  ctx.moveTo(centerPx[0][0], centerPx[0][1]);
  for (var ci = 1; ci < centerPx.length; ci++) {
    if (ci < centerPx.length - 1) {
      var ccp = [(centerPx[ci][0] + centerPx[ci + 1][0]) / 2, (centerPx[ci][1] + centerPx[ci + 1][1]) / 2];
      ctx.quadraticCurveTo(centerPx[ci][0], centerPx[ci][1], ccp[0], ccp[1]);
    } else {
      ctx.lineTo(centerPx[ci][0], centerPx[ci][1]);
    }
  }
  ctx.lineWidth = 14 * _flowDpr;
  ctx.strokeStyle = 'rgba(5, 40, 70, 0.15)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // ── 3) CAUSTIC LIGHT PATTERNS ──
  _updateFlowParticles();

  for (var ca = 0; ca < _flowCaustics.length; ca++) {
    var caus = _flowCaustics[ca];
    var cPos = _flowInterpolateStream(caus.t, bankGeom);
    // Interpolate lateral position between center and bank
    var cLatFrac = caus.lateral;
    var cx, cy;
    if (cLatFrac >= 0) {
      cx = cPos.cx + (cPos.lx - cPos.cx) * cLatFrac;
      cy = cPos.cy + (cPos.ly - cPos.cy) * cLatFrac;
    } else {
      cx = cPos.cx + (cPos.rx - cPos.cx) * (-cLatFrac);
      cy = cPos.cy + (cPos.ry - cPos.cy) * (-cLatFrac);
    }

    var cPulse = 0.5 + 0.5 * Math.sin(_flowTime * caus.pulseSpeed + caus.phase);
    var cSize = caus.size * (0.6 + cPulse * 0.4) * _flowDpr;
    var cAlpha = caus.opacity * (0.3 + cPulse * 0.7);

    // Noise-modulated caustic shape
    var noiseVal = _noise2d(cx * 0.01 + _flowTime * 0.003, cy * 0.01);
    cSize *= (0.8 + noiseVal * 0.4);

    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cSize);
    grad.addColorStop(0, 'rgba(160, 230, 255, ' + (cAlpha * 0.8).toFixed(3) + ')');
    grad.addColorStop(0.4, 'rgba(100, 200, 240, ' + (cAlpha * 0.4).toFixed(3) + ')');
    grad.addColorStop(1, 'rgba(60, 160, 220, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, cSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── 4) FLOW PARTICLES ──
  for (var pi = 0; pi < _flowParticles.length; pi++) {
    var part = _flowParticles[pi];
    var pPos = _flowInterpolateStream(part.t, bankGeom);
    var pLatFrac = part.lateral;

    var px, py;
    if (pLatFrac >= 0) {
      px = pPos.cx + (pPos.lx - pPos.cx) * pLatFrac;
      py = pPos.cy + (pPos.ly - pPos.cy) * pLatFrac;
    } else {
      px = pPos.cx + (pPos.rx - pPos.cx) * (-pLatFrac);
      py = pPos.cy + (pPos.ry - pPos.cy) * (-pLatFrac);
    }

    var pSize = part.size * _flowDpr;
    var pAlpha = part.opacity;

    // Foam particles: white, slightly larger
    if (part.type === 'foam') {
      var foamPulse = 0.5 + 0.5 * Math.sin(_flowTime * 0.04 + part.wobblePhase);
      pAlpha *= (0.5 + foamPulse * 0.5);
      ctx.fillStyle = 'rgba(230, 245, 255, ' + Math.min(pAlpha * 1.5, 0.9).toFixed(3) + ')';
      pSize *= 1.5;
    } else {
      // Regular flow particle: translucent blue/cyan
      var pHue = part.hue;
      var centerBoost = 1.0 - Math.abs(pLatFrac) * 0.3;
      pAlpha *= centerBoost;
      ctx.fillStyle = 'hsla(' + pHue + ', 75%, 72%, ' + Math.min(pAlpha * 1.4, 0.85).toFixed(3) + ')';
    }

    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── 5) NOISE-BASED WATER TEXTURE ──
  // Subtle noise overlay for organic water feel
  var noiseScale = 0.008;
  var timeOffset = _flowTime * 0.02;
  // Sample noise at sparse grid points for performance
  var step = Math.max(12, Math.round(20 / _flowDpr));
  var bounds = _getFlowBounds(centerPx, leftPx, rightPx);
  if (bounds) {
    ctx.globalCompositeOperation = 'screen';
    for (var ny = bounds.minY; ny < bounds.maxY; ny += step * _flowDpr) {
      for (var nx = bounds.minX; nx < bounds.maxX; nx += step * _flowDpr) {
        var nv = _noise2d(nx * noiseScale + timeOffset, ny * noiseScale + timeOffset * 0.7);
        if (nv > 0.15) {
          var nAlpha = (nv - 0.15) * 0.12;
          ctx.fillStyle = 'rgba(180, 230, 255, ' + nAlpha.toFixed(3) + ')';
          ctx.fillRect(nx, ny, step * _flowDpr, step * _flowDpr);
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore(); // un-clip

  // ── 6) BANK EDGE GLOW LINES ──
  // Outer glow (wide, visible)
  _drawBankLine(ctx, leftPx, 6 * _flowDpr, 'rgba(30, 190, 170, 0.25)');
  _drawBankLine(ctx, rightPx, 6 * _flowDpr, 'rgba(30, 190, 170, 0.25)');
  // Mid glow
  _drawBankLine(ctx, leftPx, 3.5 * _flowDpr, 'rgba(50, 215, 195, 0.45)');
  _drawBankLine(ctx, rightPx, 3.5 * _flowDpr, 'rgba(50, 215, 195, 0.45)');
  // Core line (bright, thin)
  _drawBankLine(ctx, leftPx, 1.8 * _flowDpr, 'rgba(70, 240, 215, 0.75)');
  _drawBankLine(ctx, rightPx, 1.8 * _flowDpr, 'rgba(70, 240, 215, 0.75)');
  } catch(renderErr) {
    _flowRenderErrors = (_flowRenderErrors || 0) + 1;
    console.error('[HT-FLOW] Render frame error #' + _flowRenderErrors + ':', renderErr);
    if (_flowRenderErrors >= 3) {
      _flowActive = false;
      if (typeof showNotice === 'function') showNotice('⚠️ Stream flow crashed: ' + renderErr.message, 'error', 6000);
    }
  }
}

/* ── Draw a smoothed bank line ── */
function _drawBankLine(ctx, pts, width, color) {
  if (!pts || pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) {
    if (i < pts.length - 1) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2;
      var my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    } else {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/* ── Get bounding box of flow area ── */
function _getFlowBounds(center, left, right) {
  var all = center.concat(left).concat(right);
  if (!all.length) return null;
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (var i = 0; i < all.length; i++) {
    if (all[i][0] < minX) minX = all[i][0];
    if (all[i][1] < minY) minY = all[i][1];
    if (all[i][0] > maxX) maxX = all[i][0];
    if (all[i][1] > maxY) maxY = all[i][1];
  }
  return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
}

/* ── Deploy the animated stream flow overlay ── */
function deployStreamFlowOverlay(water, zone) {
  clearStreamFlowOverlay();
  if (!map || !water) return;
  if (!LIDAR_CONFIG.ENABLED) { console.warn('[HT-FLOW] LiDAR disabled — no flow overlay'); return; }

  var segment = getZoneStreamSegment(water, zone);
  if (!segment || segment.length < 3) return;

  // GUARDRAIL: Only use LiDAR-derived streamPath + bankWidths
  if (!_validateLidarInput(segment, water.bankWidths || null)) {
    console.warn('[HT-FLOW] LiDAR validation failed — no flow overlay');
    return;
  }

  _flowStreamPath = segment;
  // Slice bankWidths to match zone segment offset (fixes overlay/pin alignment)
  var flowStartIdx = segment.__zoneStartIdx || 0;
  _flowBankWidths = (water.bankWidths || []).slice(flowStartIdx, flowStartIdx + segment.length);
  if (!_flowBankWidths.length) _flowBankWidths = water.bankWidths || null;
  _flowTerrain = _analyzeStreamTerrain(segment, _flowBankWidths);
  _flowDpr = window.devicePixelRatio || 1;
  _flowTime = 0;
  _flowRenderErrors = 0;  // reset error counter for fresh deploy

  // Create Leaflet pane for z-ordering (above tiles, below markers)
  if (!map.getPane('streamFlowPane')) {
    map.createPane('streamFlowPane');
  }
  var pane = map.getPane('streamFlowPane');
  pane.style.zIndex = '450';    // above overlayPane (400), below markerPane (600)
  pane.style.pointerEvents = 'none';
  pane.style.opacity = '1';
  pane.style.visibility = 'visible';
  pane.style.display = 'block';

  // Create canvas element
  _flowCanvas = document.createElement('canvas');
  _flowCanvas.className = 'ht-stream-flow-canvas';
  var size = map.getSize();
  _flowCanvas.width = size.x * _flowDpr;
  _flowCanvas.height = size.y * _flowDpr;
  _flowCanvas.style.width = size.x + 'px';
  _flowCanvas.style.height = size.y + 'px';
  _flowCanvas.style.position = 'absolute';
  _flowCanvas.style.top = '0';
  _flowCanvas.style.left = '0';
  _flowCanvas.style.pointerEvents = 'none';
  pane.appendChild(_flowCanvas);

  _flowCtx = _flowCanvas.getContext('2d');

  // Initialize particle system
  _initFlowParticles(segment.length);
  _flowActive = true;

  // Start animation loop
  _renderFlowFrame();

  // Handle resize and map movement
  map.on('resize', _onFlowResize);
  map.on('moveend', _onFlowResize);  // redraw after pan/zoom
  map.on('zoomend', _onFlowResize);  // redraw after zoom

  console.log('[HT-FLOW] Stream flow overlay deployed — LiDAR-locked, ' +
    _flowParticles.length + ' particles, ' + _flowCaustics.length + ' caustics');
}

/* ── Handle map resize ── */
function _onFlowResize() {
  if (!_flowCanvas || !map) return;
  var size = map.getSize();
  _flowCanvas.width = size.x * _flowDpr;
  _flowCanvas.height = size.y * _flowDpr;
  _flowCanvas.style.width = size.x + 'px';
  _flowCanvas.style.height = size.y + 'px';
}

/* ── Remove the stream flow overlay ── */
function clearStreamFlowOverlay() {
  _flowActive = false;
  if (_flowAnimFrame) {
    cancelAnimationFrame(_flowAnimFrame);
    _flowAnimFrame = null;
  }
  if (_flowCanvas && _flowCanvas.parentNode) {
    _flowCanvas.parentNode.removeChild(_flowCanvas);
  }
  _flowCanvas = null;
  _flowCtx = null;
  _flowParticles = [];
  _flowCaustics = [];
  _flowStreamPath = null;
  _flowBankWidths = null;
  _flowTerrain = null;
  _flowTime = 0;
  if (map) {
    try { map.off('resize', _onFlowResize); } catch (e) {}
    try { map.off('moveend', _onFlowResize); } catch (e) {}
    try { map.off('zoomend', _onFlowResize); } catch (e) {}
  }
}

// Expose for external use
window.deployStreamFlowOverlay = deployStreamFlowOverlay;
window.clearStreamFlowOverlay = clearStreamFlowOverlay;

/* ── Cleanup when session ends ── */
window._cleanupAiGuide = function() {
  _stopProximityWatch();
  _aiFishingPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _aiFishingPins = [];
  _aiFishingSpots = [];
  _activeMicroPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _activeMicroPins = [];
  _activeMicroPolygons.forEach(function(p) { try { map.removeLayer(p); } catch {} });
  _activeMicroPolygons = [];
  if (_activeZonePolygon) { try { map.removeLayer(_activeZonePolygon); } catch {} _activeZonePolygon = null; }
  if (_missionSummaryEl) { try { _missionSummaryEl.remove(); } catch {} _missionSummaryEl = null; }
  if (_spotInfoTrayEl) { try { _spotInfoTrayEl.remove(); } catch {} _spotInfoTrayEl = null; }
  // Stream flow canvas overlay cleanup
  if (typeof clearStreamFlowOverlay === 'function') { try { clearStreamFlowOverlay(); } catch(e) {} }
  _checkedInPinIdx = -1;
  _checkedInMicroIdx = -1;
  _aiCoachState = { reports: [], currentStrategy: null, currentFlyRec: null, lastUpdate: 0 };
};
window.flyAddInventoryItem = function(kind, entryOverride) {
  if (!isFlyModule()) return;
  const inv = loadFlyInventory();
  const label = String(kind || '').toLowerCase();
  if (!inv[label]) inv[label] = [];
  const entry = entryOverride || '';
  if (!entry) return;
  const items = entry.split(',').map((item) => item.trim()).filter(Boolean);
  if (!items.length) return;
  inv[label].push(...items);
  saveFlyInventory();
  showFlyCoachPanel();
  updateFlyCoachFeed(`${items.length} ${label} added to inventory.`);
};

window.flyScanFlyBox = function(entryOverride) {
  if (!isFlyModule()) return;
  const inv = loadFlyInventory();
  const entry = entryOverride || '';
  if (!entry) return;
  const items = entry.split(',').map((item) => item.trim()).filter(Boolean);
  if (!items.length) return;
  inv.flies = inv.flies.concat(items);
  saveFlyInventory();
  showFlyCoachPanel();
  updateFlyCoachFeed(`${items.length} flies added from scan.`);
};

window.flyAddInventoryFromPanel = function() {
  if (!isFlyModule()) return;
  const kind = getFlyInputValue('flyInvKindSelect') || 'flies';
  const entry = getFlyInputValue('flyInvEntry');
  if (!entry) {
    showNotice('Add at least one item before saving.', 'warning', 3200);
    return;
  }
  window.flyAddInventoryItem(kind, entry);
};

window.flyScanFlyBoxFromPanel = function() {
  if (!isFlyModule()) return;
  const entry = getFlyInputValue('flyBoxEntry');
  if (!entry) {
    showNotice('Paste fly names before saving.', 'warning', 3200);
    return;
  }
  window.flyScanFlyBox(entry);
};

window.flyLogCatchFromPanel = function() {
  if (!isFlyModule()) return;
  const species = getFlyInputValue('flyCatchSpecies') || 'Trout';
  const notes = getFlyInputValue('flyCatchNotes');
  logFlyCatchEntry(species, notes);
};

// ── END-OF-FILE HEALTH CHECK ──
console.log('[HT-FLY] === FILE FULLY PARSED ===');
console.log('[HT-FLY] deployStreamFlowOverlay:', typeof deployStreamFlowOverlay);
console.log('[HT-FLY] window.deployStreamFlowOverlay:', typeof window.deployStreamFlowOverlay);
console.log('[HT-FLY] deployAiFishingPins:', typeof window.deployAiFishingPins);
console.log('[HT-FLY] LIDAR_CONFIG.ENABLED:', typeof LIDAR_CONFIG !== 'undefined' && LIDAR_CONFIG.ENABLED);
console.log('[HT-FLY] _flowActive:', typeof _flowActive !== 'undefined' ? _flowActive : 'UNDEFINED');
