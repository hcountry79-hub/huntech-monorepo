// 
// HUNTECH  Fly Fishing Module (extracted from main.js)
// 
// Functions: isFlyModule, isTurkeyModule, getFlyWaters, fly water markers,
// fly coach panel, fly inventory, fly sessions, fly regulations,
// fly live session, fly command tray, and all window.fly* commands.
// 

function isFlyModule() {
  return Boolean(document.body && document.body.classList.contains('module-fly'));
}

function isTurkeyModule() {
  return Boolean(document.body && document.body.classList.contains('module-turkey'));
}

function getFlyWaters() {
  return Array.isArray(window.FLY_WATERS) ? window.FLY_WATERS : [];
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

function isTroutStampRequired(water) {
  const waterType = String(water?.waterType || '').toLowerCase();
  const ribbon = String(water?.ribbon || '').toLowerCase();
  if (waterType.includes('trout')) return true;
  if (waterType.includes('tailwater')) return true;
  if (ribbon.includes('trout')) return true;
  if (ribbon.includes('blue') || ribbon.includes('red') || ribbon.includes('white')) return true;
  return false;
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
  const stampRequired = isTroutStampRequired(water);
  const stampLabel = stampRequired ? 'Trout Stamp Required' : 'Trout Stamp Not Required';
  const stampPill = stampRequired ? 'Stamp Required' : 'Stamp Not Required';
  const stampClass = stampRequired ? 'ht-fly-pill ht-fly-pill--stamp' : 'ht-fly-pill ht-fly-pill--stamp ht-fly-pill--stamp-optional';
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
      <button class="ht-fly-pill ht-fly-pill--primary" type="button" onclick="addFlyWaterToSaved('${escapeHtml(water.id)}')">Add to My Trout Waters</button>
      <button class="ht-fly-pill ht-fly-pill--ghost" type="button" onclick="openFlyWaterRegulations('${escapeHtml(water.id)}')">Area Rules + Regs</button>
      <button class="${stampClass}" type="button" aria-label="${stampLabel}" disabled>${stampPill}</button>
      <button class="ht-fly-pill" type="button" onclick="flyFishNow('${escapeHtml(water.id)}')">Fish Now</button>
      <button class="ht-fly-pill" type="button" onclick="flyAddToTripPlanner('${escapeHtml(water.id)}')">Add to Trip Planner</button>
    </div>
  `;
  bar.classList.add('is-visible');
}

function getFlyPinIcon(labelText) {
  const label = String(labelText || '').trim();
  return L.divIcon({
    className: 'ht-pin-wrapper ht-pin-wrapper--fly',
    html: `
      <div class="ht-pin ht-pin--fly">
        <div class="ht-pin-inner ht-fly-pin-inner">
          <span class="ht-fly-pin-label">${escapeHtml(label)}</span>
        </div>
      </div>
    `,
    iconSize: [48, 58],
    iconAnchor: [24, 52]
  });
}

function getFlyWaterMarkerLabel(water) {
  const name = String(water?.name || '').trim();
  const lower = name.toLowerCase();
  if (lower.includes('montauk')) return 'Montauk';
  if (lower.includes('bennett') || lower.includes('bennit')) return 'Bennett';
  if (!name) return 'Water';
  const token = name.split(/\s+/)[0];
  return token || name;
}

function getFlyCustomWaters() {
  return loadSavedTroutWaters().filter((water) => water && Number.isFinite(water.lat) && Number.isFinite(water.lng));
}

function openFlyWaterPopup(marker, water) {
  if (!marker || !water) return;
  const confidence = water.confidence ? water.confidence.toUpperCase() : 'UNKNOWN';
  const popup = `
    <div style="min-width:200px;">
      <div style="font-weight:700;color:#2bd4ff;">${escapeHtml(water.name)}</div>
      <div style="font-size:12px;color:#ddd;margin-top:4px;">${escapeHtml(water.waterType || 'Public Water')} • ${escapeHtml(water.ribbon || 'General')}</div>
      <div style="font-size:11px;color:#9fb9c5;margin-top:6px;">Access: ${escapeHtml(water.access || 'Check official access points.')}</div>
      <div style="font-size:11px;color:#9fb9c5;margin-top:4px;">Solitude: ${escapeHtml(water.solitude || 'medium')} • Confidence: ${escapeHtml(confidence)}</div>
      <div style="font-size:11px;color:#7cffc7;margin-top:6px;">Use the action bar below to save, plan, or fish now.</div>
    </div>
  `;
  marker.bindPopup(popup);
  showFlyWaterActionBar(water);
  try { marker.closePopup(); } catch {}
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

function showFlyWaterMarkers() {
  clearFlyWaterLayer();
  const seen = new Set();
  getFlyWaters().forEach((water) => {
    if (!water || !water.id) return;
    seen.add(water.id);
    addFlyWaterMarker(water);
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

function showFlyCheckInZone(latlng) {
  if (!latlng || !map) return;
  if (flyCheckInAreaLayer) {
    try { map.removeLayer(flyCheckInAreaLayer); } catch {}
  }
  flyCheckInAreaLayer = L.circle(latlng, {
    radius: 140,
    color: '#2bd4ff',
    weight: 2,
    fillColor: '#2bd4ff',
    fillOpacity: 0.14
  }).addTo(map);
}

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
  const temp = Number.isFinite(snapshot.temp) ? `${snapshot.temp}F` : 'Pending';
  const wind = Number.isFinite(snapshot.wind) ? `${snapshot.wind} mph` : 'Pending';
  const windDir = snapshot.windDir || 'Pending';
  const flowCfs = Number.isFinite(flow?.flowCfs) ? `${Math.round(flow.flowCfs)} cfs` : 'Pending';
  const gageFt = Number.isFinite(flow?.gageFt) ? `${flow.gageFt.toFixed(2)} ft` : 'Pending';
  const flowSite = flow?.siteName ? `(${escapeHtml(flow.siteName)})` : '';
  const picks = getFlyInventoryRecommendations(3);
  const pickHtml = picks.length
    ? picks.map((pick) => `
        <div class="ht-fly-strategy-fly">
          <div class="ht-fly-strategy-fly-thumb">${pick.imageUrl ? `<img src="${pick.imageUrl}" alt="${escapeHtml(pick.name)}">` : 'Fly'}</div>
          <div>
            <div class="ht-fly-strategy-fly-name">${escapeHtml(pick.name)}</div>
            <div class="ht-fly-strategy-fly-meta">${escapeHtml(pick.color)} • ${escapeHtml(pick.size)}</div>
          </div>
        </div>
      `).join('')
    : '<div class="ht-fly-note">No fly box scans yet. Use Scan Fly Box to add photos.</div>';

  return `
    <div class="ht-fly-strategy-block">
      <div class="ht-fly-strategy-title">Strategy Inputs</div>
      <div class="ht-fly-strategy-row">Water: ${escapeHtml(water?.name || 'Selected Water')}</div>
      <div class="ht-fly-strategy-row">Waders: ${escapeHtml(prefs.waders)}</div>
      <div class="ht-fly-strategy-row">Rod: ${escapeHtml(prefs.rod)}</div>
      <div class="ht-fly-strategy-row">Level: ${escapeHtml(prefs.level)}</div>
    </div>
    <div class="ht-fly-strategy-block">
      <div class="ht-fly-strategy-title">Live Conditions</div>
      <div class="ht-fly-strategy-row">Temp: ${temp}</div>
      <div class="ht-fly-strategy-row">Wind: ${wind} ${windDir}</div>
      <div class="ht-fly-strategy-row">Flow: ${flowCfs} ${flowSite}</div>
      <div class="ht-fly-strategy-row">Gage: ${gageFt}</div>
    </div>
    <div class="ht-fly-strategy-block">
      <div class="ht-fly-strategy-title">Initial Approach</div>
      <div class="ht-fly-note">Start in the tailout seam, then work the inside bend slow water with short downstream casts.</div>
      <div class="ht-fly-note">Move to the boulder pocket line once the sun hits the water. Adjust depth every 3-4 drifts.</div>
    </div>
    <div class="ht-fly-strategy-block">
      <div class="ht-fly-strategy-title">Recommended Flies</div>
      <div class="ht-fly-strategy-fly-list">${pickHtml}</div>
    </div>
    <div class="ht-fly-strategy-block">
      <div class="ht-fly-strategy-title">Data Sources (Planned)</div>
      <div class="ht-fly-note">USGS NWIS (flows), NOAA NWS (weather), USGS 3DEP/LiDAR, NHD flowlines, state trout regulations.</div>
    </div>
  `;
}

function openFlyStrategyModal(water, prefs, flow) {
  openInfoModal({
    title: 'Huntech Trout Strategy',
    bodyHtml: buildFlyStrategyHtml(water, prefs, flow),
    confirmLabel: 'Close'
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
