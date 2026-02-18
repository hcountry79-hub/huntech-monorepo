// HUNTECH - Enhanced AI Shed Hunting Application
// Education-First Approach with Priority Ranking & Route Planning

let map;
let drawnItems;
let drawControl;
let currentPolygon = null;
let selectedAreaLayer = null;
let selectedAreaType = null;
let mapClickMode = null;
let radiusMilesPending = null;
let radiusDraftCenter = null;
let radiusDraftCircle = null;
let radiusDraftMoveHandler = null;
let hotspotMarkers = [];
let routeLine = null;
let routeLineGlow = null;
let startMarker = null;
let endMarker = null;
let startPoint = null;
let endPoint = null;
let startPointMarker = null;
let endPointMarker = null;
let publicLandLayer = null;
let publicLandEnabled = false;
let privateParcelsLayer = null;
let privateParcelsEnabled = false;
let shedAllowedLayer = null;
let shedUnknownLayer = null;
let shedAllowedEnabled = false;
let shedAllowedLoading = false;
let mdcLandLayer = null;
let mdcLandEnabled = false;
let mdcLandLoading = false;
let mdcLandRefreshTimer = null;
const shedAllowedCache = new Map();
const SHED_CACHE_STORAGE_KEY = 'huntech_shed_rules_cache_v1';
const SHED_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14;
let shedRefreshTimer = null;
let educationTile = null;
let locationWatchId = null;
const hotspotVisited = new Set();
const HOTSPOT_GEOFENCE_METERS = 60;
let terrainFeatureLayer = null;
let terrainFeatures = [];
const terrainFeatureVisited = new Set();
const DEFAULT_TERRAIN_SCAN_SAMPLE_SPACING_M = 80;
const DEFAULT_TERRAIN_FEATURE_GEOFENCE_M = 40;
let selectedRoutingMode = 'linear';
let customRouteClickHandler = null;
let activeWindDir = null;
let windOverlayRoot = null;
let windOverlayCanvas = null;
let windOverlayCtx = null;
let windOverlayRaf = null;
let windOverlayParticles = [];
let windOverlayVec = null; // [x,y] in screen coords, unit
let windOverlaySpeedPx = 0.8;
let activeWindSpeed = null;
let routePinOptions = [];
const HOTSPOT_WATER_AVOID_ENABLED = window.HUNTECH_WATER_AVOID !== undefined
  ? Boolean(window.HUNTECH_WATER_AVOID)
  : true;
const HOTSPOT_WATER_VARIANCE_M = Number(window.HUNTECH_WATER_VARIANCE_M || 0.9);
const HOTSPOT_WATER_SAMPLE_OFFSET_M = Number(window.HUNTECH_WATER_SAMPLE_OFFSET_M || 35);
const OSRM_MAX_WAYPOINTS = 25;
const UI_POPUPS_ENABLED = window.HUNTECH_MAP_POPUPS_ENABLED !== undefined
  ? Boolean(window.HUNTECH_MAP_POPUPS_ENABLED)
  : true;
const UI_NOTICES_ENABLED = Boolean(window.HUNTECH_NOTICES_ENABLED);
const CONTOUR_INTERVAL_FT = Number(window.HUNTECH_CONTOUR_INTERVAL_FT || 10);
const CONTOUR_CLAMP_ENABLED = window.HUNTECH_CONTOUR_CLAMP !== undefined
  ? Boolean(window.HUNTECH_CONTOUR_CLAMP)
  : true;
let toolbarOpen = true;
const ROUTE_STYLE = String(window.HUNTECH_ROUTE_STYLE || 'terrain').toLowerCase();
const DEFAULT_PUBLIC_LAND_TILE_URL = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Protected_Areas/MapServer/tile/{z}/{y}/{x}';
const DEFAULT_MDC_CONSERVATION_AREAS_URL = 'https://gisblue.mdc.mo.gov/arcgis/rest/services/Discover_Nature/MDC_Administrative_Areas/FeatureServer/5';
const DEFAULT_MDC_LOGO_URL = 'assets/mdc-logo.png';
const REG_PROXY_PATH = '/proxy?url=';
let regulationsIndex = [];
let searchResults = [];
let searchActiveIndex = -1;
let searchHighlightLayer = null;
const workflowState = {
  area: false,
  plan: false,
  route: false
};
const DEFAULT_HOTSPOT_COUNT = 12;
const HOTSPOT_MIN_SPACING_METERS = 160;
const ONBOARDING_STORAGE_KEY = 'huntech_onboarding_complete_v1';
const CALLOUT_STORAGE_KEY = 'huntech_quickstart_callout_v1';
const HUNT_AREAS_STORAGE_KEY = 'huntech_saved_hunt_areas_v1';
const HUNT_JOURNAL_STORAGE_KEY = 'huntech_hunt_journal_v1';
const HUNT_PLANS_STORAGE_KEY = 'huntech_saved_hunt_plans_v1';
const SELECTION_NOTICE_STORAGE_KEY = 'huntech_selection_notice_seen_v1';
let onboardingStepIndex = 0;
let onboardingOverlay = null;
let baseLayersControl = null;
let lidarHillshadeLayer = null;
let mdcSelectedAreaHighlight = null;
let mdcSelectedAreaPopup = null;
let huntPlanLive = false;
let huntPlanPreviewing = false;
let savedHuntAreas = [];
let huntJournalEntries = [];
let savedHuntPlans = [];
let lastPlanSnapshot = null;
let coreAreaLayer = null;
let coreAreaEnabled = false;
let coreZones = [];
let huntCriteria = {
  time: '60',
  distance: 'medium',
  fitness: 'intermediate',
  depth: 'general'
};
const onboardingSteps = [
  {
    targetId: 'defineAreaPanel',
    title: 'Define Your Area',
    body: 'Pick a hunt area first, then open Plan + Route to run the AI plan.'
  },
  {
    targetId: 'searchInput',
    title: 'Search Like Google Earth',
    body: 'Search towns, coordinates, or Missouri conservation areas to jump to public land quickly.'
  },
  {
    targetId: 'buildHuntBtn',
    title: 'Plan + Route',
    body: 'Open the plan panel to build your route after selecting an area.'
  }
];

// Educational content for different habitat types
const SHED_EDUCATION = {
  bedding: {
    priority: 1,
    title: "Bedding Area (HIGHEST PRIORITY)",
    description: "Deer spend 70% of their time resting. Bucks often shed here due to low activity and thick cover.",
    tips: "Look under cedar thickets, honeysuckle patches, and south-facing slopes. Move slowly and glass thoroughly."
  },
  transition: {
    priority: 2,
    title: "Transition Zone (HIGH PRIORITY)",
    description: "Corridors between bedding and feeding areas. Bucks travel these daily, creating shed hotspots.",
    tips: "Focus on fence crossings, creek crossings, and terrain funnels. Check both sides of obstacles."
  },
  feeding: {
    priority: 3,
    title: "Feeding Area (MEDIUM PRIORITY)",
    description: "Food sources attract deer, but they're more alert here. Sheds often found near entry/exit points.",
    tips: "Check field edges at dawn/dusk entry points. Look for scrapes and rubs nearby."
  },
  water: {
    priority: 4,
    title: "Water Source (MEDIUM-LOW PRIORITY)",
    description: "Deer visit water daily. Trails leading to water can produce sheds, especially in dry conditions.",
    tips: "Walk trails 50-100 yards from water. Check muddy areas for tracks and shed indicators."
  },
  open: {
    priority: 5,
    title: "Open Area (LOWEST PRIORITY)",
    description: "Low deer activity but can hold sheds in travel routes or near isolated cover.",
    tips: "Focus on fence lines, lone trees, and terrain changes. Don't spend too much time here."
  }
};

const HOTSPOT_FLAVOR = {
  bedding: {
    titles: ['Leeward Bedding Pocket', 'Hidden Bed Cluster', 'Thermal Cover Bowl', 'Secluded Thicket Bed', 'Wind-Safe Bedding Edge'],
    reasons: [
      'This spot sits in a quiet pocket where deer lay up once pressure builds around the perimeter.',
      'The cover here creates a natural wind break that lets deer bed with security and visibility.',
      'Sheltered terrain funnels scent uphill while keeping noise low - classic late-season bedding.',
      'Bedding here stays calm even when nearby fields see daytime activity.',
      'The tight cover and adjacent escape routes make this a high-confidence bed zone.'
    ],
    search: [
      'Sweep the downwind edge for fresh beds and hair, then grid the escape trails.',
      'Check the leeward side first and look for oval beds tucked behind brush.',
      'Glass the shadowed understory before walking it - antlers hide low.',
      'Move slow and scan for rub lines leading in and out of the cover.',
      'Follow the quietest entry trail; sheds often drop right at the first bed cluster.'
    ],
    approach: [
      'Slip in with the wind in your face and keep your silhouette below the ridge line.',
      'Use the thickest cover as your buffer and pause every few steps to scan.',
      'Approach from the least traveled side to avoid bumping deer out early.',
      'Stay low and quiet - this is a bed-to-escape transition zone.',
      'Treat this like a still-hunt: short steps, long looks.'
    ]
  },
  transition: {
    titles: ['Trail Funnel Crossing', 'Natural Pinch Gap', 'Timber-to-Field Transition', 'Creek Edge Corridor', 'Movement Saddle'],
    reasons: [
      'Multiple trails converge here, forcing deer to pass through the same narrow corridor.',
      'Terrain squeezes movement into a tight band, which increases shed drop odds.',
      'This edge is a daily travel lane between bedding and feed.',
      'The landform here channels movement around a low spot and keeps deer predictable.',
      'A subtle saddle makes this a reliable crossing when deer move with caution.'
    ],
    search: [
      'Work both sides of the pinch; sheds often fall just after the obstacle.',
      'Look for rubs at eye level and follow the freshest track line.',
      'Scan the transition line, then zig-zag across it to cover both habitats.',
      'Check trail intersections and any worn dirt where hooves polish the path.',
      'Focus on the quietest path - mature bucks avoid the obvious trail.'
    ],
    approach: [
      'Walk the corridor slowly and pause at every trail merge.',
      'Follow the path of least resistance, then sweep 20-40 yards on each side.',
      'Approach from downwind to reduce spooking bedding deer on the edges.',
      'Use cover to hide your movement while you scan the open side.',
      'Stay light on the path; most sheds are just off the main track.'
    ]
  },
  feeding: {
    titles: ['Quiet Food Edge', 'Late-Season Feed Line', 'Entry/Exit Corner', 'Protected Crop Strip', 'Browse Pocket'],
    reasons: [
      'This is a calm entry point into food where deer linger before stepping out.',
      'The edge gives deer quick cover access while they feed - prime drop zone.',
      'Tracks indicate repeated entry at this corner, which concentrates sheds.',
      'Late-season feeding pressure pushes deer to this quieter edge.',
      'The browse line here keeps deer milling and dropping antlers nearby.'
    ],
    search: [
      'Focus on the first 30 yards of cover; sheds fall before deer fully exit.',
      'Check the most sheltered corner and scan for rubs on the edge trees.',
      'Walk the edge twice: once tight to cover, once 20 yards inside.',
      'Look for feeding sign and droppings, then sweep adjacent trails.',
      'Start at the most protected entry and work outward.'
    ],
    approach: [
      'Stay inside the cover line to avoid spooking deer off the field.',
      'Move parallel to the edge and angle in only when you see sign.',
      'Approach with wind in your face and let the cover hide you.',
      'Keep a steady pace here; deer feel safer but still cautious.',
      'Scan open lanes first, then work the tighter cover.'
    ]
  },
  water: {
    titles: ['Creek Edge Cut', 'Hidden Water Crossing', 'Low Bank Funnel', 'Drainage Throat', 'Wet-Weather Corridor'],
    reasons: [
      'Deer drop antlers along water crossings where they slow down and bunch up.',
      'The bank forces a single trail, creating a high-probability travel pin.',
      'This low edge funnels movement between cover and water.',
      'A shallow crossing here keeps traffic consistent even in low pressure.',
      'Water and cover stack together here, keeping deer in a tight lane.'
    ],
    search: [
      'Check both sides of the crossing and scan the first high ground.',
      'Follow the beaten trail, then sweep for sign just off the bank.',
      'Walk the transition from wet ground to dry cover; sheds drop on the change.',
      'Look for tracks that angle off the water and into thicker cover.',
      'Grid the flat spots near the waterline where deer pause.'
    ],
    approach: [
      'Stay on the downwind side of the crossing to avoid blowing scent upstream.',
      'Move slow near the waterline; visibility is lower and sheds hide in debris.',
      'Use the bank as a natural blind while you scan the far side.',
      'Approach from the quieter bank to avoid splashing deer out early.',
      'Keep eyes on the edges where trails split.'
    ]
  },
  open: {
    titles: ['Isolated Cover Island', 'Fence-Line Travel', 'Lone Tree Draw', 'Open Slope Corridor', 'Edge-to-Edge Lane'],
    reasons: [
      'Deer cross here because it offers the shortest exposed distance.',
      'A lone feature draws movement across the open ground.',
      'This fence line funnels movement into a predictable line.',
      'The slope provides just enough cover to move confidently.',
      'This is the least-exposed line between cover blocks.'
    ],
    search: [
      'Walk the line twice and scan low; sheds are easy to miss in open grass.',
      'Check both sides of the fence line and the first cover clump.',
      'Sweep a wide arc around the lone cover feature.',
      'Focus on the low spots where deer drop their heads to climb.',
      'Grid the edge where open meets brush.'
    ],
    approach: [
      'Keep your silhouette low and move steadily across the open ground.',
      'Use any micro-cover to break up your outline.',
      'Approach from cover to cover instead of walking the centerline.',
      'Scan the open zone first, then tighten your search.',
      'Stay patient; sheds stand out in open light if you slow down.'
    ]
  }
};

function seedFromLatLng(latlng, salt) {
  const ll = latlng ? L.latLng(latlng) : L.latLng(0, 0);
  const base = Math.sin((ll.lat + 90) * 12.9898 + (ll.lng + 180) * 78.233 + (salt || '').length * 37.719) * 43758.5453;
  return base - Math.floor(base);
}

function pickBySeed(list, seed) {
  if (!Array.isArray(list) || list.length === 0) return '';
  const idx = Math.min(list.length - 1, Math.floor(Math.abs(seed) * list.length));
  return list[idx];
}

function describeRelativePosition(bounds, latlng) {
  if (!bounds || !latlng) return 'center'.toUpperCase();
  const ll = L.latLng(latlng);
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();
  const nx = (ll.lng - west) / Math.max(0.00001, east - west);
  const ny = (ll.lat - south) / Math.max(0.00001, north - south);

  const vertical = ny > 0.66 ? 'north' : ny < 0.34 ? 'south' : 'central';
  const horizontal = nx > 0.66 ? 'east' : nx < 0.34 ? 'west' : 'central';

  if (vertical === 'central' && horizontal === 'central') return 'center';
  if (vertical === 'central') return `${horizontal} edge`;
  if (horizontal === 'central') return `${vertical} edge`;
  return `${vertical}-${horizontal} pocket`;
}

function buildCustomHotspotEducation({ habitat, base, latlng, bounds, windDir, criteria }) {
  const flavor = HOTSPOT_FLAVOR[habitat] || HOTSPOT_FLAVOR.transition;
  const safeLatLng = latlng ? L.latLng(latlng) : (bounds ? bounds.getCenter() : L.latLng(0, 0));
  const seed = seedFromLatLng(safeLatLng, habitat);
  const title = pickBySeed(flavor.titles, seed);
  const reason = pickBySeed(flavor.reasons, seed + 0.13);
  const search = pickBySeed(flavor.search, seed + 0.27);
  const approach = pickBySeed(flavor.approach, seed + 0.39);
  const region = describeRelativePosition(bounds, safeLatLng);
  const wind = windDir ? `Best with ${windDir} wind.` : 'Wind-neutral setup.';
  const effort = criteria?.distance === 'short'
    ? 'Tight, efficient sweep.'
    : criteria?.distance === 'extended'
      ? 'Wider sweep worth the steps.'
      : 'Balanced sweep with smart pauses.'

  return {
    priority: base?.priority || 3,
    title: `${title} (${region})`,
    description: `${reason} ${wind}`,
    tips: `${search} ${approach}`,
    why: [reason, wind, effort],
    approach: [search, approach]
  };
}

// Initialize map
function initializeMap() {
  map = L.map('map', {
    center: [38.5, -92.5],
    zoom: 7,
    zoomControl: true
  });

  // Pane for selected MDC conservation area highlight (keep it above tile overlays)
  if (!map.getPane('mdcSelectionPane')) {
    map.createPane('mdcSelectionPane');
    map.getPane('mdcSelectionPane').style.zIndex = 650;
  }

  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxZoom: 19
  });
  const satelliteLabels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxZoom: 19,
    opacity: 0.9
  });
  const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  });
  const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap contributors',
    maxZoom: 17
  });

  const lidarUrl = (window.LIDAR_TILE_URL || '').trim();
  if (lidarUrl) {
    lidarHillshadeLayer = L.tileLayer(lidarUrl, { opacity: 0.55, maxZoom: 19, zIndex: 350 });
    lidarHillshadeLayer.on('tileerror', () => {
      showNotice('LiDAR/Hillshade overlay failed to load tiles.', 'warning', 4200);
    });
  }

  satellite.addTo(map);
  satelliteLabels.addTo(map);

  // Pre-create overlays so they show up in the Leaflet layer control
  const overlays = {
    'Satellite Labels (roads/towns)': satelliteLabels
  };

  if (lidarHillshadeLayer) {
    overlays['LiDAR / Hillshade'] = lidarHillshadeLayer;
  }

  // Public land overlay is available by default (configurable in config.js)
  try {
    const tileUrl = (window.PUBLIC_LAND_TILE_URL || DEFAULT_PUBLIC_LAND_TILE_URL || '').trim();
    if (tileUrl) {
      publicLandLayer = L.tileLayer(tileUrl, { opacity: 0.7, maxZoom: 19, zIndex: 450 });
      publicLandLayer.on('tileerror', () => {
        showNotice('Public land overlay failed to load tiles.', 'warning', 4200);
      });
      overlays['Public Land'] = publicLandLayer;
    }
  } catch {
    // Ignore overlay setup failures.
  }

  // Private parcels overlay only shows if configured
  try {
    const privateUrl = (window.PRIVATE_PARCELS_TILE_URL || '').trim();
    if (privateUrl) {
      privateParcelsLayer = L.tileLayer(privateUrl, { opacity: 0.65, maxZoom: 19, zIndex: 460 });
      privateParcelsLayer.on('tileerror', () => {
        showNotice('Private parcels overlay failed to load tiles.', 'warning', 4200);
      });
      overlays['Private Parcels'] = privateParcelsLayer;
    }
  } catch {
    // Ignore overlay setup failures.
  }

  baseLayersControl = L.control.layers({
    'Satellite': satellite,
    'Topo': topo,
    'Streets': streets
  }, overlays, { position: 'topleft', collapsed: true });
  baseLayersControl.addTo(map);

  // Keep app toggles in sync when layers are toggled from Leaflet control
  const syncLayerStateFromMap = () => {
    publicLandEnabled = Boolean(publicLandLayer && map.hasLayer(publicLandLayer));
    privateParcelsEnabled = Boolean(privateParcelsLayer && map.hasLayer(privateParcelsLayer));

    const publicToggle = document.getElementById('publicLandToggle');
    if (publicToggle) publicToggle.checked = publicLandEnabled;
    const privateToggle = document.getElementById('privateParcelsToggle');
    if (privateToggle) privateToggle.checked = privateParcelsEnabled;

    updateFilterChips();
    updateMapToggleButtons();
  };

  map.on('overlayadd', syncLayerStateFromMap);
  map.on('overlayremove', syncLayerStateFromMap);

  const gpsControl = L.control({ position: 'topleft' });
  gpsControl.onAdd = () => {
    const container = L.DomUtil.create('div', 'leaflet-bar ht-map-control');
    const button = L.DomUtil.create('button', 'ht-map-control-btn', container);
    button.type = 'button';
    button.textContent = 'Locate Me';
    button.title = 'Center on my location';
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(button, 'click', (event) => {
      L.DomEvent.stop(event);
      centerOnMyLocationInternal();
    });
    return container;
  };
  gpsControl.addTo(map);

  // Drawing controls
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems
    },
    draw: {
      polygon: true,
      rectangle: true,
      circle: false,
      marker: false,
      polyline: false,
      circlemarker: false
    }
  });

  map.on(L.Draw.Event.CREATED, function(event) {
    const layer = event.layer;
    setSelectedArea(layer, layer instanceof L.Rectangle ? 'boundary' : 'polygon');
    
    // Show area info
    if (L.GeometryUtil && layer.getLatLngs) {
      const areaSqMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      const area = (areaSqMeters * 0.000247105).toFixed(2);
      const sqft = Math.round(areaSqMeters * 10.7639);
      maybeBindPopup(layer, `<b>Area: ${area} acres (${sqft} sq ft)</b>`);
      showSelectionNoticeOnce(`Area selected: ${area} acres`, 'success', 3200);
    }
  });

  map.on('click', handleMapClick);

  map.on('draw:drawstart', function() {
    if (!shouldShowSelectionNotice()) return;
    markSelectionNoticeSeen();
    const instructionDiv = document.createElement('div');
    instructionDiv.id = 'drawing-instructions';
    instructionDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.95);color:#FFD700;padding:30px 50px;border-radius:15px;z-index:10000;font-size:18px;border:3px solid #FFD700;box-shadow:0 0 30px rgba(255,215,0,0.5);text-align:center;max-width:500px;';
    instructionDiv.innerHTML = `
      <h2 style="margin:0 0 15px 0;color:#FFD700;font-size:24px;"> Drawing Hunt Area</h2>
      <p style="margin:10px 0;font-size:16px;line-height:1.6;">
        <strong>Click points</strong> on the map to outline your hunting area.<br/>
        <strong>Double-click</strong> the last point to finish.<br/>
        OR click back on the <strong>starting point</strong> to close the shape.
      </p>
      <button onclick="this.parentElement.remove()" style="margin-top:15px;padding:10px 25px;background:#FFD700;color:#000;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Got It!</button>
    `;
    document.body.appendChild(instructionDiv);

    setTimeout(() => {
      const existing = document.getElementById('drawing-instructions');
      if (existing) existing.remove();
    }, 8000);
  });

  map.on('draw:drawstop', function() {
    const instructionDiv = document.getElementById('drawing-instructions');
    if (instructionDiv) instructionDiv.remove();
  });

  map.on('moveend', () => {
    if (!shedAllowedEnabled) return;
    if (shedRefreshTimer) clearTimeout(shedRefreshTimer);
    shedRefreshTimer = setTimeout(() => {
      enableShedAllowedLayer();
    }, 400);
  });

  map.on('moveend', () => {
    if (!mdcLandEnabled) return;
    if (mdcLandRefreshTimer) clearTimeout(mdcLandRefreshTimer);
    mdcLandRefreshTimer = setTimeout(() => {
      enableMdcLandLayer();
    }, 450);
  });
}

function setStrategyOpen(isOpen) {
  document.body.classList.toggle('ht-strategy-open', Boolean(isOpen));
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) return;
  if (isOpen) {
    toolbar.classList.add('collapsed');
    toolbarOpen = false;
    const icon = document.getElementById('toggleIcon');
    if (icon) icon.textContent = '';
  }

  // Avoid leaving an empty dropdown visible (the "black box" under the search bar).
  try {
    const resultsEl = document.getElementById('searchResults');
    if (resultsEl) {
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
    }
  } catch {
    // Ignore.
  }
}

function updateTrayToggleButton() {
  const btn = document.getElementById('trayToggleBtn');
  if (!btn) return;

  const strategyPanel = document.getElementById('strategy-panel');
  if (strategyPanel) {
    const isVisible = strategyPanel.style.display !== 'none';
    btn.textContent = isVisible ? 'CLOSE PANEL' : 'OPEN PANEL';
    return;
  }

  const toolbar = document.getElementById('toolbar');
  const isCollapsed = toolbar ? toolbar.classList.contains('collapsed') : false;
  btn.textContent = isCollapsed ? 'OPEN PANEL' : 'CLOSE PANEL';
}

window.toggleTray = function() {
  // Prefer toggling the Plan + Route panel when it exists.
  const strategyPanel = document.getElementById('strategy-panel');
  if (strategyPanel) {
    const isVisible = strategyPanel.style.display !== 'none';
    if (isVisible) {
      strategyPanel.style.display = 'none';
      setStrategyOpen(false);
    } else {
      strategyPanel.style.display = 'block';
      setStrategyOpen(true);
    }
    updateTrayToggleButton();
    return;
  }

  // Otherwise toggle the Field Command tray.
  window.toggleToolbar();
  updateTrayToggleButton();
};

function getBrandedPinIcon(labelText) {
  const safe = String(labelText ?? '').slice(0, 3);
  return L.divIcon({
    className: 'ht-pin-wrapper',
    html: `<div class="ht-pin"><div class="ht-pin-inner">${safe}</div></div>`,
    iconSize: [28, 38],
    iconAnchor: [14, 34]
  });
}

function createBrandedHotspotMarker(hotspot) {
  const rank = hotspot?.rank ?? hotspot?.priority ?? 1;
  const marker = L.marker(hotspot.coords, {
    icon: getBrandedPinIcon(String(rank))
  }).addTo(map);

  marker.__hotspotData = hotspot;
  marker.on('click', () => {
    focusMarker(marker);
    showEducationTile(hotspot, 'Pin selected.');
  });

  return marker;
}

function focusMarker(marker) {
  if (!marker || typeof marker.getElement !== 'function') return;
  const el = marker.getElement();
  if (!el) return;
  el.classList.add('ht-pin--pulse');
  setTimeout(() => el.classList.remove('ht-pin--pulse'), 1200);
}

async function isLikelyWaterCandidate(latlng) {
  if (!HOTSPOT_WATER_AVOID_ENABLED) return false;
  const endpoint = String(window.ELEVATION_API_URL || '').trim();
  if (!endpoint) return false;

  const center = L.latLng(latlng);
  const offset = Math.max(15, HOTSPOT_WATER_SAMPLE_OFFSET_M);
  const samples = [
    center,
    offsetLatLngMeters(center, offset, 0),
    offsetLatLngMeters(center, -offset, 0),
    offsetLatLngMeters(center, 0, offset),
    offsetLatLngMeters(center, 0, -offset)
  ];

  try {
    const elevs = await fetchElevationsForPoints(samples);
    const values = elevs.filter((v) => Number.isFinite(v));
    if (values.length < 3) return false;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return (max - min) <= HOTSPOT_WATER_VARIANCE_M;
  } catch {
    return false;
  }
}

function loadRegulationsIndex() {
  if (Array.isArray(window.PUBLIC_LAND_RULES)) {
    regulationsIndex = window.PUBLIC_LAND_RULES;
    return;
  }

  regulationsIndex = [];
}

function loadShedCache() {
  try {
    const raw = localStorage.getItem(SHED_CACHE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([key, value]) => {
      shedAllowedCache.set(key, value);
    });
  } catch (error) {
    // Ignore cache failures.
  }
}

function saveShedCache() {
  try {
    const obj = {};
    shedAllowedCache.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(SHED_CACHE_STORAGE_KEY, JSON.stringify(obj));
  } catch (error) {
    // Ignore cache failures.
  }
}

function getRulesForLocation(latlng) {
  if (!latlng || regulationsIndex.length === 0) return [];

  return regulationsIndex.filter(rule => {
    if (!rule || !rule.bounds) return false;
    const b = rule.bounds;
    return latlng.lat >= b.south && latlng.lat <= b.north && latlng.lng >= b.west && latlng.lng <= b.east;
  });
}

function getRulesForSelectedArea() {
  if (!selectedAreaLayer || regulationsIndex.length === 0) return [];
  const bounds = getSelectedAreaBounds();
  if (!bounds) return [];

  return regulationsIndex.filter(rule => {
    if (!rule || !rule.bounds) return false;
    const b = rule.bounds;
    const ruleBounds = L.latLngBounds([b.south, b.west], [b.north, b.east]);
    return bounds.intersects(ruleBounds);
  });
}

async function fetchMdcAreaRules(bounds) {
  if (!bounds) return [];
  const url = window.MDC_CONSERVATION_AREAS_URL || DEFAULT_MDC_CONSERVATION_AREAS_URL;
  const xmin = bounds.getWest();
  const ymin = bounds.getSouth();
  const xmax = bounds.getEast();
  const ymax = bounds.getNorth();
  const queryUrl = `${url}/query?f=json&where=1%3D1&geometry=${xmin},${ymin},${xmax},${ymax}` +
    `&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects` +
    `&outFields=Area_Name,OFF_Name,Reg_Link,Sum_Link,Map_Link,County,Acreage&returnGeometry=false`;

  const data = await fetchMdcJson(queryUrl);
  if (!data || !Array.isArray(data.features)) return [];
  return data.features.map(feature => feature.attributes).filter(Boolean);
}

async function showAreaRules() {
  if (!UI_POPUPS_ENABLED) return;
  const tile = ensureEducationTile();
  tile.innerHTML = `
    ${renderMdcTileHeader('Area Rules')}
    <p style="margin:8px 0;font-size:13px;line-height:1.4;">Loading Missouri conservation area rules...</p>
  `;
  tile.style.display = 'block';

  const areaBounds = selectedAreaLayer ? getSelectedAreaBounds() : map.getBounds();
  let mdcAreas = [];

  try {
    mdcAreas = await fetchMdcAreaRules(areaBounds);
  } catch (error) {
    mdcAreas = [];
  }

  if (mdcAreas.length > 0) {
    const cards = mdcAreas.map(area => {
      const name = area.OFF_Name || area.Area_Name || 'MDC Conservation Area';
      const regsLink = area.Reg_Link ? `<a href="${area.Reg_Link}" target="_blank" rel="noopener">Regulations</a>` : '';
      const summaryLink = area.Sum_Link ? `<a href="${area.Sum_Link}" target="_blank" rel="noopener">Summary</a>` : '';
      const mapLink = area.Map_Link ? `<a href="${area.Map_Link}" target="_blank" rel="noopener">Area Map</a>` : '';
      const links = [summaryLink, regsLink, mapLink].filter(Boolean).join(' | ');
      const county = area.County ? `County: ${area.County}` : '';
      const acreage = area.Acreage ? `Acreage: ${Number(area.Acreage).toLocaleString()} acres` : '';
      const meta = [county, acreage].filter(Boolean).join(' | ');

      return `
        <div style="margin:10px 0;padding:10px;background:#111;border-left:3px solid #FFD700;font-size:12px;">
          <div style="font-weight:bold;color:#FFD700;">${name}</div>
          ${meta ? `<div style=\"margin-top:6px;color:#AAA;\">${meta}</div>` : ''}
          ${links ? `<div style=\"margin-top:6px;\">${links}</div>` : ''}
        </div>
      `;
    }).join('');

    tile.innerHTML = `
      ${renderMdcTileHeader('Area Rules')}
      ${cards}
    `;
    return;
  }

  const rules = selectedAreaLayer ? getRulesForSelectedArea() : getRulesForLocation(map.getCenter());

  if (rules.length === 0) {
    tile.innerHTML = `
      ${renderMdcTileHeader('Area Rules')}
      <p style="margin:8px 0;font-size:13px;line-height:1.4;">
        No rules are configured for this area yet. Add Missouri unit rules in
        <strong>regulations.js</strong> to enable automatic guidance.
      </p>
    `;
    tile.style.display = 'block';
    return;
  }

  const cards = rules.map(rule => `
    <div style="margin:10px 0;padding:10px;background:#111;border-left:3px solid #FFD700;font-size:12px;">
      <div style="font-weight:bold;color:#FFD700;">${rule.areaName}</div>
      <div style="margin-top:6px;">${rule.summary}</div>
      <div style="margin-top:6px;color:#AAA;">${rule.source}</div>
    </div>
  `).join('');

  tile.innerHTML = `
    ${renderMdcTileHeader('Area Rules')}
    ${cards}
  `;
  tile.style.display = 'block';
}

async function showMdcAreaSummary(feature) {
  if (!UI_POPUPS_ENABLED) return;
  if (!feature) return;
  const attrs = feature.attributes || {};
  const logo = getMdcLogoMarkup();
  const name = escapeHtml(attrs.OFF_Name || attrs.Area_Name || 'MDC Conservation Area');
  const county = attrs.County ? `County: ${escapeHtml(attrs.County)}` : '';
  const region = attrs.Region ? `Region: ${escapeHtml(attrs.Region)}` : '';
  const acreage = formatAcreage(attrs.Acreage);
  const publicSite = attrs.Public_Site ? `Public: ${escapeHtml(attrs.Public_Site)}` : '';
  const meta = [county, region, publicSite, acreage].filter(Boolean).join(' | ');
  const regsLink = attrs.Reg_Link || '';
  const summaryLink = attrs.Sum_Link || '';
  const mapLink = attrs.Map_Link || '';
  const brochureLink = attrs.Brochure_Link || '';
  const admin = attrs.Division_Admin ? `Managed by: ${escapeHtml(attrs.Division_Admin)}` : '';

  const tile = ensureEducationTile();
  tile.innerHTML = `
    ${renderMdcTileHeader('MDC Area Brief')}
    <div class="ht-mdc-area-name">${name}</div>
    ${meta ? `<div class="ht-mdc-meta">${meta}</div>` : ''}
    ${admin ? `<div class="ht-mdc-meta">${admin}</div>` : ''}
    <div class="ht-mdc-actions">
      ${regsLink ? `<a class="ht-mdc-btn ht-mdc-btn-primary" href="${regsLink}" target="_blank" rel="noopener">${logo}<span>Local Regulations</span></a>` : `<span class="ht-mdc-btn ht-mdc-btn-disabled">${logo}<span>Local Regulations</span></span>`}
      ${summaryLink ? `<a class="ht-mdc-btn" href="${summaryLink}" target="_blank" rel="noopener">${logo}<span>Area Summary</span></a>` : ''}
      ${mapLink ? `<a class="ht-mdc-btn" href="${mapLink}" target="_blank" rel="noopener">${logo}<span>Amenities Map</span></a>` : ''}
      ${brochureLink ? `<a class="ht-mdc-btn" href="${brochureLink}" target="_blank" rel="noopener">${logo}<span>Brochure</span></a>` : ''}
    </div>
    <div class="ht-mdc-advanced">
      <button class="ht-mdc-advanced-btn" onclick="showAreaRules()">Advanced area rules</button>
      <div class="ht-mdc-subtle">Trails, restrooms, boat ramps, and parking are listed in the MDC map and area summary.</div>
    </div>
  `;
  tile.style.display = 'block';
}

function setSelectedArea(layer, type) {
  if (selectedAreaLayer) {
    map.removeLayer(selectedAreaLayer);
    if (drawnItems && drawnItems.hasLayer(selectedAreaLayer)) {
      drawnItems.removeLayer(selectedAreaLayer);
    }
  }

  selectedAreaLayer = layer;
  selectedAreaType = type;
  currentPolygon = layer;

  if (layer && drawnItems && !drawnItems.hasLayer(layer)) {
    drawnItems.addLayer(layer);
  }
}

function openCriteriaPanel() {
  const panel = document.getElementById('huntCriteriaPanel');
  if (!panel) return;
  panel.open = true;
  try {
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch {
    panel.scrollIntoView();
  }
}

function getHuntCriteriaFromUI() {
  const time = document.getElementById('criteriaTime')?.value || huntCriteria.time;
  const distance = document.getElementById('criteriaDistance')?.value || huntCriteria.distance;
  const fitness = document.getElementById('criteriaFitness')?.value || huntCriteria.fitness;
  const depth = document.getElementById('criteriaDepth')?.value || huntCriteria.depth;

  return {
    time,
    distance,
    fitness,
    depth
  };
}

function getHotspotCountFromCriteria(criteria) {
  const timeMap = {
    '30': 7,
    '60': 10,
    '90': 14,
    '120': 18
  };

  const base = timeMap[String(criteria?.time || '')] || DEFAULT_HOTSPOT_COUNT;
  let total = base;
  if (criteria?.depth === 'medium') total += 2;
  if (criteria?.depth === 'deep') total += 5;
  if (criteria?.distance === 'short') total = Math.max(6, total - 2);
  if (criteria?.distance === 'extended') total += 3;
  return total;
}

function buildHabitatPool(criteria) {
  const basePool = ['bedding', 'transition', 'transition', 'bedding', 'feeding', 'feeding', 'water', 'open'];
  return basePool;
}

function loadSavedHuntAreas() {
  try {
    const raw = localStorage.getItem(HUNT_AREAS_STORAGE_KEY);
    savedHuntAreas = raw ? JSON.parse(raw) : [];
  } catch {
    savedHuntAreas = [];
  }
  renderSavedHuntAreas();
}

function loadHuntJournal() {
  try {
    const raw = localStorage.getItem(HUNT_JOURNAL_STORAGE_KEY);
    huntJournalEntries = raw ? JSON.parse(raw) : [];
  } catch {
    huntJournalEntries = [];
  }
}

function loadHuntPlans() {
  try {
    const raw = localStorage.getItem(HUNT_PLANS_STORAGE_KEY);
    savedHuntPlans = raw ? JSON.parse(raw) : [];
  } catch {
    savedHuntPlans = [];
  }
}

function saveHuntJournal() {
  try {
    localStorage.setItem(HUNT_JOURNAL_STORAGE_KEY, JSON.stringify(huntJournalEntries));
  } catch {
    // Ignore storage failures.
  }
}

function saveHuntPlans() {
  try {
    localStorage.setItem(HUNT_PLANS_STORAGE_KEY, JSON.stringify(savedHuntPlans));
  } catch {
    // Ignore storage failures.
  }
}

function clearScoutingLayer() {
  if (coreAreaLayer) map.removeLayer(coreAreaLayer);
  coreAreaLayer = null;
  coreZones = [];
}

function toggleScoutingLayer(forceState) {
  const nextState = typeof forceState === 'boolean' ? forceState : !coreAreaEnabled;
  coreAreaEnabled = nextState;
  if (coreAreaEnabled && coreAreaLayer) {
    coreAreaLayer.addTo(map);
  } else if (!coreAreaEnabled && coreAreaLayer) {
    map.removeLayer(coreAreaLayer);
  }

  const btn = document.getElementById('scoutingToggleBtn');
  if (btn) btn.textContent = `${coreAreaEnabled ? 'Hide' : 'Show'} Core Buck Zones`;
}

function createScoutingLayer(bounds, criteria, windDir) {
  clearScoutingLayer();
  if (!bounds) return;

  const depth = criteria?.depth || 'general';
  if (depth === 'general') return;

  const count = depth === 'deep' ? 8 : 4;
  const group = L.layerGroup();
  coreZones = [];
  const zoneTypes = [
    'Leeward Bedding Ridge',
    'Thermal Pocket',
    'North Slope Sanctuary',
    'Creek Crossing Funnel',
    'Thick Cover Island',
    'Edge Transition Lane'
  ];
  const terrainTypes = ['Ridge', 'Bench', 'Draw', 'Saddle', 'Bottom', 'Edge'];
  const coverTypes = ['Cedar thicket', 'Honeysuckle', 'CRP edge', 'Pine stand', 'Brushy cut', 'Hardwood understory'];
  const pressureLevels = ['Low pressure', 'Moderate pressure', 'Low pressure', 'Very low pressure'];
  const winds = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const bestWind = windDir || winds[Math.floor(Math.random() * winds.length)];

  for (let i = 0; i < count; i++) {
    const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
    const lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());
    const center = L.latLng(lat, lng);

    const radius = depth === 'deep' ? 220 : 150;
    const scoreBase = depth === 'deep' ? 86 : 78;
    const score = Math.min(98, Math.round(scoreBase + Math.random() * 10));
    const zoneType = zoneTypes[i % zoneTypes.length];
    const terrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
    const cover = coverTypes[Math.floor(Math.random() * coverTypes.length)];
    const pressure = pressureLevels[Math.floor(Math.random() * pressureLevels.length)];
    const access = depth === 'deep'
      ? 'Low pressure access via cover and terrain breaks.'
      : 'Moderate access. Watch wind and noise on approach.'
    const sign = depth === 'deep'
      ? 'Heavy rub line, clustered beds, fresh trails.'
      : 'Active trails, secondary sign, travel funnels.'
    const windText = `Best on ${bestWind} wind.`;
    const zone = {
      id: `core_${Date.now()}_${i}`,
      type: zoneType,
      score,
      radius,
      coords: [center.lat, center.lng],
      wind: bestWind,
      terrain,
      cover,
      pressure,
      access,
      sign
    };
    coreZones.push(zone);

    const circle = L.circle(center, {
      radius,
      color: '#ffb300',
      weight: 2,
      fillColor: '#ffd24d',
      fillOpacity: 0.12
    });
    maybeBindPopup(circle, `
      <div style="font-family:Arial;max-width:220px;">
        <strong>${zoneType}</strong><br/>
        <span style="font-size:12px;color:#333;">Score ${score}/100 • ${windText}</span><br/>
        <span style="font-size:12px;color:#333;">Terrain: ${terrain} • Cover: ${cover}</span><br/>
        <span style="font-size:12px;color:#333;">${pressure}</span><br/>
        <span style="font-size:12px;color:#333;">${sign}</span><br/>
        <span style="font-size:12px;color:#333;">${access}</span>
      </div>
    `);
    group.addLayer(circle);

    const label = L.marker(center, {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:#ffb300;color:#000;padding:4px 8px;border-radius:10px;font-weight:800;font-size:11px;border:2px solid #000;">CORE</div>'
      })
    });
    group.addLayer(label);
  }

  coreAreaLayer = group;
  if (coreAreaEnabled) coreAreaLayer.addTo(map);
}

function buildScoutingLayerFromZones(zones) {
  clearScoutingLayer();
  if (!Array.isArray(zones) || !zones.length) return;
  const group = L.layerGroup();
  coreZones = zones.map((z, idx) => ({
    id: z.id || `core_saved_${idx}`,
    type: z.type,
    score: z.score,
    coords: z.coords,
    wind: z.wind,
    radius: z.radius,
    terrain: z.terrain,
    cover: z.cover,
    pressure: z.pressure,
    access: z.access || 'Saved plan zone.',
    sign: z.sign || 'Core zone from saved plan.'
  }));

  coreZones.forEach((zone) => {
    const center = L.latLng(zone.coords[0], zone.coords[1]);
    const circle = L.circle(center, {
      radius: zone.radius || 180,
      color: '#ffb300',
      weight: 2,
      fillColor: '#ffd24d',
      fillOpacity: 0.12
    });
    maybeBindPopup(circle, `
      <div style="font-family:Arial;max-width:220px;">
        <strong>${zone.type}</strong><br/>
        <span style="font-size:12px;color:#333;">Score ${zone.score}/100 • Best on ${zone.wind} wind</span><br/>
        <span style="font-size:12px;color:#333;">Terrain: ${zone.terrain || 'Mixed'} • Cover: ${zone.cover || 'Mixed'}</span><br/>
        <span style="font-size:12px;color:#333;">${zone.pressure || 'Low pressure'}</span><br/>
        <span style="font-size:12px;color:#333;">${zone.sign || 'Core sign present'} • ${zone.access || 'Plan access'}</span>
      </div>
    `);
    group.addLayer(circle);
  });

  coreAreaLayer = group;
  if (coreAreaEnabled) coreAreaLayer.addTo(map);
}

function saveHuntAreas() {
  try {
    localStorage.setItem(HUNT_AREAS_STORAGE_KEY, JSON.stringify(savedHuntAreas));
  } catch {
    // Ignore storage failures.
  }
}

function renderSavedHuntAreas() {
  const list = document.getElementById('savedHuntAreasList');
  if (!list) return;

  if (!savedHuntAreas.length) {
    list.innerHTML = '<div style="font-size:12px;color:#aaa;">No saved areas yet.</div>';
    return;
  }

  list.innerHTML = savedHuntAreas.map((item) => {
    const label = item.kind === 'pin' ? 'Pin' : 'Area';
    return `
      <div class="ht-saved-item">
        <div><strong>${item.name}</strong><span style="color:#aaa;"> • ${label}</span></div>
        <div class="ht-saved-actions">
          <button class="ht-saved-btn" data-action="go" data-id="${item.id}">Go</button>
          <button class="ht-saved-btn" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (action === 'go') applySavedHuntArea(id);
      if (action === 'remove') removeSavedHuntArea(id);
    });
  });

  renderSavedPropertiesSelect();
}

function renderSavedPropertiesSelect() {
  const select = document.getElementById('savedPropertySelect');
  if (!select) return;

  const areas = savedHuntAreas.filter((item) => {
    if (item.kind === 'pin') return false;
    return Boolean(item.areaType || item.latlngs || item.center);
  });
  if (!areas.length) {
    select.innerHTML = '<option value="">No saved hunt areas yet</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  select.innerHTML = ['<option value="">Select saved hunt area</option>']
    .concat(
      areas.map((item) => `<option value="${item.id}">${item.name}</option>`)
    )
    .join('');
}

function applySavedHuntArea(id) {
  const item = savedHuntAreas.find((entry) => entry.id === id);
  if (!item) return;

  if (item.kind === 'pin') {
    const latlng = L.latLng(item.coords[0], item.coords[1]);
    L.marker(latlng, { icon: getBrandedPinIcon('S') }).addTo(map);
    map.setView(latlng, 15);
    showNotice(`Loaded pin: ${item.name}`, 'success', 3200);
    return;
  }

  let layer = null;
  if (item.areaType === 'radius') {
    layer = L.circle(item.center, {
      radius: item.radius,
      color: '#FFD700',
      weight: 2,
      fillColor: '#FFD700',
      fillOpacity: 0.12
    }).addTo(map);
  } else if (item.latlngs) {
    layer = L.polygon(item.latlngs, {
      color: '#FFD700',
      weight: 2,
      fillColor: '#FFD700',
      fillOpacity: 0.12
    }).addTo(map);
  }

  if (layer) {
    setSelectedArea(layer, item.areaType || 'polygon');
    map.fitBounds(layer.getBounds(), { padding: [40, 40] });
    showNotice(`Loaded area: ${item.name}`, 'success', 3200);
  }
}

function removeSavedHuntArea(id) {
  savedHuntAreas = savedHuntAreas.filter((entry) => entry.id !== id);
  saveHuntAreas();
  renderSavedHuntAreas();
}

window.saveSelectedArea = function() {
  if (!selectedAreaLayer) {
    showNotice('Select or draw an area first.', 'warning', 3200);
    return;
  }

  openInputModal({
    title: 'Save Hunt Area',
    message: 'Name this area for quick access later.',
    placeholder: 'Example: South Creek Ridge',
    confirmLabel: 'Save Area',
    onSubmit: (name) => {
      if (!name) return;
      const id = `area_${Date.now()}`;
      let payload = { id, name, kind: 'area', areaType: selectedAreaType || 'polygon' };

      if (selectedAreaType === 'radius' && selectedAreaLayer.getLatLng) {
        payload = {
          ...payload,
          center: [selectedAreaLayer.getLatLng().lat, selectedAreaLayer.getLatLng().lng],
          radius: selectedAreaLayer.getRadius()
        };
      } else if (selectedAreaLayer.getLatLngs) {
        const latlngs = selectedAreaLayer.getLatLngs();
        const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
        payload = {
          ...payload,
          latlngs: ring.map((point) => [point.lat, point.lng])
        };
      }

      savedHuntAreas.unshift(payload);
      saveHuntAreas();
      renderSavedHuntAreas();
      showNotice('Hunt area saved.', 'success', 3200);
    }
  });
};

window.startSavePin = function() {
  mapClickMode = 'save-pin';
  showNotice('Click the map to drop a saved pin.', 'info', 3200);
};

function clearSelectedArea() {
  if (selectedAreaLayer) {
    map.removeLayer(selectedAreaLayer);
    if (drawnItems && drawnItems.hasLayer(selectedAreaLayer)) {
      drawnItems.removeLayer(selectedAreaLayer);
    }
  }
  selectedAreaLayer = null;
  selectedAreaType = null;
  currentPolygon = null;
}

function clearRadiusDraft() {
  if (radiusDraftMoveHandler) {
    try { map.off('mousemove', radiusDraftMoveHandler); } catch {}
    try { map.off('touchmove', radiusDraftMoveHandler); } catch {}
    radiusDraftMoveHandler = null;
  }
  if (radiusDraftCircle) {
    try { map.removeLayer(radiusDraftCircle); } catch {}
    radiusDraftCircle = null;
  }
  radiusDraftCenter = null;
}

function startRadiusDraft(centerLatLng) {
  clearRadiusDraft();
  if (centerLatLng) {
    radiusDraftCenter = L.latLng(centerLatLng);
    radiusDraftCircle = L.circle(radiusDraftCenter, {
      radius: 50,
      color: '#FFD700',
      weight: 2,
      fillColor: '#FFD700',
      fillOpacity: 0.15
    }).addTo(map);
  }

  radiusDraftMoveHandler = (evt) => {
    if (!radiusDraftCenter || !radiusDraftCircle) return;
    const meters = Math.max(10, radiusDraftCenter.distanceTo(evt.latlng));
    radiusDraftCircle.setRadius(meters);
  };
  map.on('mousemove', radiusDraftMoveHandler);
  map.on('touchmove', radiusDraftMoveHandler);
}

function handleMapClick(e) {
  if (!mapClickMode) return;

  if (mapClickMode === 'radius-draw') {
    if (!radiusDraftCenter) {
      radiusDraftCenter = L.latLng(e.latlng);
      startRadiusDraft(radiusDraftCenter);
      showNotice('Drag outward to size your radius, then click to lock it.', 'info', 4200);
      return;
    }

    if (radiusDraftCircle) {
      if (radiusDraftMoveHandler) {
        try { map.off('mousemove', radiusDraftMoveHandler); } catch {}
        try { map.off('touchmove', radiusDraftMoveHandler); } catch {}
        radiusDraftMoveHandler = null;
      }
      setSelectedArea(radiusDraftCircle, 'radius');
      const radiusMiles = radiusDraftCircle.getRadius() / 1609.34;
      radiusDraftCircle = null;
      radiusDraftCenter = null;
      mapClickMode = null;
      showSelectionNoticeOnce(`Radius set: ${radiusMiles.toFixed(2)} miles`, 'success', 3200);
      return;
    }
  }

  if (mapClickMode === 'parcel') {
    const bounds = e.latlng.toBounds(350);
    const rect = L.rectangle(bounds, {
      color: '#FFD700',
      weight: 2,
      fillColor: '#FFD700',
      fillOpacity: 0.12
    }).addTo(map);
    setSelectedArea(rect, 'boundary');
    mapClickMode = null;
    showSelectionNoticeOnce('Parcel boundary locked. Adjust with Draw Area if needed.', 'success', 3200);
    return;
  }

  if (mapClickMode === 'start') {
    setStartPoint(e.latlng);
    mapClickMode = null;
    return;
  }

  if (mapClickMode === 'end') {
    setEndPoint(e.latlng);
    mapClickMode = null;
  }

  if (mapClickMode === 'save-pin') {
    mapClickMode = null;
    openInputModal({
      title: 'Save Map Pin',
      message: 'Name this pin for quick access later.',
      placeholder: 'Example: Fence Crossing',
      confirmLabel: 'Save Pin',
      onSubmit: (name) => {
        if (!name) return;
        const id = `pin_${Date.now()}`;
        savedHuntAreas.unshift({
          id,
          name,
          kind: 'pin',
          coords: [e.latlng.lat, e.latlng.lng]
        });
        saveHuntAreas();
        renderSavedHuntAreas();
        L.marker(e.latlng, { icon: getBrandedPinIcon('S') }).addTo(map);
        showNotice('Pin saved.', 'success', 3200);
      }
    });
  }
}

function setStartPoint(latlng) {
  startPoint = latlng;
  if (startPointMarker) map.removeLayer(startPointMarker);
  startPointMarker = L.marker(latlng, {
    icon: L.divIcon({
      html: '<div style="background:#00FF00;color:#000;padding:8px 12px;border-radius:20px;font-weight:bold;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.4);">START</div>',
      className: ''
    })
  }).addTo(map);
}

function setEndPoint(latlng) {
  endPoint = latlng;
  if (endPointMarker) map.removeLayer(endPointMarker);
  endPointMarker = L.marker(latlng, {
    icon: L.divIcon({
      html: '<div style="background:#FF0000;color:#fff;padding:8px 12px;border-radius:20px;font-weight:bold;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.4);">END</div>',
      className: ''
    })
  }).addTo(map);
}

function clearStartPointSelection() {
  startPoint = null;
  if (startPointMarker) {
    map.removeLayer(startPointMarker);
    startPointMarker = null;
  }
}

function clearEndPointSelection() {
  endPoint = null;
  if (endPointMarker) {
    map.removeLayer(endPointMarker);
    endPointMarker = null;
  }
}

function buildRoutePinOptions(hotspots) {
  const safe = Array.isArray(hotspots) ? hotspots : [];
  routePinOptions = safe.map((hotspot, index) => {
    const rank = hotspot?.rank ?? index + 1;
    const title = hotspot?.education?.title || 'Hotspot';
    const coords = hotspot?.coords || null;
    return {
      id: String(hotspot?.id || `route_pin_${index}`),
      label: `Pin ${rank}: ${title}`,
      coords
    };
  }).filter((item) => Array.isArray(item.coords) && item.coords.length === 2);
  return routePinOptions;
}

function findRoutePinById(id) {
  if (!id) return null;
  return routePinOptions.find((opt) => opt.id === id) || null;
}

function findRoutePinIdByPoint(point) {
  if (!point || !routePinOptions.length) return '';
  const target = L.latLng(point);
  let best = null;
  let bestDist = Infinity;
  for (const opt of routePinOptions) {
    const ll = L.latLng(opt.coords[0], opt.coords[1]);
    const dist = target.distanceTo(ll);
    if (dist < bestDist) {
      bestDist = dist;
      best = opt;
    }
  }
  return bestDist <= 12 ? best.id : '';
}

window.setRouteStartFromPin = function(value) {
  if (!value) {
    clearStartPointSelection();
    return;
  }
  const pin = findRoutePinById(value);
  if (!pin) return;
  setStartPoint(L.latLng(pin.coords[0], pin.coords[1]));
};

window.setRouteEndFromPin = function(value) {
  if (!value) {
    clearEndPointSelection();
    return;
  }
  const pin = findRoutePinById(value);
  if (!pin) return;
  setEndPoint(L.latLng(pin.coords[0], pin.coords[1]));
};

function getSelectedAreaBounds() {
  if (!selectedAreaLayer) return null;
  if (selectedAreaLayer.getBounds) return selectedAreaLayer.getBounds();
  return null;
}

function isPointInSelectedArea(latlng) {
  if (!selectedAreaLayer) return false;
  if (selectedAreaType === 'radius' && selectedAreaLayer.getLatLng) {
    const center = selectedAreaLayer.getLatLng();
    const radius = selectedAreaLayer.getRadius();
    return center.distanceTo(latlng) <= radius;
  }

  if (selectedAreaLayer instanceof L.Rectangle && selectedAreaLayer.getBounds) {
    return selectedAreaLayer.getBounds().contains(latlng);
  }

  if (selectedAreaLayer instanceof L.Polygon && selectedAreaLayer.getLatLngs) {
    const raw = selectedAreaLayer.getLatLngs();
    if (!Array.isArray(raw) || raw.length === 0) return false;

    // Leaflet polygon latlng structure can be:
    // - [LatLng, LatLng, ...]
    // - [[LatLng...]]
    // - [[[LatLng...]], [[LatLng...]]] (multi)
    const normalizeOuterRings = (latlngs) => {
      if (!Array.isArray(latlngs)) return [];
      if (latlngs.length === 0) return [];
      if (!Array.isArray(latlngs[0])) return [latlngs];
      if (Array.isArray(latlngs[0]) && latlngs[0].length > 0 && !Array.isArray(latlngs[0][0])) return [latlngs[0]];
      // multi polygon: pick first ring of each polygon
      return latlngs.map((poly) => (Array.isArray(poly) && Array.isArray(poly[0]) ? poly[0] : [])).filter((ring) => ring.length);
    };

    const rings = normalizeOuterRings(raw);

    const containsRing = (ring, point) => {
      if (!Array.isArray(ring) || ring.length < 3) return false;
      let inside = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i].lng;
        const yi = ring[i].lat;
        const xj = ring[j].lng;
        const yj = ring[j].lat;
        const intersects = ((yi > point.lat) !== (yj > point.lat)) &&
          (point.lng < (xj - xi) * (point.lat - yi) / ((yj - yi) || 1e-12) + xi);
        if (intersects) inside = !inside;
      }
      return inside;
    };

    return rings.some((ring) => containsRing(ring, latlng));
  }

  if (selectedAreaLayer.getBounds) {
    return selectedAreaLayer.getBounds().contains(latlng);
  }

  return false;
}

function isPointInAreaLayer(latlng, areaLayer, areaType) {
  if (!areaLayer || !latlng) return false;
  const type = areaType || (areaLayer instanceof L.Circle ? 'radius' : (areaLayer instanceof L.Rectangle ? 'boundary' : 'polygon'));

  if (type === 'radius' && areaLayer.getLatLng) {
    const center = areaLayer.getLatLng();
    const radius = areaLayer.getRadius();
    return center.distanceTo(latlng) <= radius;
  }

  if (areaLayer instanceof L.Rectangle && areaLayer.getBounds) {
    return areaLayer.getBounds().contains(latlng);
  }

  if (areaLayer instanceof L.Polygon && areaLayer.getLatLngs) {
    const raw = areaLayer.getLatLngs();
    if (!Array.isArray(raw) || raw.length === 0) return false;

    const normalizeOuterRings = (latlngs) => {
      if (!Array.isArray(latlngs)) return [];
      if (latlngs.length === 0) return [];
      if (!Array.isArray(latlngs[0])) return [latlngs];
      if (Array.isArray(latlngs[0]) && latlngs[0].length > 0 && !Array.isArray(latlngs[0][0])) return [latlngs[0]];
      return latlngs.map((poly) => (Array.isArray(poly) && Array.isArray(poly[0]) ? poly[0] : [])).filter((ring) => ring.length);
    };

    const rings = normalizeOuterRings(raw);

    const containsRing = (ring, point) => {
      if (!Array.isArray(ring) || ring.length < 3) return false;
      let inside = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i].lng;
        const yi = ring[i].lat;
        const xj = ring[j].lng;
        const yj = ring[j].lat;
        const intersects = ((yi > point.lat) !== (yj > point.lat)) &&
          (point.lng < (xj - xi) * (point.lat - yi) / ((yj - yi) || 1e-12) + xi);
        if (intersects) inside = !inside;
      }
      return inside;
    };

    return rings.some((ring) => containsRing(ring, latlng));
  }

  if (areaLayer.getBounds) {
    return areaLayer.getBounds().contains(latlng);
  }

  return false;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function maybeBindPopup(layer, html) {
  if (!UI_POPUPS_ENABLED || !layer || !layer.bindPopup) return;
  layer.bindPopup(html);
}

function getMdcLogoUrl() {
  const url = (window.MDC_LOGO_URL || DEFAULT_MDC_LOGO_URL || '').trim();
  return url;
}

function getMdcLogoMarkup() {
  const url = getMdcLogoUrl();
  if (!url) return '';
  return `<img src="${url}" alt="MDC" class="ht-mdc-logo" />`;
}

function formatAcreage(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return `${num.toLocaleString()} acres`;
}

function renderMdcTileHeader(title) {
  const logo = getMdcLogoMarkup();
  const safeTitle = escapeHtml(title || 'MDC');
  return `
    <div class="ht-mdc-header">
      <div class="ht-mdc-brand">
        ${logo}
        <span>${safeTitle}</span>
      </div>
      <button onclick="closeEducationTile()" class="ht-mdc-close" aria-label="Close">X</button>
    </div>
  `;
}

function ensureEducationTile() {
  if (educationTile) return educationTile;
  educationTile = document.createElement('div');
  educationTile.id = 'education-tile';
  educationTile.style.cssText = 'position:fixed;left:20px;bottom:20px;width:320px;max-height:48vh;overflow-y:auto;background:rgba(0,0,0,0.92);color:#FFF;border:2px solid #FFD700;border-radius:12px;padding:16px;z-index:20000;box-shadow:0 8px 24px rgba(0,0,0,0.6);font-family:Arial;display:none;pointer-events:auto;touch-action:auto;';
  ['click', 'mousedown', 'touchstart', 'pointerdown'].forEach((evt) => {
    educationTile.addEventListener(evt, (event) => {
      event.stopPropagation();
    });
  });
  document.body.appendChild(educationTile);
  return educationTile;
}

function showEducationTile(hotspot, reason) {
  if (!UI_POPUPS_ENABLED) return;
  const tile = ensureEducationTile();
  const tier = hotspot?.tier ?? hotspot?.priority ?? hotspot?.education?.priority ?? 3;
  const rank = hotspot?.rank ?? hotspot?.priority ?? tier;
  const accent = getPriorityColor(tier);
  const whyItems = Array.isArray(hotspot?.education?.why) ? hotspot.education.why : [];
  const approachItems = Array.isArray(hotspot?.education?.approach) ? hotspot.education.approach : [];
  const whyList = whyItems.length
    ? `<ul style="margin:6px 0 0 18px;font-size:12px;line-height:1.45;">${whyItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';
  const approachList = approachItems.length
    ? `<ul style="margin:6px 0 0 18px;font-size:12px;line-height:1.45;">${approachItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';
  tile.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <div style="font-weight:bold;color:${accent};">Priority ${rank}: ${hotspot.education.title}</div>
      <button onclick="closeEducationTile()" style="background:transparent;color:#FFD700;border:none;font-weight:bold;cursor:pointer;">X</button>
    </div>
    <div style="font-size:12px;color:#CCC;margin:6px 0;">${reason || 'Education briefing'}</div>
    <p style="margin:8px 0;font-size:13px;line-height:1.45;">${hotspot.education.description}</p>
    ${whyList ? `
      <div style="margin:8px 0;padding:10px;background:#111;border-left:3px solid ${accent};font-size:12px;">
        <strong>Why this pin:</strong>${whyList}
      </div>
    ` : ''}
    ${approachList ? `
      <div style="margin:8px 0;padding:10px;background:#0c0c0c;border-left:3px solid #00FF88;font-size:12px;">
        <strong>How to hunt it:</strong>${approachList}
      </div>
    ` : ''}
    <div style="margin:8px 0;padding:10px;background:#111;border-left:3px solid ${accent};font-size:12px;">
      <strong>What to look for:</strong> ${hotspot.education.tips}
    </div>
  `;
  tile.style.display = 'block';
}

function showShedFindTile(shedFind, reason) {
  if (!UI_POPUPS_ENABLED) return;
  const tile = ensureEducationTile();
  const when = shedFind?.timestamp ? new Date(shedFind.timestamp).toLocaleString() : '';
  tile.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <div style="font-weight:bold;color:#FFD700;">Shed Find</div>
      <button onclick="closeEducationTile()" style="background:transparent;color:#FFD700;border:none;font-weight:bold;cursor:pointer;">X</button>
    </div>
    <div style="font-size:12px;color:#CCC;margin:6px 0;">${reason || ''}</div>
    <div style="margin:8px 0;padding:10px;background:#111;border-left:3px solid #FFD700;font-size:12px;">
      <strong>Notes:</strong> ${String(shedFind?.notes || '').replace(/</g, '&lt;')}
    </div>
    ${when ? `<div style="font-size:12px;color:#AAA;margin-top:6px;">${when}</div>` : ''}
  `;
  tile.style.display = 'block';
}

function closeEducationTile() {
  if (educationTile) educationTile.style.display = 'none';
}

function ensureLegend() {
  let legend = document.getElementById('mapLegend');
  if (legend) return legend;

  legend = document.createElement('div');
  legend.id = 'mapLegend';
  legend.className = 'ht-map-legend';
  document.body.appendChild(legend);
  return legend;
}

function updateLegend(allowedCount, unknownCount) {
  const legend = ensureLegend();
  legend.innerHTML = `
    <div class="ht-legend-title">Shed-Hunting Filter</div>
    <div class="ht-legend-row">
      <span class="ht-legend-dot" style="background:#00FF88;"></span>
      <span>Allowed (${allowedCount})</span>
    </div>
    <div class="ht-legend-row">
      <span class="ht-legend-dot" style="background:#666666;"></span>
      <span>Unknown (${unknownCount})</span>
    </div>
    <div class="ht-legend-row" style="color:#AAA;">
      Tap areas for official MDC links.
    </div>
  `;
}

function setLegendVisible(isVisible) {
  const legend = ensureLegend();
  legend.style.display = isVisible ? 'block' : 'none';
}

function ensureToastContainer() {
  let container = document.getElementById('toastContainer');
  if (container) return container;
  container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'ht-toast-container';
  document.body.appendChild(container);
  return container;
}

function showNotice(message, type = 'info', duration = 3200) {
  if (!UI_NOTICES_ENABLED) return;
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `ht-toast ht-toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-6px)';
    setTimeout(() => toast.remove(), 220);
  }, duration);
}

function shouldShowSelectionNotice() {
  try {
    return localStorage.getItem(SELECTION_NOTICE_STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}

function markSelectionNoticeSeen() {
  try {
    localStorage.setItem(SELECTION_NOTICE_STORAGE_KEY, '1');
  } catch {
    // Ignore storage failures.
  }
}

function showSelectionNoticeOnce(message, type = 'info', duration = 3200) {
  if (!shouldShowSelectionNotice()) return;
  markSelectionNoticeSeen();
  showNotice(message, type, duration);
}

function setChipState(id, isActive) {
  const chip = document.getElementById(id);
  if (!chip) return;
  chip.classList.toggle('active', Boolean(isActive));
}

function updateFilterChips() {
  setChipState('publicLandChip', publicLandEnabled);
  setChipState('mdcLandChip', mdcLandEnabled);
  setChipState('shedAllowedChip', shedAllowedEnabled);
  updateMapToggleButtons();
}

function updateMapToggleButtons() {
  const buttons = document.querySelectorAll('.ht-map-toggle');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    const layer = btn.getAttribute('data-layer');
    let isActive = false;
    if (layer === 'public') isActive = publicLandEnabled;
    if (layer === 'mdc') isActive = mdcLandEnabled;
    if (layer === 'private') isActive = privateParcelsEnabled;
    if (layer === 'shed') isActive = shedAllowedEnabled;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    const state = btn.querySelector('.ht-map-toggle-state');
    if (state) state.textContent = isActive ? 'ON' : 'OFF';
  });
}

window.toggleLayerButton = function(layer) {
  const key = String(layer || '').toLowerCase();
  if (key === 'public') {
    togglePublicLand();
    return;
  }
  if (key === 'mdc') {
    toggleMdcLand();
    return;
  }
  if (key === 'private') {
    togglePrivateParcels();
    return;
  }
  if (key === 'shed') {
    toggleShedAllowed();
  }
};

function openInputModal({ title, message, placeholder, defaultValue, multiline, confirmLabel, onSubmit }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = `
    <h3>${title || 'Input'}</h3>
    <p>${message || ''}</p>
    ${multiline ? '<textarea rows="4"></textarea>' : '<input type="text" />'}
    <div class="ht-modal-actions">
      <button class="ht-modal-btn ghost" type="button">Cancel</button>
      <button class="ht-modal-btn primary" type="button">${confirmLabel || 'Continue'}</button>
    </div>
  `;

  const field = modal.querySelector(multiline ? 'textarea' : 'input');
  const cancelBtn = modal.querySelector('.ht-modal-btn.ghost');
  const confirmBtn = modal.querySelector('.ht-modal-btn.primary');

  if (placeholder) field.placeholder = placeholder;
  if (defaultValue) field.value = defaultValue;

  const closeModal = () => {
    backdrop.remove();
  };

  cancelBtn.addEventListener('click', closeModal);
  confirmBtn.addEventListener('click', () => {
    const value = field.value.trim();
    closeModal();
    if (typeof onSubmit === 'function') onSubmit(value);
  });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  field.focus();
}

function openInfoModal({ title, bodyHtml, confirmLabel = 'Close' }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = `
    <h3>${title || 'Info'}</h3>
    <div style="font-size:12px;line-height:1.5;color:#ddd;">${bodyHtml || ''}</div>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn primary">${confirmLabel}</button>
    </div>
  `;

  const closeModal = () => backdrop.remove();
  modal.querySelector('button')?.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function openWaypointModal({ onSubmit }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = `
    <h3>Log Waypoint</h3>
    <div style="display:grid;gap:8px;">
      <label style="font-size:12px;color:#bbb;">Sign Type</label>
      <select id="wpType" class="ht-select">
        <option value="bedding">Bedding</option>
        <option value="rubs">Rubs</option>
        <option value="scrapes">Scrapes</option>
        <option value="trail" selected>Trail</option>
        <option value="feed">Feeding</option>
        <option value="water">Water</option>
      </select>
      <label style="font-size:12px;color:#bbb;">Confidence</label>
      <select id="wpConfidence" class="ht-select">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
      </select>
      <label style="font-size:12px;color:#bbb;">Notes</label>
      <textarea id="wpNotes" rows="4" style="width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,193,7,0.3);color:#fff;border-radius:10px;padding:10px;font-size:14px;outline:none;"></textarea>
    </div>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn ghost" id="wpCancel">Cancel</button>
      <button class="ht-modal-btn primary" id="wpSave">Save Waypoint</button>
    </div>
  `;

  const closeModal = () => backdrop.remove();
  modal.querySelector('#wpCancel')?.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  modal.querySelector('#wpSave')?.addEventListener('click', () => {
    const type = modal.querySelector('#wpType')?.value || 'trail';
    const confidence = modal.querySelector('#wpConfidence')?.value || 'medium';
    const notes = modal.querySelector('#wpNotes')?.value || '';
    if (typeof onSubmit === 'function') onSubmit({ type, confidence, notes });
    closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function parseLatLng(query) {
  const match = query.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return L.latLng(lat, lng);
}

function clearSearchHighlight() {
  if (searchHighlightLayer) {
    map.removeLayer(searchHighlightLayer);
    searchHighlightLayer = null;
  }
}

function highlightBounds(bounds) {
  clearSearchHighlight();
  if (!bounds) return;
  searchHighlightLayer = L.rectangle(bounds, {
    color: '#ffc107',
    weight: 2,
    fillColor: '#ffc107',
    fillOpacity: 0.08
  }).addTo(map);
}

function setSelectedAreaFromFeature(feature) {
  if (!feature || !feature.geometry) return;
  const geometry = feature.geometry;
  let targetLayer = null;

  if (geometry.rings) {
    const latlngs = geometry.rings.map((ring) => ring.map(([lng, lat]) => [lat, lng]));
    targetLayer = L.polygon(latlngs, {
      color: '#ffc107',
      weight: 2,
      fillColor: '#ffc107',
      fillOpacity: 0.08
    });
  } else if (geometry.x !== undefined && geometry.y !== undefined) {
    targetLayer = L.circle([geometry.y, geometry.x], {
      radius: 160,
      color: '#ffc107',
      weight: 2,
      fillColor: '#ffc107',
      fillOpacity: 0.12
    });
  }

  if (!targetLayer) return;
  setSelectedArea(targetLayer, 'polygon');
}

function clearMdcSelectedAreaHighlight() {
  if (mdcSelectedAreaPopup) {
    try { map.closePopup(mdcSelectedAreaPopup); } catch {}
    mdcSelectedAreaPopup = null;
  }
  if (mdcSelectedAreaHighlight) {
    try { map.removeLayer(mdcSelectedAreaHighlight); } catch {}
    mdcSelectedAreaHighlight = null;
  }
}

function highlightMdcSelectedArea(feature) {
  if (!feature || !feature.geometry) return;
  clearMdcSelectedAreaHighlight();

  const attrs = feature.attributes || {};
  const name = attrs.OFF_Name || attrs.Area_Name || 'MDC Conservation Area';
  const geometry = feature.geometry;

  const style = {
    pane: 'mdcSelectionPane',
    color: '#ffc107',
    weight: 4,
    opacity: 0.95,
    fillColor: '#ffc107',
    fillOpacity: 0.14
  };

  if (geometry.rings) {
    const latlngs = geometry.rings.map((ring) => ring.map(([lng, lat]) => [lat, lng]));
    mdcSelectedAreaHighlight = L.polygon(latlngs, style).addTo(map);
  } else if (geometry.x !== undefined && geometry.y !== undefined) {
    mdcSelectedAreaHighlight = L.circleMarker([geometry.y, geometry.x], { ...style, radius: 10 }).addTo(map);
  }

  if (UI_POPUPS_ENABLED) {
    const bounds = getBoundsFromArcgisGeometry(geometry);
    const anchor = bounds ? bounds.getCenter() : map.getCenter();
    mdcSelectedAreaPopup = L.popup({ closeButton: true, autoClose: true, closeOnClick: true })
      .setLatLng(anchor)
      .setContent(`<div style="font-weight:800;">${escapeHtml(name)}</div>`)
      .openOn(map);
  }
}

async function fetchGeocodeResults(query) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=${encodeURIComponent(query)}`);
  const results = await response.json();
  return results.map(result => ({
    type: 'place',
    title: result.display_name,
    meta: result.type || 'Place',
    latlng: L.latLng(parseFloat(result.lat), parseFloat(result.lon))
  }));
}

async function fetchMdcAreaResults(query) {
  const url = window.MDC_CONSERVATION_AREAS_URL || DEFAULT_MDC_CONSERVATION_AREAS_URL;
  const safe = query.toUpperCase().replace(/'/g, "''");
  const where = `upper(OFF_Name) LIKE '%${safe}%' OR upper(Area_Name) LIKE '%${safe}%'`;
  const queryUrl = `${url}/query?f=json&where=${encodeURIComponent(where)}` +
    `&outFields=Area_Name,OFF_Name,Reg_Link,Sum_Link,Map_Link,County,Acreage` +
    `&returnGeometry=true&outSR=4326&resultRecordCount=6`;

  const data = await fetchMdcJson(queryUrl);
  if (!data || !Array.isArray(data.features)) return [];
  return data.features.map(feature => {
    const attrs = feature.attributes || {};
    const name = attrs.OFF_Name || attrs.Area_Name || 'Conservation Area';
    const county = attrs.County ? `County: ${attrs.County}` : 'MDC Conservation Area';
    return {
      type: 'public',
      title: name,
      meta: county,
      feature
    };
  });
}

function getBoundsFromArcgisGeometry(geometry) {
  if (!geometry) return null;
  if (geometry.rings) {
    const latlngs = geometry.rings.map(ring => ring.map(([lng, lat]) => [lat, lng]));
    return L.latLngBounds(latlngs.flat());
  }
  if (geometry.x !== undefined && geometry.y !== undefined) {
    return L.latLngBounds([[geometry.y, geometry.x], [geometry.y, geometry.x]]);
  }
  return null;
}

function getSeasonalFocus() {
  const month = new Date().getMonth();
  if (month <= 1) return 'Late winter bedding cover and south-facing slopes.';
  if (month <= 3) return 'Post-winter transition routes and thermal cover.';
  if (month <= 5) return 'Spring feeding edges and mineral-rich travel.';
  if (month <= 8) return 'Summer patterns near water and shade.';
  return 'Fall movement corridors and food-to-cover transitions.';
}

function startLocationWatch() {
  if (!navigator.geolocation) return;
  if (locationWatchId) navigator.geolocation.clearWatch(locationWatchId);

  locationWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      hotspotMarkers.forEach((marker, index) => {
        const distance = userLatLng.distanceTo(marker.getLatLng());
        const key = `hotspot-${index}`;
        if (distance <= HOTSPOT_GEOFENCE_METERS && !hotspotVisited.has(key)) {
          hotspotVisited.add(key);
          const hotspot = marker.__hotspotData;
          if (hotspot) {
            showEducationTile(hotspot, 'You entered a hotspot zone.');
          }
        }
      });

      const featureGeofence = Number(window.TERRAIN_FEATURE_GEOFENCE_M || DEFAULT_TERRAIN_FEATURE_GEOFENCE_M);
      if (Array.isArray(terrainFeatures) && terrainFeatures.length) {
        for (const feature of terrainFeatures) {
          if (!feature || !feature.latlng || !feature.id) continue;
          if (terrainFeatureVisited.has(feature.id)) continue;
          const dist = userLatLng.distanceTo(feature.latlng);
          if (dist <= featureGeofence) {
            terrainFeatureVisited.add(feature.id);
            const name = feature.label || feature.type || 'Terrain Feature';
            showNotice(`${name} nearby (${Math.round(dist)}m)`, 'info', 5200);
            if (UI_POPUPS_ENABLED) {
              try {
                if (feature.marker && feature.marker.openPopup) feature.marker.openPopup();
              } catch {}
            }
          }
        }
      }
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
  );
}

function stopLocationWatch() {
  if (locationWatchId) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }
}

function centerOnMyLocationInternal() {
  if (!navigator.geolocation) {
    showNotice('GPS not available. Enable location services.', 'error', 4200);
    return;
  }

  showNotice('Centering on your location…', 'info', 2200);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      const zoom = map && typeof map.getZoom === 'function' ? Math.max(map.getZoom(), 14) : 14;
      map.setView(latlng, zoom, { animate: true });
      showNotice('Centered on your location.', 'success', 2800);
    },
    (err) => {
      const msg = err && err.message ? err.message : 'Unable to read GPS location.';
      showNotice(`GPS failed: ${msg}`, 'error', 5200);
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 }
  );
}

async function tryAutoCenterWithoutPrompt() {
  if (!navigator.geolocation || !navigator.permissions) return;
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    if (status && status.state === 'granted') {
      centerOnMyLocationInternal();
    }
  } catch {
    // Ignore permission API failures.
  }
}

function showNearestHotspotEducationInternal() {
  if (!navigator.geolocation || hotspotMarkers.length === 0) {
    showNotice('No hotspots available yet. Start a hunt first.', 'warning');
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
    let nearest = null;
    let nearestDistance = Infinity;

    hotspotMarkers.forEach((marker) => {
      const distance = userLatLng.distanceTo(marker.getLatLng());
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = marker;
      }
    });

    if (nearest && nearest.__hotspotData) {
      showEducationTile(nearest.__hotspotData, 'You are here. Nearest hotspot guidance.');
    }
  });
}

function setPublicLandEnabled(enabled) {
  publicLandEnabled = enabled;
  if (publicLandEnabled) {
    enablePublicLandLayer();
  } else {
    disablePublicLandLayer();
  }
  updateFilterChips();
}

function setMdcLandEnabled(enabled) {
  mdcLandEnabled = enabled;
  const toggle = document.getElementById('mdcLandToggle');
  if (toggle) toggle.checked = mdcLandEnabled;
  if (mdcLandEnabled) {
    enableMdcLandLayer();
  } else {
    disableMdcLandLayer();
  }
  updateFilterChips();
}

function setPrivateParcelsEnabled(enabled) {
  privateParcelsEnabled = enabled;
  if (privateParcelsEnabled) {
    enablePrivateParcelsLayer();
  } else {
    disablePrivateParcelsLayer();
  }
}

function enablePrivateParcelsLayer() {
  const tileUrl = (window.PRIVATE_PARCELS_TILE_URL || '').trim();
  if (!tileUrl) {
    showNotice('Private parcels not configured. Set PRIVATE_PARCELS_TILE_URL in config.js.', 'warning', 5200);
    const toggle = document.getElementById('privateParcelsToggle');
    if (toggle) toggle.checked = false;
    privateParcelsEnabled = false;
    return;
  }

  if (!privateParcelsLayer) {
    privateParcelsLayer = L.tileLayer(tileUrl, { opacity: 0.65, maxZoom: 19, zIndex: 460 });
    privateParcelsLayer.on('tileerror', () => {
      showNotice('Private parcels overlay failed to load tiles.', 'warning', 4200);
    });
    if (baseLayersControl) {
      try { baseLayersControl.addOverlay(privateParcelsLayer, 'Private Parcels'); } catch {}
    }
  }
  map.addLayer(privateParcelsLayer);
  showSelectionNoticeOnce('Private parcel boundaries enabled.', 'success', 3200);
}

function disablePrivateParcelsLayer() {
  if (privateParcelsLayer) map.removeLayer(privateParcelsLayer);
}

function showPublicLandActivityGuidance() {
  if (!UI_POPUPS_ENABLED) return;
  const tile = ensureEducationTile();
  tile.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <div style="font-weight:bold;color:#FFD700;">Public Land Guidance</div>
      <button onclick="closeEducationTile()" style="background:transparent;color:#FFD700;border:none;font-weight:bold;cursor:pointer;">X</button>
    </div>
    <p style="margin:8px 0;font-size:13px;line-height:1.4;">
      Public land overlays are now visible. Always confirm the local shed-hunting regulations
      and seasonal restrictions for each unit before entering.
    </p>
    <div style="margin:8px 0;padding:10px;background:#111;border-left:3px solid #FFD700;font-size:12px;">
      <strong>Next step:</strong> Tap a public land parcel in your agency app or site to verify
      permitted activities and dates.
    </div>
  `;
  tile.style.display = 'block';
}

function enablePublicLandLayer() {
  if (publicLandLayer) {
    map.addLayer(publicLandLayer);
    return;
  }

  const tileUrl = window.PUBLIC_LAND_TILE_URL || DEFAULT_PUBLIC_LAND_TILE_URL;
  publicLandLayer = L.tileLayer(tileUrl, { opacity: 0.7, maxZoom: 19, zIndex: 450 });
  publicLandLayer.on('tileerror', () => {
    showNotice('Public land overlay failed to load tiles.', 'warning', 4200);
  });
  if (baseLayersControl) {
    try { baseLayersControl.addOverlay(publicLandLayer, 'Public Land'); } catch {}
  }
  map.addLayer(publicLandLayer);

  showSelectionNoticeOnce('Public land overlay enabled. Verify local regulations for shed hunting access.', 'info', 4200);
}

function disablePublicLandLayer() {
  if (publicLandLayer) map.removeLayer(publicLandLayer);
}

async function fetchMdcJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MDC HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    const proxyUrl = `${REG_PROXY_PATH}${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`MDC proxy HTTP ${res.status}`);
    return await res.json();
  }
}

function removeMdcLandLayer() {
  if (mdcLandLayer) {
    try { map.removeLayer(mdcLandLayer); } catch {}
  }
  mdcLandLayer = null;
}

async function enableMdcLandLayer() {
  if (mdcLandLoading) return;
  mdcLandLoading = true;

  const bounds = selectedAreaLayer ? getSelectedAreaBounds() : map.getBounds();
  let features = [];
  try {
    features = await fetchMdcConservationAreas(bounds);
  } catch {
    features = [];
  }

  if (!mdcLandEnabled) {
    mdcLandLoading = false;
    return;
  }

  removeMdcLandLayer();

  mdcLandLayer = L.geoJSON(features, {
    style: {
      color: '#7cffc7',
      weight: 2,
      fillColor: '#7cffc7',
      fillOpacity: 0.08
    },
    onEachFeature: (feature, layer) => {
      layer.on('click', () => showMdcAreaSummary(feature));
      const attrs = feature?.attributes || {};
      const name = attrs.OFF_Name || attrs.Area_Name || 'MDC Conservation Area';
      maybeBindPopup(layer, `<strong>${escapeHtml(name)}</strong>`);
    }
  }).addTo(map);

  mdcLandLoading = false;
  showSelectionNoticeOnce('MDC conservation areas enabled.', 'success', 3200);
}

function disableMdcLandLayer() {
  removeMdcLandLayer();
}

async function fetchMdcConservationAreas(bounds) {
  const url = window.MDC_CONSERVATION_AREAS_URL || DEFAULT_MDC_CONSERVATION_AREAS_URL;
  const xmin = bounds.getWest();
  const ymin = bounds.getSouth();
  const xmax = bounds.getEast();
  const ymax = bounds.getNorth();
  const queryUrl = `${url}/query?f=json&where=1%3D1&geometry=${xmin},${ymin},${xmax},${ymax}` +
    `&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects` +
    `&outFields=Area_Name,OFF_Name,Reg_Link,Sum_Link,Map_Link,Brochure_Link,County,Region,Public_Site,Division_Admin,Acreage,Acres_GIS` +
    `&returnGeometry=true&outSR=4326`;

  const data = await fetchMdcJson(queryUrl);
  if (!data || !Array.isArray(data.features)) return [];
  return data.features;
}

async function checkRegAllowsShed(regLink) {
  if (!regLink) return { status: 'unknown', confidence: 'low' };
  if (shedAllowedCache.has(regLink)) {
    const cached = shedAllowedCache.get(regLink);
    if (cached && cached.ts && Date.now() - cached.ts < SHED_CACHE_TTL_MS) {
      return cached;
    }
  }

  const proxyUrl = `${REG_PROXY_PATH}${encodeURIComponent(regLink)}`;
  let result = { status: 'unknown', confidence: 'low' };

  try {
    const response = await fetch(proxyUrl);
    const text = (await response.text()).toLowerCase();
    const hasShed = text.includes('shed') || text.includes('antler');
    const allowedHints = text.includes('allowed') || text.includes('permit') || text.includes('legal');
    const blockedHints = text.includes('prohibit') || text.includes('not allowed') || text.includes('illegal');

    if (hasShed && allowedHints && !blockedHints) {
      result = { status: 'allowed', confidence: 'high' };
    } else if (hasShed && !blockedHints) {
      result = { status: 'allowed', confidence: 'medium' };
    } else if (blockedHints && hasShed) {
      result = { status: 'blocked', confidence: 'high' };
    } else {
      result = { status: 'unknown', confidence: 'low' };
    }
  } catch (error) {
    result = { status: 'unknown', confidence: 'low' };
  }

  result.ts = Date.now();
  shedAllowedCache.set(regLink, result);
  saveShedCache();
  return result;
}

async function enableShedAllowedLayer() {
  if (shedAllowedLoading) return;
  if (!shedAllowedEnabled) return;
  shedAllowedLoading = true;

  const tile = UI_POPUPS_ENABLED ? ensureEducationTile() : null;
  if (tile) {
    tile.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <div style="font-weight:bold;color:#FFD700;">Shed Hunting Allowed</div>
        <button onclick="closeEducationTile()" style="background:transparent;color:#FFD700;border:none;font-weight:bold;cursor:pointer;">X</button>
      </div>
      <p style="margin:8px 0;font-size:13px;line-height:1.4;"><span class="ht-loading-pulse"></span>Scanning MDC regulations for the current map area...</p>
    `;
    tile.style.display = 'block';
  }

  const bounds = selectedAreaLayer ? getSelectedAreaBounds() : map.getBounds();
  let features = [];
  try {
    features = await fetchMdcConservationAreas(bounds);
  } catch (error) {
    features = [];
  }

  const allowedFeatures = [];
  const unknownFeatures = [];
  for (const feature of features) {
    const regLink = feature.attributes ? feature.attributes.Reg_Link : null;
    if (!regLink) continue;
    const verdict = await checkRegAllowsShed(regLink);
    feature.attributes.__shedVerdict = verdict;
    if (verdict.status === 'allowed') {
      allowedFeatures.push(feature);
    } else if (verdict.status === 'unknown') {
      unknownFeatures.push(feature);
    }
  }

  if (!shedAllowedEnabled) {
    shedAllowedLoading = false;
    return;
  }

  if (shedAllowedLayer) {
    map.removeLayer(shedAllowedLayer);
  }

  if (shedUnknownLayer) {
    map.removeLayer(shedUnknownLayer);
  }

  shedAllowedLayer = L.geoJSON(allowedFeatures, {
    style: {
      color: '#00FF88',
      weight: 3,
      fillColor: '#00FF88',
      fillOpacity: 0.15
    },
    onEachFeature: (feature, layer) => {
      const attrs = feature.attributes || {};
      const name = attrs.OFF_Name || attrs.Area_Name || 'Conservation Area';
      const verdict = attrs.__shedVerdict || { status: 'allowed', confidence: 'medium' };
      const badge = `<span style="background:#00FF88;color:#000;padding:2px 6px;border-radius:8px;font-size:11px;font-weight:bold;">Allowed (${verdict.confidence})</span>`;
      const regs = attrs.Reg_Link ? `<a href="${attrs.Reg_Link}" target="_blank" rel="noopener">Regulations</a>` : '';
      const summary = attrs.Sum_Link ? `<a href="${attrs.Sum_Link}" target="_blank" rel="noopener">Summary</a>` : '';
      const mapLink = attrs.Map_Link ? `<a href="${attrs.Map_Link}" target="_blank" rel="noopener">Map</a>` : '';
      const links = [summary, regs, mapLink].filter(Boolean).join(' | ');
      maybeBindPopup(layer, `
        <div style="font-family:Arial;max-width:240px;">
          <strong>${name}</strong><br/>
          ${badge}<br/>
          ${links ? links : 'No links available'}
        </div>
      `);
    }
  }).addTo(map);

  shedUnknownLayer = L.geoJSON(unknownFeatures, {
    style: {
      color: '#999999',
      weight: 2,
      fillColor: '#666666',
      fillOpacity: 0.08
    },
    onEachFeature: (feature, layer) => {
      const attrs = feature.attributes || {};
      const name = attrs.OFF_Name || attrs.Area_Name || 'Conservation Area';
      const verdict = attrs.__shedVerdict || { status: 'unknown', confidence: 'low' };
      const badge = `<span style="background:#666;color:#fff;padding:2px 6px;border-radius:8px;font-size:11px;font-weight:bold;">Unknown (${verdict.confidence})</span>`;
      const regs = attrs.Reg_Link ? `<a href="${attrs.Reg_Link}" target="_blank" rel="noopener">Regulations</a>` : '';
      const summary = attrs.Sum_Link ? `<a href="${attrs.Sum_Link}" target="_blank" rel="noopener">Summary</a>` : '';
      const mapLink = attrs.Map_Link ? `<a href="${attrs.Map_Link}" target="_blank" rel="noopener">Map</a>` : '';
      const links = [summary, regs, mapLink].filter(Boolean).join(' | ');
      maybeBindPopup(layer, `
        <div style="font-family:Arial;max-width:240px;">
          <strong>${name}</strong><br/>
          ${badge}<br/>
          ${links ? links : 'No links available'}
        </div>
      `);
    }
  }).addTo(map);

  if (tile) {
    tile.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <div style="font-weight:bold;color:#FFD700;">Shed Hunting Allowed</div>
        <button onclick="closeEducationTile()" style="background:transparent;color:#FFD700;border:none;font-weight:bold;cursor:pointer;">X</button>
      </div>
      <p style="margin:8px 0;font-size:13px;line-height:1.4;">
        Showing ${allowedFeatures.length} allowed areas and ${unknownFeatures.length} unknown areas.
      </p>
      <div style="margin-top:6px;font-size:12px;color:#AAA;">Green = allowed, gray = unknown. Always verify with MDC regulation links.</div>
    `;
  }

  updateLegend(allowedFeatures.length, unknownFeatures.length);
  setLegendVisible(true);

  shedAllowedLoading = false;
}

function disableShedAllowedLayer() {
  if (shedAllowedLayer) map.removeLayer(shedAllowedLayer);
  if (shedUnknownLayer) map.removeLayer(shedUnknownLayer);
  setLegendVisible(false);
}

// Weather update
async function updateWeather() {
  const center = map.getCenter();
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${center.lat}&longitude=${center.lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`);
    const data = await response.json();
    
    const temp = Math.round(data.current.temperature_2m);
    const windSpeed = Math.round(data.current.wind_speed_10m);
    const windDir = ['N','NE','E','SE','S','SW','W','NW'][Math.round(data.current.wind_direction_10m/45)%8];
    activeWindDir = windDir;
    activeWindSpeed = windSpeed;
    activeWindSpeed = windSpeed;
    
    const tempEl = document.querySelector('.ht-temp');
    const condEl = document.querySelector('.ht-conditions');
    if (tempEl) tempEl.textContent = `${temp}°`;
    if (condEl) condEl.textContent = `${windSpeed} mph ${windDir}`;

    try { updateWindOverlay(windDir, windSpeed); } catch {}
  } catch (error) {
    console.error('Weather update failed:', error);
  }
}

// Search functionality
function initializeSearch() {
  const searchBtn = document.querySelector('.ht-search-btn');
  const searchInput = document.querySelector('.ht-search-input');
  const resultsEl = document.getElementById('searchResults');
  const gpsBtn = document.querySelector('.ht-gps-btn');
  let searchTimer = null;
  
  if (!searchInput || !resultsEl) return;

  if (gpsBtn) {
    gpsBtn.addEventListener('click', (event) => {
      event.preventDefault();
      centerOnMyLocationInternal();
    });
  }

  const hideResults = () => {
    resultsEl.style.display = 'none';
    resultsEl.innerHTML = '';
    searchResults = [];
    searchActiveIndex = -1;
  };

  const renderResults = (items) => {
    resultsEl.innerHTML = '';
    if (!items.length) {
      hideResults();
      return;
    }

    items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'ht-search-item';
      row.dataset.index = index;
      row.innerHTML = `
        <div class="ht-search-title">${item.type === 'public' ? 'Public Land - ' : ''}${item.title}</div>
        <div class="ht-search-meta">${item.meta || ''}</div>
      `;
      row.addEventListener('click', () => selectResult(index));
      resultsEl.appendChild(row);
    });

    resultsEl.style.display = 'block';
  };

  const selectResult = (index) => {
    const item = searchResults[index];
    if (!item) return;

    clearSearchHighlight();

    if (item.latlng) {
      map.setView(item.latlng, 14);
      highlightBounds(L.latLngBounds([item.latlng, item.latlng]));
    }

    if (item.feature && item.feature.geometry) {
      const bounds = getBoundsFromArcgisGeometry(item.feature.geometry);
      if (bounds) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      setSelectedAreaFromFeature(item.feature);
      highlightMdcSelectedArea(item.feature);
      showMdcAreaSummary(item.feature);
    }

    hideResults();
  };

  const performSearch = async (query, isManual) => {
    if (!query) {
      hideResults();
      return;
    }

    const items = [];
    const parsed = parseLatLng(query);
    if (parsed) {
      items.push({
        type: 'coords',
        title: `Coordinates: ${parsed.lat.toFixed(5)}, ${parsed.lng.toFixed(5)}`,
        meta: 'Latitude, Longitude',
        latlng: parsed
      });
    }

    try {
      const [geocodeResults, mdcResults] = await Promise.all([
        fetchGeocodeResults(query),
        fetchMdcAreaResults(query)
      ]);
      items.push(...mdcResults, ...geocodeResults);
    } catch (error) {
      showNotice('Search failed. Please try again.', 'error');
    }

    searchResults = items.slice(0, 10);
    if (!searchResults.length && isManual) {
      showNotice('No results found. Try a nearby town or coordinates.', 'warning');
    }
    renderResults(searchResults);
  };

  const scheduleSearch = () => {
    const query = searchInput.value.trim();
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => performSearch(query), 300);
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', () => performSearch(searchInput.value.trim(), true));
  }

  searchInput.addEventListener('input', scheduleSearch);
  searchInput.addEventListener('keydown', (event) => {
    if (!searchResults.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      searchActiveIndex = Math.min(searchActiveIndex + 1, searchResults.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      searchActiveIndex = Math.max(searchActiveIndex - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (searchActiveIndex === -1) searchActiveIndex = 0;
      selectResult(searchActiveIndex);
      return;
    } else if (event.key === 'Escape') {
      hideResults();
      return;
    }

    const rows = resultsEl.querySelectorAll('.ht-search-item');
    rows.forEach((row, idx) => row.classList.toggle('active', idx === searchActiveIndex));
  });

  document.addEventListener('click', (event) => {
    if (!resultsEl.contains(event.target) && event.target !== searchInput) {
      hideResults();
    }
  });
}

window.centerOnMyLocation = function() {
  centerOnMyLocationInternal();
};

window.showMap = function() {
  const panel = document.getElementById('strategy-panel');
  if (panel) panel.style.display = 'block';
};

window.showProperties = function() {
  showNotice('Properties view coming soon.', 'info');
};

window.showHunts = function() {
  showNotice('Hunts history coming soon.', 'info');
};

window.showWeather = function() {
  showNotice('Weather details coming soon.', 'info');
};

window.toggleToolbar = function() {
  toolbarOpen = !toolbarOpen;
  const toolbar = document.getElementById('toolbar');
  const icon = document.getElementById('toggleIcon');
  if (!toolbar) return;

  if (toolbarOpen) {
    toolbar.classList.remove('collapsed');
    document.body.classList.remove('ht-toolbar-collapsed');
    if (icon) icon.textContent = '▾';
    try { localStorage.setItem('htToolbarCollapsed', '0'); } catch {}
  } else {
    toolbar.classList.add('collapsed');
    document.body.classList.add('ht-toolbar-collapsed');
    if (icon) icon.textContent = '▸';
    try { localStorage.setItem('htToolbarCollapsed', '1'); } catch {}
  }
};

function setAdvancedControlsOpen(isOpen) {
  document.body.classList.toggle('ht-advanced-open', Boolean(isOpen));
  const btn = document.getElementById('advancedToggleBtn');
  if (btn) {
    btn.textContent = isOpen ? 'Hide' : 'Show';
    btn.classList.toggle('active', Boolean(isOpen));
  }
  try { localStorage.setItem('htAdvancedControlsOpen', isOpen ? '1' : '0'); } catch {}
}

window.toggleAdvancedControls = function() {
  const isOpen = document.body.classList.contains('ht-advanced-open');
  setAdvancedControlsOpen(!isOpen);
};

window.startOver = function() {
  clearAllDrawings();
  document.body.classList.remove('ht-hunt-active');
  showNotice('Start over ready. Define a new hunt area.', 'info', 2600);
};

window.openFieldCommand = function() {
  if (!toolbarOpen) {
    window.toggleToolbar();
  }
  const toolbar = document.getElementById('toolbar');
  if (toolbar) {
    toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.openPlanPanel = function() {
  if (!selectedAreaLayer && !currentPolygon) {
    showNotice('Select a hunt area first: parcel, draw, or radius.', 'warning', 3600);
    return;
  }
  window.startHuntFromCriteria({ panelMode: 'route' });
};

window.logHuntWaypoint = function() {
  if (!navigator.geolocation) {
    showNotice('GPS not available. Enable location services.', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    openWaypointModal({
      onSubmit: ({ type, confidence, notes }) => {
        const entry = {
          id: `wp_${Date.now()}`,
          type: 'waypoint',
          coords: [lat, lng],
          signType: type,
          confidence,
          notes,
          timestamp: new Date().toISOString()
        };
        huntJournalEntries.unshift(entry);
        saveHuntJournal();
        L.marker([lat, lng], { icon: getBrandedPinIcon('W') }).addTo(map);
        showNotice('Waypoint logged to hunt journal.', 'success', 3200);
      }
    });
  });
};

window.openHuntJournal = function() {
  window.openHuntJournalPanel();
};

window.toggleUserMenu = function() {
  showNotice('User menu coming soon.', 'info');
};

// Log Shed Find
function logShedFind() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      openInputModal({
        title: 'Log Shed Find',
        message: 'Describe the shed (points, side, condition, habitat).',
        placeholder: 'Example: Right side, 5 points, fresh drop near bedding cover.',
        multiline: true,
        confirmLabel: 'Log Shed',
        onSubmit: (notes) => {
          if (!notes) return;

          const shedFind = {
            type: 'shed_find',
            coords: [lat, lng],
            notes: notes,
            timestamp: new Date().toISOString()
          };

          huntJournalEntries.unshift({
            id: `shed_${Date.now()}`,
            type: 'shed_find',
            coords: [lat, lng],
            notes: notes,
            timestamp: shedFind.timestamp
          });
          saveHuntJournal();

          const marker = L.marker([lat, lng], {
            icon: getBrandedPinIcon('F')
          }).addTo(map);
          marker.__shedFindData = shedFind;
          marker.on('click', () => showShedFindTile(shedFind, 'Logged shed find.'));
          showShedFindTile(shedFind, 'Logged shed find.');

          showNotice('Shed logged successfully. Check nearby for the matching side!', 'success', 4200);
        }
      });
    });
  } else {
    showNotice('GPS not available. Enable location services.', 'error');
  }
}

window.toggleTracking = function() {
  showNotice('Live Tracker activated!', 'success');
};

window.toggleVoiceCommands = function() {
  showNotice('Live Voice Commands activated!', 'success');
};

window.logPinOnMap = function() {
  logShedFind();
};

window.startCoach = function() {
  showNotice('Starting HUNTECH Coach...', 'info');
};

window.startHuntFromCriteria = function(options = {}) {
  huntCriteria = getHuntCriteriaFromUI();
  document.body.classList.add('ht-hunt-active');
  clearSearchHighlight();
  closeEducationTile();
  startShedHunt(options);
};

// ENHANCED START SHED HUNT - Education First with Priority Ranking
window.startShedHunt = async function(options = {}) {
  // Clear previous markers and routes
  clearHunt();
  
  // Verify hunt area exists
  const huntArea = selectedAreaLayer || currentPolygon;
  if (!huntArea) {
    showNotice('Define a hunt area first: radius, draw, or boundary.', 'warning', 4200);
    return;
  }

  // Show loading
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'hunt-loading';
  loadingDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.95);color:#FFD700;padding:40px 60px;border-radius:15px;z-index:10000;font-size:20px;font-weight:bold;border:3px solid #FFD700;box-shadow:0 0 30px rgba(255,215,0,0.5);';
  loadingDiv.innerHTML = '🎯 Analyzing terrain & conditions...<br/><small style="font-size:14px;color:#FFF;">Identifying shed hotspots</small>';
  document.body.appendChild(loadingDiv);

  const cleanupLoading = () => {
    try { loadingDiv.remove(); } catch {}
    try {
      const existing = document.getElementById('hunt-loading');
      if (existing) existing.remove();
    } catch {}
  };

  try {
    // Get weather data
    const bounds = huntArea.getBounds ? huntArea.getBounds() : map.getBounds();
    const center = bounds.getCenter();
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${center.lat}&longitude=${center.lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`);
    const data = await response.json();
    const temp = Math.round(data.current.temperature_2m);
    const windSpeed = Math.round(data.current.wind_speed_10m);
    const windDir = ['N','NE','E','SE','S','SW','W','NW'][Math.round(data.current.wind_direction_10m/45)%8];
    activeWindDir = windDir;

    // Generate hotspots with educational data (more than 5, spaced out)
    const criteria = getHuntCriteriaFromUI();
    huntCriteria = criteria;
    const desiredCountRaw = parseInt(window.HOTSPOT_COUNT, 10);
    const desiredCount = Number.isFinite(desiredCountRaw) && desiredCountRaw > 0
      ? desiredCountRaw
      : getHotspotCountFromCriteria(criteria);
    const habitatPool = buildHabitatPool(criteria);
    let hotspots = [];

    const chosen = [];
    for (let i = 0; i < desiredCount; i++) {
      const habitat = habitatPool[i % habitatPool.length];
      const baseEdu = SHED_EDUCATION[habitat];
      let latlng = null;
      let flatRejects = 0;
      for (let attempt = 0; attempt < 35; attempt++) {
        const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
        const lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());
        const candidate = L.latLng(lat, lng);
        const spacedOk = chosen.every((p) => p.distanceTo(candidate) >= HOTSPOT_MIN_SPACING_METERS);
        if (spacedOk && isPointInSelectedArea(candidate)) {
          const maybeWater = await isLikelyWaterCandidate(candidate);
          if (maybeWater && flatRejects < 4) {
            flatRejects++;
            continue;
          }
          latlng = candidate;
          break;
        }
      }

      if (!latlng) continue;
      chosen.push(latlng);

      const edu = buildCustomHotspotEducation({
        habitat,
        base: baseEdu,
        latlng,
        bounds,
        windDir,
        criteria
      });

      hotspots.push({
        coords: [latlng.lat, latlng.lng],
        tier: edu.priority,
        habitat: habitat,
        education: edu
      });
    }

    const areaLayer = selectedAreaLayer || huntArea;
    const areaType = selectedAreaType || (areaLayer instanceof L.Circle ? 'radius' : (areaLayer instanceof L.Rectangle ? 'boundary' : 'polygon'));
    hotspots = hotspots.filter((h) => {
      const ll = L.latLng(h.coords[0], h.coords[1]);
      return isPointInAreaLayer(ll, areaLayer, areaType);
    });

    // Sort by tier (1 = highest), then assign rank (1..N)
    hotspots.sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99));
    hotspots.forEach((hotspot, index) => {
      hotspot.rank = index + 1;
      const marker = createBrandedHotspotMarker(hotspot);
      hotspotMarkers.push(marker);
    });

    coreAreaEnabled = criteria.depth === 'deep' || criteria.depth === 'medium';
    createScoutingLayer(bounds, criteria, windDir);

    lastPlanSnapshot = {
      criteria,
      hotspots: hotspots.map((h) => ({
        coords: h.coords,
        tier: h.tier,
        habitat: h.habitat,
        rank: h.rank
      })),
      coreZones: coreZones.map((z) => ({
        type: z.type,
        score: z.score,
        coords: z.coords,
        wind: z.wind,
        radius: z.radius,
        terrain: z.terrain,
        cover: z.cover,
        pressure: z.pressure,
        access: z.access,
        sign: z.sign
      })),
      wind: windDir,
      temperature: temp,
      windSpeed,
      bounds: bounds ? {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      } : null,
      timestamp: new Date().toISOString()
    };

    cleanupLoading();

    // Show routing window first (route builds only after LET'S GO)
    const panelMode = options && options.panelMode ? options.panelMode : 'route';
    showStrategyPanel(hotspots, temp, windSpeed, windDir, { mode: panelMode });

    // Clear the selected area highlight after the plan is generated.
    if (selectedAreaLayer) {
      if (drawnItems && drawnItems.hasLayer(selectedAreaLayer)) {
        drawnItems.removeLayer(selectedAreaLayer);
      }
      map.removeLayer(selectedAreaLayer);
    }

    // No auto GPS prompts / no auto Area Rules. Users can tap "Me", "I'm Here", or "Area Rules" when needed.

  } catch (error) {
    cleanupLoading();
    showNotice(`Error analyzing hunt area: ${error.message}`, 'error', 5200);
  }
};

function clearCustomRouteSelection() {
  startPoint = null;
  endPoint = null;
  if (startPointMarker) {
    try { map.removeLayer(startPointMarker); } catch {}
    startPointMarker = null;
  }
  if (endPointMarker) {
    try { map.removeLayer(endPointMarker); } catch {}
    endPointMarker = null;
  }
  if (customRouteClickHandler) {
    try { map.off('click', customRouteClickHandler); } catch {}
    customRouteClickHandler = null;
  }
}

function setSelectedRoutingMode(mode) {
  selectedRoutingMode = mode || 'linear';
  const label = document.getElementById('routeModeLabel');
  if (label) {
    const text = selectedRoutingMode === 'loop'
      ? 'Loop'
      : selectedRoutingMode === 'custom'
        ? 'Custom Start/End'
        : 'Linear';
    label.textContent = `Selected routing: ${text}`;
  }

  const linearBtn = document.getElementById('routeLinearBtn');
  const loopBtn = document.getElementById('routeLoopBtn');
  const customBtn = document.getElementById('routeCustomBtn');
  if (linearBtn) {
    linearBtn.classList.toggle('selected', selectedRoutingMode === 'linear');
    linearBtn.setAttribute('aria-pressed', selectedRoutingMode === 'linear' ? 'true' : 'false');
  }
  if (loopBtn) {
    loopBtn.classList.toggle('selected', selectedRoutingMode === 'loop');
    loopBtn.setAttribute('aria-pressed', selectedRoutingMode === 'loop' ? 'true' : 'false');
  }
  if (customBtn) {
    customBtn.classList.toggle('selected', selectedRoutingMode === 'custom');
    customBtn.setAttribute('aria-pressed', selectedRoutingMode === 'custom' ? 'true' : 'false');
  }
}

window.selectRoutingMode = function(mode) {
  const next = mode === 'loop' || mode === 'custom' ? mode : 'linear';
  if (next !== 'custom') {
    clearCustomRouteSelection();
  }
  setSelectedRoutingMode(next);
  if (next === 'custom') {
    window.selectCustomRoute();
  } else {
    // Preview build so user can quickly compare Linear vs Loop.
    createOptimalRoute(next);
    showNotice(`Previewing ${next === 'loop' ? 'Loop' : 'Linear'} route. Toggle to compare, or tap LET'S GO to start alerts.`, 'success', 4200);
  }
};

// Get priority color
function getPriorityColor(priority) {
  const colors = {
    1: '#FF4444', // Red - Highest
    2: '#FF8C00', // Orange
    3: '#FFD700', // Gold
    4: '#90EE90', // Light Green
    5: '#87CEEB'  // Sky Blue - Lowest
  };
  return colors[priority] || '#FFD700';
}

function windDirToVector(dir) {
  const d = String(dir || '').toUpperCase();
  const mapVec = {
    N: [0, 1],
    NE: [Math.SQRT1_2, Math.SQRT1_2],
    E: [1, 0],
    SE: [Math.SQRT1_2, -Math.SQRT1_2],
    S: [0, -1],
    SW: [-Math.SQRT1_2, -Math.SQRT1_2],
    W: [-1, 0],
    NW: [-Math.SQRT1_2, Math.SQRT1_2]
  };
  return mapVec[d] || null;
}

function ensureWindOverlay() {
  if (!map) return;
  if (windOverlayRoot && windOverlayCanvas && windOverlayCtx) return;

  const root = document.createElement('div');
  root.className = 'ht-wind-overlay';
  const canvas = document.createElement('canvas');
  canvas.className = 'ht-wind-canvas';
  root.appendChild(canvas);

  map.getContainer().appendChild(root);

  windOverlayRoot = root;
  windOverlayCanvas = canvas;
  windOverlayCtx = canvas.getContext('2d', { alpha: true });

  const resize = () => {
    if (!windOverlayCanvas) return;
    const size = map.getSize();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    windOverlayCanvas.width = Math.max(1, Math.floor(size.x * dpr));
    windOverlayCanvas.height = Math.max(1, Math.floor(size.y * dpr));
    windOverlayCanvas.style.width = `${size.x}px`;
    windOverlayCanvas.style.height = `${size.y}px`;
    if (windOverlayCtx) windOverlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawnParticles = () => {
    windOverlayParticles = [];
    const size = map.getSize();
    const count = Math.max(90, Math.min(180, Math.round((size.x * size.y) / 9000)));
    for (let i = 0; i < count; i++) {
      windOverlayParticles.push({
        x: Math.random() * size.x,
        y: Math.random() * size.y,
        a: 0.18 + Math.random() * 0.30,
        w: 1 + Math.random() * 2,
        seed: Math.random() * 1000
      });
    }
  };

  resize();
  spawnParticles();
  map.on('resize', () => {
    resize();
    spawnParticles();
  });

  const step = (t) => {
    if (!windOverlayCtx || !windOverlayCanvas) return;
    const ctx = windOverlayCtx;
    const size = map.getSize();

    // Fade previous strokes to create a "smoke" trail effect.
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.fillRect(0, 0, size.x, size.y);
    ctx.globalCompositeOperation = 'source-over';

    if (windOverlayVec) {
      const baseVx = windOverlayVec[0] * windOverlaySpeedPx;
      const baseVy = windOverlayVec[1] * windOverlaySpeedPx;

      for (const p of windOverlayParticles) {
        const ox = p.x;
        const oy = p.y;

        // Gentle turbulence so it looks like drifting smoke.
        const n = Math.sin((ox + t * 0.02) * 0.012 + (oy + p.seed) * 0.009) * 0.9;
        const ang = n * 0.55;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);

        const vx = (baseVx * ca - baseVy * sa) * (0.55 + p.w * 0.25);
        const vy = (baseVx * sa + baseVy * ca) * (0.55 + p.w * 0.25);

        p.x += vx;
        p.y += vy;

        // Wrap around edges.
        if (p.x < -20) p.x = size.x + 20;
        if (p.x > size.x + 20) p.x = -20;
        if (p.y < -20) p.y = size.y + 20;
        if (p.y > size.y + 20) p.y = -20;

        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(p.x, p.y);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = `rgba(255,255,255,${p.a})`;
        ctx.stroke();
      }
    }

    windOverlayRaf = requestAnimationFrame(step);
  };

  if (!windOverlayRaf) windOverlayRaf = requestAnimationFrame(step);
}

// Public hook: drive the animated overlay from live weather + plan wind.
window.updateWindOverlay = function(dir, speedMph) {
  ensureWindOverlay();
  const geo = windDirToVector(dir);
  if (!geo) {
    windOverlayVec = null;
    if (windOverlayRoot) windOverlayRoot.style.display = 'none';
    return;
  }

  // Weather direction is "wind coming FROM". We want smoke to drift "TO" the opposite direction.
  const flowGeoX = -geo[0];
  const flowGeoY = -geo[1];

  // Convert geo (east,north) into screen (right,down)
  const sx = flowGeoX;
  const sy = -flowGeoY;
  const mag = Math.hypot(sx, sy) || 1;
  windOverlayVec = [sx / mag, sy / mag];

  const mph = Number(speedMph);
  const spd = Number.isFinite(mph) ? mph : 6;
  windOverlaySpeedPx = Math.max(0.35, Math.min(2.2, 0.45 + spd / 18));
  if (windOverlayRoot) windOverlayRoot.style.display = 'block';
};

function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function vecFromTo(a, b) {
  const aa = L.latLng(a);
  const bb = L.latLng(b);
  const dx = bb.lng - aa.lng;
  const dy = bb.lat - aa.lat;
  const mag = Math.hypot(dx, dy);
  if (!mag) return [0, 0];
  return [dx / mag, dy / mag];
}

// Show enhanced strategy panel
function showStrategyPanel(hotspots, temp, windSpeed, windDir, options = {}) {
  const existing = document.getElementById('strategy-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'strategy-panel';
  panel.className = 'ht-strategy-panel';
  
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];
  const hasHotspots = safeHotspots.length > 0;
  const hotspotsList = safeHotspots
    .map((hotspot) => {
      const tier = hotspot?.tier ?? hotspot?.priority ?? hotspot?.education?.priority ?? 3;
      const accent = getPriorityColor(tier);
      const title = hotspot?.education?.title || 'Hotspot';
      const desc = hotspot?.education?.description || '';
      const rank = hotspot?.rank ?? '';
      return `
        <div style="background:rgba(255,255,255,0.04);padding:10px;margin:10px 0;border-left:4px solid ${accent};border-radius:10px;">
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;">
            <strong style="color:${accent};font-size:13px;">${rank}. ${title}</strong>
            <span style="font-size:11px;color:#AAA;">Priority ${tier}</span>
          </div>
          <div style="font-size:12px;color:#D0D0D0;margin-top:6px;line-height:1.45;">${desc}</div>
        </div>
      `;
    })
    .join('');

  const scoutingBrief = buildScoutingBrief(safeHotspots, huntCriteria, windDir);
  const pinOptions = buildRoutePinOptions(safeHotspots);
  const startPinId = findRoutePinIdByPoint(startPoint);
  const endPinId = findRoutePinIdByPoint(endPoint);
  const routePinSelectOptions = (selectedId) => {
    const opts = pinOptions.map((opt) => {
      const selected = selectedId && opt.id === selectedId ? 'selected' : '';
      return `<option value="${opt.id}" ${selected}>${opt.label}</option>`;
    });
    return ['<option value="">Auto (Pin 1)</option>'].concat(opts).join('');
  };

  const sitRecommendations = safeHotspots
    .slice(0, 3)
    .map((h, idx) => `
      <div style="margin:6px 0;padding:6px;border:1px solid rgba(0,255,136,0.25);border-radius:8px;background:rgba(0,255,136,0.05);">
        <div style="font-weight:700;color:#7cffc7;">Sit ${idx + 1}: ${h?.education?.title || 'Priority Zone'}</div>
        <div style="font-size:12px;color:#ccc;">Best with ${windDir || 'variable'} wind. Approach from downwind cover.</div>
      </div>
    `)
    .join('');

  const mode = options && options.mode ? options.mode : 'route';

  let strategyText = `
    <h2 class="ht-panel-title">Plan + Route</h2>

    <details open>
      <summary>Route Planning</summary>
      <div style="margin-top:10px;">
        <div id="routeModeLabel" style="font-size:12px;color:#bbb;margin-bottom:8px;">Selected routing: Linear</div>
        <div class="ht-route-pin-selects">
          <label for="routeStartSelect">Start Pin</label>
          <select id="routeStartSelect" class="ht-select" onchange="setRouteStartFromPin(this.value)" ${hasHotspots ? '' : 'disabled'}>
            ${routePinSelectOptions(startPinId)}
          </select>
          <label for="routeEndSelect">End Pin</label>
          <select id="routeEndSelect" class="ht-select" onchange="setRouteEndFromPin(this.value)" ${hasHotspots ? '' : 'disabled'}>
            ${routePinSelectOptions(endPinId)}
          </select>
          <div style="font-size:11px;color:#9aa;">Pick pins if you do not want to start at Pin 1.</div>
        </div>
        <button id="routeLinearBtn" class="ht-panel-btn route-option" onclick="selectRoutingMode('linear')" style="margin:8px 0;" ${hasHotspots ? '' : 'disabled'}>Linear</button>
        <button id="routeLoopBtn" class="ht-panel-btn route-option" onclick="selectRoutingMode('loop')" style="margin:8px 0;" ${hasHotspots ? '' : 'disabled'}>Loop</button>
        <button id="routeCustomBtn" class="ht-panel-btn route-option" onclick="selectRoutingMode('custom')" style="margin:8px 0;" ${hasHotspots ? '' : 'disabled'}>Custom Start/End</button>

        <button class="ht-panel-btn ghost" onclick="clearRouteOnly()" style="margin:8px 0;" ${hasHotspots ? '' : 'disabled'}>Clear Route (Keep Pins)</button>

        <button class="ht-panel-btn primary" onclick="letsGoFollowRoute()" style="margin-top:14px;">LET'S GO</button>
        <button class="ht-panel-btn ghost" onclick="clearAllDrawings()" style="margin-top:10px;">Clear All / Start Over</button>
      </div>
    </details>
  `;

  if (mode !== 'route') {
    strategyText += `
      <details>
        <summary>Scouting Layer</summary>
        <div style="margin-top:10px;display:grid;gap:8px;">
          <button class="ht-panel-btn ghost" id="scoutingToggleBtn" onclick="toggleScoutingLayer()">${coreAreaEnabled ? 'Hide' : 'Show'} Core Buck Zones</button>
          <div style="font-size:12px;color:#aaa;">In-depth mode surfaces core mature buck areas for scouting and future sit calculations.</div>
        </div>
      </details>

      <details>
        <summary>Scouting Brief</summary>
        <div style="margin-top:10px;">
          ${scoutingBrief}
        </div>
      </details>

      <details>
        <summary>Best Sit Recommendations</summary>
        <div style="margin-top:10px;">
          ${sitRecommendations || '<div style="color:#aaa;font-size:12px;">Generate a plan to see sit suggestions.</div>'}
        </div>
      </details>

      <details>
        <summary>Locations (collapsed by default)</summary>
        <div style="color:#FFF;font-size:13px;line-height:1.55;margin-top:10px;">
          ${hotspotsList || '<div style="color:#BBB;">No locations generated yet.</div>'}
        </div>
      </details>

      <details>
        <summary>Scouting & Journal</summary>
        <div style="margin-top:10px;display:grid;gap:8px;">
          <button class="ht-panel-btn ghost" onclick="logHuntWaypoint()">Log Waypoint</button>
          <button class="ht-panel-btn ghost" onclick="logJournalEntry()">Add Journal Entry</button>
          <button class="ht-panel-btn ghost" onclick="openHuntJournalPanel()">Open Hunt Journal</button>
        </div>
      </details>

      <details>
        <summary>Saved Plans</summary>
        <div style="margin-top:10px;display:grid;gap:8px;">
          <button class="ht-panel-btn primary" onclick="saveCurrentHuntPlan()">Save Hunt Plan</button>
          <div id="savedPlansList" style="font-size:12px;color:#ddd;"></div>
        </div>
      </details>

      <details>
        <summary>Audio Briefing</summary>
        <div style="margin-top:10px;">
          <button class="ht-panel-btn ghost" onclick="speakHuntPlan()" ${hasHotspots ? '' : 'disabled'}>Listen to Hunt Strategy</button>
        </div>
      </details>
    `;
  }

  strategyText += `
    <button class="ht-panel-btn ghost" onclick="closeStrategyPanel()" style="margin-top:10px;">Close</button>
  `;
  
  panel.innerHTML = strategyText;
  document.body.appendChild(panel);
  setStrategyOpen(true);
  updateTrayToggleButton();

  setSelectedRoutingMode(selectedRoutingMode);

  const timeSelect = document.getElementById('criteriaTime');
  const distanceSelect = document.getElementById('criteriaDistance');
  const fitnessSelect = document.getElementById('criteriaFitness');
  const depthSelect = document.getElementById('criteriaDepth');
  if (timeSelect) timeSelect.value = huntCriteria.time || '60';
  if (distanceSelect) distanceSelect.value = huntCriteria.distance || 'medium';
  if (fitnessSelect) fitnessSelect.value = huntCriteria.fitness || 'intermediate';
  if (depthSelect) depthSelect.value = huntCriteria.depth || 'general';

  renderSavedPlansList();
}

function renderSavedPlansList() {
  const list = document.getElementById('savedPlansList');
  if (!list) return;

  if (!savedHuntPlans.length) {
    list.innerHTML = '<div style="color:#aaa;">No saved plans yet.</div>';
    return;
  }

  list.innerHTML = savedHuntPlans.slice(0, 6).map((plan) => {
    const when = plan.timestamp ? new Date(plan.timestamp).toLocaleDateString() : '';
    return `
      <div class="ht-saved-item">
        <div><strong>${plan.name}</strong><span style="color:#aaa;"> • ${when}</span></div>
        <div class="ht-saved-actions">
          <button class="ht-saved-btn" data-action="load" data-id="${plan.id}">Load</button>
          <button class="ht-saved-btn" data-action="remove" data-id="${plan.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (action === 'load') loadSavedHuntPlan(id);
      if (action === 'remove') removeSavedHuntPlan(id);
    });
  });
}

window.saveCurrentHuntPlan = function() {
  if (!lastPlanSnapshot) {
    showNotice('Generate a plan first.', 'warning', 3200);
    return;
  }

  openInputModal({
    title: 'Save Hunt Plan',
    message: 'Name this plan for quick access later.',
    placeholder: 'Example: Late Feb Ridge Loop',
    confirmLabel: 'Save Plan',
    onSubmit: (name) => {
      if (!name) return;
      const id = `plan_${Date.now()}`;
      savedHuntPlans.unshift({
        id,
        name,
        ...lastPlanSnapshot
      });
      saveHuntPlans();
      renderSavedPlansList();
      showNotice('Hunt plan saved.', 'success', 3200);
    }
  });
};

function loadSavedHuntPlan(id) {
  const plan = savedHuntPlans.find((entry) => entry.id === id);
  if (!plan) return;

  huntCriteria = plan.criteria || huntCriteria;
  if (plan.bounds) {
    const bounds = L.latLngBounds([plan.bounds.south, plan.bounds.west], [plan.bounds.north, plan.bounds.east]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }
  const hydratedHotspots = (plan.hotspots || []).map((h) => ({
    ...h,
    education: buildCustomHotspotEducation({
      habitat: h.habitat,
      base: SHED_EDUCATION[h.habitat] || SHED_EDUCATION.transition,
      latlng: Array.isArray(h.coords) ? L.latLng(h.coords[0], h.coords[1]) : null,
      bounds: plan.bounds
        ? L.latLngBounds([plan.bounds.south, plan.bounds.west], [plan.bounds.north, plan.bounds.east])
        : null,
      windDir: plan.wind || null,
      criteria: plan.criteria || huntCriteria
    })
  }));
  coreAreaEnabled = huntCriteria.depth === 'deep' || huntCriteria.depth === 'medium';
  if (plan.coreZones && plan.coreZones.length) {
    buildScoutingLayerFromZones(plan.coreZones);
  } else {
    clearScoutingLayer();
  }
  showNotice(`Loaded plan: ${plan.name}`, 'success', 3200);
  showStrategyPanel(hydratedHotspots, plan.temperature || null, plan.windSpeed || null, plan.wind || null, { mode: 'plan' });
}

function removeSavedHuntPlan(id) {
  savedHuntPlans = savedHuntPlans.filter((entry) => entry.id !== id);
  saveHuntPlans();
  renderSavedPlansList();
}

window.logJournalEntry = function() {
  openInputModal({
    title: 'Hunt Journal Entry',
    message: 'Log a scouting note or hunt journal entry.',
    placeholder: 'Example: Bedding area with heavy trails on north slope.',
    multiline: true,
    confirmLabel: 'Save Entry',
    onSubmit: (notes) => {
      if (!notes) return;
      huntJournalEntries.unshift({
        id: `note_${Date.now()}`,
        type: 'note',
        notes,
        timestamp: new Date().toISOString()
      });
      saveHuntJournal();
      showNotice('Journal entry saved.', 'success', 3200);
    }
  });
};

window.openHuntJournalPanel = function() {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = `
    <h3>Hunt Journal</h3>
    <div style="display:grid;gap:8px;margin-bottom:10px;">
      <label style="font-size:12px;color:#bbb;">Type</label>
      <select id="journalType" class="ht-select">
        <option value="all" selected>All Entries</option>
        <option value="waypoint">Waypoints</option>
        <option value="shed_find">Shed Finds</option>
        <option value="note">Notes</option>
      </select>
      <label style="font-size:12px;color:#bbb;">Date Range</label>
      <select id="journalRange" class="ht-select">
        <option value="7">Last 7 days</option>
        <option value="30" selected>Last 30 days</option>
        <option value="90">Last 90 days</option>
        <option value="all">All time</option>
      </select>
    </div>
    <div id="journalList" style="max-height:280px;overflow:auto;"></div>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn primary">Close</button>
    </div>
  `;

  const closeModal = () => backdrop.remove();
  modal.querySelector('button')?.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const typeSelect = modal.querySelector('#journalType');
  const rangeSelect = modal.querySelector('#journalRange');
  const list = modal.querySelector('#journalList');

  const render = () => {
    const type = typeSelect.value;
    const range = rangeSelect.value;
    const now = Date.now();
    const maxAge = range === 'all' ? Infinity : Number(range) * 24 * 60 * 60 * 1000;

    const entries = huntJournalEntries.filter((entry) => {
      if (type !== 'all' && entry.type !== type) return false;
      if (!entry.timestamp) return true;
      const age = now - new Date(entry.timestamp).getTime();
      return age <= maxAge;
    });

    if (!entries.length) {
      list.innerHTML = '<div style="color:#aaa;font-size:12px;">No entries found.</div>';
      return;
    }

    list.innerHTML = entries.map((entry) => {
      const when = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '';
      const meta = entry.type === 'waypoint'
        ? ` • ${entry.signType || 'sign'} • ${entry.confidence || 'medium'} confidence`
        : '';
      return `
        <div style="margin:8px 0;padding:8px;border:1px solid rgba(255,193,7,0.2);border-radius:8px;background:rgba(255,255,255,0.04);">
          <div style="font-weight:bold;color:#FFD700;">${entry.type.replace('_', ' ').toUpperCase()} • ${when}${meta}</div>
          <div style="font-size:12px;color:#ddd;">${String(entry.notes || '').replace(/</g, '&lt;')}</div>
        </div>
      `;
    }).join('');
  };

  typeSelect.addEventListener('change', render);
  rangeSelect.addEventListener('change', render);
  render();
};

window.selectLocationRadius = function() {
  clearRadiusDraft();
  mapClickMode = 'radius-draw';
  showSelectionNoticeOnce('Click to set the center, drag outward, then click to lock the radius.', 'info', 5200);
};

window.selectParcelBoundary = function() {
  mapClickMode = 'parcel';
  showSelectionNoticeOnce('Click the parcel to lock the boundary.', 'info', 4200);
};

window.drawHuntArea = function() {
  mapClickMode = null;
  const drawer = new L.Draw.Polygon(map, drawControl.options.draw.polygon);
  drawer.enable();
};

window.lockPropertyBoundary = function() {
  mapClickMode = null;
  const drawer = new L.Draw.Rectangle(map, drawControl.options.draw.rectangle);
  drawer.enable();
};

window.selectStartPoint = function() {
  mapClickMode = 'start';
  showSelectionNoticeOnce('Click the map to set your start point.', 'info', 4200);
};

window.selectEndPoint = function() {
  mapClickMode = 'end';
  showSelectionNoticeOnce('Click the map to set your end point.', 'info', 4200);
};

window.createLoopBackRoute = function() {
  window.selectRoutingMode('loop');
};

window.setRadiusFromLocation = function() {
  if (!navigator.geolocation) {
    showNotice('GPS not available.', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    const centerLatlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
    map.setView(centerLatlng, 15);
    mapClickMode = 'radius-draw';
    startRadiusDraft(centerLatlng);
    showNotice('Drag outward to size your radius, then click to lock it.', 'info', 5200);
  });
};

window.togglePublicLand = function(force) {
  const toggle = document.getElementById('publicLandToggle');
  const enabled = typeof force === 'boolean'
    ? force
    : (toggle ? toggle.checked : !publicLandEnabled);
  if (toggle) toggle.checked = enabled;
  setPublicLandEnabled(enabled);
  updateMapToggleButtons();
};

window.toggleMdcLand = function(force) {
  const toggle = document.getElementById('mdcLandToggle');
  const enabled = typeof force === 'boolean'
    ? force
    : (toggle ? toggle.checked : !mdcLandEnabled);
  if (toggle) toggle.checked = enabled;
  setMdcLandEnabled(enabled);
  updateMapToggleButtons();
};

window.togglePrivateParcels = function(force) {
  setSelectedRoutingMode('custom');
  showNotice('Custom route: click to set START, then END. Then tap LET\'S GO to build.', 'info', 5200);

  clearCustomRouteSelection();
  let clickCount = 0;

  customRouteClickHandler = function(e) {
    if (clickCount === 0) {
      startPoint = e.latlng;
      if (startPointMarker) map.removeLayer(startPointMarker);
      startPointMarker = L.marker(startPoint, {
        icon: L.divIcon({
          html: '<div style="background:#00FF00;color:#000;padding:8px 12px;border-radius:20px;font-weight:bold;border:3px solid #fff;">START</div>',
          className: ''
        })
      }).addTo(map);
      clickCount++;
      showNotice('Start point set. Now click your END point.', 'success', 4200);
      return;
    }

    endPoint = e.latlng;
    if (endPointMarker) map.removeLayer(endPointMarker);
    endPointMarker = L.marker(endPoint, {
      icon: L.divIcon({
        html: '<div style="background:#FF0000;color:#fff;padding:8px 12px;border-radius:20px;font-weight:bold;border:3px solid #fff;">END</div>',
        className: ''
      })
    }).addTo(map);

    map.off('click', customRouteClickHandler);
    customRouteClickHandler = null;
    showNotice('Custom start/end set. Tap LET\'S GO to build the route.', 'success', 4200);
  };

  map.on('click', customRouteClickHandler);
  terrainFeatureLayer = L.layerGroup().addTo(map);
  return terrainFeatureLayer;
}

function clearTerrainFeatures() {
  try {
    if (terrainFeatureLayer) terrainFeatureLayer.clearLayers();
  } catch {}
  terrainFeatures = [];
  terrainFeatureVisited.clear();
}

function getTerrainPinIcon(type) {
  const safeType = String(type || 'feature').toLowerCase();
  const cssType = safeType.replace(/_/g, '-');
  const labels = {
    ridge: 'R',
    saddle: 'S',
    low_spot: 'S',
    bench: 'B',
    pinch: 'P',
    creek_crossing: 'C',
    drainage: 'C',
    pond: 'W',
    steep: '!'
  };
  const label = labels[safeType] || 'T';
  return L.divIcon({
    html: `<div class="ht-terrain-pin ht-terrain-pin-${cssType}">${label}</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

function densifyLatLngs(latlngs, spacingMeters) {
  if (!Array.isArray(latlngs) || latlngs.length < 2) return Array.isArray(latlngs) ? latlngs.slice() : [];
  const spacing = Math.max(25, Number(spacingMeters) || DEFAULT_TERRAIN_SCAN_SAMPLE_SPACING_M);

  const out = [L.latLng(latlngs[0])];
  for (let i = 0; i < latlngs.length - 1; i++) {
    const a = L.latLng(latlngs[i]);
    const b = L.latLng(latlngs[i + 1]);
    const dist = a.distanceTo(b);
    if (!Number.isFinite(dist) || dist <= 0) continue;

    const steps = Math.min(12, Math.max(1, Math.floor(dist / spacing)));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const lat = a.lat + (b.lat - a.lat) * t;
      const lng = a.lng + (b.lng - a.lng) * t;
      out.push(L.latLng(lat, lng));
    }
  }
  return out;
}

function downsampleLatLngs(latlngs, spacingMeters, maxPoints) {
  if (!Array.isArray(latlngs) || !latlngs.length) return [];
  const spacing = Math.max(40, Number(spacingMeters) || 80);
  const limit = Math.max(6, Number(maxPoints) || 40);
  const out = [L.latLng(latlngs[0])];
  for (let i = 1; i < latlngs.length; i++) {
    const ll = L.latLng(latlngs[i]);
    if (out[out.length - 1].distanceTo(ll) >= spacing) out.push(ll);
    if (out.length >= limit) {
      out[out.length - 1] = L.latLng(latlngs[latlngs.length - 1]);
      break;
    }
  }
  if (out.length < 2 && latlngs.length > 1) out.push(L.latLng(latlngs[latlngs.length - 1]));
  return out;
}

function offsetLatLngMeters(latlng, dxMeters, dyMeters) {
  const ll = L.latLng(latlng);
  const dLat = dyMeters / 111111;
  const dLng = dxMeters / (111111 * Math.cos((ll.lat * Math.PI) / 180));
  return L.latLng(ll.lat + dLat, ll.lng + dLng);
}

async function clampRouteToContours(points) {
  if (!CONTOUR_CLAMP_ENABLED) return Array.isArray(points) ? points.slice() : [];
  const endpoint = String(window.ELEVATION_API_URL || '').trim();
  if (!endpoint) return Array.isArray(points) ? points.slice() : [];

  const base = densifyLatLngs(points, 90);
  const sparse = downsampleLatLngs(base, 90, 36);
  if (sparse.length < 2) return Array.isArray(points) ? points.slice() : [];

  const intervalM = Math.max(1, CONTOUR_INTERVAL_FT) * 0.3048;
  const offsetMeters = 25;
  const maxOffset = 40;

  const samples = [];
  const meta = [];

  for (let i = 0; i < sparse.length; i++) {
    const curr = sparse[i];
    const prev = sparse[i - 1] || curr;
    const next = sparse[i + 1] || curr;
    const dx = next.lng - prev.lng;
    const dy = next.lat - prev.lat;
    const mag = Math.hypot(dx, dy) || 1;
    const nx = -dy / mag;
    const ny = dx / mag;

    const left = offsetLatLngMeters(curr, nx * -offsetMeters, ny * -offsetMeters);
    const right = offsetLatLngMeters(curr, nx * offsetMeters, ny * offsetMeters);

    meta.push({ curr, nx, ny });
    samples.push(curr, left, right);
  }

  let elevs;
  try {
    elevs = await fetchElevationsForPoints(samples);
  } catch {
    return Array.isArray(points) ? points.slice() : [];
  }

  const adjusted = [];
  for (let i = 0; i < meta.length; i++) {
    const e0 = elevs[i * 3];
    const eL = elevs[i * 3 + 1];
    const eR = elevs[i * 3 + 2];
    if (!Number.isFinite(e0) || !Number.isFinite(eL) || !Number.isFinite(eR)) {
      adjusted.push(meta[i].curr);
      continue;
    }

    const target = Math.round(e0 / intervalM) * intervalM;
    const grad = (eR - eL) / (2 * offsetMeters);
    if (!Number.isFinite(grad) || Math.abs(grad) < 0.02) {
      adjusted.push(meta[i].curr);
      continue;
    }

    let move = (target - e0) / grad;
    if (!Number.isFinite(move)) move = 0;
    move = Math.max(-maxOffset, Math.min(maxOffset, move));
    const shifted = offsetLatLngMeters(meta[i].curr, meta[i].nx * move, meta[i].ny * move);
    adjusted.push(shifted);
  }

  return adjusted;
}

async function buildDisplayRouteCoords(coords) {
  const base = Array.isArray(coords) ? coords.slice() : [];
  if (base.length < 2) return base;
  let shaped = base;
  try {
    shaped = await clampRouteToContours(base);
  } catch {
    shaped = base;
  }
  const dense = densifyLatLngs(shaped, 55);
  return smoothRouteLine(dense, 10);
}

async function buildTerrainRouteCoords(coords) {
  const base = await buildDisplayRouteCoords(coords);
  const dense = densifyLatLngs(base, 35);
  return smoothRouteLine(dense, 14);
}

function smoothRouteLine(points, segments = 8) {
  if (!Array.isArray(points) || points.length < 3) return Array.isArray(points) ? points.slice() : [];
  const pts = points.map((p) => L.latLng(p));
  const out = [];
  const segs = Math.max(4, Math.min(16, Number(segments) || 8));

  const get = (idx) => pts[Math.min(Math.max(idx, 0), pts.length - 1)];

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);

    for (let t = 0; t < segs; t++) {
      const s = t / segs;
      const s2 = s * s;
      const s3 = s2 * s;
      const lat = 0.5 * ((2 * p1.lat) + (-p0.lat + p2.lat) * s + (2 * p0.lat - 5 * p1.lat + 4 * p2.lat - p3.lat) * s2 + (-p0.lat + 3 * p1.lat - 3 * p2.lat + p3.lat) * s3);
      const lng = 0.5 * ((2 * p1.lng) + (-p0.lng + p2.lng) * s + (2 * p0.lng - 5 * p1.lng + 4 * p2.lng - p3.lng) * s2 + (-p0.lng + 3 * p1.lng - 3 * p2.lng + p3.lng) * s3);
      out.push(L.latLng(lat, lng));
    }
  }

  out.push(L.latLng(pts[pts.length - 1]));
  return out;
}

async function fetchElevationsForPoints(latlngs) {
  const endpoint = String(window.ELEVATION_API_URL || '').trim();
  if (!endpoint) throw new Error('ELEVATION_API_URL not configured');
  if (!Array.isArray(latlngs) || !latlngs.length) return [];

  const maxPoints = 180;
  const points = latlngs.slice(0, maxPoints);
  const chunkSize = 90;
  const elevations = [];

  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize);
    const locations = chunk.map((p) => `${p.lat},${p.lng}`).join('|');
    const url = `${endpoint}?locations=${encodeURIComponent(locations)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Elevation API HTTP ${res.status}`);
    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    if (!results.length) throw new Error('Elevation API returned no results');
    results.forEach((r) => {
      const elev = Number(r?.elevation);
      elevations.push(Number.isFinite(elev) ? elev : null);
    });
  }

  return elevations.slice(0, points.length);
}

function detectTerrainFeatures(samples, elevations) {
  const features = [];
  if (!Array.isArray(samples) || samples.length < 5) return features;
  if (!Array.isArray(elevations) || elevations.length !== samples.length) return features;

  const elev = elevations.map((v) => (Number.isFinite(v) ? v : null));
  const dist = [0];
  for (let i = 1; i < samples.length; i++) {
    dist[i] = dist[i - 1] + samples[i - 1].distanceTo(samples[i]);
  }

  const slopes = [];
  for (let i = 0; i < samples.length - 1; i++) {
    const d = samples[i].distanceTo(samples[i + 1]);
    const de = elev[i] != null && elev[i + 1] != null ? elev[i + 1] - elev[i] : null;
    slopes[i] = d > 0 && de != null ? de / d : null;
  }

  const addFeature = (idx, type, label, detail) => {
    const p = samples[idx];
    if (!p) return;
    const id = `${type}-${idx}-${Math.round(p.lat * 1e5)}-${Math.round(p.lng * 1e5)}`;
    features.push({ id, type, label, detail, latlng: p });
  };

  // Local highs/lows along the walked line.
  const minProm = 10; // meters prominence along the line
  for (let i = 2; i < samples.length - 2; i++) {
    if (elev[i] == null) continue;
    const prev = elev[i - 2];
    const next = elev[i + 2];
    if (prev == null || next == null) continue;

    const isHigh = elev[i] > prev + minProm && elev[i] > next + minProm;
    const isLow = elev[i] < prev - minProm && elev[i] < next - minProm;
    if (isHigh) {
      addFeature(i, 'ridge', 'Ridge / Spine', 'Likely ridge travel or crest crossing. Bucks use high ground for wind advantage and visibility.');
    } else if (isLow) {
      addFeature(i, 'saddle', 'Saddle Crossing', 'Low spot between higher ground. Natural crossing and movement funnel.');

      const leftSlope = slopes[i - 1];
      const rightSlope = slopes[i + 1];
      const pinchSlope = 0.2;
      if (leftSlope != null && rightSlope != null && Math.abs(leftSlope) >= pinchSlope && Math.abs(rightSlope) >= pinchSlope) {
        addFeature(i, 'pinch', 'Pinch Point', 'Tight terrain funnel with steep sides. Expect concentrated movement.');
      }

      const pondSlope = 0.015;
      if (leftSlope != null && rightSlope != null && Math.abs(leftSlope) <= pondSlope && Math.abs(rightSlope) <= pondSlope) {
        addFeature(i, 'pond', 'Pond / Water', 'Low, flat area that can hold water or wet ground. Check edges and crossings.');
      }
    }
  }

  // Steep segments.
  const steepSlope = 0.18; // ~10° grade
  for (let i = 0; i < slopes.length; i++) {
    if (slopes[i] == null) continue;
    if (Math.abs(slopes[i]) >= steepSlope) {
      addFeature(i, 'steep', 'Steep Face / Sidehill', 'Steep terrain nearby. Expect side-hilling and concentrated travel on easier lines.');
    }
  }

  // Bench-like segments: sustained low slope stretch.
  const benchSlope = 0.03;
  let runStart = null;
  for (let i = 0; i < slopes.length; i++) {
    const s = slopes[i];
    const isFlat = s != null && Math.abs(s) <= benchSlope;
    if (isFlat && runStart == null) runStart = i;
    if ((!isFlat || i === slopes.length - 1) && runStart != null) {
      const runEnd = isFlat && i === slopes.length - 1 ? i : i - 1;
      const meters = dist[runEnd] - dist[runStart];
      if (meters >= 220) {
        const mid = Math.floor((runStart + runEnd) / 2);
        addFeature(mid, 'bench', 'Bench / Shelf', 'A flatter travel band can act like a bench. Scan for sign where it intersects cover edges or drainages.');
      }
      runStart = null;
    }
  }

  // Drainage-like low trend: lowest point in a longer window.
  const windowSize = 10;
  for (let i = windowSize; i < samples.length - windowSize; i++) {
    const center = elev[i];
    if (center == null) continue;
    let min = center;
    let minIdx = i;
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (elev[j] == null) continue;
      if (elev[j] < min) {
        min = elev[j];
        minIdx = j;
      }
    }
    if (minIdx === i) {
      const left = elev[i - windowSize];
      const right = elev[i + windowSize];
      if (left != null && right != null && (left - center) >= 12 && (right - center) >= 12) {
        addFeature(i, 'creek_crossing', 'Creek Crossing', 'Low, sheltered travel. Check crossings, ditch bottoms, and where cover stacks against water/terrain.');
      }
    }
  }

  // De-dupe close features (keep the first of each type within ~120m)
  const filtered = [];
  for (const f of features) {
    const tooClose = filtered.some((x) => x.type === f.type && x.latlng.distanceTo(f.latlng) < 120);
    if (!tooClose) filtered.push(f);
  }
  return filtered.slice(0, 40);
}

async function analyzeTerrainAlongRoute(latlngs) {
  clearTerrainFeatures();

  const spacing = Number(window.TERRAIN_SCAN_SAMPLE_SPACING_M || DEFAULT_TERRAIN_SCAN_SAMPLE_SPACING_M);
  const routePoints = Array.isArray(latlngs) ? latlngs : [];
  if (routePoints.length < 2) return;

  showNotice('Scanning terrain along route…', 'info', 2400);

  const samples = densifyLatLngs(routePoints, spacing);
  let elevations;
  try {
    elevations = await fetchElevationsForPoints(samples);
  } catch (err) {
    const msg = err && err.message ? err.message : 'Elevation lookup failed.';
    showNotice(`Terrain scan unavailable: ${msg}`, 'warning', 5200);
    return;
  }

  const features = detectTerrainFeatures(samples, elevations);
  if (!features.length) {
    showNotice('Terrain scan complete: no standout features detected on this line.', 'info', 4200);
    return;
  }

  const layer = ensureTerrainFeatureLayer();
  terrainFeatures = features;

  for (const feature of features) {
    const icon = getTerrainPinIcon(feature.type);
    const marker = L.marker(feature.latlng, { icon }).addTo(layer);
    feature.marker = marker;
    maybeBindPopup(
      marker,
      `<div style=\"font-weight:800;\">${escapeHtml(feature.label || 'Terrain Feature')}</div>` +
        `<div style=\"font-size:12px;color:#444;margin-top:6px;\">${escapeHtml(feature.detail || '')}</div>`
    );
  }

  showNotice(`Terrain scan complete: ${features.length} feature pins added.`, 'success', 4200);
}

async function fetchOsrmWalkingRoute(points) {
  const base = String(window.WALK_ROUTER_URL || '').trim();
  if (!base) return null;
  if (!Array.isArray(points) || points.length < 2) return null;

  const waypoints = points.length > OSRM_MAX_WAYPOINTS
    ? points.filter((_, idx) => idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / OSRM_MAX_WAYPOINTS) === 0)
    : points;

  const coordStr = waypoints
    .map((p) => {
      const ll = L.latLng(p);
      return `${ll.lng},${ll.lat}`;
    })
    .join(';');

  const url = `${base}/${coordStr}?overview=full&geometries=geojson&steps=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Router HTTP ${res.status}`);
  const data = await res.json();
  const coords = data?.routes?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) throw new Error('Router returned no path');
  return coords.map(([lng, lat]) => L.latLng(lat, lng));
}

async function fetchOsrmWalkingRouteForLegs(points) {
  const base = String(window.WALK_ROUTER_URL || '').trim();
  if (!base) return null;
  if (!Array.isArray(points) || points.length < 2) return null;

  const merged = [];
  for (let i = 0; i < points.length - 1; i++) {
    let leg = null;
    try {
      leg = await fetchOsrmWalkingRoute([points[i], points[i + 1]]);
    } catch {
      leg = null;
    }

    if (!Array.isArray(leg) || leg.length < 2) {
      leg = [L.latLng(points[i]), L.latLng(points[i + 1])];
    }

    if (i > 0 && leg.length) leg = leg.slice(1);
    merged.push(...leg);
  }

  return merged.length >= 2 ? merged : null;
}

function drawRouteLine(coords) {
  const routeCoords = coords;
  if (routeLineGlow) map.removeLayer(routeLineGlow);
  if (routeLine) map.removeLayer(routeLine);

  routeLineGlow = L.polyline(routeCoords, {
    color: '#00FF88',
    weight: 7,
    opacity: 0.16,
    lineCap: 'round',
    lineJoin: 'round',
    className: 'ht-route-line ht-route-line--glow'
  }).addTo(map);

  routeLine = L.polyline(routeCoords, {
    color: '#00FF88',
    weight: 3,
    opacity: 0.9,
    dashArray: '8, 8',
    lineCap: 'round',
    lineJoin: 'round',
    className: 'ht-route-line'
  }).addTo(map);

  if (activeWindDir) {
    try { updateWindOverlay(activeWindDir, activeWindSpeed); } catch {}
  }
}

function estimateRouteMiles(points) {
  if (!Array.isArray(points) || points.length < 2) return 0;
  let meters = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = L.latLng(points[i]);
    const b = L.latLng(points[i + 1]);
    meters += a.distanceTo(b);
  }
  return meters / 1609.34;
}

function getHotspotRouteLatLngsOrdered() {
  const rankOf = (m) => {
    const r = m && m.__hotspotData ? m.__hotspotData.rank : null;
    const n = Number(r);
    return Number.isFinite(n) && n > 0 ? n : Number.POSITIVE_INFINITY;
  };

  return hotspotMarkers
    .slice()
    .sort((a, b) => rankOf(a) - rankOf(b))
    .map((m) => m.getLatLng());
}

function dedupeSequentialLatLngs(points, toleranceMeters = 2) {
  if (!Array.isArray(points) || points.length === 0) return [];
  const out = [];
  for (const p of points) {
    const ll = L.latLng(p);
    const prev = out.length ? out[out.length - 1] : null;
    if (!prev || prev.distanceTo(ll) > toleranceMeters) out.push(ll);
  }
  return out;
}

function stripPointFromRoute(points, target, toleranceMeters = 8) {
  if (!Array.isArray(points) || !points.length || !target) return Array.isArray(points) ? points.slice() : [];
  const t = L.latLng(target);
  return points.filter((p) => L.latLng(p).distanceTo(t) > toleranceMeters);
}

function isRouteDetour(idealPoints, walkedPoints) {
  const idealMiles = estimateRouteMiles(idealPoints);
  const walkedMiles = estimateRouteMiles(walkedPoints);
  if (!idealMiles || !walkedMiles) return false;

  // If OSRM is wildly longer than the straight plan, it usually means no nearby trails
  // and it routed around roads/boundaries. Fall back to a direct line to keep Loop sane.
  return walkedMiles > Math.max(idealMiles * 2.5, idealMiles + 1.0);
}

function getRouteStyle() {
  const style = String(ROUTE_STYLE || '').toLowerCase();
  if (style === 'osrm' || style === 'trail') return 'osrm';
  if (style === 'straight' || style === 'linear') return 'straight';
  return 'terrain';
}

function buildScoutingBrief(hotspots, criteria, windDir) {
  const depth = criteria?.depth || 'general';
  const hotspotCount = hotspots.length;
  const effort = criteria?.distance === 'short' ? 'Low' : criteria?.distance === 'extended' ? 'High' : 'Medium';
  const time = Number(criteria?.time || 60);
  const estMiles = estimateRouteMiles(hotspots.map((h) => h.coords)) * 1.2;
  const minutesPerMile = criteria?.fitness === 'expert' ? 15 : criteria?.fitness === 'advanced' ? 18 : criteria?.fitness === 'beginner' ? 28 : 22;
  const estMinutes = Math.round(estMiles * minutesPerMile);
  const timeFit = estMinutes <= time ? 'On pace' : 'Aggressive';
  const pressure = depth === 'deep' ? 'Low tolerance for pressure - prioritize quiet access.' : 'Moderate tolerance - stay on terrain breaks.';

  const zones = coreZones.length
    ? coreZones
        .slice(0, 4)
        .map((z) => `
          <div style="margin:6px 0;padding:6px;border:1px solid rgba(255,193,7,0.2);border-radius:8px;background:rgba(255,255,255,0.04);">
            <div style="font-weight:700;color:#FFD700;">${z.type} • Score ${z.score}/100</div>
            <div style="font-size:12px;color:#ccc;">Best wind: ${z.wind} • ${z.sign}</div>
            <div style="font-size:12px;color:#ccc;">Terrain: ${z.terrain} • Cover: ${z.cover}</div>
            <div style="font-size:12px;color:#999;">${z.pressure} • ${z.access}</div>
          </div>
        `)
        .join('')
    : '<div style="color:#aaa;font-size:12px;">Core zones available in Medium or In-Depth search.</div>';

  return `
    <div style="display:grid;gap:8px;">
      <div style="font-size:12px;color:#bbb;">Wind: ${windDir || '--'} • Effort: ${effort} • Time fit: ${timeFit}</div>
      <div style="font-size:12px;color:#bbb;">Estimated route: ${estMiles.toFixed(1)} miles • ${estMinutes} mins</div>
      <div style="font-size:12px;color:#bbb;">Hotspots: ${hotspotCount} • ${pressure}</div>
      <div style="font-size:12px;color:#bbb;">Top Core Buck Zones</div>
      ${zones}
    </div>
  `;
}

// Create optimal route
window.createOptimalRoute = function(type) {
  if (hotspotMarkers.length === 0) return;
  
  // Clear previous route
  if (routeLineGlow) map.removeLayer(routeLineGlow);
  if (routeLine) map.removeLayer(routeLine);
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);
  if (startPointMarker) {
    map.removeLayer(startPointMarker);
    startPointMarker = null;
  }
  if (endPointMarker) {
    map.removeLayer(endPointMarker);
    endPointMarker = null;
  }
  
  let hotspotCoords = getHotspotRouteLatLngsOrdered();
  const coords = [];
  const windVec = windDirToVector(activeWindDir);

  const isCustom = Boolean(startPoint || endPoint);
  let startCoord = startPoint || hotspotCoords[0];
  let endCoord = endPoint || hotspotCoords[hotspotCoords.length - 1];

  hotspotCoords = stripPointFromRoute(hotspotCoords, startCoord);
  hotspotCoords = stripPointFromRoute(hotspotCoords, endCoord);

  // For linear/loop, prefer traveling into the wind by reversing order when beneficial.
  // For custom start/end, respect the user's chosen direction.
  if (windVec && !isCustom) {
    if (type === 'linear') {
      const forwardVec = vecFromTo(startCoord, endCoord);
      if (dot2(forwardVec, windVec) < 0) {
        hotspotCoords = hotspotCoords.slice().reverse();
        startCoord = hotspotCoords[0];
        endCoord = hotspotCoords[hotspotCoords.length - 1];
      }
    }

    if (type === 'loop' && hotspotCoords.length >= 2) {
      const a = hotspotCoords[0];
      const b = hotspotCoords[hotspotCoords.length - 1];
      const firstForward = vecFromTo(startCoord, a);
      const firstReverse = vecFromTo(startCoord, b);
      if (dot2(firstReverse, windVec) > dot2(firstForward, windVec)) {
        hotspotCoords = hotspotCoords.slice().reverse();
      }
    }
  }

  if (type === 'loop') {
    // Loop should be: ordered hotspots, return to start.
    // Avoid duplicated waypoints (which can confuse OSRM and create huge detours).
    const base = hotspotCoords.slice();
    const loop = base.length ? base.concat([base[0]]) : [];
    coords.push(...loop);
  } else {
    // Linear should be: start -> ordered hotspots -> end.
    // Include custom start/end if set, but keep the ordered hotspot spine.
    coords.push(startCoord);
    coords.push(...hotspotCoords);
    coords.push(endCoord);
  }

  const idealCoords = dedupeSequentialLatLngs(coords);
  const routeStyle = getRouteStyle();
  const routeBuilder = routeStyle === 'terrain' ? buildTerrainRouteCoords : buildDisplayRouteCoords;
  
  (async () => {
    let walked = null;
    try {
      if (routeStyle === 'osrm') {
        // OSRM can produce huge detours when there are no nearby trails.
        // Guard and fall back to a direct line in that case.
        walked = idealCoords.length > OSRM_MAX_WAYPOINTS
          ? await fetchOsrmWalkingRouteForLegs(idealCoords)
          : await fetchOsrmWalkingRoute(idealCoords);
        if (walked && walked.length >= 2 && isRouteDetour(idealCoords, walked)) {
          walked = null;
          showNotice('Trail routing detoured too far; using a direct route instead.', 'warning', 4200);
        }
      }
    } catch (err) {
      const msg = err && err.message ? err.message : 'Router unavailable.';
      if (routeStyle === 'osrm') {
        showNotice(`Trail routing unavailable, using direct line. (${msg})`, 'warning', 4200);
      }
    }

    let displayCoords = idealCoords;
    if (routeStyle === 'straight') {
      displayCoords = idealCoords;
    } else if (walked && walked.length >= 2) {
      displayCoords = await routeBuilder(walked);
    } else {
      displayCoords = await routeBuilder(idealCoords);
    }
    drawRouteLine(displayCoords);

    try {
      const routeLatLngs = routeLine && routeLine.getLatLngs ? routeLine.getLatLngs() : null;
      if (Array.isArray(routeLatLngs) && routeLatLngs.length >= 2) {
        await analyzeTerrainAlongRoute(routeLatLngs);
      }
    } catch {}

    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  })();
  
  // Start marker
  // For loop routes, the visual start should be the first hotspot.
  const startForMarker = type === 'loop' ? (hotspotCoords[0] || startCoord) : startCoord;
  startMarker = L.marker(startForMarker, {
    icon: L.divIcon({
      html: '<div style="background:#00FF00;color:#000;padding:8px 12px;border-radius:20px;font-weight:bold;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.4);">START</div>',
      className: ''
    })
  }).addTo(map);
  
  // End marker
  if (type === 'linear') {
    endMarker = L.marker(endCoord, {
      icon: L.divIcon({
        html: '<div style="background:#FF0000;color:#fff;padding:8px 12px;border-radius:20px;font-weight:bold;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.4);">END</div>',
        className: ''
      })
    }).addTo(map);
  }
  
  showNotice(`${type === 'loop' ? 'Loop' : 'Linear'} route created. Follow the highlighted path.`, 'success', 4200);
};

// Custom route selection
window.selectCustomRoute = function() {
  showNotice('Custom route mode: click to set START, then END. Route follows hotspots.', 'info', 5200);
  
  let clickCount = 0;
  let customStart, customEnd;
  
  const clickHandler = function(e) {
    if (clickCount === 0) {
      customStart = e.latlng;
      if (startMarker) map.removeLayer(startMarker);
      startMarker = L.marker(customStart, {
        icon: L.divIcon({
          html: '<div style="background:#00FF00;color:#000;padding:8px 12px;border-radius:20px;font-weight:bold;border:3px solid #fff;">START</div>',
          className: ''
        })
      }).addTo(map);
      clickCount++;
      showNotice('Start point set. Now click your END point.', 'success', 4200);
    } else {
      customEnd = e.latlng;
      if (endMarker) map.removeLayer(endMarker);
      endMarker = L.marker(customEnd, {
        icon: L.divIcon({
          html: '<div style="background:#FF0000;color:#fff;padding:8px 12px;border-radius:20px;font-weight:bold;border:3px solid #fff;">END</div>',
          className: ''
        })
      }).addTo(map);
      
      // Build route
      const coords = [customStart];
      let hotspotCoords = getHotspotRouteLatLngsOrdered();
      hotspotCoords = stripPointFromRoute(hotspotCoords, customStart);
      hotspotCoords = stripPointFromRoute(hotspotCoords, customEnd);
      coords.push(...hotspotCoords);
      coords.push(customEnd);
      const idealCoords = dedupeSequentialLatLngs(coords);
      const routeStyle = getRouteStyle();
      const routeBuilder = routeStyle === 'terrain' ? buildTerrainRouteCoords : buildDisplayRouteCoords;

      (async () => {
        let walked = null;
        try {
          if (routeStyle === 'osrm') {
            walked = idealCoords.length > OSRM_MAX_WAYPOINTS
              ? await fetchOsrmWalkingRouteForLegs(idealCoords)
              : await fetchOsrmWalkingRoute(idealCoords);
            if (walked && walked.length >= 2 && isRouteDetour(idealCoords, walked)) {
              walked = null;
              showNotice('Trail routing detoured too far; using a direct route instead.', 'warning', 4200);
            }
          }
        } catch (err) {
          const msg = err && err.message ? err.message : 'Router unavailable.';
          if (routeStyle === 'osrm') {
            showNotice(`Trail routing unavailable, using direct line. (${msg})`, 'warning', 4200);
          }
        }

        let displayCoords = idealCoords;
        if (routeStyle === 'straight') {
          displayCoords = idealCoords;
        } else if (walked && walked.length >= 2) {
          displayCoords = await routeBuilder(walked);
        } else {
          displayCoords = await routeBuilder(idealCoords);
        }
        drawRouteLine(displayCoords);

        try {
          const routeLatLngs = routeLine && routeLine.getLatLngs ? routeLine.getLatLngs() : null;
          if (Array.isArray(routeLatLngs) && routeLatLngs.length >= 2) {
            await analyzeTerrainAlongRoute(routeLatLngs);
          }
        } catch {}

        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      })();
      map.off('click', clickHandler);

      showNotice('Custom route created. Follow the highlighted path.', 'success', 4200);
    }
  };
  
  map.on('click', clickHandler);
};

// Text-to-speech hunt plan
window.speakHuntPlan = function() {
  if (!hotspotMarkers.length) return;
  
  if (!('speechSynthesis' in window)) {
    showNotice('Text-to-speech not supported in this browser.', 'error');
    return;
  }
  
  const hotspots = hotspotMarkers
    .map((marker) => marker.__hotspotData)
    .filter(Boolean)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

  // Build speech text
  let speechText = "Welcome to your Huntech AI Shed Hunting Strategy. Here's your priority breakdown. ";
  hotspots.forEach((hotspot) => {
    const rank = hotspot?.rank ?? hotspot?.priority ?? 1;
    speechText += `Priority ${rank}: ${hotspot.education.title}. ${hotspot.education.description} Field tip: ${hotspot.education.tips}. `;
  });
  
  speechText += "Good luck and happy shed hunting!";
  
  // Speak with natural voice
  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Try to use a quality voice
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'));
  if (preferredVoice) utterance.voice = preferredVoice;
  
  speechSynthesis.cancel(); // Cancel any ongoing speech
  speechSynthesis.speak(utterance);
  
  showNotice('Playing audio briefing. Listen for the hunt strategy.', 'info', 4200);
};

// Clear hunt data
function clearHunt() {
  hotspotMarkers.forEach(m => map.removeLayer(m));
  hotspotMarkers = [];
  clearScoutingLayer();
  if (routeLineGlow) map.removeLayer(routeLineGlow);
  if (routeLine) map.removeLayer(routeLine);
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);
  clearTerrainFeatures();
  routeLineGlow = null;
  routeLine = null;
  coreAreaEnabled = false;
  startMarker = null;
  endMarker = null;
  hotspotVisited.clear();
  stopLocationWatch();
  closeEducationTile();
}

window.clearRouteOnly = function() {
  if (routeLineGlow) map.removeLayer(routeLineGlow);
  if (routeLine) map.removeLayer(routeLine);
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);

  if (startPointMarker) {
    map.removeLayer(startPointMarker);
    startPointMarker = null;
  }
  if (endPointMarker) {
    map.removeLayer(endPointMarker);
    endPointMarker = null;
  }

  routeLineGlow = null;
  routeLine = null;
  startMarker = null;
  endMarker = null;
  startPoint = null;
  endPoint = null;
  clearTerrainFeatures();

  const startSelect = document.getElementById('routeStartSelect');
  const endSelect = document.getElementById('routeEndSelect');
  if (startSelect) startSelect.value = '';
  if (endSelect) endSelect.value = '';

  showNotice('Route cleared. Pins kept.', 'success', 3200);
};

window.letsGoFollowRoute = function() {
  if (hotspotMarkers.length === 0) {
    showNotice('No pins yet. Build a hunt plan first.', 'warning', 3600);
    return;
  }

  if (selectedRoutingMode === 'custom' && (!startPoint || !endPoint)) {
    showNotice('Custom route selected. Click START then END, then tap LET\'S GO.', 'warning', 5200);
    return;
  }

  if (selectedRoutingMode === 'loop') {
    createOptimalRoute('loop');
  } else {
    createOptimalRoute('linear');
  }

  startLocationWatch();
  showNotice('Route built. Alerts enabled for hotspots + terrain features.', 'success', 5200);
};

// Close strategy panel
window.closeStrategyPanel = function() {
  const panel = document.getElementById('strategy-panel');
  if (panel) panel.remove();
  setStrategyOpen(false);
  updateTrayToggleButton();
};

// Fix Clear button
window.clearAllDrawings = function() {
  mapClickMode = null;
  radiusMilesPending = null;
  clearRadiusDraft();

  if (drawnItems) {
    drawnItems.clearLayers();
  }

  const instructionDiv = document.getElementById('drawing-instructions');
  if (instructionDiv) instructionDiv.remove();

  // Remove all drawn layers
  map.eachLayer(layer => {
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle || layer instanceof L.Polyline || layer instanceof L.Circle) {
      map.removeLayer(layer);
    }
  });
  
  // Clear hunt data
  clearHunt();
  closeStrategyPanel();
  clearSelectedArea();
  startPoint = null;
  endPoint = null;
  if (startPointMarker) map.removeLayer(startPointMarker);
  if (endPointMarker) map.removeLayer(endPointMarker);
  startPointMarker = null;
  endPointMarker = null;
  document.body.classList.remove('ht-hunt-active');
  
  showNotice('All drawings and hunt data cleared.', 'success', 4200);
};


// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initializeMap();
  updateWeather();
  initializeSearch();
  loadRegulationsIndex();
  loadShedCache();
  loadSavedHuntAreas();
  loadHuntJournal();
  loadHuntPlans();
  updateFilterChips();
  updateWorkflowUI();
  showQuickStartCallout();
  startOnboarding();
  tryAutoCenterWithoutPrompt();

  const savedPropertySelect = document.getElementById('savedPropertySelect');
  if (savedPropertySelect) {
    savedPropertySelect.addEventListener('change', () => {
      const id = savedPropertySelect.value;
      if (!id) return;
      applySavedHuntArea(id);
      savedPropertySelect.value = '';
    });
  }

  // Restore Field Command collapsed state
  try {
    const collapsed = localStorage.getItem('htToolbarCollapsed') === '1';
    const toolbar = document.getElementById('toolbar');
    const icon = document.getElementById('toggleIcon');
    if (toolbar) {
      toolbarOpen = !collapsed;
      toolbar.classList.toggle('collapsed', collapsed);
      document.body.classList.toggle('ht-toolbar-collapsed', collapsed);
      if (icon) icon.textContent = collapsed ? '▸' : '▾';
    }
  } catch {
    // Ignore storage failures
  }

  updateTrayToggleButton();

  try {
    const advancedOpen = localStorage.getItem('htAdvancedControlsOpen') === '1';
    setAdvancedControlsOpen(advancedOpen);
  } catch {
    // Ignore storage failures
  }

  // Update weather every 5 minutes
  setInterval(updateWeather, 300000);

  // Add visible labels to drawing controls
  setTimeout(() => {
    const controls = document.querySelectorAll('.leaflet-draw-toolbar a');
    if (controls.length > 0) {
      const labels = ['Draw Polygon', 'Draw Rectangle', 'Edit Layers', 'Delete Layers'];
      controls.forEach((btn, index) => {
        if (labels[index]) {
          const label = document.createElement('div');
          label.style.cssText = 'position:absolute;left:55px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.9);color:#FFD700;padding:5px 12px;border-radius:5px;white-space:nowrap;font-size:13px;font-weight:bold;pointer-events:none;opacity:0;transition:opacity 0.2s;z-index:1000;';
          label.textContent = labels[index];
          btn.style.position = 'relative';
          btn.appendChild(label);
          btn.addEventListener('mouseenter', () => label.style.opacity = '1');
          btn.addEventListener('mouseleave', () => label.style.opacity = '0');
        }
      });
    }
  }, 1000);
});


