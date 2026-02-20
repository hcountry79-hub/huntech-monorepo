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
  const permitInfo = getTroutPermitInfo(water);
  const stampLabel = permitInfo.label;
  const stampPill = permitInfo.pill;
  const stampClass = permitInfo.type !== 'none' ? 'ht-fly-pill ht-fly-pill--stamp' : 'ht-fly-pill ht-fly-pill--stamp ht-fly-pill--stamp-optional';
  const ribbonLabel = water.ribbon ? ` • ${escapeHtml(water.ribbon)}` : '';
  bar.innerHTML = `
    <div class="ht-fly-water-bar-header">
      <div>
        <div class="ht-fly-water-bar-title">${escapeHtml(water.name || 'Trout Water')}</div>
        <div class="ht-fly-water-bar-sub">${escapeHtml(water.waterType || 'Public Water')}${ribbonLabel}</div>
      </div>
      <button class="ht-fly-water-bar-close" type="button" onclick="closeFlyWaterActionBar()">X</button>
    </div>
    <div class="ht-fly-water-bar-actions">
      <button class="ht-fly-pill ht-fly-pill--primary" type="button" onclick="fishStepCheckIn()">Check In to Area</button>
      <button class="ht-fly-pill" type="button" onclick="fishStepSaveSpot()">Add to My Spots</button>
      <button class="ht-fly-pill ht-fly-pill--ghost" type="button" onclick="openFlyWaterRegulations('${escapeHtml(water.id)}')">Area Rules + Regs</button>
      <button class="${stampClass}" type="button" aria-label="${stampLabel}" disabled>${stampPill}</button>
    </div>
  `;
  bar.classList.add('is-visible');
}

/* ── Check-In form: expands tray to show preferences + LET'S GO ── */
function showFlyCheckInForm(water) {
  if (!water) return;
  const bar = ensureFlyWaterActionBar();
  const permitInfo = getTroutPermitInfo(water);
  const stampNote = permitInfo.type !== 'none' ? '⚠️ ' + permitInfo.pill : '✅ No Extra Permit';
  const ribbonLabel = water.ribbon ? ` • ${escapeHtml(water.ribbon)}` : '';
  bar.innerHTML = `
    <div class="ht-fly-water-bar-header">
      <div>
        <div class="ht-fly-water-bar-title">✅ ${escapeHtml(water.name || 'Trout Water')}</div>
        <div class="ht-fly-water-bar-sub">Checked In${ribbonLabel} • ${stampNote}</div>
      </div>
      <button class="ht-fly-water-bar-close" type="button" onclick="closeFlyWaterActionBar()">X</button>
    </div>
    <div class="ht-fly-tray-form">
      <div class="ht-fly-tray-row">
        <div class="ht-fly-tray-label">Fishing Method</div>
        <div class="ht-method-row">
          <button class="ht-method-btn ht-method-btn--active" data-fish-method="fly" onclick="pickFishMethod(this,'fly')">🪰 Fly</button>
          <button class="ht-method-btn" data-fish-method="spin" onclick="pickFishMethod(this,'spin')">🎣 Lure</button>
          <button class="ht-method-btn" data-fish-method="bait" onclick="pickFishMethod(this,'bait')">🪱 Bait</button>
        </div>
      </div>
      <div class="ht-fly-tray-row">
        <div class="ht-fly-tray-label">Water Access</div>
        <div class="ht-method-row">
          <button class="ht-method-btn ht-method-btn--active" data-fish-wade="waders" onclick="pickFishWade(this,'waders')">🥾 Wading</button>
          <button class="ht-method-btn" data-fish-wade="streamside" onclick="pickFishWade(this,'streamside')">🏖️ Bank</button>
        </div>
      </div>
      <div class="ht-fly-tray-row">
        <div class="ht-fly-tray-label">Skill Level</div>
        <div class="ht-method-row">
          <button class="ht-method-btn" data-fish-exp="new" onclick="pickFishExp(this,'new')">🌱 New</button>
          <button class="ht-method-btn ht-method-btn--active" data-fish-exp="learning" onclick="pickFishExp(this,'learning')">📈 Learning</button>
          <button class="ht-method-btn" data-fish-exp="confident" onclick="pickFishExp(this,'confident')">💪 Confident</button>
          <button class="ht-method-btn" data-fish-exp="advanced" onclick="pickFishExp(this,'advanced')">🏆 Advanced</button>
        </div>
      </div>
      <button class="ht-fly-pill ht-fly-pill--letsgo" type="button" onclick="fishStepDeploy();closeFlyWaterActionBar();">🎣 LET'S GO</button>
    </div>
  `;
  bar.classList.add('is-visible');
}
window.showFlyCheckInForm = showFlyCheckInForm;

function getFlyPinIcon(labelText) {
  const label = String(labelText || '').trim();
  return L.divIcon({
    className: 'ht-fly-area-pin',
    html: `<div class="ht-fly-area-pill"><img class="ht-fly-area-pill-icon" src="assets/trout-logo.png" alt="">${escapeHtml(label)}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 16]
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
      iconSize: [0, 0],
      iconAnchor: [0, 16]
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
  water.access.forEach((ap) => addFlyAccessPointMarker(water, ap));
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
    showNotice('📍 ' + deployed + ' zone' + (deployed > 1 ? 's' : '') + ' deployed for ' + label + ' fishing', 'success', 2500);
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
      var anglerPos = getAnglerOffset(segment, pIdx, 25);
      anglerPinMarker = L.marker(anglerPos, {
        icon: getAnglerPinIcon(),
        zIndexOffset: 250
      }).addTo(map);
      anglerPinMarker.bindPopup(
        '<div style="min-width:180px;">' +
        '<div style="font-weight:700;color:#ffe082;font-size:13px;">🧍 Your Setup Position</div>' +
        '<div style="font-size:11px;color:#c8e6d5;margin-top:4px;line-height:1.3;">Set up here. Face the stream. Keep your shadow behind you. Start with short casts to the nearest lie, then work outward.</div>' +
        '</div>',
        { maxWidth: 260 }
      );
    }
  }

  // Zoom to zone
  map.setView([zone.lat, zone.lng], 17, { animate: true, duration: 0.8 });
  showNotice('✅ Checked in at ' + zone.name + ' — ' + numSpots + ' cast-to spots deployed', 'success', 3000);
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
