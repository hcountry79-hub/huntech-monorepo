// ===================================================================
// HUNTECH - Fly Fishing Module (extracted from main.js)
// ===================================================================

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
      // Access/zone pins hidden — deployed only on check-in
    }
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
  if (window._fishFlow) {
    window._fishFlow.selectedZoneIdx = idx;
    window._fishFlow.zoneManuallyPicked = true;
  }
};

/* ══ SMART ZONE AUTO-SELECTION ENGINE ══
   Scores all zones based on user's method, experience, wading, and zone metadata.
   Returns the index of the best zone for the angler. */
function _scoreZoneForAngler(zone, fishFlow) {
  var score = 0;
  var method = fishFlow.method || 'fly';
  var experience = fishFlow.experience || 'learning';
  var wade = fishFlow.wade || 'waders';

  // Method match — all zones now allow all methods, but zone habitat suits some methods better
  var habitat = (zone.habitat || '').toLowerCase();
  var depth = (zone.depth || '').toLowerCase();
  var clarity = (zone.clarity || '').toLowerCase();
  var pressure = (zone.pressure || '').toLowerCase();

  if (method === 'fly') {
    // Fly anglers love clear pools and riffles. Spring pool is paradise for fly.
    if (clarity === 'gin-clear') score += 20;
    else if (clarity === 'clear') score += 10;
    if (habitat === 'pool') score += 15;
    if (habitat === 'riffle-run') score += 12;
    if (habitat === 'run') score += 5;
    // Advanced fly anglers prefer challenging water (high pressure)
    if (experience === 'advanced' && pressure === 'high') score += 10;
    if (experience === 'confident' && pressure === 'moderate') score += 8;
  } else if (method === 'spin') {
    // Lure anglers do best in riffle-runs and runs with structure
    if (habitat === 'riffle-run') score += 20;
    if (habitat === 'run') score += 15;
    if (habitat === 'pool') score += 5;
    if (depth === 'medium') score += 8;
    if (pressure === 'moderate') score += 5;
  } else if (method === 'bait') {
    // Bait anglers do best in deeper, slower water with less pressure
    if (habitat === 'run') score += 20;
    if (habitat === 'riffle-run') score += 10;
    if (depth === 'medium-deep' || depth === 'deep') score += 15;
    if (pressure === 'low') score += 12;
  }

  // Experience-based adjustments
  if (experience === 'new' || experience === 'learning') {
    // Beginners benefit from lower pressure, wider water
    if (pressure === 'low') score += 15;
    if (pressure === 'moderate') score += 8;
    if (pressure === 'high') score -= 5;
    if (depth === 'medium' || depth === 'medium-deep') score += 5;
  } else if (experience === 'advanced') {
    // Advanced anglers want the challenge — high pressure crystal water
    if (pressure === 'high') score += 10;
    if (clarity === 'gin-clear') score += 8;
  }

  // Wading preference
  if (wade === 'streamside') {
    // Bank anglers need accessible water — wider runs and lower zones
    if (habitat === 'run') score += 10;
    if (depth === 'medium-deep') score += 5;
    if (pressure === 'low') score += 5;
  } else {
    // Waders can access everything — slight bonus for riffle-runs
    if (habitat === 'riffle-run') score += 5;
  }

  return score;
}

function _autoSelectBestZone(water, fishFlow) {
  var zones = (water.access || []).filter(function(a) { return a.type === 'zone'; });
  if (zones.length === 0) return 0;
  var bestIdx = 0, bestScore = -Infinity;
  zones.forEach(function(z, idx) {
    var s = _scoreZoneForAngler(z, fishFlow);
    if (s > bestScore) { bestScore = s; bestIdx = idx; }
  });
  return bestIdx;
}

/* ══ LET'S GO — main launch sequence ══ */
window.fishLetsGo = function() {
  const fishFlow = window._fishFlow;
  if (!fishFlow || !fishFlow.area) return;
  const water = fishFlow.area;
  const zones = (water.access || []).filter(a => a.type === 'zone');

  // Smart auto-selection: if user didn't manually pick a zone, AI picks the best one
  var zoneIdx;
  if (fishFlow.zoneManuallyPicked && typeof fishFlow.selectedZoneIdx === 'number') {
    zoneIdx = fishFlow.selectedZoneIdx;
  } else {
    zoneIdx = _autoSelectBestZone(water, fishFlow);
    fishFlow.selectedZoneIdx = zoneIdx;
  }
  const zone = zones[zoneIdx] || zones[0];
  if (!zone) return;

  // Store selected zone
  fishFlow.selectedZone = zone;
  fishFlow.selectedZoneIdx = zoneIdx;

  // 1) Collapse the action bar
  closeFlyWaterActionBar();

  // 1b) Hide the main area pill marker so it doesn't clutter the map
  _hideMainAreaPill();

  // 1c) Zone Focus — clear ALL zone pins so only the selected zone remains
  clearZonePins();

  // 2) Deploy zone polygon (flash then fade)
  if (typeof window.deployZonePolygonWithFade === 'function') {
    window.deployZonePolygonWithFade(water, zone);
  }

  // 2b) Center map on the selected zone so user doesn't have to find it
  if (typeof map !== 'undefined' && map && zone.lat && zone.lng) {
    map.setView([zone.lat, zone.lng], 17, { animate: true, duration: 0.8 });
  }

  // 3) Calculate and deploy ranked pins in the selected zone
  setTimeout(function() {
    if (typeof window.deployAiFishingPins === 'function') {
      window.deployAiFishingPins(water, zone, fishFlow);
    }

    // 4) Show mission summary popup
    setTimeout(function() {
      if (typeof window.showMissionSummary === 'function') {
        window.showMissionSummary(water, zone, fishFlow);
      }
    }, 800);
  }, 600);
};

/* Hide the main "BENNETT SPRING STATE PARK" area pill when checked in */
function _hideMainAreaPill() {
  try {
    flyWaterMarkers.forEach(function(m) {
      if (m && m._icon) m._icon.style.display = 'none';
    });
  } catch(e) {}
}
function _showMainAreaPill() {
  try {
    flyWaterMarkers.forEach(function(m) {
      if (m && m._icon) m._icon.style.display = '';
    });
  } catch(e) {}
}
window._showMainAreaPill = _showMainAreaPill;
window._hideMainAreaPill = _hideMainAreaPill;

function getFlyPinIcon(labelText) {
  const label = String(labelText || '').trim();
  return L.divIcon({
    className: 'ht-fly-area-pin',
    html: `<div class="ht-fly-area-pill"><img class="ht-fly-area-pill-icon" src="assets/trout-logo.png" alt="">${escapeHtml(label)}</div>`,
    iconSize: [0, 0],
    iconAnchor: [-15, 30]
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

function addFlyWaterMarker(water, labelOverride) {
  if (!water || !Number.isFinite(water.lat) || !Number.isFinite(water.lng)) return null;
  const label = labelOverride || getFlyWaterMarkerLabel(water);
  const marker = L.marker([water.lat, water.lng], {
    icon: getFlyPinIcon(label)
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
      iconAnchor: [-10, -12]
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
        ${waterId ? `<button style="padding:4px 10px;border-radius:6px;border:1px solid #2bd4ff;background:rgba(43,212,255,0.1);color:#2bd4ff;font-size:11px;font-weight:700;cursor:pointer;"
          onclick="flyFishNow('${waterId}')">Fish Now</button>` : ''}
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
    // Access/zone pins hidden by default — deployed only on check-in
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

/* ── Point-in-polygon ray-casting (strict zone boundary enforcement) ── */
function _pointInPolygon(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return false;
  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var yi = polygon[i][0], xi = polygon[i][1];
    var yj = polygon[j][0], xj = polygon[j][1];
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
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
  // Clear stand-here angler pins
  if (typeof _activeAnglerPins !== 'undefined' && _activeAnglerPins) {
    _activeAnglerPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
    _activeAnglerPins = [];
  }
  // Clear approach direction lines
  if (typeof _activeApproachLines !== 'undefined' && _activeApproachLines) {
    _activeApproachLines.forEach(function(l) { try { map.removeLayer(l); } catch {} });
    _activeApproachLines = [];
  }
  // Clear flow overlay
  if (typeof clearFlowOverlay === 'function') try { clearFlowOverlay(); } catch {}
  // Clear boulders
  if (typeof clearBoulders === 'function') try { clearBoulders(); } catch {}
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
  var emojis = { riffle: '🐟', pool: '🐠', run: '🐟', boulder: '🐡', tailout: '🐟' };
  var emoji = emojis[habitat] || '🐟';
  return L.divIcon({
    className: 'ht-trout-micro-pin',
    html: '<div class="ht-trout-micro-pill">' + emoji + '</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

/* Angler position pin icon — 3D fly fisherman silhouette */
function getAnglerPinIcon() {
  return L.divIcon({
    className: 'ht-angler-pin',
    html: '<div class="ht-angler-3d">' +
      '<svg viewBox="0 0 48 64" width="40" height="54" xmlns="http://www.w3.org/2000/svg">' +
      // Shadow/ground contact
      '<ellipse cx="24" cy="60" rx="10" ry="3" fill="rgba(0,0,0,0.25)" />' +
      // Waders/boots — dark olive
      '<path d="M18 50 L16 58 L20 58 L20 50 Z" fill="#3a5a3a" stroke="#2a4a2a" stroke-width="0.5"/>' +
      '<path d="M26 50 L24 58 L28 58 L28 50 Z" fill="#3a5a3a" stroke="#2a4a2a" stroke-width="0.5"/>' +
      // Legs
      '<path d="M20 40 L19 50 M26 40 L27 50" stroke="#4a6a4a" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
      // Body/torso — fishing vest with 3D gradient
      '<path d="M17 25 Q16 32 18 40 L28 40 Q30 32 29 25 Z" fill="url(#vestGrad)" stroke="#3a5a3a" stroke-width="0.5"/>' +
      // Vest pockets detail
      '<rect x="19" y="30" width="4" height="3" rx="0.5" fill="rgba(0,0,0,0.15)" />' +
      '<rect x="24" y="31" width="3" height="2.5" rx="0.5" fill="rgba(0,0,0,0.12)" />' +
      // Arms
      '<path d="M17 27 L10 22 L5 14" stroke="#4a6a4a" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
      '<path d="M29 27 L34 30" stroke="#4a6a4a" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
      // Hat — wide brim with 3D effect
      '<ellipse cx="23" cy="19" rx="8" ry="2.5" fill="#5a7a5a" />' +
      '<path d="M18 19 Q18 13 23 12 Q28 13 28 19" fill="#6a8a6a" stroke="#4a6a4a" stroke-width="0.5"/>' +
      // Head
      '<circle cx="23" cy="17" r="4.5" fill="#e8c99b" />' +
      // Sunglasses
      '<path d="M20 16.5 L26 16.5" stroke="#333" stroke-width="1.2" stroke-linecap="round"/>' +
      // Fly rod — long dynamic casting arc
      '<path d="M5 14 L2 8 Q0 2 6 0" stroke="#8B7355" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
      '<path d="M5 14 Q3 10 2 8" stroke="#6a5a45" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
      // Fly line arc — graceful casting loop
      '<path class="ht-angler-flyline" d="M6 0 Q14 -4 22 -2 Q30 0 36 6" stroke="rgba(255,224,130,0.6)" stroke-width="0.8" stroke-linecap="round" fill="none"/>' +
      // Fly at end of line
      '<circle cx="36" cy="6" r="1.2" fill="#ffe082" opacity="0.8"/>' +
      // 3D lighting/gradient defs
      '<defs>' +
      '<linearGradient id="vestGrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#6a8a5a"/>' +
      '<stop offset="40%" stop-color="#5a7a4a"/>' +
      '<stop offset="100%" stop-color="#3a5a3a"/>' +
      '</linearGradient>' +
      '</defs>' +
      '</svg></div>',
    iconSize: [40, 54],
    iconAnchor: [20, 54]
  });
}

/* Get the portion of streamPath that belongs to a zone */
function _nearestPathIdx(path, lat, lng) {
  var best = 0, bestDist = Infinity;
  for (var i = 0; i < path.length; i++) {
    var d = Math.pow(path[i][0] - lat, 2) + Math.pow(path[i][1] - lng, 2);
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}

function getZoneStreamSegment(water, zone) {
  if (!water || !water.streamPath || water.streamPath.length < 2) return null;
  var path = water.streamPath;

  // ── Prefer explicit zoneBounds when available ──
  if (zone.zoneBounds && zone.zoneBounds.length === 2) {
    var startIdx = _nearestPathIdx(path, zone.zoneBounds[0][0], zone.zoneBounds[0][1]);
    var endIdx   = _nearestPathIdx(path, zone.zoneBounds[1][0], zone.zoneBounds[1][1]);
    if (startIdx > endIdx) { var tmp = startIdx; startIdx = endIdx; endIdx = tmp; }
    return path.slice(startIdx, endIdx + 1);
  }

  // ── Fallback: midpoint algorithm for zones without explicit bounds ──
  var zones = (water.access || []).filter(function(a) { return a.type === 'zone'; });
  if (zones.length < 2) return path;

  var zoneIndexes = zones.map(function(z) {
    return { zone: z, idx: _nearestPathIdx(path, z.lat, z.lng) };
  });
  zoneIndexes.sort(function(a, b) { return a.idx - b.idx; });

  var myPos = -1;
  for (var i = 0; i < zoneIndexes.length; i++) {
    if (zoneIndexes[i].zone === zone) { myPos = i; break; }
  }
  if (myPos === -1) return path;

  var startIdx = 0, endIdx = path.length - 1;
  if (myPos > 0) startIdx = Math.round((zoneIndexes[myPos - 1].idx + zoneIndexes[myPos].idx) / 2);
  if (myPos < zoneIndexes.length - 1) endIdx = Math.round((zoneIndexes[myPos].idx + zoneIndexes[myPos + 1].idx) / 2);
  return path.slice(startIdx, endIdx + 1);
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

/* Get time-aware fly recommendation */
function getTimeAwareFlyRec(water, habitat) {
  var period = getTimePeriod();
  var season = getCurrentSeason();
  var flavor = window.TROUT_HOTSPOT_FLAVOR && window.TROUT_HOTSPOT_FLAVOR[habitat];
  var edu = window.TROUT_EDUCATION && window.TROUT_EDUCATION[habitat];
  var hatches = (water && water.hatches && water.hatches[season]) || [];
  var flyRec = '';
  var altFly = '';
  if (flavor && flavor.flies && flavor.flies.length) {
    var fIdx = Math.floor(Math.random() * flavor.flies.length);
    flyRec = flavor.flies[fIdx];
    altFly = flavor.flies[(fIdx + 1) % flavor.flies.length];
  }
  var timeAdvice = '';
  if (period === 'early-morning') timeAdvice = 'Low light — use dark patterns. Trout feed aggressively in dawn. Streamers and dark nymphs are ideal.';
  else if (period === 'morning') timeAdvice = 'Prime feeding window. Nymphs and emergers produce consistently. Watch for hatch activity.';
  else if (period === 'midday') timeAdvice = 'Midday sun pushes trout deep. Go subsurface with weighted nymphs. Fish slow pools and shaded banks.';
  else if (period === 'afternoon') timeAdvice = 'Caddis activity often picks up. Dry-dropper rigs cover both surface and subsurface. Stay observant.';
  else if (period === 'evening') timeAdvice = 'Prime time. BWO and caddis spinners. Trout move to tailouts and riffles to sip in soft light.';
  else timeAdvice = 'Night fishing — large streamers stripped slow near structure. Big trout are most aggressive now.';
  return { flyRec: flyRec, altFly: altFly, timeAdvice: timeAdvice, hatches: hatches, season: season, period: period };
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

  // Time-aware fly recommendation
  html += '<div style="font-size:11px;color:#c8e6d5;margin-bottom:4px;line-height:1.4;"><b style="color:#ffe082;">Best Fly (' + escapeHtml(rec.period) + '):</b> ' + escapeHtml(rec.flyRec) + '</div>';
  if (rec.altFly) {
    html += '<div style="font-size:10px;color:#89b5a2;margin-bottom:4px;line-height:1.3;"><b>Backup:</b> ' + escapeHtml(rec.altFly) + '</div>';
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
    console.log('HUNTECH: 📍 ' + deployed + ' zone' + (deployed > 1 ? 's' : '') + ' deployed for ' + label + ' fishing');
  }
};

/* Zone check-in: build polygon + deploy micro pins */
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

  // Build zone polygon from stream segment
  var segment = getZoneStreamSegment(water, zone);
  if (segment && segment.length >= 2) {
    var corridor = buildStreamCorridor(segment, 40);
    if (corridor) {
      zonePolygonLayer = L.polygon(corridor, {
        color: '#7cffc7',
        weight: 2,
        fillColor: '#7cffc7',
        fillOpacity: 0.10,
        dashArray: '5 3'
      }).addTo(map);
    }
  }

  // Deploy micro pins along the zone segment
  var habitats = ['riffle', 'pool', 'run', 'boulder', 'tailout'];
  var numSpots = segment ? Math.min(5, Math.max(3, segment.length - 1)) : 3;
  var spotSegment = segment || [[zone.lat, zone.lng]];

  for (var i = 0; i < numSpots; i++) {
    var pIdx = segment ? Math.round(i * (segment.length - 1) / Math.max(1, numSpots - 1)) : 0;
    var lat = spotSegment[Math.min(pIdx, spotSegment.length - 1)][0];
    var lng = spotSegment[Math.min(pIdx, spotSegment.length - 1)][1];
    var habitat = habitats[i % habitats.length];

    // Slight offset so pins don't overlap stream center
    var jitterLat = (Math.random() - 0.5) * 0.0001;
    var jitterLng = (Math.random() - 0.5) * 0.0001;

    var troutMarker = L.marker([lat + jitterLat, lng + jitterLng], {
      icon: getTroutMicroPinIcon(habitat),
      zIndexOffset: 300
    }).addTo(map);

    // Closure for click
    (function(mk, h) {
      mk.on('click', function() {
        var briefHtml = buildMicroPinBriefing(water, zone, h);
        mk.unbindPopup();
        mk.bindPopup(briefHtml, { maxWidth: 340, className: 'ht-micro-popup' }).openPopup();
      });
    })(troutMarker, habitat);

    microPinMarkers.push(troutMarker);

    // Place angler position pin (first spot gets it)
    if (i === 0 && segment && segment.length >= 2) {
      // Wade-aware: waders = IN water (5m offset), shore = near bank (8m)
      var wadeOffset = (window._fishFlow && window._fishFlow.wade === 'waders') ? 5 : 8;
      var anglerPos = getAnglerOffset(segment, pIdx, wadeOffset);
      anglerPinMarker = L.marker(anglerPos, {
        icon: getAnglerPinIcon(),
        zIndexOffset: 250
      }).addTo(map);
      anglerPinMarker.bindPopup(
        '<div style="min-width:180px;">' +
        '<div style="font-weight:700;color:#ffe082;font-size:13px;">🎣 Your Setup Position</div>' +
        '<div style="font-size:11px;color:#c8e6d5;margin-top:4px;line-height:1.3;">Set up here. Face the stream. Keep your shadow behind you. Start with short casts to the nearest lie, then work outward.</div>' +
        '</div>',
        { maxWidth: 260 }
      );
    }
  }

  // Zoom to zone
  map.setView([zone.lat, zone.lng], 17, { animate: true, duration: 0.8 });
  console.log('HUNTECH: ✅ Checked in at ' + zone.name + ' — ' + numSpots + ' cast-to spots deployed');
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

function getFlyInventoryRecommendations(limit = 3) {
  const inv = loadFlyInventory();
  const flies = Array.isArray(inv.flies) ? inv.flies : [];
  const picks = [];
  for (const entry of flies) {
    if (picks.length >= limit) break;
    if (typeof entry === 'string') {
      picks.push({ name: entry, color: 'Varied', size: 'Assorted', imageUrl: '' });
    } else if (entry && typeof entry === 'object') {
      picks.push({
        name: entry.name || 'Fly',
        color: entry.color || 'Varied',
        size: entry.size || 'Assorted',
        imageUrl: entry.imageUrl || ''
      });
    }
  }
  return picks;
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
  const tray = ensureFlyLiveCommandTray();
  tray.classList.add('is-visible');
}

function hideFlyLiveCommandTray() {
  if (!flyLiveCommandTray) return;
  flyLiveCommandTray.classList.remove('is-visible');
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

function handleFlyBoxScanFiles(files) {
  const next = files.map((file) => ({
    id: `fly-scan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: 'Fly',
    color: 'Varied',
    size: 'Assorted',
    imageUrl: URL.createObjectURL(file)
  }));
  flyFlyBoxScans = flyFlyBoxScans.concat(next);
  openFlyBoxReviewModal(next);
}

function openFlyBoxReviewModal(scans) {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = `
    <h3>Fly Box Scan</h3>
    <div class="ht-fly-scan-grid">
      ${scans.map((scan) => `
        <div class="ht-fly-scan-card" data-fly-scan-id="${scan.id}">
          <img src="${scan.imageUrl}" alt="Fly scan">
          <input class="ht-fly-scan-input" type="text" placeholder="Fly name" value="${escapeHtml(scan.name)}">
          <input class="ht-fly-scan-input" type="text" placeholder="Color" value="${escapeHtml(scan.color)}">
          <input class="ht-fly-scan-input" type="text" placeholder="Size" value="${escapeHtml(scan.size)}">
        </div>
      `).join('')}
    </div>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn ghost" type="button" data-fly-scan-cancel>Cancel</button>
      <button class="ht-modal-btn primary" type="button" data-fly-scan-save>Save To Inventory</button>
    </div>
  `;

  const closeModal = () => backdrop.remove();
  modal.querySelector('[data-fly-scan-cancel]')?.addEventListener('click', closeModal);
  modal.querySelector('[data-fly-scan-save]')?.addEventListener('click', () => {
    const inv = loadFlyInventory();
    const cards = Array.from(modal.querySelectorAll('.ht-fly-scan-card'));
    const entries = [];
    cards.forEach((card) => {
      const id = card.dataset.flyScanId;
      const inputs = card.querySelectorAll('.ht-fly-scan-input');
      const name = inputs[0]?.value.trim() || 'Fly';
      const color = inputs[1]?.value.trim() || 'Varied';
      const size = inputs[2]?.value.trim() || 'Assorted';
      const scan = scans.find((item) => item.id === id);
      if (!scan) return;
      const entry = { name, color, size, imageUrl: scan.imageUrl };
      entries.push(entry);
    });
    inv.flies = Array.isArray(inv.flies) ? inv.flies.concat(entries) : entries;
    saveFlyInventory();
    updateFlyCoachFeed(`${entries.length} flies added from scan.`);
    closeModal();
  });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function openFlyRecommendationsModal() {
  const picks = getFlyInventoryRecommendations(4);
  const body = picks.length
    ? `<div class="ht-fly-strategy-fly-list">${picks.map((pick) => `
        <div class="ht-fly-strategy-fly">
          <div class="ht-fly-strategy-fly-thumb">${pick.imageUrl ? `<img src="${pick.imageUrl}" alt="${escapeHtml(pick.name)}">` : 'Fly'}</div>
          <div>
            <div class="ht-fly-strategy-fly-name">${escapeHtml(pick.name)}</div>
            <div class="ht-fly-strategy-fly-meta">${escapeHtml(pick.color)} • ${escapeHtml(pick.size)}</div>
          </div>
        </div>
      `).join('')}</div>`
    : '<div class="ht-fly-note">Scan your fly box to see recommendations with photos.</div>';
  openInfoModal({
    title: 'Fly Recommendations',
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
  modal.innerHTML = `
    <h3>Log Catch</h3>
    <div style="display:grid;gap:10px;">
      <label style="font-size:12px;color:#bbb;">Species</label>
      <input type="text" id="flyCatchSpeciesLive" placeholder="Rainbow, brown, etc.">
      <label style="font-size:12px;color:#bbb;">Notes</label>
      <input type="text" id="flyCatchNotesLive" placeholder="Fly, depth, hatch">
    </div>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn ghost" type="button" data-fly-catch-cancel>Cancel</button>
      <button class="ht-modal-btn primary" type="button" data-fly-catch-save>Save</button>
    </div>
  `;

  const closeModal = () => backdrop.remove();
  modal.querySelector('[data-fly-catch-cancel]')?.addEventListener('click', closeModal);
  modal.querySelector('[data-fly-catch-save]')?.addEventListener('click', () => {
    const species = modal.querySelector('#flyCatchSpeciesLive')?.value.trim() || 'Trout';
    const notes = modal.querySelector('#flyCatchNotesLive')?.value.trim() || '';
    logFlyCatchEntry(species, notes);
    closeModal();
  });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
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
  // Route into the Fish Now wizard so the user goes through the proper flow
  if (typeof window.fishSelectWater === 'function') {
    closeFlyWaterActionBar();
    if (typeof window.showStreamPanel === 'function') window.showStreamPanel('fishNowPanel');
    window.fishSelectWater(id);
    return;
  }
  // Fallback to old coach tray if wizard not ready
  const water = getFlyWaterById(id) || getSavedTroutWaterById(id);
  if (water) focusFlyWater(water);
  openFlyCommandTray(water || null);
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
   AI GUIDED FISHING ENGINE — Zone Polygons, Ranked Pins, Proximity,
   Mission Summary, Spot Info Tray, Voice AI Coach
   ═══════════════════════════════════════════════════════════════════════ */

var _aiFishingPins = [];        // ranked pin markers
var _aiFishingSpots = [];       // spot data objects
var _activeZonePolygon = null;  // current zone polygon layer
var _activeMicroPolygons = [];  // micro-area polygons
var _activeMicroPins = [];      // micro-spot pins within a pin area
var _activeFlowLayers = [];     // water flow simulation overlay layers
var _activeAnglerPins = [];     // stand-here angler position pins
var _activeApproachLines = [];  // approach direction polylines
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
window.deployZonePolygonWithFade = function(water, zone) {
  if (!water || !zone || !map) return;

  // Clear any previous
  if (_activeZonePolygon) { try { map.removeLayer(_activeZonePolygon); } catch {} }

  var segment = getZoneStreamSegment(water, zone);
  if (!segment || segment.length < 2) return;

  var corridor = buildStreamCorridor(segment, 45);
  if (!corridor) return;

  _activeZonePolygon = L.polygon(corridor, {
    color: '#7cffc7',
    weight: 2,
    fillColor: '#2bd4ff',
    fillOpacity: 0.25,
    dashArray: '6 3',
    className: 'ht-zone-polygon-flash'
  }).addTo(map);

  // Flash bright then fade out completely
  setTimeout(function() {
    if (_activeZonePolygon) {
      _activeZonePolygon.setStyle({ fillOpacity: 0.15 });
    }
  }, 1500);
  setTimeout(function() {
    if (_activeZonePolygon) {
      _activeZonePolygon.setStyle({ fillOpacity: 0.08, weight: 1 });
    }
  }, 3000);
  setTimeout(function() {
    if (_activeZonePolygon) {
      _activeZonePolygon.setStyle({ fillOpacity: 0.02, weight: 0.5, opacity: 0.2 });
    }
  }, 5000);
  setTimeout(function() {
    if (_activeZonePolygon) {
      try { map.removeLayer(_activeZonePolygon); } catch {}
      _activeZonePolygon = null;
    }
  }, 7000);
};

/* ═══════════════════════════════════════════════════════════════════
   WATER FLOW SIMULATION OVERLAY — ULTRA REALISTIC
   High-fidelity stream rendering: multi-layer water body, organic
   banks with Catmull-Rom interpolation, dynamic current lanes,
   shimmer particles, ripples, and flow direction indicators.
   ═══════════════════════════════════════════════════════════════════ */
function clearFlowOverlay() {
  _activeFlowLayers.forEach(function(l) { try { map.removeLayer(l); } catch {} });
  _activeFlowLayers = [];
}

/* Catmull-Rom spline interpolation for smooth organic curves */
function _catmullRomInterpolate(points, segments) {
  if (points.length < 3) return points.slice();
  var result = [];
  for (var i = 0; i < points.length - 1; i++) {
    var p0 = points[Math.max(0, i - 1)];
    var p1 = points[i];
    var p2 = points[Math.min(points.length - 1, i + 1)];
    var p3 = points[Math.min(points.length - 1, i + 2)];
    for (var t = 0; t < segments; t++) {
      var tt = t / segments;
      var tt2 = tt * tt;
      var tt3 = tt2 * tt;
      var lat = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * tt + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * tt2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * tt3);
      var lng = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * tt + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * tt2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * tt3);
      result.push([lat, lng]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

/* Build bank offset path — follows stream centerline geometry precisely.
   Width is derived from water.avgStreamWidth (meters, half-width each side).
   Minimal natural variation (+/- 0.3m) based on path curvature only — NO
   fake sine waves. The result hugs the OSM centerline at measured distances
   so the rendered banks match the actual physical bank lines. */
function _buildBankPath(seg, mPerLat, mPerLng, baseWidth, side, _unused) {
  var bank = [];
  for (var i = 0; i < seg.length; i++) {
    var lat = seg[i][0], lng = seg[i][1];
    var dy, dx;
    // Use ±2 node window for smoother perpendicular direction at bends
    var bk = Math.max(0, i - 2);
    var fw = Math.min(seg.length - 1, i + 2);
    dy = seg[fw][0] - seg[bk][0];
    dx = seg[fw][1] - seg[bk][1];
    var dyM = dy * mPerLat, dxM = dx * mPerLng;
    var len = Math.sqrt(dyM * dyM + dxM * dxM);
    if (len < 0.01) { bank.push([lat, lng]); continue; }
    var pLat = (-dxM / len) / mPerLat;
    var pLng = (dyM / len) / mPerLng;
    // Curvature-based width variation: tighter bends are slightly wider
    var curveFactor = 0;
    if (i > 0 && i < seg.length - 1) {
      var ax = seg[i][0] - seg[i-1][0], ay = seg[i][1] - seg[i-1][1];
      var bx = seg[i+1][0] - seg[i][0], by = seg[i+1][1] - seg[i][1];
      var cross = Math.abs(ax * by - ay * bx);
      curveFactor = Math.min(0.3, cross * 800000); // max 0.3m wider at tight bends
    }
    var width = baseWidth + curveFactor;
    bank.push([lat + pLat * width * side, lng + pLng * width * side]);
  }
  return bank;
}

function deployFlowOverlay(water, zone) {
  clearFlowOverlay();
  var seg = getZoneStreamSegment(water, zone);
  if (!seg || seg.length < 3 || !map) return;

  var R = Math.PI / 180;
  var mPerLat = 111000;
  var mPerLng = 111000 * Math.cos(seg[0][0] * R);

  // ── Stream width from measured data (meters, half-width each side) ──
  // avgStreamWidth is the full bank-to-bank width. Half = each side offset.
  var fullWidth = (water && water.avgStreamWidth) ? water.avgStreamWidth : 12;
  var halfWidth = fullWidth / 2; // meters from centerline to bank edge

  // Interpolate stream path for smooth curves (4x resolution)
  var smoothSeg = _catmullRomInterpolate(seg, 4);

  // ── LAYER 1: Water body polygon — full bank-to-bank width ──
  var bankLeft  = _buildBankPath(smoothSeg, mPerLat, mPerLng, halfWidth, 1, 0);
  var bankRight = _buildBankPath(smoothSeg, mPerLat, mPerLng, halfWidth, -1, 0);
  var bankPoly  = bankLeft.concat(bankRight.slice().reverse());

  var waterBody = L.polygon(bankPoly, {
    color: 'transparent',
    weight: 0,
    fillColor: '#0a4a6a',
    fillOpacity: 0.30,
    className: 'ht-water-body ht-water-body-deep',
    interactive: false
  }).addTo(map);
  _activeFlowLayers.push(waterBody);

  // ── LAYER 2: Mid-depth water — 80% of bank width ──
  var midHalf = halfWidth * 0.80;
  var midLeft  = _buildBankPath(smoothSeg, mPerLat, mPerLng, midHalf, 1, 0);
  var midRight = _buildBankPath(smoothSeg, mPerLat, mPerLng, midHalf, -1, 0);
  var midPoly  = midLeft.concat(midRight.slice().reverse());

  var midWater = L.polygon(midPoly, {
    color: 'transparent',
    weight: 0,
    fillColor: '#1a7aaa',
    fillOpacity: 0.18,
    className: 'ht-water-body ht-water-mid',
    interactive: false
  }).addTo(map);
  _activeFlowLayers.push(midWater);

  // ── LAYER 3: Shallow/sheen core — 35% of bank width ──
  var coreHalf = halfWidth * 0.35;
  var coreLeft  = _buildBankPath(smoothSeg, mPerLat, mPerLng, coreHalf, 1, 0);
  var coreRight = _buildBankPath(smoothSeg, mPerLat, mPerLng, coreHalf, -1, 0);
  var corePoly  = coreLeft.concat(coreRight.slice().reverse());

  var coreWater = L.polygon(corePoly, {
    color: 'transparent',
    weight: 0,
    fillColor: '#3dd8ff',
    fillOpacity: 0.10,
    className: 'ht-water-sheen',
    interactive: false
  }).addTo(map);
  _activeFlowLayers.push(coreWater);

  // ── LAYER 4: Bank edge lines — trace the actual bank positions ──
  var bankSmoothedLeft  = _catmullRomInterpolate(bankLeft, 2);
  var bankSmoothedRight = _catmullRomInterpolate(bankRight, 2);

  var bankL = L.polyline(bankSmoothedLeft, {
    color: '#6a5a3a',
    weight: 2.2,
    opacity: 0.55,
    className: 'ht-flow-line ht-water-bank ht-bank-left',
    interactive: false
  }).addTo(map);
  _activeFlowLayers.push(bankL);

  var bankR = L.polyline(bankSmoothedRight, {
    color: '#6a5a3a',
    weight: 2.2,
    opacity: 0.55,
    className: 'ht-flow-line ht-water-bank ht-bank-right',
    interactive: false
  }).addTo(map);
  _activeFlowLayers.push(bankR);

  // ── LAYER 5: Multiple current lanes — fast center, slower edges ──
  var mainCurrent = L.polyline(smoothSeg, {
    color: '#5ed8ff',
    weight: 1.8,
    opacity: 0.30,
    dashArray: '14 22',
    className: 'ht-flow-line ht-flow-current',
    interactive: false
  }).addTo(map);
  _activeFlowLayers.push(mainCurrent);

  // Seam lines at ~60% of bank width (where fast meets slow = trout habitat)
  var seamHalf = halfWidth * 0.60;
  var seamLeft = _buildBankPath(smoothSeg, mPerLat, mPerLng, seamHalf, 1, 0);
  var seamLeftLine = L.polyline(seamLeft, {
    color: '#4ac8ee',
    weight: 1.0,
    opacity: 0.18,
    dashArray: '8 18',
    className: 'ht-flow-line ht-flow-seam ht-flow-seam-left',
    interactive: false
  }).addTo(map);
  _activeFlowLayers.push(seamLeftLine);

  var seamRight = _buildBankPath(smoothSeg, mPerLat, mPerLng, seamHalf, -1, 0);
  var seamRightLine = L.polyline(seamRight, {
    color: '#4ac8ee',
    weight: 1.0,
    opacity: 0.18,
    dashArray: '8 18',
    className: 'ht-flow-line ht-flow-seam ht-flow-seam-right',
    interactive: false
  }).addTo(map);
  _activeFlowLayers.push(seamRightLine);

  // ── LAYER 6: Water shimmer particles ──
  for (var sp = 0; sp < smoothSeg.length; sp += 2) {
    for (var shimSide = -1; shimSide <= 1; shimSide += 2) {
      var sLat = smoothSeg[sp][0], sLng = smoothSeg[sp][1];
      var sDy, sDx;
      if (sp === 0) { sDy = smoothSeg[1][0] - sLat; sDx = smoothSeg[1][1] - sLng; }
      else if (sp >= smoothSeg.length - 1) { sDy = sLat - smoothSeg[sp-1][0]; sDx = sLng - smoothSeg[sp-1][1]; }
      else { sDy = smoothSeg[sp+1][0] - smoothSeg[sp-1][0]; sDx = smoothSeg[sp+1][1] - smoothSeg[sp-1][1]; }
      var sDyM = sDy * mPerLat, sDxM = sDx * mPerLng;
      var sLenV = Math.sqrt(sDyM * sDyM + sDxM * sDxM);
      if (sLenV < 0.01) continue;
      var spLat = (-sDxM / sLenV) / mPerLat;
      var spLng = (sDyM / sLenV) / mPerLng;
      // Place shimmer between center and bank edge (within measured width)
      var shimOffset = (halfWidth * 0.2 + Math.random() * halfWidth * 0.7) * shimSide;
      var shimDotLat = sLat + spLat * shimOffset;
      var shimDotLng = sLng + spLng * shimOffset;
      var spDelay = ((sp * 0.3 + shimSide * 0.5) % 5).toFixed(1);
      var shimIcon = L.divIcon({
        className: 'ht-flow-particle',
        html: '<div class="ht-water-shimmer" style="animation-delay:' + spDelay + 's"></div>',
        iconSize: [4, 4],
        iconAnchor: [2, 2]
      });
      var shimMarker = L.marker([shimDotLat, shimDotLng], {
        icon: shimIcon,
        zIndexOffset: 280,
        interactive: false
      }).addTo(map);
      _activeFlowLayers.push(shimMarker);
    }
  }

  // ── LAYER 7: Flow direction chevrons ──
  for (var a = 4; a < smoothSeg.length - 2; a += 6) {
    var aLat = smoothSeg[a][0], aLng = smoothSeg[a][1];
    var aDy = smoothSeg[a+2][0] - smoothSeg[a-2][0];
    var aDx = smoothSeg[a+2][1] - smoothSeg[a-2][1];
    var aAngle = Math.atan2(aDx * mPerLng, aDy * mPerLat) * 180 / Math.PI;
    var arrowIcon = L.divIcon({
      className: 'ht-flow-arrow-pin',
      html: '<div class="ht-water-arrow" style="transform:rotate(' + (aAngle - 90) + 'deg)">›</div>',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
    var arrowMarker = L.marker([aLat, aLng], {
      icon: arrowIcon,
      zIndexOffset: 290,
      interactive: false
    }).addTo(map);
    _activeFlowLayers.push(arrowMarker);
  }

  // ── LAYER 8: Edge ripples at bank lines ──
  for (var k = 3; k < smoothSeg.length - 1; k += 5) {
    for (var rSide = -1; rSide <= 1; rSide += 2) {
      var rLat = smoothSeg[k][0], rLng = smoothSeg[k][1];
      var rDy, rDx;
      if (k === 0) { rDy = smoothSeg[1][0] - rLat; rDx = smoothSeg[1][1] - rLng; }
      else if (k >= smoothSeg.length - 1) { rDy = rLat - smoothSeg[k-1][0]; rDx = rLng - smoothSeg[k-1][1]; }
      else { rDy = smoothSeg[k+1][0] - smoothSeg[k-1][0]; rDx = smoothSeg[k+1][1] - smoothSeg[k-1][1]; }
      var rDyM = rDy * mPerLat, rDxM = rDx * mPerLng;
      var rLen = Math.sqrt(rDyM * rDyM + rDxM * rDxM);
      if (rLen < 0.01) continue;
      var rpLat = (-rDxM / rLen) / mPerLat;
      var rpLng = (rDyM / rLen) / mPerLng;
      // Place ripples at the bank edge (measured width - 0.3m inset)
      var edgeOffset = (halfWidth - 0.3) * rSide;
      var eLat = rLat + rpLat * edgeOffset;
      var eLng = rLng + rpLng * edgeOffset;
      var ripDelay = ((k * 0.6 + rSide * 1.2) % 4).toFixed(1);
      var edgeRipIcon = L.divIcon({
        className: 'ht-flow-ripple',
        html: '<div class="ht-water-ripple ht-edge-ripple" style="animation-delay:' + ripDelay + 's"></div>',
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });
      var edgeRipMarker = L.marker([eLat, eLng], {
        icon: edgeRipIcon,
        zIndexOffset: 285,
        interactive: false
      }).addTo(map);
      _activeFlowLayers.push(edgeRipMarker);
    }
  }
}
window.deployFlowOverlay = deployFlowOverlay;

/* ═══════════════════════════════════════════════════════════════════
   BOULDER SYSTEM — Realistic rocks with water flowing around them
   Places boulders at natural positions along the stream (bends, riffles)
   with animated V-wake, upstream pillow, and downstream eddy effects.
   ═══════════════════════════════════════════════════════════════════ */
var _activeBoulderLayers = [];

function clearBoulders() {
  _activeBoulderLayers.forEach(function(l) { try { map.removeLayer(l); } catch {} });
  _activeBoulderLayers = [];
}

function deployBoulders(water, zone) {
  clearBoulders();
  var seg = getZoneStreamSegment(water, zone);
  if (!seg || seg.length < 4 || !map) return;

  var R = Math.PI / 180;
  var mPerLat = 111000;
  var mPerLng = 111000 * Math.cos(seg[0][0] * R);

  // Place boulders at interesting stream positions: bends, mid-riffles, transitions
  // Detect curvature to find natural boulder spots
  var boulderSpots = [];
  for (var i = 2; i < seg.length - 2; i++) {
    // Calculate turning angle at this point
    var dx1 = (seg[i][1] - seg[i-1][1]) * mPerLng;
    var dy1 = (seg[i][0] - seg[i-1][0]) * mPerLat;
    var dx2 = (seg[i+1][1] - seg[i][1]) * mPerLng;
    var dy2 = (seg[i+1][0] - seg[i][0]) * mPerLat;
    var angle1 = Math.atan2(dy1, dx1);
    var angle2 = Math.atan2(dy2, dx2);
    var curvature = Math.abs(angle2 - angle1);
    if (curvature > Math.PI) curvature = 2 * Math.PI - curvature;

    // Boulders appear at bends (high curvature) or at regular intervals in straights
    if (curvature > 0.15 || i % 5 === 0) {
      boulderSpots.push({ idx: i, curvature: curvature });
    }
  }

  // Limit to reasonable number of boulders
  if (boulderSpots.length > 12) {
    boulderSpots.sort(function(a, b) { return b.curvature - a.curvature; });
    boulderSpots = boulderSpots.slice(0, 12);
  }

  boulderSpots.forEach(function(spot) {
    var i = spot.idx;
    var lat = seg[i][0], lng = seg[i][1];

    // Offset boulder slightly from center — toward one bank
    var dy, dx;
    if (i === 0) { dy = seg[1][0] - lat; dx = seg[1][1] - lng; }
    else if (i >= seg.length - 1) { dy = lat - seg[i-1][0]; dx = lng - seg[i-1][1]; }
    else { dy = seg[i+1][0] - seg[i-1][0]; dx = seg[i+1][1] - seg[i-1][1]; }
    var dyM = dy * mPerLat, dxM = dx * mPerLng;
    var len = Math.sqrt(dyM * dyM + dxM * dxM);
    if (len < 0.01) return;
    var pLat = (-dxM / len) / mPerLat;
    var pLng = (dyM / len) / mPerLng;

    // Offset 1-4m toward a bank (alternating sides)
    var side = (i % 2 === 0) ? 1 : -1;
    var offset = 1.5 + (spot.curvature * 3);
    var bLat = lat + pLat * offset * side;
    var bLng = lng + pLng * offset * side;

    // Flow direction angle for wake orientation
    var flowAngle = Math.atan2(dx * mPerLng, dy * mPerLat) * 180 / Math.PI;
    var isLarge = spot.curvature > 0.3;
    var sizeClass = isLarge ? ' ht-boulder-rock-lg' : '';
    var animDelay = ((i * 0.7) % 4).toFixed(1);

    var boulderHtml = '<div class="ht-boulder-wrap" style="transform:rotate(' + flowAngle + 'deg)">' +
      '<div class="ht-boulder-pillow" style="animation-delay:' + animDelay + 's"></div>' +
      '<div class="ht-boulder-rock' + sizeClass + '"></div>' +
      '<div class="ht-boulder-wake" style="animation-delay:' + animDelay + 's"></div>' +
      '<div class="ht-boulder-eddy" style="animation-delay:' + animDelay + 's"></div>' +
      '</div>';

    var boulderIcon = L.divIcon({
      className: 'ht-boulder-pin',
      html: boulderHtml,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    var boulderMarker = L.marker([bLat, bLng], {
      icon: boulderIcon,
      zIndexOffset: 300,
      interactive: false
    }).addTo(map);
    _activeBoulderLayers.push(boulderMarker);
  });
}
window.deployBoulders = deployBoulders;
window.clearBoulders = clearBoulders;

/* ── AI Fishing Pin Calculator — ranks spots by user inputs ── */
window.deployAiFishingPins = function(water, zone, fishFlow) {
  if (!water || !zone || !map) return;

  // Clear previous
  _aiFishingPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _aiFishingPins = [];
  _aiFishingSpots = [];
  _checkedInPinIdx = -1;
  _checkedInMicroIdx = -1;
  clearMicroPins();

  var segment = getZoneStreamSegment(water, zone);
  if (!segment || segment.length < 2) {
    showNotice('⚠️ No stream data for this zone', 'warning', 3000);
    return;
  }

  var method = fishFlow.method || 'fly';
  var wade = fishFlow.wade || 'waders';
  var skill = fishFlow.experience || 'learning';

  // Build zone corridor polygon for strict boundary enforcement
  var zoneCorridor = buildStreamCorridor(segment, 45);

  // Generate fishing spots along the zone segment
  var habitats = ['riffle', 'run', 'pool', 'tailout', 'boulder'];
  var numSpots = Math.min(6, Math.max(3, Math.floor(segment.length * 0.8)));
  var spots = [];

  for (var i = 0; i < numSpots; i++) {
    var pIdx = Math.round(i * (segment.length - 1) / Math.max(1, numSpots - 1));
    pIdx = Math.min(pIdx, segment.length - 1);
    var habitat = habitats[i % habitats.length];
    var lat = segment[pIdx][0];
    var lng = segment[pIdx][1];

    // STRICT: Only deploy pins INSIDE the zone polygon
    if (zoneCorridor && !_pointInPolygon(lat, lng, zoneCorridor)) continue;

    // Score this spot based on user inputs
    var score = _scoreSpot(habitat, method, wade, skill, i, numSpots);

    spots.push({
      idx: i,
      habitat: habitat,
      lat: lat,
      lng: lng,
      segmentIdx: pIdx,
      score: score,
      rank: 0, // filled after sort
      strategy: _buildSpotStrategy(habitat, method, wade, skill, water, zone)
    });
  }

  // Sort by score descending (best first)
  spots.sort(function(a, b) { return b.score - a.score; });
  spots.forEach(function(s, idx) { s.rank = idx + 1; });

  // Calculate territory boundaries — each pin owns half the distance to adjacent pins
  var posSorted = spots.slice().sort(function(a, b) { return a.segmentIdx - b.segmentIdx; });
  for (var ti = 0; ti < posSorted.length; ti++) {
    var prevSegIdx = ti > 0 ? posSorted[ti - 1].segmentIdx : 0;
    var nextSegIdx = ti < posSorted.length - 1 ? posSorted[ti + 1].segmentIdx : segment.length - 1;
    posSorted[ti].territoryStart = Math.round((prevSegIdx + posSorted[ti].segmentIdx) / 2);
    posSorted[ti].territoryEnd = Math.round((posSorted[ti].segmentIdx + nextSegIdx) / 2);
  }

  _aiFishingSpots = spots;

  // Deploy ranked pins on map
  var bounds = [];
  spots.forEach(function(spot) {
    var pinColor = spot.rank === 1 ? '#7cffc7' : spot.rank === 2 ? '#2bd4ff' : spot.rank <= 4 ? '#ffe082' : '#9fc3ce';
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
      zIndexOffset: 400 - spot.rank
    }).addTo(map);

    marker.__aiSpot = spot;
    marker.on('click', function() {
      _onAiPinClick(water, zone, spot, fishFlow);
    });

    _aiFishingPins.push(marker);
    bounds.push([spot.lat, spot.lng]);
  });

  var deployed = spots.length;
};

/* ═══════════════════════════════════════════════════════════════════
   METHOD-SPECIFIC RECOMMENDATION ENGINE
   Researched bait/lure/fly data with real-time condition awareness.
   Each method gets tailored recommendations — no fly refs in bait mode.
   ═══════════════════════════════════════════════════════════════════ */

function _getRealTimeConditions() {
  var h = new Date().getHours();
  var month = new Date().getMonth(); // 0-indexed
  var season = month >= 2 && month <= 4 ? 'spring' : month >= 5 && month <= 7 ? 'summer' : month >= 8 && month <= 10 ? 'fall' : 'winter';

  // Determine light/sun conditions from time
  var light = 'overcast'; // default
  if (h >= 5 && h < 7) light = 'low-light';
  else if (h >= 7 && h < 10) light = 'morning-sun';
  else if (h >= 10 && h < 14) light = 'bright-sun';
  else if (h >= 14 && h < 17) light = 'afternoon';
  else if (h >= 17 && h < 20) light = 'evening';
  else light = 'dark';

  // Water temp estimate by season+time (Missouri trout waters stay 55-68F)
  var waterTemp = season === 'winter' ? 48 : season === 'spring' ? 54 : season === 'summer' ? 62 : 56;
  if (h >= 14 && h <= 18) waterTemp += 3;
  if (h >= 5 && h <= 8) waterTemp -= 2;

  // Pressure front proxy — afternoon = falling, morning = rising
  var pressure = h < 12 ? 'rising' : h < 16 ? 'stable' : 'falling';

  return { hour: h, season: season, light: light, waterTemp: waterTemp, pressure: pressure, month: month };
}

/* Get method-specific tackle recommendation based on real-time conditions */
function getMethodSpecificRec(water, habitat, method) {
  var c = _getRealTimeConditions();
  var rec = { primary: '', backup: '', color: '', presentation: '', conditionNote: '', tackle: '' };

  if (method === 'bait') {
    // ─── BAIT FISHING ENGINE ────────────────────────────────────────
    // PowerBait colors by condition (researched: Chartreuse & Rainbow in clear/bright,
    // Salmon Egg & Garlic in stained, Yellow in cold, Hatchery Pellet near ramps)
    var pbColors = {
      'bright-sun': { primary: 'Chartreuse PowerBait', backup: 'Rainbow Glitter PowerBait', why: 'Bright sun — high-vis chartreuse triggers reaction strikes. UV reflection on glitter draws eyes in clear water.' },
      'morning-sun': { primary: 'Rainbow PowerBait', backup: 'Yellow PowerBait', why: 'Morning light — rainbow mimics natural food colors in warming water. Switch to yellow if fish are sluggish.' },
      'low-light': { primary: 'Orange PowerBait', backup: 'Salmon Egg Pink', why: 'Low light — orange and pink stand out against dark bottom. Match the natural salmon egg drift.' },
      'evening': { primary: 'Salmon Egg PowerBait', backup: 'Garlic Chartreuse PowerBait', why: 'Evening feed — salmon egg color matches natural drift. Garlic scent draws fish in reduced visibility.' },
      'afternoon': { primary: 'Green Pumpkin PowerBait', backup: 'Hatchery Pellet PowerBait', why: 'Afternoon — natural tones work when fish get pressured. Pellet color works near stocking sites.' },
      'overcast': { primary: 'White/Garlic PowerBait', backup: 'Corn Yellow PowerBait', why: 'Overcast — white/garlic shows up on any bottom. Corn yellow is a proven all-conditions producer.' },
      'dark': { primary: 'Garlic Glow PowerBait', backup: 'Salmon Egg Glow', why: 'Dark — glow varieties are essential. Apply extra scent. Trout hunt by smell after dark.' }
    };
    var pbRec = pbColors[c.light] || pbColors['overcast'];
    rec.primary = pbRec.primary;
    rec.backup = pbRec.backup;
    rec.conditionNote = pbRec.why;

    // Other bait options by habitat
    var baitByHabitat = {
      riffle: { bait: 'Berkley Trout Worm (pink or white)', rig: 'Split-shot rig 18" above #8 bait hook. Let it tumble with the current.' },
      pool: { bait: 'Berkley Dough Bait or Whole Kernel Corn on treble', rig: 'Sliding sinker rig on bottom. 24" leader to #12 treble. Mold dough ball size of a marble.' },
      run: { bait: 'Live nightcrawler or Gulp Alive worm', rig: 'Carolina rig — 1/4oz egg sinker, 24" fluorocarbon leader, #6 bait hook. Drift through the run naturally.' },
      tailout: { bait: 'Berkley Mice Tail (pink/white)', rig: 'Small split shot 12" above hook. Cast upstream, let it dead drift through the thin water. Minimal weight.' },
      boulder: { bait: 'PowerBait Floating Mice Tail (chartreuse/white)', rig: 'Bottom rig in the pocket behind the boulder. Floating bait lifts off the bottom — right in the strike zone.' }
    };
    var hb = baitByHabitat[habitat] || baitByHabitat.pool;
    rec.tackle = hb.bait;
    rec.presentation = hb.rig;

    // Water temp adjustments
    if (c.waterTemp < 50) {
      rec.conditionNote += ' COLD WATER: Use smaller bait, fish slow. PowerBait floats off bottom — advantage in cold.';
      rec.color = 'Go with bright orange or salmon egg — cold trout key on warm colors.';
    } else if (c.waterTemp > 60) {
      rec.conditionNote += ' WARM WATER: Natural baits (worms, corn) outperform dough in warm water. Fish feed actively.';
      rec.color = 'Natural tones (green, brown) or high-contrast (white/garlic).';
    } else {
      rec.color = 'Current conditions favor standard PowerBait colors. Match the light.';
    }

    // Pressure adjustments
    if (c.pressure === 'falling') {
      rec.conditionNote += ' Falling pressure — fish feed aggressively before fronts. Use bigger baits.';
    } else if (c.pressure === 'rising') {
      rec.conditionNote += ' Rising pressure after a front — fish may be tight to bottom. Patience and scent are key.';
    }

  } else if (method === 'spin') {
    // ─── LURE/SPIN ENGINE ───────────────────────────────────────────
    // Spinner/spoon colors by condition (researched: gold in stained/overcast,
    // silver in clear/bright, copper in cold, black in bright sun for silhouette)
    var lureColors = {
      'bright-sun': { primary: 'Mepps Aglia #2 (silver blade, white hackle)', backup: 'Panther Martin #4 (black body, gold blade)', why: 'Bright sun — silver flash mimics baitfish in clear water. Black body creates silhouette contrast.' },
      'morning-sun': { primary: 'Rooster Tail 1/8oz (rainbow)', backup: 'Blue Fox Vibrax #2 (gold)', why: 'Morning — rainbow patterns in warming light. Gold blade flash triggers reaction strikes.' },
      'low-light': { primary: 'Mepps Black Fury #2 (yellow dots)', backup: 'Kastmaster 1/8oz (gold)', why: 'Low light — dark body with bright accents. Gold kastmaster wobble visible at depth.' },
      'evening': { primary: 'Blue Fox Vibrax #1 (gold/orange)', backup: 'Panther Martin #2 (gold body)', why: 'Evening — gold in fading light outperforms silver. Smaller sizes as trout get selective.' },
      'afternoon': { primary: 'Rapala Countdown CD-3 (rainbow trout)', backup: 'Acme Phoebe 1/8oz (gold)', why: 'Afternoon — minnow imitation swimbait for pressured fish. Phoebe wobble triggers reflex strikes.' },
      'overcast': { primary: 'Panther Martin #4 (gold/black)', backup: 'Mepps Aglia #1 (copper)', why: 'Overcast — gold blade maximum visibility. Copper is a secret weapon in flat light.' },
      'dark': { primary: 'Mepps Black Fury #3 (silver/chartreuse)', backup: 'Jig 1/32oz (white marabou)', why: 'Dark — vibration matters more than color. Large blade for maximum thump. White jig for visibility.' }
    };
    var lRec = lureColors[c.light] || lureColors['overcast'];
    rec.primary = lRec.primary;
    rec.backup = lRec.backup;
    rec.conditionNote = lRec.why;

    // Lure presentation by habitat
    var lureByHabitat = {
      riffle: { lure: 'Small inline spinner (Panther Martin #2 or Rooster Tail 1/16oz)', pres: 'Cast upstream, reel just fast enough to feel the blade spin. Let it drift with the current through the riffle. Jerkbaits: try a Rapala F3 twitched slowly through the deeper pockets.' },
      pool: { lure: 'Spoon (Kastmaster 1/8oz) or small jerkbait (Rapala CD-3)', pres: 'Cast to the head, let it flutter down. For spoons: slow retrieve with twitches. For jerkbaits: let the Rapala CD sink to depth, then slow twitch-pause retrieve. Count down 3-5 seconds before retrieve.' },
      run: { lure: 'Inline spinner with willow blade (Mepps #1-2) or Rapala Original F3', pres: 'Cast quartering upstream. Spinners: steady retrieve just above bottom. Jerkbaits: twitch-twitch-pause through the seam — the erratic action triggers reflex strikes from holding fish.' },
      tailout: { lure: 'Micro crankbait (Rapala Ultra Light Minnow or Rebel Wee Craw)', pres: 'Cast upstream, slow twitching retrieve. Crankbaits wobble naturally in thin water — downsize to 1/16oz max. Crawdad crankbaits are deadly in tailouts with gravel bottom.' },
      boulder: { lure: 'Jig (1/32-1/16oz, marabou or twister tail) or Rapala CD-3', pres: 'Pitch directly behind boulders. Jigs: let sink, tiny hops, 2-3 second pauses. Jerkbaits: cast tight to rock face, let the Countdown sink into the pocket, then twitch once — trout crush it.' }
    };
    var hl = lureByHabitat[habitat] || lureByHabitat.run;
    rec.tackle = hl.lure;
    rec.presentation = hl.pres;

    // Speed adjustments for water temp
    if (c.waterTemp < 50) {
      rec.color = 'Cold water = slow retrieve. Go smaller and slower. Gold/copper blades in cold.';
      rec.conditionNote += ' COLD WATER: Slow your retrieve by 50%. Smaller lures, longer pauses.';
    } else if (c.waterTemp > 60) {
      rec.color = 'Warm water = faster retrieve. Silver/bright blades, aggressive presentation.';
      rec.conditionNote += ' WARM WATER: Trout are active — faster retrieve, more aggressive action.';
    } else {
      rec.color = 'Match blade color to light conditions. Gold in low light, silver in bright.';
    }

  } else {
    // ─── FLY FISHING ENGINE ─────────────────────────────────────────
    var flyRec = getTimeAwareFlyRec(water, habitat);
    rec.primary = flyRec.flyRec || 'Pheasant Tail Nymph #16';
    rec.backup = flyRec.altFly || 'Elk Hair Caddis #14';
    rec.conditionNote = flyRec.timeAdvice;

    var flyByHabitat = {
      riffle: { pres: 'Dead drift nymphs upstream. High-stick technique — keep line off the water. Short, accurate casts.', rig: 'Euro nymphing rig or dry-dropper. 9ft 5X leader, 4ft 6X tippet.' },
      pool: { pres: 'Start at the head with nymphs, work streamers along the edges. Fish the tailout last with dries.', rig: 'Indicator nymph rig. 9ft 4X leader, 18" dropper to point fly.' },
      run: { pres: 'Dry-dropper through the seam. Mend to extend your drift. Cover the transition between fast and slow.', rig: 'Dry-dropper: buoyant dry + bead head nymph 18" below. 5X tippet.' },
      tailout: { pres: 'Long leaders, small dries. Approach from downstream — these fish are spooky. Delicate presentation.', rig: '12ft leader, 6X tippet. Size 18-20 dries. Drag-free drift critical.' },
      boulder: { pres: 'Short casts into pockets. Each pocket is a separate cast. Dead drift nymphs tight behind rocks.', rig: 'Short line nymphing. 7.5ft 4X leader, heavy point fly + dropper.' }
    };
    var hf = flyByHabitat[habitat] || flyByHabitat.run;
    rec.tackle = hf.rig;
    rec.presentation = hf.pres;
    rec.color = flyRec.hatches && flyRec.hatches.length ? 'Active hatches: ' + flyRec.hatches.join(', ') : 'No visible hatch — subsurface flies first.';
  }

  rec.method = method;
  rec.conditions = c;
  return rec;
}
window._getMethodSpecificRec = getMethodSpecificRec;

/* Score a spot based on user inputs */
function _scoreSpot(habitat, method, wade, skill, spotIdx, totalSpots) {
  var score = 50; // base

  // Method compatibility
  if (method === 'fly') {
    if (habitat === 'riffle') score += 25;
    else if (habitat === 'run') score += 20;
    else if (habitat === 'pool') score += 15;
    else if (habitat === 'tailout') score += 22;
    else if (habitat === 'boulder') score += 10;
  } else if (method === 'spin') {
    if (habitat === 'pool') score += 25;
    else if (habitat === 'run') score += 20;
    else if (habitat === 'boulder') score += 18;
    else if (habitat === 'riffle') score += 8;
    else if (habitat === 'tailout') score += 15;
  } else { // bait
    if (habitat === 'pool') score += 28;
    else if (habitat === 'tailout') score += 22;
    else if (habitat === 'run') score += 15;
    else if (habitat === 'boulder') score += 10;
    else if (habitat === 'riffle') score += 5;
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
    if (habitat === 'riffle' || habitat === 'tailout') score += 8; // active feeding
  } else if (h >= 12 && h < 15) {
    if (habitat === 'pool' || habitat === 'boulder') score += 8; // deep water midday
  }

  // Slight randomization for variety
  score += Math.floor(Math.random() * 6);

  return Math.max(0, Math.min(100, score));
}

function _habitatEmoji(h) {
  var map = { riffle: '💨', pool: '🌊', run: '🏞️', boulder: '🪨', tailout: '🌀' };
  return map[h] || '🐟';
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
               bait: 'Drop bait into the calm pockets behind boulders. Trout ambush from these protected lies.' }
  };
  var apKey = approaches[habitat] || approaches.run;
  strat.approach = apKey[method] || apKey.fly;

  // Casting direction
  var castMap = {
    riffle: 'Cast upstream at 10-2 o\'clock. Mend immediately. Let fly dead drift back toward you.',
    pool: 'Cast to the head or across to the seam. Let your offering sink and drift through the strike zone.',
    run: 'Cast quartering upstream. Mend to extend drift through the seam between fast and slow water.',
    tailout: 'Cast upstream in the thin water. Keep a low profile. Drag-free drift is critical here.',
    boulder: 'Short casts directly behind boulders. Target each pocket individually. 2-3 drifts per pocket then move on.'
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
       'Position yourself offset from the target. Keep your feet planted — shuffling spooks fish.');
  } else {
    strat.wadingAdvice = 'Fishing from the bank — use the terrain. ' +
      (habitat === 'pool' ? 'Find a high bank with a clear backcast lane. Roll casts work great.' :
       'Kneel low. Keep your shadow off the water. Use sidearm casts to keep a low profile.');
  }

  return strat;
}

/* ── Strategy Summary Tray — pops after LET'S GO ── */
window.showMissionSummary = function(water, zone, fishFlow) {
  // Remove existing
  if (_missionSummaryEl) { try { _missionSummaryEl.remove(); } catch {} }

  var spots = _aiFishingSpots;
  var topSpot = spots[0];
  var method = fishFlow.method || 'fly';
  var wade = fishFlow.wade || 'waders';
  var skill = fishFlow.experience || 'learning';
  var mRec = getMethodSpecificRec(water, topSpot ? topSpot.habitat : 'riffle', method);
  var c = _getRealTimeConditions();
  var totalSpots = spots.length;
  var methodName = method === 'fly' ? 'Fly Fishing' : method === 'spin' ? 'Lure Fishing' : 'Bait Fishing';
  var season = c.season.charAt(0).toUpperCase() + c.season.slice(1);
  var topHabitat = topSpot ? _capitalize(topSpot.habitat) : 'Run';
  var hatches = (water.hatches && water.hatches[c.season]) || [];

  // ── Leader & Tippet recommendations (researched by method + skill) ──
  var leaderRec = _getLeaderTippetRec(method, skill, c, topSpot ? topSpot.habitat : 'riffle');

  // ── Rig setup ──
  var rigRec = _getRigSetup(method, skill, topSpot ? topSpot.habitat : 'riffle', c);

  // ── Flies / Lures / Bait to bring ──
  var tackleBag = _getTackleBag(method, water, c);

  // ── Where to begin ──
  var startPlan = 'Start at Spot #1 — your highest-ranked ' + topHabitat.toLowerCase() +
    '. Walk to the green angler pin to find your exact casting position. ' +
    (wade === 'waders'
      ? 'Wade in quietly and position yourself at the stand-here marker before making your first cast.'
      : 'Stay on the bank near the angler pin. Keep low and avoid casting your shadow on the water.');

  // ── How to work each spot ──
  var workPlan = 'Each zone pin on the map marks a fishing spot ranked by score. ' +
    'Tap any zone pin to check in — I will deploy individual fish micro-spots with precise ' +
    methodName.toLowerCase() + ' instructions, a casting arc showing exactly where to land your ' +
    (method === 'fly' ? 'fly' : method === 'spin' ? 'lure' : 'bait') +
    ', and a CAST HERE marker upstream of each fish so you don\'t spook it. ' +
    'Tap any fish icon for a tailored strategy explaining the approach, best presentation, and why that fish is there.';

  // ── Overall spoken/readable strategy ──
  var summaryText = 'Welcome to ' + water.name + ', ' + zone.name + '. ' +
    'I\'ve deployed ' + totalSpots + ' fishing spots ranked for your ' + methodName.toLowerCase() + ' setup. ' +
    'Your number one spot is a ' + topHabitat.toLowerCase() + '. ' +
    mRec.conditionNote + ' ' +

    'Leader setup: ' + leaderRec.leader + '. Tippet: ' + leaderRec.tippet + '. ' +
    (leaderRec.note ? leaderRec.note + ' ' : '') +

    'Primary rig: ' + rigRec.name + '. ' + rigRec.description + ' ' +

    'Start with ' + mRec.primary + '. ' +
    (mRec.backup ? 'Backup: ' + mRec.backup + '. ' : '') +

    startPlan + ' ' +
    workPlan + ' ' +

    'Report back with voice — tell me what you see and I will update your strategy in real time. Tight lines!';

  // ── Spots list HTML ──
  var spotsListHtml = '';
  spots.forEach(function(s) {
    var col = s.rank === 1 ? '#7cffc7' : s.rank === 2 ? '#2bd4ff' : '#ffe082';
    spotsListHtml += '<div class="ht-mission-spot" style="border-left:3px solid ' + col + ';">' +
      '<span class="ht-mission-spot-rank" style="color:' + col + ';">#' + s.rank + '</span>' +
      '<span class="ht-mission-spot-name">' + escapeHtml(_capitalize(s.habitat)) + '</span>' +
      '<span class="ht-mission-spot-score">' + s.score + ' pts</span>' +
    '</div>';
  });

  // ── Tackle bag list ──
  var tackleHtml = '';
  tackleBag.forEach(function(item) {
    tackleHtml += '<div class="ht-strat-tackle-item">' + escapeHtml(item) + '</div>';
  });

  // ── Hatches ──
  var hatchHtml = '';
  if (hatches.length) {
    hatchHtml = '<div class="ht-strat-section"><div class="ht-strat-section-label">🦟 ' + season + ' HATCHES</div>' +
      '<div class="ht-strat-section-body">' + escapeHtml(hatches.join(' • ')) + '</div></div>';
  }

  var el = document.createElement('div');
  el.className = 'ht-mission-summary-overlay';
  el.innerHTML =
    '<div class="ht-mission-summary-card">' +
      '<div class="ht-mission-summary-header">' +
        '<div class="ht-mission-summary-title">STRATEGY SUMMARY</div>' +
        '<div class="ht-mission-summary-sub">' + escapeHtml(water.name) + ' — ' + escapeHtml(zone.name) + '</div>' +
        '<div class="ht-strat-method-badge">' + escapeHtml(methodName) + ' • ' + escapeHtml(wade === 'waders' ? 'Wading' : 'Bank') + ' • ' + escapeHtml(_capitalize(skill)) + '</div>' +
      '</div>' +
      '<div class="ht-mission-summary-body" id="strategySummaryBody">' +

        // Leader & Tippet
        '<div class="ht-strat-section">' +
          '<div class="ht-strat-section-label">🎣 LEADER & TIPPET</div>' +
          '<div class="ht-strat-row"><span class="ht-strat-key">Leader</span><span class="ht-strat-val">' + escapeHtml(leaderRec.leader) + '</span></div>' +
          '<div class="ht-strat-row"><span class="ht-strat-key">Tippet</span><span class="ht-strat-val">' + escapeHtml(leaderRec.tippet) + '</span></div>' +
          (leaderRec.note ? '<div class="ht-strat-note">' + escapeHtml(leaderRec.note) + '</div>' : '') +
        '</div>' +

        // Rig Setup
        '<div class="ht-strat-section">' +
          '<div class="ht-strat-section-label">⚙️ RECOMMENDED RIG</div>' +
          '<div class="ht-strat-rig-name">' + escapeHtml(rigRec.name) + '</div>' +
          '<div class="ht-strat-section-body">' + escapeHtml(rigRec.description) + '</div>' +
          (rigRec.alt ? '<div class="ht-strat-note">Backup rig: ' + escapeHtml(rigRec.alt) + '</div>' : '') +
        '</div>' +

        // What to Bring
        '<div class="ht-strat-section">' +
          '<div class="ht-strat-section-label">' + (method === 'fly' ? '🪰' : method === 'spin' ? '🎣' : '🪱') + ' WHAT TO BRING</div>' +
          '<div class="ht-strat-tackle-grid">' + tackleHtml + '</div>' +
        '</div>' +

        // Condition Awareness
        '<div class="ht-strat-section">' +
          '<div class="ht-strat-section-label">🌤️ CONDITIONS</div>' +
          '<div class="ht-strat-section-body">' + escapeHtml(mRec.conditionNote) + '</div>' +
          (mRec.color ? '<div class="ht-strat-note">' + escapeHtml(mRec.color) + '</div>' : '') +
        '</div>' +

        // Hatches (if any)
        hatchHtml +

        // Where to begin
        '<div class="ht-strat-section">' +
          '<div class="ht-strat-section-label">📍 WHERE TO BEGIN</div>' +
          '<div class="ht-strat-section-body">' + escapeHtml(startPlan) + '</div>' +
        '</div>' +

        // How to Fish Each Spot
        '<div class="ht-strat-section">' +
          '<div class="ht-strat-section-label">🗺️ HOW TO FISH EACH SPOT</div>' +
          '<div class="ht-strat-section-body">' + escapeHtml(workPlan) + '</div>' +
        '</div>' +

        // Spot Rankings
        '<div class="ht-strat-section">' +
          '<div class="ht-strat-section-label">🏆 SPOT RANKINGS</div>' +
          '<div class="ht-mission-summary-spots">' + spotsListHtml + '</div>' +
        '</div>' +

      '</div>' +

      // Hidden full text for TTS
      '<div id="missionSummaryText" style="display:none;">' + escapeHtml(summaryText) + '</div>' +

      // Action pills
      '<div class="ht-strat-pill-row">' +
        '<button class="ht-strat-pill ht-strat-pill--listen" type="button" onclick="window._listenMission()">🔊 Listen</button>' +
        '<button class="ht-strat-pill ht-strat-pill--save" type="button" onclick="window._saveMissionToJournal()">💾 Save Trip</button>' +
        '<button class="ht-strat-pill ht-strat-pill--close" type="button" onclick="window._closeMissionSummary()">✕ Close</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(el);
  _missionSummaryEl = el;

  // Animate in
  requestAnimationFrame(function() {
    el.classList.add('is-visible');
  });
};

/* ── Leader & Tippet recommendation engine ── */
function _getLeaderTippetRec(method, skill, c, habitat) {
  var r = { leader: '', tippet: '', note: '' };

  if (method === 'fly') {
    // Leader length & taper
    if (habitat === 'tailout' || habitat === 'pool') {
      r.leader = '12ft tapered leader, 5X';
      if (skill === 'new') r.leader = '9ft tapered leader, 4X';
    } else if (habitat === 'riffle' || habitat === 'run') {
      r.leader = '9ft tapered leader, 4X';
    } else {
      r.leader = '7.5ft tapered leader, 3X';
    }

    // Tippet
    if (c.season === 'winter' || c.waterTemp < 50) {
      r.tippet = '6X fluorocarbon, 24-30 inches';
      r.note = 'Cold water = spooky fish. Go lighter — 6X fluoro is near-invisible and sinks below surface film.';
    } else if (c.light === 'bright-sun') {
      r.tippet = '5X-6X fluorocarbon, 18-24 inches';
      r.note = 'Bright sun means pressured fish. Fluorocarbon won\'t flash like nylon. Add extra tippet length for clear water.';
    } else if (c.light === 'low-light' || c.light === 'dark' || c.light === 'evening') {
      r.tippet = '4X-5X nylon, 18 inches';
      r.note = 'Low light — fish are less line-shy. Heavier tippet gives better control and turnover.';
    } else {
      r.tippet = '5X fluorocarbon, 18-24 inches';
      r.note = 'Standard conditions. Fluorocarbon for subsurface, nylon for dry flies.';
    }

    // Skill adjustments
    if (skill === 'new') {
      r.note += ' Beginner tip: Go no lighter than 5X — you need the control. Tie improved clinch knots.';
    } else if (skill === 'advanced') {
      r.note += ' Pro tip: Consider 6X-7X for micro-dries and midges. Double surgeon\'s knot for tippet rings.';
    }

  } else if (method === 'spin') {
    r.leader = '4-6lb fluorocarbon leader, 24-36 inches';
    r.tippet = 'No tippet needed — tie lure directly to fluoro leader';
    if (c.waterTemp < 50) {
      r.note = 'Cold water: drop to 2-4lb test. Fish are lethargic and line-shy. Slow retrieve.';
    } else {
      r.note = 'Fluorocarbon leader is less visible than mono. Attach to main line with double uni knot.';
    }
    if (skill === 'new') r.note += ' Beginner: Use a snap swivel for quick lure changes.';

  } else { // bait
    r.leader = '4-6lb monofilament, 18-24 inches below sinker';
    r.tippet = 'No tippet — tie hook directly to leader';
    if (c.waterTemp < 50) {
      r.note = 'Cold water: downsize to #10-12 hooks and pea-sized bait. Fish are sluggish.';
    } else {
      r.note = 'Use a sliding egg sinker above a barrel swivel. Leader runs free — trout won\'t feel resistance.';
    }
  }

  return r;
}

/* ── Rig setup engine ── */
function _getRigSetup(method, skill, habitat, c) {
  var r = { name: '', description: '', alt: '' };

  if (method === 'fly') {
    if (skill === 'new' || skill === 'learning') {
      // Simpler rigs for beginners
      if (habitat === 'riffle' || habitat === 'run') {
        r.name = 'Dry-Dropper Rig';
        r.description = 'Tie a high-floating dry fly (Stimulator #12 or Chubby Chernobyl) as your indicator. Drop 18-22 inches of 5X tippet off the hook bend, tie on a beadhead nymph. The dry floats and signals strikes while the nymph does the catching.';
        r.alt = 'Indicator nymph rig: Yarn indicator + split shot + 2-nymph tandem (heavy point fly, smaller dropper).';
      } else if (habitat === 'pool' || habitat === 'tailout') {
        r.name = 'Indicator Nymph Rig';
        r.description = 'Thingamabobber indicator set at 1.5x water depth. 18 inches of tippet to point fly (beadhead Pheasant Tail #16). Add a #20 midge dropper 14 inches below. Small split shot 8 inches above point fly.';
        r.alt = 'Single dry fly rig — 12ft leader, 6X tippet, #18 Parachute Adams for sight fishing risers.';
      } else {
        r.name = 'Short-Line Nymph Rig';
        r.description = 'Heavy point fly (Pat\'s Rubber Legs #10) with a #16 Pheasant Tail dropper 16 inches below. Short leader. High-stick: hold rod tip up, keep contact, feel for the take.';
        r.alt = 'Single large streamer (#8 Woolly Bugger) stripped past boulders and structure.';
      }
    } else {
      // Advanced / confident rigs
      if (habitat === 'riffle' || habitat === 'run') {
        r.name = 'Euro Nymphing / Tight-Line Rig';
        r.description = 'Mono leader to colored sighter. Point fly: #14 Perdigon or Jig Pheasant Tail. Tag nymph 20 inches above: #18 Waltz Worm or micro midge. No indicator — feel the take through the sighter. Leader-to-fly connection stays at 10-2 o\'clock.';
        r.alt = 'Dry-dropper with a CDC emerger on top for ultra-selective risers.';
      } else if (habitat === 'pool') {
        r.name = 'Streamer Rig';
        r.description = 'Short stout leader (7.5ft, 2X-3X). Articulated streamer or Woolly Bugger. Strip-set only — never trout-set on streamers. Vary strip speed: short sharp strips in warm water, slow strips in cold.';
        r.alt = 'Deep indicator nymph rig: 2 weighted nymphs below a large indicator set 4-5ft deep.';
      } else if (habitat === 'tailout') {
        r.name = 'Dry Fly Rig (Match the Hatch)';
        r.description = '12ft leader tapered to 6X-7X. Single dry fly matched to the current hatch. Drag-free drift is everything. Consider a parachute post for visibility. Apply floatant to leader butt but NOT to tippet.';
        r.alt = 'Soft hackle swing rig — wet fly on 5X swung through the tailout at the end of each drift.';
      } else {
        r.name = 'Heavy Pocket Nymph Rig';
        r.description = 'Tungsten-beadhead point fly (#12 Stonefly or Copper John) with a #16 tag nymph. Short leader (7.5ft, 4X). Tight-line approach: lift, lead, set. Each pocket gets 2-3 drifts max.';
        r.alt = 'Large streamer stripped past structure — sculpin patterns produce trophy fish near boulders.';
      }
    }
  } else if (method === 'spin') {
    if (habitat === 'riffle' || habitat === 'run') {
      r.name = 'Upstream Spinner Retrieve';
      r.description = 'Cast upstream at 45 degrees. Reel just fast enough to keep the blade spinning. Let the current do the work — the lure swings naturally through the feeding lanes.';
      r.alt = 'Small jerkbait (Rapala F3): twitch-pause retrieve through runs.';
    } else if (habitat === 'pool') {
      r.name = 'Count-Down Spoon Retrieve';
      r.description = 'Cast to the head of the pool. Count down 3-5 seconds. Slow flutter retrieve with twitches. Spoons wobble and flash as they fall — the strike often comes on the drop.';
      r.alt = 'Swim jig (1/16oz, white marabou) hopped along the bottom.';
    } else {
      r.name = 'Pocket-Water Pitch';
      r.description = 'Short accurate pitches to pocket water. Let the lure sink behind boulders and through gaps. Retrieve with short hops and pauses.';
      r.alt = 'Micro crankbait bumped along the bottom near structure.';
    }
  } else { // bait
    if (habitat === 'pool') {
      r.name = 'Bottom Rig (Sliding Sinker)';
      r.description = 'Sliding egg sinker (1/4oz) above a barrel swivel. 18-24 inches of 4lb mono leader to a #12 treble hook. Mold PowerBait into a marble-sized ball or thread on 2-3 corn kernels. Cast to the pool, let it settle, wait.';
      r.alt = 'Carolina rig with live nightcrawler.';
    } else if (habitat === 'riffle' || habitat === 'run') {
      r.name = 'Drift Rig';
      r.description = 'Small split shot 12-18 inches above a #8 bait hook. Thread on a worm or Mice Tail. Cast upstream, let it tumble through the riffle naturally. The bait should bounce along the bottom like natural food.';
      r.alt = 'Float rig: small bobber with bait suspended just off the bottom.';
    } else {
      r.name = 'Float Rig';
      r.description = 'Small clip-on float set at 1.5x water depth. #10 bait hook on 4lb leader. Hook a single salmon egg, worm piece, or floating Mice Tail. Cast upstream and let it drift through the target zone.';
      r.alt = 'Bottom rig behind structure with PowerBait.';
    }
  }

  return r;
}

/* ── Tackle bag builder — what to bring ── */
function _getTackleBag(method, water, c) {
  var bag = [];
  var season = c.season;

  if (method === 'fly') {
    // Top flies from the water data
    if (water.topFlies && water.topFlies.length) {
      bag = water.topFlies.slice(0, 5);
    } else {
      bag = ['#16 Pheasant Tail Nymph', '#14 Hare\'s Ear', '#18 Zebra Midge', '#14 Elk Hair Caddis', '#10 Woolly Bugger'];
    }
    // Season bonus
    if (season === 'winter') bag.push('#22 Black Midge (must-have for winter)');
    if (season === 'spring') bag.push('#16 BWO Emerger (match the spring hatch)');
    if (season === 'summer') bag.push('#12 Hopper (grasshopper season)');
    if (season === 'fall') bag.push('#10 October Caddis (fall classic)');

  } else if (method === 'spin') {
    if (water.topLures && water.topLures.length) {
      bag = water.topLures.slice(0, 5);
    } else {
      bag = ['1/8oz Rooster Tail (white)', '1/8oz Panther Martin (gold)', 'Rapala Countdown CD-3', 'Small Kastmaster (gold)', 'Rebel Wee Craw'];
    }
    if (c.waterTemp < 50) bag.push('Slow it down — lightweight jig (1/32oz) in cold water');

  } else {
    if (water.topBait && water.topBait.length) {
      bag = water.topBait.slice(0, 4);
    } else {
      bag = ['PowerBait (chartreuse)', 'PowerBait (rainbow)', 'Nightcrawler', 'Corn'];
    }
    bag.push('#8-12 bait hooks + split shot assortment');
    bag.push('Small treble hooks (#14) for dough bait');
  }

  return bag;
}

window._listenMission = function() {
  var textEl = document.getElementById('missionSummaryText');
  if (!textEl) return;
  var text = textEl.textContent || textEl.innerText;
  if (typeof window.speakText === 'function') {
    window.speakText(text);
  } else if (typeof speakTextBrowser === 'function') {
    speakTextBrowser(text);
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
    var textEl = document.getElementById('missionSummaryText');
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
      summary: textEl ? (textEl.textContent || textEl.innerText) : ''
    });
    localStorage.setItem(key, JSON.stringify(journal));
    showNotice('💾 Trip saved! Access it in your journal anytime.', 'success', 2500);
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

  // Close existing spot info tray
  if (typeof window._closeSpotInfoTray === 'function') window._closeSpotInfoTray();

  // Clear ALL previous layers — micro pins, polygons, angler pins, approach lines, flow, boulders
  _activeMicroPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _activeMicroPins = [];
  _activeMicroPolygons.forEach(function(p) { try { map.removeLayer(p); } catch {} });
  _activeMicroPolygons = [];
  _activeAnglerPins.forEach(function(m) { try { map.removeLayer(m); } catch {} });
  _activeAnglerPins = [];
  _activeApproachLines.forEach(function(l) { try { map.removeLayer(l); } catch {} });
  _activeApproachLines = [];
  // Also clear zone polygon if it's still visible
  if (_activeZonePolygon) { try { map.removeLayer(_activeZonePolygon); } catch {} _activeZonePolygon = null; }
  // Clear legacy layers
  if (typeof clearMicroPins === 'function') try { clearMicroPins(); } catch {}
  if (typeof clearFlowOverlay === 'function') try { clearFlowOverlay(); } catch {}
  if (typeof clearBoulders === 'function') try { clearBoulders(); } catch {}

  // Build micro-area polygon around this spot (small radius)
  var segment = getZoneStreamSegment(water, zone);
  if (segment && segment.length >= 2) {
    var centerIdx = spot.segmentIdx;
    var start = Math.max(0, centerIdx - 2);
    var end = Math.min(segment.length - 1, centerIdx + 2);
    var microSegment = segment.slice(start, end + 1);

    if (microSegment.length >= 2) {
      var microCorridor = buildStreamCorridor(microSegment, 25);
      if (microCorridor) {
        var microPoly = L.polygon(microCorridor, {
          color: '#ffe082',
          weight: 2,
          fillColor: '#ffe082',
          fillOpacity: 0.20,
          dashArray: '4 3'
        }).addTo(map);
        _activeMicroPolygons.push(microPoly);
        setTimeout(function() { microPoly.setStyle({ fillOpacity: 0.10 }); }, 2000);
        setTimeout(function() { microPoly.setStyle({ fillOpacity: 0.03, opacity: 0.15 }); }, 4000);
        setTimeout(function() {
          try { map.removeLayer(microPoly); } catch {}
          var pIdx = _activeMicroPolygons.indexOf(microPoly);
          if (pIdx !== -1) _activeMicroPolygons.splice(pIdx, 1);
        }, 6000);
      }
    }
  }

  // ── Smart micro-spot deployment — HIGH DENSITY ──
  // More spots = more killer locations identified
  var maxMicros = spot.score >= 70 ? 10 : spot.score >= 50 ? 8 : 5;

  var microTypes = ['primary-lie', 'seam-edge', 'pocket-water', 'undercut-bank', 'feeding-lane',
                    'tail-glide', 'riffle-drop', 'eddy-pocket', 'bank-shadow', 'deep-slot'];
  var seg = getZoneStreamSegment(water, zone) || [];
  var cIdx = spot.segmentIdx;

  // Build zone corridor polygon for strict boundary enforcement
  var _zoneCorridor = buildStreamCorridor(seg, 45);

  // Distance helper (meters between two lat/lng points)
  var _dist = function(lat1, lng1, lat2, lng2) {
    var R = Math.PI / 180;
    var dLat = (lat2 - lat1) * 111000;
    var dLng = (lng2 - lng1) * 111000 * Math.cos(lat1 * R);
    return Math.sqrt(dLat * dLat + dLng * dLng);
  };

  // ── Build dense candidate list — TERRITORY-AWARE scanning ──
  // Only scan within this pin's territory (halfway to adjacent pins)
  var candidates = [];
  var tStart = typeof spot.territoryStart === 'number' ? spot.territoryStart : Math.max(0, cIdx - 4);
  var tEnd = typeof spot.territoryEnd === 'number' ? spot.territoryEnd : Math.min(seg.length - 1, cIdx + 4);
  // Ensure at least ±2 segment nodes so we always find candidates
  tStart = Math.min(tStart, Math.max(0, cIdx - 2));
  tEnd = Math.max(tEnd, Math.min(seg.length - 1, cIdx + 2));

  for (var sIdx = tStart; sIdx <= tEnd; sIdx++) {
    if (sIdx === cIdx) continue;
    if (sIdx < 0 || sIdx >= seg.length) continue;
    var offset = sIdx - cIdx; // for downstream bias scoring
    var cLat = seg[sIdx][0];
    var cLng = seg[sIdx][1];

    // Also generate interpolated midpoints between this and previous segment node
    var interpPoints = [[cLat, cLng, sIdx]];
    if (sIdx > 0 && sIdx < seg.length) {
      var pLat = seg[sIdx - 1][0], pLng = seg[sIdx - 1][1];
      interpPoints.push([(cLat + pLat) / 2, (cLng + pLng) / 2, sIdx]);
      // Quarter points for extra density
      interpPoints.push([(cLat * 0.75 + pLat * 0.25), (cLng * 0.75 + pLng * 0.25), sIdx]);
      interpPoints.push([(cLat * 0.25 + pLat * 0.75), (cLng * 0.25 + pLng * 0.75), sIdx]);
    }

    for (var ip = 0; ip < interpPoints.length; ip++) {
      var ipLat = interpPoints[ip][0];
      var ipLng = interpPoints[ip][1];
      var ipSegIdx = interpPoints[ip][2];

      // Must be at least 4m from main pin to avoid overlap
      var distFromMain = _dist(spot.lat, spot.lng, ipLat, ipLng);
      if (distFromMain < 4) continue;

      // Must be at least 3m from any already-accepted candidate
      var tooClose = false;
      for (var c = 0; c < candidates.length; c++) {
        if (_dist(candidates[c].lat, candidates[c].lng, ipLat, ipLng) < 3) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      // STRICT: Only accept candidates INSIDE the zone polygon
      if (_zoneCorridor && !_pointInPolygon(ipLat, ipLng, _zoneCorridor)) continue;

      // Score: prefer moderate distance, downstream bias, varied spread
      var microScore = 60;
      microScore += Math.max(0, 25 - distFromMain * 0.5);
      if (offset > 0) microScore += 4; // downstream preference
      if (offset < 0) microScore += 2; // upstream still good
      microScore -= Math.abs(offset) * 0.8; // mild far-penalty
      // Bonus for interpolated points (often land at structure transitions)
      if (ip > 0) microScore += 3;
      // Small hash-based variation so results aren't identical each load
      microScore += ((ipLat * 100000 + ipLng * 100000) % 7);

      candidates.push({
        lat: ipLat,
        lng: ipLng,
        segIdx: ipSegIdx,
        score: microScore,
        distFromMain: distFromMain
      });
    }
  }

  // Sort by micro score, take top N up to maxMicros
  candidates.sort(function(a, b) { return b.score - a.score; });
  var accepted = candidates.slice(0, maxMicros);

  // Deploy accepted micro-spots as animated trout in environment
  var microCoords = [];
  // Map micro-type to visual environment class
  var envClasses = {
    'primary-lie': 'ht-env-current',
    'seam-edge': 'ht-env-seam',
    'pocket-water': 'ht-env-rock',
    'undercut-bank': 'ht-env-undercut',
    'feeding-lane': 'ht-env-lane',
    'tail-glide': 'ht-env-current',
    'riffle-drop': 'ht-env-seam',
    'eddy-pocket': 'ht-env-rock',
    'bank-shadow': 'ht-env-undercut',
    'deep-slot': 'ht-env-lane'
  };
  var envLabels = {
    'primary-lie': 'Holding in Current',
    'seam-edge': 'Working the Seam',
    'pocket-water': 'Behind Boulder',
    'undercut-bank': 'Under the Bank',
    'feeding-lane': 'In the Lane',
    'tail-glide': 'Tail of Pool',
    'riffle-drop': 'Riffle Drop-off',
    'eddy-pocket': 'Eddy Pocket',
    'bank-shadow': 'Bank Shadow',
    'deep-slot': 'Deep Slot'
  };

  var microDeployData = []; // capture fish positions for stand-here pins

  // ═══════════════════════════════════════════════════════════════════════
  // GLOBAL FLOW DIRECTION — computed from overall path start→end.
  // Used to VALIDATE local direction at each fish position, preventing
  // direction reversals at S-bends and tight curves.
  // ═══════════════════════════════════════════════════════════════════════
  var _globalFlowLat = seg[seg.length - 1][0] - seg[0][0];
  var _globalFlowLng = seg[seg.length - 1][1] - seg[0][1];
  var _globalFlowLen = Math.sqrt(_globalFlowLat * _globalFlowLat + _globalFlowLng * _globalFlowLng);
  if (_globalFlowLen < 1e-9) _globalFlowLen = 1e-9;
  _globalFlowLat /= _globalFlowLen;
  _globalFlowLng /= _globalFlowLen;

  accepted.forEach(function(mc, i) {
    var mType = microTypes[i] || 'primary-lie';
    var mLabel = envLabels[mType] || _capitalize(mType.replace(/-/g, ' '));
    var envClass = envClasses[mType] || 'ht-env-current';
    // Random swimming direction variation
    var swimDelay = (i * 0.4).toFixed(1);

    // ── Direction calculation: use WIDE WINDOW (±3 nodes) to avoid ──
    // ── direction reversals at S-bends and tight curves.            ──
    var wBack = Math.max(0, mc.segIdx - 3);
    var wFwd  = Math.min(seg.length - 1, mc.segIdx + 3);
    var sdLat = seg[wFwd][0] - seg[wBack][0];
    var sdLng = seg[wFwd][1] - seg[wBack][1];
    var sLen = Math.sqrt(sdLat * sdLat + sdLng * sdLng);
    if (sLen < 1e-9) sLen = 1e-9;

    // GUARDRAIL: validate local direction against global flow.
    // If dot product is negative, local direction is backwards — flip it.
    var dotProduct = (sdLat / sLen) * _globalFlowLat + (sdLng / sLen) * _globalFlowLng;
    if (dotProduct < 0) {
      sdLat = -sdLat;
      sdLng = -sdLng;
    }

    // Perpendicular unit vector (rotate stream direction 90°)
    var perpLat = -sdLng / sLen;
    var perpLng =  sdLat / sLen;
    // Alternate sides so fish don't all clump one side
    var side = (i % 2 === 0) ? 1 : -1;
    // ~3 meters — fish stay IN the stream, never in the woods
    var offsetDeg = 0.000027;
    var placeLat = mc.lat + perpLat * offsetDeg * side;
    var placeLng = mc.lng + perpLng * offsetDeg * side;

    // STRICT: If fish position is outside zone polygon, snap back to stream center
    if (_zoneCorridor && !_pointInPolygon(placeLat, placeLng, _zoneCorridor)) {
      placeLat = mc.lat;
      placeLng = mc.lng;
    }

    // Random mix of rainbow and brown trout
    var troutSvg = (Math.random() < 0.4) ? 'assets/trout-pin-brown.svg' : 'assets/trout-pin.svg';

    var mIcon = L.divIcon({
      className: 'ht-micro-trout-pin ' + envClass,
      html: '<div class="ht-trout-swim-wrap" style="animation-delay:' + swimDelay + 's">' +
        '<img src="' + troutSvg + '" width="42" height="21" alt="" class="ht-trout-alive">' +
        '</div>' +
        '<span class="ht-micro-trout-label">' + mLabel + '</span>',
      iconSize: [42, 21],
      iconAnchor: [21, 10]
    });

    var mMarker = L.marker([placeLat, placeLng], { icon: mIcon, zIndexOffset: 500 }).addTo(map);
    mMarker.__microType = mType;
    mMarker.__microIdx = i;
    (function(mk, mt, mi) {
      mk.on('click', function() {
        _showSpotInfoTray(water, zone, spot, mt, mi);
      });
    })(mMarker, mType, i);
    _activeMicroPins.push(mMarker);
    microCoords.push([placeLat, placeLng]);

    // ── Store data for stand-here pins + approach lines ──
    microDeployData.push({
      fishLat: placeLat,
      fishLng: placeLng,
      segIdx: mc.segIdx,
      type: mType,
      side: side,
      perpLat: perpLat,
      perpLng: perpLng,
      downLat: sdLat / sLen,
      downLng: sdLng / sLen
    });
  });

  // ── Deploy stand-here angler pins + approach direction lines ──
  // (Previous layers already cleared at top of function)

  // Wade-aware distance configs per micro-type
  // Waders = angler stands IN the stream (low perp offset)
  // Shore = angler stands on bank but close (moderate perp offset)
  var wadeMode = (window._fishFlow && window._fishFlow.wade) || 'waders';
  var isWading = (wadeMode === 'waders');

  var anglerDists = isWading ? {
    // WADERS — angler is IN the water, just downstream of fish
    'primary-lie': { down: 8, perp: 2 },
    'seam-edge': { down: 7, perp: 3 },
    'pocket-water': { down: 6, perp: 2 },
    'undercut-bank': { down: 8, perp: 4 },
    'feeding-lane': { down: 8, perp: 2 },
    'tail-glide': { down: 9, perp: 2 },
    'riffle-drop': { down: 7, perp: 2 },
    'eddy-pocket': { down: 6, perp: 2 },
    'bank-shadow': { down: 8, perp: 3 },
    'deep-slot': { down: 8, perp: 2 }
  } : {
    // SHORE/BOOTS — angler on bank, close to water edge
    'primary-lie': { down: 10, perp: 6 },
    'seam-edge': { down: 8, perp: 7 },
    'pocket-water': { down: 6, perp: 5 },
    'undercut-bank': { down: 9, perp: 8 },
    'feeding-lane': { down: 9, perp: 6 },
    'tail-glide': { down: 10, perp: 6 },
    'riffle-drop': { down: 8, perp: 6 },
    'eddy-pocket': { down: 6, perp: 5 },
    'bank-shadow': { down: 9, perp: 8 },
    'deep-slot': { down: 9, perp: 6 }
  };
  // Approach advice per micro-type
  var approachAdvice = {
    'primary-lie': 'Approach from downstream. Stay low, cast upstream.',
    'seam-edge': 'Cross-stream approach. Cast across the seam.',
    'pocket-water': 'Approach from below. Short, accurate casts into the pocket.',
    'undercut-bank': 'Approach from opposite bank. Cast parallel to the bank edge.',
    'feeding-lane': 'Approach from directly downstream. Dead-drift upstream.',
    'tail-glide': 'Approach from downstream. Position at the tail, cast into the glide.',
    'riffle-drop': 'Low approach from downstream. Work the drop-off edge.',
    'eddy-pocket': 'Side approach from below the eddy. Pitch into calm water.',
    'bank-shadow': 'Approach from opposite bank. Long casts tight to the shadow line.',
    'deep-slot': 'Downstream approach. Let your presentation sink deep.'
  };

  microDeployData.forEach(function(md, idx) {
    var dist = anglerDists[md.type] || { down: 12, perp: 10 };
    var degPerM = 0.000009; // ~1 meter in degrees

    // Angler position: downstream + further from stream center (same side as fish)
    var anglerLat = md.fishLat + md.downLat * degPerM * dist.down + md.perpLat * degPerM * dist.perp * md.side;
    var anglerLng = md.fishLng + md.downLng * degPerM * dist.down + md.perpLng * degPerM * dist.perp * md.side;

    // STRICT: If angler position is outside zone polygon, clamp to a safe position near the fish
    if (_zoneCorridor && !_pointInPolygon(anglerLat, anglerLng, _zoneCorridor)) {
      // Move angler closer — halve the offset until inside, or fall back next to fish
      var tryDist = { down: dist.down * 0.5, perp: dist.perp * 0.5 };
      anglerLat = md.fishLat + md.downLat * degPerM * tryDist.down + md.perpLat * degPerM * tryDist.perp * md.side;
      anglerLng = md.fishLng + md.downLng * degPerM * tryDist.down + md.perpLng * degPerM * tryDist.perp * md.side;
      if (!_pointInPolygon(anglerLat, anglerLng, _zoneCorridor)) {
        anglerLat = md.fishLat + md.downLat * degPerM * 3;
        anglerLng = md.fishLng + md.downLng * degPerM * 3;
      }
    }

    // Stand-here pin — wading fly fisherman silhouette with rod + line
    var shIcon = L.divIcon({
      className: 'ht-stand-here-pin',
      html: '<div class="ht-stand-here-dot">' +
        '<svg viewBox="0 0 36 44" width="28" height="34" class="ht-stand-here-svg">' +
        '<ellipse cx="18" cy="42" rx="8" ry="2" fill="rgba(0,0,0,0.2)"/>' +
        '<path d="M14 30 L13 40 L17 40 L16 30 Z" fill="#4a5a3a" stroke="#3a4a2a" stroke-width="0.5"/>' +
        '<path d="M20 30 L19 40 L23 40 L22 30 Z" fill="#4a5a3a" stroke="#3a4a2a" stroke-width="0.5"/>' +
        '<path d="M10 38 Q18 36 26 38" stroke="rgba(93,216,255,0.5)" stroke-width="1" fill="none"/>' +
        '<path d="M14 18 Q13 24 14 30 L22 30 Q23 24 22 18 Z" fill="#5a7a4a" stroke="#4a6a3a" stroke-width="0.5"/>' +
        '<rect x="15" y="22" width="3" height="2.5" rx="0.5" fill="rgba(0,0,0,0.1)"/>' +
        '<rect x="19" y="23" width="2.5" height="2" rx="0.5" fill="rgba(0,0,0,0.08)"/>' +
        '<path d="M14 20 L10 16" stroke="#5a7a4a" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '<path d="M22 20 L25 23" stroke="#5a7a4a" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '<path d="M10 16 L4 4 L2 1" stroke="#8B7355" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
        '<path class="ht-stand-flyline" d="M2 1 Q10 -2 18 0 Q26 2 32 8" stroke="rgba(255,224,130,0.6)" stroke-width="0.8" fill="none"/>' +
        '<circle cx="32" cy="8" r="1" fill="#ffe082" opacity="0.7"/>' +
        '<ellipse cx="18" cy="14" rx="6" ry="2" fill="#5a7a4a"/>' +
        '<path d="M14 14 Q14 9 18 8 Q22 9 22 14" fill="#6a8a5a" stroke="#4a6a3a" stroke-width="0.4"/>' +
        '<circle cx="18" cy="12" r="3.5" fill="#e8c99b"/>' +
        '<path d="M16 11.5 L20 11.5" stroke="#222" stroke-width="1.2" stroke-linecap="round"/>' +
        '</svg>' +
        '</div>',
      iconSize: [28, 34],
      iconAnchor: [14, 34]
    });
    var shMarker = L.marker([anglerLat, anglerLng], {
      icon: shIcon,
      zIndexOffset: 480,
      interactive: true
    }).addTo(map);

    var advice = approachAdvice[md.type] || 'Approach from downstream.';
    shMarker.bindPopup(
      '<div style="min-width:160px;">' +
      '<div style="font-weight:700;color:#7cffc7;font-size:12px;margin-bottom:3px;">🎣 Stand Here</div>' +
      '<div style="font-size:10px;color:#c8e6d5;line-height:1.4;">' + advice + '</div>' +
      '</div>',
      { maxWidth: 220, className: 'ht-zone-popup' }
    );
    _activeAnglerPins.push(shMarker);
    microCoords.push([anglerLat, anglerLng]);

    // ═══════════════════════════════════════════════════════════════════
    // CAST LANDING GUARDRAILS — Strict upstream placement per habitat
    // Cast NEVER lands on the fish. It lands upstream so the natural
    // drift carries the fly/lure INTO the strike zone. Spooking = fail.
    // ═══════════════════════════════════════════════════════════════════
    var degPerM = 0.000009; // ~1 meter in degrees

    // Habitat-specific upstream offset (meters) + perpendicular correction
    // These are researched casting placement rules for each structure type
    var castPlacement = {
      'primary-lie':  { up: 3.5, perpShift: 0,    note: 'Dead drift — cast 3.5m upstream, center of the current lane' },
      'seam-edge':    { up: 3.0, perpShift: 0.8,  note: 'Cast into faster water side, drift crosses seam naturally' },
      'pocket-water': { up: 2.0, perpShift: 0,    note: 'Short precise cast into pocket mouth, let tumble in' },
      'undercut-bank':{ up: 2.5, perpShift: -1.0, note: 'Cast tight to bank edge, drift parallel under overhang' },
      'feeding-lane': { up: 4.0, perpShift: 0,    note: 'Long upstream drift — match the food conveyor lane exactly' },
      'tail-glide':   { up: 3.0, perpShift: 0,    note: 'Cast above the tail, let presentation glide through thin water' },
      'riffle-drop':  { up: 2.5, perpShift: 0,    note: 'Cast at top of riffle, drift tumbles over the drop-off' },
      'eddy-pocket':  { up: 1.5, perpShift: 0.5,  note: 'Short cast — eddy reverses current, less upstream lead needed' },
      'bank-shadow':  { up: 3.0, perpShift: -0.8, note: 'Cast upstream along shadow line, drift follows the bank' },
      'deep-slot':    { up: 4.0, perpShift: 0,    note: 'Extra lead time — weighted rig needs distance to sink into slot' }
    };

    var cp = castPlacement[md.type] || { up: 3, perpShift: 0, note: 'Cast upstream of fish' };

    // Calculate UPSTREAM direction (opposite of downstream)
    var upstreamLat = -md.downLat;  // reversed downstream direction
    var upstreamLng = -md.downLng;

    // Cast landing point: fish position + upstream offset + perpendicular shift
    var castLandLat = md.fishLat + upstreamLat * degPerM * cp.up + md.perpLat * degPerM * cp.perpShift * md.side;
    var castLandLng = md.fishLng + upstreamLng * degPerM * cp.up + md.perpLng * degPerM * cp.perpShift * md.side;

    // STRICT: If cast landing is outside zone polygon, clamp to fish position + minimal upstream
    if (_zoneCorridor && !_pointInPolygon(castLandLat, castLandLng, _zoneCorridor)) {
      castLandLat = md.fishLat + upstreamLat * degPerM * 1.5;
      castLandLng = md.fishLng + upstreamLng * degPerM * 1.5;
    }

    // ═══════════════════════════════════════════════════════════════════
    // FINAL UPSTREAM GUARDRAIL — cast MUST land at a lower path index
    // (more upstream) than the fish. If nearest-index check fails,
    // flip the cast to the other side. This catches ANY remaining
    // direction errors from path geometry quirks.
    // ═══════════════════════════════════════════════════════════════════
    var _castIdx = _nearestPathIdx(seg, castLandLat, castLandLng);
    var _fishIdx = _nearestPathIdx(seg, md.fishLat, md.fishLng);
    if (_castIdx >= _fishIdx) {
      // Cast landed downstream or at fish — FLIP to upstream side
      castLandLat = md.fishLat - upstreamLat * degPerM * cp.up;
      castLandLng = md.fishLng - upstreamLng * degPerM * cp.up;
      // Re-check zone boundary after flip
      if (_zoneCorridor && !_pointInPolygon(castLandLat, castLandLng, _zoneCorridor)) {
        castLandLat = md.fishLat + upstreamLat * degPerM * 1.5;
        castLandLng = md.fishLng + upstreamLng * degPerM * 1.5;
      }
      // Final fallback: force index-based upstream placement
      var _reflipIdx = _nearestPathIdx(seg, castLandLat, castLandLng);
      if (_reflipIdx >= _fishIdx && _fishIdx > 0) {
        // Place cast at the path point 1-2 indices upstream of fish
        var _upIdx = Math.max(0, _fishIdx - 2);
        castLandLat = seg[_upIdx][0];
        castLandLng = seg[_upIdx][1];
      }
    }

    // Animated casting arc — pronounced curved path from angler to landing spot
    var castDist = Math.sqrt(
      Math.pow((castLandLat - anglerLat) * 111000, 2) +
      Math.pow((castLandLng - anglerLng) * 111000 * Math.cos(castLandLat * Math.PI / 180), 2)
    );
    // Control point for arc — bigger perpendicular offset for visible curve
    var midLat = (anglerLat + castLandLat) / 2;
    var midLng = (anglerLng + castLandLng) / 2;
    var dLat = castLandLat - anglerLat;
    var dLng = castLandLng - anglerLng;
    var arcMag = Math.sqrt(dLat*dLat + dLng*dLng);
    // Arc height scales with distance — more visible curve on longer casts
    var arcOffset = Math.max(0.00004, arcMag * 0.35);
    var cpLat = midLat + (-dLng) * arcOffset / Math.max(0.00001, arcMag);
    var cpLng = midLng + (dLat) * arcOffset / Math.max(0.00001, arcMag);

    // Build points along the bezier curve
    var curvePoints = [];
    var curveSteps = 20;
    for (var ci = 0; ci <= curveSteps; ci++) {
      var t = ci / curveSteps;
      var u = 1 - t;
      var cuLat = u*u*anglerLat + 2*u*t*cpLat + t*t*castLandLat;
      var cuLng = u*u*anglerLng + 2*u*t*cpLng + t*t*castLandLng;
      curvePoints.push([cuLat, cuLng]);
    }

    // Visible casting arc polyline
    var approachLine = L.polyline(curvePoints, {
      color: '#7cffc7',
      weight: 2.5,
      opacity: 0.65,
      dashArray: '8 6',
      className: 'ht-cast-arc',
      interactive: false
    }).addTo(map);
    _activeApproachLines.push(approachLine);

    // Glow underlayer for the cast arc — makes it pop on dark satellite
    var glowLine = L.polyline(curvePoints, {
      color: '#7cffc7',
      weight: 6,
      opacity: 0.12,
      className: 'ht-cast-arc-glow',
      interactive: false
    }).addTo(map);
    _activeApproachLines.push(glowLine);

    // ── Cast landing zone — splash ring + target dot ──
    // Outer splash ring (expanding ripple at landing point)
    var splashIcon = L.divIcon({
      className: 'ht-cast-splash-pin',
      html: '<div class="ht-cast-splash-ring"></div><div class="ht-cast-splash-ring ht-cast-splash-ring-2"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    var splashMarker = L.marker([castLandLat, castLandLng], {
      icon: splashIcon,
      zIndexOffset: 477,
      interactive: false
    }).addTo(map);
    _activeApproachLines.push(splashMarker);

    // Center target dot at landing point
    var flyDotIcon = L.divIcon({
      className: 'ht-cast-fly-pin',
      html: '<div class="ht-cast-fly-dot"></div>',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
    var flyDot = L.marker([castLandLat, castLandLng], {
      icon: flyDotIcon,
      zIndexOffset: 478,
      interactive: false
    }).addTo(map);
    _activeApproachLines.push(flyDot);

    // "CAST HERE" label near the landing dot
    var castLabelIcon = L.divIcon({
      className: 'ht-cast-label-pin',
      html: '<div class="ht-cast-label">CAST HERE</div>',
      iconSize: [60, 14],
      iconAnchor: [30, -6]
    });
    var castLabel = L.marker([castLandLat, castLandLng], {
      icon: castLabelIcon,
      zIndexOffset: 479,
      interactive: false
    }).addTo(map);
    _activeApproachLines.push(castLabel);

    // Drift direction arrow — shows current flow from landing to fish
    var driftMidLat = (castLandLat + md.fishLat) / 2;
    var driftMidLng = (castLandLng + md.fishLng) / 2;
    var driftAngle = Math.atan2(
      (md.fishLng - castLandLng) * 111000 * Math.cos(md.fishLat * Math.PI / 180),
      (md.fishLat - castLandLat) * 111000
    ) * 180 / Math.PI;
    var driftIcon = L.divIcon({
      className: 'ht-drift-arrow-pin',
      html: '<div class="ht-drift-arrow" style="transform:rotate(' + (driftAngle - 90) + 'deg)">›</div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    var driftMk = L.marker([driftMidLat, driftMidLng], {
      icon: driftIcon,
      zIndexOffset: 476,
      interactive: false
    }).addTo(map);
    _activeApproachLines.push(driftMk);

    // Direction arrow on the cast arc at 65% (near landing)
    var tArr = 0.65;
    var uArr = 1 - tArr;
    var arrLat = uArr*uArr*anglerLat + 2*uArr*tArr*cpLat + tArr*tArr*castLandLat;
    var arrLng = uArr*uArr*anglerLng + 2*uArr*tArr*cpLng + tArr*tArr*castLandLng;
    var aAngle = Math.atan2(
      (castLandLng - anglerLng) * 111000 * Math.cos(castLandLat * Math.PI / 180),
      (castLandLat - anglerLat) * 111000
    ) * 180 / Math.PI;
    var arrowIcon = L.divIcon({
      className: 'ht-approach-arrow-pin',
      html: '<div class="ht-approach-arrow" style="transform:rotate(' + (aAngle - 90) + 'deg)">›</div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    var arrowMk = L.marker([arrLat, arrLng], {
      icon: arrowIcon,
      zIndexOffset: 475,
      interactive: false
    }).addTo(map);
    _activeApproachLines.push(arrowMk);
  });

  // Zoom to fit the main pin + micro spots
  var allPts = [[spot.lat, spot.lng]].concat(microCoords);
  var zbounds = L.latLngBounds(allPts);
  map.fitBounds(zbounds.pad(0.3), { animate: true, duration: 0.8, maxZoom: 19 });

  // Deploy water flow simulation overlay
  try { deployFlowOverlay(water, zone); } catch(fErr) {}

  // Deploy boulders with water-around animation
  try { deployBoulders(water, zone); } catch(bErr) {}

  if (accepted.length === 0) {
    // status suppressed
  }
}
window._autoCheckInToPin = _autoCheckInToPin;

/* Manual pin click → show CHECK IN confirmation popup, then deploy on confirm */
function _onAiPinClick(water, zone, spot, fishFlow) {
  var idx = _aiFishingSpots.indexOf(spot);
  var pinIdx = idx >= 0 ? idx : 0;
  var marker = _aiFishingPins[pinIdx];
  if (!marker) { _autoCheckInToPin(pinIdx); return; }

  var popupHtml = '<div style="min-width:200px;text-align:center;">' +
    '<div style="font-weight:800;color:#7cffc7;font-size:14px;margin-bottom:4px;">#' + spot.rank + ' ' + escapeHtml(_capitalize(spot.habitat)) + '</div>' +
    '<div style="font-size:11px;color:#c8e6d5;margin-bottom:8px;">Score: ' + spot.score + ' pts</div>' +
    '<button style="padding:8px 20px;border-radius:10px;border:1.5px solid #7cffc7;background:rgba(124,255,199,0.18);color:#7cffc7;font-size:13px;font-weight:800;cursor:pointer;width:100%;" ' +
      'onclick="window._confirmPinCheckIn(' + pinIdx + ')">CHECK IN HERE</button>' +
    '</div>';
  marker.unbindPopup();
  marker.bindPopup(popupHtml, { maxWidth: 280, className: 'ht-zone-popup', closeButton: true }).openPopup();
}

/* Confirmed check-in from popup → deploy micro-spots */
window._confirmPinCheckIn = function(pinIdx) {
  if (map) map.closePopup();
  _autoCheckInToPin(pinIdx);
};

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
  var fishFlow = window._fishFlow || {};
  var method = fishFlow.method || 'fly';
  var mRec = getMethodSpecificRec(water, spot.habitat, method);
  var microLabel = _capitalize(microType.replace(/-/g, ' '));

  // Method-aware micro-spot advice
  var microAdviceFly = {
    'primary-lie': 'This is the main holding position. Trout actively feed here. Deliver your fly 3-4 feet upstream and let it drift naturally into the strike zone.',
    'seam-edge': 'The seam between fast and slow water. Cast to the fast side and let your fly drift into the seam. Mend upstream for a drag-free drift.',
    'pocket-water': 'Protected pocket behind structure. Short, accurate casts directly into the pocket. Let your fly sink 2-3 seconds before any retrieval.',
    'undercut-bank': 'Undercut bank where trout shelter. Cast parallel to the bank, tight to the edge. Let your fly drift underneath the overhang.',
    'feeding-lane': 'A natural food conveyor belt. Position yourself downstream and cast upstream into the lane. Dead-drift is critical.'
  };
  var microAdviceBait = {
    'primary-lie': 'The main holding position — trout park here to feed. Set your bait rig upstream and let it drift naturally into this lie. Be patient — let the bait sit 3-5 minutes.',
    'seam-edge': 'The seam between fast and slow water is a bait magnet. Drift your bait along the slow side — trout pick off food here without fighting current.',
    'pocket-water': 'Protected pocket behind the boulder. Drop your bait directly into the calm water. Use minimal weight — let the current do the work.',
    'undercut-bank': 'Undercut bank — BIG trout territory. Cast your bait tight to the bank edge and let it drift under. This is where trophy fish hide from current and predators.',
    'feeding-lane': 'Natural food funnel. Position your bait at the top of the lane and let it drift through. Natural presentation is everything — no bobber, just split shot and drift.'
  };
  var microAdviceSpin = {
    'primary-lie': 'Main feeding position. Cast your lure upstream and retrieve through this holding zone. Spinners: slow, steady retrieve matching current speed. Jerkbaits: twitch-pause-twitch through the zone — erratic action triggers strikes.',
    'seam-edge': 'The seam is spinner and jerkbait territory. Cast across the fast water and let your lure swing into the slow side. Spinners: blade flash at the transition. Jerkbaits: twitch a Rapala through the seam — the pause lets it drift into the strike zone.',
    'pocket-water': 'Pocket behind structure — pitch your lure directly into the calm water. Spinners: let sink 2 seconds, short twitches. Jerkbaits or crankbaits: one cast per pocket, let sink and twitch once — trout commit fast in pockets.',
    'undercut-bank': 'Undercut bank — pitch a jig, small spoon, or Countdown Rapala tight to the bank. Jerkbaits: cast parallel to the bank, let the lure sink along the edge. Big trout ambush from these lies.',
    'feeding-lane': 'Cast upstream into the lane. Spinners: retrieve just fast enough to keep blade turning. Crankbaits: slow wobble through the narrow channel. Jerkbaits: twitch-pause lets the current carry your lure naturally through the lane.'
  };

  var adviceMap = method === 'bait' ? microAdviceBait : method === 'spin' ? microAdviceSpin : microAdviceFly;
  var advice = adviceMap[microType] || adviceMap['primary-lie'];

  // Method-aware labels
  var tackleLabel = method === 'fly' ? 'RECOMMENDED FLY' : method === 'bait' ? 'RECOMMENDED BAIT' : 'RECOMMENDED LURE';

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
        <div class="ht-spot-info-text">${escapeHtml(advice)}</div>
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">APPROACH</div>
        <div class="ht-spot-info-text">${escapeHtml(strat.approach)}</div>
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">PRESENTATION</div>
        <div class="ht-spot-info-text">${escapeHtml(mRec.presentation)}</div>
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">${tackleLabel}</div>
        <div class="ht-spot-info-text">${escapeHtml(mRec.primary)}</div>
        <div class="ht-spot-info-alt">Backup: ${escapeHtml(mRec.backup)}</div>
        ${mRec.tackle ? '<div class="ht-spot-info-alt">Rig: ' + escapeHtml(mRec.tackle) + '</div>' : ''}
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">COLOR / PATTERN RATIONALE</div>
        <div class="ht-spot-info-text">${escapeHtml(mRec.conditionNote)}</div>
        ${mRec.color ? '<div class="ht-spot-info-alt">' + escapeHtml(mRec.color) + '</div>' : ''}
      </div>
      <div class="ht-spot-info-section">
        <div class="ht-spot-info-label">WADING</div>
        <div class="ht-spot-info-text">${escapeHtml(strat.wadingAdvice)}</div>
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
