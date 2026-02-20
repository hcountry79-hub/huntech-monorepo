// HUNTECH - Enhanced AI Shed Hunting Application
// Education-First Approach with Priority Ranking & Route Planning

let map;
let mapInitialized = false;
let flyMapPending = false;
let turkeyMapPending = false;
let toolbarToggleBound = false;
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
let rectDraftCenter = null;
let rectDraftRect = null;
let rectDraftMoveHandler = null;
let radiusDragBubble = null;
let rectDragBubble = null;
let radiusDraftCenterMarker = null;
let rectDraftCenterMarker = null;
let radiusDragHandles = [];
let rectDragHandles = [];
let draftHandleDragging = false;
let polygonGuideMarker = null;
let drawHelperFollowHandler = null;
let drawHelperPinnedBottom = false;
let lastDrawVertexAt = 0;
let lastDrawVertexLatLng = null;
let pendingPolygonLayer = null;
let hotspotMarkers = [];
let routeLine = null;
let routeLineGlow = null;
let routeLineFlow = null;
let startMarker = null;
let endMarker = null;
let startDotMarker = null;
let endDotMarker = null;
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
let mdcLandFeatures = [];
let mdcLandLabelLayer = null;
let mdcLandLabelRefreshTimer = null;
let mdcLandLabelsSuppressed = false;
let mdcActiveAreaFeature = null;
let mdcInfoPanel = null;
let mdcInfoDock = null;
let mdcInfoPanelLastHtml = '';
const MDC_LABEL_MIN_ZOOM = 12;
const MDC_LABEL_MAX = 120;
const shedAllowedCache = new Map();
const SHED_CACHE_STORAGE_KEY = 'huntech_shed_rules_cache_v1';
const SHED_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14;
let shedRefreshTimer = null;
let educationTile = null;
let locationWatchId = null;
let lastGpsFix = null;
let lastGpsFiltered = null;
let lastGpsFixAt = 0;
let lastGpsFilteredAt = 0;
let lastGpsAccuracyNoticeAt = 0;
// Global timer and handler tracking for cleanup
let activeTimers = new Set();
let activeHandlers = new Map();

// Register timer with cleanup tracking
function registerTimer(timerId) {
  activeTimers.add(timerId);
  return timerId;
}

// Clear timer and remove from tracking
function clearRegisteredTimer(timerId) {
  if (timerId) {
    clearTimeout(timerId);
    activeTimers.delete(timerId);
  }
}

// Register event handler for cleanup
function registerHandler(element, event, handler) {
  const key = `${element}:${event}`;
  if (activeHandlers.has(key)) {
    const oldHandler = activeHandlers.get(key);
    element.removeEventListener ? element.removeEventListener(event, oldHandler) : element.off(event, oldHandler);
  }
  activeHandlers.set(key, handler);
  if (element.addEventListener) {
    element.addEventListener(event, handler);
  } else if (element.on) {
    element.on(event, handler);
  }
}

// Clear all registered handlers
function clearAllRegisteredHandlers() {
  activeHandlers.forEach((handler, key) => {
    const [elementType, event] = key.split(':');
    if (elementType === 'map' && map) {
      map.off(event, handler);
    }
  });
  activeHandlers.clear();
}
let userLocationMarker = null;
let userHeadingDeg = null;
let lastHeadingLatLng = null;
let savedHuntPreview = null;
let followUserLocation = true;
let mapAutoCentering = false;
let lastMapInteractionAt = 0;
let lastFollowRecenterAt = 0;
let lastFollowLatLng = null;
let smoothedHeadingDeg = null;
let lastBearingUpdateAt = 0;
let deviceHeadingDeg = null;
let deviceHeadingLastAt = 0;
let deviceCompassActive = false;
let deviceCompassHandler = null;
let deviceCompassEventName = '';
const hotspotVisited = new Set();
const HOTSPOT_GEOFENCE_METERS = 60;
let pendingRoutePinPrompt = false;
let terrainFeatureLayer = null;
let terrainFeatures = [];
let microFeatureLayer = null;
let microFeatureMarkers = [];
let microFeaturesActive = [];
const terrainFeatureVisited = new Set();
const DEFAULT_TERRAIN_SCAN_SAMPLE_SPACING_M = 80;
const DEFAULT_TERRAIN_FEATURE_GEOFENCE_M = 40;
const DEFAULT_TERRAIN_DEEP_GRID_SPACING_M = 110;
const DEFAULT_TERRAIN_MEDIUM_GRID_SPACING_M = 160;
const DEFAULT_TERRAIN_GRID_MAX_POINTS = 900;
const NHD_FLOWLINE_URL = String(window.NHD_FLOWLINE_URL || '').trim();
const NHD_WATERBODY_URL = String(window.NHD_WATERBODY_URL || '').trim();
const NHD_USE_PROXY = Boolean(window.HUNTECH_NHD_USE_PROXY);
const ALWAYS_DEEP_SCAN = Boolean(window.HUNTECH_DEEP_SCAN ?? true);
const TRACKING_STORAGE_KEY = 'huntech_tracking_coverage_v1';
let trackingActive = false;
let trackingPath = [];
let trackingDistanceMeters = 0;
let trackingSteps = 0;
let trackingLastPoint = null;
let trackingCoverageLayer = null;
let trackingCoverageLine = null;
let trackingCoverageShade = null;
let trackingCoverageGrid = null;
let trackingCoverageVisited = new Set();
let trackingCoveragePercent = 0;
let trackingAreaKey = '';
let trackingLastSave = 0;
let activeEducationHotspot = null;
let activeSearchArea = null;
let searchAreaLayer = null;
const completedSearchAreas = new Set();
let coachActive = false;
let coachLastTipAt = 0;
let coachLastMoveAt = 0;
const coachCoverageMilestones = new Set();
let voiceActive = false;
let voiceRecognizer = null;
let voiceArmed = false;
let voiceArmTimer = null;
let speechActive = false;
let voiceDirectMode = false;
let ttsAudio = null;
let ttsAbortController = null;
let preferredSpeechVoiceName = '';
let liveStrategyUpdateTimer = null;
let lastLiveStrategySignature = '';
let lastLiveStrategyPromptAt = 0;
if (window.HUNTECH_TTS_ENABLED === undefined) {
  window.HUNTECH_TTS_ENABLED = true;
}
if (!window.HUNTECH_TTS_PROVIDER) {
  window.HUNTECH_TTS_PROVIDER = 'browser';
}
if (!window.HUNTECH_TTS_VOICE_ID && window.HUNTECH_TTS_PROVIDER === 'openai') {
  window.HUNTECH_TTS_VOICE_ID = 'nova';
}
if (!window.HUNTECH_TTS_MODEL && window.HUNTECH_TTS_PROVIDER === 'openai') {
  window.HUNTECH_TTS_MODEL = 'gpt-4o-mini-tts';
}
if (window.HUNTECH_TTS_RATE === undefined) {
  window.HUNTECH_TTS_RATE = 0.88;
}
if (window.HUNTECH_TTS_PITCH === undefined) {
  window.HUNTECH_TTS_PITCH = 0.98;
}
if (window.HUNTECH_TTS_VOLUME === undefined) {
  window.HUNTECH_TTS_VOLUME = 1.0;
}
if (window.HUNTECH_TTS_PLAYBACK_RATE === undefined) {
  window.HUNTECH_TTS_PLAYBACK_RATE = 1.0;
}
if (window.HUNTECH_TTS_FORCE_FEMALE === undefined) {
  window.HUNTECH_TTS_FORCE_FEMALE = true;
}
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
let thermalOverlayRoot = null;
let thermalOverlayCanvas = null;
let thermalOverlayCtx = null;
let thermalOverlayRaf = null;
let thermalOverlayParticles = [];
let thermalOverlaySeeds = [];
let thermalOverlaySeedScreen = [];
let thermalOverlaySeedRaf = null;
let thermalOverlaySpawnParticles = null;
let thermalOverlaySeedRefreshNeedsRespawn = false;
let thermalOverlayEnabled = false;
let thermalOverlayForecastHours = 0;
let thermalOverlayState = null;
let thermalOverlayForecast = null;
let activeTemperature = null;
let weatherForecast = null;
let weatherForecastUpdatedAt = 0;
let thermalHubLayer = null;
let thermalHubEnabled = false;
let activeWindSpeed = null;
let compassControl = null;
let compassNeedle = null;
let compassLockBtn = null;
let compassWindValue = null;
let compassWindArrow = null;
let compassLocked = true;
let mapBearingDeg = 0;
let mapRotationBound = false;
let mapRotatePointers = new Map();
let mapRotateActive = false;
let mapRotateStartAngle = null;
let mapRotateStartBearing = 0;
let mapRotateShiftActive = false;
let mapRotateShiftStartX = 0;
let mapRotateShiftStartBearing = 0;
let mapRotateDraggingWasEnabled = true;
let routePinOptions = [];
let routePinSelectionActive = false;
let routePinSelectionStep = null;
let roadAvoidChecks = 0;
const roadAvoidCache = new Map();
let residentialAvoidChecks = 0;
const residentialAvoidCache = new Map();
const HOTSPOT_WATER_AVOID_ENABLED = window.HUNTECH_WATER_AVOID !== undefined
  ? Boolean(window.HUNTECH_WATER_AVOID)
  : true;
const HOTSPOT_WATER_VARIANCE_M = Number(window.HUNTECH_WATER_VARIANCE_M || 0.9);
const HOTSPOT_WATER_SAMPLE_OFFSET_M = Number(window.HUNTECH_WATER_SAMPLE_OFFSET_M || 35);
const HOTSPOT_ROAD_AVOID_ENABLED = window.HUNTECH_ROAD_AVOID !== undefined
  ? Boolean(window.HUNTECH_ROAD_AVOID)
  : true;
const HOTSPOT_BUILDING_AVOID_ENABLED = window.HUNTECH_BUILDING_AVOID !== undefined
  ? Boolean(window.HUNTECH_BUILDING_AVOID)
  : true;
const HOTSPOT_RESIDENTIAL_AVOID_ENABLED = window.HUNTECH_RESIDENTIAL_AVOID !== undefined
  ? Boolean(window.HUNTECH_RESIDENTIAL_AVOID)
  : true;
const HOTSPOT_RESIDENTIAL_BUFFER_M = Number(window.HUNTECH_RESIDENTIAL_BUFFER_M || 120);
const HOTSPOT_RESIDENTIAL_BUFFER_SAMPLES = Number(window.HUNTECH_RESIDENTIAL_BUFFER_SAMPLES || 6);
const DRAFT_HANDLE_MIN_METERS = 20;
const DRAFT_START_RADIUS_METERS = 45.72;
const DRAFT_START_RECT_HALF_METERS = 45.72;
const USER_LOCATION_FOCUS_ZOOM = Number(window.HUNTECH_USER_LOCATION_FOCUS_ZOOM || 13);
const MAP_FOLLOW_THROTTLE_MS = Number(window.HUNTECH_MAP_FOLLOW_THROTTLE_MS || 450);
const MAP_FOLLOW_MIN_MOVE_METERS = Number(window.HUNTECH_MAP_FOLLOW_MIN_MOVE_METERS || 7);
const MAP_FOLLOW_SAFE_BOUNDS_PAD = Number(window.HUNTECH_MAP_FOLLOW_SAFE_BOUNDS_PAD || 0.18);
const MAP_ROTATION_SMOOTHING = Number(window.HUNTECH_MAP_ROTATION_SMOOTHING || 0.18);
const MAP_ROTATION_MIN_DELTA_DEG = Number(window.HUNTECH_MAP_ROTATION_MIN_DELTA_DEG || 1.5);
const MAP_ROTATION_SUSPEND_MS = Number(window.HUNTECH_MAP_ROTATION_SUSPEND_MS || 2500);
const MAP_ROTATION_MAX_HZ = Number(window.HUNTECH_MAP_ROTATION_MAX_HZ || 30);
const HOTSPOT_ROAD_AVOID_STRICT = window.HUNTECH_ROAD_AVOID_STRICT !== undefined
  ? Boolean(window.HUNTECH_ROAD_AVOID_STRICT)
  : true;
const HOTSPOT_RESIDENTIAL_AVOID_STRICT = window.HUNTECH_RESIDENTIAL_AVOID_STRICT !== undefined
  ? Boolean(window.HUNTECH_RESIDENTIAL_AVOID_STRICT)
  : true;
const HOTSPOT_RESIDENTIAL_AVOID_MAX_CHECKS = Number(window.HUNTECH_RESIDENTIAL_AVOID_MAX_CHECKS || 80);
const HOTSPOT_ROAD_AVOID_SAMPLE_M = Number(window.HUNTECH_ROAD_AVOID_SAMPLE_M || 28);
const HOTSPOT_BUILDING_AVOID_SAMPLE_M = Number(window.HUNTECH_BUILDING_AVOID_SAMPLE_M || 22);
const HOTSPOT_ROAD_AVOID_MAX_CHECKS = Number(window.HUNTECH_ROAD_AVOID_MAX_CHECKS || 140);
const HOTSPOT_ROAD_AVOID_ENDPOINT = String(window.HUNTECH_ROAD_AVOID_ENDPOINT || 'https://nominatim.openstreetmap.org/reverse').trim();

// ═══════════════════════════════════════════════════════════════════
//   LAND COVER VERIFICATION — Satellite Imagery Guardrails
//   Uses USGS NLCD (National Land Cover Database) via MRLC ArcGIS
//   MapServer to validate EVERY pin against real ground cover before
//   placement. Pins that claim "creek bottom" must actually be near
//   water/forest, not in the middle of a crop field.
//
//   NLCD Land Cover Classes (30m resolution, updated ~every 2-3 yr):
//     11 = Open Water           12 = Ice/Snow
//     21 = Developed Open       22 = Developed Low
//     23 = Developed Medium     24 = Developed High
//     31 = Barren               41 = Deciduous Forest
//     42 = Evergreen Forest     43 = Mixed Forest
//     51 = Dwarf Scrub          52 = Shrub/Scrub
//     71 = Grassland/Herbaceous 72 = Sedge/Herbaceous
//     81 = Pasture/Hay          82 = Cultivated Crops
//     90 = Woody Wetlands       95 = Emergent Herbaceous Wetlands
// ═══════════════════════════════════════════════════════════════════
const NLCD_LANDCOVER_URL = String(window.HUNTECH_NLCD_URL || 'https://www.mrlc.gov/geoserver/mrlc_display/NLCD_2021_Land_Cover_L48/wms').trim();
const NLCD_ENABLED = window.HUNTECH_NLCD_ENABLED !== undefined ? Boolean(window.HUNTECH_NLCD_ENABLED) : true;
const NLCD_MAX_CHECKS = Number(window.HUNTECH_NLCD_MAX_CHECKS || 200);
const NLCD_STRICT = false; // Graceful — allow pins if NLCD lookup fails
let nlcdCheckCount = 0;
const nlcdCache = new Map();
let nlcdGridData = null; // Pre-fetched area-wide raster for instant lookups

// NLCD standard color palette → code mapping (RGB hex → NLCD class)
// Used to decode the WMS GetMap image tile
const NLCD_COLOR_TO_CODE = {
  '466b9f': 11, 'd1def8': 12,
  'dec5c5': 21, 'd99282': 22, 'eb0000': 23, 'ab0000': 24,
  'b3afa4': 31,
  '68ab5f': 41, '1c5f2c': 42, 'b5c58f': 43,
  'af963c': 51, 'ccb879': 52,
  'dfdfc2': 71, 'd1d182': 72,
  'dbd83d': 81, 'ab6c28': 82,
  'b8d9eb': 90, '6c9fb8': 95
};

/**
 * Pre-fetch NLCD land cover for an entire bounding box in ONE request.
 * Downloads the NLCD raster as an image tile, paints it on a hidden canvas,
 * and makes all future point lookups instant (no more network requests per pin).
 * Call this ONCE before pin placement starts.
 */
async function prefetchNLCDForArea(bounds) {
  if (!NLCD_ENABLED || !bounds) return false;
  nlcdGridData = null;

  try {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    // Request a raster image from WMS GetMap — one image covers the whole area
    // Use ~100px resolution (each pixel ≈ 30m NLCD cell)
    const latSpan = ne.lat - sw.lat;
    const lngSpan = ne.lng - sw.lng;
    const pixelsPerDeg = 3600; // ~30m at mid-latitudes
    const width = Math.min(512, Math.max(32, Math.round(lngSpan * pixelsPerDeg)));
    const height = Math.min(512, Math.max(32, Math.round(latSpan * pixelsPerDeg)));

    const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
    const url = `${NLCD_LANDCOVER_URL}`
      + `?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap`
      + `&LAYERS=NLCD_2021_Land_Cover_L48`
      + `&STYLES=`
      + `&FORMAT=image/png`
      + `&SRS=EPSG:4326`
      + `&WIDTH=${width}&HEIGHT=${height}`
      + `&BBOX=${bbox}`;

    console.log(`[NLCD] Pre-fetching ${width}x${height} land cover tile for area...`);
    const res = await fetchWithTimeout(url, {}, 10000);
    if (!res.ok) {
      console.warn(`[NLCD] Pre-fetch failed: HTTP ${res.status}`);
      return false;
    }
    const blob = await res.blob();
    const imgBitmap = await createImageBitmap(blob);

    // Paint on hidden canvas to read pixel colors
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgBitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);

    nlcdGridData = {
      sw, ne, width, height,
      latSpan, lngSpan,
      pixels: imageData.data // RGBA flat array
    };

    console.log(`[NLCD] Area land cover loaded: ${width}x${height} pixels (${width * height} cells)`);
    return true;
  } catch (e) {
    console.warn('[NLCD] Pre-fetch failed:', e.message);
    return false;
  }
}

/* ═══ POLYGON DRAW SENSITIVITY FIX ═══
   Monkey-patch Leaflet.draw's addVertex to prevent accidental vertex drops
   on mobile. Uses pixel-distance + time debounce so finger drags don't
   create dozens of vertices. */
(function patchDrawVertexDebounce() {
  if (!L || !L.Draw || !L.Draw.Polyline) return;
  const _origAddVertex = L.Draw.Polyline.prototype.addVertex;
  let _pvTime = 0;
  let _pvPoint = null; // L.Point (screen px)

  L.Draw.Polyline.prototype.addVertex = function(latlng) {
    const MIN_PX   = 30;   // minimum screen-pixels between vertices
    const MIN_MS   = 350;  // minimum milliseconds between vertices
    const now = Date.now();

    if (_pvPoint && this._map) {
      const pt = this._map.latLngToContainerPoint(latlng);
      const pxDist = pt.distanceTo(_pvPoint);
      if (pxDist < MIN_PX || (now - _pvTime) < MIN_MS) {
        return; // too close or too fast — skip vertex
      }
    }

    _pvTime = now;
    if (this._map) _pvPoint = this._map.latLngToContainerPoint(latlng);
    return _origAddVertex.call(this, latlng);
  };

  // Reset debounce state each time a new draw starts
  const _origEnable = L.Draw.Polyline.prototype.enable;
  L.Draw.Polyline.prototype.enable = function() {
    _pvTime = 0;
    _pvPoint = null;
    return _origEnable.apply(this, arguments);
  };
})();

/**
 * Get NLCD land cover code for a point from the pre-fetched grid (INSTANT).
 * Falls back to individual WMS request only if grid isn't available.
 */
function getNLCDFromGrid(latlng) {
  if (!nlcdGridData) return null;
  const ll = L.latLng(latlng);
  const { sw, ne, width, height, latSpan, lngSpan, pixels } = nlcdGridData;

  // Convert lat/lng to pixel coordinates
  const px = Math.floor(((ll.lng - sw.lng) / lngSpan) * width);
  // Y is inverted (top of image = north)
  const py = Math.floor(((ne.lat - ll.lat) / latSpan) * height);

  if (px < 0 || px >= width || py < 0 || py >= height) return null;

  const idx = (py * width + px) * 4;
  const r = pixels[idx];
  const g = pixels[idx + 1];
  const b = pixels[idx + 2];
  const a = pixels[idx + 3];

  // Transparent = no data
  if (a < 128) return null;

  // Match pixel color to NLCD code
  const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  const code = NLCD_COLOR_TO_CODE[hex];
  if (code) return code;

  // Fuzzy match — find closest color (colors may have anti-aliasing artifacts)
  let bestCode = null;
  let bestDist = Infinity;
  for (const [hexRef, refCode] of Object.entries(NLCD_COLOR_TO_CODE)) {
    const rr = parseInt(hexRef.substring(0, 2), 16);
    const gg = parseInt(hexRef.substring(2, 4), 16);
    const bb = parseInt(hexRef.substring(4, 6), 16);
    const dist = Math.abs(r - rr) + Math.abs(g - gg) + Math.abs(b - bb);
    if (dist < bestDist) { bestDist = dist; bestCode = refCode; }
  }
  // Only accept if color is reasonably close (within ~30 RGB units)
  return bestDist <= 45 ? bestCode : null;
}

/**
 * Fetch NLCD land cover class for a lat/lng point.
 * First checks the pre-fetched grid (instant), then falls back to
 * individual WMS GetFeatureInfo (slow, only if grid unavailable).
 */
async function fetchNLCDLandCover(latlng) {
  const ll = L.latLng(latlng);
  const cacheKey = `${ll.lat.toFixed(4)},${ll.lng.toFixed(4)}`;
  if (nlcdCache.has(cacheKey)) return nlcdCache.get(cacheKey);

  // Try pre-fetched grid first (instant — no network)
  const gridCode = getNLCDFromGrid(ll);
  if (gridCode !== null) {
    nlcdCache.set(cacheKey, gridCode);
    return gridCode;
  }

  // Fallback: individual WMS request (slow, capped)
  if (nlcdCheckCount >= NLCD_MAX_CHECKS) return null;
  nlcdCheckCount++;

  try {
    const delta = 0.00015;
    const bbox = `${ll.lng - delta},${ll.lat - delta},${ll.lng + delta},${ll.lat + delta}`;
    const url = `${NLCD_LANDCOVER_URL}`
      + `?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo`
      + `&LAYERS=NLCD_2021_Land_Cover_L48`
      + `&QUERY_LAYERS=NLCD_2021_Land_Cover_L48`
      + `&INFO_FORMAT=application/json`
      + `&SRS=EPSG:4326`
      + `&WIDTH=1&HEIGHT=1`
      + `&BBOX=${bbox}`
      + `&X=0&Y=0`;

    const res = await fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 3000);
    if (!res.ok) { nlcdCache.set(cacheKey, null); return null; }
    const data = await res.json();

    let code = null;
    if (data?.features?.length > 0) {
      const props = data.features[0].properties || {};
      for (const key of Object.keys(props)) {
        const v = Number(props[key]);
        if (Number.isInteger(v) && v >= 11 && v <= 95) { code = v; break; }
      }
    } else if (data?.value !== undefined) {
      code = Number(data.value);
    }

    if (code && Number.isInteger(code) && code >= 11 && code <= 95) {
      nlcdCache.set(cacheKey, code);
      return code;
    }
    nlcdCache.set(cacheKey, null);
    return null;
  } catch (e) {
    nlcdCache.set(cacheKey, null);
    return null;
  }
}

const NLCD_HABITAT_RULES = {
  // Forested habitats — MUST be on forest, wetland, or shrub. NOT crop/hay/open.
  bedding:    { allow: new Set([41,42,43,51,52,90]), label: 'forest/shrub cover' },
  transition: { allow: new Set([41,42,43,51,52,71,90,95]), label: 'tree line or edge cover' },
  feeding:    { allow: new Set([41,42,43,51,52,71,81,90,95]), label: 'browse or edge habitat' },
  water:      { allow: new Set([11,41,42,43,52,90,95]), label: 'water or riparian corridor' },
  open:       { allow: new Set([41,42,43,51,52,71,81,90,95,21]), label: 'cover with open edges' },
  terrain:    { allow: new Set([41,42,43,51,52,71,81,90,95,21,31]), label: 'natural terrain' },
  // Mushroom-specific overrides — morels need trees
  mushroom_bedding:    { allow: new Set([41,42,43,90]), label: 'hardwood forest' },
  mushroom_transition: { allow: new Set([41,42,43,52,90,95]), label: 'forest edge' },
  mushroom_feeding:    { allow: new Set([41,42,43,90,95,11]), label: 'creek bottom / floodplain' },
  mushroom_water:      { allow: new Set([11,41,42,43,90,95]), label: 'drainage or seep' },
  mushroom_open:       { allow: new Set([41,42,43,52,71,81,90,95,21]), label: 'old orchard or disturbed ground' },
  // Turkey overrides
  turkey_roostZone:    { allow: new Set([41,42,43,90]), label: 'mature timber roost' },
  turkey_strutZone:    { allow: new Set([41,42,43,52,71,81,21]), label: 'open strutting area' },
  turkey_travelCorridor: { allow: new Set([41,42,43,52,71,90]), label: 'travel corridor' },
};

// BLOCKED list — pins are NEVER placed on these, regardless of habitat
const NLCD_ALWAYS_BLOCKED = new Set([
  12,  // Ice/Snow
  22,  // Developed Low Intensity
  23,  // Developed Medium Intensity
  24,  // Developed High Intensity
  82,  // Cultivated Crops (active row-crop field)
]);

/**
 * Human-readable label for an NLCD code
 */
function nlcdLabel(code) {
  const labels = {
    11: 'Open Water', 12: 'Ice/Snow',
    21: 'Developed Open Space', 22: 'Developed Low',
    23: 'Developed Medium', 24: 'Developed High',
    31: 'Barren Land', 41: 'Deciduous Forest',
    42: 'Evergreen Forest', 43: 'Mixed Forest',
    51: 'Dwarf Scrub', 52: 'Shrub/Scrub',
    71: 'Grassland', 72: 'Sedge/Herbaceous',
    81: 'Pasture/Hay', 82: 'Cultivated Crops',
    90: 'Woody Wetlands', 95: 'Emergent Wetlands'
  };
  return labels[code] || `Class ${code}`;
}

/**
 * Validate a candidate pin location against NLCD satellite land cover.
 * Returns { valid: true/false, code, label, reason }.
 * HARD REJECTS pins on crop fields, developed areas, or mismatched habitat.
 */
async function validatePinLandCover(latlng, habitatType) {
  if (!NLCD_ENABLED) return { valid: true, code: null, label: 'skipped', reason: 'NLCD disabled' };

  const code = await fetchNLCDLandCover(latlng);
  if (code === null) {
    // If we can't verify, reject in strict mode
    if (NLCD_STRICT && nlcdCheckCount < NLCD_MAX_CHECKS) {
      return { valid: false, code: null, label: 'unknown', reason: 'Could not verify land cover — rejecting for safety' };
    }
    return { valid: true, code: null, label: 'unverified', reason: 'NLCD lookup failed, allowing fallback' };
  }

  const label = nlcdLabel(code);

  // 1. HARD BLOCK: Always-blocked land cover (crops, developed, ice)
  if (NLCD_ALWAYS_BLOCKED.has(code)) {
    return { valid: false, code, label, reason: `Blocked: ${label} — pins never placed on ${label}` };
  }

  // 2. HABITAT MATCH: Check if this land cover is appropriate for the habitat type
  const isMush = isMushroomModule();
  const isTurk = isTurkeyModule();
  const ruleKey = isMush ? `mushroom_${habitatType}` :
                  isTurk ? `turkey_${habitatType}` : habitatType;
  const rule = NLCD_HABITAT_RULES[ruleKey] || NLCD_HABITAT_RULES[habitatType];

  if (rule && !rule.allow.has(code)) {
    return {
      valid: false, code, label,
      reason: `Mismatch: "${habitatType}" requires ${rule.label}, but satellite shows ${label} (NLCD ${code})`
    };
  }

  return { valid: true, code, label, reason: `Verified: ${label} matches ${habitatType}` };
}

const MICRO_FEATURE_TEMPLATES = [
  {
    type: 'micro_pinch',
    label: 'Micro Pinch',
    icon: 'MP',
    detail: 'Tight squeeze where cover and terrain force a narrow line of travel.',
    tips: 'Check both sides of the pinch and the first downwind micro exit.',
    lookFor: 'Fresh tracks, rubs, and clipped browse on the tightest line.',
    why: ['Movement funnels through the narrowest cover', 'Mature bucks skirt the downwind edge'],
    approach: ['Stay downwind and slow-walk the squeeze', 'Scan 20-40 yards off the main line']
  },
  {
    type: 'rut_funnel',
    label: 'Rut Funnel',
    icon: 'RF',
    detail: 'A rut travel channel that pulls cruising bucks through a tight line.',
    tips: 'Check the downwind lip where bucks scent-check.',
    lookFor: 'Parallel trails, fresh rubs, and scrapes in the funnel throat.',
    why: ['Rut movement stacks in narrow corridors', 'Bucks use wind cover to check does'],
    approach: ['Work the downwind edge first', 'Pause at crossing trails for sign']
  },
  {
    type: 'saddle_crossing',
    label: 'Saddle Crossing',
    icon: 'SC',
    detail: 'Low pass between high points that channels daily movement.',
    tips: 'Hunt the low line and the first cover break below it.',
    lookFor: 'Tracks and hair where trails converge at the lowest point.',
    why: ['Lowest-effort crossing on the ridge', 'Consistent travel year to year'],
    approach: ['Sweep the low pass, then check 30 yards downwind']
  },
  {
    type: 'bench_exit',
    label: 'Bench Exit',
    icon: 'BE',
    detail: 'Hidden exit off a travel bench where bucks slip between tiers.',
    tips: 'Check the downwind side trail that cuts off the bench.',
    lookFor: 'Side trails, rub lines, and faint tracks leaving the bench.',
    why: ['Benches hide movement from the skyline', 'Exits are low-pressure travel lanes'],
    approach: ['Follow the contour and scan exit trails']
  },
  {
    type: 'ridge_exit',
    label: 'Ridge Exit',
    icon: 'RE',
    detail: 'Small ridge spur exit where bucks drop into secure cover.',
    tips: 'Check the first drop-off and brushy pocket below it.',
    lookFor: 'Tracks and rubs on the transition line.',
    why: ['Quick drop to security cover', 'Wind advantage on the ridge tip'],
    approach: ['Stay below the skyline and work the downwind edge']
  },
  {
    type: 'drainage_exit',
    label: 'Drainage Exit',
    icon: 'DE',
    detail: 'Drainage exit where deer slip between cover blocks.',
    tips: 'Check the mouth of the drainage and side benches.',
    lookFor: 'Fresh tracks and crossings at the exit lip.',
    why: ['Drainages hold scent and cover', 'Bucks move low and hidden'],
    approach: ['Work from downwind and scan the exit line']
  },
  {
    type: 'creek_crossing',
    label: 'Creek Crossing',
    icon: 'CC',
    detail: 'Low-effort water crossing that concentrates movement.',
    tips: 'Check both banks and the first dry shelf above water.',
    lookFor: 'Tracks in mud, broken sticks, and hair on brush.',
    why: ['Water forces movement into narrow crossings', 'Consistent crossing year to year'],
    approach: ['Sweep the crossing and the downwind bank first']
  }
];
const OSRM_MAX_WAYPOINTS = 25;

const MUSHROOM_FEATURE_TEMPLATES = [
  {
    type: 'moisture_pocket',
    label: 'Moisture Pocket',
    icon: 'MP',
    detail: 'Shaded low area where soil stays moist longer after rain.',
    tips: 'Check leaf litter edges and the base of nearby hardwoods.',
    lookFor: 'Dark, crumbly soil with intact leaf cover and decaying wood.',
    why: ['Retains moisture needed for fruiting', 'Organic matter supports mycelium'],
    approach: ['Walk slow lanes at ankle height', 'Scan 10-20 feet around the first find'],
    treeFocus: ['Elm (dying)', 'Sycamore'],
    treeId: {
      elm: { name: 'American Elm', bark: 'Deep interlacing diamond ridges; dying trees show loose peeling strips.', leaves: 'Alternate, doubly serrate, asymmetric base, 3-6".', shape: 'Vase shape when healthy; dead elms show bare skeleton branches.', tip: 'Dying elms within a moisture pocket concentrate fruiting — scan 30 ft radius around the trunk.' },
      sycamore: { name: 'American Sycamore', bark: 'Mottled patchwork of white, tan and olive-green; flakes in large plates.', leaves: 'Broad, 3-5 lobed, maple-like but larger (6-10"), fuzzy undersides.', shape: 'Massive spreading crown, often near water; lower trunk can be hollow.', tip: 'Sycamore leaf litter holds moisture well — scan the damp zone beneath the canopy edge.' }
    }
  },
  {
    type: 'dead_elm',
    label: 'Dead Elm Stand',
    icon: 'DE',
    detail: 'Dying or dead elm trees — prime morel hosts.',
    tips: 'Circle each tree, scanning 10-30 feet from the trunk.',
    lookFor: 'Bark sloughing off the trunk and disturbed leaf litter.',
    why: ['Elm bark beetle damage triggers morel fruiting', 'Roots feed mycelium networks'],
    approach: ['Grid in tight circles around each candidate tree'],
    treeFocus: ['Elm (dying/dead)'],
    treeId: {
      elm: { name: 'American Elm (Ulmus americana)', bark: 'Deep diamond ridges, gray-brown. Dying trees show loose bark strips peeling away.', leaves: 'Alternate, doubly serrate, asymmetric base, 3-6". Look for last year\'s leaves on ground.', shape: 'Classic vase shape; dead elms have bare upper branches like skeleton fingers.', tip: '#1 morel tree in Missouri. Dead/dying elms 1-3 years are morel magnets. Circle every one at 10, 20, and 30 feet.' }
    }
  },
  {
    type: 'creek_bottom',
    label: 'Creek Bottom',
    icon: 'CB',
    detail: 'Low drainage area with consistent moisture and shade.',
    tips: 'Check both banks and any downed wood spanning the channel.',
    lookFor: 'Rich soil, moss patches, and decaying leaf litter.',
    why: ['Water keeps soil moist at fruiting temperature', 'Shade prevents drying'],
    approach: ['Walk the bank edges, scanning both sides of the drainage'],
    treeFocus: ['Cottonwood', 'Silver Maple', 'Box Elder'],
    treeId: {
      cottonwood: { name: 'Eastern Cottonwood', bark: 'Deeply furrowed thick ridges on mature trees; young bark smooth and yellowish.', leaves: 'Triangular (deltoid), coarsely toothed, 3-5" wide, flutter on flattened petioles.', shape: 'Large spreading crown in bottomlands near water.', tip: 'Big cottonwoods in floodplains are prime late-season spots. Check root flare zone and litter against trunk base.' },
      silverMaple: { name: 'Silver Maple', bark: 'Shaggy, peeling in long thin strips on older trees. Silvery-gray.', leaves: 'Deeply cut 5 lobes with silvery-white undersides, 4-7" wide.', shape: 'Fast-growing, often multi-trunked; brittle branches show storm damage.', tip: 'Silver maples in floodplains create damp, shaded micro-sites for mid-season morels.' },
      boxElder: { name: 'Box Elder', bark: 'Thin, pale gray-brown with shallow ridges; often has green patches.', leaves: 'Compound (unusual for a maple), opposite, 3-5 leaflets.', shape: 'Scrubby, irregular, often leaning with multiple trunks.', tip: 'Indicates rich, moist bottomland soil. Where box elders grow thick, soil chemistry favors morels.' }
    }
  },
  {
    type: 'north_slope',
    label: 'North-Facing Slope',
    icon: 'NS',
    detail: 'Shaded slope that stays cool and moist during warm spells.',
    tips: 'Focus on the middle third of the slope where moisture collects.',
    lookFor: 'Consistent canopy cover with mixed hardwoods and soft duff.',
    why: ['Less sun keeps soil at ideal 50-60\u00b0F range', 'Slower drying extends fruiting window'],
    approach: ['Traverse the slope in horizontal sweeps'],
    treeFocus: ['White Oak', 'Hickory'],
    treeId: {
      whiteOak: { name: 'White Oak', bark: 'Light gray, scaly, peeling in loose vertical strips and plates.', leaves: 'Alternate, 7-9 rounded lobes (no sharp points), deep sinuses, 5-9".', shape: 'Broad spreading crown with massive lateral branches.', tip: 'White oak leaf litter decomposes slowly, providing steady nutrients. Check within 25 ft of mature white oaks.' },
      hickory: { name: 'Shagbark Hickory', bark: 'Long shaggy strips peeling away from trunk — unmistakable "shredded" look.', leaves: 'Compound, alternate, 5 leaflets (occasionally 7); end leaflet largest.', shape: 'Tall with narrow open crown; bark becomes shaggy at 20-25 years.', tip: 'Hickory-oak zones are prime morel territory. Mixed leaf litter creates ideal soil chemistry.' }
    }
  },
  {
    type: 'old_orchard',
    label: 'Old Orchard',
    icon: 'OO',
    detail: 'Abandoned apple or fruit trees with decaying root systems.',
    tips: 'Check around the drip line and under fallen limbs.',
    lookFor: 'Old apple trees with exposed roots and leaf litter.',
    why: ['Fruit tree roots are prime morel partners', 'Calcium-rich soil from decomposing wood'],
    approach: ['Circle each tree at the drip line and work outward'],
    treeFocus: ['Apple (old orchard)', 'Wild Cherry'],
    treeId: {
      apple: { name: 'Old Apple Tree', bark: 'Rough, scaly, dark gray-brown; deeply furrowed on older trees.', leaves: 'Simple, oval, finely serrate with soft fuzz underneath.', shape: 'Open, twisted crown, often leaning. Old orchards have regular spacing.', tip: 'The most famous morel spot. Check a full 30-foot radius around every old apple tree — the root system and mycelial network extends far.' },
      wildCherry: { name: 'Wild Black Cherry', bark: 'Young: smooth, reddish-brown with horizontal lenticels (dash marks). Mature: dark, scaly, flaking.', leaves: 'Alternate, simple, finely serrate with inward-curving teeth. Shiny dark green.', shape: 'Tall narrow crown in forests; open-grown trees spread wider.', tip: 'Wild cherry in transition edges and disturbed areas can produce late morels where leaf litter mixes with decaying cherry wood.' }
    }
  },
  {
    type: 'burn_area',
    label: 'Burn Area',
    icon: 'BA',
    detail: 'Recently burned patch where fire morels often fruit first.',
    tips: 'Check 3-12 months after a burn in mixed-conifer or hardwood areas.',
    lookFor: 'Charred wood, ash rings, and fresh morel caps.',
    why: ['Fire triggers massive morel flushes', 'Reduced competition from other fungi'],
    approach: ['Grid in wide lanes through the burned area'],
    treeFocus: ['Any charred hardwood stumps'],
    treeId: {
      burnIndicator: { name: 'Fire-Scarred Hardwood', bark: 'Charred, blackened bark with deep cracks; may show live wood underneath.', leaves: 'Look for last year\'s fallen leaves on the burn margin — identifies the tree species.', shape: 'Standing dead snags or stumps; some trees resprout from the base.', tip: 'Focus on the burn edge where charred ground meets green timber. Burn morels (M. tomentosa) are dark, grow in dense clusters, and appear 3-12 months post-fire.' }
    }
  },
  {
    type: 'tulip_poplar',
    label: 'Tulip Poplar Stand',
    icon: 'TP',
    detail: 'Tulip poplars in moist coves — another top morel host tree.',
    tips: 'Check the downhill side where moisture pools.',
    lookFor: 'Tall straight trunks with distinctive leaf litter.',
    why: ['Poplars share mycorrhizal networks with morels', 'Cove positions hold moisture'],
    approach: ['Scan from trunk outward in 10-foot rings'],
    treeFocus: ['Tulip Poplar'],
    treeId: {
      tulipPoplar: { name: 'Tulip Poplar (Liriodendron tulipifera)', bark: 'Deep furrows in tight diamond pattern; gray-brown. Younger trees have smooth greenish bark.', leaves: 'Unique 4-lobed tulip shape — flat across the top. Bright green, turning yellow in fall.', shape: 'Tall, straight trunk that self-prunes lower branches; narrow, high crown.', tip: 'Morels appear in duff zone within 15 ft of mature tulip poplars, especially on south-facing slopes. Less famous than elm but very reliable in Missouri.' }
    }
  }
];

function getMicroFeatureTemplates() {
  return isMushroomModule() ? MUSHROOM_FEATURE_TEMPLATES : MICRO_FEATURE_TEMPLATES;
}
const UI_POPUPS_ENABLED = window.HUNTECH_MAP_POPUPS_ENABLED !== undefined
  ? Boolean(window.HUNTECH_MAP_POPUPS_ENABLED)
  : true;
const UI_NOTICES_ENABLED = false;
const WIND_OVERLAY_ENABLED = window.HUNTECH_WIND_OVERLAY_ENABLED !== undefined
  ? Boolean(window.HUNTECH_WIND_OVERLAY_ENABLED)
  : true;
const THERMAL_OVERLAY_AVAILABLE = window.HUNTECH_THERMAL_OVERLAY_ENABLED !== undefined
  ? Boolean(window.HUNTECH_THERMAL_OVERLAY_ENABLED)
  : true;
const THERMAL_OVERLAY_DEFAULT_ON = window.HUNTECH_THERMAL_OVERLAY_DEFAULT_ON !== undefined
  ? Boolean(window.HUNTECH_THERMAL_OVERLAY_DEFAULT_ON)
  : false;
const STRICT_ANALYSIS_MODE = window.HUNTECH_STRICT_ANALYSIS !== undefined
  ? Boolean(window.HUNTECH_STRICT_ANALYSIS)
  : true;
const BUCK_FOCUS_MODE = window.HUNTECH_BUCK_FOCUS !== undefined
  ? Boolean(window.HUNTECH_BUCK_FOCUS)
  : true;
// ═══ MATURE WHITETAIL BUCK ALGORITHM — STRICTLY ENFORCED ═══
// All pin placement, routing, and habitat analysis is driven by mature
// whitetail buck behavior patterns. Does and immature bucks are NEVER
// the focus. Every hotspot is placed where a 4.5+ year old buck would
// travel, bed, feed, or stage. Satellite imagery (NLCD) verification
// is MANDATORY for every pin in every module.
const MATURE_BUCK_STRICT = true;
const SATELLITE_SCAN_ALL_MODULES = true; // NLCD satellite verification on ALL modules
const CONTOUR_INTERVAL_FT = Number(window.HUNTECH_CONTOUR_INTERVAL_FT || 10);
const CONTOUR_CLAMP_ENABLED = window.HUNTECH_CONTOUR_CLAMP !== undefined
  ? Boolean(window.HUNTECH_CONTOUR_CLAMP)
  : true;
let toolbarOpen = false;
let lastToolbarToggleAt = 0;
let lastToolbarToggleActionAt = 0;
let toolbarSkipClick = false;
let toolbarSkipTimer = null;
let fieldCommandStep = 1;
let fieldCommandFlowActive = false;
let _suppressDefaultArea = false; // Set true when user explicitly picks a define-area tool
let pendingFieldCommandAdvance = false;
const ROUTE_STYLE = String(window.HUNTECH_ROUTE_STYLE || 'trail').toLowerCase();
const ROUTE_AVOID_ROADS = window.HUNTECH_ROUTE_AVOID_ROADS !== undefined
  ? Boolean(window.HUNTECH_ROUTE_AVOID_ROADS)
  : true;
const ROUTE_DETOUR_MULT = Number(window.HUNTECH_TRAIL_DETOUR_MULT || 3.2);
const ROUTE_DETOUR_ADD_MILES = Number(window.HUNTECH_TRAIL_DETOUR_ADD_MILES || 2.0);
const DEFAULT_PUBLIC_LAND_TILE_URL = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Protected_Areas/MapServer/tile/{z}/{y}/{x}';
const DEFAULT_MDC_CONSERVATION_AREAS_URL = 'https://gisblue.mdc.mo.gov/arcgis/rest/services/Discover_Nature/MDC_Administrative_Areas/FeatureServer/5';
const DEFAULT_MDC_LOGO_URL = 'assets/mdc-logo.png';
const REG_PROXY_PATH = '/proxy?url=';
const FORCE_PROXY = window.HUNTECH_FORCE_PROXY !== undefined
  ? Boolean(window.HUNTECH_FORCE_PROXY)
  : (typeof location !== 'undefined' && location.hostname && !['localhost', '127.0.0.1'].includes(location.hostname));
const DEFAULT_FETCH_TIMEOUT_MS = Number(window.HUNTECH_FETCH_TIMEOUT_MS || 12000);
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
const LIVE_STRATEGY_SIGNAL_MIN = 3;
const LIVE_STRATEGY_SIGNAL_RADIUS_M = 420;
const FLY_INVENTORY_STORAGE_KEY = 'huntech_fly_inventory_v1';
const FLY_SESSION_STORAGE_KEY = 'huntech_fly_sessions_v1';
const FLY_SAVED_WATERS_STORAGE_KEY = 'huntech_saved_trout_waters_v1';
const FLY_COMMAND_PREFS_KEY = 'huntech_fly_command_prefs_v1';
const FLY_PINNED_WATERS_STORAGE_KEY = 'huntech_fly_pinned_waters_v1';
const USGS_NWIS_IV_URL = String(window.HUNTECH_USGS_NWIS_IV_URL || 'https://waterservices.usgs.gov/nwis/iv/').trim();
const USGS_NWIS_USE_PROXY = window.HUNTECH_USGS_USE_PROXY !== undefined
  ? Boolean(window.HUNTECH_USGS_USE_PROXY)
  : FORCE_PROXY;
const FLY_FLOW_CACHE_TTL_MS = Number(window.HUNTECH_FLY_FLOW_CACHE_TTL_MS || 10 * 60 * 1000);
const SELECTION_NOTICE_STORAGE_KEY = 'huntech_selection_notice_seen_v1';
const LAST_KNOWN_LOCATION_STORAGE_KEY = 'huntech_last_location_v1';
let onboardingStepIndex = 0;
let onboardingOverlay = null;
let baseLayersControl = null;
let lidarHillshadeLayer = null;
let mdcSelectedAreaHighlight = null;
let mdcSelectedAreaPopup = null;
let huntPlanLive = false;
let huntPlanPreviewing = false;
let planLoadingTicker = null;
let planLoadingIndex = 0;
let planLoadingManualAt = 0;
let savedHuntAreas = [];
let huntJournalEntries = [];
let deerPinMarkers = new Map();
let savedHuntPlans = [];
let flyInventory = null;
let flySessions = [];
let flyWaterLayer = null;
let flyWaterMarkers = [];
let flyWaterExploreActive = false;
let flyWaterExploreHandler = null;
let flyWaterActionBar = null;
let flyCommandTray = null;
let flyCommandPrefs = null;
let flyLiveCommandTray = null;
let flyLiveSessionActive = false;
let flyFlyBoxScans = [];
let flyHatchLogs = [];
let flyCheckInAreaLayer = null;
let flyFlowCache = new Map();
let flySavedWatersCache = null;
let flyPinnedWatersCache = null;
let flyTroutIntelCache = null;
let flyTroutIntelLoadPromise = null;
let flyWaterLayerEnabled = false;
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
    body: isMushroomModule() ? 'Pick a forage area first, then open Plan + Route to run the AI plan.' : 'Pick a hunt area first, then open Plan + Route to run the AI plan.'
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

// ===================================================================
//   Education & Habitat Content Data
// ===================================================================
const SHED_EDUCATION = {
  bedding: {
    priority: 1,
    title: "Bedding Area (HIGHEST PRIORITY)",
    description: "Core security cover where mature bucks stage, especially leeward slopes and thermal shelter. Sheds drop after cold snaps and bedding shifts.",
    tips: "Work leeward sides, benches, and head of drainages. Favor shade at midday, sun edges on cold mornings. Keep wind in your face and scan low."
  },
  transition: {
    priority: 2,
    title: "Transition Zone (HIGH PRIORITY)",
    description: "Movement corridors and rut funnels between bed and feed. Saddles, pinch points, and crossings concentrate mature buck travel.",
    tips: "Search the downwind edge and secondary trails. At saddles, check the upper and lower crossing Xs. Best with a quartering wind and rising thermals."
  },
  feeding: {
    priority: 3,
    title: "Feeding Area (MEDIUM PRIORITY)",
    description: "Food edges and staging areas where deer linger before dark. Sheds fall at entry trails and the first cover break.",
    tips: "Scan 30-60 yards inside cover, inside corners, and staging points. Look for fresh droppings, browse line, and late rubs."
  },
  water: {
    priority: 4,
    title: "Water Source (MEDIUM-LOW PRIORITY)",
    description: "Water and drainages create travel lanes. Crossings and benches stack sign where deer slow down.",
    tips: "Check both banks, high ground exits, and trail splits. Focus on shallow crossings and parallel trails above the water."
  },
  open: {
    priority: 5,
    title: "Open Area (LOWEST PRIORITY)",
    description: "Low cover travel between cover blocks. Sheds show up near lone cover, fence gaps, and low spots.",
    tips: "Work low spots, fence gaps, and lone brush. Glass far, then grid the first cover on both sides."
  }
};

const HOTSPOT_FLAVOR = {
  bedding: {
    titles: ['Leeward Bedding Pocket', 'Hidden Bed Cluster', 'Thermal Cover Bowl', 'Secluded Thicket Bed', 'Wind-Safe Bedding Edge'],
    reasons: [
      'This pocket keeps a buck on the leeward edge where he can see downhill and scent check behind him.',
      'Cover density plus a quick escape route makes this a mature buck bed when pressure rises.',
      'Thermals pool here in the evening and lift in the morning, letting bucks monitor two wind layers.',
      'This bed stays shaded longer in the day, which keeps deer settled and sheds nearby after a cold snap.',
      'Bedding here connects to a secondary exit trail that mature bucks use when the main trail is hot.'
    ],
    search: [
      'Work the leeward edge first; beds and sheds stack along the wind-facing lip.',
      'Check the first bench below the bed cluster where bucks stand up and stretch.',
      'Glass the shadowed understory before walking it; antlers hide low in dark cover.',
      'Follow the quietest exit trail 30-50 yards; sheds drop after the first turn.',
      'Spend 25-40 minutes here if fresh sign is present; then move to the next bed pocket.'
    ],
    approach: [
      'Enter from downwind and below the ridge; avoid skylining on the crest.',
      'Use thick cover as your buffer and pause every few steps to scan for tines.',
      'If wind shifts, back out and hit the opposite edge; bucks bed to the wind.',
      'Stay low and quiet; treat this like a still-hunt with short steps and long looks.',
      'Watch thermals: morning rise, stay below; evening sink, stay above.'
    ]
  },
  transition: {
    titles: ['Trail Funnel Crossing', 'Natural Pinch Gap', 'Timber-to-Field Transition', 'Creek Edge Corridor', 'Movement Saddle'],
    reasons: [
      'This saddle is a rut funnel; bucks cruise the leeward edge to scent check without exposure.',
      'Terrain pinch plus cover creates a primary line and a secondary downwind trail mature bucks favor.',
      'A crosswind here lets bucks smell both sides while staying in cover.',
      'The top and bottom X crossings show two elevation bands; check both for rubs and drops.',
      'This is a low risk crossing when pressure is up; mature bucks skirt the obvious trail.'
    ],
    search: [
      'Grid 30-50 yards downwind of the main trail; sheds often fall after the pinch.',
      'Check the leeward lip of the saddle and the first bench below it.',
      'Follow secondary trails and side-hill tracks before the main beaten path.',
      'Look for rubs on the downwind edge and hair in beds near the exit.',
      'Spend 20-30 minutes; if sign is cold, slide to the next micro pinch.'
    ],
    approach: [
      'Enter from downwind and low; avoid skylining on the ridge line.',
      'Use a slow S pattern across the corridor to cover both elevation bands.',
      'Pause at every trail merge; scan ahead for beams and tines.',
      'If the wind swings, back out and work the opposite side.',
      'Use thermals: morning rise, stay below; evening sink, stay above.'
    ]
  },
  feeding: {
    titles: ['Quiet Food Edge', 'Late-Season Feed Line', 'Entry/Exit Corner', 'Protected Crop Strip', 'Browse Pocket'],
    reasons: [
      'This entry corner is a staging lane; deer pause here before entering the open.',
      'Cover proximity lets bucks scent check the field edge without exposure.',
      'Repeated entry at this corner concentrates drops and rubs on the inside edge.',
      'Late-season pressure pushes deer to this quieter edge and inside trail.',
      'The browse line keeps deer milling, which increases drop odds.'
    ],
    search: [
      'Focus on the first 30-60 yards inside cover; sheds drop before full exit.',
      'Check the inside corner and scan rubs on the edge trees.',
      'Walk the edge twice: tight to cover, then 20-40 yards inside.',
      'Look for droppings, browse line, and worn staging scrapes.',
      'Start at the most protected entry and work outward.'
    ],
    approach: [
      'Stay inside the cover line to avoid spooking deer off the field.',
      'Move parallel to the edge and angle in only when you see sign.',
      'Approach with wind in your face; let cover hide you.',
      'Midday shade edges hold deer longer; early sun edges warm them after cold nights.',
      'Scan open lanes first, then work the tighter cover.'
    ]
  },
  water: {
    titles: ['Creek Edge Cut', 'Hidden Water Crossing', 'Low Bank Funnel', 'Drainage Throat', 'Wet-Weather Corridor'],
    reasons: [
      'Crossings force a slow step and head down, which raises drop odds.',
      'The bank funnels movement into a narrow line with consistent track traffic.',
      'This low edge is a scent sink; bucks use the downwind side to check trails.',
      'A shallow crossing keeps traffic consistent even when pressure is low.',
      'Water plus cover creates a low risk travel lane in daylight.'
    ],
    search: [
      'Check both banks and the first high ground where deer shake off water.',
      'Follow the beaten trail, then sweep just off the bank for hidden tines.',
      'Walk the wet to dry transition; sheds drop at the footing change.',
      'Look for parallel trails above the waterline in thicker cover.',
      'Grid flat spots near the waterline where deer pause and mill.'
    ],
    approach: [
      'Stay on the downwind side of the crossing to avoid blowing scent upstream.',
      'Move slow near the waterline; sheds hide in debris and dark shadow.',
      'Use the bank as a natural blind while you scan the far side.',
      'Evening thermals pull scent into drains; stay above if the air is sinking.',
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
      'Walk the line twice and scan low; sheds hide in short grass.',
      'Check both sides of the fence line and the first cover clump.',
      'Sweep a wide arc around the lone cover feature.',
      'Focus on low spots where deer drop their heads to climb.',
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

const HABITAT_OVERVIEW = {
  bedding: 'Leeward bedding pocket with thermal shelter and quick exits',
  transition: 'Rut funnel and scent-check corridor between bed and feed',
  feeding: 'Staging edge where deer gather before dark',
  water: 'Drainage travel lane with consistent crossings',
  open: 'Low cover connector between cover blocks'
};

const HABITAT_LOOK_FOR = {
  bedding: 'Fresh beds, hair, rub lines on the leeward edge, and a quiet secondary exit trail.',
  transition: 'Polished crossings, secondary trails, saddle Xs, and rubs on the downwind side.',
  feeding: 'Entry trails, droppings, browse line, and the first cover break off the feed.',
  water: 'Track clusters, muddy exits, shallow crossings, and trails climbing to dry benches.',
  open: 'Subtle low spots, fence gaps, and lone cover that pulls movement.'
};

// ===================================================================
//   Module Detection Helpers
// ===================================================================
function isFlyModule() {
  return Boolean(document.body && document.body.classList.contains('module-fly'));
}

function isMushroomModule() {
  return Boolean(document.body && document.body.classList.contains('module-mushroom'));
}

function isTurkeyModule() {
  return Boolean(document.body && document.body.classList.contains('module-turkey'));
}

function isShedModule() {
  return Boolean(document.body && document.body.classList.contains('module-shed'));
}

// ===================================================================
//   Mushroom Foraging — Education & Habitat Data
//   Based on Missouri morel research, mycological field guides,
//   and traditional foraging wisdom.
// ===================================================================

const MUSHROOM_EDUCATION = {
  bedding: {
    priority: 1,
    title: 'South-Facing Hardwood Slope (Early Morels)',
    description: 'Warm, sunlit slopes wake up first after spring rains. Morels fruit where leaf litter warms quickly and holds moisture against the soil. In Missouri, south-facing hardwood ridges produce the earliest flushes — often 7-10 days ahead of north slopes. The mycelium responds to soil temps reaching 50-55°F at 4 inches deep.',
    tips: 'Start low on the slope and work uphill in 15-25 yard lanes. Scan near downed limbs and the uphill side of trees that catch morning and midday sun. Pause every few steps and look at ankle level — morels blend into last year\'s leaf litter.',
    lookFor: 'Honeycomb caps poking through moist leaf litter, sun-warmed soil pockets near dying trees, bark mulch around old stumps. Half-free morels often appear a week before yellows.',
    treeFocus: ['Elm (dying/dead)', 'Ash (declining)', 'Tulip Poplar', 'Sycamore', 'Cottonwood'],
    treeNotes: 'Dying Elm: look for bark sloughing off in strips and branch dieback in the crown — this is the #1 morel producer in Missouri. Ash: opposite branching pattern with diamond-ridged bark, declining from Emerald Ash Borer. Tulip Poplar: tulip-shaped leaves (4 lobes), tall straight trunk. Sycamore: distinctive mottled white/tan/green bark that flakes in patches.',
    seasonCues: [
      'First green leaves appearing on south-facing slopes',
      'Daytime highs consistently 60-70°F, nights staying above 40°F',
      '48-72 hours after a soaking rain (1"+ over 24hrs)',
      'Redbuds blooming and dogwoods just starting to open',
      'Soil temperature at 4" depth reaching 50-55°F',
      'May apples emerging and unfurling their umbrella leaves'
    ],
    treeId: {
      elm: {
        name: 'American Elm (Ulmus americana)',
        bark: 'Deep, interlacing diamond ridges; gray-brown. Dying trees show loose, peeling bark strips.',
        leaves: 'Alternate, doubly serrate, asymmetric base, 3-6" long. Look for last year\'s leaves on ground.',
        shape: 'Classic vase shape when healthy. Dead elms have bare upper branches like skeleton fingers.',
        tip: 'The #1 morel tree in Missouri. Dead and dying elms within the last 1-3 years are morel magnets. Check a 30-foot radius around every dying elm you find.'
      },
      ash: {
        name: 'White/Green Ash (Fraxinus spp.)',
        bark: 'Diamond pattern with tight, interlocking ridges. Gray to brown.',
        leaves: 'Compound, opposite, 5-9 leaflets. Last year\'s fallen compound leaves are distinctive.',
        shape: 'Oval crown, opposite branching. Many are declining from Emerald Ash Borer — look for D-shaped exit holes and bark blonding.',
        tip: 'Declining ash trees (not fully dead) produce excellent morel flushes. The stress triggers the fungal fruiting. Check within 20 feet of the trunk base.'
      },
      tulipPoplar: {
        name: 'Tulip Poplar (Liriodendron tulipifera)',
        bark: 'Deep furrows in a tight diamond pattern; gray-brown. Younger trees have smooth, greenish bark.',
        leaves: 'Unique 4-lobed tulip shape — flat across the top. Bright green, turning yellow in fall.',
        shape: 'Tall, straight trunk that self-prunes lower branches. Crown is narrow and high.',
        tip: 'Morels appear in the duff zone within 15 feet of mature tulip poplars, especially on south-facing slopes. Less famous than elm but very reliable in Missouri.'
      },
      sycamore: {
        name: 'American Sycamore (Platanus occidentalis)',
        bark: 'Unmistakable mottled patchwork of white, tan, and olive-green. Bark flakes in large irregular plates.',
        leaves: 'Broad, 3-5 lobed, maple-like but larger (6-10"). Fuzzy undersides.',
        shape: 'Massive spreading crown. Often found near water. Lower trunk can be hollow.',
        tip: 'Sycamores along creek bottoms and floodplains produce mid-to-late season morels. The leaf litter holds moisture well and creates ideal fruiting microclimate.'
      },
      cottonwood: {
        name: 'Eastern Cottonwood (Populus deltoides)',
        bark: 'Deeply furrowed, thick ridges on mature trees. Young bark is smooth and yellowish.',
        leaves: 'Triangular (deltoid), coarsely toothed, 3-5" wide. Flutter in light wind on flattened petioles.',
        shape: 'Large, spreading crown. Found in bottomlands and near water.',
        tip: 'Big cottonwoods in floodplains are prime late-season spots. Check the root flare zone and any area where leaf litter collects against the trunk.'
      }
    }
  },
  transition: {
    priority: 2,
    title: 'Edge + Warming Ridge Line (High Priority)',
    description: 'Edges where hardwood canopy meets openings warm fast and trap humidity in the leaf litter. These transition zones get the "greenhouse effect" — sun warms the opening while the canopy holds moisture. Morels and other spring fungi hold in these micro-climates. In Missouri, ridge lines and field edges on the south and west sides produce consistently.',
    tips: 'Work the edge line itself, then sweep 20-40 yards into the timber. Recheck every tree that shows early bud break — the leaf canopy closing overhead is a signal that soil temps are in the zone. Focus on the timber side of the edge.',
    lookFor: 'Leaf litter breaks where sun hits the ground, old bark chips, damp soil along the edge transition. Small morels often hide right at the grass-timber line.',
    treeFocus: ['White Oak', 'Hickory (Shagbark)', 'Elm (dying)', 'Hackberry'],
    treeNotes: 'White Oak: rounded leaf lobes (no points), light gray scaly bark in loose plates. Hickory: shaggy bark peeling in long strips, compound leaves with 5-7 leaflets. Hackberry: warty gray bark with distinctive corky ridges.',
    seasonCues: [
      'Bud swell on hardwoods — buds fat but not yet open',
      'Grass just starting to green at tree line edges',
      'Warming trend after last frost — 3+ days of 60°F+ highs',
      'Dandelions blooming in open fields nearby',
      'Lilac bushes in early bloom (traditional morel indicator)'
    ],
    treeId: {
      whiteOak: {
        name: 'White Oak (Quercus alba)',
        bark: 'Light gray, scaly, peeling in loose vertical strips and plates.',
        leaves: 'Alternate, 7-9 rounded lobes (no sharp points). Deep sinuses. 5-9" long.',
        shape: 'Broad, spreading crown with massive lateral branches.',
        tip: 'White oaks in transition edges produce good morel habitat. The leaf litter decomposes slowly, providing steady nutrients. Check within 25 feet of mature white oaks at field edges.'
      },
      hickory: {
        name: 'Shagbark Hickory (Carya ovata)',
        bark: 'Long, shaggy strips peeling away from trunk — unmistakable "shredded" look.',
        leaves: 'Compound, alternate, 5 leaflets (occasionally 7). End leaflet largest.',
        shape: 'Tall with a narrow, open crown. Bark becomes shaggy at 20-25 years.',
        tip: 'Hickory-oak transition zones are prime morel territory. The mixed leaf litter creates ideal soil chemistry. Focus on areas where hickory and elm or oak leaf litter overlap.'
      },
      hackberry: {
        name: 'Common Hackberry (Celtis occidentalis)',
        bark: 'Unique warty or corky ridges on gray bark — feels rough and bumpy.',
        leaves: 'Alternate, simple, asymmetric base like elm but smoother edges. 2-5" long.',
        shape: 'Medium tree, irregular crown shape. Often found in bottomlands and edges.',
        tip: 'Hackberry indicates rich, moist soil — good morel habitat. Not a primary host tree but a reliable indicator species. Where hackberry grows, conditions favor morels.'
      }
    }
  },
  feeding: {
    priority: 3,
    title: 'Creek Bottoms + Floodplain (Mid-Season)',
    description: 'As the season advances and south slopes dry out, cooler creek bottoms and floodplains keep moisture longer and produce steady mid-season flushes. In Missouri, the creeks that run through hardwood timber are gold — especially where old elms or cottonwoods line the banks. The consistent moisture means you can find morels here 1-2 weeks after the early slopes are done.',
    tips: 'Grid the first benches (flat shelves) above the creek, focusing on the base of large trees. Check shaded, damp leaf litter especially on the north side of the creek channel. These areas often produce gray and yellow morels simultaneously.',
    lookFor: 'Moist soil that springs back when you step on it, leaf duff near root flares, small drainages feeding into the main creek. Watch for half-free morels (Morchella punctipes) which appear slightly earlier than true morels in these bottoms.',
    treeFocus: ['Cottonwood', 'Sycamore', 'Silver Maple', 'Box Elder', 'Elm (dead standing)'],
    treeNotes: 'Silver Maple: deeply lobed leaves with silvery undersides, opposite branching. Box Elder: compound leaves with 3-5 leaflets, looks like a giant weed — but indicates rich bottomland soil perfect for morels.',
    seasonCues: [
      'Soil staying damp between rains without puddles',
      'Leaf canopy 50-75% formed overhead',
      'Daytime highs consistently 65-75°F',
      'Jack-in-the-pulpit emerging in the understory',
      'Wild phlox and trillium blooming on the slopes above',
      'Morel season 2-3 weeks running on south slopes'
    ],
    treeId: {
      silverMaple: {
        name: 'Silver Maple (Acer saccharinum)',
        bark: 'Shaggy, peeling in long thin strips on older trees. Silvery-gray.',
        leaves: 'Deeply cut 5 lobes with silvery-white undersides. 4-7" wide.',
        shape: 'Fast-growing, often multi-trunked. Branches brittle — look for storm damage.',
        tip: 'Silver maples in floodplains create damp, shaded micro-sites perfect for mid-season morels. Check the root flare zone and any cavities where moisture collects.'
      },
      boxElder: {
        name: 'Box Elder (Acer negundo)',
        bark: 'Thin, pale gray-brown with shallow ridges. Often has green patches.',
        leaves: 'Compound (unusual for a maple), opposite, 3-5 leaflets.',
        shape: 'Scrubby, irregular. Often leans. Multiple trunks common.',
        tip: 'Box elder is an understory indicator of rich, moist bottomland soil. Where box elders grow thick, the soil chemistry and moisture regime favor morel fruiting. Check the leaf litter within 10-15 feet.'
      }
    }
  },
  water: {
    priority: 4,
    title: 'Seeps + Drainages (Moisture Pockets)',
    description: 'Natural seeps, springs, and small drainages create steady moisture zones that keep fungal mycelium active even when surrounding slopes dry out. In Missouri, these "wet-weather" drainages that only flow after rain are some of the most consistent late-season producers. The cool air pooling effect keeps soil temps in the fruiting zone longer.',
    tips: 'Follow small drainages uphill from the creek. Scan the upslope side where water seeps out of the hillside. These areas often hold morels when everything else has dried up. Work slowly — the ground cover is thicker and morels hide well.',
    lookFor: 'Moist leaf litter even on dry days, mossy logs and rocks, small springs bubbling up, green moss carpets on north-facing banks. Ferns unfurling (fiddleheads) indicate consistent moisture.',
    treeFocus: ['Sycamore', 'Elm (standing dead)', 'Willow', 'Pawpaw'],
    treeNotes: 'Willow: narrow lance-shaped leaves, flexible branches, always near water. Pawpaw: large tropical-looking leaves (8-12") in an understory cluster — indicates rich, moist soil. Where pawpaw grows, the soil is prime morel habitat.',
    seasonCues: [
      'Humidity stays high in drainage bottoms even on sunny days',
      'Ground never fully dries between rains',
      'Recent rain followed by 2-3 warm nights (above 50°F)',
      'Fiddlehead ferns unfurling along the seep edges',
      'Late-season on the main slopes but still finding fresh caps in the drainages'
    ],
    treeId: {
      pawpaw: {
        name: 'Pawpaw (Asimina triloba)',
        bark: 'Smooth, thin, gray-brown with small lighter blotches.',
        leaves: 'Very large (8-12"), oblong, drooping. Tropical appearance. Alternate.',
        shape: 'Small understory tree, 15-30 feet. Forms colonies from root suckers.',
        tip: 'Pawpaw groves indicate rich, consistently moist soil with high organic content — perfect morel conditions. Not a host tree itself, but the best indicator species in Missouri bottomlands. Grid pawpaw patches slowly and scan low.'
      },
      willow: {
        name: 'Black Willow (Salix nigra)',
        bark: 'Dark brown to black, deeply furrowed with interconnecting ridges.',
        leaves: 'Narrow, lance-shaped, 3-6" long, finely serrate. Alternate.',
        shape: 'Often leaning or multi-trunked. Flexible, drooping branches.',
        tip: 'Willows mark consistent water sources. Check the uphill side of willow stands where the seep zone meets drier ground — that transition line often holds late morels.'
      }
    }
  },
  open: {
    priority: 5,
    title: 'Old Orchard + Disturbed Ground (Late/Bonus)',
    description: 'Old apple orchards, burned areas, logged edges, and other disturbed ground can produce surprise morel flushes. In Missouri, abandoned homesteads with old fruit trees are legendary producers. Fire-scarred areas can fruit heavily the spring after a burn. These spots are unpredictable but can be incredibly productive when conditions align.',
    tips: 'Check the base of old fruit trees and the first shade line of any remaining canopy. In burn areas, focus on the edges where the burn meets unburned timber. Move slow and scan 360° at each tree — morels can appear on any side.',
    lookFor: 'Patchy leaf litter around old stumps, charcoal-stained soil, decaying wood and root zones, abandoned fencerows with old trees. Burn morels (Morchella tomentosa/sextelata) are darker and often grow in dense clusters.',
    treeFocus: ['Apple (old orchard)', 'Elm (dying)', 'Hickory', 'Cherry (wild)'],
    treeNotes: 'Old Apple: rough dark bark, open spreading crown, fruit "mummies" on the ground. Wild Cherry: horizontal lenticels on bark that look like dash lines, reddish-brown. Mature cherry bark becomes scaly and dark.',
    seasonCues: [
      'Late-season flush after warm rain (late April through mid-May in Missouri)',
      'Warm days (70°F+) with cool nights (50-55°F)',
      'Leaf litter still holding moisture under old canopy',
      'Previous year burn areas greening up for the first time',
      'Other hunters reporting the season is "over" on the main ridges'
    ],
    treeId: {
      apple: {
        name: 'Old Apple (Malus domestica)',
        bark: 'Rough, scaly, dark gray-brown. Older trees have deeply furrowed bark.',
        leaves: 'Simple, oval, finely serrate with soft fuzz underneath.',
        shape: 'Open, twisted crown. Often leaning. Old orchards have regular spacing.',
        tip: 'The most famous "bonus" morel spot in Missouri. Old abandoned orchards with dying apple trees produce morels reliably every spring. Check a full 30-foot radius around every old apple tree — the root system extends far and the mycelial network follows it.'
      },
      wildCherry: {
        name: 'Wild Black Cherry (Prunus serotina)',
        bark: 'Young: smooth, reddish-brown with horizontal lenticels (dash marks). Mature: dark, scaly, flaking in thick irregular plates.',
        leaves: 'Alternate, simple, finely serrate with inward-curving teeth. Shiny dark green.',
        shape: 'Tall, narrow crown in forests. Open-grown trees spread wider.',
        tip: 'Wild cherry in transition edges and disturbed areas can produce late morels where the leaf litter mixes with decaying cherry wood. Check where cherry trees meet old fields.'
      }
    }
  }
};

const MUSHROOM_FLAVOR = {
  bedding: {
    titles: ['Sun-Warmed Slope Pocket', 'Early Morel Ridge Break', 'South Slope Leaf Litter', 'Warm-Bed Hardwood Shelf', 'Elm Graveyard South Face'],
    reasons: [
      'This slope warms first in spring and kickstarts the morel flush after soaking rain.',
      'Leaf litter here holds heat and moisture against the soil — perfect fruiting conditions.',
      'A sheltered shelf on this south face keeps humidity steady even after wind shifts.',
      'Dying elm and ash trees on this slope create a mycelial network primed for morels.',
      'The soil temperature here reaches fruiting range (50-55°F) 7-10 days before north slopes.'
    ],
    search: [
      'Work uphill in tight 15-yard lanes, scanning every 6-10 feet at ankle level.',
      'Recheck the base of every dying hardwood and downed limb — scan a full circle.',
      'Slow down near old stumps and scan the leaf litter in low-angle morning light.',
      'Check the uphill side of large trees where rain runoff creates moisture pockets.',
      'Come back to this spot 48 hours after each rain — fresh morels can appear overnight.'
    ],
    approach: [
      'Enter from the bottom of the slope and work your way up; morels are easier to spot looking uphill.',
      'Walk slowly with the sun at your back — caps glow amber in backlight and are easier to spot.',
      'Bring a walking stick to gently move leaf litter near promising trees.',
      'If you find one morel, stop and grid a tight 20-foot circle — they rarely grow alone.',
      'Mark every find with a GPS waypoint; next year\'s flush will likely return within 10 feet.'
    ]
  },
  transition: {
    titles: ['Edge-Line Warming Zone', 'Timber-Field Transition Break', 'Ridge Shoulder Sweet Spot', 'Canopy Edge Greenhouse', 'Treeline Humidity Trap'],
    reasons: [
      'The edge where timber meets open ground creates a "greenhouse" — warm air + canopy moisture.',
      'Mixed leaf litter from multiple hardwood species creates ideal soil chemistry for morels.',
      'This ridge shoulder gets early sun exposure and holds moisture in the timber shadow.',
      'Bud break on edge trees signals soil temps entering the morel fruiting window.',
      'Humidity trapped under the closing canopy keeps the mycelium active longer here.'
    ],
    search: [
      'Work the edge line itself first, then sweep 20-40 yards into the timber side.',
      'Zigzag along the tree line — check both the open side and the shaded timber side.',
      'Focus on trees showing the earliest bud break; the soil beneath them is warmest.',
      'Grid any area where you see May apples or wild ginger emerging — same soil temp indicators.',
      'Recheck this edge every 3-4 days during peak season; it can produce multiple flushes.'
    ],
    approach: [
      'Enter from the open side and work into the timber; your eyes adjust to the shade.',
      'If the edge faces south or west, start at the western end in morning and work east with the light.',
      'Carry a mesh bag so spores drop through as you walk — you\'re seeding future flushes.',
      'Mark the trees along the edge that produce; they\'re the host trees for the mycelial network.',
      'Return after every substantial rain during the 3-week peak window.'
    ]
  },
  feeding: {
    titles: ['Creek Bottom Shelf', 'Floodplain Bench', 'Streamside Moisture Lane', 'Bottomland Flat', 'Drainage Confluence Zone'],
    reasons: [
      'This creek bottom holds moisture longer than any slope — extending your season 1-2 weeks.',
      'The flat bench above the creek creates a humidity blanket under the canopy.',
      'Floodplain soil is rich with decomposed organic matter — prime mycelial habitat.',
      'Cottonwood and sycamore root systems along this creek create extensive morel networks.',
      'Where small drainages meet the main creek, nutrients concentrate and morels cluster.'
    ],
    search: [
      'Grid the first flat bench above the creek — this is where moisture and drainage balance perfectly.',
      'Check the base of every large tree within 20 feet of the creek channel.',
      'Work both sides of the creek; one bank often produces better depending on sun exposure.',
      'Focus on the north bank where shade keeps soil damp, or south bank for warmth — check the date.',
      'Scan log jams and downed wood along the creek; decaying wood holds moisture and feeds mycelium.'
    ],
    approach: [
      'Walk the creek upstream; approach downed trees and root wads from the downstream side.',
      'Wear waterproof boots — you\'ll cross the creek multiple times to check both banks.',
      'Go slow in bottomland; the thick ground cover hides morels better than any slope.',
      'Check under fern fronds and May-apple umbrellas — morels love the same damp shade.',
      'If the water is up from recent rain, focus on the higher benches 20-30 feet from the creek.'
    ]
  },
  water: {
    titles: ['Seep Spring Moisture Line', 'Drainage Head Pocket', 'Wet-Weather Draw', 'Hillside Spring Zone', 'Ravine Seep Edge'],
    reasons: [
      'This seep line provides consistent moisture even when surrounding slopes dry out.',
      'Cool air pools here after sunset, keeping soil temps in the fruiting zone longer.',
      'The wet-weather draw creates a moisture gradient from saturated to just-damp — morel sweet spot.',
      'Springs and seeps maintain the 50-55°F soil temp range well into late season.',
      'Moss-covered rocks and logs here indicate the persistent humidity morels need.'
    ],
    search: [
      'Follow the seep uphill and scan both sides of the flow line within 15 yards.',
      'Check the mossy logs and root wads where the seep emerges from the hillside.',
      'Grid the transition zone where wet ground gives way to just-damp leaf litter.',
      'Look for fiddlehead ferns; where they grow, the moisture is consistent enough for morels.',
      'Come back to this spot even in dry years — seeps produce when nothing else does.'
    ],
    approach: [
      'Approach from downhill and work up along the seep — moisture concentration increases uphill.',
      'Step carefully; the ground is soft and you can damage the mycelial mat under the surface.',
      'These spots are often in deep shade — use a headlamp in early morning for better contrast.',
      'Check north-facing banks of the ravine first; they stay moist throughout the day.',
      'Identify and flag reliable seeps for future seasons; they produce year after year.'
    ]
  },
  open: {
    titles: ['Old Orchard Pocket', 'Burn Edge Revival Zone', 'Disturbed Ground Bonus Site', 'Fencerow Heritage Trees', 'Homestead Ghost Orchard'],
    reasons: [
      'Old orchard apple trees are legendary morel producers in Missouri; root systems feed mycelial networks for decades.',
      'The year after a burn, disturbed soil and ash nutrients trigger massive morel flushes.',
      'Logged edges and stumps from recent timber work create the decomposition morels need.',
      'Old fencerow trees — especially elm and apple — survive decades after fields are cleared.',
      'Abandoned homesteads with fruit trees are bucket-list morel spots that produce every year.'
    ],
    search: [
      'Circle every old fruit tree in a full 30-foot radius; morels follow the root network.',
      'In burn areas, focus on the edge where burn meets unburned forest — highest concentration.',
      'Check old stumps, root balls, and any decaying wood at the ground surface.',
      'Scan fencerows from end to end; every remaining tree gets a full circle search.',
      'Mark productive orchard trees with GPS; they are annuity spots that pay for years.'
    ],
    approach: [
      'Approach old orchards from the access road; the trees are usually spaced for walking.',
      'In burn areas, watch your footing — burned ground hides holes and unstable root cavities.',
      'Go early in the morning when morels are still damp and slightly glossy from dew.',
      'Take photos of every find spot; over multiple years a pattern will emerge.',
      'Ask landowners about old homesteads and orchards; local knowledge is irreplaceable.'
    ]
  }
};

const MUSHROOM_HABITAT_OVERVIEW = {
  bedding: 'Early-season warm hardwood slope with sun exposure and leaf litter heat retention — morel priority zone.',
  transition: 'Edge line where timber meets openings, warming quickly while trapping humidity in the leaf litter.',
  feeding: 'Moist creek bottom and floodplain shelf with steady humidity and rich organic soil.',
  water: 'Seep line, spring, or drainage that holds moisture consistently even on dry days.',
  open: 'Old orchard, burn scar, or disturbed ground that produces bonus and late-season morel flushes.'
};

const MUSHROOM_HABITAT_LOOK_FOR = {
  bedding: 'Honeycomb caps near dying elms, ash, and tulip poplars. Warm leaf litter on south-facing slopes. Sun-warmed soil pockets near downed limbs.',
  transition: 'Leaf litter color changes at the timber-field edge, small dips that hold moisture, trees showing earliest bud break.',
  feeding: 'Damp soil near root flare zones, shaded benches above the creek, decaying wood along the channel.',
  water: 'Moist leaf litter even on dry days, mossy logs, spring seeps, fiddlehead ferns unfurling.',
  open: 'Old fruit tree root lines, charcoal-stained soil in burn areas, decaying stumps and fencerow trees.'
};

// Mushroom-specific seasonal intelligence for Missouri
const MUSHROOM_SEASON_STAGES = {
  earlyPre: {
    label: 'Pre-Season (Early March)',
    soilTemp: '< 45°F',
    focus: 'Scout and identify host trees. Mark dying elms, ash, and old orchards. No fruiting expected yet.',
    indicators: 'Ground still frozen in spots. No green-up. Snow melt still running.'
  },
  early: {
    label: 'Early Season (Late March - Early April)',
    soilTemp: '45-50°F',
    focus: 'South-facing slopes and warming ridges ONLY. Half-free morels may appear first. Small black morels near elms.',
    indicators: 'Redbuds just starting to bloom. First dandelions in yards. Soil softening on south slopes.'
  },
  peak: {
    label: 'Peak Season (Mid April - Early May)',
    soilTemp: '50-58°F',
    focus: 'All habitat types producing. Yellow morels at peak. Work south slopes → edges → creek bottoms as weeks progress.',
    indicators: 'Dogwoods in full bloom. May apples fully unfurled. Lilacs blooming. Oak leaves dime-sized.'
  },
  late: {
    label: 'Late Season (Mid May)',
    soilTemp: '58-65°F',
    focus: 'North slopes, deep bottoms, seep areas, and orchards. South slopes done. Big yellows in creek bottoms.',
    indicators: 'Full leaf canopy. Ferns fully unfurled. Soil drying on slopes. Focus shifts to moisture retention zones.'
  },
  post: {
    label: 'Post-Season (Late May+)',
    soilTemp: '> 65°F',
    focus: 'Season winding down. Only seeps and deep shade still producing. Start logging data for next year.',
    indicators: 'Forest fully leafed out. Ground drying. Mushrooms found are often past prime.'
  }
};

// ===================================================================
//   Module-Aware Getter Functions
// ===================================================================

function getActiveEducationSet() {
  if (isTurkeyModule() && window.TURKEY_EDUCATION) return window.TURKEY_EDUCATION;
  return isMushroomModule() ? MUSHROOM_EDUCATION : SHED_EDUCATION;
}

function getActiveFlavorSet() {
  if (isTurkeyModule() && window.TURKEY_HOTSPOT_FLAVOR) return window.TURKEY_HOTSPOT_FLAVOR;
  return isMushroomModule() ? MUSHROOM_FLAVOR : HOTSPOT_FLAVOR;
}

function getActiveHabitatOverview() {
  if (isTurkeyModule() && window.TURKEY_HABITAT_OVERVIEW) return window.TURKEY_HABITAT_OVERVIEW;
  return isMushroomModule() ? MUSHROOM_HABITAT_OVERVIEW : HABITAT_OVERVIEW;
}

function getActiveHabitatLookFor() {
  if (isTurkeyModule() && window.TURKEY_HABITAT_LOOK_FOR) return window.TURKEY_HABITAT_LOOK_FOR;
  return isMushroomModule() ? MUSHROOM_HABITAT_LOOK_FOR : HABITAT_LOOK_FOR;
}

function getModuleEducationLabels() {
  if (isTurkeyModule() && window.TURKEY_EDUCATION_LABELS) {
    return window.TURKEY_EDUCATION_LABELS;
  }
  if (isMushroomModule()) {
    return {
      pinBrief: 'Forage Pin Brief',
      reason: 'Forage briefing',
      microReason: 'Micro forage brief',
      whyTitle: 'Why this spot',
      approachTitle: 'How to forage it',
      lookForTitle: 'What to look for',
      checkInLabel: 'Check In',
      checkOutLabel: 'Check Out'
    };
  }
  return {
    pinBrief: 'Pin Education Brief',
    reason: 'Education briefing',
    microReason: 'Micro pin brief',
    whyTitle: 'Why this pin',
    approachTitle: isMushroomModule() ? 'How to forage it' : 'How to hunt it',
    lookForTitle: 'What to look for',
    checkInLabel: 'Check In',
    checkOutLabel: 'Check Out'
  };
}

function getModulePinLabel() {
  if (isTurkeyModule()) return 'setup';
  return isMushroomModule() ? 'forage pin' : 'pin';
}

function getModuleSweepVerb() {
  if (isTurkeyModule()) return 'hunt';
  return isMushroomModule() ? 'work' : 'sweep';
}

function getMushroomSeasonStage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (month < 3 || (month === 3 && day < 20)) return MUSHROOM_SEASON_STAGES.earlyPre;
  if (month === 3 || (month === 4 && day < 10)) return MUSHROOM_SEASON_STAGES.early;
  if ((month === 4 && day >= 10) || (month === 5 && day < 10)) return MUSHROOM_SEASON_STAGES.peak;
  if (month === 5 && day < 25) return MUSHROOM_SEASON_STAGES.late;
  return MUSHROOM_SEASON_STAGES.post;
}

function getThermalCueForType(type, windDir) {
  const key = String(type || '').toLowerCase();
  const cues = {
    thermal_drain: {
      label: 'Thermal drain',
      role: 'Sink',
      detail: 'Cool air pools and pulls scent downhill into the low spot.',
      best: 'Best during evening sink or calm conditions.'
    },
    leeward_pocket: {
      label: 'Leeward pocket',
      role: 'Mixed',
      detail: 'Sheltered slope can hold scent and bedded deer depending on lift.',
      best: 'Watch for morning rise and late-day sink shifts.'
    },
    bench: {
      label: 'Bench line',
      role: 'Mixed',
      detail: 'Thermals often slide along this shelf before changing elevation.',
      best: 'Expect subtle lift/sink shifts along the contour.'
    },
    saddle: {
      label: 'Saddle pass',
      role: 'Mixed',
      detail: 'Thermal flow funnels through the lowest pass between ridges.',
      best: 'Switch moments create quick repositioning.'
    },
    ridge_point: {
      label: 'Ridge point',
      role: 'Source',
      detail: 'Rising thermals peel scent upward and off the point tip.',
      best: 'Best during morning rise or sunny lift.'
    },
    micro_nob: {
      label: 'Micro nob',
      role: 'Source',
      detail: 'Small rise that sheds scent uphill when thermals lift.',
      best: 'Best during light-to-moderate rise.'
    },
    creek_line: {
      label: 'Creek drain',
      role: 'Sink',
      detail: 'Cool air often rides the drainage and pulls scent downhill.',
      best: 'Best during evening sink or cool mornings.'
    },
    water_edge: {
      label: 'Water edge',
      role: 'Sink',
      detail: 'Moist low ground pulls cooler air and holds scent longer.',
      best: 'Best during evening sink or calm conditions.'
    }
  };

  const cue = cues[key];
  if (!cue) return null;
  const wind = windDir ? `Best with ${windDir} wind.` : '';
  return {
    ...cue,
    wind,
    seedType: key
  };
}

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
  const flavorSet = getActiveFlavorSet();
  const flavor = flavorSet[habitat] || flavorSet.transition || flavorSet.travelCorridor || Object.values(flavorSet)[0];
  const safeLatLng = latlng ? L.latLng(latlng) : (bounds ? bounds.getCenter() : L.latLng(0, 0));
  const seed = seedFromLatLng(safeLatLng, habitat);
  const title = pickBySeed(flavor.titles, seed);
  const reason = pickBySeed(flavor.reasons, seed + 0.13);
  const search = pickBySeed(flavor.search, seed + 0.27);
  const approach = pickBySeed(flavor.approach, seed + 0.39);
  const region = describeRelativePosition(bounds, safeLatLng);
  const overviewMap = getActiveHabitatOverview();
  const lookForMap = getActiveHabitatLookFor();
  const isTurk = isTurkeyModule();
  const isMush = isMushroomModule();
  let wind;
  if (isTurk) {
    wind = windDir ? `Wind ${windDir} — turkeys hunt by sight, not scent. Use wind to cover your movement noise.` : 'Calm morning — ideal for hearing gobbles at distance.';
  } else if (isMush) {
    wind = windDir ? `Wind: ${windDir} — check sheltered pockets on the lee side.` : 'Calm conditions favor even moisture and steady fruiting.';
  } else {
    wind = windDir ? `Best with ${windDir} wind.` : 'Wind-neutral setup.';
  }
  const overview = overviewMap[habitat] || (isTurk ? 'Travel corridor between roost and strut zone' : (isMush ? 'Foraging zone' : 'Travel corridor'));
  const lookFor = lookForMap[habitat] || (isTurk ? 'Scratchings, J-droppings, strut marks, and tracks 4.5\"+ toe-to-heel.' : (isMush ? 'Moist leaf litter, host trees, and damp soil near woody debris.' : 'Fresh tracks, rubs, and subtle sign along the quietest line.'));
  const profile = buildHotspotSearchSpec({ habitat, coords: [safeLatLng.lat, safeLatLng.lng] }, windDir);
  const searchLabel = profile?.label ? `Search shape: ${profile.label}.` : '';
  const seasonal = getSeasonalFocus();
  const approachSteps = [search, approach];
  if (searchLabel) approachSteps.push(`Cover the ${profile.label} starting on the ${region} side.`);
  if (isTurk) {
    const weapon = window._turkeyWeapon || 'shotgun';
    const setupDist = weapon === 'bow' ? '15-20' : weapon === 'crossbow' ? '20-30' : '30-40';
    approachSteps.push(`Set up ${setupDist} yards from sign with your back against a tree wider than your shoulders.`);
    approachSteps.push('Sit still for 15-20 min before calling. Start soft — tree yelps, then clucks and purrs. Wait 15-20 min between series.');
  } else if (isMush) {
    approachSteps.push('Grid in tight 15-yard lanes and pause often to scan low in the leaf litter.');
    approachSteps.push('Recheck hot trees after each rain window — morels can appear overnight.');
  } else {
    if (windDir) approachSteps.push(`Hold a ${windDir} wind and stay on the leeward edge first.`);
    approachSteps.push('Stay 20-40 yards downwind of the main doe trail; mature bucks scent-check from cover.');
  }

  const treeFocus = Array.isArray(base?.treeFocus) ? base.treeFocus : [];
  const treeNotes = base?.treeNotes || '';
  const seasonCues = Array.isArray(base?.seasonCues) ? base.seasonCues : [];
  const treeId = base?.treeId || null;

  return {
    priority: base?.priority || 3,
    title: `${title} (${region})`,
    description: [
      `${overview} on the ${region}.`,
      wind,
      searchLabel
    ].filter(Boolean).join(' '),
    tips: lookFor,
    lookFor,
    treeFocus,
    treeNotes,
    seasonCues,
    treeId,
    why: [reason, seasonal].filter(Boolean),
    approach: approachSteps.filter(Boolean)
  };
}


// ===================================================================
//   Map Initialization & Tile Layers
// ===================================================================
function setupPillFastTap() {
  const pillSelector = [
    '.ht-pill-btn',
    '.ht-mdc-pill',
    '.ht-edu-pill',
    '.ht-mission-brief-pill',
    '.ht-draw-helper-btn'
  ].join(',');

  const findPillButton = (target) => target?.closest?.(pillSelector) || null;
  const isDisabled = (btn) => {
    if (!btn) return true;
    if (btn.disabled) return true;
    if (btn.classList.contains('is-disabled')) return true;
    return btn.getAttribute('aria-disabled') === 'true';
  };

  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    const btn = findPillButton(event.target);
    if (!btn || isDisabled(btn)) return;
    btn.dataset.htFastTap = String(Date.now());
    event.preventDefault();
    event.stopPropagation();
    btn.click();
  }, { capture: true });

  document.addEventListener('click', (event) => {
    const btn = findPillButton(event.target);
    if (!btn) return;
    const stamp = Number(btn.dataset.htFastTap || 0);
    if (!stamp) return;
    if (Date.now() - stamp < 800) {
      delete btn.dataset.htFastTap;
      event.preventDefault();
      event.stopPropagation();
    }
  }, { capture: true });
}

function bindToolbarToggleButtons() {
  if (toolbarToggleBound) return;
  const toggleButtons = document.querySelectorAll('.ht-toolbar-toggle-btn');
  if (!toggleButtons.length) return;
  const handleToggleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const now = Date.now();
    if (now - lastToolbarToggleActionAt < 250) return;
    lastToolbarToggleActionAt = now;
    window.toggleToolbar();
  };
  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', handleToggleClick);
  });
  toolbarToggleBound = true;
}

let shedMapPending = false;
function activateShedMap() {
  if (!isShedModule()) return;
  if (!mapInitialized) {
    shedMapPending = false;
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    initializeMap();
    restoreLastKnownLocation();
    setDefaultAreaFromLocation();
    updateFilterChips();
    updateWorkflowUI();
    updateLocateMeOffset();
    setTimeout(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    }, 320);
  } else {
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    setTimeout(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    }, 320);
  }
  // Removed automatic location centering to prevent GPS notifications
  // setTimeout(() => centerOnMyLocationInternal(), 500);
}
window.activateShedMap = activateShedMap;

function activateFlyMap() {
  if (!isFlyModule()) return;
  if (!mapInitialized) {
    flyMapPending = false;
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    initializeMap();
    restoreLastKnownLocation();
    setDefaultAreaFromLocation();
    updateFilterChips();
    updateWorkflowUI();
    updateLocateMeOffset();
    setTimeout(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    }, 320);
  } else {
    // Map already initialized — just ensure classes are correct
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    setTimeout(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    }, 320);
  }
  // Removed automatic location centering to prevent GPS notifications
  // setTimeout(() => centerOnMyLocationInternal(), 500);
}

let mushroomMapPending = false;
function activateMushroomMap() {
  if (!isMushroomModule()) return;
  if (!mapInitialized) {
    mushroomMapPending = false;
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    initializeMap();
    restoreLastKnownLocation();
    setDefaultAreaFromLocation();
    updateFilterChips();
    updateWorkflowUI();
    updateLocateMeOffset();
    setTimeout(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    }, 320);
  } else {
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    setTimeout(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    }, 320);
  }
  // Removed automatic location centering to prevent GPS notifications
  // setTimeout(() => centerOnMyLocationInternal(), 500);
}
window.activateMushroomMap = activateMushroomMap;

let _turkeyMapPendingRef; // forward ref — actual var at top
function activateTurkeyMap() {
  if (!isTurkeyModule()) return;
  if (!mapInitialized) {
    turkeyMapPending = false;
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    initializeMap();
    restoreLastKnownLocation();
    setDefaultAreaFromLocation();
    updateFilterChips();
    updateWorkflowUI();
    updateLocateMeOffset();
    setTimeout(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    }, 320);
  } else {
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    setTimeout(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    }, 320);
  }
  // Removed automatic location centering to prevent GPS notifications
  // setTimeout(() => centerOnMyLocationInternal(), 500);
}
window.activateTurkeyMap = activateTurkeyMap;

// Initialize map
function initializeMap() {
  if (mapInitialized) return;
  if (!window.L || !window.L.map) {
    showNotice('Map library failed to load. Check internet or CDN access.', 'error', 6000);
    return;
  }
  mapInitialized = true;
  map = L.map('map', {
    center: [38.26, -90.55],
    zoom: 13,
    maxZoom: 20,
    zoomControl: false,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 90,
    // ── One-finger panning ──
    dragging: true,
    inertia: true,
    inertiaDeceleration: 800,     // very long buttery coast (stock 3000)
    inertiaMaxSpeed: Infinity,    // no speed cap on fling
    inertiaTimeMax: 500,          // ms window to catch fling gesture (stock 200)
    easeLinearity: 0.4,           // momentum carried into coast (stock 0.2)
    // ── Touch ──
    tapTolerance: 15,
    bounceAtZoomLimits: false,
    touchZoom: true,
    tap: false,                   // no 200ms tap delay; native click is fine
    // ── Animation ──
    fadeAnimation: true,
    zoomAnimation: true,
    markerZoomAnimation: true
  });

  const mapEl = map.getContainer();
  if (mapEl) mapEl.classList.add('ht-map-canvas');

  // ── Rotation-corrected drag ──────────────────────────────────────────
  // #map has CSS transform:rotate(N deg).  Leaflet computes drag offsets
  // in screen space, but the mapPane translate is in the rotated coord
  // system.  We patch _updatePosition (runs BEFORE DOM update) to rotate
  // the drag delta so the map tracks the finger 1:1.
  if (map.dragging && map.dragging._draggable) {
    const _d = map.dragging._draggable;
    const _origUpdatePos = _d._updatePosition;
    _d._updatePosition = function () {
      if (Math.abs(mapBearingDeg) > 0.5 && this._newPos && this._startPos) {
        const rad = mapBearingDeg * Math.PI / 180;
        const c = Math.cos(rad), s = Math.sin(rad);
        const dx = this._newPos.x - this._startPos.x;
        const dy = this._newPos.y - this._startPos.y;
        this._newPos = L.point(
          this._startPos.x + (dx * c + dy * s),
          this._startPos.y + (-dx * s + dy * c)
        );
      }
      _origUpdatePos.call(this);
    };
  }

  // ── Rotation-corrected pinch zoom ────────────────────────────────────
  // Leaflet's TouchZoom computes the pinch center in screen coordinates
  // and converts it to a container point.  With CSS rotation on #map,
  // that conversion is wrong — the zoom anchors to the wrong spot.
  // Fix: patch _onMove to rotate the screen-space center into #map's
  // local coordinate space before Leaflet processes it.
  if (map.touchZoom && map.touchZoom._onMove) {
    const _origTZMove = map.touchZoom._onMove;
    map.touchZoom._onMove = function (e) {
      if (Math.abs(mapBearingDeg) > 0.5 && e.touches && e.touches.length === 2) {
        // Get the midpoint in screen space
        const t1 = e.touches[0], t2 = e.touches[1];
        const mx = (t1.clientX + t2.clientX) / 2;
        const my = (t1.clientY + t2.clientY) / 2;
        // Rotate it into #map's local coordinate space around the container center
        const rect = map.getContainer().getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rad = -mapBearingDeg * Math.PI / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const dx = mx - cx, dy = my - cy;
        const rmx = cx + dx * cos - dy * sin;
        const rmy = cy + dx * sin + dy * cos;
        // Store the corrected center so Leaflet's _centerPoint uses it
        if (this._centerPoint) {
          this._centerPoint = map.containerPointToLayerPoint(
            map.mouseEventToContainerPoint({ clientX: rmx, clientY: rmy })
          );
        }
      }
      _origTZMove.call(this, e);
    };
  }

  // GPU-promote the map pane for smoother touch drag/zoom animation
  const mapPane = map.getPane('mapPane');
  if (mapPane) {
    mapPane.style.willChange = 'transform';
  }

  // The #map element is CSS-oversized to 142% for rotation coverage.
  // Tell Leaflet about the actual container size so it loads enough tiles.
  requestAnimationFrame(() => {
    if (map) map.invalidateSize({ animate: false });
  });

  if (mapEl) {
    const markInteraction = () => {
      lastMapInteractionAt = Date.now();
    };
    mapEl.addEventListener('pointerdown', markInteraction, { passive: true });
    mapEl.addEventListener('touchstart', markInteraction, { passive: true });
    mapEl.addEventListener('wheel', markInteraction, { passive: true });
  }
  ensureCompassControl();

  const toolbarEl = document.getElementById('toolbar');
  if (toolbarEl && typeof L !== 'undefined' && L.DomEvent) {
    L.DomEvent.disableClickPropagation(toolbarEl);
    L.DomEvent.disableScrollPropagation(toolbarEl);
    ['click', 'touchstart', 'touchend', 'pointerdown'].forEach((eventName) => {
      toolbarEl.addEventListener(eventName, (event) => {
        lastToolbarToggleAt = Date.now();
        event.stopPropagation();
      }, { passive: eventName.startsWith('touch') });
    });
  }

  bindToolbarToggleButtons();

  // Pane for selected MDC conservation area highlight (keep it above tile overlays)
  if (!map.getPane('mdcSelectionPane')) {
    map.createPane('mdcSelectionPane');
    map.getPane('mdcSelectionPane').style.zIndex = 480;
  }
  if (!map.getPane('mdcLabelPane')) {
    map.createPane('mdcLabelPane');
    map.getPane('mdcLabelPane').style.zIndex = 640;
  }

  if (!map.getPane('hybridRoadsPane')) {
    map.createPane('hybridRoadsPane');
    map.getPane('hybridRoadsPane').style.zIndex = 360;
    map.getPane('hybridRoadsPane').style.pointerEvents = 'none';
  }
  if (!map.getPane('hybridLabelsPane')) {
    map.createPane('hybridLabelsPane');
    map.getPane('hybridLabelsPane').style.zIndex = 370;
    map.getPane('hybridLabelsPane').style.pointerEvents = 'none';
  }

  // Tile error popups suppressed — silent fail for tile loading issues
  const tileErrorNotice = (key, message) => () => {};

  // Tile loading strategy:
  // - updateWhenIdle:false  → load tiles DURING panning (no grey dead zones)
  // - updateWhenZooming:true → load tiles DURING pinch zoom
  // - updateInterval:100     → queue new tiles every 100ms during movement (stock 200)
  // - keepBuffer:4           → enough buffer rows for 142% oversized map + fast panning
  // - maxZoom:22             → allows deep zoom; maxNativeZoom sets CSS-upscale threshold
  const _tileOpts = { keepBuffer: 4, updateWhenZooming: true, updateWhenIdle: false, updateInterval: 100, maxZoom: 20 };

  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxNativeZoom: 19,        // Esri serves real tiles to z19; CSS-upscale beyond
    ..._tileOpts
  });
  satellite.on('tileerror', tileErrorNotice('satellite-tiles', 'Base map tiles failed to load. Check internet access.'));
  const satelliteHybrid = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxNativeZoom: 19,        // Esri serves real tiles to z19; CSS-upscale beyond
    ..._tileOpts
  });
  satelliteHybrid.on('tileerror', tileErrorNotice('hybrid-tiles', 'Hybrid base tiles failed to load. Check internet access.'));
  const hybridRoads = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxNativeZoom: 19,
    pane: 'hybridRoadsPane',
    ..._tileOpts
  });
  hybridRoads.on('tileerror', tileErrorNotice('hybrid-roads-tiles', 'Hybrid road tiles failed to load.'));
  const hybridHydro = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Hydro_Reference/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxNativeZoom: 19,
    pane: 'hybridLabelsPane',
    ..._tileOpts
  });
  hybridHydro.on('tileerror', tileErrorNotice('hybrid-hydro-tiles', 'Hybrid hydro tiles failed to load.'));
  const hybridLabels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxNativeZoom: 19,
    pane: 'hybridLabelsPane',
    ..._tileOpts
  });
  hybridLabels.on('tileerror', tileErrorNotice('hybrid-label-tiles', 'Hybrid label tiles failed to load.'));
  const hybrid = L.layerGroup([satelliteHybrid, hybridRoads, hybridHydro, hybridLabels]);
  const latestImageryLabel = 'Latest Imagery';
  const latestImageryUrl = String(window.LATEST_IMAGERY_TILE_URL || '').trim();
  const latestImageryNoteText = String(window.LATEST_IMAGERY_NOTE || '').trim();
  const latestImagery = latestImageryUrl
    ? L.tileLayer(latestImageryUrl, { attribution: '&copy; Esri', maxNativeZoom: 19, ..._tileOpts })
    : null;
  const topo = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; USGS The National Map',
    maxNativeZoom: 16,        // USGS Topo serves real tiles to z16
    ..._tileOpts
  });
  topo.on('tileerror', tileErrorNotice('topo-tiles', 'USGS topo tiles failed to load.'));
  if (latestImagery) {
    latestImagery.on('tileerror', tileErrorNotice('latest-imagery-tiles', 'Latest imagery tiles failed to load.'));
  }

  const lidarImageUrl = (window.LIDAR_IMAGE_SERVICE_URL || '').trim();
  if (lidarImageUrl && window.L && window.L.esri && window.L.esri.imageMapLayer) {
    lidarHillshadeLayer = window.L.esri.imageMapLayer({
      url: lidarImageUrl,
      opacity: 0.7,
      maxZoom: 20,
      renderingRule: { rasterFunction: 'Hillshade Multidirectional' }
    });
  } else {
    const lidarUrl = (window.LIDAR_TILE_URL || '').trim();
    if (lidarUrl) {
      lidarHillshadeLayer = L.tileLayer(lidarUrl, { opacity: 0.55, maxNativeZoom: 16, zIndex: 350, ..._tileOpts });
    }
  }

  hybrid.addTo(map);

  const overlays = {};

  // Public land overlay is available by default (configurable in config.js)
  try {
    const tileUrl = (window.PUBLIC_LAND_TILE_URL || DEFAULT_PUBLIC_LAND_TILE_URL || '').trim();
    if (tileUrl) {
      publicLandLayer = L.tileLayer(tileUrl, { opacity: 0.7, maxNativeZoom: 19, zIndex: 450, ..._tileOpts });
      overlays['Public Land'] = publicLandLayer;
    }
  } catch {
    // Ignore overlay setup failures.
  }

  // Private parcels overlay only shows if configured
  try {
    const privateUrl = (window.PRIVATE_PARCELS_TILE_URL || '').trim();
    if (privateUrl) {
      privateParcelsLayer = L.tileLayer(privateUrl, { opacity: 0.65, maxNativeZoom: 19, zIndex: 460, ..._tileOpts });
      overlays['Private Parcels'] = privateParcelsLayer;
    }
  } catch {
    // Ignore overlay setup failures.
  }

  const baseLayers = {
    'HD Satellite': hybrid,
    'USGS Topo': topo
  };

  if (latestImagery) {
    baseLayers[latestImageryLabel] = latestImagery;
  }

  if (lidarHillshadeLayer) {
    baseLayers['HD LiDAR'] = lidarHillshadeLayer;
  }

  baseLayersControl = L.control.layers(baseLayers, overlays, { position: 'topleft', collapsed: true });
  baseLayersControl.addTo(map);

  const layersControlEl = typeof baseLayersControl.getContainer === 'function'
    ? baseLayersControl.getContainer()
    : null;

  if (layersControlEl) {
    // Place pill stack on .ht-map-container (the static parent),
    // NOT inside #map (which rotates via CSS transform).
    const staticHost = document.querySelector('.ht-map-container') || map.getContainer().parentElement || map.getContainer();
    let stack = staticHost.querySelector('.ht-map-layer-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'ht-map-layer-stack';
      staticHost.appendChild(stack);
    }
    let windPill = stack.querySelector('.ht-map-wind-pill');
    // Wind pill removed — keeping the lookup so compassWindValue doesn't break
    compassWindValue = windPill ? windPill.querySelector('.ht-map-wind-value') : null;
    stack.appendChild(layersControlEl);
  }
  const syncLayersOpenState = () => {
    if (!layersControlEl || !document.body) return;
    const isOpen = layersControlEl.classList.contains('leaflet-control-layers-expanded');
    document.body.classList.toggle('ht-layers-open', isOpen);
  };
  if (layersControlEl) {
    syncLayersOpenState();
    layersControlEl.addEventListener('click', () => setTimeout(syncLayersOpenState, 0));
    layersControlEl.addEventListener('touchstart', () => setTimeout(syncLayersOpenState, 0), { passive: true });
    const observer = new MutationObserver(syncLayersOpenState);
    observer.observe(layersControlEl, { attributes: true, attributeFilter: ['class'] });
  }

  const imageryNote = document.createElement('div');
  imageryNote.className = 'ht-imagery-note';
  imageryNote.textContent = latestImageryNoteText || 'Latest imagery. Capture dates vary by location.';
  imageryNote.style.display = 'none';
  map.getContainer().appendChild(imageryNote);

  const updateImageryNote = (isActive) => {
    if (!latestImagery) return;
    imageryNote.style.display = isActive ? 'block' : 'none';
  };

  // Keep app toggles in sync when layers are toggled from Leaflet control
  const syncLayerStateFromMap = () => {
    publicLandEnabled = Boolean(publicLandLayer && map.hasLayer(publicLandLayer));
    privateParcelsEnabled = Boolean(privateParcelsLayer && map.hasLayer(privateParcelsLayer));

    if (publicLandEnabled && !mdcLandEnabled) {
      setMdcLandEnabled(true);
    }

    const publicToggle = document.getElementById('publicLandToggle');
    if (publicToggle) publicToggle.checked = publicLandEnabled;
    const privateToggle = document.getElementById('privateParcelsToggle');
    if (privateToggle) privateToggle.checked = privateParcelsEnabled;

    updateFilterChips();
    updateMapToggleButtons();
  };

  map.on('overlayadd', syncLayerStateFromMap);
  map.on('overlayremove', syncLayerStateFromMap);
  map.on('baselayerchange', (event) => {
    updateImageryNote(Boolean(event && event.name === latestImageryLabel));
  });

  if (publicLandLayer) {
    map.addLayer(publicLandLayer);
    publicLandEnabled = true;
    const publicToggle = document.getElementById('publicLandToggle');
    if (publicToggle) publicToggle.checked = true;
    if (!mdcLandEnabled) setMdcLandEnabled(true);
    updateFilterChips();
    updateMapToggleButtons();
  }

  if (document.body && document.body.classList.contains('module-fly')) {
    setFlyWaterLayerEnabled(true, { explore: false }); // show ALL trout waters, no radius filter
  }

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
    if (activeDrawMode === 'polygon' && layer instanceof L.Polygon) {
      if (drawnItems && !drawnItems.hasLayer(layer)) {
        drawnItems.addLayer(layer);
      }
      pendingPolygonLayer = layer;
      showDrawHelper('polygon', 'Review the outline, then tap Lock In to continue.');
      clearPolygonGuide();
      return;
    }
    setSelectedArea(layer, layer instanceof L.Rectangle ? 'boundary' : 'polygon');
    clearPolygonGuide();
    
  });

  map.on('click', handleMapClick);
  map.on('click', (event) => {
    if (mdcInfoPanel && mdcInfoPanel.classList.contains('open')) {
      dockMdcInfoPanel();
    }
    const target = event && event.originalEvent ? event.originalEvent.target : null;
    const toolbarEl = document.getElementById('toolbar');
    const path = event && event.originalEvent && typeof event.originalEvent.composedPath === 'function'
      ? event.originalEvent.composedPath()
      : null;
    if (toolbarEl && ((target && toolbarEl.contains(target)) || (path && path.includes(toolbarEl)))) return;
    if (Date.now() - lastToolbarToggleAt < 1000) return;
    if (toolbarOpen) {
      window.toggleToolbar();
      updateTrayToggleButton();
    }
  });

  map.on('draw:drawstart', function() {
    showQuickHint('Tap points, then tap the first point to finish.', 1800);
    clearPolygonGuide();
    lastDrawVertexAt = 0;
    lastDrawVertexLatLng = null;
  });

  map.on('draw:drawstop', function() {
    const instructionDiv = document.getElementById('drawing-instructions');
    if (instructionDiv) instructionDiv.remove();
    clearPolygonGuide();
  });

  map.on('draw:drawvertex', function(event) {
    if (!event || !event.layers || typeof event.layers.getLayers !== 'function') return;
    const markers = event.layers.getLayers();
    if (!markers.length) return;
    const last = markers[markers.length - 1];
    if (last && typeof last.getLatLng === 'function') {
      const now = Date.now();
      const ll = last.getLatLng();
      const tooFast = lastDrawVertexAt && (now - lastDrawVertexAt) < 350;
      const tooClose = lastDrawVertexLatLng && ll && L.latLng(ll).distanceTo(lastDrawVertexLatLng) < 40;
      if ((tooFast || tooClose) && typeof event.layers.removeLayer === 'function') {
        event.layers.removeLayer(last);
        return;
      }
      lastDrawVertexAt = now;
      lastDrawVertexLatLng = ll;
    }
    const first = markers[0];
    if (!first || typeof first.getLatLng !== 'function') return;
    showPolygonGuide(first.getLatLng());
  });

  map.on('moveend', () => {
    if (!shedAllowedEnabled) return;
    if (shedRefreshTimer) clearTimeout(shedRefreshTimer);
    shedRefreshTimer = setTimeout(() => {
      enableShedAllowedLayer();
    }, 400);
  });
  map.on('dragstart zoomstart', () => {
    lastMapInteractionAt = Date.now();
    if (mapAutoCentering) return;
    followUserLocation = false;
    updateLocateBtnState();
  });
  map.on('moveend zoomend', () => {
    if (mapAutoCentering) {
      mapAutoCentering = false;
    }
  });
  map.on('moveend zoomend', () => {
    if (!mdcLandEnabled) return;
    scheduleMdcLabelRefresh();
  });

  map.on('moveend', () => {
    if (!mdcLandEnabled) return;
    if (mdcLandRefreshTimer) clearTimeout(mdcLandRefreshTimer);
    mdcLandRefreshTimer = setTimeout(() => {
      enableMdcLandLayer();
    }, 450);
  });

  setFieldCommandStep(1);
}

function openFieldCommandTray() {
  const toolbar = document.getElementById('toolbar');
  const content = document.getElementById('toolbarContent');
  const icons = document.querySelectorAll('.ht-toggle-icon');
  if (!toolbar) return;
  toolbarOpen = true;
  toolbar.classList.remove('collapsed');
  document.body.classList.remove('ht-toolbar-collapsed');
  icons.forEach((icon) => {
    icon.textContent = 'v';
  });
  if (content) {
    content.scrollTop = 0;
  }
  updateTrayMiniLabels();
  updateTrayToggleButton();
}

function setFieldCommandStep(step) {
  fieldCommandStep = step;
  const definePanel = document.getElementById('defineAreaPanel');
  const routePanel = document.getElementById('planRoutePanel');
  if (definePanel && definePanel.open !== undefined) definePanel.open = step === 1;
  if (routePanel && routePanel.open !== undefined) routePanel.open = step === 2 || step === 3;
  document.body.classList.remove('ht-field-step-1', 'ht-field-step-2', 'ht-field-step-3');
  document.body.classList.add(`ht-field-step-${step}`);
  // Only open the tray if user has already interacted (not on first load)
  if (toolbarOpen) openFieldCommandTray();
}

function focusPlanRoutePanel() {
  const panel = document.getElementById('planRoutePanel');
  if (!panel) return;
  try {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {
    panel.scrollIntoView();
  }
}

function openPlanRouteTray() {
  document.body.classList.remove('ht-hunt-active');
  fieldCommandFlowActive = true;
  setFieldCommandStep(2);
  const panel = document.getElementById('planRoutePanel');
  const content = document.getElementById('toolbarContent');
  if (panel && content) {
    content.scrollTop = Math.max(0, panel.offsetTop - 12);
  }
  focusPlanRoutePanel();
  setTimeout(() => {
    if (fieldCommandStep !== 2) {
      setFieldCommandStep(2);
      focusPlanRoutePanel();
    }
  }, 180);
}

function getMdcAcreage(attrs) {
  if (!attrs) return '';
  const value = attrs.Acreage ?? attrs.Acres_GIS;
  return formatAcreage(value);
}
function setStrategyOpen(isOpen) {
  document.body.classList.toggle('ht-strategy-open', Boolean(isOpen));
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) return;
  if (isOpen) {
    toolbar.classList.add('collapsed');
    toolbarOpen = false;
    const icons = document.querySelectorAll('.ht-toggle-icon');
    icons.forEach((icon) => {
      icon.textContent = '';
    });
  }

  updateTrayMiniLabels();

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
  const btns = [
    document.getElementById('panelHandleBtn')
  ].filter(Boolean);
  if (!btns.length) return;

  const strategyPanel = document.getElementById('strategy-panel');
  if (strategyPanel) {
    const isVisible = strategyPanel.style.display !== 'none';
    const label = isVisible ? 'CLOSE PANEL' : 'OPEN PANEL';
    btns.forEach((btn) => {
      btn.textContent = label;
    });
    return;
  }

  const toolbar = document.getElementById('toolbar');
  const isCollapsed = toolbar ? toolbar.classList.contains('collapsed') : false;
  const label = isCollapsed ? 'OPEN PANEL' : 'CLOSE PANEL';
  btns.forEach((btn) => {
    btn.textContent = label;
  });
}

function updateTrayMiniLabels() {
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) return;
  const isCollapsed = toolbar.classList.contains('collapsed');
  const targets = toolbar.querySelectorAll('[data-short-label][data-full-label]');
  targets.forEach((el) => {
    const fullLabel = el.getAttribute('data-full-label') || '';
    const shortLabel = el.getAttribute('data-short-label') || fullLabel;
    el.textContent = isCollapsed ? shortLabel : fullLabel;
  });
}

function setMobileCompactMode(isCompact) {
  document.body.classList.toggle('ht-mobile-compact', Boolean(isCompact));
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

function ensureMdcLandLabelLayer() {
  if (!mdcLandLabelLayer) {
    mdcLandLabelLayer = L.layerGroup();
    mdcLandLabelLayer.addTo(map);
  }
  return mdcLandLabelLayer;
}

function clearMdcLandLabels() {
  if (mdcLandLabelLayer) {
    mdcLandLabelLayer.clearLayers();
  }
}

function setMdcLandLabelsSuppressed(nextState) {
  mdcLandLabelsSuppressed = Boolean(nextState);
  if (mdcLandLabelsSuppressed) {
    clearMdcLandLabels();
  } else {
    scheduleMdcLabelRefresh();
  }
}

function scheduleMdcLabelRefresh() {
  clearRegisteredTimer(mdcLandLabelRefreshTimer);
  mdcLandLabelRefreshTimer = registerTimer(setTimeout(() => {
    updateMdcLandLabels();
  }, 120));
}

function openMdcAreaFromLabel(feature) {
  if (!feature) return;
  highlightMdcSelectedArea(feature);
  showMdcAreaSummary(feature);
}


// ===================================================================
//   MDC Land Labels & Field Command
// ===================================================================
function updateMdcLandLabels() {
  if (mdcLandLabelsSuppressed || !mdcLandEnabled || !map || !mdcLandFeatures.length) {
    clearMdcLandLabels();
    return;
  }

  const zoom = map.getZoom();
  if (zoom < MDC_LABEL_MIN_ZOOM) {
    clearMdcLandLabels();
    return;
  }

  const zoomDelta = Math.max(0, zoom - MDC_LABEL_MIN_ZOOM);
  const labelScale = Math.min(1.18, 0.86 + zoomDelta * 0.08);
  const labelAlpha = Math.min(1, 0.55 + zoomDelta * 0.12);
  const showCta = zoom >= (MDC_LABEL_MIN_ZOOM + 2);

  const bounds = map.getBounds();
  const layer = ensureMdcLandLabelLayer();
  layer.clearLayers();

  let count = 0;
  for (const feature of mdcLandFeatures) {
    if (!feature || !feature.geometry) continue;
    const areaBounds = getBoundsFromArcgisGeometry(feature.geometry);
    if (!areaBounds || !bounds.intersects(areaBounds)) continue;

    const attrs = feature.attributes || {};
    const name = attrs.OFF_Name || attrs.Area_Name || 'MDC Area';
    const center = areaBounds.getCenter();
    const html = `
      <div class="ht-mdc-map-label" style="--mdc-label-scale:${labelScale.toFixed(2)};--mdc-label-alpha:${labelAlpha.toFixed(2)};">
        <div class="ht-mdc-map-name">${escapeHtml(name)}</div>
        ${showCta ? '<div class="ht-mdc-map-cta">Click for area details</div>' : ''}
      </div>
    `;
    const marker = L.marker(center, {
      pane: 'mdcLabelPane',
      interactive: true,
      icon: L.divIcon({ className: 'ht-mdc-map-label-wrap', html })
    });
    marker.on('click', (event) => {
      if (event && event.originalEvent) {
        L.DomEvent.stopPropagation(event.originalEvent);
      }
      openMdcAreaFromLabel(feature);
    });
    layer.addLayer(marker);

    count += 1;
    if (count >= MDC_LABEL_MAX) break;
  }
}


// ===================================================================
//   Map Pin Icon Factories
// ===================================================================
function getBrandedPinIcon(labelText) {
  const safe = String(labelText ?? '').slice(0, 3);
  const logo = getHuntechLogoMarkup('ht-pin-logo');
  return L.divIcon({
    className: 'ht-pin-wrapper',
    html: `<div class="ht-pin"><div class="ht-pin-inner">${logo}</div>${safe ? `<div class=\"ht-pin-rank\">${safe}</div>` : ''}</div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 38]
  });
}

function getHotspotPinIcon(labelText, hotspot) {
  const safe = String(labelText ?? '').slice(0, 3);
  // Turkey module: use custom habitat-themed SVG pin icons
  if (isTurkeyModule() && hotspot) {
    return getTurkeyHotspotPinIcon(safe, hotspot);
  }
  // Mushroom module: use morel-shaped SVG pin icons
  if (isMushroomModule() && hotspot) {
    return getMushroomHotspotPinIcon(safe, hotspot);
  }
  const logo = getHuntechLogoMarkup('ht-pin-logo');
  return L.divIcon({
    className: 'ht-pin-wrapper',
    html: `<div class="ht-pin"><div class="ht-pin-inner">${logo}</div>${safe ? `<div class=\"ht-pin-rank\">${safe}</div>` : ''}</div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 38]
  });
}

// Turkey-specific hotspot pin icons — each habitat type gets a unique SVG
const TURKEY_HOTSPOT_ICONS = {
  roostZone:       { svg: '<svg viewBox="0 0 24 24"><path d="M12 3c-1 0-4 2.5-4 6.5 0 2.5 1 4 2.5 5V20h3v-5.5c1.5-1 2.5-2.5 2.5-5C16 5.5 13 3 12 3z" fill="{c}" opacity=".85"/><circle cx="14" cy="7" r="2" fill="{c}"/><line x1="12" y1="20" x2="12" y2="23" stroke="{c}" stroke-width="1.5"/></svg>', color: '#b8860b', label: 'RT' },
  strutZone:       { svg: '<svg viewBox="0 0 24 24"><path d="M12 20c0 0-1.5-2-1.5-4s.8-2.5 1.5-2.5 1.5.5 1.5 2.5-1.5 4-1.5 4z" fill="{c}"/><path d="M12 14 L5 4 L8 7.5 L6.5 3 L10 7.5 L10 2 L12 7.5 L14 2 L14 7.5 L17.5 3 L16 7.5 L19 4 Z" fill="{c}" opacity=".85"/></svg>', color: '#d4a017', label: 'SZ' },
  travelCorridor:  { svg: '<svg viewBox="0 0 24 24"><path d="M4 20L8 16L12 18L16 14L20 16" stroke="{c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12l0-5M8 12l-2-4M8 12l2-4" stroke="{c}" stroke-width="1.2" stroke-linecap="round" opacity=".6"/><path d="M18 10l0-5M18 10l-2-4M18 10l2-4" stroke="{c}" stroke-width="1.2" stroke-linecap="round" opacity=".6"/></svg>', color: '#c89b3c', label: 'TC' },
  feedingArea:     { svg: '<svg viewBox="0 0 24 24"><path d="M6 16l4-2 2 1.5 3-1.5 3 2" stroke="{c}" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="9" cy="12" r="1" fill="{c}"/><circle cx="14" cy="11" r="1" fill="{c}" opacity=".7"/><circle cx="16" cy="13" r="1" fill="{c}"/><path d="M4 19h16" stroke="{c}" stroke-width="1" opacity=".4"/></svg>', color: '#8b7355', label: 'FD' },
  loafingArea:     { svg: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="15" rx="8" ry="4" fill="none" stroke="{c}" stroke-width="1.5"/><path d="M6 15c0-2.5 2.5-5 6-5s6 2.5 6 5" fill="{c}" opacity=".15"/><circle cx="10" cy="14" r=".7" fill="{c}" opacity=".4"/><circle cx="14" cy="14.5" r=".7" fill="{c}" opacity=".4"/></svg>', color: '#7a6e5a', label: 'LA' },
  waterSource:     { svg: '<svg viewBox="0 0 24 24"><path d="M4 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="{c}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M4 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="{c}" stroke-width="1.2" fill="none" opacity=".5" stroke-linecap="round"/><path d="M12 4l-2 6h4l-2-6z" fill="{c}" opacity=".7"/></svg>', color: '#5a8a7a', label: 'WS' }
};

function getTurkeyHotspotPinIcon(rankText, hotspot) {
  const habitatType = hotspot?.habitat || hotspot?.education?.habitatType || hotspot?.type || '';
  const config = TURKEY_HOTSPOT_ICONS[habitatType] || { svg: '', color: '#c8a96e', label: '' };
  const svgHtml = config.svg.replace(/\{c\}/g, config.color);
  return L.divIcon({
    className: 'ht-turkey-hotspot-pin-wrapper',
    html: `<div class="ht-turkey-hotspot-pin" style="border-color:${config.color};box-shadow:0 2px 8px rgba(0,0,0,0.6),0 0 14px ${config.color}50;">` +
          `<div class="ht-turkey-hotspot-svg">${svgHtml}</div>` +
          `</div>` +
          `<div class="ht-turkey-hotspot-rank" style="background:${config.color};">${rankText}</div>`,
    iconSize: [40, 50],
    iconAnchor: [20, 46],
    popupAnchor: [0, -42]
  });
}

// ===================================================================
//   Mushroom Module — Morel-Shaped Hotspot Pin Icons
// ===================================================================
// Morel SVG: a honeycomb-textured conical cap on a pale stem
const MOREL_PIN_SVG = `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <!-- stem -->
  <path d="M13 28 Q12.5 36 13.5 42 L18.5 42 Q19.5 36 19 28 Z" fill="#f5e6c8" stroke="#1a1a1a" stroke-width=".8" opacity=".95"/>
  <!-- cap -->
  <path d="M16 3 Q6 10 7 22 Q8 28 16 29 Q24 28 25 22 Q26 10 16 3Z" fill="{cap}" stroke="{rim}" stroke-width="1.1"/>
  <!-- honeycomb ridges -->
  <ellipse cx="12" cy="13" rx="2.8" ry="2" fill="none" stroke="{ridge}" stroke-width=".7" opacity=".75"/>
  <ellipse cx="18" cy="11" rx="2.5" ry="1.8" fill="none" stroke="{ridge}" stroke-width=".7" opacity=".75"/>
  <ellipse cx="15" cy="17" rx="2.8" ry="2.2" fill="none" stroke="{ridge}" stroke-width=".7" opacity=".7"/>
  <ellipse cx="20" cy="16" rx="2.2" ry="1.6" fill="none" stroke="{ridge}" stroke-width=".7" opacity=".65"/>
  <ellipse cx="11" cy="20" rx="2.4" ry="1.8" fill="none" stroke="{ridge}" stroke-width=".7" opacity=".6"/>
  <ellipse cx="17" cy="22" rx="2.6" ry="1.8" fill="none" stroke="{ridge}" stroke-width=".7" opacity=".55"/>
  <ellipse cx="14" cy="8" rx="2" ry="1.5" fill="none" stroke="{ridge}" stroke-width=".65" opacity=".65"/>
  <ellipse cx="21" cy="21" rx="1.8" ry="1.4" fill="none" stroke="{ridge}" stroke-width=".65" opacity=".5"/>
</svg>`;

const MUSHROOM_HOTSPOT_ICONS = {
  bedding:    { cap: '#FFD700', rim: '#1a1a1a', ridge: '#222', label: 'SL', tooltip: 'South Slope' },
  transition: { cap: '#FFD700', rim: '#1a1a1a', ridge: '#333', label: 'EL', tooltip: 'Edge Line' },
  feeding:    { cap: '#FFC107', rim: '#111',    ridge: '#222', label: 'CB', tooltip: 'Creek Bottom' },
  water:      { cap: '#FFCA28', rim: '#1a1a1a', ridge: '#2a2a2a', label: 'SP', tooltip: 'Seep/Spring' },
  open:       { cap: '#FFD700', rim: '#0d0d0d', ridge: '#1a1a1a', label: 'OR', tooltip: 'Old Orchard' }
};

function getMushroomHotspotPinIcon(rankText, hotspot) {
  const habitatType = hotspot?.habitat || hotspot?.education?.habitatType || hotspot?.type || '';
  const config = MUSHROOM_HOTSPOT_ICONS[habitatType] || { cap: '#FFD700', rim: '#1a1a1a', ridge: '#222', label: '', tooltip: 'Morel Zone' };
  const svgHtml = MOREL_PIN_SVG
    .replace(/\{cap\}/g, config.cap)
    .replace(/\{rim\}/g, config.rim)
    .replace(/\{ridge\}/g, config.ridge);
  return L.divIcon({
    className: 'ht-morel-pin-wrapper',
    html: `<div class="ht-morel-pin" title="${config.tooltip}">` +
          `<div class="ht-morel-pin-svg">${svgHtml}</div>` +
          `</div>` +
          `<div class="ht-morel-pin-rank">${rankText}</div>`,
    iconSize: [40, 56],
    iconAnchor: [20, 52],
    popupAnchor: [0, -48]
  });
}

// Mushroom micro-pin icons — small mushroom-themed markers for micro features
const MUSHROOM_MICRO_ICONS = {
  moisture_pocket: { emoji: '💧', color: '#5aadcd' },
  dead_elm:        { emoji: '🪵', color: '#9e7a44' },
  creek_bottom:    { emoji: '🌊', color: '#4a8fa0' },
  north_slope:     { emoji: '🏔', color: '#6a8e6a' },
  old_orchard:     { emoji: '🍎', color: '#c45a5a' },
  burn_area:       { emoji: '🔥', color: '#d4642a' },
  tulip_poplar:    { emoji: '🌳', color: '#5a9e5a' }
};

function getMushroomMicroPinIcon(feature) {
  const safeType = String(feature?.type || 'micro').toLowerCase();
  const config = MUSHROOM_MICRO_ICONS[safeType] || { emoji: '🍄', color: '#c8942a' };
  return L.divIcon({
    html: `<div class="ht-mushroom-micro-pin" style="border-color:${config.color};box-shadow:0 0 8px ${config.color}40;">` +
          `<span class="ht-mushroom-micro-emoji">${config.emoji}</span>` +
          `</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

function getDeerSignPinIcon(signType) {
  const safeType = String(signType || 'sign').toLowerCase();
  const cssType = safeType.replace(/\s+/g, '-').replace(/_/g, '-');
  const labels = {
    rubs: 'RB',
    rub: 'RB',
    scrapes: 'SC',
    scrape: 'SC',
    tracks: 'TK',
    track: 'TK',
    trail: 'TR',
    trails: 'TR',
    bedding: 'BD',
    feed: 'FD',
    feeding: 'FD',
    water: 'WT',
    crossing: 'CR',
    funnel: 'FN',
    camera: 'CM',
    stand: 'SD',
    sighting: 'SI',
    sign: 'SG'
  };
  const label = labels[safeType] || 'DS';
  return L.divIcon({
    className: 'ht-deer-pin-wrapper',
    html: `<div class="ht-deer-pin ht-deer-pin-${cssType}"><div class="ht-deer-pin-label">${label}</div></div>`,
    iconSize: [24, 30],
    iconAnchor: [12, 26]
  });
}

function createBrandedHotspotMarker(hotspot) {
  const rank = hotspot?.rank ?? hotspot?.priority ?? 1;
  const marker = L.marker(hotspot.coords, {
    icon: getHotspotPinIcon(String(rank), hotspot)
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


// ===================================================================
//   Hotspot Avoidance System
// ===================================================================
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

function getRoadAvoidCacheKey(latlng) {
  const ll = L.latLng(latlng);
  return `${ll.lat.toFixed(5)},${ll.lng.toFixed(5)}`;
}

function getRoadAvoidSamples(latlng) {
  const center = L.latLng(latlng);
  const sampleOffset = Math.max(HOTSPOT_ROAD_AVOID_SAMPLE_M, HOTSPOT_BUILDING_AVOID_SAMPLE_M);
  if (!sampleOffset || !Number.isFinite(sampleOffset) || sampleOffset <= 0) return [center];
  return [
    center,
    offsetLatLngMeters(center, sampleOffset, 0),
    offsetLatLngMeters(center, 0, sampleOffset)
  ];
}

function getResidentialAvoidCacheKey(latlng) {
  return `${getRoadAvoidCacheKey(latlng)}:res`;
}

function getResidentialBufferSamples(latlng, bufferMeters, sampleCount) {
  const center = L.latLng(latlng);
  const radius = Math.max(40, Number(bufferMeters) || HOTSPOT_RESIDENTIAL_BUFFER_M || 0);
  const count = Math.max(4, Number(sampleCount) || HOTSPOT_RESIDENTIAL_BUFFER_SAMPLES || 6);
  if (!radius || !Number.isFinite(radius)) return [];
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;
    points.push(offsetLatLngMeters(center, dx, dy));
  }
  return points;
}

async function isLikelyResidentialBufferCandidate(latlng) {
  if (!HOTSPOT_RESIDENTIAL_AVOID_ENABLED) return false;
  if (!latlng || !HOTSPOT_ROAD_AVOID_ENDPOINT) return false;

  const samples = getResidentialBufferSamples(latlng, HOTSPOT_RESIDENTIAL_BUFFER_M, HOTSPOT_RESIDENTIAL_BUFFER_SAMPLES);
  for (const sample of samples) {
    const key = getResidentialAvoidCacheKey(sample);
    if (residentialAvoidCache.has(key)) {
      if (residentialAvoidCache.get(key)) return true;
      continue;
    }

    if (residentialAvoidChecks >= HOTSPOT_RESIDENTIAL_AVOID_MAX_CHECKS) {
      const strictFail = HOTSPOT_RESIDENTIAL_AVOID_STRICT;
      residentialAvoidCache.set(key, strictFail);
      if (strictFail) return true;
      continue;
    }

    residentialAvoidChecks += 1;
    let data = null;
    try {
      data = await fetchRoadAvoidData(sample);
    } catch {
      const strictFail = HOTSPOT_RESIDENTIAL_AVOID_STRICT;
      residentialAvoidCache.set(key, strictFail);
      if (strictFail) return true;
      continue;
    }

    const flags = classifyRoadAvoidResult(data);
    const blocked = flags.residential || flags.building;
    residentialAvoidCache.set(key, blocked);
    if (blocked) return true;
  }

  return false;
}

function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS) {
  const ms = Number.isFinite(timeoutMs) ? timeoutMs : DEFAULT_FETCH_TIMEOUT_MS;
  const hasSignal = Boolean(options && options.signal);
  const controller = hasSignal ? null : new AbortController();
  const signal = hasSignal ? options.signal : controller.signal;
  const timeoutId = controller ? setTimeout(() => controller.abort(), ms) : null;

  return fetch(url, { ...options, signal }).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

async function fetchRoadAvoidData(latlng) {
  if (!HOTSPOT_ROAD_AVOID_ENDPOINT) throw new Error('Road avoid endpoint not set');
  const ll = L.latLng(latlng);
  const url = `${HOTSPOT_ROAD_AVOID_ENDPOINT}?format=jsonv2&lat=${encodeURIComponent(ll.lat)}&lon=${encodeURIComponent(ll.lng)}&zoom=18&addressdetails=1`;
  const res = await fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 8000);
  if (!res.ok) throw new Error(`Road lookup HTTP ${res.status}`);
  return res.json();
}

function classifyRoadAvoidResult(data) {
  const cls = String(data?.class || '').toLowerCase();
  const type = String(data?.type || '').toLowerCase();
  const addresstype = String(data?.addresstype || '').toLowerCase();
  const address = data?.address || {};

  const roadTypes = new Set([
    'road', 'residential', 'tertiary', 'secondary', 'primary', 'motorway',
    'trunk', 'service', 'track', 'path', 'footway', 'cycleway', 'trail',
    'living_street', 'unclassified', 'highway', 'railway', 'bridge', 'tunnel'
  ]);
  const buildingTypes = new Set([
    'house', 'residential', 'apartments', 'building', 'farm', 'barn',
    'cabin', 'hut', 'garage', 'industrial', 'commercial', 'retail'
  ]);
  const residentialTypes = new Set([
    'residential', 'suburb', 'neighbourhood', 'hamlet', 'village', 'town', 'city',
    'allotments', 'farmyard', 'industrial', 'commercial', 'retail', 'construction',
    'school', 'college', 'university', 'hospital', 'clinic', 'parking', 'garages',
    'house', 'apartments', 'building', 'farm', 'cabin', 'hut'
  ]);
  const amenityTypes = new Set([
    'school', 'college', 'university', 'hospital', 'clinic', 'police',
    'fire_station', 'place_of_worship', 'parking', 'restaurant', 'cafe',
    'bar', 'pub', 'fast_food', 'bank', 'kindergarten'
  ]);

  const addressBuildingHit = Boolean(address.house_number || address.building || address.residential);
  const addressResidentialHit = Boolean(
    address.house_number
    || address.neighbourhood
    || address.suburb
    || address.city
    || address.town
    || address.village
    || address.hamlet
    || address.postcode
  );

  const isRoad = roadTypes.has(cls) || roadTypes.has(type) || roadTypes.has(addresstype);
  const isBuilding = cls === 'building' || buildingTypes.has(type) || buildingTypes.has(addresstype) || addressBuildingHit;
  const isResidential = residentialTypes.has(cls)
    || residentialTypes.has(type)
    || residentialTypes.has(addresstype)
    || amenityTypes.has(type)
    || amenityTypes.has(addresstype)
    || addressResidentialHit;

  return { road: isRoad, building: isBuilding, residential: isResidential };
}

async function isLikelyRoadOrStructureCandidate(latlng) {
  if (!HOTSPOT_ROAD_AVOID_ENABLED && !HOTSPOT_BUILDING_AVOID_ENABLED && !HOTSPOT_RESIDENTIAL_AVOID_ENABLED) return false;
  if (!latlng || !HOTSPOT_ROAD_AVOID_ENDPOINT) return false;

  const samples = getRoadAvoidSamples(latlng);
  for (const sample of samples) {
    const key = getRoadAvoidCacheKey(sample);
    if (roadAvoidCache.has(key)) {
      if (roadAvoidCache.get(key)) return true;
      continue;
    }

    if (roadAvoidChecks >= HOTSPOT_ROAD_AVOID_MAX_CHECKS) {
      const strictFail = HOTSPOT_ROAD_AVOID_STRICT || HOTSPOT_RESIDENTIAL_AVOID_STRICT;
      roadAvoidCache.set(key, strictFail);
      if (strictFail) return true;
      continue;
    }

    roadAvoidChecks += 1;
    let data = null;
    try {
      data = await fetchRoadAvoidData(sample);
    } catch {
      const strictFail = HOTSPOT_ROAD_AVOID_STRICT || HOTSPOT_RESIDENTIAL_AVOID_STRICT;
      roadAvoidCache.set(key, strictFail);
      if (strictFail) return true;
      continue;
    }

    const flags = classifyRoadAvoidResult(data);
    const blocked = (HOTSPOT_ROAD_AVOID_ENABLED && flags.road)
      || (HOTSPOT_BUILDING_AVOID_ENABLED && flags.building)
      || (HOTSPOT_RESIDENTIAL_AVOID_ENABLED && flags.residential);
    roadAvoidCache.set(key, blocked);
    if (blocked) return true;
  }

  if (HOTSPOT_RESIDENTIAL_AVOID_ENABLED) {
    const bufferHit = await isLikelyResidentialBufferCandidate(latlng);
    if (bufferHit) return true;
  }

  return false;
}


// ===================================================================
//   Regulations & MDC Area Info
// ===================================================================
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
  mdcActiveAreaFeature = feature;
  const attrs = feature.attributes || {};
  const regsIcon = getMdcActionIcon('regulations');
  const summaryIcon = getMdcActionIcon('summary');
  const mapIcon = getMdcActionIcon('map');
  const brochureIcon = getMdcActionIcon('brochure');
  const name = escapeHtml(attrs.OFF_Name || attrs.Area_Name || 'MDC Conservation Area');
  const county = attrs.County ? `County: ${escapeHtml(attrs.County)}` : '';
  const region = attrs.Region ? `Region: ${escapeHtml(attrs.Region)}` : '';
  const acreage = getMdcAcreage(attrs);
  const publicSite = attrs.Public_Site ? `Public: ${escapeHtml(attrs.Public_Site)}` : '';
  const meta = [county, region, publicSite].filter(Boolean).join(' | ');
  const regsLink = attrs.Reg_Link || '';
  const summaryLink = attrs.Sum_Link || '';
  const mapLink = attrs.Map_Link || '';
  const brochureLink = attrs.Brochure_Link || '';
  const admin = attrs.Division_Admin ? `Managed by: ${escapeHtml(attrs.Division_Admin)}` : '';

  openMdcInfoPanel(`
    <div class="ht-mdc-area-name">${name}</div>
    ${acreage ? `<div class="ht-mdc-acreage">${acreage}</div>` : ''}
    ${meta ? `<div class="ht-mdc-meta">${meta}</div>` : ''}
    ${admin ? `<div class="ht-mdc-meta">${admin}</div>` : ''}
    <div class="ht-mdc-cta">
      <button class="ht-mdc-pill primary" onclick="lockInMdcArea()">Lock In</button>
      <button class="ht-mdc-pill" onclick="saveMdcAreaToHuntAreas()">${isMushroomModule() ? 'Save to Forage Areas' : 'Save to Hunt Areas'}</button>
    </div>
    <div class="ht-mdc-actions">
      ${regsLink ? `<a class="ht-mdc-btn ht-mdc-btn-primary" href="${regsLink}" target="_blank" rel="noopener">${regsIcon}<span>Local Regulations</span></a>` : `<span class="ht-mdc-btn ht-mdc-btn-disabled">${regsIcon}<span>Local Regulations</span></span>`}
      ${summaryLink ? `<a class="ht-mdc-btn" href="${summaryLink}" target="_blank" rel="noopener">${summaryIcon}<span>Area Summary</span></a>` : ''}
      ${mapLink ? `<a class="ht-mdc-btn" href="${mapLink}" target="_blank" rel="noopener">${mapIcon}<span>Amenities Map</span></a>` : ''}
      ${brochureLink ? `<a class="ht-mdc-btn" href="${brochureLink}" target="_blank" rel="noopener">${brochureIcon}<span>Brochure</span></a>` : ''}
    </div>
    <div class="ht-mdc-advanced">
      <button class="ht-mdc-advanced-btn" onclick="openMdcAreaDetails()">Rules + Activities</button>
      <button class="ht-mdc-advanced-btn" onclick="showAreaRules()">Advanced area rules</button>
      <div class="ht-mdc-subtle">Tap Rules + Activities for MDC guidance, then confirm details on the official site.</div>
    </div>
  `);
}

window.openMdcAreaDetails = function() {
  if (!mdcActiveAreaFeature) return;
  showMdcAreaDetails(mdcActiveAreaFeature);
};

window.addMdcAreaToHuntArea = function() {
  if (!mdcActiveAreaFeature || !mdcActiveAreaFeature.geometry) {
    showNotice('Select a public land area first.', 'warning', 3200);
    return;
  }
  setSelectedAreaFromFeature(mdcActiveAreaFeature);
  const bounds = getBoundsFromArcgisGeometry(mdcActiveAreaFeature.geometry);
  if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
  showNotice(isMushroomModule() ? 'Public land added as your forage area.' : 'Public land added as your hunt area. Tap BUILD HUNT to continue.', 'success', 4200);
};

window.lockInMdcArea = function() {
  if (!mdcActiveAreaFeature || !mdcActiveAreaFeature.geometry) {
    showNotice('Select a public land area first.', 'warning', 3200);
    return;
  }
  setSelectedAreaFromFeature(mdcActiveAreaFeature);
  const bounds = getBoundsFromArcgisGeometry(mdcActiveAreaFeature.geometry);
  if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
  setMdcLandLabelsSuppressed(true);
  clearMdcSelectedAreaHighlight();
  closeMdcInfoPanel();
};

window.saveMdcAreaToHuntAreas = function() {
  if (!mdcActiveAreaFeature || !mdcActiveAreaFeature.geometry) {
    showNotice('Select a public land area first.', 'warning', 3200);
    return;
  }

  const attrs = mdcActiveAreaFeature.attributes || {};
  const name = attrs.OFF_Name || attrs.Area_Name || 'Public Land Area';
  const geometry = mdcActiveAreaFeature.geometry;
  const id = `area_${Date.now()}`;
  let payload = { id, name, kind: 'area', areaType: 'polygon' };

  if (geometry.rings) {
    const ring = geometry.rings[0] || [];
    payload = {
      ...payload,
      latlngs: ring.map(([lng, lat]) => [lat, lng])
    };
  } else if (geometry.x !== undefined && geometry.y !== undefined) {
    payload = {
      ...payload,
      areaType: 'radius',
      center: [geometry.y, geometry.x],
      radius: 160
    };
  }

  savedHuntAreas.unshift(payload);
  saveHuntAreas();
  renderSavedHuntAreas();
  showNotice(isMushroomModule() ? 'Forage area saved.' : 'Hunt area saved.', 'success', 3200);
};

function showMdcAreaDetails(feature) {
  if (!UI_POPUPS_ENABLED || !feature) return;
  const attrs = feature.attributes || {};
  const regsIcon = getMdcActionIcon('regulations');
  const summaryIcon = getMdcActionIcon('summary');
  const mapIcon = getMdcActionIcon('map');
  const brochureIcon = getMdcActionIcon('brochure');
  const name = escapeHtml(attrs.OFF_Name || attrs.Area_Name || 'MDC Conservation Area');
  const acreage = getMdcAcreage(attrs);
  const regsLink = attrs.Reg_Link || '';
  const summaryLink = attrs.Sum_Link || '';
  const mapLink = attrs.Map_Link || '';
  const brochureLink = attrs.Brochure_Link || '';

  openMdcInfoPanel(`
    <div class="ht-mdc-area-name">${name}</div>
    ${acreage ? `<div class="ht-mdc-acreage">${acreage}</div>` : ''}
    <div class="ht-mdc-meta">Use the MDC links below for allowed activities by type.</div>
    <div class="ht-mdc-cta">
      <button class="ht-mdc-pill primary" onclick="lockInMdcArea()">Lock In</button>
      <button class="ht-mdc-pill" onclick="saveMdcAreaToHuntAreas()">${isMushroomModule() ? 'Save to Forage Areas' : 'Save to Hunt Areas'}</button>
    </div>
    <div class="ht-mdc-actions">
      ${regsLink ? `<a class="ht-mdc-btn ht-mdc-btn-primary" href="${regsLink}" target="_blank" rel="noopener">${regsIcon}<span>Regulations</span></a>` : `<span class="ht-mdc-btn ht-mdc-btn-disabled">${regsIcon}<span>Regulations</span></span>`}
      ${summaryLink ? `<a class="ht-mdc-btn" href="${summaryLink}" target="_blank" rel="noopener">${summaryIcon}<span>Activities + Summary</span></a>` : ''}
      ${mapLink ? `<a class="ht-mdc-btn" href="${mapLink}" target="_blank" rel="noopener">${mapIcon}<span>Amenities Map</span></a>` : ''}
      ${brochureLink ? `<a class="ht-mdc-btn" href="${brochureLink}" target="_blank" rel="noopener">${brochureIcon}<span>Brochure</span></a>` : ''}
    </div>
    <div class="ht-mdc-advanced">
      <button class="ht-mdc-advanced-btn" onclick="showAreaRules()">Advanced area rules</button>
      <div class="ht-mdc-subtle">Regulations pages list hunting, fishing, camping, and seasonal restrictions.</div>
    </div>
  `);
}


// ===================================================================
//   Area Selection, Hunt Criteria & Live Strategy
// ===================================================================
function setSelectedArea(layer, type, options = {}) {
  if (!layer) {
    console.warn('setSelectedArea: layer is null');
    showNotice('Invalid area selection', 'error');
    return;
  }
  
  const { autoLock = true, suppressTray = false } = options;
  
  // Clean up previous selection
  if (selectedAreaLayer) {
    try {
      map?.removeLayer(selectedAreaLayer);
      if (drawnItems?.hasLayer(selectedAreaLayer)) {
        drawnItems.removeLayer(selectedAreaLayer);
      }
    } catch (error) {
      console.warn('Error removing previous area layer:', error);
    }
  }

  if (pendingFieldCommandAdvance) {
    pendingFieldCommandAdvance = false;
  }

  selectedAreaLayer = layer;
  selectedAreaType = type;
  currentPolygon = layer;
  pendingRoutePinPrompt = true;
  fieldCommandFlowActive = true;
  
  // Add haptic feedback on mobile
  if (navigator.vibrate) {
    navigator.vibrate(15);
  }
  
  showNotice('Area selected. Building plan...', 'success', 2000);

  if (layer && drawnItems && !drawnItems.hasLayer(layer)) {
    drawnItems.addLayer(layer);
  }
  
  // Show advanced loading indicator
  const showAdvancedLoading = () => {
    const existing = document.getElementById('htAdvancedLoader');
    if (existing) existing.remove();
    
    const loader = document.createElement('div');
    loader.id = 'htAdvancedLoader';
    loader.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(11, 11, 11, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      color: #ffc107;
      font-family: 'Sora', sans-serif;
    `;
    
    loader.innerHTML = `
      <div style="font-size: 24px; font-weight: 600; margin-bottom: 20px;">
        🎯 Analyzing terrain...
      </div>
      <div style="font-size: 14px; color: #ccc; margin-bottom: 30px; text-align: center; max-width: 280px;">
        Generating hotspots and hunting strategy for your selected area
      </div>
      <div style="width: 200px; height: 4px; background: rgba(255,193,7,0.2); border-radius: 2px; overflow: hidden;">
        <div style="width: 0%; height: 100%; background: #ffc107; border-radius: 2px; animation: htLoadingProgress 3s ease-out forwards;"></div>
      </div>
    `;
    
    document.body.appendChild(loader);
    return loader;
  };
  
  updateLockInAreaState(true);
  updateSaveAreaState(true);
  setLockInAreaStatus(autoLock ? 'Building plan...' : '', null);

  if (!suppressTray) {
    setTimeout(() => {
      const toolbar = document.getElementById('toolbar');
      if (!toolbar) return;
      if (fieldCommandFlowActive) {
        updateTrayToggleButton();
        return;
      }
      if (!toolbarOpen || toolbar.classList.contains('collapsed')) {
        toolbarOpen = true;
        toolbar.classList.remove('collapsed');
        document.body.classList.remove('ht-toolbar-collapsed');
        try { localStorage.setItem('htToolbarCollapsed', '0'); } catch {}
      }
      updateTrayToggleButton();
      try { toolbar.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
    }, 120);

    setTimeout(() => {
      setFieldCommandStep(2);
      focusPlanRoutePanel();
    }, 140);
  }

  if (autoLock) {
    setTimeout(() => {
      try {
        window.lockInArea();
      } catch (error) {
        console.error('lockInArea failed:', error);
        document.getElementById('htAdvancedLoader')?.remove();
        showNotice('Failed to build plan. Please try again.', 'error');
      }
    }, 200);
  }

  checkSelectedAreaResidentialOverlap(layer, type);
  if (autoLock) {
    showQuickHint('Area locked. Building plan...', 1200);
  } else {
    showQuickHint('Area loaded. Tap Lock In to continue.', 1400);
  }
}

let areaResidentialCheckToken = 0;

async function checkSelectedAreaResidentialOverlap(layer, type) {
  if (!HOTSPOT_RESIDENTIAL_AVOID_ENABLED) return;
  if (!layer || !HOTSPOT_ROAD_AVOID_ENDPOINT) return;
  const bounds = layer.getBounds ? layer.getBounds() : null;
  if (!bounds) return;

  const token = ++areaResidentialCheckToken;
  const points = [
    bounds.getCenter(),
    bounds.getNorthWest(),
    bounds.getNorthEast(),
    bounds.getSouthWest(),
    bounds.getSouthEast()
  ];

  for (const point of points) {
    if (token !== areaResidentialCheckToken) return;
    if (!point) continue;
    if (!isPointInAreaLayer(point, layer, type)) continue;
    const key = `${getResidentialAvoidCacheKey(point)}:area`;
    if (residentialAvoidCache.has(key)) {
      if (residentialAvoidCache.get(key)) {
        showNotice('Warning: selected area overlaps residential parcels. Adjust the boundary to avoid private yards.', 'warning', 5200);
        return;
      }
      continue;
    }

    let data = null;
    try {
      data = await fetchRoadAvoidData(point);
    } catch {
      residentialAvoidCache.set(key, false);
      continue;
    }

    const flags = classifyRoadAvoidResult(data);
    const blocked = flags.residential || flags.building;
    residentialAvoidCache.set(key, blocked);
    if (blocked) {
      showNotice('Warning: selected area overlaps residential parcels. Adjust the boundary to avoid private yards.', 'warning', 5200);
      return;
    }
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
  if (isTurkeyModule()) {
    return ['roostZone', 'strutZone', 'travelCorridor', 'roostZone', 'feedingArea', 'travelCorridor', 'loafingArea', 'waterSource'];
  }
  if (BUCK_FOCUS_MODE) {
    return ['bedding', 'transition', 'transition', 'bedding', 'transition', 'water'];
  }
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
  renderSavedPropertiesSelect();
}

function saveHuntJournal() {
  try {
    localStorage.setItem(HUNT_JOURNAL_STORAGE_KEY, JSON.stringify(huntJournalEntries));
  } catch {
    // Ignore storage failures.
  }
}

function queueLiveStrategyUpdate(reason = 'log') {
  if (!hotspotMarkers.length) return;
  if (liveStrategyUpdateTimer) clearTimeout(liveStrategyUpdateTimer);
  liveStrategyUpdateTimer = setTimeout(() => {
    liveStrategyUpdateTimer = null;
    evaluateLiveStrategyUpdate(reason);
  }, 700);
}

function getLiveSignalEntries() {
  return huntJournalEntries.filter((entry) => (
    entry
    && Array.isArray(entry.coords)
    && entry.coords.length === 2
    && Number.isFinite(entry.coords[0])
    && Number.isFinite(entry.coords[1])
  ));
}

function getLiveSignalWeight(entry) {
  const sign = String(entry?.signType || entry?.type || '').toLowerCase();
  // Turkey-specific signal weights
  if (isTurkeyModule()) {
    if (window.TURKEY_SIGNAL_WEIGHTS) {
      for (const [key, weight] of Object.entries(window.TURKEY_SIGNAL_WEIGHTS)) {
        if (sign.includes(key.toLowerCase())) return weight;
      }
    }
    if (sign.includes('roost') || sign.includes('gobble')) return 5.0;
    if (sign.includes('strut')) return 4.5;
    if (sign.includes('scratch')) return 3.5;
    if (sign.includes('track')) return 2.5;
    return 2.0;
  }
  if (sign.includes('bedding') || sign.includes('bed')) return 4.2;
  if (sign.includes('buck_sign') || sign.includes('buck')) return 3.5;
  if (sign.includes('scrape')) return 3.2;
  if (sign.includes('rub')) return 2.9;
  if (sign.includes('trail')) return 2.4;
  if (sign.includes('shed')) return 2.2;
  return 1.8;
}

function scoreHotspotWithSignals(hotspot, signals) {
  if (!hotspot || !Array.isArray(hotspot.coords)) return 0;
  const base = hotspot.tier ? Math.max(1, 5 - hotspot.tier) : 1.5;
  const ll = L.latLng(hotspot.coords[0], hotspot.coords[1]);
  let boost = 0;
  signals.forEach((entry) => {
    const el = L.latLng(entry.coords[0], entry.coords[1]);
    const dist = ll.distanceTo(el);
    if (dist > LIVE_STRATEGY_SIGNAL_RADIUS_M) return;
    const weight = getLiveSignalWeight(entry);
    const proximity = 1 - (dist / LIVE_STRATEGY_SIGNAL_RADIUS_M);
    boost += weight * Math.max(0, proximity);
  });
  return base + boost;
}

function getHotspotKey(hotspot) {
  const coords = hotspot?.coords || [];
  if (coords.length < 2) return '';
  return `${Number(coords[0]).toFixed(5)},${Number(coords[1]).toFixed(5)}`;
}

function buildLiveRankedHotspots(hotspots, signals) {
  const safe = Array.isArray(hotspots) ? hotspots : [];
  return safe
    .map((hotspot) => ({
      hotspot,
      score: scoreHotspotWithSignals(hotspot, signals)
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item.hotspot,
      rank: index + 1
    }));
}

function applyLiveStrategyRanks(rankedHotspots) {
  const ranked = Array.isArray(rankedHotspots) ? rankedHotspots : [];
  const byKey = new Map(ranked.map((hotspot) => [getHotspotKey(hotspot), hotspot]));
  hotspotMarkers.forEach((marker) => {
    if (!marker?.__hotspotData) return;
    const key = getHotspotKey(marker.__hotspotData);
    const next = byKey.get(key);
    if (!next) return;
    marker.__hotspotData.rank = next.rank;
    marker.setIcon(getHotspotPinIcon(String(next.rank), marker.__hotspotData));
  });

  buildRoutePinOptions(ranked);
  if (lastPlanSnapshot && Array.isArray(lastPlanSnapshot.hotspots)) {
    lastPlanSnapshot.hotspots = ranked.map((h) => ({
      coords: h.coords,
      tier: h.tier,
      habitat: h.habitat,
      rank: h.rank
    }));
  }
}

function promptLiveStrategyUpdate(rankedHotspots) {
  const now = Date.now();
  if (now - lastLiveStrategyPromptAt < 6000) return;
  lastLiveStrategyPromptAt = now;
  const top = rankedHotspots.slice(0, 3)
    .map((hotspot) => {
      const title = hotspot?.education?.title || 'Priority zone';
      return `#${hotspot.rank} ${title}`;
    })
    .join('\n');
  openChoiceModal({
    title: 'Refined Strategy',
    message: `New field sign suggests a better plan.\n${top}\n\nApply the updated strategy?`,
    primaryLabel: 'Apply Update',
    secondaryLabel: 'Keep Current',
    onPrimary: () => {
      applyLiveStrategyRanks(rankedHotspots);
      showNotice('Strategy updated from field logs.', 'success', 4200);
    }
  });
}

function evaluateLiveStrategyUpdate(reason = 'log') {
  if (!hotspotMarkers.length) return;
  const signals = getLiveSignalEntries();
  if (signals.length < LIVE_STRATEGY_SIGNAL_MIN) return;

  const hotspots = hotspotMarkers
    .map((marker) => marker.__hotspotData)
    .filter(Boolean);
  if (!hotspots.length) return;

  const ranked = buildLiveRankedHotspots(hotspots, signals);
  const signature = ranked.slice(0, 5).map(getHotspotKey).join('|');
  if (!signature || signature === lastLiveStrategySignature) return;

  lastLiveStrategySignature = signature;
  promptLiveStrategyUpdate(ranked);
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
  if (btn) btn.textContent = `${coreAreaEnabled ? 'Hide' : 'Show'} ${isMushroomModule() ? 'Core Morel Zones' : 'Core Buck Zones'}`;
}

function createScoutingLayer(bounds, criteria, windDir, seedZones) {
  clearScoutingLayer();
  if (!bounds) return;

  const depth = criteria?.depth || 'general';
  if (depth === 'general') return;

  if (Array.isArray(seedZones) && seedZones.length) {
    buildScoutingLayerFromZones(seedZones);
    return;
  }

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


// ===================================================================
//   Terrain Analysis Engine
// ===================================================================
function getBoundsSizeMeters(bounds) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const width = sw.distanceTo(L.latLng(sw.lat, ne.lng));
  const height = sw.distanceTo(L.latLng(ne.lat, sw.lng));
  return { width, height, area: width * height };
}

function getAreaSqMiles(areaLayer, areaType, bounds) {
  try {
    if (areaLayer) {
      const type = areaType || (areaLayer instanceof L.Circle ? 'radius' : (areaLayer instanceof L.Rectangle ? 'boundary' : 'polygon'));
      if (type === 'radius' && areaLayer.getRadius) {
        const radius = areaLayer.getRadius();
        const areaSqMeters = Math.PI * radius * radius;
        return areaSqMeters / (1609.34 * 1609.34);
      }
      if (areaLayer instanceof L.Polygon && areaLayer.getLatLngs && L.GeometryUtil) {
        const rings = areaLayer.getLatLngs();
        const outer = Array.isArray(rings) && Array.isArray(rings[0]) ? rings[0] : rings;
        const areaSqMeters = L.GeometryUtil.geodesicArea(outer || []);
        return areaSqMeters / (1609.34 * 1609.34);
      }
    }
  } catch {}

  if (bounds) {
    const { area } = getBoundsSizeMeters(bounds);
    return area / (1609.34 * 1609.34);
  }

  return 0;
}

function buildTerrainSampleGrid(bounds, areaLayer, areaType, spacingMeters, maxPoints, options = {}) {
  if (!bounds) return null;
  const limit = Math.max(200, Number(maxPoints) || DEFAULT_TERRAIN_GRID_MAX_POINTS);
  let spacing = Math.max(60, Number(spacingMeters) || DEFAULT_TERRAIN_DEEP_GRID_SPACING_M);
  const includeAll = Boolean(options.includeAll);

  for (let attempt = 0; attempt < 4; attempt++) {
    const midLat = (bounds.getSouth() + bounds.getNorth()) / 2;
    const latStep = spacing / 111111;
    const lngStep = spacing / (111111 * Math.cos((midLat * Math.PI) / 180));
    const rows = Math.max(1, Math.floor((bounds.getNorth() - bounds.getSouth()) / latStep) + 1);
    const cols = Math.max(1, Math.floor((bounds.getEast() - bounds.getWest()) / lngStep) + 1);
    const gridRows = [];
    const points = [];

    for (let r = 0; r < rows; r++) {
      const lat = bounds.getSouth() + r * latStep;
      const row = [];
      for (let c = 0; c < cols; c++) {
        const lng = bounds.getWest() + c * lngStep;
        const ll = L.latLng(lat, lng);
        const inside = includeAll
          ? true
          : areaLayer
            ? isPointInAreaLayer(ll, areaLayer, areaType)
            : isPointInSelectedArea(ll);
        if (inside) {
          row.push({ index: points.length, latlng: ll });
          points.push(ll);
        } else {
          row.push(null);
        }
      }
      gridRows.push(row);
    }

    if (points.length <= limit || attempt === 3) {
      return {
        rows: gridRows,
        cols,
        points,
        spacingMeters: spacing
      };
    }

    spacing *= 1.35;
  }

  return null;
}

function clampLatLngIntoArea(latlng, areaLayer, areaType, bounds) {
  if (!latlng || !areaLayer) return null;
  const point = L.latLng(latlng);
  if (isPointInAreaLayer(point, areaLayer, areaType)) return point;
  const center = bounds && bounds.getCenter ? bounds.getCenter() : null;
  if (!center) return null;
  const steps = 24;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ll = L.latLng(
      point.lat + (center.lat - point.lat) * t,
      point.lng + (center.lng - point.lng) * t
    );
    if (isPointInAreaLayer(ll, areaLayer, areaType)) return ll;
  }
  return null;
}

function buildArcgisEnvelopeQuery(baseUrl, bounds, outFields = '*', limit = 2000) {
  if (!baseUrl || !bounds) return null;
  const xmin = bounds.getWest();
  const ymin = bounds.getSouth();
  const xmax = bounds.getEast();
  const ymax = bounds.getNorth();
  const query = `${baseUrl}/query?f=json&where=1%3D1&geometry=${xmin},${ymin},${xmax},${ymax}` +
    `&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects` +
    `&outFields=${encodeURIComponent(outFields)}&returnGeometry=true&outSR=4326&resultRecordCount=${limit}`;
  const useProxy = NHD_USE_PROXY || FORCE_PROXY;
  return useProxy ? `${REG_PROXY_PATH}${encodeURIComponent(query)}` : query;
}

async function fetchArcgisFeatures(baseUrl, bounds, outFields, limit = 2000) {
  const url = buildArcgisEnvelopeQuery(baseUrl, bounds, outFields, limit);
  if (!url) return [];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ArcGIS HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.features) ? data.features : [];
}

function getPolylineMidpoint(geometry) {
  const paths = geometry?.paths;
  if (!Array.isArray(paths) || !paths.length) return null;
  let longest = paths[0];
  let longestLen = 0;
  paths.forEach((p) => {
    if (Array.isArray(p) && p.length > longestLen) {
      longestLen = p.length;
      longest = p;
    }
  });
  if (!Array.isArray(longest) || !longest.length) return null;
  const mid = longest[Math.floor(longest.length / 2)];
  if (!Array.isArray(mid) || mid.length < 2) return null;
  return L.latLng(mid[1], mid[0]);
}

function getPolygonCentroid(geometry) {
  const rings = geometry?.rings;
  if (!Array.isArray(rings) || !rings.length) return null;
  const ring = rings[0];
  if (!Array.isArray(ring) || ring.length < 3) return null;
  let sumX = 0;
  let sumY = 0;
  ring.forEach((pt) => {
    if (Array.isArray(pt) && pt.length >= 2) {
      sumX += pt[0];
      sumY += pt[1];
    }
  });
  const count = ring.length;
  return count ? L.latLng(sumY / count, sumX / count) : null;
}

async function fetchHydroFeatures(bounds) {
  if (!bounds) return [];
  const features = [];

  try {
    if (NHD_FLOWLINE_URL) {
      const flowlines = await fetchArcgisFeatures(NHD_FLOWLINE_URL, bounds, 'GNIS_NAME,FType');
      flowlines.forEach((feature) => {
        const latlng = getPolylineMidpoint(feature.geometry);
        if (!latlng) return;
        const name = feature?.attributes?.GNIS_NAME || 'Drainage';
        features.push({
          type: 'creek_line',
          label: name || 'Drainage Line',
          detail: 'Drainage line or creek corridor. Check crossings, inside bends, and adjacent benches.',
          latlng,
          score: 86
        });
      });
    }
  } catch {
    // Ignore hydrography fetch failures.
  }

  try {
    if (NHD_WATERBODY_URL) {
      const waterbodies = await fetchArcgisFeatures(NHD_WATERBODY_URL, bounds, 'GNIS_NAME,FType');
      waterbodies.forEach((feature) => {
        const latlng = getPolygonCentroid(feature.geometry);
        if (!latlng) return;
        const name = feature?.attributes?.GNIS_NAME || 'Water';
        features.push({
          type: 'water_edge',
          label: name || 'Water Edge',
          detail: 'Water edge and cover meet. Look for crossings, staging trails, and bedding just off the shoreline.',
          latlng,
          score: 84
        });
      });
    }
  } catch {
    // Ignore hydrography fetch failures.
  }

  return features;
}

function mergeTerrainFeatures(primary, extra, minSpacingMeters) {
  const merged = Array.isArray(primary) ? primary.slice() : [];
  const candidates = Array.isArray(extra) ? extra : [];
  const spacing = Number.isFinite(minSpacingMeters) ? minSpacingMeters : 70;

  candidates.forEach((feature) => {
    if (!feature || !feature.latlng) return;
    const ll = L.latLng(feature.latlng);
    const tooClose = merged.some((f) => f?.latlng && ll.distanceTo(f.latlng) < spacing);
    if (!tooClose) merged.push(feature);
  });

  return merged;
}

function filterTerrainFeaturesBySpacing(features, options = {}) {
  const minSpacing = Number.isFinite(options.minSpacing) ? options.minSpacing : 140;
  const typeSpacing = options.typeSpacing || {};
  const sorted = Array.isArray(features) ? features.slice() : [];
  sorted.sort((a, b) => (b.score || 0) - (a.score || 0));

  const filtered = [];
  sorted.forEach((feature) => {
    if (!feature || !feature.latlng) return;
    const spacing = Number.isFinite(typeSpacing[feature.type]) ? typeSpacing[feature.type] : minSpacing;
    const ll = L.latLng(feature.latlng);
    const tooClose = filtered.some((f) => f?.latlng && ll.distanceTo(f.latlng) < spacing);
    if (!tooClose) filtered.push(feature);
  });

  return filtered;
}

function getSeasonProfile() {
  const month = new Date().getMonth() + 1;
  if ([12, 1, 2, 3].includes(month)) return 'late_winter';
  if ([4, 5].includes(month)) return 'spring';
  if ([6, 7, 8].includes(month)) return 'summer';
  if ([9, 10].includes(month)) return 'fall';
  return 'general';
}

function applyTerrainFeatureBoosts(features, options = {}) {
  if (!Array.isArray(features) || !features.length) return features || [];
  const season = options.season || 'general';
  const baseBoost = {
    leeward_pocket: 10,
    saddle: 6,
    bench: 8,
    pinch: 7,
    ridge_point: 4,
    thermal_drain: 6,
    micro_nob: 7,
    creek_line: 3,
    water_edge: 2
  };
  const seasonalBoost = season === 'late_winter'
    ? {
      leeward_pocket: 2,
      saddle: 2,
      thermal_drain: 2,
      bench: 1,
      creek_line: 1
    }
    : {};

  features.forEach((feature) => {
    if (!feature) return;
    const score = Number(feature.score) || 80;
    const boost = (baseBoost[feature.type] || 0) + (seasonalBoost[feature.type] || 0);
    feature.score = Math.min(99, score + boost);
  });

  return features;
}

function detectAreaTerrainFeatures(gridInfo, elevations, windDir, options = {}) {
  const features = [];
  if (!gridInfo || !Array.isArray(elevations) || !gridInfo.rows?.length) return features;

  const rows = gridInfo.rows.length;
  const cols = gridInfo.cols;
  const spacing = gridInfo.spacingMeters || DEFAULT_TERRAIN_DEEP_GRID_SPACING_M;
  const elevGrid = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = gridInfo.rows[r][c];
      if (!cell) continue;
      const elev = elevations[cell.index];
      elevGrid[r][c] = Number.isFinite(elev) ? elev : null;
    }
  }

  const windVec = windDirToVector(windDir);
  const downwindVec = windVec ? [-windVec[0], -windVec[1]] : null;

  const addFeature = (r, c, type, label, detail, score, options = {}) => {
    let p = gridInfo.rows[r][c]?.latlng;
    if (!p) return;
    if (options.downwindMeters && downwindVec) {
      p = offsetLatLngMeters(p, downwindVec[0] * options.downwindMeters, downwindVec[1] * options.downwindMeters);
    }
    const id = `${type}-${r}-${c}-${Math.round(p.lat * 1e5)}-${Math.round(p.lng * 1e5)}`;
    features.push({ id, type, label, detail, latlng: p, score });
  };

  const promMajor = Number.isFinite(options.promMajor) ? options.promMajor : 8;
  const promMicro = Number.isFinite(options.promMicro) ? options.promMicro : 3;
  const slopeBench = Number.isFinite(options.slopeBench) ? options.slopeBench : 0.04;
  const slopePinch = Number.isFinite(options.slopePinch) ? options.slopePinch : 0.12;
  const slopeLeeMin = Number.isFinite(options.slopeLeeMin) ? options.slopeLeeMin : 0.06;
  const slopeLeeMax = Number.isFinite(options.slopeLeeMax) ? options.slopeLeeMax : 0.25;

  const get = (r, c) => (r >= 0 && r < rows && c >= 0 && c < cols ? elevGrid[r][c] : null);

  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const center = elevGrid[r][c];
      if (center == null) continue;

      const neighbors = [];
      for (let rr = r - 1; rr <= r + 1; rr++) {
        for (let cc = c - 1; cc <= c + 1; cc++) {
          if (rr === r && cc === c) continue;
          const v = get(rr, cc);
          if (v != null) neighbors.push(v);
        }
      }
      if (neighbors.length < 5) continue;

      const maxN = Math.max(...neighbors);
      const minN = Math.min(...neighbors);

      const elevN = get(r + 1, c);
      const elevS = get(r - 1, c);
      const elevE = get(r, c + 1);
      const elevW = get(r, c - 1);

      let slope = null;
      let downhillVec = null;
      if (elevN != null && elevS != null && elevE != null && elevW != null) {
        const dzdx = (elevE - elevW) / (2 * spacing);
        const dzdy = (elevN - elevS) / (2 * spacing);
        slope = Math.hypot(dzdx, dzdy);
        const downhillMag = Math.hypot(-dzdx, -dzdy) || 1;
        downhillVec = [-dzdx / downhillMag, -dzdy / downhillMag];
      }

      const isRidge = center - maxN >= promMajor;
      const isMicroHigh = center - maxN >= promMicro;
      const isLow = minN - center >= promMajor;
      const isMicroLow = minN - center >= promMicro;

      if (isRidge) {
        addFeature(r, c, 'ridge_point', 'Ridge Point', isMushroomModule() ? 'High point with canopy gaps. Moisture drains away quickly but nearby slopes stay damp.' : 'High point on a ridge. Mature bucks use these for wind advantage and sight lines.', 94);
      } else if (isMicroHigh) {
        addFeature(r, c, 'micro_nob', isMushroomModule() ? 'Micro Rise' : 'Micro Nob', isMushroomModule() ? 'Subtle rise with drainage on all sides. Check the shaded base for moisture pockets.' : 'Subtle rise off the main line. Mature bucks stage just downwind in brush and use micro exits.', 86, { downwindMeters: 14 });
      }

      if (isLow) {
        addFeature(r, c, 'saddle', isMushroomModule() ? 'Low Pass / Draw' : 'Saddle / Low Pass', isMushroomModule() ? 'Low area between ridges that collects moisture and organic debris. Prime morel habitat.' : 'Low pass between higher ground. Natural funnel for quiet, efficient travel.', 92);
      } else if (isMicroLow && slope != null && slope <= 0.05) {
        addFeature(r, c, 'thermal_drain', isMushroomModule() ? 'Cool Drainage' : 'Thermal Drain', isMushroomModule() ? 'Cool, shaded drain where soil stays moist. Check downed wood and leaf edges.' : 'Cool-air sink with micro cover breaks. Mature bucks slip the downwind edge.', 84);
      }

      if (slope != null && slope <= slopeBench && (maxN - minN) >= 2) {
        addFeature(r, c, 'bench', isMushroomModule() ? 'Shelf / Bench' : 'Travel Bench', isMushroomModule() ? 'Flat shelf on a slope. Moisture collects here. Look for elm, ash, and old fruit trees.' : 'Micro bench used for downwind brush travel and hidden exits off the main trail.', 90);
      }

      if (elevN != null && elevS != null && elevE != null && elevW != null) {
        const slopeNS = Math.abs(elevN - elevS) / (2 * spacing);
        const slopeEW = Math.abs(elevE - elevW) / (2 * spacing);
        if (isLow && slopeNS >= slopePinch && slopeEW >= slopePinch) {
          addFeature(r, c, 'pinch', isMushroomModule() ? 'Narrow Draw' : 'Terrain Pinch', isMushroomModule() ? 'Tight drainage that funnels moisture and debris. Scan leaf litter at the narrowest point.' : 'Tight squeeze that mature bucks skirt via brushy, downwind micro exits.', 92);
        }
      }

      if (downwindVec && downhillVec && slope != null && slope >= slopeLeeMin && slope <= slopeLeeMax) {
        const dot = downhillVec[0] * downwindVec[0] + downhillVec[1] * downwindVec[1];
        if (dot >= 0.6) {
          addFeature(r, c, 'leeward_pocket', isMushroomModule() ? 'Sheltered Slope' : 'Leeward Pocket', isMushroomModule() ? 'Protected, shaded slope that holds moisture. North-facing aspects are prime morel spots.' : 'Sheltered leeward slope with brushy downwind exits. Prime mature buck bedding.', 98, { downwindMeters: 18 });
        }
      }
    }
  }

  features.sort((a, b) => (b.score || 0) - (a.score || 0));
  if (options.skipFilter) return features;
  return filterTerrainFeaturesBySpacing(features, {
    minSpacing: options.minSpacing,
    typeSpacing: options.typeSpacing
  });
}

function buildTerrainSignalCandidates(gridInfo, elevations, options = {}) {
  const features = [];
  if (!gridInfo || !Array.isArray(elevations) || !gridInfo.rows?.length) return features;
  const rows = gridInfo.rows.length;
  const cols = gridInfo.cols;
  const elevGrid = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = gridInfo.rows[r][c];
      if (!cell) continue;
      const elev = elevations[cell.index];
      elevGrid[r][c] = Number.isFinite(elev) ? elev : null;
    }
  }

  const get = (r, c) => (r >= 0 && r < rows && c >= 0 && c < cols ? elevGrid[r][c] : null);
  const candidates = [];

  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const center = elevGrid[r][c];
      if (center == null) continue;
      const neighbors = [];
      for (let rr = r - 1; rr <= r + 1; rr++) {
        for (let cc = c - 1; cc <= c + 1; cc++) {
          if (rr === r && cc === c) continue;
          const v = get(rr, cc);
          if (v != null) neighbors.push(v);
        }
      }
      if (neighbors.length < 5) continue;
      const maxN = Math.max(...neighbors);
      const minN = Math.min(...neighbors);
      const variance = Math.abs(maxN - minN);
      const latlng = gridInfo.rows[r][c]?.latlng;
      if (!latlng) continue;
      candidates.push({ latlng, score: variance });
    }
  }

  candidates.sort((a, b) => (b.score || 0) - (a.score || 0));
  const minSpacing = Number.isFinite(options.minSpacing) ? options.minSpacing : 120;
  const maxCount = Number.isFinite(options.maxCount) ? options.maxCount : 12;
  const minVariance = Number.isFinite(options.minVariance) ? options.minVariance : 0.6;

  for (const cand of candidates) {
    if (cand.score < minVariance) continue;
    const tooClose = features.some((f) => f.latlng.distanceTo(cand.latlng) < minSpacing);
    if (tooClose) continue;
    features.push({
      id: `micro-${Math.round(cand.latlng.lat * 1e5)}-${Math.round(cand.latlng.lng * 1e5)}`,
      type: 'micro_variance',
      label: 'Micro Relief',
      detail: 'Subtle terrain change. Check nearby edges and micro cover breaks.',
      latlng: cand.latlng,
      score: Math.min(88, Math.max(72, Math.round(70 + cand.score * 6)))
    });
    if (features.length >= maxCount) break;
  }

  return features;
}

function buildFeatureHotspotEducation(feature, criteria, windDir, bounds) {
  const type = String(feature?.type || 'terrain');
  const wind = windDir ? `Best with ${windDir} wind.` : 'Wind-neutral setup.';
  const score = Number(feature?.score) || 80;
  const priority = score >= 92 ? 1 : score >= 88 ? 2 : score >= 82 ? 3 : 4;
  const thermal = getThermalCueForType(type, windDir);
  const latlng = feature?.latlng ? L.latLng(feature.latlng) : null;
  const region = bounds && latlng ? describeRelativePosition(bounds, latlng) : '';
  const profile = latlng
    ? buildHotspotSearchSpec({ habitat: 'terrain', coords: [latlng.lat, latlng.lng], searchFeature: feature }, windDir)
    : null;
  const searchLabel = profile?.label ? `Search shape: ${profile.label}.` : '';
  const approachSteps = [];
  if (profile?.label) {
    approachSteps.push(`Work the ${profile.label} first, then widen 20-40 yards downwind.`);
  }
  if (windDir) {
    approachSteps.push(`Keep a ${windDir} wind on your face; stay on the downwind edge.`);
  }
  approachSteps.push(isMushroomModule() ? 'Walk slow sweeping lanes; morels hide at ground level in leaf litter.' : 'Track the downwind side of the primary doe trail to mirror mature buck travel.');

  const mushTemplates = {
    leeward_pocket: {
      title: 'Sheltered Slope',
      tips: 'Check the shaded face and downed wood on this moisture-holding slope.',
      why: ['Protected from wind and sun', 'Soil stays moist here longer after rain']
    },
    ridge_point: {
      title: 'Ridge Point',
      tips: 'Drier up top, but check the transition to shaded slopes just below.',
      why: ['Canopy gaps let more light in', 'Run-off feeds mushroom habitat downslope']
    },
    saddle: {
      title: 'Low Pass / Draw',
      tips: 'Walk the lowest line where debris and moisture collect.',
      why: ['Moisture funnels through the low point', 'Organic matter accumulates here']
    },
    bench: {
      title: 'Shelf / Bench',
      tips: 'Follow the contour and check host trees and downed logs.',
      why: ['Flat terrain holds soil moisture', 'Great habitat for elm and ash root systems']
    },
    pinch: {
      title: 'Narrow Draw',
      tips: 'Check the narrowest point where leaf litter accumulates.',
      why: ['Concentrated moisture and debris', 'Natural collection point for organic matter']
    },
    thermal_drain: {
      title: 'Cool Drainage',
      tips: 'Check downed wood and the leaf litter edge along this cool drain.',
      why: ['Consistent moisture from drainage', 'Shade keeps soil at ideal temperature']
    },
    micro_nob: {
      title: 'Micro Rise',
      tips: 'Scan the shaded base and nearby downed hardwoods.',
      why: ['Drainage on all sides holds moisture below', 'Host tree roots often nearby']
    },
    creek_line: {
      title: 'Creek Line',
      tips: 'Check both banks and any downed wood spanning the channel.',
      why: ['Consistent moisture year-round', 'Rich organic soil along drainage edges']
    },
    water_edge: {
      title: 'Water Edge',
      tips: 'Check the moist bank edge and shaded patches near the water.',
      why: ['Consistent moisture year-round', 'Rich organic soil along water edges']
    }
  };

  const shedTemplates = {
    leeward_pocket: {
      title: 'Leeward Pocket',
      tips: 'Check the downwind shoulder and the first cover break below the crest.',
      why: ['Wind shelter keeps mature bucks comfortable', 'Thermals pull scent downhill in the morning']
    },
    ridge_point: {
      title: 'Ridge Point',
      tips: 'Glass the point tip and the side trails that wrap below it.',
      why: ['Visibility and wind advantage', 'Natural transition between bedding pockets']
    },
    saddle: {
      title: 'Saddle / Low Pass',
      tips: 'Walk the lowest line, then scan 20-40 yards downwind.',
      why: ['Movement funnels through the lowest energy gap', 'Consistent travel year to year']
    },
    bench: {
      title: 'Travel Bench',
      tips: 'Follow the contour and look where it intersects thick cover.',
      why: ['Low-effort travel lane', 'Hidden movement off the skyline']
    },
    pinch: {
      title: 'Terrain Pinch',
      tips: 'Hunt the downwind edge and side trails that skirt the pinch.',
      why: ['Concentrated movement', 'Natural choke between barriers']
    },
    thermal_drain: {
      title: 'Thermal Drain',
      tips: 'Check the lower edge where cool air pools and trails converge.',
      why: ['Thermals carry scent predictably', 'Low-pressure travel in calm conditions']
    },
    micro_nob: {
      title: 'Micro Nob',
      tips: 'Scan the downwind face and quiet exits around the rise.',
      why: ['Subtle vantage without exposure', 'Mature bucks stage here before moving']
    },
    creek_line: {
      title: 'Creek Line',
      tips: 'Check crossings, inside bends, and low shelves just above the water.',
      why: ['Travel funnels along drainage edges', 'Water corridors concentrate movement']
    },
    water_edge: {
      title: 'Water Edge',
      tips: 'Work the first dry bench and any narrow crossings with fresh sign.',
      why: ['Consistent travel between cover blocks', 'Sheds often drop on low-effort crossings']
    }
  };

  const templates = isMushroomModule() ? mushTemplates : shedTemplates;

  const template = templates[type] || {
    title: feature?.label || 'Terrain Feature',
    tips: 'Work the downwind edge and check for subtle trails.',
    why: ['Terrain creates a natural advantage', 'Cover and wind combine here']
  };

  return {
    title: `${template.title}${region ? ` (${region})` : ''}`,
    description: [feature?.detail || 'Terrain-driven micro feature worth a closer look.', searchLabel]
      .filter(Boolean)
      .join(' '),
    tips: template.tips,
    lookFor: template.tips,
    why: [feature?.detail, thermal?.detail, thermal?.best, wind].filter(Boolean),
    approach: approachSteps,
    priority,
    thermal
  };
}

async function analyzeSelectedAreaTerrain(bounds, areaLayer, areaType, windDir, depth, options = {}) {
  if (!bounds) return { features: [], coreZones: [], hotspotSeeds: [] };
  let spacingBase = depth === 'deep' ? DEFAULT_TERRAIN_DEEP_GRID_SPACING_M : DEFAULT_TERRAIN_MEDIUM_GRID_SPACING_M;
  if (depth === 'deep') spacingBase = Math.max(70, spacingBase * 0.85);
  const size = getBoundsSizeMeters(bounds);
  if (size.width > 6000 || size.height > 6000) spacingBase *= 1.35;
  if (size.width > 12000 || size.height > 12000) spacingBase *= 1.6;
  const maxPoints = Number(window.TERRAIN_GRID_MAX_POINTS || DEFAULT_TERRAIN_GRID_MAX_POINTS);
  const grid = buildTerrainSampleGrid(bounds, areaLayer, areaType, spacingBase, maxPoints, options);
  if (!grid || !grid.points.length) return { features: [], coreZones: [], hotspotSeeds: [] };

  showNotice(`Deep scan: sampling ${grid.points.length} terrain points…`, 'info', 2400);

  let elevations = [];
  try {
    elevations = await fetchElevationsForPointsBatched(grid.points);
  } catch (err) {
    try {
      elevations = await fetchElevationsForPointsBatched(grid.points, true);
    } catch (fallbackErr) {
      const msg = fallbackErr && fallbackErr.message ? fallbackErr.message : 'Elevation lookup failed.';
      showNotice(`Deep scan limited: ${msg}`, 'warning', 5200);
      const hydroOnly = await fetchHydroFeatures(bounds);
      if (!hydroOnly.length) return { features: [], coreZones: [], hotspotSeeds: [] };
      return {
        features: hydroOnly,
        coreZones: buildCoreZonesFromSeeds(hydroOnly, windDir, depth),
        hotspotSeeds: hydroOnly
      };
    }
  }

  let features = detectAreaTerrainFeatures(grid, elevations, windDir, { skipFilter: true });
  const enhanceSensitivity = depth === 'deep' || features.length < 8;
  if (enhanceSensitivity) {
    const relaxed = detectAreaTerrainFeatures(grid, elevations, windDir, {
      promMajor: 4,
      promMicro: 1.5,
      slopeBench: 0.02,
      slopePinch: 0.08,
      slopeLeeMin: 0.04,
      slopeLeeMax: 0.32,
      skipFilter: true
    });
    features = mergeTerrainFeatures(features, relaxed, depth === 'deep' ? 60 : 80);
  }

  applyTerrainFeatureBoosts(features, {
    season: getSeasonProfile(),
    windDir
  });

  const baseSpacing = depth === 'deep' ? 110 : 140;
  features = filterTerrainFeaturesBySpacing(features, {
    minSpacing: baseSpacing,
    typeSpacing: {
      saddle: 90,
      pinch: 90,
      leeward_pocket: 90,
      bench: 110,
      micro_nob: 95,
      thermal_drain: 95,
      ridge_point: 120,
      creek_line: 120,
      water_edge: 120
    }
  });
  const hydroFeatures = await fetchHydroFeatures(bounds);
  if (hydroFeatures.length) {
    hydroFeatures.forEach((feat) => {
      const tooClose = features.some((x) => x.latlng.distanceTo(feat.latlng) < 140);
      if (!tooClose) features.push(feat);
    });
  }
  if (!features.length) {
    const microSignals = buildTerrainSignalCandidates(grid, elevations, {
      minSpacing: 110,
      maxCount: depth === 'deep' ? 16 : 10,
      minVariance: depth === 'deep' ? 0.4 : 0.6
    });
    if (!microSignals.length) return { features: [], coreZones: [], hotspotSeeds: [] };
    features = microSignals;
  }

  const seedFeatures = features.slice();
  const coreZones = buildCoreZonesFromSeeds(seedFeatures, windDir, depth);

  return { features, coreZones, hotspotSeeds: seedFeatures };
}


// ===================================================================
//   Saved Areas & Properties
// ===================================================================
function saveHuntAreas() {
  try {
    localStorage.setItem(HUNT_AREAS_STORAGE_KEY, JSON.stringify(savedHuntAreas));
  } catch {
    // Ignore storage failures.
  }
}

function renderSavedHuntAreas() {
  const list = document.getElementById('savedHuntAreasList');
  if (!list) {
    renderSavedPropertiesSelect();
    return;
  }

  if (!savedHuntAreas.length) {
    list.innerHTML = '<div style="font-size:12px;color:#aaa;">No saved areas yet.</div>';
    return;
  }

  list.innerHTML = savedHuntAreas.map((item) => {
    const label = item.kind === 'pin' ? 'Pin' : 'Area';
    return `
      <div class="ht-saved-item">
        <div><strong>${item.name}</strong><span style="color:#222;"> • ${label}</span></div>
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

function buildLayerFromSavedArea(item) {
  if (!item) return null;
  let layer = null;
  if (item.areaType === 'radius') {
    const center = Array.isArray(item.center)
      ? item.center
      : (item.center && typeof item.center === 'object')
        ? [item.center.lat, item.center.lng]
        : null;
    if (center) {
      layer = L.circle(center, {
        radius: item.radius,
        color: '#FFD700',
        weight: 2,
        fillColor: '#FFD700',
        fillOpacity: 0.12
      }).addTo(map);
    }
  } else if (item.latlngs) {
    const ring = item.latlngs
      .map((point) => {
        if (Array.isArray(point)) return point;
        if (point && typeof point === 'object') return [point.lat, point.lng];
        return null;
      })
      .filter(Boolean);
    if (ring.length >= 3) {
      layer = L.polygon(ring, {
        color: '#FFD700',
        weight: 2,
        fillColor: '#FFD700',
        fillOpacity: 0.12
      }).addTo(map);
    }
  } else if (item.bounds) {
    const bounds = item.bounds;
    const north = bounds.north ?? bounds.n;
    const south = bounds.south ?? bounds.s;
    const east = bounds.east ?? bounds.e;
    const west = bounds.west ?? bounds.w;
    if (Number.isFinite(north) && Number.isFinite(south) && Number.isFinite(east) && Number.isFinite(west)) {
      layer = L.rectangle([[south, west], [north, east]], {
        color: '#FFD700',
        weight: 2,
        fillColor: '#FFD700',
        fillOpacity: 0.12
      }).addTo(map);
    }
  }
  return layer;
}

function buildLayerFromSavedPlan(plan) {
  if (!plan) return null;
  const planArea = {
    areaType: plan.areaType,
    center: plan.areaCenter,
    radius: plan.areaRadius,
    latlngs: plan.areaLatlngs,
    bounds: plan.bounds
  };
  return buildLayerFromSavedArea(planArea);
}

function previewSavedHuntArea(item, meta) {
  if (!item) return;
  hideDrawHelper();
  hideSavedHuntBar();
  clearSelectedArea();
  const layer = buildLayerFromSavedArea(item);
  if (!layer) {
    showNotice('Saved area could not be loaded. Please re-save it.', 'warning', 3600);
    return;
  }
  setSelectedArea(layer, item.areaType || 'polygon', { autoLock: false });
  try { layer.bringToFront(); } catch {}
  if (layer.getBounds) {
    map.fitBounds(layer.getBounds(), { padding: [40, 40] });
  }
  savedHuntPreview = meta || null;
  showSavedHuntBar(isMushroomModule() ? 'Saved forage loaded. Choose next step.' : 'Saved hunt loaded. Choose next step.');
}

function renderSavedPropertiesSelect() {
  if (isFlyModule()) return;
  const select = document.getElementById('savedPropertySelect');
  if (!select) return;

  const areas = savedHuntAreas.filter((item) => {
    if (item.kind === 'pin') return false;
    return Boolean(item.areaType || item.latlngs || item.center);
  });
  const plans = savedHuntPlans.filter((plan) => plan && plan.id);
  if (!areas.length && !plans.length) {
    select.innerHTML = `<option value="">${isMushroomModule() ? 'No saved forages or areas yet' : 'No saved hunts or areas yet'}</option>`;
    select.disabled = true;
    return;
  }

  select.disabled = false;
  const options = [`<option value="">${isMushroomModule() ? 'Select forage or area' : 'Select hunt or area'}</option>`];
  if (areas.length) {
    options.push('<optgroup label="Saved Areas">');
    options.push(...areas.map((item) => `<option value="area:${item.id}">${item.name}</option>`));
    options.push('</optgroup>');
  }
  if (plans.length) {
    options.push(`<optgroup label="${isMushroomModule() ? 'Saved Forages' : 'Saved Hunts'}">`);
    options.push(...plans.map((plan) => {
      const when = plan.timestamp ? new Date(plan.timestamp).toLocaleDateString() : '';
      const label = when ? `${plan.name} • ${when}` : plan.name;
      return `<option value="plan:${plan.id}">${label}</option>`;
    }));
    options.push('</optgroup>');
  }
  select.innerHTML = options.join('');
}

function parseSavedSelectValue(rawValue) {
  if (!rawValue) return null;
  if (!rawValue.includes(':')) return { kind: 'area', id: rawValue };
  const parts = rawValue.split(':');
  return { kind: parts[0] || 'area', id: parts.slice(1).join(':') };
}

function handleSavedSelection(choice, selectEl) {
  if (!choice || !choice.id) return;

  const applySelection = () => {
    fieldCommandFlowActive = true;
    openFieldCommandTray();
    if (choice.kind === 'plan') {
      const plan = savedHuntPlans.find((entry) => entry.id === choice.id);
      if (!plan) return;
      previewSavedHuntArea({
        areaType: plan.areaType,
        center: plan.areaCenter,
        radius: plan.areaRadius,
        latlngs: plan.areaLatlngs,
        bounds: plan.bounds
      }, {
        kind: 'plan',
        id: plan.id,
        name: plan.name
      });
      setFieldCommandStep(1);
      return;
    }
    applySavedHuntArea(choice.id);
    setFieldCommandStep(1);
  };

  const huntActive = document.body.classList.contains('ht-hunt-active')
    || hotspotMarkers.length
    || lastPlanSnapshot;

  if (huntActive) {
    const isMush = isMushroomModule();
    openChoiceModal({
      title: isMush ? 'Start a new forage?' : 'Start a new hunt?',
      message: isMush ? 'You already have an active forage. Starting a new one clears the current plan and pins.' : 'You already have an active hunt. Starting a new hunt clears the current plan and pins.',
      primaryLabel: isMush ? 'Start New Forage' : 'Start New Hunt',
      secondaryLabel: isMush ? 'Continue Foraging' : 'Continue Hunt',
      onPrimary: () => {
        resetActiveHuntState();
        applySelection();
      },
      onSecondary: () => {
        if (selectEl) selectEl.value = '';
      }
    });
    return;
  }

  applySelection();
}

window.loadSavedSelectionFromTray = function() {
  const select = document.getElementById('savedPropertySelect');
  if (!select) return;
  const choice = parseSavedSelectValue(select.value);
  if (!choice) {
    showNotice(isMushroomModule() ? 'Select a saved area first.' : 'Select a saved hunt first.', 'warning', 3200);
    return;
  }
  handleSavedSelection(choice, select);
};

window.deleteSelectedSavedHunt = function() {
  const select = document.getElementById('savedPropertySelect');
  if (!select) return;
  const choice = parseSavedSelectValue(select.value);
  if (!choice || choice.kind !== 'plan') {
    showNotice(isMushroomModule() ? 'Select a saved area to delete.' : 'Select a saved hunt to delete.', 'warning', 3200);
    return;
  }
  const plan = savedHuntPlans.find((entry) => entry.id === choice.id);
  const planName = plan?.name || (isMushroomModule() ? 'this forage' : 'this hunt');
  openChoiceModal({
    title: isMushroomModule() ? 'Delete saved forage?' : 'Delete saved hunt?',
    message: `This will permanently remove ${planName}.`,
    primaryLabel: isMushroomModule() ? 'Delete Forage' : 'Delete Hunt',
    secondaryLabel: 'Cancel',
    onPrimary: () => {
      removeSavedHuntPlan(choice.id);
      select.value = '';
    }
  });
};

window.clearAllSavedHuntsAndAreas = function() {
  openChoiceModal({
    title: isMushroomModule() ? 'Clear all saved forages + areas?' : 'Clear all saved hunts + areas?',
    message: isMushroomModule() ? 'This will permanently delete every saved forage and saved area on this device.' : 'This will permanently delete every saved hunt and saved area on this device.',
    primaryLabel: 'Clear All',
    secondaryLabel: 'Cancel',
    onPrimary: () => {
      savedHuntAreas = [];
      savedHuntPlans = [];
      saveHuntAreas();
      saveHuntPlans();
      renderSavedHuntAreas();
      renderSavedPlansList();
      renderSavedPropertiesSelect();
      const select = document.getElementById('savedPropertySelect');
      if (select) select.value = '';
      showNotice(isMushroomModule() ? 'All saved forages and areas cleared.' : 'All saved hunts and areas cleared.', 'success', 3200);
    }
  });
};

function applySavedHuntArea(id) {
  const item = savedHuntAreas.find((entry) => entry.id === id);
  if (!item) return;

  if (item.kind === 'pin') {
    const latlng = L.latLng(item.coords[0], item.coords[1]);
    L.marker(latlng, { icon: getBrandedPinIcon('S') }).addTo(map);
    map.setView(latlng, 15);
    // showNotice(`Loaded pin: ${item.name}`, 'success', 3200);
    return;
  }

  previewSavedHuntArea(item, { kind: 'area', id: item.id, name: item.name });
  // showNotice(`Loaded area: ${item.name}`, 'success', 3200);
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
    title: isMushroomModule() ? 'Save Forage Area' : 'Save Hunt Area',
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
      showNotice(isMushroomModule() ? 'Forage area saved.' : 'Hunt area saved.', 'success', 3200);
    }
  });
};

window.startSavePin = function() {
  mapClickMode = 'save-pin';
  showNotice('Click the map to drop a saved pin.', 'info', 3200);
};


// ===================================================================
//   Drawing Tools & Shapes
// ===================================================================
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
  setMdcLandLabelsSuppressed(false);
  updateLockInAreaState(false);
  updateSaveAreaState(false);
  setLockInAreaStatus('', null);
}

function resetActiveHuntState() {
  stopPlanLoadingTicker();
  closeStrategyPanel();
  clearHunt();
  clearSelectedArea();
  pendingFieldCommandAdvance = false;
  fieldCommandFlowActive = false;
  huntPlanLive = false;
  huntPlanPreviewing = false;
  lastPlanSnapshot = null;
  document.body.classList.remove('ht-hunt-active');
}

function clearRadiusDraft() {
  if (radiusDraftMoveHandler) {
    try { 
      map?.off('mousemove', radiusDraftMoveHandler);
      map?.off('touchmove', radiusDraftMoveHandler); 
    } catch {}
    radiusDraftMoveHandler = null;
  }
  if (radiusDraftCircle) {
    try { map?.removeLayer(radiusDraftCircle); } catch {}
    radiusDraftCircle = null;
  }
  if (radiusDragBubble) {
    try { map?.removeLayer(radiusDragBubble); } catch {}
    radiusDragBubble = null;
  }
  if (radiusDraftCenterMarker) {
    try { map?.removeLayer(radiusDraftCenterMarker); } catch {}
    radiusDraftCenterMarker = null;
  }
  clearRadiusDragHandles();
  draftHandleDragging = false;
  radiusDraftCenter = null;
}

function clearRectDraft() {
  if (rectDraftMoveHandler) {
    try { 
      map?.off('mousemove', rectDraftMoveHandler);
      map?.off('touchmove', rectDraftMoveHandler); 
    } catch {}
    rectDraftMoveHandler = null;
  }
  if (rectDraftRect) {
    try { map?.removeLayer(rectDraftRect); } catch {}
    rectDraftRect = null;
  }
  if (rectDragBubble) {
    try { map?.removeLayer(rectDragBubble); } catch {}
    rectDragBubble = null;
  }
  if (rectDraftCenterMarker) {
    try { map?.removeLayer(rectDraftCenterMarker); } catch {}
    rectDraftCenterMarker = null;
  }
  clearRectDragHandles();
  draftHandleDragging = false;
  rectDraftCenter = null;
}

function createDragBubble(latlng) {
  if (!map || !latlng) return null;
  return L.circleMarker(latlng, {
    radius: 8,
    color: '#ffd24d',
    weight: 2,
    fillColor: '#111',
    fillOpacity: 0.7,
    className: 'ht-drag-bubble'
  }).addTo(map);
}

function createCenterMarker(latlng) {
  if (!map || !latlng) return null;
  return L.circleMarker(latlng, {
    radius: 5,
    color: '#ffd24d',
    weight: 2,
    fillColor: '#111',
    fillOpacity: 0.9,
    className: 'ht-draft-center'
  }).addTo(map);
}

function getLatLngOffsetMeters(center, latlng) {
  const c = L.latLng(center);
  const t = L.latLng(latlng);
  const dy = (t.lat - c.lat) * 111111;
  const dx = (t.lng - c.lng) * 111111 * Math.cos((c.lat * Math.PI) / 180);
  return { dx, dy };
}

function createDragHandle(latlng) {
  if (!map || !latlng) return null;
  
  // Larger touch targets for mobile
  const isMobile = 'ontouchstart' in window;
  const size = isMobile ? 28 : 18;
  
  const marker = L.marker(latlng, {
    draggable: true,
    icon: L.divIcon({
      className: 'ht-drag-handle',
      html: '<div class="ht-drag-handle-core"></div>',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    })
  }).addTo(map);
  
  marker.on('dragstart', () => {
    draftHandleDragging = true;
    // Haptic feedback on drag start
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  });
  marker.on('dragend', () => {
    setTimeout(() => {
      draftHandleDragging = false;
    }, 120);
  });
  marker.on('click', (evt) => {
    if (evt && evt.originalEvent) L.DomEvent.stopPropagation(evt.originalEvent);
  });
  return marker;
}

function clearRadiusDragHandles() {
  if (!radiusDragHandles.length) return;
  radiusDragHandles.forEach((handle) => {
    try { map.removeLayer(handle); } catch {}
  });
  radiusDragHandles = [];
}

function clearRectDragHandles() {
  if (!rectDragHandles.length) return;
  rectDragHandles.forEach((handle) => {
    try { map.removeLayer(handle); } catch {}
  });
  rectDragHandles = [];
}

function syncRadiusHandles() {
  if (!radiusDraftCenter || !radiusDraftCircle || !radiusDragHandles.length) return;
  const center = L.latLng(radiusDraftCenter);
  const radius = Math.max(DRAFT_HANDLE_MIN_METERS, radiusDraftCircle.getRadius());
  const positions = [
    offsetLatLngMeters(center, 0, radius),
    offsetLatLngMeters(center, radius, 0),
    offsetLatLngMeters(center, 0, -radius),
    offsetLatLngMeters(center, -radius, 0)
  ];
  radiusDragHandles.forEach((handle, idx) => {
    if (handle && positions[idx]) handle.setLatLng(positions[idx]);
  });
}

function syncRectHandles() {
  if (!rectDraftCenter || !rectDraftRect || rectDragHandles.length !== 4) return;
  const bounds = rectDraftRect.getBounds();
  const handles = [
    L.latLng(bounds.getNorth(), bounds.getEast()),
    L.latLng(bounds.getSouth(), bounds.getEast()),
    L.latLng(bounds.getSouth(), bounds.getWest()),
    L.latLng(bounds.getNorth(), bounds.getWest())
  ];
  rectDragHandles.forEach((handle, idx) => {
    if (handle && handles[idx]) handle.setLatLng(handles[idx]);
  });
}

function updateRadiusFromHandle(latlng) {
  if (!radiusDraftCenter || !radiusDraftCircle) return;
  const center = L.latLng(radiusDraftCenter);
  const meters = Math.max(DRAFT_HANDLE_MIN_METERS, center.distanceTo(latlng));
  radiusDraftCircle.setRadius(meters);
  if (radiusDragBubble) radiusDragBubble.setLatLng(latlng);
  syncRadiusHandles();
  updateDrawHelperPosition(latlng);
}

function updateRectFromHandle(latlng, axis) {
  if (!rectDraftCenter || !rectDraftRect) return;
  const center = L.latLng(rectDraftCenter);
  const boundsNow = rectDraftRect.getBounds();
  const currentHalfWidth = Math.max(
    DRAFT_HANDLE_MIN_METERS,
    Math.abs(getLatLngOffsetMeters(center, L.latLng(center.lat, boundsNow.getEast())).dx)
  );
  const currentHalfHeight = Math.max(
    DRAFT_HANDLE_MIN_METERS,
    Math.abs(getLatLngOffsetMeters(center, L.latLng(boundsNow.getNorth(), center.lng)).dy)
  );
  const offsets = getLatLngOffsetMeters(center, latlng);
  const nextHalfWidth = Math.max(DRAFT_HANDLE_MIN_METERS, Math.abs(offsets.dx));
  const nextHalfHeight = Math.max(DRAFT_HANDLE_MIN_METERS, Math.abs(offsets.dy));
  let halfWidth = axis === 'w' ? nextHalfWidth : currentHalfWidth;
  let halfHeight = axis === 'h' ? nextHalfHeight : currentHalfHeight;
  if (axis === 'both') {
    halfWidth = nextHalfWidth;
    halfHeight = nextHalfHeight;
  }
  const bounds = L.latLngBounds(
    offsetLatLngMeters(center, -halfWidth, -halfHeight),
    offsetLatLngMeters(center, halfWidth, halfHeight)
  );
  rectDraftRect.setBounds(bounds);
  if (rectDragBubble) rectDragBubble.setLatLng(latlng);
  syncRectHandles();
  updateDrawHelperPosition(latlng);
}

function createRadiusHandles() {
  clearRadiusDragHandles();
  const handles = [
    createDragHandle(radiusDraftCenter),
    createDragHandle(radiusDraftCenter),
    createDragHandle(radiusDraftCenter),
    createDragHandle(radiusDraftCenter)
  ];
  radiusDragHandles = handles.filter(Boolean);
  radiusDragHandles.forEach((handle) => {
    handle.on('drag', (evt) => {
      if (!evt || !evt.latlng) return;
      updateRadiusFromHandle(evt.latlng);
    });
  });
  syncRadiusHandles();
}

function createRectHandles() {
  clearRectDragHandles();
  const handles = [
    createDragHandle(rectDraftCenter),
    createDragHandle(rectDraftCenter),
    createDragHandle(rectDraftCenter),
    createDragHandle(rectDraftCenter)
  ];
  rectDragHandles = handles.filter(Boolean);
  const axes = ['both', 'both', 'both', 'both'];
  rectDragHandles.forEach((handle, idx) => {
    handle.on('drag', (evt) => {
      if (!evt || !evt.latlng) return;
      updateRectFromHandle(evt.latlng, axes[idx]);
    });
  });
  syncRectHandles();
}

function showPolygonGuide(latlng) {
  if (!map || !latlng) return;
  if (!polygonGuideMarker) {
    polygonGuideMarker = L.marker(latlng, {
      interactive: false,
      icon: L.divIcon({
        className: 'ht-draw-guide',
        html: '<div class="ht-draw-guide-dot"></div><div class="ht-draw-guide-label">Tap first point to finish</div>'
      })
    }).addTo(map);
  } else {
    polygonGuideMarker.setLatLng(latlng);
  }
}

function clearPolygonGuide() {
  if (!polygonGuideMarker) return;
  try { map.removeLayer(polygonGuideMarker); } catch {}
  polygonGuideMarker = null;
}

function startRectDraft(centerLatLng) {
  clearRectDraft();
  if (!centerLatLng) return;
  rectDraftCenter = L.latLng(centerLatLng);
  showStartPulse(rectDraftCenter);
  rectDragBubble = createDragBubble(rectDraftCenter);
  rectDraftCenterMarker = createCenterMarker(rectDraftCenter);
  const bounds = L.latLngBounds(
    offsetLatLngMeters(rectDraftCenter, -DRAFT_START_RECT_HALF_METERS, -DRAFT_START_RECT_HALF_METERS),
    offsetLatLngMeters(rectDraftCenter, DRAFT_START_RECT_HALF_METERS, DRAFT_START_RECT_HALF_METERS)
  );
  rectDraftRect = L.rectangle(bounds, {
    color: '#FFD700',
    weight: 2,
    fillColor: '#FFD700',
    fillOpacity: 0.12
  }).addTo(map);
  createRectHandles();
  updateDrawHelperLockState();
  updateDrawHelperPosition(rectDraftCenter);
}

function startRadiusDraft(centerLatLng) {
  clearRadiusDraft();
  if (centerLatLng) {
    radiusDraftCenter = L.latLng(centerLatLng);
    showStartPulse(radiusDraftCenter);
    radiusDragBubble = createDragBubble(radiusDraftCenter);
    radiusDraftCenterMarker = createCenterMarker(radiusDraftCenter);
    radiusDraftCircle = L.circle(radiusDraftCenter, {
      radius: DRAFT_START_RADIUS_METERS,
      color: '#FFD700',
      weight: 2,
      fillColor: '#FFD700',
      fillOpacity: 0.15
    }).addTo(map);
  }
  createRadiusHandles();
  updateDrawHelperLockState();
  updateDrawHelperPosition(radiusDraftCenter);
}

function handleMapClick(e) {
  if (!mapClickMode) return;

  if (mapClickMode === 'route-start') {
    if (e && e.latlng) {
      setStartPoint(e.latlng);
      if (isFlyModule()) {
        clearEndPointSelection();
        mapClickMode = 'route-end';
        setRouteMapSelectionActive(true);
        showNotice('Parking set. Tap the map for entry point.', 'info', 5200);
        return;
      }
      setEndPoint(e.latlng);
    }
    mapClickMode = null;
    setRouteMapSelectionActive(false);
    if (!isFlyModule()) {
      window.buildRoutePreview();
      setFieldCommandStep(3);
      showNotice('Starting point set. Route ready. Tap LET\'S GO to launch.', 'success', 5200);
    }
    return;
  }

  if (mapClickMode === 'route-end') {
    if (e && e.latlng) {
      setEndPoint(e.latlng);
    }
    mapClickMode = null;
    setRouteMapSelectionActive(false);
    showNotice('Entry point set. Tap LET\'S FISH to continue.', 'success', 4200);
    if (fieldCommandFlowActive) {
      setFieldCommandStep(3);
    }
    return;
  }


  // Define focusPinnedFlyWater at module scope on first use  
  if (typeof window.focusPinnedFlyWater === 'undefined') {
    window.focusPinnedFlyWater = function(id) {
      if (!isFlyModule()) return;
      const water = getFlyWaterById(id) || getSavedTroutWaterById(id);
      if (!water) return;
      focusFlyWater(water);
    };
  }
  if (mapClickMode === 'pick-location') {
    mapClickMode = null;
    if (e && e.latlng) {
      map.setView(e.latlng, Math.max(map.getZoom(), 12));
    }
    setFieldCommandStep(1);
    showNotice(isMushroomModule() ? 'Location set. Define your forage area.' : 'Location set. Define your hunt area.', 'success', 3200);
    return;
  }

  if (mapClickMode === 'radius-draw') {
    if (!radiusDraftCenter) {
      radiusDraftCenter = L.latLng(e.latlng);
      startRadiusDraft(radiusDraftCenter);
      showQuickHint('Drag the side bubbles to size the circle. Tap again to lock.', 1800);
      return;
    }

    if (radiusDraftCircle && !draftHandleDragging) {
      if (radiusDraftMoveHandler) {
        try { map.off('mousemove', radiusDraftMoveHandler); } catch {}
        try { map.off('touchmove', radiusDraftMoveHandler); } catch {}
        radiusDraftMoveHandler = null;
      }
      setSelectedArea(radiusDraftCircle, 'radius');
      const radiusMiles = radiusDraftCircle.getRadius() / 1609.34;
      radiusDraftCircle = null;
      radiusDraftCenter = null;
      if (radiusDragBubble) {
        try { map.removeLayer(radiusDragBubble); } catch {}
        radiusDragBubble = null;
      }
      if (radiusDraftCenterMarker) {
        try { map.removeLayer(radiusDraftCenterMarker); } catch {}
        radiusDraftCenterMarker = null;
      }
      clearRadiusDragHandles();
      mapClickMode = null;
      showSelectionNoticeOnce(`Radius set: ${radiusMiles.toFixed(2)} miles`, 'success', 3200);
      return;
    }
  }

  if (mapClickMode === 'rect-draw') {
    if (!rectDraftCenter) {
      rectDraftCenter = L.latLng(e.latlng);
      startRectDraft(rectDraftCenter);
      showQuickHint('Drag the corner handles to size the box. Tap again to lock.', 1800);
      return;
    }

    if (rectDraftRect && !draftHandleDragging) {
      if (rectDraftMoveHandler) {
        try { map.off('mousemove', rectDraftMoveHandler); } catch {}
        try { map.off('touchmove', rectDraftMoveHandler); } catch {}
        rectDraftMoveHandler = null;
      }
      setSelectedArea(rectDraftRect, 'boundary');
      rectDraftRect = null;
      rectDraftCenter = null;
      if (rectDragBubble) {
        try { map.removeLayer(rectDragBubble); } catch {}
        rectDragBubble = null;
      }
      if (rectDraftCenterMarker) {
        try { map.removeLayer(rectDraftCenterMarker); } catch {}
        rectDraftCenterMarker = null;
      }
      clearRectDragHandles();
      mapClickMode = null;
      showSelectionNoticeOnce('Rectangle set.', 'success', 3200);
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

  if (mapClickMode === 'deer-pin') {
    mapClickMode = null;
    openDeerPinModal({
      onSubmit: ({ type, confidence, notes }) => {
        const entry = {
          id: `deer_${Date.now()}`,
          type: 'deer_pin',
          coords: [e.latlng.lat, e.latlng.lng],
          signType: type,
          confidence,
          notes,
          timestamp: new Date().toISOString()
        };
        huntJournalEntries.unshift(entry);
        saveHuntJournal();
        registerDeerPinMarker(entry);
        showNotice(isMushroomModule() ? 'Forage pin logged.' : 'Deer pin logged.', 'success', 3200);
        queueLiveStrategyUpdate('deer-pin');
      }
    });
  }

  if (mapClickMode === 'turkey-pin') {
    mapClickMode = null;
    openTurkeyPinModal({
      onSubmit: ({ type, confidence, notes }) => {
        const entry = {
          id: `turkey_${Date.now()}`,
          type: 'turkey_pin',
          coords: [e.latlng.lat, e.latlng.lng],
          signType: type,
          confidence,
          notes,
          timestamp: new Date().toISOString()
        };
        huntJournalEntries.unshift(entry);
        saveHuntJournal();
        if (typeof window.registerTurkeyPinMarker === 'function') {
          window.registerTurkeyPinMarker(entry);
        } else {
          // Fallback: use generic branded pin
          L.marker(e.latlng, { icon: getBrandedPinIcon('T') }).addTo(map);
        }
        showNotice('Turkey pin logged.', 'success', 3200);
        queueLiveStrategyUpdate('turkey-pin');
      }
    });
  }
}


// ===================================================================
//   Route Pin Selection
// ===================================================================
function setStartPoint(latlng) {
  startPoint = latlng;
  if (startPointMarker) map.removeLayer(startPointMarker);
  startPointMarker = L.marker(latlng, {
    icon: L.divIcon({
      html: '<div class="ht-route-pin ht-route-pin--start">START</div>',
      className: 'ht-route-pin-wrap',
      iconSize: [84, 32],
      iconAnchor: [42, 32]
    })
  }).addTo(map);
  updateRoutePinStatus();
}

function setEndPoint(latlng) {
  endPoint = latlng;
  if (endPointMarker) map.removeLayer(endPointMarker);
  endPointMarker = L.marker(latlng, {
    icon: L.divIcon({
      html: '<div class="ht-route-pin ht-route-pin--end">END</div>',
      className: 'ht-route-pin-wrap',
      iconSize: [84, 32],
      iconAnchor: [42, 32]
    })
  }).addTo(map);
  updateRoutePinStatus();
}

function clearStartPointSelection() {
  startPoint = null;
  if (startPointMarker) {
    map.removeLayer(startPointMarker);
    startPointMarker = null;
  }
  updateRoutePinStatus();
}

function clearEndPointSelection() {
  endPoint = null;
  if (endPointMarker) {
    map.removeLayer(endPointMarker);
    endPointMarker = null;
  }
  updateRoutePinStatus();
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
      shortLabel: `P${rank}`,
      coords
    };
  }).filter((item) => Array.isArray(item.coords) && item.coords.length === 2);
  return routePinOptions;
}

function normalizeLatLng(value) {
  if (!value) return null;
  if (value.lat !== undefined && value.lng !== undefined) return L.latLng(value);
  if (Array.isArray(value) && value.length >= 2) return L.latLng(value[0], value[1]);
  return null;
}

function isSameLatLng(a, b, toleranceMeters = 6) {
  if (!a || !b) return false;
  return L.latLng(a).distanceTo(L.latLng(b)) <= toleranceMeters;
}

function orderHotspotsByNearest(start, points, end) {
  const startLL = normalizeLatLng(start);
  const endLL = normalizeLatLng(end);
  const remaining = (Array.isArray(points) ? points : [])
    .map((p) => normalizeLatLng(p))
    .filter(Boolean)
    .filter((p) => !isSameLatLng(p, startLL))
    .filter((p) => !isSameLatLng(p, endLL));

  const ordered = [];
  let current = startLL || remaining[0] || null;
  if (!current) return ordered;

  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dist = current.distanceTo(remaining[i]);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    current = next;
  }

  if (endLL && !isSameLatLng(endLL, current)) ordered.push(endLL);
  return ordered;
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

function getRoutePinLabelForPoint(point) {
  const id = findRoutePinIdByPoint(point);
  const pin = findRoutePinById(id);
  return pin ? (pin.shortLabel || pin.label) : 'Custom';
}

function setRouteMapSelectionActive(isActive) {
  const btn = document.getElementById('routeMapSelectBtn');
  if (!btn) return;
  btn.classList.toggle('active', Boolean(isActive));
  if (isActive) {
    if (isFlyModule()) {
      btn.textContent = mapClickMode === 'route-end' ? 'Tap Entry On Map...' : 'Tap Parking On Map...';
    } else {
      btn.textContent = 'Select Starting Point On Map...';
    }
  } else {
    btn.textContent = isFlyModule() ? 'Pick Parking + Entry' : 'Select Starting Point On Map';
  }
}

function setRouteGpsActive(isActive) {
  const btn = document.getElementById('routeGpsBtn');
  if (!btn) return;
  btn.classList.toggle('active', Boolean(isActive));
  btn.setAttribute('aria-busy', isActive ? 'true' : 'false');
  if (isActive) {
    btn.textContent = 'Locating...';
  } else {
    btn.textContent = 'Start From My Location';
  }
}

function updateRoutePinStatus() {
  const el = document.getElementById('routePinStatus');
  if (el) {
    const startLabel = startPoint ? getRoutePinLabelForPoint(startPoint) : '--';
    el.textContent = `Start ${startLabel} • Loop back`;
  }
  if (fieldCommandFlowActive) {
    if (startPoint) {
      setFieldCommandStep(3);
    } else if (fieldCommandStep !== 2) {
      setFieldCommandStep(2);
    }
  }
}

function handleRoutePinSelection(marker) {
  if (!marker || typeof marker.getLatLng !== 'function') return;
  const latlng = marker.getLatLng();
  setStartPoint(latlng);
  // Route ends at the LAST pin (point-to-point mature buck travel pattern)
  // instead of looping back to start. End at highest-priority far pin.
  if (hotspotMarkers.length > 1) {
    const furthest = hotspotMarkers.reduce((far, m) => {
      const d = latlng.distanceTo(m.getLatLng());
      return d > far.dist ? { dist: d, ll: m.getLatLng() } : far;
    }, { dist: 0, ll: latlng });
    setEndPoint(furthest.ll);
  } else {
    setEndPoint(latlng);
  }
  routePinSelectionActive = false;
  routePinSelectionStep = null;
  const selectBtn = document.getElementById('routePinSelectBtn');
  if (selectBtn) {
    selectBtn.classList.remove('active');
    selectBtn.textContent = 'Select Start';
  }
  if (!isFlyModule()) {
    window.buildRoutePreview();
    setFieldCommandStep(3);
    showNotice('Starting point set. Route ready. Tap LET\'S GO to launch.', 'success', 5200);
  }
  const panel = document.getElementById('strategy-panel');
  if (fieldCommandFlowActive) {
    if (panel) {
      panel.style.display = 'none';
      setStrategyOpen(false);
    }
    if (!isFlyModule()) {
      setFieldCommandStep(3);
    }
    updateTrayToggleButton();
    return;
  }
  if (panel) {
    panel.style.display = 'block';
    setStrategyOpen(true);
    updateTrayToggleButton();
  }
}

window.beginRoutePinSelection = function() {
  window.beginRouteMapSelection();
};

window.beginRouteMapSelection = function() {
  if (!hotspotMarkers.length && !isFlyModule()) {
    showNotice(isMushroomModule() ? 'No pins yet. Build a forage plan first.' : 'No pins yet. Build a hunt plan first.', 'warning', 3600);
    return;
  }

  const panel = document.getElementById('strategy-panel');
  if (panel) {
    panel.style.display = 'none';
    setStrategyOpen(false);
    updateTrayToggleButton();
  }
  if (toolbarOpen) {
    window.toggleToolbar();
    updateTrayToggleButton();
  }

  if (routeLineGlow) map.removeLayer(routeLineGlow);
  if (routeLine) map.removeLayer(routeLine);
  if (routeLineFlow) map.removeLayer(routeLineFlow);
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);
  routeLineGlow = null;
  routeLine = null;
  routeLineFlow = null;
  startMarker = null;
  endMarker = null;

  clearStartPointSelection();
  clearEndPointSelection();
  updateRoutePinStatus();
  routePinSelectionActive = false;
  routePinSelectionStep = null;
  mapClickMode = 'route-start';
  setRouteMapSelectionActive(true);
  showNotice(isFlyModule() ? 'Tap the map for parking.' : 'Tap the map to set your starting point.', 'info', 5200);
};

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
  // End points are locked to the start point for loop routing.
  return;
};

function openRoutePinModal() {
  if (!routePinOptions.length) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const options = routePinOptions
    .map((opt) => `<option value="${opt.id}">${opt.label}</option>`)
    .join('');

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  const isFly = isFlyModule();
  modal.innerHTML = `
    <h3>${isFly ? 'Pick Parking + Entry' : 'Select Starting Point'}</h3>
    <div style="display:grid;gap:10px;">
      <label style="font-size:12px;color:#bbb;">${isFly ? 'Parking Pin' : 'Start Pin'}</label>
      <select id="routeStartPrompt" class="ht-select">${options}</select>
      ${isFly ? `
        <label style="font-size:12px;color:#bbb;">Entry Pin</label>
        <select id="routeEndPrompt" class="ht-select">${options}</select>
      ` : ''}
      <div style="font-size:12px;color:#aaa;">${isFly ? 'Route order follows the nearest-neighbor path.' : 'Route loops back to the start.'}</div>
    </div>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn primary" id="routePinsConfirm">Continue</button>
    </div>
  `;

  const closeModal = () => backdrop.remove();
  const startSelect = modal.querySelector('#routeStartPrompt');
  const endSelect = modal.querySelector('#routeEndPrompt');
  if (startSelect && routePinOptions.length) {
    startSelect.value = routePinOptions[0].id;
  }
  if (endSelect && routePinOptions.length) {
    endSelect.value = routePinOptions[routePinOptions.length - 1].id;
  }
  modal.querySelector('#routePinsConfirm')?.addEventListener('click', () => {
    const startId = startSelect?.value || '';
    const endId = endSelect?.value || '';
    if (startId) window.setRouteStartFromPin(startId);
    if (endId) window.setRouteEndFromPin(endId);
    closeModal();
  });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function getSelectedAreaBounds() {
  if (!selectedAreaLayer) return null;
  try {
    return selectedAreaLayer.getBounds?.() || null;
  } catch (error) {
    console.warn('getSelectedAreaBounds error:', error);
    return null;
  }
}

function isPointInSelectedArea(latlng) {
  if (!selectedAreaLayer || !latlng) return false;
  
  try {
    if (selectedAreaType === 'radius' && selectedAreaLayer.getLatLng) {
      const center = selectedAreaLayer.getLatLng();
      const radius = selectedAreaLayer.getRadius();
      if (!center || !radius) return false;
      return center.distanceTo(latlng) <= radius;
    }

    if (selectedAreaLayer instanceof L.Rectangle && selectedAreaLayer.getBounds) {
      const bounds = selectedAreaLayer.getBounds();
      return bounds ? bounds.contains(latlng) : false;
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
  } catch (error) {
    console.warn('isPointInSelectedArea error:', error);
    return false;
  }
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


// ===================================================================
//   UI Helpers & MDC Info Panel
// ===================================================================
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

function getHuntechLogoUrl() {
  const override = String(window.HUNTECH_LOGO_URL || '').trim();
  if (override) return override;
  if (isTurkeyModule()) return 'assets/turkey-logo.png';
  if (isMushroomModule()) return 'assets/mushroom-logo.png';
  return 'assets/huntech-logo.png';
}

function getHuntechLogoMarkup(className = 'ht-huntech-logo') {
  const url = getHuntechLogoUrl();
  if (!url) return '';
  return `<img src="${url}" alt="Huntech" class="${className}" />`;
}

function getMdcLogoMarkup() {
  const url = getMdcLogoUrl();
  if (!url) return '';
  return `<img src="${url}" alt="MDC" class="ht-mdc-logo" />`;
}

function getMdcActionIcon(type) {
  switch (type) {
    case 'regulations':
      return `
        <svg class="ht-mdc-action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <path d="M14 3v5h5" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <path d="M9 13h6M9 17h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;
    case 'summary':
      return `
        <svg class="ht-mdc-action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <path d="M12 10v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="12" cy="7.5" r="1" fill="currentColor"/>
        </svg>
      `;
    case 'map':
      return `
        <svg class="ht-mdc-action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 22s6-7.2 6-12a6 6 0 1 0-12 0c0 4.8 6 12 6 12z" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>
        </svg>
      `;
    case 'brochure':
      return `
        <svg class="ht-mdc-action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 4h10a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3V4z" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <path d="M8 6h8M8 10h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;
    default:
      return '';
  }
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

function ensureMdcInfoPanel() {
  if (mdcInfoPanel) return mdcInfoPanel;
  const panel = document.createElement('aside');
  panel.className = 'ht-mdc-panel';
  panel.innerHTML = `
    <div class="ht-mdc-panel-header">
      <div class="ht-mdc-panel-title">MDC Area Info</div>
      <div class="ht-mdc-panel-actions">
        <button class="ht-mdc-panel-collapse" type="button" onclick="dockMdcInfoPanel()" aria-label="Minimize">MIN</button>
        <button class="ht-mdc-panel-close" type="button" onclick="closeMdcInfoPanel()" aria-label="Close">X</button>
      </div>
    </div>
    <div class="ht-mdc-panel-body"></div>
  `;
  ['click', 'mousedown', 'touchstart', 'pointerdown'].forEach((evt) => {
    panel.addEventListener(evt, (event) => {
      event.stopPropagation();
    });
  });
  document.body.appendChild(panel);
  mdcInfoPanel = panel;
  return panel;
}

function ensureMdcInfoDock() {
  if (mdcInfoDock) return mdcInfoDock;
  const dock = document.createElement('button');
  dock.className = 'ht-mdc-panel-dock';
  dock.type = 'button';
  dock.textContent = 'MDC INFO';
  ['click', 'mousedown', 'touchstart', 'pointerdown'].forEach((evt) => {
    dock.addEventListener(evt, (event) => {
      event.stopPropagation();
    });
  });
  dock.addEventListener('click', () => {
    restoreMdcInfoPanel();
  });
  dock.style.display = 'none';
  document.body.appendChild(dock);
  mdcInfoDock = dock;
  return dock;
}

function openMdcInfoPanel(bodyHtml) {
  const panel = ensureMdcInfoPanel();
  const dock = ensureMdcInfoDock();
  const body = panel.querySelector('.ht-mdc-panel-body');
  if (body) body.innerHTML = bodyHtml || '';
  mdcInfoPanelLastHtml = bodyHtml || '';
  panel.classList.add('open');
  if (dock) dock.style.display = 'none';
}

function closeMdcInfoPanel() {
  if (!mdcInfoPanel) return;
  mdcInfoPanel.classList.remove('open');
  if (mdcInfoDock) mdcInfoDock.style.display = 'none';
}

function dockMdcInfoPanel() {
  if (!mdcInfoPanel) return;
  if (!mdcInfoPanelLastHtml) {
    mdcInfoPanel.classList.remove('open');
    return;
  }
  mdcInfoPanel.classList.remove('open');
  const dock = ensureMdcInfoDock();
  if (dock) dock.style.display = 'inline-flex';
}

function restoreMdcInfoPanel() {
  if (!mdcInfoPanelLastHtml) return;
  openMdcInfoPanel(mdcInfoPanelLastHtml);
}

window.closeMdcInfoPanel = closeMdcInfoPanel;
window.dockMdcInfoPanel = dockMdcInfoPanel;
window.restoreMdcInfoPanel = restoreMdcInfoPanel;

function ensureEducationTile() {
  if (educationTile) return educationTile;
  educationTile = document.createElement('div');
  educationTile.id = 'education-tile';
  educationTile.style.cssText = 'position:fixed;left:20px;bottom:20px;z-index:20000;display:none;pointer-events:auto;touch-action:auto;';
  ['click', 'mousedown', 'touchstart', 'pointerdown'].forEach((evt) => {
    educationTile.addEventListener(evt, (event) => {
      event.stopPropagation();
    });
  });
  document.body.appendChild(educationTile);
  return educationTile;
}

function normalizeEducationText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildEducationList(items, usedSet) {
  const list = Array.isArray(items) ? items : [];
  const out = [];
  list.forEach((item) => {
    const norm = normalizeEducationText(item);
    if (!norm || usedSet.has(norm)) return;
    usedSet.add(norm);
    out.push(item);
  });
  return out;
}

// ===================================================================
//   Tree Visual Identification SVG Icons
// ===================================================================
function getTreeIdSvg(treeName) {
  const name = String(treeName || '').toLowerCase();
  // Simplified silhouette SVGs for tree identification cards
  if (name.includes('elm')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V22" stroke="#8B7355" stroke-width="2.5"/><path d="M20 22Q10 20 8 12Q7 6 14 4Q17 3 20 5Q23 3 26 4Q33 6 32 12Q30 20 20 22Z" fill="#6B8E23" opacity=".85"/><path d="M15 18Q12 16 14 10" stroke="#556B2F" stroke-width=".5" fill="none" opacity=".5"/></svg>';
  if (name.includes('ash')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V20" stroke="#8B7355" stroke-width="2.5"/><path d="M20 20Q12 18 10 12Q9 6 16 5Q18 4 20 6Q22 4 24 5Q31 6 30 12Q28 18 20 20Z" fill="#6B8E23" opacity=".85"/><path d="M16 8L14 5M20 7L20 3M24 8L26 5" stroke="#556B2F" stroke-width=".6" fill="none" opacity=".4"/></svg>';
  if (name.includes('tulip') || name.includes('poplar')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V18" stroke="#8B7355" stroke-width="2.5"/><path d="M20 18Q14 16 13 10Q12 4 17 3Q19 2 20 4Q21 2 23 3Q28 4 27 10Q26 16 20 18Z" fill="#228B22" opacity=".85"/><path d="M18 10Q20 8 22 10" stroke="#006400" stroke-width=".5" fill="none"/></svg>';
  if (name.includes('sycamore')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V20" stroke="#D2B48C" stroke-width="3"/><path d="M20 20Q8 18 6 10Q5 2 20 4Q35 2 34 10Q32 18 20 20Z" fill="#8FBC8F" opacity=".85"/><rect x="18" y="28" width="4" height="5" rx="1" fill="#F5F5DC" opacity=".5"/></svg>';
  if (name.includes('cottonwood')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V20" stroke="#8B7355" stroke-width="3"/><path d="M20 20Q6 16 8 8Q10 2 20 4Q30 2 32 8Q34 16 20 20Z" fill="#9ACD32" opacity=".85"/><circle cx="16" cy="10" r="1" fill="#fff" opacity=".3"/><circle cx="24" cy="11" r="1" fill="#fff" opacity=".3"/></svg>';
  if (name.includes('white oak') || name.includes('oak')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V22" stroke="#8B4513" stroke-width="3"/><path d="M20 22Q6 20 5 10Q4 2 20 4Q36 2 35 10Q34 20 20 22Z" fill="#556B2F" opacity=".85"/><path d="M12 12Q14 8 16 12M24 11Q26 7 28 11" stroke="#2F4F2F" stroke-width=".6" fill="none" opacity=".5"/></svg>';
  if (name.includes('hickory')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V20" stroke="#8B7355" stroke-width="2.5"/><path d="M18 22L14 30M22 22L26 30" stroke="#8B7355" stroke-width="1" opacity=".5"/><path d="M20 20Q12 18 11 10Q10 4 20 4Q30 4 29 10Q28 18 20 20Z" fill="#6B8E23" opacity=".85"/><path d="M17 26V20M23 26V20" stroke="#6B4513" stroke-width=".5" opacity=".4"/></svg>';
  if (name.includes('hackberry')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V22" stroke="#808080" stroke-width="2.5"/><path d="M20 22Q10 20 9 12Q8 6 20 5Q32 6 31 12Q30 20 20 22Z" fill="#7BA05B" opacity=".85"/><circle cx="17" cy="30" r=".8" fill="#808080" opacity=".6"/><circle cx="20" cy="32" r=".8" fill="#808080" opacity=".6"/><circle cx="23" cy="30" r=".8" fill="#808080" opacity=".6"/></svg>';
  if (name.includes('silver maple') || name.includes('maple')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V20" stroke="#A0522D" stroke-width="2.5"/><path d="M20 4L24 10L28 8L26 14L32 14L26 18L20 20L14 18L8 14L14 14L12 8L16 10Z" fill="#228B22" opacity=".85"/></svg>';
  if (name.includes('box elder')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V22" stroke="#8B8B55" stroke-width="2"/><path d="M16 22L12 30M24 22L28 30" stroke="#8B8B55" stroke-width=".8" opacity=".4"/><path d="M20 22Q10 20 10 12Q10 4 20 4Q30 4 30 12Q30 20 20 22Z" fill="#7CFC00" opacity=".7"/></svg>';
  if (name.includes('pawpaw')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V24" stroke="#8B7355" stroke-width="2"/><ellipse cx="14" cy="16" rx="6" ry="10" fill="#228B22" opacity=".75" transform="rotate(-15 14 16)"/><ellipse cx="26" cy="16" rx="6" ry="10" fill="#228B22" opacity=".75" transform="rotate(15 26 16)"/><ellipse cx="20" cy="14" rx="5" ry="10" fill="#2E8B57" opacity=".8"/></svg>';
  if (name.includes('willow')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V18" stroke="#8B7355" stroke-width="2.5"/><path d="M20 18Q12 6 8 14Q4 22 10 28" stroke="#556B2F" stroke-width="1.5" fill="none" opacity=".7"/><path d="M20 18Q28 6 32 14Q36 22 30 28" stroke="#556B2F" stroke-width="1.5" fill="none" opacity=".7"/><path d="M20 18Q16 10 12 18Q8 26 14 30" stroke="#6B8E23" stroke-width="1" fill="none" opacity=".5"/><path d="M20 18Q24 10 28 18Q32 26 26 30" stroke="#6B8E23" stroke-width="1" fill="none" opacity=".5"/></svg>';
  if (name.includes('apple')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V22" stroke="#5C4033" stroke-width="3"/><path d="M20 22Q8 20 6 12Q5 4 20 5Q35 4 34 12Q32 20 20 22Z" fill="#556B2F" opacity=".85"/><circle cx="15" cy="14" r="2" fill="#C41E3A" opacity=".7"/><circle cx="25" cy="12" r="2" fill="#C41E3A" opacity=".7"/></svg>';
  if (name.includes('cherry')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V20" stroke="#5C3317" stroke-width="2.5"/><path d="M20 20Q10 18 9 10Q8 4 20 4Q32 4 31 10Q30 18 20 20Z" fill="#355E3B" opacity=".85"/><circle cx="16" cy="12" r="1.5" fill="#8B0000" opacity=".7"/><circle cx="24" cy="13" r="1.5" fill="#8B0000" opacity=".7"/></svg>';
  if (name.includes('fire') || name.includes('burn') || name.includes('char')) return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V18" stroke="#333" stroke-width="3"/><path d="M16 18L14 8M20 18V6M24 18L26 8" stroke="#555" stroke-width="1.5" stroke-linecap="round"/><path d="M20 38Q14 34 16 30Q18 26 20 28Q22 26 24 30Q26 34 20 38Z" fill="#D4642A" opacity=".7"/></svg>';
  // Generic tree fallback
  return '<svg viewBox="0 0 40 40" class="ht-tree-svg"><path d="M20 38V20" stroke="#8B7355" stroke-width="2.5"/><path d="M20 20Q10 18 9 10Q8 4 20 4Q32 4 31 10Q30 18 20 20Z" fill="#6B8E23" opacity=".85"/></svg>';
}

// ===================================================================
//   Camera-Based Tree / Leaf Identification
// ===================================================================
window.openTreeIdCamera = function() {
  // Create camera overlay
  let overlay = document.getElementById('htTreeIdOverlay');
  if (overlay) { overlay.remove(); }

  overlay = document.createElement('div');
  overlay.id = 'htTreeIdOverlay';
  overlay.className = 'ht-tree-camera-overlay';
  overlay.innerHTML = `
    <div class="ht-tree-camera-panel">
      <div class="ht-tree-camera-header">
        <span>\uD83D\uDCF7 Tree / Leaf Identifier</span>
        <button class="ht-tree-camera-close" onclick="window.closeTreeIdCamera()">\u2715</button>
      </div>
      <div class="ht-tree-camera-body">
        <div class="ht-tree-camera-preview" id="htTreeCameraPreview">
          <video id="htTreeCameraVideo" autoplay playsinline muted></video>
          <canvas id="htTreeCameraCanvas" style="display:none;"></canvas>
        </div>
        <div class="ht-tree-camera-instructions">
          <p>Point your camera at a <strong>tree trunk</strong>, <strong>bark</strong>, or <strong>leaves</strong> and tap <em>Capture</em>.</p>
          <p class="ht-tree-camera-hint">For best results, fill the frame with bark texture or a single leaf.</p>
        </div>
        <div class="ht-tree-camera-actions">
          <button class="ht-tree-camera-btn ht-tree-camera-btn--capture" id="htTreeCaptureBtn" onclick="window.captureTreeImage()">\uD83D\uDCF7 Capture</button>
          <button class="ht-tree-camera-btn ht-tree-camera-btn--upload" onclick="window.uploadTreeImage()">\uD83D\uDCC1 Upload Photo</button>
        </div>
        <input type="file" id="htTreeFileInput" accept="image/*" capture="environment" style="display:none;" onchange="window.handleTreeFileSelect(event)">
        <div class="ht-tree-camera-result" id="htTreeResult" style="display:none;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Start camera stream
  startTreeCameraStream();
};

async function startTreeCameraStream() {
  const video = document.getElementById('htTreeCameraVideo');
  if (!video) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } }
    });
    video.srcObject = stream;
    video.play();
  } catch (err) {
    console.warn('[TreeID] Camera not available:', err.message);
    const preview = document.getElementById('htTreeCameraPreview');
    if (preview) {
      preview.innerHTML = '<div class="ht-tree-camera-fallback">Camera unavailable. Use <strong>Upload Photo</strong> instead.</div>';
    }
  }
}

function stopTreeCameraStream() {
  const video = document.getElementById('htTreeCameraVideo');
  if (video?.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }
}

window.closeTreeIdCamera = function() {
  stopTreeCameraStream();
  const overlay = document.getElementById('htTreeIdOverlay');
  if (overlay) overlay.remove();
};

window.captureTreeImage = function() {
  const video = document.getElementById('htTreeCameraVideo');
  const canvas = document.getElementById('htTreeCameraCanvas');
  if (!video || !canvas) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    if (blob) identifyTreeFromImage(blob);
  }, 'image/jpeg', 0.85);
};

window.uploadTreeImage = function() {
  const input = document.getElementById('htTreeFileInput');
  if (input) input.click();
};

window.handleTreeFileSelect = function(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  identifyTreeFromImage(file);
};

async function identifyTreeFromImage(imageBlob) {
  const resultDiv = document.getElementById('htTreeResult');
  if (!resultDiv) return;
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = '<div class="ht-tree-camera-loading"><div class="ht-tree-camera-spinner"></div>Analyzing image\u2026</div>';

  try {
    // Convert image to base64 for local analysis
    const base64 = await blobToBase64(imageBlob);

    // Attempt cloud-based identification first
    const result = await identifyTreeCloud(base64);
    if (result) {
      renderTreeIdResult(result, resultDiv);
      return;
    }

    // Fallback: local heuristic-based guide
    renderTreeIdFallback(resultDiv);
  } catch (err) {
    console.error('[TreeID] Error:', err);
    renderTreeIdFallback(resultDiv);
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function identifyTreeCloud(base64Image) {
  // Check if a tree ID API endpoint is configured
  const endpoint = window.TREE_ID_API_URL || '';
  const apiKey = window.TREE_ID_API_KEY || '';

  if (!endpoint) {
    // Try PlantNet API (free tier)
    return identifyTreePlantNet(base64Image);
  }

  try {
    const body = JSON.stringify({ image: base64Image, api_key: apiKey });
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    if (!response.ok) return null;
    const data = await response.json();
    return parseTreeIdResponse(data);
  } catch {
    return null;
  }
}

async function identifyTreePlantNet(base64Image) {
  const apiKey = window.PLANTNET_API_KEY || '';
  if (!apiKey) return null;

  try {
    // Convert base64 to blob for multipart upload
    const fetchResp = await fetch(base64Image);
    const blob = await fetchResp.blob();
    const formData = new FormData();
    formData.append('images', blob, 'tree.jpg');
    formData.append('organs', 'auto');

    const response = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&include-related-images=true`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data?.results?.length) return null;

    const top = data.results[0];
    const species = top.species || {};
    return {
      commonName: species.commonNames?.[0] || 'Unknown',
      scientificName: species.scientificNameWithoutAuthor || '',
      confidence: Math.round((top.score || 0) * 100),
      family: species.family?.scientificNameWithoutAuthor || '',
      morelRelevance: getMorelRelevanceForSpecies(species.scientificNameWithoutAuthor || ''),
      imageUrl: top.images?.[0]?.url?.m || ''
    };
  } catch {
    return null;
  }
}

function parseTreeIdResponse(data) {
  if (!data) return null;
  return {
    commonName: data.common_name || data.commonName || 'Unknown',
    scientificName: data.scientific_name || data.scientificName || '',
    confidence: data.confidence || data.score || 0,
    family: data.family || '',
    morelRelevance: data.morelRelevance || getMorelRelevanceForSpecies(data.scientific_name || data.scientificName || ''),
    imageUrl: data.image_url || ''
  };
}

function getMorelRelevanceForSpecies(scientificName) {
  const name = String(scientificName).toLowerCase();
  const highRelevance = ['ulmus', 'fraxinus', 'liriodendron', 'platanus', 'populus', 'malus'];
  const medRelevance = ['quercus', 'carya', 'celtis', 'acer', 'asimina', 'salix', 'prunus'];

  if (highRelevance.some(g => name.includes(g))) return { level: 'high', message: 'This is a primary morel host tree! Scan 10-30 ft around the trunk base.' };
  if (medRelevance.some(g => name.includes(g))) return { level: 'medium', message: 'Good indicator species for morel habitat. Check nearby leaf litter and moisture pockets.' };
  return { level: 'low', message: 'Not a primary morel host, but check nearby for host trees that may share the habitat.' };
}

function renderTreeIdResult(result, container) {
  const relevanceClass = `ht-tree-relevance--${result.morelRelevance?.level || 'low'}`;
  const relevanceEmoji = result.morelRelevance?.level === 'high' ? '\uD83C\uDF44' : (result.morelRelevance?.level === 'medium' ? '\uD83C\uDF3F' : '\u2796');
  container.innerHTML = `
    <div class="ht-tree-id-result">
      <div class="ht-tree-id-result-header">
        <div class="ht-tree-id-result-name">${escapeHtml(result.commonName)}</div>
        ${result.scientificName ? `<div class="ht-tree-id-result-sci"><em>${escapeHtml(result.scientificName)}</em></div>` : ''}
        ${result.confidence ? `<div class="ht-tree-id-result-confidence">${result.confidence}% match</div>` : ''}
      </div>
      ${result.imageUrl ? `<img class="ht-tree-id-result-img" src="${escapeHtml(result.imageUrl)}" alt="${escapeHtml(result.commonName)}">` : ''}
      <div class="ht-tree-id-result-relevance ${relevanceClass}">
        ${relevanceEmoji} <strong>Morel Relevance:</strong> ${escapeHtml(result.morelRelevance?.message || 'Unknown relevance.')}
      </div>
      ${result.family ? `<div class="ht-tree-id-result-family">Family: ${escapeHtml(result.family)}</div>` : ''}
    </div>
  `;
}

window.renderTreeIdFallback = renderTreeIdFallback;
function renderTreeIdFallback(container) {
  // Show an interactive visual guide for manual tree identification
  const trees = [
    { name: 'American Elm', key: 'elm', clue: 'Vase shape, diamond-ridge bark, peeling strips on dying trees' },
    { name: 'White/Green Ash', key: 'ash', clue: 'Diamond bark, opposite compound leaves, D-shaped beetle exit holes' },
    { name: 'Tulip Poplar', key: 'tulipPoplar', clue: 'Tall straight trunk, 4-lobed tulip-shaped leaves, furrow bark' },
    { name: 'Sycamore', key: 'sycamore', clue: 'Mottled white/tan/green bark, broad maple-like leaves' },
    { name: 'White Oak', key: 'whiteOak', clue: 'Rounded leaf lobes, light gray scaly bark, massive spreading crown' },
    { name: 'Shagbark Hickory', key: 'hickory', clue: 'Shaggy peeling bark strips, compound leaves with 5 leaflets' },
    { name: 'Cottonwood', key: 'cottonwood', clue: 'Deeply furrowed bark, triangular leaves that flutter in wind' },
    { name: 'Old Apple', key: 'apple', clue: 'Rough scaly bark, twisted open crown, orchard spacing' },
    { name: 'Pawpaw', key: 'pawpaw', clue: 'Large tropical leaves (8-12"), smooth bark, understory clusters' },
    { name: 'Wild Cherry', key: 'cherry', clue: 'Horizontal dash-mark lenticels, shiny serrate leaves' }
  ];

  container.innerHTML = `
    <div class="ht-tree-id-fallback">
      <div class="ht-tree-id-fallback-title">\uD83C\uDF33 Visual Tree ID Guide</div>
      <div class="ht-tree-id-fallback-subtitle">Camera ID unavailable \u2014 match your tree to these key species:</div>
      <div class="ht-tree-id-fallback-grid">
        ${trees.map(t => `
          <button class="ht-tree-id-guide-card" onclick="window.showTreeIdDetail('${t.key}')">
            <div class="ht-tree-id-guide-svg">${getTreeIdSvg(t.name)}</div>
            <div class="ht-tree-id-guide-name">${escapeHtml(t.name)}</div>
            <div class="ht-tree-id-guide-clue">${escapeHtml(t.clue)}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

window.showTreeIdDetail = function(treeKey) {
  // Find the tree in MUSHROOM_EDUCATION data
  let treeData = null;
  Object.values(typeof MUSHROOM_EDUCATION !== 'undefined' ? MUSHROOM_EDUCATION : {}).forEach(habitat => {
    if (habitat.treeId && habitat.treeId[treeKey]) {
      treeData = habitat.treeId[treeKey];
    }
  });

  if (!treeData) {
    showNotice('Tree details not found.', 'info', 2000);
    return;
  }

  const resultDiv = document.getElementById('htTreeResult');
  if (!resultDiv) return;
  resultDiv.style.display = 'block';
  const relevance = getMorelRelevanceForSpecies(treeData.name);

  resultDiv.innerHTML = `
    <div class="ht-tree-id-result">
      <div class="ht-tree-id-result-header">
        <div class="ht-tree-id-guide-svg-lg">${getTreeIdSvg(treeData.name)}</div>
        <div class="ht-tree-id-result-name">${escapeHtml(treeData.name)}</div>
      </div>
      <div class="ht-tree-id-grid">
        <div class="ht-tree-id-cell"><div class="ht-tree-id-cell-label">\uD83C\uDF32 Bark</div><div class="ht-tree-id-detail">${escapeHtml(treeData.bark)}</div></div>
        <div class="ht-tree-id-cell"><div class="ht-tree-id-cell-label">\uD83C\uDF43 Leaves</div><div class="ht-tree-id-detail">${escapeHtml(treeData.leaves)}</div></div>
        <div class="ht-tree-id-cell"><div class="ht-tree-id-cell-label">\uD83C\uDF33 Shape</div><div class="ht-tree-id-detail">${escapeHtml(treeData.shape)}</div></div>
      </div>
      <div class="ht-tree-id-tip">\uD83D\uDCA1 ${escapeHtml(treeData.tip)}</div>
      <div class="ht-tree-id-result-relevance ht-tree-relevance--${relevance.level}">
        \uD83C\uDF44 <strong>Morel Relevance:</strong> ${escapeHtml(relevance.message)}
      </div>
      <button class="ht-tree-camera-btn ht-tree-camera-btn--back" onclick="window.renderTreeIdFallback(document.getElementById('htTreeResult'))">\u2190 Back to Guide</button>
    </div>
  `;
};

function renderThermalEducationCard(thermal) {
  if (!thermal) return '';
  const input = getThermalInputSnapshot();
  const phase = getThermalPhaseLabel(getThermalLift(input.temp, input.hour));
  const windSpeed = Number.isFinite(input.windSpeed) ? `${input.windSpeed} mph` : '--';
  const windDir = input.windDir || '--';
  const role = thermal.role ? ` • ${escapeHtml(thermal.role)}` : '';
  const detail = [thermal.detail, thermal.best].filter(Boolean).join(' ');
  const extra = [thermal.wind].filter(Boolean).join(' ');
  const logo = getHuntechLogoMarkup('ht-card-logo');

  return `
    <div class="ht-edu-card ht-edu-thermal">
      ${logo}
      <div class="ht-edu-card-title">Thermal cue: ${escapeHtml(thermal.label || 'Thermal pattern')}${role}</div>
      ${detail ? `<div class="ht-edu-card-detail">${escapeHtml(detail)}</div>` : ''}
      ${extra ? `<div class="ht-edu-card-detail ht-edu-card-detail--muted">${escapeHtml(extra)}</div>` : ''}
      <div class="ht-edu-card-meta">Phase: ${escapeHtml(phase)} • Wind ${escapeHtml(windSpeed)} ${escapeHtml(windDir)}</div>
    </div>
  `;
}


// ===================================================================
//   Education Display & Notices
// ===================================================================

/* Wikimedia Commons reference photos (public domain / CC-BY-SA) for tree species.
   Each entry has a bark image and a leaves image for visual identification. */
const TREE_REFERENCE_PHOTOS = {
  elm:         { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Ulmus_americana_bark.jpg/400px-Ulmus_americana_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Ulmus_americana_leaves.jpg/400px-Ulmus_americana_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/American_Elm.jpg/400px-American_Elm.jpg' },
  ash:         { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Fraxinus_americana_bark.jpg/400px-Fraxinus_americana_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Fraxinus_americana_002.jpg/400px-Fraxinus_americana_002.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Fraxinus_pennsylvanica.jpg/400px-Fraxinus_pennsylvanica.jpg' },
  tulipPoplar: { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Liriodendron_tulipifera_bark.jpg/400px-Liriodendron_tulipifera_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Liriodendron_tulipifera-leaf.jpg/400px-Liriodendron_tulipifera-leaf.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Liriodendron_tulipifera_tree.jpg/400px-Liriodendron_tulipifera_tree.jpg' },
  sycamore:    { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Platanus_occidentalis_bark.jpg/400px-Platanus_occidentalis_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Platanus_occidentalis_leaves.jpg/400px-Platanus_occidentalis_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Platanus_occidentalis.jpg/400px-Platanus_occidentalis.jpg' },
  cottonwood:  { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Populus_deltoides_bark.jpg/400px-Populus_deltoides_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Populus_deltoides_leaves.jpg/400px-Populus_deltoides_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Eastern_Cottonwood.jpg/400px-Eastern_Cottonwood.jpg' },
  whiteOak:    { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Quercus_alba_bark.jpg/400px-Quercus_alba_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Quercus_alba_leaves.jpg/400px-Quercus_alba_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Quercus_alba.jpg/400px-Quercus_alba.jpg' },
  hickory:     { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Carya_ovata_bark.jpg/400px-Carya_ovata_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Carya_ovata_leaves.jpg/400px-Carya_ovata_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Carya-ovata.jpg/400px-Carya-ovata.jpg' },
  hackberry:   { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Celtis_occidentalis_bark.jpg/400px-Celtis_occidentalis_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Celtis_occidentalis_leaves.jpg/400px-Celtis_occidentalis_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Celtis_occidentalis.jpg/400px-Celtis_occidentalis.jpg' },
  silverMaple: { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Acer_saccharinum_bark.jpg/400px-Acer_saccharinum_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Acer_saccharinum_leaves.jpg/400px-Acer_saccharinum_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Acer_saccharinum.jpg/400px-Acer_saccharinum.jpg' },
  boxElder:    { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Acer_negundo_bark.jpg/400px-Acer_negundo_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Acer_negundo_leaves.jpg/400px-Acer_negundo_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Acer_negundo.jpg/400px-Acer_negundo.jpg' },
  pawpaw:      { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Asimina_triloba_bark.jpg/400px-Asimina_triloba_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Asimina_triloba_leaves.jpg/400px-Asimina_triloba_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Paw_Paw_%28Asimina_triloba%29.jpg/400px-Paw_Paw_%28Asimina_triloba%29.jpg' },
  willow:      { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Salix_nigra_bark.jpg/400px-Salix_nigra_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Salix_nigra_leaves.jpg/400px-Salix_nigra_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Salix_nigra.jpg/400px-Salix_nigra.jpg' },
  apple:       { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Old_apple_tree_bark.jpg/400px-Old_apple_tree_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Malus_domestica_a1.jpg/400px-Malus_domestica_a1.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Malus_domestica_tree.jpg/400px-Malus_domestica_tree.jpg' },
  wildCherry:  { bark: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Prunus_serotina_bark.jpg/400px-Prunus_serotina_bark.jpg',
                 leaves: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Prunus_serotina_leaves.jpg/400px-Prunus_serotina_leaves.jpg',
                 whole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Prunus_serotina.jpg/400px-Prunus_serotina.jpg' }
};

/** Map tree name to its TREE_REFERENCE_PHOTOS key */
function getTreePhotoKey(treeName) {
  const n = String(treeName || '').toLowerCase();
  if (n.includes('elm'))           return 'elm';
  if (n.includes('ash'))           return 'ash';
  if (n.includes('tulip') || n.includes('poplar') && !n.includes('cotton')) return 'tulipPoplar';
  if (n.includes('sycamore'))      return 'sycamore';
  if (n.includes('cottonwood'))    return 'cottonwood';
  if (n.includes('white oak'))     return 'whiteOak';
  if (n.includes('oak'))           return 'whiteOak';
  if (n.includes('hickory'))       return 'hickory';
  if (n.includes('hackberry'))     return 'hackberry';
  if (n.includes('silver maple'))  return 'silverMaple';
  if (n.includes('box elder'))     return 'boxElder';
  if (n.includes('maple'))         return 'silverMaple';
  if (n.includes('pawpaw'))        return 'pawpaw';
  if (n.includes('willow'))        return 'willow';
  if (n.includes('apple'))         return 'apple';
  if (n.includes('cherry'))        return 'wildCherry';
  return null;
}

/** Show a full-screen tree detail popup with photos, bark, leaves, shape, and tip */
window.showTreeDetailPopup = function(treeKey) {
  // Find the tree data in MUSHROOM_EDUCATION
  let treeData = null;
  Object.values(typeof MUSHROOM_EDUCATION !== 'undefined' ? MUSHROOM_EDUCATION : {}).forEach(habitat => {
    if (habitat.treeId && habitat.treeId[treeKey]) {
      treeData = habitat.treeId[treeKey];
    }
  });
  if (!treeData) { showNotice('Tree details not found.', 'info', 2000); return; }

  const photos = TREE_REFERENCE_PHOTOS[treeKey] || {};
  const relevance = getMorelRelevanceForSpecies(treeData.name);
  const relevanceClass = `ht-tree-relevance--${relevance.level}`;

  // Remove any existing popup
  let popup = document.getElementById('htTreeDetailPopup');
  if (popup) popup.remove();

  popup = document.createElement('div');
  popup.id = 'htTreeDetailPopup';
  popup.className = 'ht-tree-detail-popup-overlay';
  popup.innerHTML = `
    <div class="ht-tree-detail-popup">
      <div class="ht-tree-detail-header">
        <div class="ht-tree-detail-header-left">
          <div class="ht-tree-detail-svg">${getTreeIdSvg(treeData.name)}</div>
          <div class="ht-tree-detail-title">${escapeHtml(treeData.name)}</div>
        </div>
        <button class="ht-tree-detail-close" onclick="window.closeTreeDetailPopup()">✕</button>
      </div>
      <div class="ht-tree-detail-body">
        ${photos.whole ? `
        <div class="ht-tree-detail-photo-row">
          <img class="ht-tree-detail-photo" src="${photos.whole}" alt="${escapeHtml(treeData.name)} tree" loading="lazy" onerror="this.style.display='none'">
        </div>` : ''}
        <div class="ht-tree-detail-photos">
          ${photos.bark ? `<div class="ht-tree-detail-photo-card">
            <img class="ht-tree-detail-photo-sm" src="${photos.bark}" alt="Bark" loading="lazy" onerror="this.parentElement.style.display='none'">
            <div class="ht-tree-detail-photo-label">🌲 Bark</div>
          </div>` : ''}
          ${photos.leaves ? `<div class="ht-tree-detail-photo-card">
            <img class="ht-tree-detail-photo-sm" src="${photos.leaves}" alt="Leaves" loading="lazy" onerror="this.parentElement.style.display='none'">
            <div class="ht-tree-detail-photo-label">🍃 Leaves</div>
          </div>` : ''}
        </div>
        <div class="ht-tree-detail-grid">
          <div class="ht-tree-detail-cell">
            <div class="ht-tree-detail-cell-label">🌲 Bark</div>
            <div class="ht-tree-detail-cell-text">${escapeHtml(treeData.bark)}</div>
          </div>
          <div class="ht-tree-detail-cell">
            <div class="ht-tree-detail-cell-label">🍃 Leaves</div>
            <div class="ht-tree-detail-cell-text">${escapeHtml(treeData.leaves)}</div>
          </div>
          <div class="ht-tree-detail-cell">
            <div class="ht-tree-detail-cell-label">🌳 Shape</div>
            <div class="ht-tree-detail-cell-text">${escapeHtml(treeData.shape)}</div>
          </div>
        </div>
        <div class="ht-tree-detail-tip">💡 ${escapeHtml(treeData.tip)}</div>
        <div class="ht-tree-detail-relevance ${relevanceClass}">
          🍄 <strong>Morel Relevance:</strong> ${escapeHtml(relevance.message)}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  // Close on overlay click
  popup.addEventListener('click', (e) => { if (e.target === popup) window.closeTreeDetailPopup(); });
};

window.closeTreeDetailPopup = function() {
  const popup = document.getElementById('htTreeDetailPopup');
  if (popup) popup.remove();
};

/** Truncate text to a max length, breaking at a sentence or word boundary */
function summarizeText(text, maxLen) {
  if (!text || text.length <= maxLen) return text;
  // Try to break at a sentence end
  const trimmed = text.substring(0, maxLen);
  const sentEnd = Math.max(trimmed.lastIndexOf('. '), trimmed.lastIndexOf('! '), trimmed.lastIndexOf('? '));
  if (sentEnd > maxLen * 0.5) return trimmed.substring(0, sentEnd + 1);
  // Fall back to word boundary
  const wordEnd = trimmed.lastIndexOf(' ');
  return (wordEnd > maxLen * 0.4 ? trimmed.substring(0, wordEnd) : trimmed) + '…';
}

function showEducationTile(hotspot, reason) {
  if (!UI_POPUPS_ENABLED) return;
  const tile = ensureEducationTile();
  const labels = getModuleEducationLabels();
  activeEducationHotspot = hotspot || null;
  const isMicroFeature = Boolean(hotspot?.isMicroFeature);
  const checkinKey = hotspot ? getHotspotKey(hotspot) : '';
  const isActive = Boolean(checkinKey && activeSearchArea?.pinKey === checkinKey);
  const isComplete = Boolean(checkinKey && completedSearchAreas.has(checkinKey));
  const checkinLabel = isComplete ? 'Complete' : (isActive ? 'Check Out' : 'Check In');
  const checkinDisabled = isComplete;
  const tier = hotspot?.tier ?? hotspot?.priority ?? hotspot?.education?.priority ?? 3;
  const rank = hotspot?.rank ?? hotspot?.priority ?? tier;
  const accent = getPriorityColor(tier);
  const descriptionText = String(hotspot?.education?.description || '');
  const tipsText = String(hotspot?.education?.tips || '');
  const lookForText = String(hotspot?.education?.lookFor || '');
  const microHint = !isMicroFeature ? getMicroFeatureHint() : '';
  const used = new Set([normalizeEducationText(descriptionText), normalizeEducationText(lookForText)]);
  const whyItems = buildEducationList([...(hotspot?.education?.why || []), ...(microHint ? [microHint] : [])], used);
  const approachItems = buildEducationList(hotspot?.education?.approach, used);
  const thermalCard = renderThermalEducationCard(hotspot?.education?.thermal);
  const checkinBtn = isMicroFeature
    ? ''
    : `<button class="ht-edu-pill" id="htEduCheckinBtn" type="button" onclick="window.checkInHotspot()" ${checkinDisabled ? 'disabled' : ''}>${checkinLabel}</button>`;

  // Short summary — first sentence of description (cap at 140 chars)
  const summary = summarizeText(descriptionText, 140);

  // Action tips — combine tips + lookFor into one compact block, truncated
  const actionText = [tipsText, lookForText].filter(Boolean).join(' ');
  const actionSummary = summarizeText(actionText, 200);

  // Build clickable tree chips (mushroom module only)
  let treeChipsHtml = '';
  if (isMushroomModule() && hotspot.education?.treeFocus?.length) {
    const treeChips = hotspot.education.treeFocus.map(treeName => {
      let treeKey = null;
      if (hotspot.education.treeId) {
        Object.keys(hotspot.education.treeId).forEach(k => {
          if (hotspot.education.treeId[k].name.toLowerCase().includes(treeName.split(' ')[0].toLowerCase()) ||
              treeName.toLowerCase().includes(k.toLowerCase())) {
            treeKey = k;
          }
        });
      }
      if (!treeKey) {
        Object.values(MUSHROOM_EDUCATION).forEach(habitat => {
          if (habitat.treeId) {
            Object.keys(habitat.treeId).forEach(k => {
              const n = habitat.treeId[k].name.toLowerCase();
              if (n.includes(treeName.split('(')[0].trim().split(' ')[0].toLowerCase())) {
                treeKey = k;
              }
            });
          }
        });
      }
      const svg = getTreeIdSvg(treeName);
      const onclick = treeKey ? `onclick="window.showTreeDetailPopup('${treeKey}')"` : '';
      const clickClass = treeKey ? 'ht-tree-chip--clickable' : '';
      const photoKey = getTreePhotoKey(treeName);
      const photos = photoKey ? TREE_REFERENCE_PHOTOS[photoKey] : null;
      const thumbHtml = photos ? `<span class="ht-tree-chip-thumbs">${photos.whole ? `<img class="ht-tree-chip-thumb" src="${photos.whole}" alt="Tree" loading="lazy" onerror="this.style.display='none'">` : ''}${photos.leaves ? `<img class="ht-tree-chip-thumb" src="${photos.leaves}" alt="Leaf" loading="lazy" onerror="this.style.display='none'">` : ''}</span>` : '';
      return `<button class="ht-tree-chip ${clickClass}" ${onclick} type="button">
        <span class="ht-tree-chip-top"><span class="ht-tree-chip-svg">${svg}</span><span class="ht-tree-chip-name">${escapeHtml(treeName)}</span></span>
        ${thumbHtml}
      </button>`;
    }).join('');
    treeChipsHtml = `<div class="ht-tree-chip-row">${treeChips}</div>`;
  }

  // Collapsed "More Info" — full description, why, approach, season, thermal
  let moreItems = '';
  if (descriptionText.length > 140) {
    moreItems += `<div class="ht-edu-more-block"><div class="ht-edu-more-label">Overview</div><div class="ht-edu-desc">${escapeHtml(descriptionText)}</div></div>`;
  }
  if (whyItems.length) {
    moreItems += `<div class="ht-edu-more-block"><div class="ht-edu-more-label">${labels.whyTitle}</div><ul class="ht-edu-list">${whyItems.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`;
  }
  if (approachItems.length) {
    moreItems += `<div class="ht-edu-more-block"><div class="ht-edu-more-label">${labels.approachTitle}</div><ul class="ht-edu-list">${approachItems.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`;
  }
  if (isMushroomModule() && hotspot.education?.seasonCues?.length) {
    moreItems += `<div class="ht-edu-more-block"><div class="ht-edu-more-label">📅 Season Indicators</div><ul class="ht-edu-cue-list">${hotspot.education.seasonCues.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul></div>`;
  }
  if (isMushroomModule() && hotspot.education?.treeNotes) {
    moreItems += `<div class="ht-edu-more-block"><div class="ht-edu-more-label">🌳 Tree Notes</div><div class="ht-edu-desc ht-edu-desc--muted">${escapeHtml(hotspot.education.treeNotes)}</div></div>`;
  }

  tile.innerHTML = `
    <div class="ht-edu-header">
      <div class="ht-edu-title" style="color:${accent};">${isMicroFeature ? 'Micro' : `#${rank}`} ${escapeHtml(hotspot.education.title)}</div>
      <button onclick="closeEducationTile()" class="ht-edu-close-btn" type="button">✕</button>
    </div>
    <div class="ht-edu-actions">
      ${checkinBtn}
      <button class="ht-edu-pill ht-edu-pill--ghost" id="htEduAudioBtn" type="button" onclick="window.toggleEducationAudio()" aria-pressed="${speechActive ? 'true' : 'false'}">${speechActive ? 'Stop Audio' : '🔊 Read to Me'}</button>
      ${isMushroomModule() ? `<button class="ht-edu-pill ht-edu-pill--camera" type="button" onclick="window.openTreeIdCamera()">📷 ID a Tree</button>` : ''}
    </div>
    <div class="ht-edu-summary">${escapeHtml(summary)}</div>
    ${actionSummary ? `<div class="ht-edu-action-box" style="border-left-color:${accent};"><div class="ht-edu-action-label">👀 What to look for</div><div class="ht-edu-action-text">${escapeHtml(actionSummary)}</div></div>` : ''}
    ${thermalCard}
    ${treeChipsHtml}
    ${moreItems ? `
    <details class="ht-edu-collapsible">
      <summary class="ht-edu-collapsible-toggle">More details <span class="ht-edu-collapse-arrow">▸</span></summary>
      <div class="ht-edu-more-content">${moreItems}</div>
    </details>` : ''}
  `;
  tile.style.display = 'block';
  updateEducationCheckinButton();
  updateEducationAudioButton();
}

window.checkInHotspot = function() {
  if (!activeEducationHotspot || !map) return;
  const checkinKey = getHotspotKey(activeEducationHotspot);
  const isActive = Boolean(checkinKey && activeSearchArea?.pinKey === checkinKey);
  const isComplete = Boolean(checkinKey && completedSearchAreas.has(checkinKey));
  if (isComplete) {
    showNotice('This pin is already complete.', 'info', 3200);
    updateEducationCheckinButton();
    return;
  }
  if (isActive) {
    trackingActive = false;
    saveTrackingCoverage();
    clearActiveSearchArea();
    if (!routeLine) stopLocationWatch();
    updateAdvancedToolsTrayState();
    updateEducationCheckinButton();
    showNotice('Checked out. Move to the next pin.', 'info', 4200);
    closeEducationTile();
    return;
  }

  const profile = getHotspotSearchProfile(activeEducationHotspot);
  setActiveSearchArea(activeEducationHotspot);
  ensureTrackingArea();
  renderTrackingCoverage();
  dropMicroFeaturesForActiveSearchArea();
  trackingActive = true;
  startLocationWatch();
  updateEducationCheckinButton();
  showNotice(`Check-in started. Sweep the ${profile.label}.`, 'success', 4200);
  closeEducationTile();
};

function buildHotspotSpeakText(hotspot) {
  if (!hotspot || !hotspot.education) return '';
  const title = hotspot.education.title || 'Hotspot';
  const desc = hotspot.education.description || '';
  const tips = hotspot.education.tips || '';
  const why = Array.isArray(hotspot.education.why) ? hotspot.education.why.join('. ') : '';
  const approach = Array.isArray(hotspot.education.approach) ? hotspot.education.approach.join('. ') : '';
  const lookFor = hotspot.education.lookFor || '';
  const rank = hotspot.rank || hotspot.priority || '';
  // Write in natural conversational cadence with clear pauses
  let speech = `This is priority ${rank}, ${title}. ${desc}.`;
  if (why)      speech += ` Here's why it matters. ${why}.`;
  if (approach) speech += ` For your approach. ${approach}.`;
  if (lookFor)  speech += ` Look for, ${lookFor}.`;
  if (tips)     speech += ` Field tip. ${tips}.`;
  return speech;
}

function updateMissionBriefAudioButton() {
  const btn = document.getElementById('missionBriefAudioBtn');
  if (!btn) return;
  const isActive = Boolean(speechActive);
  btn.textContent = isActive ? 'Stop Audio' : 'Read to Me';
  btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  btn.classList.toggle('is-active', isActive);
  updateEducationAudioButton();
}

function updateEducationAudioButton() {
  const btn = document.getElementById('htEduAudioBtn');
  if (!btn) return;
  const isActive = Boolean(speechActive);
  btn.textContent = isActive ? 'Stop Audio' : 'Read to Me';
  btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  btn.classList.toggle('is-active', isActive);
}

function updateEducationCheckinButton() {
  const btn = document.getElementById('htEduCheckinBtn');
  if (!btn || !activeEducationHotspot || activeEducationHotspot.isMicroFeature) return;
  const checkinKey = getHotspotKey(activeEducationHotspot);
  const isActive = Boolean(checkinKey && activeSearchArea?.pinKey === checkinKey);
  const isComplete = Boolean(checkinKey && completedSearchAreas.has(checkinKey));
  btn.textContent = isComplete ? 'Complete' : (isActive ? 'Check Out' : 'Check In');
  btn.disabled = isComplete;
  btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  btn.classList.toggle('is-active', isActive);
}


// ===================================================================
//   Text-to-Speech & Audio
// ===================================================================
function stopAiSpeech(notice = true) {
  _ttsChunkAbort = true;
  if (ttsAbortController) {
    try { ttsAbortController.abort(); } catch {}
    ttsAbortController = null;
  }
  if (ttsAudio) {
    try { ttsAudio.pause(); } catch {}
    try { ttsAudio.currentTime = 0; } catch {}
    ttsAudio = null;
  }
  if ('speechSynthesis' in window) {
    try { speechSynthesis.cancel(); } catch {}
  }
  speechActive = false;
  updateMissionBriefAudioButton();
  if (notice) showNotice('Audio stopped.', 'info', 2400);
}

function pickPreferredSpeechVoice(voices) {
  const list = Array.isArray(voices) ? voices : [];
  if (!list.length) return null;

  // Allow explicit override from config
  const desiredName = String(window.HUNTECH_TTS_VOICE_NAME || '').trim();
  if (desiredName) {
    const match = list.find((voice) => (
      String(voice.name || '').toLowerCase() === desiredName.toLowerCase()
      || String(voice.voiceURI || '').toLowerCase() === desiredName.toLowerCase()
    ));
    if (match) return match;
  }

  if (preferredSpeechVoiceName) {
    const cached = list.find((voice) => (
      String(voice.name || '').toLowerCase() === preferredSpeechVoiceName.toLowerCase()
      || String(voice.voiceURI || '').toLowerCase() === preferredSpeechVoiceName.toLowerCase()
    ));
    if (cached) return cached;
  }

  // ── Realistic voice ranking ──
  // Prioritise neural / online / enhanced voices — they sound human.
  // Chrome/Edge have "Google US English" and "Microsoft … Online (Natural)".
  // Safari has "Samantha (Enhanced)", "Siri" voices.
  const neuralPat   = /online|neural|natural|enhanced|premium|wavenet|journey/i;
  const siriPat     = /siri/i;
  const googlePat   = /google/i;
  const msEdgePat   = /microsoft.*online/i;
  const femalePat   = /(samantha|ava|allison|olivia|zoe|joanna|emma|amelia|jenny|aria|siri.*female|karen|victoria|female)/i;
  const malePat     = /(daniel|david|alex|matthew|nathan|tom|fred|george|michael|guy|male)/i;

  const enUs     = list.filter(v => /en(-|_)?US/i.test(v.lang));
  const enAny    = list.filter(v => /en(-|_)?(US|GB|AU|CA)/i.test(v.lang));
  const pool     = enUs.length ? enUs : enAny.length ? enAny : list;

  const ranked = pool.map(voice => {
    const n = String(voice.name || '');
    const u = String(voice.voiceURI || '');
    let score = 0;

    // Strongly prefer high-quality neural/online voices
    if (neuralPat.test(n) || neuralPat.test(u)) score += 20;
    if (msEdgePat.test(n) || msEdgePat.test(u)) score += 18;
    if (siriPat.test(n)   || siriPat.test(u))   score += 16;
    if (googlePat.test(n)  || googlePat.test(u))  score += 14;

    // Prefer female voices (generally smoother TTS)
    const isFemale = femalePat.test(n) || femalePat.test(u);
    const isMale   = malePat.test(n)   || malePat.test(u);
    if (isFemale) score += 6;
    if (isMale)   score -= 2;

    // Local service = already downloaded = lower latency
    if (voice.localService) score += 2;
    if (voice.default)      score += 1;

    return { voice, score, isFemale };
  }).sort((a, b) => b.score - a.score);

  let choice = ranked.length ? ranked[0].voice : null;
  if (window.HUNTECH_TTS_FORCE_FEMALE) {
    const femaleChoice = ranked.find(item => item.isFemale);
    if (femaleChoice) choice = femaleChoice.voice;
  }

  if (choice) {
    preferredSpeechVoiceName = choice.name || choice.voiceURI || '';
    console.log('[TTS] Selected voice:', choice.name, '| lang:', choice.lang,
      '| local:', choice.localService, '| URI:', choice.voiceURI);
  }
  return choice;
}

function normalizeSpeechText(text) {
  let t = String(text || '');
  // Brand pronunciation
  t = t.replace(/\bHUNT[ΞE]CH\b/gi, 'Hun-tek');
  t = t.replace(/\bhun\s*-?\s*tech\b/gi, 'Hun-tek');
  t = t.replace(/\bHuntech\b/gi, 'Hun-tek');
  // Expand directional abbreviations — NEVER say single letters
  t = t.replace(/\bNE\b/g, 'Northeast');
  t = t.replace(/\bNW\b/g, 'Northwest');
  t = t.replace(/\bSE\b/g, 'Southeast');
  t = t.replace(/\bSW\b/g, 'Southwest');
  t = t.replace(/\bN\b(?=[- ]facing|\s+slope|\s+side)/gi, 'North');
  t = t.replace(/\bS\b(?=[- ]facing|\s+slope|\s+side)/gi, 'South');
  t = t.replace(/\bE\b(?=[- ]facing|\s+slope|\s+side)/gi, 'East');
  t = t.replace(/\bW\b(?=[- ]facing|\s+slope|\s+side)/gi, 'West');
  // Standalone single-letter compass after whitespace/start
  t = t.replace(/(^|[\s,.])\bN\b(?=[\s,.])/g, '$1North');
  t = t.replace(/(^|[\s,.])\bS\b(?=[\s,.])/g, '$1South');
  t = t.replace(/(^|[\s,.])\bE\b(?=[\s,.])/g, '$1East');
  t = t.replace(/(^|[\s,.])\bW\b(?=[\s,.])/g, '$1West');
  // Expand common abbreviations for natural flow
  t = t.replace(/\bGPS\b/g, 'G P S');
  t = t.replace(/\bAI\b/g, 'A I');
  t = t.replace(/\bHD\b/g, 'H D');
  t = t.replace(/\bID\b/g, 'I D');
  t = t.replace(/\bft\b/g, 'feet');
  t = t.replace(/\bmph\b/g, 'miles per hour');
  t = t.replace(/\b(\d+)°F\b/g, '$1 degrees Fahrenheit');
  t = t.replace(/\b(\d+)"/g, '$1 inches');
  t = t.replace(/\b(\d+)'\b/g, '$1 feet');
  // Soften numbered list markers that sound robotic
  t = t.replace(/(\d+)\.\s/g, '$1, ');
  // Add micro-pauses after colons for breathing room
  t = t.replace(/:\s*/g, ': ... ');
  // Smooth out multiple spaces
  t = t.replace(/\s{2,}/g, ' ');
  return t.trim();
}

/**
 * Split text into natural sentence-sized chunks for smooth sequential speech.
 * Short chunks prevent the browser TTS from stuttering on long passages.
 */
function splitSpeechChunks(text) {
  if (!text) return [];
  // Split on sentence boundaries (. ! ?) followed by space or end
  const raw = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
  const chunks = [];
  let buf = '';
  for (const seg of raw) {
    // Keep chunks between ~40-180 chars for natural pacing
    if (buf.length + seg.length > 180 && buf.length > 30) {
      chunks.push(buf.trim());
      buf = seg;
    } else {
      buf += seg;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

/**
 * Speak a single chunk via browser TTS. Returns a Promise that resolves
 * when the chunk finishes (or rejects on error).
 */
function speakChunk(text, voice, rate, pitch, volume) {
  return new Promise((resolve, reject) => {
    const utt = new SpeechSynthesisUtterance(text);
    if (voice) utt.voice = voice;
    utt.lang = 'en-US';
    utt.rate   = rate;
    utt.pitch  = pitch;
    utt.volume = volume;
    utt.onend   = () => resolve();
    utt.onerror = (e) => reject(e);
    speechSynthesis.speak(utt);
  });
}

/**
 * Main browser TTS entry point — chunked for smooth, realistic delivery.
 * Splits long text into sentence chunks and speaks them sequentially
 * with micro-pauses in between so the voice sounds natural and unhurried.
 */
let _ttsChunkAbort = false;

function speakTextBrowser(text, notice) {
  if (!text) return false;
  if (!('speechSynthesis' in window)) return false;

  const normalized = normalizeSpeechText(text);
  const chunks = splitSpeechChunks(normalized);
  if (!chunks.length) return false;

  // Resolve best available voice (prefer neural/online)
  let voices = speechSynthesis.getVoices();
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent || '');
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent || '');
  const preferredVoice = (voices && voices.length) ? pickPreferredSpeechVoice(voices) : null;

  // Natural cadence settings — slightly faster than old default, warmer pitch
  const rateVal   = Number(window.HUNTECH_TTS_RATE);
  const pitchVal  = Number(window.HUNTECH_TTS_PITCH);
  const volVal    = Number(window.HUNTECH_TTS_VOLUME);
  const rate   = Number.isFinite(rateVal)  ? Math.min(1.15, Math.max(0.85, rateVal))  : (isIOS ? 0.98 : 1.02);
  const pitch  = Number.isFinite(pitchVal) ? Math.min(1.15, Math.max(0.85, pitchVal)) : 1.02;
  const volume = Number.isFinite(volVal)   ? Math.min(1.0,  Math.max(0.4, volVal))    : 1.0;

  // Pause between chunks (ms) — gives a natural breathing cadence
  const chunkPause = isIOS ? 180 : 120;

  speechActive = true;
  _ttsChunkAbort = false;
  updateMissionBriefAudioButton();

  try { speechSynthesis.cancel(); } catch {}

  // Sequential async chunk delivery
  (async () => {
    for (let i = 0; i < chunks.length; i++) {
      if (_ttsChunkAbort || !speechActive) break;
      try {
        await speakChunk(chunks[i], preferredVoice, rate, pitch, volume);
      } catch {
        break;
      }
      // Micro-pause between sentences for breathing room
      if (i < chunks.length - 1 && !_ttsChunkAbort) {
        await new Promise(r => setTimeout(r, chunkPause));
      }
    }
    speechActive = false;
    updateMissionBriefAudioButton();
  })();

  if (notice) showNotice(notice, 'info', 3200);
  return true;
}

async function speakText(text) {
  if (!text) return;
  const safeText = normalizeSpeechText(text);
  if (!window.HUNTECH_TTS_ENABLED) {
    if (!speakTextBrowser(safeText, 'Using device voice.')) {
      showNotice('Device voice not available.', 'warning', 3200);
    }
    return;
  }
  stopAiSpeech(false);
  if (String(window.HUNTECH_TTS_PROVIDER || '').toLowerCase() === 'browser') {
    if (!speakTextBrowser(safeText, 'Using device voice.')) {
      showNotice('Browser voice not available.', 'warning', 3200);
    }
    return;
  }

  speechActive = true;
  updateMissionBriefAudioButton();
  ttsAbortController = new AbortController();
  const requestController = ttsAbortController;

  const payload = {
    provider: window.HUNTECH_TTS_PROVIDER,
    voiceId: window.HUNTECH_TTS_VOICE_ID,
    model: window.HUNTECH_TTS_MODEL,
    stability: window.HUNTECH_TTS_STABILITY,
    similarity: window.HUNTECH_TTS_SIMILARITY,
    style: window.HUNTECH_TTS_STYLE,
    text
  };

  let res = null;
  try {
    res = await fetch('/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: requestController.signal
    });
  } catch {
    speechActive = false;
    updateMissionBriefAudioButton();
    if (requestController.signal.aborted) return;
    if (!speakTextBrowser(text, 'AI voice unavailable. Using device voice.')) {
      showNotice('AI voice request failed.', 'error', 3200);
    }
    return;
  }

  if (!res || !res.ok) {
    speechActive = false;
    updateMissionBriefAudioButton();
    if (!speakTextBrowser(text, 'AI voice not configured. Using device voice.')) {
      showNotice('AI voice is not configured yet.', 'warning', 3200);
    }
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  ttsAudio = audio;
  const playbackRate = Number(window.HUNTECH_TTS_PLAYBACK_RATE);
  const volume = Number(window.HUNTECH_TTS_VOLUME);
  audio.playbackRate = Number.isFinite(playbackRate) ? Math.min(1.3, Math.max(0.85, playbackRate)) : 1.0;
  audio.volume = Number.isFinite(volume) ? Math.min(1.0, Math.max(0.6, volume)) : 1.0;
  audio.onended = () => {
    speechActive = false;
    updateMissionBriefAudioButton();
    URL.revokeObjectURL(url);
  };
  audio.onerror = () => {
    speechActive = false;
    updateMissionBriefAudioButton();
    URL.revokeObjectURL(url);
  };

  try {
    await audio.play();
  } catch {
    speechActive = false;
    updateMissionBriefAudioButton();
    URL.revokeObjectURL(url);
    showNotice('Audio playback blocked. Tap Read to Me again.', 'warning', 3200);
  }
}

window.stopSpeech = function() {
  stopAiSpeech(true);
};

window.readHotspotEducation = function() {
  if (!activeEducationHotspot) return;
  const speechText = buildHotspotSpeakText(activeEducationHotspot);
  speakText(speechText);
  showNotice('Reading this pin guidance.', 'info', 3200);
};

function isSpeechPlaybackActive() {
  if (ttsAudio && !ttsAudio.paused) return true;
  if ('speechSynthesis' in window) {
    if (speechSynthesis.speaking || speechSynthesis.pending) return true;
  }
  return false;
}

window.toggleEducationAudio = function() {
  if (speechActive && !isSpeechPlaybackActive()) {
    speechActive = false;
  }
  if (speechActive) {
    window.stopSpeech();
  } else {
    window.readHotspotEducation();
  }
  updateEducationAudioButton();
};

function showShedFindTile(shedFind, reason) {
  if (!UI_POPUPS_ENABLED) return;
  const tile = ensureEducationTile();
  const when = shedFind?.timestamp ? new Date(shedFind.timestamp).toLocaleString() : '';
  tile.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <div style="font-weight:bold;color:#FFD700;">${isMushroomModule() ? 'Mushroom Find' : 'Shed Find'}</div>
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

function getHuntOverviewStats() {
  const hotspotCount = hotspotMarkers.length;
  const startLabel = startPoint ? getRoutePinLabelForPoint(startPoint) : '--';
  const endLabel = endPoint ? getRoutePinLabelForPoint(endPoint) : '--';
  const modeLabel = selectedRoutingMode === 'loop' ? 'Loop' : 'Linear';
  const wind = lastPlanSnapshot?.wind || activeWindDir || '--';
  const windSpeed = Number.isFinite(activeWindSpeed) ? `${activeWindSpeed} mph` : '--';
  let miles = null;

  if (routeLine && routeLine.getLatLngs) {
    const coords = routeLine.getLatLngs();
    miles = estimateRouteMiles(coords);
  } else if (startPoint && endPoint && hotspotMarkers.length) {
    const routePoints = getHotspotRouteLatLngsOrdered(startPoint, endPoint);
    const base = [startPoint, ...routePoints];
    const ideal = selectedRoutingMode === 'loop' ? [...base, startPoint] : [...base, endPoint];
    miles = estimateRouteMiles(dedupeSequentialLatLngs(ideal));
  }

  return {
    hotspotCount,
    startLabel,
    endLabel,
    modeLabel,
    wind,
    windSpeed,
    miles
  };
}

function showHuntOverviewTile(reason) {
  const tile = ensureEducationTile();
  const stats = getHuntOverviewStats();
  const milesText = Number.isFinite(stats.miles) ? `${stats.miles.toFixed(1)} miles` : 'Route building…';

  tile.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <div style="font-weight:bold;color:#FFD700;">${isMushroomModule() ? 'Forage Overview' : 'Hunt Overview'}</div>
      <button onclick="closeEducationTile()" style="background:transparent;color:#FFD700;border:none;font-weight:bold;cursor:pointer;">X</button>
    </div>
    <div style="font-size:12px;color:#CCC;margin:6px 0;">${reason || 'Plan ready. Start walking to trigger hotspot alerts.'}</div>
    <div style="margin:8px 0;padding:10px;background:#111;border-left:3px solid #FFD700;font-size:12px;">
      <div><strong>Route:</strong> ${stats.modeLabel} • ${milesText}</div>
      <div><strong>Pins:</strong> Start ${stats.startLabel} → End ${stats.endLabel}</div>
      <div><strong>Hotspots:</strong> ${stats.hotspotCount}</div>
      <div><strong>Wind:</strong> ${stats.windSpeed} ${stats.wind}</div>
    </div>
  `;
  tile.style.display = 'block';
}

function closeEducationTile() {
  if (educationTile) educationTile.style.display = 'none';
  if (speechActive) window.stopSpeech();
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
    <div class="ht-legend-title">${isMushroomModule() ? 'Foraging Filter' : 'Shed-Hunting Filter'}</div>
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

function buildNoticeMessage(message) {
  const core = String(message || '').trim();
  const prefix = 'HUNTECH Labs AI Forensics';
  const lead = core ? `Signal: ${core}` : 'Signal: scanning terrain and route data';
  const suffix = 'Neural terrain mesh online. AWS cloud + HUNTECH Labs pipeline engaged.';
  return `${prefix} // ${lead} // ${suffix}`;
}

function showNotice(message, type = 'info', duration = 3200) {
  if (!UI_NOTICES_ENABLED) return;
  if (isPlanLoadingActive()) {
    const core = String(message || '').trim();
    const title = 'HUNTECH AI STATUS';
    const subtitle = core ? `Signal: ${core}` : 'Signal: building plan data';
    updatePlanLoadingStatus(title, subtitle);
    return;
  }
  
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = `ht-toast ht-toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: htToastIn 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'htToastOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

let quickHintTimer = null;

function showQuickHint(message, duration = 1400) {
  const existing = document.getElementById('htQuickHint');
  if (existing) existing.remove();
  if (quickHintTimer) {
    clearTimeout(quickHintTimer);
    quickHintTimer = null;
  }
  const hint = document.createElement('div');
  hint.id = 'htQuickHint';
  hint.className = 'ht-quick-hint';
  hint.textContent = message || '';
  document.body.appendChild(hint);
  quickHintTimer = setTimeout(() => {
    hint.remove();
    quickHintTimer = null;
  }, Math.max(600, duration));
}

function showStartPulse(latlng) {
  if (!map || !latlng) return;
  const pulse = L.circleMarker(latlng, {
    radius: 9,
    color: '#FFD700',
    weight: 2,
    fillColor: '#FFD700',
    fillOpacity: 0.2,
    className: 'ht-start-pulse'
  }).addTo(map);
  setTimeout(() => {
    try { map.removeLayer(pulse); } catch {}
  }, 900);
}

function ensureSavedHuntBar() {
  let bar = document.getElementById('htSavedHuntBar');
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'htSavedHuntBar';
  bar.className = 'ht-draw-helper ht-saved-hunt-bar';
  bar.innerHTML = `
    <div class="ht-draw-helper-text" id="htSavedHuntText"></div>
    <div class="ht-draw-helper-actions">
      <button class="ht-draw-helper-btn primary" id="htSavedHuntGo" type="button" onclick="window.savedHuntGo()">Go</button>
      <button class="ht-draw-helper-btn" id="htSavedHuntBuild" type="button" onclick="window.savedHuntBuildNew()">${isMushroomModule() ? 'Build New Forage' : 'Build New Hunt'}</button>
      <button class="ht-draw-helper-btn primary" id="htSavedHuntCancel" type="button" onclick="window.savedHuntCancel()">Cancel</button>
    </div>
  `;
  bar.addEventListener('click', (event) => event.stopPropagation());
  bar.querySelector('#htSavedHuntGo')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof window.savedHuntGo === 'function') window.savedHuntGo();
  });
  bar.querySelector('#htSavedHuntBuild')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof window.savedHuntBuildNew === 'function') window.savedHuntBuildNew();
  });
  bar.querySelector('#htSavedHuntCancel')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof window.savedHuntCancel === 'function') window.savedHuntCancel();
  });
  document.body.appendChild(bar);
  return bar;
}

function showSavedHuntBar(message) {
  const bar = ensureSavedHuntBar();
  const textEl = document.getElementById('htSavedHuntText');
  if (textEl) textEl.textContent = message || '';
  bar.classList.add('active');
  document.body.classList.add('ht-saved-hunt-preview');
  drawHelperPinnedBottom = true;
  resetDrawHelperPosition();
  anchorDrawHelperAboveToolbar();
}

function hideSavedHuntBar() {
  const bar = document.getElementById('htSavedHuntBar');
  if (bar) bar.classList.remove('active');
  document.body.classList.remove('ht-saved-hunt-preview');
  drawHelperPinnedBottom = false;
  resetDrawHelperPosition();
}

function ensureDrawHelper() {
  let helper = document.getElementById('htDrawHelper');
  if (helper) return helper;
  helper = document.createElement('div');
  helper.id = 'htDrawHelper';
  helper.className = 'ht-draw-helper';
  helper.innerHTML = `
    <div class="ht-draw-helper-text" id="htDrawHelperText"></div>
    <div class="ht-draw-helper-actions">
      <button class="ht-draw-helper-btn primary" id="htDrawHelperLock">Lock In</button>
      <button class="ht-draw-helper-btn" id="htDrawHelperReset">Reset</button>
      <button class="ht-draw-helper-btn primary" id="htDrawHelperCancel">Cancel</button>
    </div>
  `;
  helper.addEventListener('click', (event) => event.stopPropagation());
  helper.querySelector('#htDrawHelperLock')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof window.lockDrawHelper === 'function') window.lockDrawHelper();
  });
  helper.querySelector('#htDrawHelperReset')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof window.resetDrawHelper === 'function') window.resetDrawHelper();
  });
  helper.querySelector('#htDrawHelperCancel')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof window.cancelDrawHelper === 'function') window.cancelDrawHelper();
  });
  document.body.appendChild(helper);
  return helper;
}

function updateDrawHelperLockState() {
  const lockBtn = document.getElementById('htDrawHelperLock');
  if (!lockBtn) return;
  const canLock = Boolean((activeDrawMode === 'radius' && radiusDraftCircle)
    || (activeDrawMode === 'rect' && rectDraftRect)
    || (activeDrawMode === 'polygon' && pendingPolygonLayer)
    || (activeDrawMode === 'saved' && selectedAreaLayer));
  lockBtn.style.display = (activeDrawMode === 'radius'
    || activeDrawMode === 'rect'
    || activeDrawMode === 'polygon'
    || activeDrawMode === 'saved')
    ? 'inline-flex'
    : 'none';
  lockBtn.disabled = !canLock;
  lockBtn.setAttribute('aria-disabled', canLock ? 'false' : 'true');
}

function getDrawHelperTargetLatLng() {
  if (activeDrawMode === 'radius') {
    if (radiusDragBubble && radiusDragBubble.getLatLng) return radiusDragBubble.getLatLng();
    if (radiusDraftCenter) return L.latLng(radiusDraftCenter);
  }
  if (activeDrawMode === 'rect') {
    if (rectDragBubble && rectDragBubble.getLatLng) return rectDragBubble.getLatLng();
    if (rectDraftCenter) return L.latLng(rectDraftCenter);
  }
  return null;
}

function updateDrawHelperPosition(latlng) {
  const helper = document.getElementById('htDrawHelper');
  if (!helper || !map) return;
  if (drawHelperPinnedBottom) return;
  const target = latlng || getDrawHelperTargetLatLng();
  if (!target) return;
  const container = map.getContainer();
  if (!container) return;
  const point = map.latLngToContainerPoint(target);
  const rect = container.getBoundingClientRect();
  const helperRect = helper.getBoundingClientRect();
  const size = map.getSize ? map.getSize() : { x: rect.width, y: rect.height };
  const safePad = 18;
  const leftSide = point.x > size.x * 0.55;
  const upperSide = point.y > size.y * 0.5;
  const offsetX = leftSide ? -(helperRect.width + safePad) : 72;
  const offsetY = upperSide ? -(helperRect.height + safePad) : 28;
  let left = rect.left + point.x + offsetX;
  let top = rect.top + point.y + offsetY;
  const minPad = 12;
  const maxLeft = window.innerWidth - helperRect.width - minPad;
  const maxTop = window.innerHeight - helperRect.height - minPad;
  left = Math.max(minPad, Math.min(left, maxLeft));
  top = Math.max(minPad, Math.min(top, maxTop));
  helper.style.left = `${left}px`;
  helper.style.top = `${top}px`;
  helper.style.bottom = 'auto';
  helper.style.transform = 'translate(0, 0)';
  helper.classList.add('ht-draw-helper-floating');
}

function resetDrawHelperPosition() {
  const helper = document.getElementById('htDrawHelper');
  if (!helper) return;
  helper.style.removeProperty('left');
  helper.style.removeProperty('top');
  helper.style.removeProperty('bottom');
  helper.style.removeProperty('transform');
  helper.classList.remove('ht-draw-helper-floating');
}

function anchorDrawHelperAboveToolbar() {
  const helper = document.getElementById('htDrawHelper');
  const toolbar = document.getElementById('toolbar');
  if (!helper || !toolbar) return;
  const height = Math.max(64, Math.round(toolbar.getBoundingClientRect().height || 0));
  helper.style.bottom = `calc(env(safe-area-inset-bottom) + ${height + 6}px)`;
}

function showDrawHelper(mode, message) {
  const helper = ensureDrawHelper();
  const textEl = document.getElementById('htDrawHelperText');
  if (textEl) textEl.textContent = message || '';
  const resetBtn = document.getElementById('htDrawHelperReset');
  if (resetBtn) {
    resetBtn.style.display = (mode === 'radius' || mode === 'rect' || mode === 'polygon' || mode === 'saved')
      ? 'inline-flex'
      : 'none';
  }
  helper.classList.add('active');
  activeDrawMode = mode || null;
  updateDrawHelperLockState();
  drawHelperPinnedBottom = activeDrawMode === 'radius'
    || activeDrawMode === 'rect'
    || activeDrawMode === 'polygon'
    || activeDrawMode === 'saved';
  resetDrawHelperPosition();
  if (drawHelperPinnedBottom) {
    anchorDrawHelperAboveToolbar();
  }
  updateDrawHelperPosition();
  // ── Guardrail: push locate button above this bar ──
  requestAnimationFrame(() => updateLocateMeOffset());
}

function hideDrawHelper() {
  const helper = document.getElementById('htDrawHelper');
  if (helper) helper.classList.remove('active');
  activeDrawMode = null;
  drawHelperPinnedBottom = false;
  resetDrawHelperPosition();
  // ── Guardrail: recalc locate button position after bar hides ──
  requestAnimationFrame(() => updateLocateMeOffset());
  if (drawHelperFollowHandler && map) {
    try { map.off('move', drawHelperFollowHandler); } catch {}
    try { map.off('zoom', drawHelperFollowHandler); } catch {}
  }
  drawHelperFollowHandler = null;
}

window.cancelDrawHelper = function() {
  const wasSavedSelection = activeDrawMode === 'saved';
  if (activeDrawHandler && typeof activeDrawHandler.disable === 'function') {
    activeDrawHandler.disable();
  }
  activeDrawHandler = null;
  mapClickMode = null;
  if (pendingPolygonLayer) {
    try { map.removeLayer(pendingPolygonLayer); } catch {}
    if (drawnItems && drawnItems.hasLayer(pendingPolygonLayer)) {
      drawnItems.removeLayer(pendingPolygonLayer);
    }
    pendingPolygonLayer = null;
  }
  clearPolygonGuide();
  clearRadiusDraft();
  clearRectDraft();
  hideDrawHelper();
  if (wasSavedSelection) {
    clearSelectedArea();
    const select = document.getElementById('savedPropertySelect');
    if (select) select.value = '';
  }
  if (fieldCommandFlowActive) {
    setFieldCommandStep(1);
    openFieldCommandTray();
  }
  updateTrayToggleButton();
};

window.resetDrawHelper = function() {
  if (activeDrawMode === 'saved') {
    if (selectedAreaLayer && selectedAreaLayer.getBounds) {
      map.fitBounds(selectedAreaLayer.getBounds(), { padding: [40, 40] });
    }
    showQuickHint('Area refreshed.', 1200);
    updateDrawHelperLockState();
    return;
  }
  if (activeDrawMode === 'radius') {
    clearRadiusDraft();
    showQuickHint('Touch a point on the map to set the center.', 1400);
    updateDrawHelperLockState();
    return;
  }
  if (activeDrawMode === 'rect') {
    clearRectDraft();
    showQuickHint('Touch a point on the map to place the box.', 1400);
    updateDrawHelperLockState();
    return;
  }
  if (activeDrawMode === 'polygon') {
    if (pendingPolygonLayer) {
      try { map.removeLayer(pendingPolygonLayer); } catch {}
      if (drawnItems && drawnItems.hasLayer(pendingPolygonLayer)) {
        drawnItems.removeLayer(pendingPolygonLayer);
      }
      pendingPolygonLayer = null;
    }
    if (activeDrawHandler && typeof activeDrawHandler.disable === 'function') {
      activeDrawHandler.disable();
    }
    activeDrawHandler = new L.Draw.Polygon(map, drawControl.options.draw.polygon);
    activeDrawHandler.enable();
    showQuickHint('Tap points around the area.', 1600);
    updateDrawHelperLockState();
  }
};

window.lockDrawHelper = function() {
  if (activeDrawMode === 'saved' && selectedAreaLayer) {
    hideDrawHelper();
    showQuickHint('Area locked.', 1200);
    window.lockInArea();
    return;
  }
  if (activeDrawMode === 'radius' && radiusDraftCircle) {
    if (radiusDraftMoveHandler) {
      try { map.off('mousemove', radiusDraftMoveHandler); } catch {}
      try { map.off('touchmove', radiusDraftMoveHandler); } catch {}
      radiusDraftMoveHandler = null;
    }
    setSelectedArea(radiusDraftCircle, 'radius');
    radiusDraftCircle = null;
    radiusDraftCenter = null;
    if (radiusDragBubble) {
      try { map.removeLayer(radiusDragBubble); } catch {}
      radiusDragBubble = null;
    }
    if (radiusDraftCenterMarker) {
      try { map.removeLayer(radiusDraftCenterMarker); } catch {}
      radiusDraftCenterMarker = null;
    }
    clearRadiusDragHandles();
    mapClickMode = null;
    hideDrawHelper();
    showQuickHint('Radius locked.', 1200);
    return;
  }
  if (activeDrawMode === 'rect' && rectDraftRect) {
    if (rectDraftMoveHandler) {
      try { map.off('mousemove', rectDraftMoveHandler); } catch {}
      try { map.off('touchmove', rectDraftMoveHandler); } catch {}
      rectDraftMoveHandler = null;
    }
    setSelectedArea(rectDraftRect, 'boundary');
    rectDraftRect = null;
    rectDraftCenter = null;
    if (rectDragBubble) {
      try { map.removeLayer(rectDragBubble); } catch {}
      rectDragBubble = null;
    }
    if (rectDraftCenterMarker) {
      try { map.removeLayer(rectDraftCenterMarker); } catch {}
      rectDraftCenterMarker = null;
    }
    clearRectDragHandles();
    mapClickMode = null;
    hideDrawHelper();
    showQuickHint('Box locked.', 1200);
    return;
  }
  if (activeDrawMode === 'polygon' && pendingPolygonLayer) {
    if (activeDrawHandler && typeof activeDrawHandler.disable === 'function') {
      activeDrawHandler.disable();
    }
    activeDrawHandler = null;
    setSelectedArea(pendingPolygonLayer, 'polygon');
    pendingPolygonLayer = null;
    mapClickMode = null;
    hideDrawHelper();
    showQuickHint('Area locked.', 1200);
  }
};

const noticeCooldowns = new Map();

function showNoticeThrottled(key, message, type = 'info', duration = 3200, cooldownMs = 60000) {
  if (!UI_NOTICES_ENABLED) return;
  const now = Date.now();
  const last = noticeCooldowns.get(key) || 0;
  if (now - last < cooldownMs) return;
  noticeCooldowns.set(key, now);
  showNotice(message, type, duration);
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
    if (layer === 'trout') isActive = flyWaterLayerEnabled;
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
    return;
  }
  if (key === 'trout') {
    setFlyWaterLayerEnabled(!flyWaterLayerEnabled, { explore: true });
  }
};


// ===================================================================
//   Modals
// ===================================================================
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

function openChoiceModal({ title, message, primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = `
    <h3>${title || 'Confirm'}</h3>
    <p>${message || ''}</p>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn ghost" type="button">${secondaryLabel || 'Cancel'}</button>
      <button class="ht-modal-btn primary" type="button">${primaryLabel || 'Continue'}</button>
    </div>
  `;

  const closeModal = () => {
    backdrop.remove();
  };
  const secondaryBtn = modal.querySelector('.ht-modal-btn.ghost');
  const primaryBtn = modal.querySelector('.ht-modal-btn.primary');

  secondaryBtn.addEventListener('click', () => {
    closeModal();
    if (typeof onSecondary === 'function') onSecondary();
  });
  primaryBtn.addEventListener('click', () => {
    closeModal();
    if (typeof onPrimary === 'function') onPrimary();
  });

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
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

function openDeerPinModal({ onSubmit, defaults = {}, title, confirmLabel }) {
  const isMush = isMushroomModule();
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  const modal = document.createElement('div');
  modal.className = 'ht-modal';
  modal.innerHTML = `
    <h3>${title || (isMush ? 'Log Forage Pin' : 'Log Deer Pin')}</h3>
    <div style="display:grid;gap:8px;">
      <label style="font-size:12px;color:#bbb;">${isMush ? 'Find Type' : 'Deer Sign'}</label>
      <select id="deerPinType" class="ht-select">
        ${isMush ? `
        <option value="morel" selected>Morel</option>
        <option value="chanterelle">Chanterelle</option>
        <option value="oyster">Oyster</option>
        <option value="hen_of_woods">Hen of the Woods</option>
        <option value="chicken_of_woods">Chicken of the Woods</option>
        <option value="lions_mane">Lion's Mane</option>
        <option value="host_tree">Host Tree</option>
        <option value="dead_elm">Dead Elm</option>
        <option value="moisture">Moisture Zone</option>
        <option value="other_mushroom">Other Mushroom</option>
        ` : `
        <option value="rubs">Rubs</option>
        <option value="scrapes">Scrapes</option>
        <option value="tracks">Tracks</option>
        <option value="trail" selected>Trail</option>
        <option value="bedding">Bedding</option>
        <option value="feed">Feeding</option>
        <option value="water">Water</option>
        <option value="crossing">Crossing</option>
        <option value="funnel">Funnel</option>
        <option value="camera">Camera</option>
        <option value="stand">Stand Site</option>
        <option value="sighting">Sighting</option>
        `}
      </select>
      <label style="font-size:12px;color:#bbb;">Confidence</label>
      <select id="deerPinConfidence" class="ht-select">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
      </select>
      <label style="font-size:12px;color:#bbb;">Notes</label>
      <textarea id="deerPinNotes" rows="4" style="width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,193,7,0.3);color:#fff;border-radius:10px;padding:10px;font-size:14px;outline:none;"></textarea>
    </div>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn ghost" id="deerPinCancel">Cancel</button>
      <button class="ht-modal-btn primary" id="deerPinSave">${confirmLabel || (isMushroomModule() ? 'Save Forage Pin' : 'Save Deer Pin')}</button>
    </div>
  `;

  const typeField = modal.querySelector('#deerPinType');
  const confidenceField = modal.querySelector('#deerPinConfidence');
  const notesField = modal.querySelector('#deerPinNotes');
  if (typeField && defaults.type) typeField.value = defaults.type;
  if (confidenceField && defaults.confidence) confidenceField.value = defaults.confidence;
  if (notesField && defaults.notes) notesField.value = defaults.notes;

  const closeModal = () => backdrop.remove();
  modal.querySelector('#deerPinCancel')?.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  modal.querySelector('#deerPinSave')?.addEventListener('click', () => {
    const type = modal.querySelector('#deerPinType')?.value || 'trail';
    const confidence = modal.querySelector('#deerPinConfidence')?.value || 'medium';
    const notes = modal.querySelector('#deerPinNotes')?.value || '';
    if (typeof onSubmit === 'function') onSubmit({ type, confidence, notes });
    closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function findDeerPinEntry(id) {
  if (!id) return null;
  return huntJournalEntries.find((entry) => entry.id === id && entry.type === 'deer_pin') || null;
}

function formatDeerPinCoords(coords) {
  if (!Array.isArray(coords) || coords.length < 2) return '';
  const lat = Number(coords[0]);
  const lng = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function buildDeerPinPopup(entry) {
  if (!entry) return '';
  const coordsText = formatDeerPinCoords(entry.coords);
  const sign = escapeHtml(entry.signType || 'sign');
  const confidence = escapeHtml(entry.confidence || 'medium');
  return `
    <div class="ht-pin-popup">
      <div class="ht-pin-popup-title">${isMushroomModule() ? 'Forage Pin' : 'Deer Pin'}</div>
      <div class="ht-pin-popup-meta">${sign} • ${confidence} confidence</div>
      <div class="ht-pin-popup-coords">${coordsText}</div>
      <div class="ht-pin-popup-actions">
        <button class="ht-pin-popup-btn" type="button" onclick="copyDeerPinCoords('${entry.id}')">Copy</button>
        <button class="ht-pin-popup-btn" type="button" onclick="editDeerPin('${entry.id}')">Edit</button>
        <button class="ht-pin-popup-btn ht-pin-popup-btn--danger" type="button" onclick="deleteDeerPin('${entry.id}')">Delete</button>
      </div>
    </div>
  `;
}

function registerDeerPinMarker(entry) {
  if (!map || !entry) return null;
  const latlng = L.latLng(entry.coords[0], entry.coords[1]);
  const marker = L.marker(latlng, { icon: getDeerSignPinIcon(entry.signType) }).addTo(map);
  marker.__deerPinData = entry;
  marker.bindPopup(buildDeerPinPopup(entry), { closeButton: true, autoClose: true });
  marker.on('click', () => marker.openPopup());
  deerPinMarkers.set(entry.id, marker);
  return marker;
}

function updateDeerPinMarker(entry) {
  if (!entry) return;
  const marker = deerPinMarkers.get(entry.id);
  if (!marker) return;
  marker.__deerPinData = entry;
  marker.setIcon(getDeerSignPinIcon(entry.signType));
  marker.setPopupContent(buildDeerPinPopup(entry));
}

window.copyDeerPinCoords = function(id) {
  const entry = findDeerPinEntry(id);
  const coordsText = entry ? formatDeerPinCoords(entry.coords) : '';
  if (!coordsText) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(coordsText)
      .then(() => showNotice('Coordinates copied.', 'success', 2200))
      .catch(() => showNotice('Copy failed. Try again.', 'warning', 2200));
    return;
  }
  const temp = document.createElement('textarea');
  temp.value = coordsText;
  temp.setAttribute('readonly', 'readonly');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
    showNotice('Coordinates copied.', 'success', 2200);
  } catch {
    showNotice('Copy failed. Try again.', 'warning', 2200);
  }
  temp.remove();
};

window.editDeerPin = function(id) {
  const entry = findDeerPinEntry(id);
  if (!entry) return;
  openDeerPinModal({
    title: isMushroomModule() ? 'Edit Forage Pin' : 'Edit Deer Pin',
    confirmLabel: 'Update Pin',
    defaults: {
      type: entry.signType,
      confidence: entry.confidence,
      notes: entry.notes
    },
    onSubmit: ({ type, confidence, notes }) => {
      entry.signType = type;
      entry.confidence = confidence;
      entry.notes = notes;
      saveHuntJournal();
      updateDeerPinMarker(entry);
      showNotice(isMushroomModule() ? 'Forage pin updated.' : 'Deer pin updated.', 'success', 2400);
    }
  });
};

window.deleteDeerPin = function(id) {
  const entry = findDeerPinEntry(id);
  if (!entry) return;
  huntJournalEntries = huntJournalEntries.filter((item) => item.id !== id);
  saveHuntJournal();
  const marker = deerPinMarkers.get(id);
  if (marker && map) {
    try { map.removeLayer(marker); } catch {}
  }
  deerPinMarkers.delete(id);
  showNotice(isMushroomModule() ? 'Forage pin deleted.' : 'Deer pin deleted.', 'info', 2400);
};

function openTurkeyPinModal({ onSubmit }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'ht-modal-backdrop';
  backdrop.style.display = 'flex';

  // Build pin type options dynamically from turkey-data.js if available
  let pinTypeOptions = '';
  if (typeof TURKEY_PIN_TYPES !== 'undefined' && TURKEY_PIN_TYPES) {
    const types = Object.entries(TURKEY_PIN_TYPES);
    types.forEach(([key, pt], i) => {
      pinTypeOptions += `<option value="${key}"${i === 0 ? ' selected' : ''}>${pt.label}</option>\n`;
    });
  } else {
    // Fallback
    pinTypeOptions = `
        <option value="roost" selected>Roost tree/zone</option>
        <option value="gobble">Gobble heard</option>
        <option value="strut">Strut zone</option>
        <option value="feeding">Feeding area</option>
        <option value="scratchings">Scratchings</option>
        <option value="tracks">Tracks</option>
        <option value="dustingBowl">Dusting bowl</option>
        <option value="droppings">Droppings</option>
        <option value="feather">Feather</option>
        <option value="sighting">Visual sighting</option>
        <option value="callSetup">Call setup</option>
        <option value="pressure">Hunter pressure</option>
        <option value="access">Access/parking</option>
        <option value="decoy">Decoy setup</option>
        <option value="flydown">Fly-down</option>`;
  }

  const modal = document.createElement('div');
  modal.className = 'ht-modal ht-turkey-pin-popup';
  modal.innerHTML = `
    <h3 style="color:#c8a96e;">Drop Turkey Pin</h3>
    <div style="display:grid;gap:8px;">
      <label style="font-size:12px;color:rgba(232,220,200,0.7);">Pin Type</label>
      <select id="tpType" class="ht-select">
        ${pinTypeOptions}
      </select>
      <label style="font-size:12px;color:rgba(232,220,200,0.7);">Confidence</label>
      <select id="tpConfidence" class="ht-select">
        <option value="low">Low — guessing</option>
        <option value="medium" selected>Medium — likely</option>
        <option value="high">High — confirmed</option>
      </select>
      <label style="font-size:12px;color:rgba(232,220,200,0.7);">Notes</label>
      <textarea id="tpNotes" rows="4" style="width:100%;background:rgba(42,35,25,0.6);border:1px solid rgba(200,169,110,0.3);color:#e8dcc8;border-radius:10px;padding:10px;font-size:14px;outline:none;" placeholder="What did you see, hear, or find?"></textarea>
    </div>
    <div class="ht-modal-actions">
      <button class="ht-modal-btn ghost" id="tpCancel">Cancel</button>
      <button class="ht-modal-btn primary" id="tpSave">Save Turkey Pin</button>
    </div>
  `;

  const closeModal = () => backdrop.remove();
  modal.querySelector('#tpCancel')?.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });

  modal.querySelector('#tpSave')?.addEventListener('click', () => {
    const type = modal.querySelector('#tpType')?.value || 'roost';
    const confidence = modal.querySelector('#tpConfidence')?.value || 'medium';
    const notes = modal.querySelector('#tpNotes')?.value || '';
    if (typeof onSubmit === 'function') onSubmit({ type, confidence, notes });
    closeModal();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}


// ===================================================================
//   Search System
// ===================================================================
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
    weight: 4.5,
    opacity: 0.98,
    fillColor: '#ffc107',
    fillOpacity: 0.18,
    className: 'ht-mdc-area-selected'
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
    mdcSelectedAreaPopup = L.popup({ closeButton: true, autoClose: true, closeOnClick: true, className: 'ht-mdc-popup-dark' })
      .setLatLng(anchor)
      .setContent(`<div style="background:#0b0b0b;color:#ffd400;padding:8px 16px;border-radius:999px;font-weight:800;font-size:13px;border:1.5px solid #ffd400;text-align:center;">${escapeHtml(name)}</div>`)
      .openOn(map);
  }
}

async function fetchGeocodeResults(query) {
  // Google-style search: addresses, businesses, landmarks, state parks all work.
  // Use Nominatim with broad search (countrycodes=us for US focus, viewbox for Missouri bias)
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=8&addressdetails=1` +
    `&countrycodes=us` +
    `&viewbox=-95.77,40.61,-89.10,36.00&bounded=0` +
    `&q=${encodeURIComponent(query)}`
  );
  const results = await response.json();
  return results.map(result => {
    const addrParts = result.address || {};
    const typeLabel = addrParts.tourism || addrParts.leisure || addrParts.amenity ||
                      addrParts.shop || addrParts.office || result.type || 'Place';
    return {
      type: 'place',
      title: result.display_name,
      meta: typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1),
      latlng: L.latLng(parseFloat(result.lat), parseFloat(result.lon))
    };
  });
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

// ═══════════════════════════════════════════════════════════════════
//   Missouri State Parks — complete list with coordinates
//   These are searchable and appear in the Public Lands layer
// ═══════════════════════════════════════════════════════════════════
const MO_STATE_PARKS = [
  { name: 'Babler Memorial State Park', lat: 38.6078, lng: -90.6872, county: 'St. Louis', acres: 2441 },
  { name: 'Battle of Athens State Historic Site', lat: 40.5081, lng: -91.9528, county: 'Clark', acres: 165 },
  { name: 'Battle of Carthage State Historic Site', lat: 37.1522, lng: -94.3175, county: 'Jasper', acres: 14 },
  { name: 'Battle of Island Mound State Historic Site', lat: 38.1208, lng: -94.3906, county: 'Bates', acres: 40 },
  { name: 'Battle of Lexington State Historic Site', lat: 39.1903, lng: -93.8764, county: 'Lafayette', acres: 100 },
  { name: 'Bennett Spring State Park', lat: 37.7153, lng: -92.8547, county: 'Dallas', acres: 3216 },
  { name: 'Big Lake State Park', lat: 40.0536, lng: -95.3647, county: 'Holt', acres: 407 },
  { name: 'Big Oak Tree State Park', lat: 36.5686, lng: -89.2889, county: 'Mississippi', acres: 1004 },
  { name: 'Big Sugar Creek State Park', lat: 36.6217, lng: -93.8503, county: 'McDonald', acres: 2082 },
  { name: 'Bollinger Mill State Historic Site', lat: 37.3383, lng: -89.8497, county: 'Bollinger', acres: 43 },
  { name: 'Bothwell Lodge State Historic Site', lat: 38.7331, lng: -93.2247, county: 'Pettis', acres: 180 },
  { name: 'Bryant Creek State Park', lat: 36.7647, lng: -92.4600, county: 'Ozark', acres: 2917 },
  { name: 'Bushwhacker Museum State Historic Site', lat: 38.2503, lng: -94.3400, county: 'Vernon', acres: 1 },
  { name: 'Castlewood State Park', lat: 38.5911, lng: -90.5414, county: 'St. Louis', acres: 1818 },
  { name: 'Cliff Cave Park (Don Robinson State Park)', lat: 38.4519, lng: -90.7236, county: 'Jefferson', acres: 843 },
  { name: 'Confed. Memorial State Historic Site', lat: 38.8542, lng: -91.2464, county: 'Pike', acres: 135 },
  { name: 'Crowder State Park', lat: 40.1267, lng: -94.0753, county: 'Grundy', acres: 1912 },
  { name: 'Cuivre River State Park', lat: 39.1717, lng: -91.0178, county: 'Lincoln', acres: 6394 },
  { name: 'Dillard Mill State Historic Site', lat: 37.3217, lng: -91.0017, county: 'Crawford', acres: 132 },
  { name: 'Echo Bluff State Park', lat: 37.2625, lng: -91.4031, county: 'Shannon', acres: 412 },
  { name: 'Elephant Rocks State Park', lat: 37.6456, lng: -90.6742, county: 'Iron', acres: 129 },
  { name: 'Felix Valle House State Historic Site', lat: 37.9678, lng: -90.0350, county: 'Ste. Genevieve', acres: 1 },
  { name: 'Finger Lakes State Park', lat: 38.8514, lng: -92.1839, county: 'Boone', acres: 1128 },
  { name: 'First Missouri State Capitol State Historic Site', lat: 38.7856, lng: -90.4828, county: 'St. Charles', acres: 1 },
  { name: 'Fleming Park (Lake Jacomo)', lat: 38.8847, lng: -94.3647, county: 'Jackson', acres: 7800 },
  { name: 'Graham Cave State Park', lat: 38.8928, lng: -91.5583, county: 'Montgomery', acres: 386 },
  { name: 'Grand Gulf State Park', lat: 36.5333, lng: -91.6639, county: 'Oregon', acres: 322 },
  { name: 'Ha Ha Tonka State Park', lat: 37.9564, lng: -92.7642, county: 'Camden', acres: 3751 },
  { name: 'Harry S Truman Birthplace State Historic Site', lat: 37.4489, lng: -94.3578, county: 'Barton', acres: 1 },
  { name: 'Harry S Truman State Park', lat: 38.2481, lng: -93.3592, county: 'Benton', acres: 1440 },
  { name: 'Hawn State Park', lat: 37.8239, lng: -90.2272, county: 'Ste. Genevieve', acres: 4953 },
  { name: 'Jewell Cemetery State Historic Site', lat: 39.0681, lng: -94.1342, county: 'Jackson', acres: 5 },
  { name: 'Johnson\'s Shut-Ins State Park', lat: 37.5558, lng: -90.8447, county: 'Reynolds', acres: 8555 },
  { name: 'Katy Trail State Park', lat: 38.6622, lng: -91.7050, county: 'Multiple', acres: 3904 },
  { name: 'Knob Noster State Park', lat: 38.7306, lng: -93.5583, county: 'Johnson', acres: 3934 },
  { name: 'Lake of the Ozarks State Park', lat: 38.0758, lng: -92.6117, county: 'Camden', acres: 17626 },
  { name: 'Lake Wappapello State Park', lat: 37.0472, lng: -90.4089, county: 'Wayne', acres: 1854 },
  { name: 'Lewis & Clark State Park', lat: 39.5003, lng: -95.1225, county: 'Buchanan', acres: 121 },
  { name: 'Long Branch State Park', lat: 39.7725, lng: -92.5775, county: 'Macon', acres: 1834 },
  { name: 'Mark Twain Birthplace State Historic Site', lat: 39.4689, lng: -91.9700, county: 'Monroe', acres: 1 },
  { name: 'Mark Twain State Park', lat: 39.4847, lng: -91.9444, county: 'Monroe', acres: 2775 },
  { name: 'Mastodon State Historic Site', lat: 38.3831, lng: -90.3889, county: 'Jefferson', acres: 425 },
  { name: 'Meramec State Park', lat: 38.2128, lng: -91.1003, county: 'Franklin', acres: 6896 },
  { name: 'Montauk State Park', lat: 37.4539, lng: -91.6736, county: 'Dent', acres: 2014 },
  { name: 'Morris State Park', lat: 36.8153, lng: -89.5089, county: 'Bollinger', acres: 172 },
  { name: 'Onondaga Cave State Park', lat: 38.0675, lng: -91.2553, county: 'Crawford', acres: 1317 },
  { name: 'Osage Village State Historic Site', lat: 38.1658, lng: -94.0700, county: 'Vernon', acres: 100 },
  { name: 'Ozark Caverns (Lake of the Ozarks SP)', lat: 38.0750, lng: -92.6200, county: 'Camden', acres: 0 },
  { name: 'Perry State Park (Mark Twain Lake)', lat: 39.5000, lng: -91.7500, county: 'Ralls', acres: 3000 },
  { name: 'Pershing State Park', lat: 39.7986, lng: -93.3089, county: 'Linn', acres: 3560 },
  { name: 'Pomme de Terre State Park', lat: 37.8983, lng: -93.3642, county: 'Hickory', acres: 737 },
  { name: 'Prairie State Park', lat: 37.5122, lng: -94.6036, county: 'Barton', acres: 3942 },
  { name: 'Robertsville State Park', lat: 38.3628, lng: -90.9600, county: 'Franklin', acres: 1205 },
  { name: 'Rock Bridge Memorial State Park', lat: 38.8672, lng: -92.3403, county: 'Boone', acres: 2273 },
  { name: 'Roaring River State Park', lat: 36.5850, lng: -93.8258, county: 'Barry', acres: 4312 },
  { name: 'Route 66 State Park', lat: 38.5039, lng: -90.6853, county: 'St. Louis', acres: 409 },
  { name: 'Sam A. Baker State Park', lat: 37.2556, lng: -90.5183, county: 'Wayne', acres: 5323 },
  { name: 'Sandy Creek Covered Bridge State Historic Site', lat: 38.1503, lng: -91.6286, county: 'Jefferson', acres: 10 },
  { name: 'Scott Joplin House State Historic Site', lat: 38.6250, lng: -90.2114, county: 'St. Louis (city)', acres: 1 },
  { name: 'Stockton State Park', lat: 37.6808, lng: -93.7608, county: 'Cedar', acres: 2179 },
  { name: 'St. Francois State Park', lat: 37.9708, lng: -90.5353, county: 'St. Francois', acres: 2735 },
  { name: 'St. Joe State Park', lat: 37.8319, lng: -90.5672, county: 'St. Francois', acres: 8238 },
  { name: 'Table Rock State Park', lat: 36.5972, lng: -93.3172, county: 'Taney', acres: 356 },
  { name: 'Taum Sauk Mountain State Park', lat: 37.5706, lng: -90.7283, county: 'Iron', acres: 7448 },
  { name: 'Thousand Hills State Park', lat: 40.2025, lng: -92.6283, county: 'Adair', acres: 3215 },
  { name: 'Trail of Tears State Park', lat: 37.4578, lng: -89.4456, county: 'Cape Girardeau', acres: 3415 },
  { name: 'Van Meter State Park', lat: 39.2653, lng: -93.3453, county: 'Saline', acres: 1023 },
  { name: 'Wallace State Park', lat: 39.4453, lng: -94.5106, county: 'Clinton', acres: 502 },
  { name: 'Washington State Park', lat: 37.9692, lng: -90.6983, county: 'Washington', acres: 2147 },
  { name: 'Watkins Woolen Mill State Park & SHS', lat: 39.4306, lng: -94.2419, county: 'Clay', acres: 1572 },
  { name: 'Weston Bend State Park', lat: 39.4133, lng: -94.9419, county: 'Platte', acres: 1133 },
  { name: 'Wilson\'s Creek National Battlefield', lat: 37.1150, lng: -93.4003, county: 'Greene', acres: 1750 },
];

/**
 * Search Missouri State Parks by name (local, instant — no network)
 */
function searchMoStateParks(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return MO_STATE_PARKS
    .filter(p => p.name.toLowerCase().includes(q))
    .slice(0, 5)
    .map(p => ({
      type: 'public',
      title: `${p.name} (State Park)`,
      meta: `${p.county} County • ${p.acres > 0 ? p.acres.toLocaleString() + ' acres' : 'Historic Site'}`,
      latlng: L.latLng(p.lat, p.lng)
    }));
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

function getAreaKeyFromBounds(bounds) {
  if (!bounds) return '';
  const n = bounds.getNorth().toFixed(4);
  const s = bounds.getSouth().toFixed(4);
  const e = bounds.getEast().toFixed(4);
  const w = bounds.getWest().toFixed(4);
  return `n${n}_s${s}_e${e}_w${w}`;
}

function getHotspotKey(hotspot) {
  const coords = hotspot?.coords || hotspot?.latlng || null;
  if (!coords) return '';
  const ll = L.latLng(coords);
  return `pin_${ll.lat.toFixed(5)}_${ll.lng.toFixed(5)}`;
}

function metersToYards(meters) {
  return Math.round(meters * 1.09361);
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function findNearestTerrainFeature(latlng, features, maxMeters = 180) {
  if (!latlng || !Array.isArray(features) || !features.length) return null;
  let best = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const feature of features) {
    if (!feature || !feature.latlng) continue;
    const dist = L.latLng(latlng).distanceTo(feature.latlng);
    if (dist < bestDist) {
      bestDist = dist;
      best = feature;
    }
  }
  if (!best || bestDist > maxMeters) return null;
  return best;
}

function getAlignedAngleRad(align, windDir) {
  const wind = windDirToVector(windDir) || [1, 0];
  const base = Math.atan2(wind[1], wind[0]);
  if (align === 'crosswind') return base + Math.PI / 2;
  if (align === 'downwind') return base + Math.PI;
  return base;
}

function buildEllipsePolygon(center, majorMeters, minorMeters, angleRad, steps = 18) {
  const pts = [];
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const dx = Math.cos(t) * majorMeters;
    const dy = Math.sin(t) * minorMeters;
    const rx = dx * cosA - dy * sinA;
    const ry = dx * sinA + dy * cosA;
    pts.push(offsetLatLngMeters(center, rx, ry));
  }
  return pts;
}

function buildCorridorPolygon(center, lengthMeters, widthMeters, angleRad) {
  const halfL = lengthMeters / 2;
  const halfW = widthMeters / 2;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const dir = [cosA, sinA];
  const perp = [-sinA, cosA];
  const p1 = offsetLatLngMeters(center, dir[0] * halfL + perp[0] * halfW, dir[1] * halfL + perp[1] * halfW);
  const p2 = offsetLatLngMeters(center, dir[0] * halfL - perp[0] * halfW, dir[1] * halfL - perp[1] * halfW);
  const p3 = offsetLatLngMeters(center, -dir[0] * halfL - perp[0] * halfW, -dir[1] * halfL - perp[1] * halfW);
  const p4 = offsetLatLngMeters(center, -dir[0] * halfL + perp[0] * halfW, -dir[1] * halfL + perp[1] * halfW);
  return [p1, p2, p3, p4];
}

function buildWedgePolygon(center, radiusMeters, angleRad, angleDeg) {
  const pts = [];
  const half = (angleDeg / 2) * (Math.PI / 180);
  const steps = 10;
  const start = angleRad - half;
  const end = angleRad + half;
  pts.push(L.latLng(center));
  for (let i = 0; i <= steps; i++) {
    const t = start + (i / steps) * (end - start);
    pts.push(offsetLatLngMeters(center, Math.cos(t) * radiusMeters, Math.sin(t) * radiusMeters));
  }
  pts.push(L.latLng(center));
  return pts;
}

function buildSearchSpecForFeature(feature, windDir) {
  const type = String(feature?.type || '').toLowerCase();
  const specs = {
    saddle: { shape: 'corridor', length: 120, width: 40, align: 'crosswind' },
    pinch: { shape: 'corridor', length: 110, width: 35, align: 'crosswind' },
    micro_pinch: { shape: 'corridor', length: 90, width: 30, align: 'crosswind' },
    bench: { shape: 'corridor', length: 120, width: 45, align: 'crosswind' },
    ridge_point: { shape: 'oval', rx: 70, ry: 45, align: 'crosswind' },
    micro_nob: { shape: 'oval', rx: 65, ry: 40, align: 'crosswind' },
    leeward_pocket: { shape: 'wedge', radius: 80, angle: 110, align: 'downwind' },
    thermal_drain: { shape: 'wedge', radius: 90, angle: 90, align: 'downwind' },
    creek_line: { shape: 'corridor', length: 120, width: 40, align: 'crosswind' },
    water_edge: { shape: 'corridor', length: 110, width: 40, align: 'crosswind' },
    cut_through: { shape: 'corridor', length: 100, width: 35, align: 'crosswind' },
    micro_exit: { shape: 'wedge', radius: 70, angle: 80, align: 'downwind' },
    micro_variance: { shape: 'oval', rx: 60, ry: 40, align: 'crosswind' }
  };
  const spec = specs[type] || null;
  if (!spec) return null;
  const angleRad = getAlignedAngleRad(spec.align, windDir);
  return { ...spec, angleRad };
}

function buildSearchSpecForHabitat(habitat, windDir) {
  const specs = {
    bedding: { shape: 'wedge', radius: 75, angle: 100, align: 'downwind' },
    transition: { shape: 'corridor', length: 110, width: 40, align: 'crosswind' },
    feeding: { shape: 'oval', rx: 80, ry: 45, align: 'crosswind' },
    water: { shape: 'corridor', length: 100, width: 35, align: 'crosswind' },
    open: { shape: 'oval', rx: 70, ry: 40, align: 'crosswind' }
  };
  const spec = specs[habitat] || specs.transition;
  const angleRad = getAlignedAngleRad(spec.align, windDir);
  return { ...spec, angleRad };
}

function buildHotspotSearchSpec(hotspot, windDir) {
  const habitat = String(hotspot?.habitat || '').toLowerCase();
  const coords = hotspot?.coords ? L.latLng(hotspot.coords[0], hotspot.coords[1]) : null;
  const fallbackFeature = (!hotspot?.searchFeature && coords)
    ? findNearestTerrainFeature(coords, terrainFeatures)
    : null;
  const feature = hotspot?.searchFeature || fallbackFeature || null;
  const fromFeature = feature ? buildSearchSpecForFeature(feature, windDir) : null;
  const base = fromFeature || buildSearchSpecForHabitat(habitat, windDir);
  const spec = { ...base };

  if (spec.shape === 'corridor') {
    spec.length = clampNumber(spec.length, 70, 140);
    spec.width = clampNumber(spec.width, 24, 60);
    spec.maxRadius = spec.length / 2;
    const yardsL = metersToYards(spec.length);
    const yardsW = metersToYards(spec.width);
    spec.label = `${yardsL} x ${yardsW} yd corridor`;
    spec.key = `corr_${Math.round(spec.length)}_${Math.round(spec.width)}`;
  } else if (spec.shape === 'wedge') {
    spec.radius = clampNumber(spec.radius, 55, 110);
    spec.angle = clampNumber(spec.angle, 70, 130);
    spec.maxRadius = spec.radius;
    const yardsR = metersToYards(spec.radius);
    spec.label = `${yardsR} yd downwind wedge`;
    spec.key = `wedge_${Math.round(spec.radius)}_${Math.round(spec.angle)}`;
  } else {
    spec.rx = clampNumber(spec.rx, 55, 110);
    spec.ry = clampNumber(spec.ry, 35, 70);
    spec.maxRadius = Math.max(spec.rx, spec.ry);
    const yardsL = metersToYards(spec.rx * 2);
    const yardsW = metersToYards(spec.ry * 2);
    spec.label = `${yardsL} x ${yardsW} yd sweep`;
    spec.key = `oval_${Math.round(spec.rx)}_${Math.round(spec.ry)}`;
  }

  return spec;
}

function buildSearchAreaLayer(center, spec) {
  if (!center || !spec) return null;
  const style = {
    color: '#ffd24d',
    weight: 2,
    opacity: 0.85,
    fillColor: '#ffd24d',
    fillOpacity: 0.08,
    dashArray: '4 6',
    className: 'ht-search-area'
  };
  if (spec.shape === 'corridor') {
    const pts = buildCorridorPolygon(center, spec.length, spec.width, spec.angleRad || 0);
    return L.polygon(pts, style);
  }
  if (spec.shape === 'wedge') {
    const pts = buildWedgePolygon(center, spec.radius, spec.angleRad || 0, spec.angle);
    return L.polygon(pts, style);
  }
  const pts = buildEllipsePolygon(center, spec.rx, spec.ry, spec.angleRad || 0);
  return L.polygon(pts, style);
}

function getHotspotSearchProfile(hotspot) {
  return buildHotspotSearchSpec(hotspot, activeWindDir);
}

function clearActiveSearchArea() {
  activeSearchArea = null;
  clearMicroFeatures();
  if (searchAreaLayer) {
    try { map.removeLayer(searchAreaLayer); } catch {}
    searchAreaLayer = null;
  }
}

function setActiveSearchArea(hotspot) {
  if (!hotspot || !map) return;
  const coords = hotspot.coords || hotspot.latlng;
  if (!coords) return;
  const center = L.latLng(coords);
  const profile = getHotspotSearchProfile(hotspot);
  const pinKey = getHotspotKey(hotspot);
  const key = `${pinKey}_${profile.key}`;

  clearActiveSearchArea();

  const layer = buildSearchAreaLayer(center, profile);
  if (!layer) return;
  searchAreaLayer = layer.addTo(map);
  const areaType = layer instanceof L.Circle ? 'radius' : 'polygon';

  activeSearchArea = {
    key,
    pinKey,
    center,
    radiusMeters: profile.maxRadius || null,
    bounds: searchAreaLayer.getBounds(),
    hotspot,
    completed: false,
    layer: searchAreaLayer,
    areaType,
    profile
  };

  map.fitBounds(searchAreaLayer.getBounds(), { padding: [40, 40] });
}


// ===================================================================
//   Coverage & Tracking
// ===================================================================
function playSoftDing() {
  const ctx = window.AudioContext ? new AudioContext() : (window.webkitAudioContext ? new webkitAudioContext() : null);
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(784, now);
  osc.frequency.exponentialRampToValueAtTime(523, now + 0.28);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.35);
  osc.onended = () => {
    try { ctx.close(); } catch {}
  };
}

function triggerSearchCompleteAlert() {
  if (navigator.vibrate) {
    try { navigator.vibrate([120, 60, 160]); } catch {}
  }
  playSoftDing();
  showNotice('Search complete. Time to move to the next pin.', 'success', 5200);
}

function getTrackingBounds() {
  if (activeSearchArea && activeSearchArea.bounds) return activeSearchArea.bounds;
  if (lastPlanSnapshot && lastPlanSnapshot.bounds) {
    const b = lastPlanSnapshot.bounds;
    return L.latLngBounds([b.south, b.west], [b.north, b.east]);
  }
  if (selectedAreaLayer && selectedAreaLayer.getBounds) return selectedAreaLayer.getBounds();
  return map ? map.getBounds() : null;
}

function ensureTrackingCoverageLayer() {
  if (trackingCoverageLayer) return trackingCoverageLayer;
  trackingCoverageLayer = L.layerGroup().addTo(map);
  return trackingCoverageLayer;
}

function buildCoverageGrid(bounds, options = {}) {
  if (!bounds) return [];
  const center = options.center ? L.latLng(options.center) : null;
  const radiusMeters = Number.isFinite(options.radiusMeters) ? options.radiusMeters : null;
  const areaLayer = options.areaLayer || null;
  const areaType = options.areaType || null;
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();
  const latSpan = Math.max(0.0001, Math.abs(north - south));
  const lngSpan = Math.max(0.0001, Math.abs(east - west));
  let target = 360;
  if (radiusMeters) {
    const area = Math.PI * radiusMeters * radiusMeters;
    target = Math.max(90, Math.min(360, Math.round(area / 450)));
  }
  const steps = Math.max(6, Math.min(24, Math.round(Math.sqrt(target))));
  const latStep = latSpan / steps;
  const lngStep = lngSpan / steps;
  const grid = [];

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const lat = south + latStep * i;
      const lng = west + lngStep * j;
      const point = L.latLng(lat, lng);
      if (center && radiusMeters && center.distanceTo(point) > radiusMeters) continue;
      if (areaLayer && areaType && !isPointInAreaLayer(point, areaLayer, areaType)) continue;
      grid.push(point);
    }
  }

  return grid;
}

function saveTrackingCoverage() {
  if (!trackingAreaKey) return;
  let payload = {};
  try {
    payload = JSON.parse(localStorage.getItem(TRACKING_STORAGE_KEY) || '{}');
  } catch {
    payload = {};
  }

  payload[trackingAreaKey] = {
    path: trackingPath.map((p) => [p.lat, p.lng]).slice(-2400),
    visited: Array.from(trackingCoverageVisited),
    distance: trackingDistanceMeters,
    steps: trackingSteps,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

function loadTrackingCoverage(areaKey) {
  if (!areaKey) return false;
  let payload = {};
  try {
    payload = JSON.parse(localStorage.getItem(TRACKING_STORAGE_KEY) || '{}');
  } catch {
    payload = {};
  }

  const entry = payload[areaKey];
  if (!entry || !Array.isArray(entry.path)) return false;

  trackingPath = entry.path.map((p) => L.latLng(p[0], p[1]));
  trackingDistanceMeters = Number(entry.distance) || 0;
  trackingSteps = Number(entry.steps) || 0;
  trackingCoverageVisited = new Set(Array.isArray(entry.visited) ? entry.visited : []);
  return true;
}

function renderTrackingCoverage() {
  if (!map) return;
  ensureTrackingCoverageLayer();
  if (trackingCoverageShade) trackingCoverageLayer.removeLayer(trackingCoverageShade);
  if (trackingCoverageLine) trackingCoverageLayer.removeLayer(trackingCoverageLine);

  if (!trackingPath.length) return;

  trackingCoverageShade = L.polyline(trackingPath, {
    color: '#00ff88',
    weight: 18,
    opacity: 0.1,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(trackingCoverageLayer);

  trackingCoverageLine = L.polyline(trackingPath, {
    color: '#7cffc7',
    weight: 3,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(trackingCoverageLayer);
}

function updateCoverageFromPoint(latlng) {
  if (!trackingCoverageGrid || !trackingCoverageGrid.length) return;
  if (activeSearchArea?.layer && activeSearchArea?.areaType) {
    if (!isPointInAreaLayer(latlng, activeSearchArea.layer, activeSearchArea.areaType)) return;
  }
  const buffer = 28;
  for (let i = 0; i < trackingCoverageGrid.length; i++) {
    if (trackingCoverageVisited.has(i)) continue;
    const dist = latlng.distanceTo(trackingCoverageGrid[i]);
    if (dist <= buffer) trackingCoverageVisited.add(i);
  }

  const total = trackingCoverageGrid.length || 1;
  trackingCoveragePercent = Math.min(100, Math.round((trackingCoverageVisited.size / total) * 100));
  if (activeSearchArea && !activeSearchArea.completed && trackingCoveragePercent >= 95) {
    activeSearchArea.completed = true;
    if (activeSearchArea.pinKey) completedSearchAreas.add(activeSearchArea.pinKey);
    triggerSearchCompleteAlert();
    updateEducationCheckinButton();
  }
}

function ensureTrackingArea() {
  const bounds = getTrackingBounds();
  if (!bounds) return;
  const key = activeSearchArea?.key || getAreaKeyFromBounds(bounds);
  if (key && key !== trackingAreaKey) {
    trackingAreaKey = key;
    trackingCoverageGrid = buildCoverageGrid(bounds, activeSearchArea ? {
      center: activeSearchArea.center,
      radiusMeters: activeSearchArea.radiusMeters,
      areaLayer: activeSearchArea.layer || null,
      areaType: activeSearchArea.areaType || null
    } : undefined);
    trackingCoverageVisited = new Set();
    trackingPath = [];
    trackingDistanceMeters = 0;
    trackingSteps = 0;
    trackingLastPoint = null;
    loadTrackingCoverage(key);
    renderTrackingCoverage();
  }
}

function updateTrackingFromPosition(latlng) {
  if (!trackingActive || !latlng) return;
  ensureTrackingArea();
  const last = trackingLastPoint;
  if (!last || last.distanceTo(latlng) >= 6) {
    if (last) {
      trackingDistanceMeters += last.distanceTo(latlng);
      trackingSteps = Math.round(trackingDistanceMeters / 0.8);
    }
    trackingPath.push(latlng);
    trackingLastPoint = latlng;
    updateCoverageFromPoint(latlng);

    if (!trackingCoverageLine || !trackingCoverageShade) {
      renderTrackingCoverage();
    } else {
      trackingCoverageLine.setLatLngs(trackingPath);
      trackingCoverageShade.setLatLngs(trackingPath);
    }

    const now = Date.now();
    if (now - trackingLastSave > 30000) {
      saveTrackingCoverage();
      trackingLastSave = now;
    }
  }
}

function getTrackingStatsSnapshot() {
  const miles = trackingDistanceMeters / 1609.34;
  return {
    miles: Number.isFinite(miles) ? miles : 0,
    steps: trackingSteps || 0,
    coverage: trackingCoveragePercent || 0
  };
}

function updateCoachFromPosition(latlng) {
  if (!coachActive || !trackingActive || !latlng) return;

  const now = Date.now();
  if (!coachLastMoveAt) coachLastMoveAt = now;
  if (trackingLastPoint && trackingLastPoint.distanceTo(latlng) >= 12) {
    coachLastMoveAt = now;
  }

  const milestones = [35, 60, 80, 92];
  for (const mark of milestones) {
    if (trackingCoveragePercent >= mark && !coachCoverageMilestones.has(mark)) {
      coachCoverageMilestones.add(mark);
      if (mark >= 80) {
        showNotice(`Coverage ${mark}%: this pocket is worked. Shift to the next subtle route or downwind edge.`, 'info', 5200);
      } else {
        showNotice(`Coverage ${mark}%: keep sweeping the downwind side and quiet exits.`, 'info', 4200);
      }
    }
  }

  if (now - coachLastTipAt < 120000) return;
  coachLastTipAt = now;

  const tips = isMushroomModule() ? [
    'Focus on moisture pockets: north-facing slopes, creek bottoms, and shaded draws hold morels longer.',
    'Check fallen elm, ash, tulip poplar, and old apple trees — prime morel hosts.',
    'Scan at ankle-height in slow sweeping lanes. Morels blend into leaf litter easily.',
    'If you find one morel, stop and grid a tight 20-foot circle — they rarely grow alone.'
  ] : [
    'Stay just downwind of the main line; mature bucks favor subtle exits with cover.',
    'Check micro pinches and quiet cut-throughs; older bucks avoid the obvious trails.',
    'Sweep small nobs and benches for sheds. They act like wind-safe observation points.',
    'If you are not finding fresh sign, drift to the next terrain break and restart the grid.'
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  showNotice(`${isMushroomModule() ? 'ForageCoach' : 'HuntCoach'}: ${tip}`, 'info', 5200);
}

function getPreciseGeolocationOptions(overrides) {
  const base = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 20000
  };
  return Object.assign({}, base, overrides || {});
}

function maybeWarnLowAccuracy(accuracy) {
  if (!Number.isFinite(accuracy) || accuracy <= 0) return;
  const now = Date.now();
  const noticeGap = Number(window.HUNTECH_GPS_ACCURACY_NOTICE_MS || 60000);
  if (now - lastGpsAccuracyNoticeAt < noticeGap) return;
  lastGpsAccuracyNoticeAt = now;
  showNotice(`Low GPS accuracy (~${Math.round(accuracy)}m). Enable Precise Location for a tighter lock.`, 'warning', 5200);
}


// ===================================================================
//   GPS, Heading & Location
// ===================================================================
function startLocationWatch() {
  if (!navigator.geolocation) return;
  if (locationWatchId) navigator.geolocation.clearWatch(locationWatchId);

  locationWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      const filtered = filterGpsFix(userLatLng, pos.coords);
      if (!filtered) return;
      updateUserLocationMarker(filtered);
      updateUserHeadingFromGps(filtered, pos.coords);
      updateTrackingFromPosition(filtered);
      updateCoachFromPosition(filtered);
      hotspotMarkers.forEach((marker, index) => {
        const distance = filtered.distanceTo(marker.getLatLng());
        const key = `hotspot-${index}`;
        if (distance <= HOTSPOT_GEOFENCE_METERS && !hotspotVisited.has(key)) {
          hotspotVisited.add(key);
          // Educational cards are shown only when the user taps a pin.
        }
      });

      const featureGeofence = Number(window.TERRAIN_FEATURE_GEOFENCE_M || DEFAULT_TERRAIN_FEATURE_GEOFENCE_M);
      if (Array.isArray(terrainFeatures) && terrainFeatures.length) {
        for (const feature of terrainFeatures) {
          if (!feature || !feature.latlng || !feature.id) continue;
          if (terrainFeatureVisited.has(feature.id)) continue;
          const dist = filtered.distanceTo(feature.latlng);
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
    getPreciseGeolocationOptions()
  );
}

function filterGpsFix(latlng, coords) {
  if (!latlng || !coords) return null;
  const now = Date.now();
  const accuracy = Number(coords.accuracy || 0);
  const speed = Number.isFinite(coords.speed) ? coords.speed : null;
  const timeDelta = Math.max(1, now - (lastGpsFixAt || now));
  const maxAccuracy = Number(window.HUNTECH_GPS_MAX_ACCURACY_M || 8);
  const minAccuracy = Number(window.HUNTECH_GPS_MIN_ACCURACY_M || 4);
  const minMoveMeters = Number(window.HUNTECH_GPS_MIN_MOVE_M || 2.5);
  const jitterFactor = Number(window.HUNTECH_GPS_JITTER_FACTOR || 0.6);
  if (lastGpsFixAt && (now - lastGpsFixAt) < 600) {
    return null;
  }

  if (accuracy && accuracy > maxAccuracy) {
    maybeWarnLowAccuracy(accuracy);
    return null;
  }

  if (lastGpsFix) {
    const dist = lastGpsFix.distanceTo(latlng);
    const speedMps = speed !== null ? speed : (dist / (timeDelta / 1000));
    const maxSpeedMps = Number(window.HUNTECH_GPS_MAX_SPEED_MPS || 4);
    if (speedMps > maxSpeedMps && dist > 20) {
      return null;
    }
  }

  lastGpsFix = latlng;
  lastGpsFixAt = now;

  if (lastGpsFiltered && accuracy > 0) {
    const jitterThreshold = Math.max(minMoveMeters, accuracy * jitterFactor);
    const jitterDist = lastGpsFiltered.distanceTo(latlng);
    if (jitterDist < jitterThreshold && (speed === null || speed <= 1.2)) {
      lastGpsFilteredAt = now;
      return lastGpsFiltered;
    }
  }

  const accuracyNorm = accuracy > 0 ? Math.max(minAccuracy, accuracy) : maxAccuracy;
  const alphaBase = 0.04;
  const alpha = Math.min(0.15, Math.max(alphaBase, minAccuracy / accuracyNorm));

  if (!lastGpsFiltered) {
    lastGpsFiltered = latlng;
    lastGpsFilteredAt = now;
    return latlng;
  }

  const filtered = L.latLng(
    lastGpsFiltered.lat + (latlng.lat - lastGpsFiltered.lat) * alpha,
    lastGpsFiltered.lng + (latlng.lng - lastGpsFiltered.lng) * alpha
  );
  lastGpsFiltered = filtered;
  lastGpsFilteredAt = now;
  return filtered;
}

function getHeadingFromPoints(fromLatLng, toLatLng) {
  if (!fromLatLng || !toLatLng) return null;
  const from = L.latLng(fromLatLng);
  const to = L.latLng(toLatLng);
  const dLng = (to.lng - from.lng) * (Math.PI / 180);
  const lat1 = from.lat * (Math.PI / 180);
  const lat2 = to.lat * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = Math.atan2(y, x) * (180 / Math.PI);
  return (brng + 360) % 360;
}

function normalizeDegrees(deg) {
  const safe = Number(deg);
  if (!Number.isFinite(safe)) return 0;
  return ((safe % 360) + 360) % 360;
}

function shortestAngleDeltaDeg(fromDeg, toDeg) {
  const from = normalizeDegrees(fromDeg);
  const to = normalizeDegrees(toDeg);
  return ((to - from + 540) % 360) - 180;
}

function smoothAngleDeg(currentDeg, targetDeg, alpha) {
  if (!Number.isFinite(currentDeg)) return normalizeDegrees(targetDeg);
  const a = Number.isFinite(alpha) ? Math.min(1, Math.max(0, alpha)) : 0.15;
  const delta = shortestAngleDeltaDeg(currentDeg, targetDeg);
  return normalizeDegrees(currentDeg + delta * a);
}

function isCoarsePointerDevice() {
  try {
    return Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  } catch {
    return false;
  }
}

function getPreferredHeadingDeg(now = Date.now()) {
  if (Number.isFinite(deviceHeadingDeg) && deviceHeadingLastAt && (now - deviceHeadingLastAt) < 2000) return deviceHeadingDeg;
  if (Number.isFinite(smoothedHeadingDeg)) return smoothedHeadingDeg;
  if (Number.isFinite(userHeadingDeg)) return userHeadingDeg;
  return null;
}

function maybeApplyBearingFromHeading(headingDeg, now = Date.now()) {
  if (!map || compassLocked) return;
  if (!Number.isFinite(headingDeg)) return;

  const elapsed = now - (lastBearingUpdateAt || 0);
  const minInterval = MAP_ROTATION_MAX_HZ > 0 ? (1000 / MAP_ROTATION_MAX_HZ) : 0;
  // Suspend auto-rotation while user is actively gesturing on the map
  const suspend = (now - (lastMapInteractionAt || 0)) < MAP_ROTATION_SUSPEND_MS;
  if (suspend || elapsed < minInterval) return;

  const targetBearing = normalizeDegrees(-headingDeg);
  const delta = Math.abs(shortestAngleDeltaDeg(mapBearingDeg, targetBearing));
  if (delta < MAP_ROTATION_MIN_DELTA_DEG) return;

  // Gentle smoothing — don't fight the user's gestures
  mapBearingDeg = smoothAngleDeg(mapBearingDeg, targetBearing, 0.12);
  lastBearingUpdateAt = now;
  applyMapRotation();
}

async function startDeviceCompassHeading() {
  const setting = window.HUNTECH_USE_DEVICE_COMPASS;
  const enabledByDefault = isCoarsePointerDevice();
  const enabled = setting !== undefined ? Boolean(setting) : enabledByDefault;
  if (!enabled) return false;
  if (deviceCompassActive) return true;
  if (typeof window.DeviceOrientationEvent === 'undefined') return false;

  if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const state = await window.DeviceOrientationEvent.requestPermission();
      if (state !== 'granted') return false;
    } catch {
      return false;
    }
  }

  const pickHeading = (event) => {
    if (!event) return;
    let heading = null;

    // iOS Safari
    if (Number.isFinite(event.webkitCompassHeading)) {
      heading = event.webkitCompassHeading;
    } else if (Number.isFinite(event.alpha)) {
      // Many browsers: alpha is degrees clockwise from north (varies by platform).
      // Using 360-alpha yields a reasonable compass heading for most devices.
      heading = 360 - event.alpha;
    }

    if (!Number.isFinite(heading)) return;
    const now = Date.now();
    const next = normalizeDegrees(heading);
    deviceHeadingDeg = smoothAngleDeg(deviceHeadingDeg, next, 0.18);
    deviceHeadingLastAt = now;

    // Let the marker + map reflect the compass direction when available.
    userHeadingDeg = deviceHeadingDeg;
    applyUserHeadingToMarker();
    maybeApplyBearingFromHeading(deviceHeadingDeg, now);
  };

  deviceCompassHandler = pickHeading;
  deviceCompassEventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
  window.addEventListener(deviceCompassEventName, deviceCompassHandler, { passive: true });
  deviceCompassActive = true;
  return true;
}

function stopDeviceCompassHeading() {
  if (!deviceCompassActive) return;
  try {
    if (deviceCompassEventName && deviceCompassHandler) {
      window.removeEventListener(deviceCompassEventName, deviceCompassHandler);
    }
  } catch {}
  deviceCompassActive = false;
  deviceCompassHandler = null;
  deviceCompassEventName = '';
}

function getUserHeadingIcon(headingDeg) {
  const rotation = Number.isFinite(headingDeg) ? headingDeg : 0;
  const hasHeading = Number.isFinite(headingDeg);
  return L.divIcon({
    className: 'ht-user-location',
    html: `
      <div class="ht-user-heading ${hasHeading ? '' : 'is-unknown'}" style="--heading:${rotation}deg">
        <svg class="ht-user-arrow-svg" viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2 L32 60 L20 50 L8 60 Z"
                fill="#ffd400" stroke="#000" stroke-width="2.5"
                stroke-linejoin="round" />
        </svg>
        <div class="ht-user-heading-core"></div>
      </div>
    `,
    iconSize: [24, 48],
    iconAnchor: [12, 30]
  });
}

function applyUserHeadingToMarker() {
  if (!userLocationMarker || typeof userLocationMarker.setIcon !== 'function') return;
  userLocationMarker.setIcon(getUserHeadingIcon(userHeadingDeg));
}

function updateUserHeadingFromGps(latlng, coords) {
  let heading = Number.isFinite(coords?.heading) ? coords.heading : null;
  if (!Number.isFinite(heading) && lastHeadingLatLng && latlng.distanceTo(lastHeadingLatLng) >= 3) {
    heading = getHeadingFromPoints(lastHeadingLatLng, latlng);
  }
  if (Number.isFinite(heading)) {
    const now = Date.now();
    const next = normalizeDegrees(heading);
    smoothedHeadingDeg = smoothAngleDeg(smoothedHeadingDeg, next, MAP_ROTATION_SMOOTHING);
    // Only drive marker arrow from GPS when device compass isn't active.
    if (!deviceCompassActive) {
      userHeadingDeg = smoothedHeadingDeg;
    }
    lastHeadingLatLng = latlng;
    applyUserHeadingToMarker();

    // If compass-follow is on, lock map to the best heading source.
    maybeApplyBearingFromHeading(getPreferredHeadingDeg(now), now);
    return;
  }
  if (!lastHeadingLatLng) lastHeadingLatLng = latlng;
}

function updateUserLocationMarker(latlng) {
  if (!map || !latlng) return;
  if (userLocationMarker) {
    if (typeof userLocationMarker.setIcon !== 'function') {
      try { map.removeLayer(userLocationMarker); } catch {}
      userLocationMarker = null;
    } else {
      userLocationMarker.setLatLng(latlng);
      applyUserHeadingToMarker();
      saveLastKnownLocation(latlng);
      lockMapToUserLocation(latlng);
      return;
    }
  }
  userLocationMarker = L.marker(latlng, {
    icon: getUserHeadingIcon(userHeadingDeg),
    interactive: false,
    keyboard: false
  });
  userLocationMarker.addTo(map);
  saveLastKnownLocation(latlng);
  lockMapToUserLocation(latlng);
}

function lockMapToUserLocation(latlng) {
  if (!map || !latlng || !followUserLocation) return;
  const now = Date.now();
  if (lastFollowRecenterAt && (now - lastFollowRecenterAt) < MAP_FOLLOW_THROTTLE_MS) return;
  if (lastFollowLatLng && lastFollowLatLng.distanceTo(latlng) < MAP_FOLLOW_MIN_MOVE_METERS) return;

  try {
    const bounds = typeof map.getBounds === 'function' ? map.getBounds() : null;
    if (bounds && typeof bounds.pad === 'function' && typeof bounds.contains === 'function') {
      const safeBounds = bounds.pad(-Math.max(0, Math.min(0.45, MAP_FOLLOW_SAFE_BOUNDS_PAD)));
      if (safeBounds && safeBounds.contains(latlng)) {
        lastFollowLatLng = latlng;
        return;
      }
    }
  } catch {
    // Ignore bounds failures.
  }

  const maxZoom = typeof map.getMaxZoom === 'function' ? map.getMaxZoom() : 19;
  const targetZoom = Math.min(maxZoom, USER_LOCATION_FOCUS_ZOOM);
  const currentZoom = typeof map.getZoom === 'function' ? map.getZoom() : targetZoom;
  const nextZoom = Math.max(currentZoom || targetZoom, targetZoom);
  mapAutoCentering = true;
  lastFollowRecenterAt = now;
  lastFollowLatLng = latlng;
  if (Number.isFinite(currentZoom) && currentZoom + 0.1 < targetZoom) {
    map.setView(latlng, nextZoom, { animate: true });
    return;
  }
  if (typeof map.panTo === 'function') {
    map.panTo(latlng, { animate: true });
    return;
  }
  map.setView(latlng, nextZoom, { animate: true });
}


// ===================================================================
//   Land Layer Management
// ===================================================================
function saveLastKnownLocation(latlng) {
  if (!map || !latlng) return;
  try {
    const zoom = typeof map.getZoom === 'function' ? map.getZoom() : 12;
    const payload = {
      lat: latlng.lat,
      lng: latlng.lng,
      zoom,
      ts: Date.now()
    };
    localStorage.setItem(LAST_KNOWN_LOCATION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures.
  }
}

function restoreLastKnownLocation() {
  if (!map || selectedAreaLayer || defaultLocationAreaSet) return false;
  try {
    const raw = localStorage.getItem(LAST_KNOWN_LOCATION_STORAGE_KEY);
    if (!raw) return false;
    const stored = JSON.parse(raw);
    if (!stored || !Number.isFinite(stored.lat) || !Number.isFinite(stored.lng)) return false;
    const zoom = Number.isFinite(stored.zoom) ? stored.zoom : 12;
    map.setView([stored.lat, stored.lng], zoom, { animate: false });
    updateUserLocationMarker(L.latLng(stored.lat, stored.lng));
    return true;
  } catch {
    return false;
  }
}

function stopLocationWatch() {
  if (locationWatchId) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }
}

/** Update the locate-me button to show active/following visual state. */
function updateLocateBtnState() {
  const btn = document.querySelector('.ht-map-locate-btn');
  if (!btn) return;
  btn.classList.toggle('is-following', !!followUserLocation);
}

function centerOnMyLocationInternal() {
  if (!navigator.geolocation) {
    restoreLastKnownLocation();
    // showNotice('GPS not available. Enable location services.', 'error', 4200);
    return;
  }

  followUserLocation = true;
  updateLocateBtnState();
  // showNotice('Centering on your location…', 'info', 2200);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      const zoom = map && typeof map.getZoom === 'function' ? Math.max(map.getZoom(), 13) : 13;
      mapAutoCentering = true;
      updateUserLocationMarker(latlng);
      map.setView(latlng, zoom, { animate: true });
      // showNotice('Centered on your location.', 'success', 2800);
    },
    (err) => {
      const msg = err && err.message ? err.message : 'Unable to read GPS location.';
      restoreLastKnownLocation();
      // showNotice(`GPS failed: ${msg}`, 'error', 5200);
    },
    getPreciseGeolocationOptions({ timeout: 12000 })
  );
}

async function tryAutoCenterWithoutPrompt() {
  if (!navigator.geolocation) return;
  centerOnMyLocationInternal();
}

function setDefaultAreaFromLocation() {
  if (defaultLocationAreaSet || !navigator.geolocation || _suppressDefaultArea) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      if (defaultLocationAreaSet || selectedAreaLayer || _suppressDefaultArea) return;
      const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      updateUserLocationMarker(latlng);
      const radiusMiles = Number(window.HUNTECH_DEFAULT_RADIUS_MILES || 0.5);
      const safeMiles = Number.isFinite(radiusMiles) ? Math.max(0.1, radiusMiles) : 0.5;
      const radiusMeters = safeMiles * 1609.34;
      const circle = L.circle(latlng, {
        radius: radiusMeters,
        color: '#FFD700',
        weight: 2,
        fillColor: '#FFD700',
        fillOpacity: 0.12
      });
      circle.addTo(map);
      setSelectedArea(circle, 'radius', { suppressTray: true });

      const zoom = map && typeof map.getZoom === 'function' ? Math.max(map.getZoom(), 13) : 13;
      map.setView(latlng, zoom, { animate: true });
      defaultLocationAreaSet = true;
    },
    () => {},
    getPreciseGeolocationOptions({ timeout: 12000 })
  );
}

function showNearestHotspotEducationInternal() {
  if (!navigator.geolocation || hotspotMarkers.length === 0) {
    // showNotice(isMushroomModule() ? 'No hotspots available yet. Start a forage first.' : 'No hotspots available yet. Start a hunt first.', 'warning');
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
      showNotice('Nearest hotspot selected. Tap the pin to see details.', 'info', 3600);
    }
  }, null, getPreciseGeolocationOptions({ timeout: 12000 }));
}

function setPublicLandEnabled(enabled) {
  publicLandEnabled = enabled;
  if (publicLandEnabled) {
    enablePublicLandLayer();
    if (!mdcLandEnabled) setMdcLandEnabled(true);
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
    privateParcelsLayer = L.tileLayer(tileUrl, { opacity: 0.65, maxZoom: 19, zIndex: 460, keepBuffer: 6, updateWhenZooming: false, updateWhenIdle: true });
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
      Public land overlays are now visible. Always confirm the local ${isMushroomModule() ? 'foraging' : 'shed-hunting'} regulations
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
  publicLandLayer = L.tileLayer(tileUrl, { opacity: 0.7, maxZoom: 19, zIndex: 450, keepBuffer: 6, updateWhenZooming: false, updateWhenIdle: true });
  if (baseLayersControl) {
    try { baseLayersControl.addOverlay(publicLandLayer, 'Public Land'); } catch {}
  }
  map.addLayer(publicLandLayer);
  enableMoStateParksLayer(); // Show MO state parks alongside public lands

  showSelectionNoticeOnce(isMushroomModule() ? 'Public land overlay enabled. Verify local regulations for foraging access.' : 'Public land overlay enabled. Verify local regulations for shed hunting access.', 'info', 4200);
}

let moStateParksLayer = null;

function enableMoStateParksLayer() {
  if (moStateParksLayer || !map) return;
  moStateParksLayer = L.layerGroup();
  MO_STATE_PARKS.forEach(park => {
    if (!park.lat || !park.lng) return;
    const marker = L.circleMarker([park.lat, park.lng], {
      radius: 6,
      fillColor: '#4CAF50',
      color: '#1B5E20',
      weight: 2,
      opacity: 0.9,
      fillOpacity: 0.7
    });
    marker.bindPopup(
      `<div style="background:#0b0b0b;color:#4CAF50;padding:10px 14px;border-radius:8px;font-size:13px;border:1.5px solid #4CAF50;min-width:160px;">` +
      `<strong>${park.name}</strong><br>` +
      `<span style="color:#aaa;">${park.county} County${park.acres > 0 ? ' • ' + park.acres.toLocaleString() + ' acres' : ''}</span><br>` +
      `<span style="color:#7cffc7;font-size:11px;">Missouri State Park — Public Land</span>` +
      `</div>`,
      { className: 'ht-mdc-popup-dark' }
    );
    moStateParksLayer.addLayer(marker);
  });
  moStateParksLayer.addTo(map);
}

function disableMoStateParksLayer() {
  if (moStateParksLayer && map) {
    map.removeLayer(moStateParksLayer);
    moStateParksLayer = null;
  }
}

function disablePublicLandLayer() {
  if (publicLandLayer) map.removeLayer(publicLandLayer);
  disableMoStateParksLayer();
}

async function fetchMdcJson(url) {
  try {
    const res = await fetchWithTimeout(url, {}, 12000);
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

  mdcLandFeatures = Array.isArray(features) ? features : [];

  mdcLandLayer = L.geoJSON(mdcLandFeatures, {
    pane: 'mdcSelectionPane',
    style: () => ({
      color: '#ffd400',
      weight: 3,
      opacity: 1,
      fillColor: 'transparent',
      fillOpacity: 0,
      dashArray: null,
      className: 'ht-mdc-area-outline'
    }),
    onEachFeature: (feature, layer) => {
      layer.on('click', (event) => {
        if (event && event.originalEvent) {
          L.DomEvent.stopPropagation(event.originalEvent);
        }
        highlightMdcSelectedArea(feature);
        showMdcAreaSummary(feature);
      });
      layer.on('mouseover', () => {
        layer.setStyle({
          weight: 4.5,
          fillOpacity: 0,
          color: '#fff200'
        });
      });
      layer.on('mouseout', () => {
        layer.setStyle({
          weight: 3,
          fillOpacity: 0,
          color: '#ffd400'
        });
      });
      const attrs = feature?.attributes || {};
      const name = attrs.OFF_Name || attrs.Area_Name || 'MDC Conservation Area';
      const acreage = getMdcAcreage(attrs);
      const popup = `
        <div style="background:#0b0b0b;color:#ffd400;padding:8px 14px;border-radius:999px;font-weight:800;font-size:12px;border:1.5px solid #ffd400;text-align:center;white-space:nowrap;">${escapeHtml(name)}</div>
        ${acreage ? `<div style="background:#0b0b0b;color:#ffd400;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;text-align:center;margin-top:4px;">${escapeHtml(acreage)}</div>` : ''}
      `;
      maybeBindPopup(layer, popup);
    }
  }).addTo(map);

  updateMdcLandLabels();

  mdcLandLoading = false;
  showSelectionNoticeOnce('MDC conservation areas enabled.', 'success', 3200);
}

function disableMdcLandLayer() {
  removeMdcLandLayer();
  mdcLandFeatures = [];
  clearMdcLandLabels();
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


// ===================================================================
//   Shed Allowed Layer
// ===================================================================
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
    const _shedTitle = isMushroomModule() ? 'Foraging Allowed' : 'Shed Hunting Allowed';
    tile.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <div style="font-weight:bold;color:#FFD700;">${_shedTitle}</div>
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
    const _shedTitle2 = isMushroomModule() ? 'Foraging Allowed' : 'Shed Hunting Allowed';
    tile.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <div style="font-weight:bold;color:#FFD700;">${_shedTitle2}</div>
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

// Weather update with geolocation support

// ===================================================================
//   Weather
// ===================================================================
async function getWeatherLocation() {
  // Try to get user's actual location first
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      });
    });
    
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      source: 'gps',
      accuracy: position.coords.accuracy
    };
  } catch (error) {
    // Fall back to map center
    const center = map.getCenter();
    return {
      lat: center.lat,
      lng: center.lng,
      source: 'map',
      accuracy: null
    };
  }
}

async function updateWeather() {
  const location = await getWeatherLocation();
  
  try {
    const response = await fetchWithTimeout(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}` +
        `&current=temperature_2m,wind_speed_10m,wind_direction_10m` +
        `&hourly=temperature_2m,wind_speed_10m,wind_direction_10m` +
        `&forecast_days=2&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`,
      {},
      9000
    );
    const data = await response.json();
    
    const temp = Math.round(data.current.temperature_2m);
    const windSpeed = Math.round(data.current.wind_speed_10m);
    const windDir = ['N','NE','E','SE','S','SW','W','NW'][Math.round(data.current.wind_direction_10m/45)%8];
    activeWindDir = windDir;
    activeWindSpeed = windSpeed;
    activeTemperature = temp;
    updateCompassWind(windDir);
    
    const tempEl = document.querySelector('.ht-temp');
    const condEl = document.querySelector('.ht-conditions');
    if (tempEl) tempEl.textContent = `${temp}°`;
    if (condEl) condEl.textContent = `${windSpeed} mph ${windDir}`;

    weatherForecast = buildWeatherForecastFromOpenMeteo(data);
    weatherForecastUpdatedAt = Date.now();
    // Store location info for weather panel display
    weatherForecast.geoLocation = location;
    
    updateWeatherPanelIfOpen();
    
    // Show location-based feedback
    if (location.source === 'gps') {
      showNotice('📍 Weather updated using your GPS location', 'success', 2000);
    }
  } catch (error) {
    console.error('Weather update failed:', error);
    showNotice('⚠️ Weather update failed - check connection', 'warning', 3000);
  }
}

// Manual weather refresh function
window.manualWeatherRefresh = async function() {
  const refreshBtn = document.querySelector('.ht-weather-refresh');
  if (refreshBtn) {
    refreshBtn.innerHTML = '🔄 Refreshing...';
    refreshBtn.disabled = true;
  }
  
  try {
    await updateWeather();
    showNotice('🌤️ Weather data updated successfully', 'success', 2000);
  } catch (error) {
    console.error('Manual weather refresh failed:', error);
    showNotice('⚠️ Weather refresh failed', 'warning', 3000);
  } finally {
    if (refreshBtn) {
      refreshBtn.innerHTML = '🔄 Refresh Weather';
      refreshBtn.disabled = false;
    }
  }
};

// Search functionality

// ===================================================================
//   Toolbar & Navigation Commands
// ===================================================================
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
      // Search in parallel: geocode (addresses/businesses), MDC conservation areas, MO state parks
      const stateParks = searchMoStateParks(query);
      items.push(...stateParks);
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
  if (isShedModule() && !mapInitialized) {
    initializeMap();
  }
  if (isFlyModule() && !mapInitialized) {
    activateFlyMap();
  }
  const panel = document.getElementById('strategy-panel');
  if (panel) panel.style.display = 'block';
};

window.showProperties = function() {
  // Update nav button states
  document.querySelectorAll('.ht-nav-btn').forEach(btn => btn.classList.remove('ht-nav-active'));
  document.querySelector('[onclick="showProperties()"]').classList.add('ht-nav-active');
  
  // Create properties panel
  const existingPanel = document.getElementById('ht-properties-panel');
  if (existingPanel) {
    existingPanel.classList.add('visible');
    return;
  }
  
  const panel = document.createElement('div');
  panel.id = 'ht-properties-panel';
  panel.className = 'ht-nav-panel';
  
  panel.innerHTML = `
    <div class="ht-nav-panel-header">
      <button class="ht-nav-panel-close" onclick="closePropertiesPanel()">✕</button>
      <h1 class="ht-nav-panel-title">Conservation Areas</h1>
      <p class="ht-nav-panel-subtitle">Missouri Department of Conservation public hunting areas</p>
    </div>
    <div class="ht-nav-panel-content">
      <div class="ht-property-grid">
        <div class="ht-property-card">
          <div class="ht-property-image">🌲</div>
          <div class="ht-property-info">
            <h3 class="ht-property-name">Busch Wildlife Area</h3>
            <p class="ht-property-details">6,987 acres • Waterfowl, deer, turkey • Lake access</p>
          </div>
        </div>
        <div class="ht-property-card">
          <div class="ht-property-image">🌾</div>
          <div class="ht-property-info">
            <h3 class="ht-property-name">August A. Busch Wildlife Area</h3>
            <p class="ht-property-details">6,987 acres • Public hunting • Multiple habitats</p>
          </div>
        </div>
        <div class="ht-property-card">
          <div class="ht-property-image">🌳</div>
          <div class="ht-property-info">
            <h3 class="ht-property-name">Kickapoo Prairie</h3>
            <p class="ht-property-details">2,529 acres • Prairie restoration • Bird watching</p>
          </div>
        </div>
        <div class="ht-property-card">
          <div class="ht-property-image">🌊</div>
          <div class="ht-property-info">
            <h3 class="ht-property-name">Cuivre River State Park</h3>
            <p class="ht-property-details">6,394 acres • River access • Deer, turkey</p>
          </div>
        </div>
      </div>
      <p style="color: #666; font-size: 12px; text-align: center;">Tap any area on the map to view detailed regulations and access information.</p>
    </div>
  `;
  
  document.body.appendChild(panel);
  setTimeout(() => panel.classList.add('visible'), 50);
};

window.showHunts = function() {
  // Update nav button states (if hunts button existed)
  const isMushroomMod = isMushroomModule();
  
  // Create hunts panel
  const existingPanel = document.getElementById('ht-hunts-panel');
  if (existingPanel) {
    existingPanel.classList.add('visible');
    return;
  }
  
  const panel = document.createElement('div');
  panel.id = 'ht-hunts-panel';
  panel.className = 'ht-nav-panel';
  
  const title = isMushroomMod ? 'Forage History' : 'Hunt History';
  const subtitle = isMushroomMod ? 'Your mushroom foraging sessions' : 'Your shed hunting sessions';
  
  panel.innerHTML = `
    <div class="ht-nav-panel-header">
      <button class="ht-nav-panel-close" onclick="closeHuntsPanel()">✕</button>
      <h1 class="ht-nav-panel-title">${title}</h1>
      <p class="ht-nav-panel-subtitle">${subtitle}</p>
    </div>
    <div class="ht-nav-panel-content">
      <div class="ht-hunt-list">
        <div class="ht-hunt-item">
          <p class="ht-hunt-date">February 15, 2026</p>
          <p class="ht-hunt-summary">Busch Wildlife - 3.2 miles tracked • 2 ${isMushroomMod ? 'morel sites' : 'sheds'} found</p>
        </div>
        <div class="ht-hunt-item">
          <p class="ht-hunt-date">February 12, 2026</p>
          <p class="ht-hunt-summary">Cuivre River - 2.8 miles tracked • 1 ${isMushroomMod ? 'oyster patch' : 'shed'} found</p>
        </div>
        <div class="ht-hunt-item">
          <p class="ht-hunt-date">February 8, 2026</p>
          <p class="ht-hunt-summary">Kickapoo Prairie - 4.1 miles tracked • Weather too cold</p>
        </div>
      </div>
      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">History will automatically populate as you complete ${isMushroomMod ? 'foraging' : 'hunting'} sessions.</p>
    </div>
  `;
  
  document.body.appendChild(panel);
  setTimeout(() => panel.classList.add('visible'), 50);
};

window.showWeather = function() {
  showWeatherPanel();
};

window.exitHunt = function() {
  resetActiveHuntState();
  openFieldCommandTray();
  showNotice(isMushroomModule() ? 'Forage ended. Restarting...' : 'Hunt ended. Restarting...', 'info', 1200);
  setTimeout(() => {
    window.location.reload();
  }, 300);
};

function updateLocateMeOffset() {
  // ── STRICT GUARDRAIL: Locate button must NEVER overlap any bottom bar/tray ──
  // Scan every fixed bottom element and push locate button above the highest one.
  const vh = window.innerHeight || document.documentElement.clientHeight;
  let highestTop = vh; // track the topmost edge (smallest y) of any visible bar

  // 1. Toolbar (always present)
  const toolbar = document.getElementById('toolbar');
  if (toolbar) {
    const tRect = toolbar.getBoundingClientRect();
    if (tRect.height > 0 && tRect.top < vh) {
      highestTop = Math.min(highestTop, tRect.top);
    }
  }

  // 2. Draw helper bar (Lock In / Reset / Cancel)
  const drawHelper = document.getElementById('htDrawHelper');
  if (drawHelper && drawHelper.classList.contains('active')) {
    const dRect = drawHelper.getBoundingClientRect();
    if (dRect.height > 0 && dRect.top < vh) {
      highestTop = Math.min(highestTop, dRect.top);
    }
  }

  // 3. Fly live tray
  const flyTray = document.querySelector('.ht-fly-live-tray');
  if (flyTray && getComputedStyle(flyTray).display !== 'none') {
    const fRect = flyTray.getBoundingClientRect();
    if (fRect.height > 0 && fRect.top < vh) {
      highestTop = Math.min(highestTop, fRect.top);
    }
  }

  // 4. Quick hint toast bar
  const quickHint = document.querySelector('.ht-quick-hint.active');
  if (quickHint) {
    const qRect = quickHint.getBoundingClientRect();
    if (qRect.height > 0 && qRect.top < vh) {
      highestTop = Math.min(highestTop, qRect.top);
    }
  }

  // 5. Saved hunt bar
  const savedHuntBar = document.getElementById('htSavedHuntBar');
  if (savedHuntBar && savedHuntBar.classList.contains('active')) {
    const sRect = savedHuntBar.getBoundingClientRect();
    if (sRect.height > 0 && sRect.top < vh) {
      highestTop = Math.min(highestTop, sRect.top);
    }
  }

  // Compute offset: distance from viewport bottom to highest bar top + 12px breathing room
  const distFromBottom = vh - highestTop;
  // Clamp: minimum 68px (above collapsed strip), maximum 200px (sanity)
  const offset = Math.max(68, Math.min(200, Math.round(distFromBottom + 12)));
  document.documentElement.style.setProperty('--toolbar-offset', `${offset}px`);
}

window.toggleToolbar = function() {
  lastToolbarToggleAt = Date.now();
  const toolbar = document.getElementById('toolbar');
  const icons = document.querySelectorAll('.ht-toggle-icon');
  if (!toolbar) return;

  const isCollapsed = toolbar.classList.contains('collapsed');
  toolbarOpen = isCollapsed;

  if (toolbarOpen) {
    toolbar.classList.remove('collapsed');
    document.body.classList.remove('ht-toolbar-collapsed');
    icons.forEach((icon) => {
      icon.textContent = 'v';
    });
    try { localStorage.setItem('htToolbarCollapsed', '0'); } catch {}
    // Fade out hero overlay when user opens Field Command (ANY module)
    if (!document.body.classList.contains('ht-hero-dismissed')) {
      document.body.classList.add('ht-hero-dismissed');
    }
    // Auto-activate map when toolbar opens on hero-pending modules
    console.log('toggleToolbar: Opening toolbar, checking map activation');
    console.log('Map active:', document.body.classList.contains('ht-map-active'));
    console.log('Map initialized:', mapInitialized);
    console.log('Module checks:', {
      fly: isFlyModule(),
      turkey: isTurkeyModule(), 
      shed: isShedModule(),
      mushroom: isMushroomModule()
    });
    
    if (!document.body.classList.contains('ht-map-active')) {
      console.log('Activating map...');
      if (isFlyModule()) { 
        console.log('Activating fly map');
        activateFlyMap(); 
      }
      else if (isTurkeyModule()) { 
        console.log('Activating turkey map');
        activateTurkeyMap(); 
      }
      else if (isShedModule()) { 
        console.log('Activating shed map');
        activateShedMap(); 
      }
      else if (isMushroomModule()) { 
        console.log('Activating mushroom map');
        activateMushroomMap(); 
      }
      document.body.classList.remove('ht-map-pending');
      document.body.classList.add('ht-map-active');
      
      // Force map resize after activation
      setTimeout(() => {
        if (map && map.invalidateSize) {
          console.log('Forcing map resize');
          map.invalidateSize();
        }
      }, 100);
    }
  } else {
    toolbar.classList.add('collapsed');
    document.body.classList.add('ht-toolbar-collapsed');
    icons.forEach((icon) => {
      icon.textContent = '>';
    });
    try { localStorage.setItem('htToolbarCollapsed', '1'); } catch {}
  }
  updateTrayMiniLabels();
  updateLocateMeOffset();
};

function collapseFieldCommandTray() {
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) return;
  if (!toolbar.classList.contains('collapsed')) {
    toolbarOpen = false;
    toolbar.classList.add('collapsed');
    document.body.classList.add('ht-toolbar-collapsed');
    const icons = document.querySelectorAll('.ht-toggle-icon');
    icons.forEach((icon) => {
      icon.textContent = '>';
    });
    try { localStorage.setItem('htToolbarCollapsed', '1'); } catch {}
    updateTrayMiniLabels();
  }
  updateTrayToggleButton();
  updateLocateMeOffset();
}

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
  try {
    if (typeof window.clearAllDrawings === 'function') {
      window.clearAllDrawings();
    }
  } catch (err) {
    console.warn('Start over failed to clear drawings.', err);
  }
  resetActiveHuntState();
  updateLockInAreaState(false);
  updateSaveAreaState(false);
  setLockInAreaStatus('', null);
  setFieldCommandStep(1);
  openFieldCommandTray();
  showNotice(isMushroomModule() ? 'Start over ready. Define a new forage area.' : 'Start over ready. Define a new hunt area.', 'info', 2600);
};

function updateLockInAreaState(isReady) {
  const btn = document.getElementById('lockInAreaBtn');
  if (!btn) return;
  btn.classList.toggle('is-disabled', !isReady);
  btn.setAttribute('aria-disabled', (!isReady).toString());
}

function updateSaveAreaState(isReady) {
  const btn = document.getElementById('saveAreaBtn');
  if (!btn) return;
  btn.classList.toggle('is-disabled', !isReady);
  btn.toggleAttribute('disabled', !isReady);
  btn.setAttribute('aria-disabled', (!isReady).toString());
}

function setLockInAreaStatus(message, tone) {
  const el = document.getElementById('lockInAreaStatus');
  if (!el) return;
  el.textContent = message || '';
  el.classList.remove('error', 'success');
  if (tone) el.classList.add(tone);
}

function handleLockInAreaFailure(message) {
  pendingFieldCommandAdvance = false;
  updateLockInAreaState(true);
  setLockInAreaStatus(message, 'error');
  const panel = document.getElementById('strategy-panel');
  if (panel) panel.remove();
  stopPlanLoadingTicker();
  setStrategyOpen(false);
  updateTrayToggleButton();
  if (!toolbarOpen) {
    openFieldCommandTray();
  }
  if (fieldCommandFlowActive && (selectedAreaLayer || currentPolygon)) {
    setFieldCommandStep(2);
    focusPlanRoutePanel();
  } else {
    setFieldCommandStep(1);
  }
}

function buildCoreZonesFromSeeds(seedFeatures, windDir, depth) {
  const zoneCap = depth === 'deep' ? 8 : 4;
  const radius = depth === 'deep' ? 220 : 160;
  const bestWind = windDir || 'N';
  return seedFeatures.slice(0, zoneCap).map((feature, idx) => ({
    id: `core_${Date.now()}_${idx}`,
    type: feature.label || 'Core Zone',
    score: Math.min(99, Math.max(80, Math.round(feature.score || 84))),
    radius,
    coords: [feature.latlng.lat, feature.latlng.lng],
    wind: bestWind,
    terrain: feature.label || 'Terrain',
    cover: 'Terrain advantage with nearby cover breaks.',
    pressure: 'Low pressure pocket',
    access: 'Approach from downwind side and stay below the skyline.',
    sign: 'Look for beds, rubs, and quiet exit trails.'
  }));
}

window.lockInArea = function() {
  if (!selectedAreaLayer && !currentPolygon) {
    const areaMsg = isMushroomModule() ? 'Define a forage area first.' : 'Define a hunt area first.';
    setLockInAreaStatus(areaMsg, 'error');
    showNotice(areaMsg, 'warning', 3200);
    return;
  }
  fieldCommandFlowActive = true;
  pendingFieldCommandAdvance = true;
  updateLockInAreaState(false);
  setLockInAreaStatus('Building plan...', null);
  if (toolbarOpen) {
    window.toggleToolbar();
  }
  updateTrayToggleButton();
  window.startHuntFromCriteria({
    panelMode: 'route',
    fieldCommandFlow: true
  });
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

window.returnToFieldCommand = function() {
  window.closeStrategyPanel();
  setFieldCommandStep(1);
  openFieldCommandTray();
  updateTrayToggleButton();
};

window.showMissionSummary = function() {
  const planHotspots = hotspotMarkers.map((marker) => marker.__hotspotData).filter(Boolean);
  if (!planHotspots.length) {
    showNotice('No mission summary available yet.', 'warning', 3200);
    return;
  }
  const planTemp = lastPlanSnapshot?.temperature ?? null;
  const planWindSpeed = lastPlanSnapshot?.windSpeed ?? null;
  const planWindDir = lastPlanSnapshot?.wind ?? activeWindDir ?? null;
  showStrategyPanel(planHotspots, planTemp, planWindSpeed, planWindDir, {
    mode: 'brief',
    showMissionBrief: true,
    showRouteControls: false
  });
};

window.startLocationFromGPS = function() {
  fieldCommandFlowActive = true;
  if (!navigator.geolocation) {
    showNotice('GPS not available. Enable location services.', 'error', 4200);
    return;
  }

  showNotice('Centering on your location…', 'info', 2200);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      const zoom = map && typeof map.getZoom === 'function' ? Math.max(map.getZoom(), 13) : 13;
      updateUserLocationMarker(latlng);
      map.setView(latlng, zoom, { animate: true });
      setFieldCommandStep(1);
      showNotice(isMushroomModule() ? 'Location set. Define your forage area.' : 'Location set. Define your hunt area.', 'success', 3200);
    },
    (err) => {
      const msg = err && err.message ? err.message : 'Unable to read GPS location.';
      showNotice(`GPS failed: ${msg}`, 'error', 5200);
    },
    getPreciseGeolocationOptions({ timeout: 12000 })
  );
};

window.startLocationPickOnMap = function() {
  fieldCommandFlowActive = true;
  mapClickMode = 'pick-location';
  showNotice('Tap the map to set your location.', 'info', 4200);
  if (toolbarOpen) {
    window.toggleToolbar();
  }
};

window.startRouteFromMyLocation = function() {
  if (!hotspotMarkers.length && !isFlyModule()) {
    showNotice(isMushroomModule() ? 'No pins yet. Build a forage plan first.' : 'No pins yet. Build a hunt plan first.', 'warning', 3600);
    return;
  }
  if (!navigator.geolocation) {
    const fallback = map && typeof map.getCenter === 'function' ? map.getCenter() : null;
    if (fallback) {
      setStartPoint(fallback);
      setEndPoint(fallback);
      updateRoutePinStatus();
      window.buildRoutePreview();
      showNotice('GPS unavailable. Using map center as your start point.', 'warning', 5200);
      return;
    }
    showNotice('GPS not available. Enable location services.', 'error', 4200);
    return;
  }
  setRouteGpsActive(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setRouteGpsActive(false);
      const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      updateUserLocationMarker(latlng);
      try {
        const zoom = map && typeof map.getZoom === 'function' ? Math.max(map.getZoom(), 13) : 13;
        map.setView(latlng, zoom, { animate: true });
      } catch {}
      setStartPoint(latlng);
      if (isFlyModule()) {
        clearEndPointSelection();
        mapClickMode = 'route-end';
        setRouteMapSelectionActive(true);
        showNotice('Parking set at your location. Tap the map for entry.', 'info', 5200);
      } else {
        setEndPoint(latlng);
      }
      routePinSelectionActive = false;
      routePinSelectionStep = null;
      if (!isFlyModule()) {
        mapClickMode = null;
        setRouteMapSelectionActive(false);
      }
      const panel = document.getElementById('strategy-panel');
      if (panel) {
        panel.style.display = 'none';
        setStrategyOpen(false);
        updateTrayToggleButton();
      }
      if (toolbarOpen) {
        window.toggleToolbar();
        updateTrayToggleButton();
      }
      updateRoutePinStatus();
      if (!isFlyModule()) {
        window.buildRoutePreview();
        setFieldCommandStep(3);
        showNotice('Starting point set. Route ready. Tap LET\'S GO to launch.', 'success', 5200);
      }
    },
    (err) => {
      setRouteGpsActive(false);
      const msg = err && err.message ? err.message : 'Unable to read GPS location.';
      const fallback = map && typeof map.getCenter === 'function' ? map.getCenter() : null;
      if (fallback) {
        setStartPoint(fallback);
        setEndPoint(fallback);
        updateRoutePinStatus();
        window.buildRoutePreview();
        showNotice('GPS failed. Using map center as your start point.', 'warning', 5200);
        return;
      }
      showNotice(`GPS failed: ${msg}`, 'error', 5200);
    },
    getPreciseGeolocationOptions({ timeout: 12000 })
  );
};

window.backToDefineArea = function() {
  setFieldCommandStep(1);
};

window.backToPlanRoute = function() {
  setFieldCommandStep(2);
};

window.goBackTray = function() {
  const panel = document.getElementById('strategy-panel');
  if (panel) {
    window.closeStrategyPanel();
    return;
  }
  if (fieldCommandStep === 2 || fieldCommandStep === 3) {
    setFieldCommandStep(1);
    return;
  }
  if (toolbarOpen) {
    window.toggleToolbar();
  }
};

window.openPlanPanel = function() {
  if (!selectedAreaLayer && !currentPolygon) {
    const select = document.getElementById('savedPropertySelect');
    const id = select ? select.value : '';
    if (id) {
      applySavedHuntArea(id);
    }
  }
  if (!selectedAreaLayer && !currentPolygon) {
    showNotice(isMushroomModule() ? 'Select a forage area first: parcel, draw, or radius.' : 'Select a hunt area first: parcel, draw, or radius.', 'warning', 3600);
    return;
  }
  const areaLayer = selectedAreaLayer || currentPolygon;
  if (areaLayer && map) {
    try {
      const bounds = areaLayer.getBounds ? areaLayer.getBounds() : null;
      if (bounds && bounds.isValid && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      } else if (areaLayer.getLatLng) {
        map.setView(areaLayer.getLatLng(), Math.max(map.getZoom(), 14));
      }
    } catch {
      // Ignore zoom failures and continue.
    }
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
        showNotice(isMushroomModule() ? 'Waypoint logged to forage journal.' : 'Waypoint logged to hunt journal.', 'success', 3200);
      }
    });
  }, null, getPreciseGeolocationOptions({ timeout: 12000 }));
};

window.logTurkeyPinOnMap = function() {
  if (!map) return;
  mapClickMode = 'turkey-pin';
  showNotice('Tap the map to drop a turkey pin.', 'info', 3200);
};

window.openHuntJournal = function() {
  window.openHuntJournalPanel();
};

window.toggleUserMenu = function() {
  showNotice('User menu coming soon.', 'info');
};

// Log Shed Find
function logShedFind() {
  const isMush = isMushroomModule();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      openInputModal({
        title: isMush ? 'Log Mushroom Find' : 'Log Shed Find',
        message: isMush ? 'Describe the find (species, size, nearby trees, habitat).' : 'Describe the shed (points, side, condition, habitat).',
        placeholder: isMush ? 'Example: Yellow morel, 4 inches, near dead elm in creek bottom.' : 'Example: Right side, 5 points, fresh drop near bedding cover.',
        multiline: true,
        confirmLabel: isMush ? 'Log Find' : 'Log Shed',
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
          marker.on('click', () => showShedFindTile(shedFind, isMush ? 'Logged mushroom find.' : 'Logged shed find.'));
          showShedFindTile(shedFind, isMush ? 'Logged mushroom find.' : 'Logged shed find.');

          showNotice(isMush ? 'Mushroom logged! Check nearby for more — they cluster.' : 'Shed logged successfully. Check nearby for the matching side!', 'success', 4200);
        }
      });
    }, null, getPreciseGeolocationOptions({ timeout: 12000 }));
  } else {
    showNotice('GPS not available. Enable location services.', 'error');
  }
}

function showVoicePopup(message, duration = 3800) {
  // Voice popups suppressed per user request
  return;
}

function getVoiceKindLabel(kind) {
  const normalized = String(kind || '').toLowerCase();
  if (isMushroomModule()) {
    if (normalized === 'buck_sign') return 'tree marker';
    if (normalized === 'scrape') return 'soil disturbance';
    if (normalized === 'rub') return 'bark note';
    if (normalized === 'trail') return 'game trail';
    if (normalized === 'bedding') return 'duff bed';
    if (normalized === 'shed') return 'mushroom find';
    return 'forage note';
  }
  if (normalized === 'buck_sign') return 'buck sign';
  if (normalized === 'scrape') return 'buck scrape';
  if (normalized === 'rub') return 'buck rub';
  if (normalized === 'trail') return 'deer trail';
  if (normalized === 'bedding') return 'buck bed';
  if (normalized === 'shed') return 'shed find';
  return 'sign';
}

function promptVoicePinChoice(onDropPin) {
  openChoiceModal({
    title: 'Huntech Log',
    message: 'Drop a pin on the map or just log the data?',
    primaryLabel: 'Drop Pin',
    secondaryLabel: 'Log Only',
    onPrimary: () => {
      if (typeof onDropPin === 'function') onDropPin();
    }
  });
}

function speakVoiceConfirm(text) {
  const message = String(text || '').trim();
  if (!message) return;
  const shouldRestart = voiceActive && voiceRecognizer;
  if (shouldRestart) {
    try { voiceRecognizer.stop(); } catch {}
  }

  if (!speakTextBrowser(message)) {
    speakText(message);
  }

  if (!shouldRestart || !('speechSynthesis' in window)) return;
  const startedAt = Date.now();
  const checkEnd = setInterval(() => {
    const elapsed = Date.now() - startedAt;
    if ((!speechSynthesis.speaking && !speechSynthesis.pending) || elapsed > 4500) {
      clearInterval(checkEnd);
      try { voiceRecognizer.start(); } catch {}
    }
  }, 150);
}

function logVoiceWaypoint(kind, options = {}) {
  if (!navigator.geolocation) {
    showNotice('GPS not available. Enable location services.', 'error');
    return;
  }

  const shouldPrompt = options.promptForPin !== false;
  const dropPinNow = Boolean(options.dropPinNow);
  const label = getVoiceKindLabel(kind);
  showVoicePopup(`Logging ${label}...`, 2200);
  showNotice(`Logging ${label}...`, 'info', 2200);

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const now = new Date().toISOString();
    speakVoiceConfirm(`${label} logged.`);
    showVoicePopup(`${label} logged.`, 2600);

    if (kind === 'shed') {
      const shedFind = {
        type: 'shed_find',
        coords: [lat, lng],
        notes: isMushroomModule() ? 'Voice log: mushroom found.' : 'Voice log: shed found.',
        timestamp: now
      };
      huntJournalEntries.unshift({
        id: `shed_${Date.now()}`,
        ...shedFind
      });
      saveHuntJournal();
      showNotice(isMushroomModule() ? 'Mushroom find logged at your location.' : 'Shed logged at your location.', 'success', 4200);
      queueLiveStrategyUpdate('shed');

      const dropPin = () => {
        const marker = L.marker([lat, lng], { icon: getBrandedPinIcon('F') }).addTo(map);
        marker.__shedFindData = shedFind;
        marker.on('click', () => showShedFindTile(shedFind, isMushroomModule() ? 'Logged mushroom find.' : 'Logged shed find.'));
        showShedFindTile(shedFind, isMushroomModule() ? 'Logged mushroom find.' : 'Logged shed find.');
        speakVoiceConfirm('Pin dropped.');
      };

      if (dropPinNow) {
        dropPin();
      } else if (shouldPrompt) {
        promptVoicePinChoice(dropPin);
      }
      return;
    }

    const entry = {
      id: `wp_${Date.now()}`,
      type: 'waypoint',
      coords: [lat, lng],
      signType: kind || 'sign',
      confidence: 'medium',
      notes: `Voice log: ${label}.`,
      timestamp: now
    };
    huntJournalEntries.unshift(entry);
    saveHuntJournal();
    showNotice('Waypoint logged at your location.', 'success', 3200);
    queueLiveStrategyUpdate('voice');

    const dropPin = () => {
      L.marker([lat, lng], { icon: getDeerSignPinIcon(kind || 'sign') }).addTo(map);
      speakVoiceConfirm('Pin dropped.');
    };

    if (dropPinNow) {
      dropPin();
    } else if (shouldPrompt) {
      promptVoicePinChoice(dropPin);
    }
  }, (error) => {
    const code = error && error.code ? String(error.code) : '';
    const detail = code === '1' ? 'Location permission blocked.'
      : code === '2' ? 'Location unavailable.'
      : code === '3' ? 'Location request timed out.'
      : 'Location failed.';
    showNotice(`Voice log failed. ${detail}`, 'warning', 4200);
    showVoicePopup(`Voice log failed. ${detail}`, 3200);
  }, getPreciseGeolocationOptions({ timeout: 8000 }));
}


// ===================================================================
//   Voice Commands
// ===================================================================
function handleVoiceTranscript(text) {
  const phrase = String(text || '').toLowerCase();
  const wantsLog = phrase.includes('log');
  const wantsPin = phrase.includes('drop a pin')
    || phrase.includes('drop pin')
    || phrase.includes('drop a pen')
    || phrase.includes('drop pin here')
    || phrase.includes('pin at my current location')
    || phrase.includes('drop a waypoint')
    || phrase.includes('pin here')
    || phrase.includes('mark this')
    || phrase.includes('mark it')
    || phrase.includes('place a pin')
    || phrase.includes('place pin')
    || phrase.includes('drop a marker')
    || phrase.includes('drop marker')
    || phrase.includes('drop')
    || phrase.includes('pin');

  if (voiceDirectMode) {
    voiceArmed = true;
  }

  if (phrase.includes('stop voice') || phrase.includes('stop listening')) {
    stopVoiceCommands();
    showNotice('Voice Commands off.', 'info', 3200);
    return;
  }

  if (phrase.includes('hey huntech') || phrase.includes('hey hunteech') || phrase.includes('hey huntesh') || phrase.includes('hey huntek') || phrase.includes('hey hun tech')) {
    voiceArmed = true;
    if (voiceArmTimer) clearTimeout(voiceArmTimer);
    voiceArmTimer = setTimeout(() => { voiceArmed = false; }, 8000);
    speakText('Hun-tek voice command. What would you like to log?');
    showVoicePopup(isMushroomModule() ? 'Listening: say "log mushroom" or "log tree marker"' : 'Listening: say "log buck sign" or "log shed found"');
    return;
  }

  if (!voiceArmed && !voiceDirectMode && !wantsLog && !wantsPin) return;
  voiceArmed = false;

  if (phrase.includes('shed')) {
    voiceDirectMode = false;
    logVoiceWaypoint('shed', { promptForPin: false, dropPinNow: wantsPin });
    return;
  }

  if (phrase.includes('buck bed') || phrase.includes('bedding')) {
    voiceDirectMode = false;
    logVoiceWaypoint('bedding', { promptForPin: false, dropPinNow: wantsPin });
    return;
  }

  if (phrase.includes('buck sign') || phrase.includes('buck')) {
    voiceDirectMode = false;
    logVoiceWaypoint('buck_sign', { promptForPin: false, dropPinNow: wantsPin });
    return;
  }

  if (phrase.includes('scrape')) {
    voiceDirectMode = false;
    logVoiceWaypoint('scrape', { promptForPin: false, dropPinNow: wantsPin });
    return;
  }

  if (phrase.includes('rub')) {
    voiceDirectMode = false;
    logVoiceWaypoint('rub', { promptForPin: false, dropPinNow: wantsPin });
    return;
  }

  if (phrase.includes('trail')) {
    voiceDirectMode = false;
    logVoiceWaypoint('trail', { promptForPin: false, dropPinNow: wantsPin });
    return;
  }

  if (phrase.includes('bed')) {
    voiceDirectMode = false;
    logVoiceWaypoint('bedding', { promptForPin: false, dropPinNow: wantsPin });
    return;
  }

  if (phrase.includes('pin') || phrase.includes('waypoint') || phrase.includes('sign') || phrase.includes('drop')) {
    voiceDirectMode = false;
    logVoiceWaypoint('sign', { promptForPin: false, dropPinNow: wantsPin || phrase.includes('pin') });
    return;
  }

  voiceDirectMode = false;
  showNotice(isMushroomModule() ? 'Voice command not recognized. Try "log tree marker" or "log mushroom found".' : 'Voice command not recognized. Try "log buck sign" or "log shed found".', 'info', 4200);
}

function startVoiceCommands() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showNotice('Voice commands not supported in this browser.', 'warning', 4200);
    return;
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {
        showNotice('Microphone access failed. Check browser mic permissions.', 'warning', 4200);
      });
  }

  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'microphone' })
      .then((status) => {
        if (status.state === 'denied') {
          showNotice('Microphone access is blocked. Allow mic permissions to use voice commands.', 'warning', 5200);
        }
      })
      .catch(() => {});
  }

  if (voiceRecognizer) {
    try { voiceRecognizer.stop(); } catch {}
  }

  voiceRecognizer = new SpeechRecognition();
  voiceRecognizer.continuous = true;
  voiceRecognizer.interimResults = false;
  voiceRecognizer.maxAlternatives = 3;
  voiceRecognizer.lang = 'en-US';

  voiceRecognizer.onresult = (event) => {
    const results = event.results;
    const last = results[results.length - 1];
    if (!last || !last[0]) return;
    const transcript = last[0].transcript || '';
    if (transcript) {
      showVoicePopup(`Heard: "${transcript}"`, 2200);
    }
    handleVoiceTranscript(transcript);
  };

  voiceRecognizer.onstart = () => {
    showNotice('Voice listening on.', 'info', 2400);
  };

  voiceRecognizer.onaudiostart = () => {
    showVoicePopup('Mic on. Listening…', 2000);
  };

  voiceRecognizer.onsoundstart = () => {
    showVoicePopup('Sound detected…', 1600);
  };

  voiceRecognizer.onnomatch = () => {
    showNotice(isMushroomModule() ? 'No voice match. Try "log mushroom" or "log tree marker".' : 'No voice match. Try "log buck sign" or "log shed found".', 'info', 3600);
  };

  voiceRecognizer.onerror = (event) => {
    const message = event && event.error ? `Voice error: ${event.error}` : 'Voice error.';
    showNotice(message, 'warning', 4200);
  };

  voiceRecognizer.onend = () => {
    if (voiceActive) {
      try { voiceRecognizer.start(); } catch {}
    }
  };

  voiceActive = true;
  showVoicePopup(isMushroomModule() ? 'Voice Commands on. Say "Hey Huntech" to log a find.' : 'Voice Commands on. Say "Hey Huntech" to log.');
  try { voiceRecognizer.start(); } catch {}
}

function stopVoiceCommands() {
  voiceActive = false;
  voiceArmed = false;
  if (voiceArmTimer) clearTimeout(voiceArmTimer);
  voiceArmTimer = null;
  if (voiceRecognizer) {
    try { voiceRecognizer.stop(); } catch {}
  }
}

window.logSignVoice = function() {
  startVoiceCommands();
  voiceDirectMode = true;
  voiceArmed = true;
  if (voiceArmTimer) clearTimeout(voiceArmTimer);
  voiceArmTimer = setTimeout(() => {
    voiceArmed = false;
    voiceDirectMode = false;
  }, 10000);
  speakText('Hun-tek voice command. What would you like to log?');
  showVoicePopup(isMushroomModule() ? 'Listening: say "log tree marker" or "log mushroom found"' : 'Listening: say "log buck sign" or "log shed found"');
  setTimeout(() => {
    if (voiceActive && voiceRecognizer) {
      try { voiceRecognizer.stop(); } catch {}
      try { voiceRecognizer.start(); } catch {}
    }
  }, 700);
};

window.toggleTracking = function() {
  if (!navigator.geolocation) {
    showNotice('GPS not available. Enable location services.', 'error');
    return;
  }

  trackingActive = !trackingActive;
  if (trackingActive) {
    ensureTrackingArea();
    renderTrackingCoverage();
    startLocationWatch();
    if (!voiceActive) startVoiceCommands();
    const stats = getTrackingStatsSnapshot();
    showNotice(`Live Tracker on. Coverage ${stats.coverage}% • ${stats.miles.toFixed(1)} miles`, 'success', 4200);
  } else {
    saveTrackingCoverage();
    const stats = getTrackingStatsSnapshot();
    huntJournalEntries.unshift({
      id: `track_${Date.now()}`,
      type: 'tracking',
      areaKey: trackingAreaKey,
      miles: Number(stats.miles.toFixed(2)),
      steps: stats.steps,
      coverage: stats.coverage,
      notes: `Coverage ${stats.coverage}% • ${stats.miles.toFixed(1)} miles • ${stats.steps} steps`,
      timestamp: new Date().toISOString()
    });
    saveHuntJournal();
    if (!routeLine) stopLocationWatch();
    showNotice(`Live Tracker off. Coverage ${stats.coverage}% • ${stats.miles.toFixed(1)} miles`, 'info', 5200);
  }
  updateAdvancedToolsTrayState();
};

window.toggleVoiceCommands = function() {
  if (voiceActive) {
    stopVoiceCommands();
    showNotice('Voice Commands off.', 'info', 3200);
    updateAdvancedToolsTrayState();
    return;
  }
  startVoiceCommands();
  updateAdvancedToolsTrayState();
};

window.logPinOnMap = function() {
  if (!map) return;
  mapClickMode = 'deer-pin';
  showNotice(isMushroomModule() ? 'Tap the map to drop a forage pin.' : 'Tap the map to drop a deer pin.', 'info', 3200);
};

window.logDeerPinOnMap = function() {
  window.logPinOnMap();
};

window.startCoach = function() {
  coachActive = !coachActive;
  if (coachActive) {
    if (!trackingActive) window.toggleTracking();
    showNotice('HUNTECH Coach on. I will keep you on track and call out subtle features.', 'success', 4200);
  } else {
    showNotice('HUNTECH Coach off.', 'info', 3200);
  }
  updateAdvancedToolsTrayState();
};

window.startHuntFromCriteria = function(options = {}) {
  if (options.fieldCommandFlow) {
    fieldCommandFlowActive = true;
  }
  if (options.skipStrategyPanel) {
    showNotice(isMushroomModule() ? 'Building forage plan…' : 'Building hunt plan…', 'info', 2200);
  }
  huntCriteria = getHuntCriteriaFromUI();
  document.body.classList.add('ht-hunt-active');
  clearSearchHighlight();
  closeEducationTile();
  startShedHunt(options);
};

// ENHANCED START SHED HUNT - Education First with Priority Ranking
window.startShedHunt = async function(options = {}) {
  const skipStrategyPanel = Boolean(options && options.skipStrategyPanel);
  const strictTerrainOnly = false;
  let strictMode = strictTerrainOnly ? true : STRICT_ANALYSIS_MODE;
  const lidarPriority = window.HUNTECH_LIDAR_PRIORITY !== undefined
    ? Boolean(window.HUNTECH_LIDAR_PRIORITY)
    : false;
  if (lidarPriority) strictMode = true;
  if (skipStrategyPanel && typeof window.closeStrategyPanel === 'function') {
    window.closeStrategyPanel();
  }
  // Clear previous markers and routes
  clearHunt();
  clearStartPointSelection();
  clearEndPointSelection();
  roadAvoidChecks = 0;
  roadAvoidCache.clear();
  
  // Verify hunt area exists
  const huntArea = selectedAreaLayer || currentPolygon;
  if (!huntArea) {
    handleLockInAreaFailure(isMushroomModule() ? 'Define a forage area first.' : 'Define a hunt area first.');
    showNotice(isMushroomModule() ? 'Define a forage area first: radius, draw, or boundary.' : 'Define a hunt area first: radius, draw, or boundary.', 'warning', 4200);
    return;
  }

  if (!skipStrategyPanel) {
    showStrategyLoadingPanel();
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
  }

  try {
    // Get weather data
    const bounds = huntArea.getBounds ? huntArea.getBounds() : map.getBounds();
    const center = bounds.getCenter();
    updatePlanLoadingStatus('Checking weather...', 'Fetching live wind and temperature.');
    let temp = 50;
    let windSpeed = 6;
    let windDir = 'N';
    try {
      const response = await fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${center.lat}&longitude=${center.lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`,
        {},
        9000
      );
      const data = await response.json();
      const current = data && data.current ? data.current : null;
      if (!current || current.temperature_2m === undefined || current.wind_speed_10m === undefined || current.wind_direction_10m === undefined) {
        if (strictMode) throw new Error('Live conditions unavailable');
      } else {
        temp = Math.round(current.temperature_2m);
        windSpeed = Math.round(current.wind_speed_10m);
        windDir = ['N','NE','E','SE','S','SW','W','NW'][Math.round(current.wind_direction_10m / 45) % 8];
      }
    } catch (error) {
      updatePlanLoadingStatus('Weather offline.', 'Using default wind and temperature.');
      showNotice('Weather offline. Using defaults.', 'warning', 4200);
    }
    activeWindDir = windDir;

    // Generate hotspots with educational data (more than 5, spaced out)
    const criteria = getHuntCriteriaFromUI();
    huntCriteria = criteria;
    const areaLayer = selectedAreaLayer || huntArea;
    const areaType = selectedAreaType || (areaLayer instanceof L.Circle
      ? 'radius'
      : (areaLayer instanceof L.Rectangle ? 'boundary' : 'polygon'));
    let areaAnalysis = null;
    const shouldDeepScan = strictTerrainOnly || lidarPriority || ALWAYS_DEEP_SCAN || criteria.depth !== 'general';
    let analysisDepth = criteria.depth === 'general' ? 'medium' : criteria.depth;
    if (lidarPriority || strictTerrainOnly) analysisDepth = 'deep';
    const minSpacingOverride = Number(window.HOTSPOT_MIN_SPACING_M || 0);
    const planMinSpacing = minSpacingOverride > 0
      ? minSpacingOverride
      : (analysisDepth === 'deep'
        ? 110
        : (analysisDepth === 'medium' ? 140 : HOTSPOT_MIN_SPACING_METERS));
    if (shouldDeepScan) {
      updatePlanLoadingStatus('Scanning terrain...', 'Analyzing elevation and habitat signals.');
      try {
        areaAnalysis = await analyzeSelectedAreaTerrain(bounds, areaLayer, areaType, windDir, analysisDepth);
      } catch (error) {
        areaAnalysis = null;
        updatePlanLoadingStatus('Terrain scan offline.', isMushroomModule() ? 'Unable to build forage pins.' : 'Unable to build mature-buck pins.');
        showNotice('Terrain scan offline. No terrain pins available.', 'warning', 4200);
        if (strictTerrainOnly) {
          handleLockInAreaFailure('Terrain scan failed. Try again or reduce area size.');
          return;
        }
        strictMode = false;
      }
    }
    const desiredCountRaw = parseInt(window.HOTSPOT_COUNT, 10);
    const baseDesired = Number.isFinite(desiredCountRaw) && desiredCountRaw > 0
      ? desiredCountRaw
      : getHotspotCountFromCriteria(criteria);
    const areaSqMiles = getAreaSqMiles(areaLayer, areaType, bounds);
    const density = Number(window.HOTSPOT_DENSITY_PER_SQMI || 4);
    const areaSuggested = Math.ceil(Math.max(0, areaSqMiles) * Math.max(1, density));
    const largeAreaFloor = areaSqMiles >= 2 ? 20 : 0;
    const areaDrivenMin = Math.max(areaSuggested, largeAreaFloor);
    const maxHotspots = Math.max(20, Number(window.HOTSPOT_MAX_COUNT || 48));
    const desiredCount = Math.min(maxHotspots, Math.max(baseDesired, areaDrivenMin));
    const habitatPool = buildHabitatPool(criteria);
    let hotspots = [];
    const chosen = [];
    let seeded = Array.isArray(areaAnalysis?.hotspotSeeds) ? areaAnalysis.hotspotSeeds : [];
    if (strictMode && !seeded.length) {
      let expandedBounds = null;
      try {
        expandedBounds = bounds && bounds.pad ? bounds.pad(0.35) : null;
      } catch {
        expandedBounds = null;
      }
      if (expandedBounds) {
        let expandedAnalysis = null;
        try {
          expandedAnalysis = await analyzeSelectedAreaTerrain(
            expandedBounds,
            null,
            null,
            windDir,
            analysisDepth,
            { includeAll: true }
          );
        } catch {
          expandedAnalysis = null;
          if (!strictTerrainOnly) strictMode = false;
        }
        const expandedSeeds = Array.isArray(expandedAnalysis?.hotspotSeeds)
          ? expandedAnalysis.hotspotSeeds
          : [];
        const snappedSeeds = expandedSeeds
          .map((feature) => {
            const snapped = clampLatLngIntoArea(feature?.latlng, areaLayer, areaType, bounds);
            return snapped ? { ...feature, latlng: snapped } : null;
          })
          .filter(Boolean);
        if (snappedSeeds.length) {
          seeded = snappedSeeds;
          areaAnalysis = {
            features: snappedSeeds,
            coreZones: buildCoreZonesFromSeeds(snappedSeeds, windDir, analysisDepth),
            hotspotSeeds: snappedSeeds
          };
        }
      }
    }
    if (strictMode && !seeded.length) {
      if (strictTerrainOnly) {
        const _noSignalMsg = isMushroomModule() ? 'No forage terrain signals found.' : 'No mature-buck terrain signals found.';
        updatePlanLoadingStatus('Terrain scan', _noSignalMsg);
        showNotice(_noSignalMsg + ' Try a new area.', 'warning', 4200);
        handleLockInAreaFailure(_noSignalMsg + ' Try a different area.');
        return;
      }
      strictMode = false;
      areaAnalysis = null;
      updatePlanLoadingStatus('Fallback scan', 'No strong terrain signals. Using quick pinning.');
      showNotice('No terrain signals found. Using quick scan pins.', 'warning', 4200);
    }
    const seedLimit = seeded.length;
    const pinStartAt = Date.now();
    const pinBudgetMs = Number(window.HUNTECH_PIN_BUDGET_MS || 15000);
    let bypassRoadChecks = false;
    let bypassWaterChecks = false;
    let bypassNotified = false;

    const maybeEnablePinBypass = () => {
      if (bypassRoadChecks && bypassWaterChecks) return;
      if (Date.now() - pinStartAt <= pinBudgetMs) return;
      bypassRoadChecks = true;
      bypassWaterChecks = true;
      if (!bypassNotified) {
        bypassNotified = true;
        updatePlanLoadingStatus('Fallback pinning...', 'Skipping slow checks to finish.');
        showNotice('Pinning fallback: skipping slow checks.', 'warning', 4200);
      }
    };

    // Reset NLCD check counter and pre-fetch land cover for entire area
    nlcdCheckCount = 0;
    nlcdCache.clear();
    nlcdGridData = null;
    let nlcdRejectCount = 0;

    if (NLCD_ENABLED) {
      updatePlanLoadingStatus('Loading satellite imagery...', 'Downloading land cover data for your area.');
      const nlcdOk = await prefetchNLCDForArea(bounds);
      if (!nlcdOk) {
        console.warn('[NLCD] Pre-fetch failed — pin validation will use fallback checks');
      }
    }

    for (let i = 0; i < seedLimit; i++) {
      const feature = seeded[i];
      const latlng = feature?.latlng ? L.latLng(feature.latlng) : null;
      if (!latlng) continue;
      if (!isPointInAreaLayer(latlng, areaLayer, areaType)) continue;
      const spacedOk = chosen.every((p) => p.distanceTo(latlng) >= planMinSpacing);
      if (!spacedOk) continue;
      maybeEnablePinBypass();
      if (!bypassRoadChecks) {
        const blocked = await isLikelyRoadOrStructureCandidate(latlng);
        if (blocked) continue;
      }

      // ═══ NLCD LAND COVER GUARDRAIL — NEVER BYPASSED ═══
      const lcCheck = await validatePinLandCover(latlng, 'terrain');
      if (!lcCheck.valid) {
        nlcdRejectCount++;
        console.log(`[NLCD REJECT] terrain pin: ${lcCheck.reason}`);
        continue;
      }

      chosen.push(latlng);
      const edu = buildFeatureHotspotEducation(feature, criteria, windDir, bounds);
      hotspots.push({
        coords: [latlng.lat, latlng.lng],
        tier: edu.priority,
        habitat: 'terrain',
        education: edu,
        searchFeature: feature
      });
    }

    updatePlanLoadingStatus('Verifying with satellite imagery...', 'Checking land cover for each pin location.');
    const remainingCount = strictMode
      ? 0
      : Math.max(0, desiredCount - hotspots.length);
    const attemptLimit = criteria?.depth === 'deep' ? 80 : 50;
    for (let i = 0; i < remainingCount; i++) {
      const habitat = habitatPool[i % habitatPool.length];
      const eduSet = getActiveEducationSet();
      const baseEdu = eduSet[habitat];
      let latlng = null;
      let flatRejects = 0;
      let nlcdHabitatRejects = 0;
      for (let attempt = 0; attempt < attemptLimit; attempt++) {
        const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
        const lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());
        const candidate = L.latLng(lat, lng);
        const spacedOk = chosen.every((p) => p.distanceTo(candidate) >= planMinSpacing);
        if (spacedOk && isPointInAreaLayer(candidate, areaLayer, areaType)) {
          maybeEnablePinBypass();
          if (!bypassWaterChecks) {
            const maybeWater = await isLikelyWaterCandidate(candidate);
            if (maybeWater && flatRejects < 5) {
              flatRejects++;
              continue;
            }
          }
          if (!bypassRoadChecks) {
            const blocked = await isLikelyRoadOrStructureCandidate(candidate);
            if (blocked) {
              continue;
            }
          }

          // ═══ NLCD LAND COVER GUARDRAIL — NEVER BYPASSED ═══
          const lcCheck = await validatePinLandCover(candidate, habitat);
          if (!lcCheck.valid) {
            nlcdHabitatRejects++;
            nlcdRejectCount++;
            console.log(`[NLCD REJECT] ${habitat} pin: ${lcCheck.reason}`);
            continue; // Keep trying — find a valid spot
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

      const nearbyFeature = findNearestTerrainFeature(latlng, areaAnalysis?.features);

      hotspots.push({
        coords: [latlng.lat, latlng.lng],
        tier: edu.priority,
        habitat: habitat,
        education: edu,
        searchFeature: nearbyFeature
      });

      if (i % 3 === 2) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    hotspots = hotspots.filter((h) => {
      const ll = L.latLng(h.coords[0], h.coords[1]);
      return isPointInAreaLayer(ll, areaLayer, areaType);
    });

    // ═══ NLCD SUMMARY LOG ═══
    if (nlcdRejectCount > 0) {
      console.log(`[NLCD] Satellite imagery rejected ${nlcdRejectCount} pin locations (crop fields, mismatched habitat, developed areas)`);
    }
    console.log(`[NLCD] ${hotspots.length} pins passed land cover verification. ${nlcdCheckCount} total NLCD lookups.`);

    if (!hotspots.length) {
      handleLockInAreaFailure('No safe pins found. Try a larger area.');
      showNotice('No safe pins found. Try a larger area or adjust filters.', 'error', 5200);
      return;
    }

    // Sort by tier (1 = highest), then assign rank (1..N)
    hotspots.sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99));
    hotspots.forEach((hotspot, index) => {
      hotspot.rank = index + 1;
      const marker = createBrandedHotspotMarker(hotspot);
      hotspotMarkers.push(marker);
    });

    buildRoutePinOptions(hotspots);
    if (pendingRoutePinPrompt) {
      pendingRoutePinPrompt = false;
      showNotice('Tap "Select Starting Point On Map" to choose your start.', 'info', 4200);
    }

    coreAreaEnabled = criteria.depth === 'deep' || criteria.depth === 'medium';
    createScoutingLayer(bounds, criteria, windDir, areaAnalysis?.coreZones);
    const thermalSeeds = Array.isArray(areaAnalysis?.features) && areaAnalysis.features.length
      ? areaAnalysis.features
      : seeded;
    setThermalSeedsFromFeatures(thermalSeeds, { includeCoreZones: true, merge: false });
    addThermalAnchorsFromHotspots(hotspots);

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
      areaFeatures: (areaAnalysis?.features || []).map((f) => ({
        type: f.type,
        label: f.label,
        score: f.score,
        coords: [f.latlng.lat, f.latlng.lng]
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

    ensureTrackingArea();
    renderTrackingCoverage();

    // Show routing window first (route builds only after LET'S GO)
    const panelMode = options && options.panelMode ? options.panelMode : 'route';
    if (!skipStrategyPanel) {
      showStrategyPanel(hotspots, temp, windSpeed, windDir, {
        mode: panelMode,
        showMissionBrief: false
      });
    }
    if (options && options.fieldCommandFlow) {
      pendingFieldCommandAdvance = false;
      setFieldCommandStep(2);
      focusPlanRoutePanel();
      setLockInAreaStatus('Plan ready. Pick route.', 'success');
      showNotice('Plan ready. Pick route.', 'success', 3200);
    } else if (pendingFieldCommandAdvance) {
      pendingFieldCommandAdvance = false;
      setFieldCommandStep(2);
      focusPlanRoutePanel();
    }

    // Clear the selected area highlight after the plan is generated.
    if (selectedAreaLayer) {
      if (drawnItems && drawnItems.hasLayer(selectedAreaLayer)) {
        drawnItems.removeLayer(selectedAreaLayer);
      }
      map.removeLayer(selectedAreaLayer);
    }

    // No auto GPS prompts / no auto Area Rules. Users can tap "Me", "I'm Here", or "Area Rules" when needed.

  } catch (error) {
    if (pendingFieldCommandAdvance) {
      handleLockInAreaFailure('Plan failed. Try again.');
    }
    const panel = document.getElementById('strategy-panel');
    if (panel) panel.remove();
    stopPlanLoadingTicker();
    setStrategyOpen(false);
    updateTrayToggleButton();
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
  selectedRoutingMode = 'linear';
  const label = document.getElementById('routeModeLabel');
  if (label) {
    label.textContent = 'Selected routing: Linear';
  }

  const linearBtn = document.getElementById('routeLinearBtn');
  if (linearBtn) {
    linearBtn.classList.add('selected');
    linearBtn.setAttribute('aria-pressed', 'true');
  }
}

window.selectRoutingMode = function(mode) {
  setSelectedRoutingMode('linear');
  createOptimalRoute('linear');
  showNotice('Previewing Linear route. Tap LET\'S GO to start alerts.', 'success', 4200);
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

function windDirToDegrees(dir) {
  const d = String(dir || '').toUpperCase();
  const mapDeg = {
    N: 0,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: 225,
    W: 270,
    NW: 315
  };
  return mapDeg[d] ?? null;
}


// ===================================================================
//   Compass & Map Rotation
// ===================================================================
function ensureCompassControl() {
  if (compassControl || !map) return compassControl;
  const mapEl = map.getContainer();
  if (!mapEl) return null;

  const compass = document.createElement('div');
  compass.className = 'ht-compass leaflet-control';

  // Simple solid pill toggle — no complex SVG compass
  compass.innerHTML = `
    <button class="ht-compass-lock is-locked" type="button" aria-pressed="true"
      aria-label="North locked. Tap to unlock.">
      <span class="ht-compass-lock-text">LOCK MAP</span>
    </button>
  `;

  ['click', 'mousedown', 'touchstart', 'pointerdown'].forEach((evt) => {
    compass.addEventListener(evt, (event) => event.stopPropagation());
  });

  compassNeedle = null;
  compassLockBtn = compass.querySelector('.ht-compass-lock');
  compassWindArrow = null;
  if (compassLockBtn) {
    compassLockBtn.addEventListener('click', () => {
      setCompassLock(!compassLocked);
    });
  }

  // Place on .ht-map-container (the static parent)
  const staticHost = document.querySelector('.ht-map-container') || mapEl.parentElement || mapEl;
  staticHost.appendChild(compass);
  compassControl = compass;
  setCompassLock(true, false);
  updateCompassWind(activeWindDir);
  bindMapRotationHandlers();
  return compassControl;
}

function bindMapRotationHandlers() {
  if (!map || mapRotationBound) return;
  mapRotationBound = true;
  // No need to hook move/zoom — we rotate the container element,
  // which persists independently of Leaflet's internal pane transforms.

  const mapEl = map.getContainer();
  if (!mapEl) return;

  // Enable two-finger rotation on all devices (OnX-style gesture rotation).
  const gestureRotationSetting = window.HUNTECH_ENABLE_GESTURE_ROTATION;
  const gestureRotationEnabled = gestureRotationSetting !== undefined
    ? Boolean(gestureRotationSetting)
    : true;

  const setMapDraggingEnabled = (enabled) => {
    if (!map || !map.dragging) return;
    const isEnabled = map.dragging.enabled();
    if (enabled && !isEnabled) map.dragging.enable();
    if (!enabled && isEnabled) map.dragging.disable();
  };

  const getPointerAngle = () => {
    if (mapRotatePointers.size < 2) return null;
    const points = Array.from(mapRotatePointers.values());
    const p1 = points[0];
    const p2 = points[1];
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  };

  const startPointerRotation = () => {
    if (mapRotateActive || compassLocked) return;
    const angle = getPointerAngle();
    if (!Number.isFinite(angle)) return;
    mapRotateActive = true;
    mapRotateStartAngle = angle;
    mapRotateStartBearing = mapBearingDeg;
    mapRotateDraggingWasEnabled = map.dragging && map.dragging.enabled();
    setMapDraggingEnabled(false);
  };

  const stopPointerRotation = () => {
    if (!mapRotateActive) return;
    mapRotateActive = false;
    mapRotateStartAngle = null;
    if (mapRotateDraggingWasEnabled) {
      setMapDraggingEnabled(true);
    }
  };

  if (gestureRotationEnabled) {
    mapEl.addEventListener('pointerdown', (event) => {
      if (compassLocked) return;
      mapRotatePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (mapRotatePointers.size === 2) {
        startPointerRotation();
        event.preventDefault();
      }
    }, { passive: false });

    mapEl.addEventListener('pointermove', (event) => {
      if (!mapRotatePointers.has(event.pointerId)) return;
      mapRotatePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (!mapRotateActive) {
        // Auto-start rotation if we have 2 pointers and compass is unlocked
        if (mapRotatePointers.size >= 2 && !compassLocked) startPointerRotation();
        return;
      }
      const angle = getPointerAngle();
      if (!Number.isFinite(angle)) return;
      // Direct 1:1 rotation — no dampening, matches finger angle exactly (OnX-style)
      const rawDelta = angle - mapRotateStartAngle;
      const targetBearing = normalizeDegrees(mapRotateStartBearing + rawDelta);
      // Light smoothing to kill jitter, preserves responsiveness
      const smoothDelta = shortestAngleDeltaDeg(mapBearingDeg, targetBearing);
      mapBearingDeg = normalizeDegrees(mapBearingDeg + smoothDelta * 0.7);
      lastMapInteractionAt = Date.now();
      applyMapRotation();
      event.preventDefault();
    }, { passive: false });

    const endPointer = (event) => {
      if (!mapRotatePointers.has(event.pointerId)) return;
      mapRotatePointers.delete(event.pointerId);
      if (mapRotatePointers.size < 2) {
        stopPointerRotation();
      }
    };

    mapEl.addEventListener('pointerup', endPointer);
    mapEl.addEventListener('pointercancel', endPointer);

    mapEl.addEventListener('mousedown', (event) => {
      if (compassLocked || !event.shiftKey) return;
      mapRotateShiftActive = true;
      mapRotateShiftStartX = event.clientX;
      mapRotateShiftStartBearing = mapBearingDeg;
      mapRotateDraggingWasEnabled = map.dragging && map.dragging.enabled();
      setMapDraggingEnabled(false);
      event.preventDefault();
    });

    window.addEventListener('mousemove', (event) => {
      if (!mapRotateShiftActive) return;
      const deltaX = event.clientX - mapRotateShiftStartX;
      mapBearingDeg = mapRotateShiftStartBearing + deltaX * 0.08;
      applyMapRotation();
    });

    window.addEventListener('mouseup', () => {
      if (!mapRotateShiftActive) return;
      mapRotateShiftActive = false;
      if (mapRotateDraggingWasEnabled) {
        setMapDraggingEnabled(true);
      }
    });

    // ── Touch-based rotation for mobile (iOS Safari, Android Chrome) ──
    // Pointer events can miss two-finger gestures on some mobile browsers,
    // so we also listen to raw touch events as a fallback/primary handler.
    let _touchRotStartAngle = null;
    let _touchRotStartBearing = 0;
    let _touchRotStartDist = null;
    let _touchRotGesture = null; // 'pending' | 'rotate' | 'zoom'
    let _touchRotDraggingOff = false;
    let _touchRotZoomOff = false;

    const _getTouchAngle = (touches) => {
      if (!touches || touches.length < 2) return null;
      return Math.atan2(
        touches[1].clientY - touches[0].clientY,
        touches[1].clientX - touches[0].clientX
      ) * (180 / Math.PI);
    };

    const _getTouchDist = (touches) => {
      if (!touches || touches.length < 2) return null;
      return Math.hypot(
        touches[1].clientX - touches[0].clientX,
        touches[1].clientY - touches[0].clientY
      );
    };

    mapEl.addEventListener('touchstart', (e) => {
      if (compassLocked || e.touches.length !== 2) return;
      _touchRotStartAngle = _getTouchAngle(e.touches);
      _touchRotStartBearing = mapBearingDeg;
      _touchRotStartDist = _getTouchDist(e.touches);
      _touchRotGesture = 'pending';
    }, { passive: true });

    mapEl.addEventListener('touchmove', (e) => {
      if (compassLocked || e.touches.length !== 2 || _touchRotStartAngle === null) return;

      const currAngle = _getTouchAngle(e.touches);
      const currDist = _getTouchDist(e.touches);
      if (!Number.isFinite(currAngle)) return;

      let deltaAngle = currAngle - _touchRotStartAngle;
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;
      const absAngle = Math.abs(deltaAngle);
      const absDist = Math.abs((currDist || 0) - (_touchRotStartDist || 0));

      // Gesture discrimination: decide rotate vs zoom
      // Thresholds tuned for mobile — avoid stealing normal pinch/pan gestures
      if (_touchRotGesture === 'pending') {
        if (absAngle > 12 && absAngle > absDist * 0.8) {
          _touchRotGesture = 'rotate';
          _touchRotDraggingOff = map.dragging && map.dragging.enabled();
          if (_touchRotDraggingOff) map.dragging.disable();
          _touchRotZoomOff = map.touchZoom && map.touchZoom.enabled();
          if (_touchRotZoomOff) map.touchZoom.disable();
        } else if (absDist > 12) {
          _touchRotGesture = 'zoom';
        } else {
          return; // Not enough movement yet
        }
      }

      if (_touchRotGesture !== 'rotate') return;

      // Direct 1:1 mapping with smooth easing
      const target = normalizeDegrees(_touchRotStartBearing + deltaAngle);
      const smooth = shortestAngleDeltaDeg(mapBearingDeg, target);
      mapBearingDeg = normalizeDegrees(mapBearingDeg + smooth * 0.75);
      lastMapInteractionAt = Date.now();
      applyMapRotation();
      e.preventDefault();
    }, { passive: false });

    const _touchRotEnd = () => {
      _touchRotStartAngle = null;
      _touchRotStartDist = null;
      _touchRotGesture = null;
      if (_touchRotDraggingOff && map.dragging) { map.dragging.enable(); _touchRotDraggingOff = false; }
      if (_touchRotZoomOff && map.touchZoom) { map.touchZoom.enable(); _touchRotZoomOff = false; }
    };

    mapEl.addEventListener('touchend', _touchRotEnd, { passive: true });
    mapEl.addEventListener('touchcancel', _touchRotEnd, { passive: true });
  }
}

let _rotationRAF = null;
let _lastRotateTileRefresh = 0;
let _bearingAnimFrame = null;

// Smooth animated transition of mapBearingDeg to a target value
function _animateBearingTo(targetDeg, durationMs, onComplete) {
  if (_bearingAnimFrame) cancelAnimationFrame(_bearingAnimFrame);
  const startBearing = mapBearingDeg;
  const delta = shortestAngleDeltaDeg(startBearing, targetDeg);
  const startTime = performance.now();
  const step = (now) => {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / Math.max(1, durationMs));
    // Ease-out cubic for natural deceleration
    const ease = 1 - Math.pow(1 - t, 3);
    mapBearingDeg = normalizeDegrees(startBearing + delta * ease);
    applyMapRotation();
    if (t < 1) {
      _bearingAnimFrame = requestAnimationFrame(step);
    } else {
      _bearingAnimFrame = null;
      if (onComplete) onComplete();
    }
  };
  _bearingAnimFrame = requestAnimationFrame(step);
}

function applyMapRotation() {
  if (!map) return;
  if (_rotationRAF) return; // coalesce into one rAF
  _rotationRAF = requestAnimationFrame(() => {
    _rotationRAF = null;
    if (!map) return;
    const container = map.getContainer();
    if (!container) return;

    const bearing = Number.isFinite(mapBearingDeg) ? mapBearingDeg : 0;
    const isRotated = Math.abs(bearing) > 0.01;

    // Pure rotation — no scale needed.
    // #map is CSS-oversized to 142% with the parent clipping overflow,
    // so Leaflet pre-loads enough tiles to cover all rotation angles.
    container.style.transform = isRotated ? `rotate(${bearing}deg)` : '';

    // Counter-rotate Leaflet's built-in control corners (zoom, attribution)
    // so they stay upright while #map rotates.
    // Our custom UI (pills, compass) lives on .ht-map-container and never rotates.
    const counterRotate = isRotated ? `rotate(${-bearing}deg)` : '';
    const controlCorners = container.querySelectorAll('.leaflet-top, .leaflet-bottom');
    for (const corner of controlCorners) {
      corner.style.transform = counterRotate;
      corner.style.transformOrigin = 'center center';
    }

    // Update compass needle — show the bearing direction
    if (compassNeedle) {
      compassNeedle.style.transform = `rotate(${bearing}deg)`;
    }
    // Keep the toggle button's SVG compass needle in sync
    if (compassLockBtn) {
      const svg = compassLockBtn.querySelector('.ht-compass-lock-svg');
      if (svg) svg.style.transform = isRotated ? `rotate(${bearing}deg)` : '';
    }
  });
}

function setCompassLock(nextState, notify = true) {
  compassLocked = Boolean(nextState);
  if (compassLockBtn) {
    const lockText = compassLockBtn.querySelector('.ht-compass-lock-text');
    if (lockText) {
      lockText.textContent = compassLocked ? 'LOCK MAP' : 'UNLOCK MAP';
    }
    compassLockBtn.setAttribute('aria-pressed', compassLocked ? 'true' : 'false');
    compassLockBtn.setAttribute(
      'aria-label',
      compassLocked ? 'Map locked north-up. Tap to unlock.' : 'Map unlocked. Tap to lock.'
    );
    compassLockBtn.classList.toggle('is-locked', compassLocked);
  }
  if (compassLocked) {
    // Keep device compass running so the user arrow still reflects heading,
    // but animate the MAP back to north-up (maybeApplyBearingFromHeading
    // already returns early when compassLocked is true).
    _animateBearingTo(0, 400, () => {
      mapBearingDeg = 0;
      applyMapRotation();
    });
    // Ensure compass is started so arrow keeps tracking even in north-up mode
    startDeviceCompassHeading().catch(() => {});
  } else {
    // When unlocked: start listening to compass heading.
    // Do NOT instantly snap to heading — let maybeApplyBearingFromHeading
    // ease into it smoothly over the next few frames.
    startDeviceCompassHeading().catch(() => {});
  }
  if (notify) {
    showNotice(compassLocked ? 'North lock enabled.' : 'North lock disabled.', 'info', 2400);
  }
}

function updateCompassWind(dir) {
  if (!compassNeedle) return;
  const deg = windDirToDegrees(dir);
  if (!Number.isFinite(deg)) {
    compassNeedle.style.opacity = '0.35';
    compassNeedle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    if (compassWindValue) compassWindValue.textContent = '--';
    if (compassWindArrow) compassWindArrow.style.opacity = '0.35';
    return;
  }
  compassNeedle.style.opacity = '1';
  compassNeedle.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
  if (compassWindValue) {
    const speed = Number.isFinite(activeWindSpeed) ? `${activeWindSpeed} mph` : '--';
    compassWindValue.textContent = `${String(dir || '').toUpperCase()} • ${speed}`;
  }
  if (compassWindArrow) {
    compassWindArrow.style.opacity = '1';
    compassWindArrow.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
  }
}


// ===================================================================
//   Wind Overlay
// ===================================================================
function updateWindSmoke(dir, speedMph) {
  if (!map) return;
  const mapEl = map.getContainer();
  if (!mapEl) return;

  const geo = windDirToVector(dir);
  if (!geo) {
    mapEl.classList.remove('ht-wind-smoke-active');
    mapEl.style.removeProperty('--wind-smoke-x');
    mapEl.style.removeProperty('--wind-smoke-y');
    mapEl.style.removeProperty('--wind-smoke-alpha');
    mapEl.style.removeProperty('--wind-smoke-alpha-weak');
    mapEl.style.removeProperty('--wind-smoke-alpha-strong');
    return;
  }

  const flowGeoX = -geo[0];
  const flowGeoY = -geo[1];
  const sx = flowGeoX;
  const sy = -flowGeoY;
  const mag = Math.hypot(sx, sy) || 1;
  const ux = sx / mag;
  const uy = sy / mag;

  const mph = Number(speedMph);
  const spd = Number.isFinite(mph) ? Math.max(2, mph) : 8;
  const strength = Math.max(24, Math.min(70, 24 + spd * 2.2));
  const driftX = ux * strength;
  const driftY = uy * strength - 24;

  const baseAlpha = Math.max(0.5, Math.min(0.9, 0.5 + spd / 30));
  mapEl.style.setProperty('--wind-smoke-x', `${driftX.toFixed(2)}px`);
  mapEl.style.setProperty('--wind-smoke-y', `${driftY.toFixed(2)}px`);
  mapEl.style.setProperty('--wind-smoke-alpha', `${baseAlpha.toFixed(2)}`);
  mapEl.style.setProperty('--wind-smoke-alpha-weak', `${Math.max(0.35, baseAlpha - 0.2).toFixed(2)}`);
  mapEl.style.setProperty('--wind-smoke-alpha-strong', `${Math.min(0.98, baseAlpha + 0.2).toFixed(2)}`);
  mapEl.classList.add('ht-wind-smoke-active');
}

function ensureWindOverlay() {
  if (!map) return;
  if (!WIND_OVERLAY_ENABLED) return;
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

  const getSeedBounds = () => {
    const bounds = getTrackingBounds();
    if (!bounds) return null;
    const sw = map.latLngToContainerPoint(bounds.getSouthWest());
    const ne = map.latLngToContainerPoint(bounds.getNorthEast());
    const minX = Math.min(sw.x, ne.x);
    const maxX = Math.max(sw.x, ne.x);
    const minY = Math.min(sw.y, ne.y);
    const maxY = Math.max(sw.y, ne.y);
    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;
    if ((maxX - minX) < 80 || (maxY - minY) < 80) return null;
    const pad = 60;
    return {
      minX: minX - pad,
      maxX: maxX + pad,
      minY: minY - pad,
      maxY: maxY + pad
    };
  };

  const spawnParticles = () => {
    windOverlayParticles = [];
    const size = map.getSize();
    const seedBounds = getSeedBounds();
    const count = Math.max(140, Math.min(260, Math.round((size.x * size.y) / 5200)));
    for (let i = 0; i < count; i++) {
      const x = seedBounds
        ? seedBounds.minX + Math.random() * (seedBounds.maxX - seedBounds.minX)
        : Math.random() * size.x;
      const y = seedBounds
        ? seedBounds.minY + Math.random() * (seedBounds.maxY - seedBounds.minY)
        : Math.random() * size.y;
      windOverlayParticles.push({
        x,
        y,
        a: 0.2 + Math.random() * 0.35,
        w: 1.2 + Math.random() * 2.4,
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
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, size.x, size.y);
    ctx.globalCompositeOperation = 'source-over';

    if (windOverlayVec) {
      const baseVx = windOverlayVec[0] * windOverlaySpeedPx;
      const baseVy = windOverlayVec[1] * windOverlaySpeedPx;

      for (const p of windOverlayParticles) {
        const ox = p.x;
        const oy = p.y;

        // Gentle turbulence so it looks like drifting smoke.
        const n = Math.sin((ox + t * 0.02) * 0.012 + (oy + p.seed) * 0.009) * 0.5;
        const ang = n * 0.4;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);

        const vx = (baseVx * ca - baseVy * sa) * (0.65 + p.w * 0.3);
        const vy = (baseVx * sa + baseVy * ca) * (0.65 + p.w * 0.3);

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
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = `rgba(255,255,255,${p.a})`;
        ctx.stroke();
      }
    }

    windOverlayRaf = requestAnimationFrame(step);
  };

  if (!windOverlayRaf) windOverlayRaf = requestAnimationFrame(step);
}

function stopWindOverlay() {
  windOverlayVec = null;
  if (windOverlayRoot) windOverlayRoot.style.display = 'none';
  if (windOverlayRaf) cancelAnimationFrame(windOverlayRaf);
  windOverlayRaf = null;
}

// Public hook: drive the animated overlay from live weather + plan wind.
window.updateWindOverlay = function(dir, speedMph) {
  if (!WIND_OVERLAY_ENABLED) {
    stopWindOverlay();
    return;
  }
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
  const spd = Number.isFinite(mph) ? Math.max(2, mph) : 8;
  windOverlaySpeedPx = Math.max(0.4, Math.min(2.2, 0.45 + spd / 18));
  if (windOverlayRoot) windOverlayRoot.style.display = 'block';
};


// ===================================================================
//   Weather Panel & Thermal System
// ===================================================================
function buildWeatherForecastFromOpenMeteo(data) {
  const hourly = data && data.hourly ? data.hourly : null;
  if (!hourly || !Array.isArray(hourly.time)) return null;
  const temps = Array.isArray(hourly.temperature_2m) ? hourly.temperature_2m : [];
  const speeds = Array.isArray(hourly.wind_speed_10m) ? hourly.wind_speed_10m : [];
  const dirs = Array.isArray(hourly.wind_direction_10m) ? hourly.wind_direction_10m : [];

  const timesMs = hourly.time.map((t) => {
    const ms = Date.parse(t);
    return Number.isFinite(ms) ? ms : null;
  });

  return {
    timesMs,
    temps,
    speeds,
    dirs
  };
}

function resolveThermalForecastSnapshot() {
  thermalOverlayForecast = null;
  if (!thermalOverlayForecastHours || !weatherForecast) return;
  const hours = Number(thermalOverlayForecastHours) || 0;
  if (!hours) return;

  const target = Date.now() + hours * 3600 * 1000;
  let bestIdx = -1;
  let bestDiff = Infinity;
  const times = weatherForecast.timesMs || [];
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    if (!Number.isFinite(t)) continue;
    const diff = Math.abs(t - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  if (bestIdx < 0) return;

  const temp = Number(weatherForecast.temps?.[bestIdx]);
  const windSpeed = Number(weatherForecast.speeds?.[bestIdx]);
  const windDirDeg = Number(weatherForecast.dirs?.[bestIdx]);
  const windDir = Number.isFinite(windDirDeg)
    ? ['N','NE','E','SE','S','SW','W','NW'][Math.round(windDirDeg / 45) % 8]
    : null;
  const timeMs = weatherForecast.timesMs?.[bestIdx];
  const hour = Number.isFinite(timeMs) ? new Date(timeMs).getHours() : new Date().getHours();

  thermalOverlayForecast = {
    temp: Number.isFinite(temp) ? Math.round(temp) : null,
    windSpeed: Number.isFinite(windSpeed) ? Math.round(windSpeed) : null,
    windDir,
    hour,
    timeMs
  };
}

function getThermalInputSnapshot() {
  const now = new Date();
  if (thermalOverlayForecast) {
    return {
      temp: thermalOverlayForecast.temp,
      windSpeed: thermalOverlayForecast.windSpeed,
      windDir: thermalOverlayForecast.windDir,
      hour: thermalOverlayForecast.hour,
      timeMs: thermalOverlayForecast.timeMs
    };
  }

  return {
    temp: Number.isFinite(activeTemperature) ? activeTemperature : 50,
    windSpeed: Number.isFinite(activeWindSpeed) ? activeWindSpeed : 6,
    windDir: activeWindDir || 'N',
    hour: now.getHours(),
    timeMs: now.getTime()
  };
}

function getThermalLift(tempF, hour) {
  const temp = Number.isFinite(tempF) ? tempF : 50;
  const hr = Number.isFinite(hour) ? hour : new Date().getHours();

  let diurnal = 0;
  if (hr >= 6 && hr <= 11) {
    diurnal = (hr - 6) / 5;
  } else if (hr > 11 && hr < 17) {
    diurnal = 1 - (hr - 11) * 0.06;
  } else if (hr >= 17 && hr <= 22) {
    diurnal = -((hr - 17) / 5);
  } else {
    diurnal = -0.8;
  }

  const tempBias = Math.max(-0.2, Math.min(1.1, (temp - 35) / 28));
  const lift = diurnal * tempBias;
  return Math.max(-1, Math.min(1, lift));
}

function getThermalPhaseLabel(lift) {
  if (lift > 0.35) return 'Rising';
  if (lift > 0.08) return 'Weak rise';
  if (lift < -0.35) return 'Sinking';
  if (lift < -0.08) return 'Weak sink';
  return 'Neutral';
}

function buildThermalForecastRows(forecast, limitHours = 24) {
  if (!forecast || !Array.isArray(forecast.timesMs)) return [];
  const now = Date.now();
  const rows = [];
  for (let i = 0; i < forecast.timesMs.length; i++) {
    const timeMs = forecast.timesMs[i];
    if (!Number.isFinite(timeMs)) continue;
    const hourDiff = (timeMs - now) / 3600000;
    if (hourDiff < -6 || hourDiff > limitHours) continue;
    const temp = Number(forecast.temps?.[i]);
    const windSpeed = Number(forecast.speeds?.[i]);
    const windDirDeg = Number(forecast.dirs?.[i]);
    const windDir = Number.isFinite(windDirDeg)
      ? ['N','NE','E','SE','S','SW','W','NW'][Math.round(windDirDeg / 45) % 8]
      : '--';
    const hour = new Date(timeMs).getHours();
    const lift = getThermalLift(temp, hour);
    rows.push({
      timeMs,
      hourDiff,
      hour,
      temp: Number.isFinite(temp) ? Math.round(temp) : null,
      windSpeed: Number.isFinite(windSpeed) ? Math.round(windSpeed) : null,
      windDir,
      lift,
      phase: getThermalPhaseLabel(lift)
    });
  }
  return rows;
}

function buildThermalSwitchAlerts(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return [];
  const alerts = [];
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const curr = rows[i];
    const prevLift = prev.lift || 0;
    const currLift = curr.lift || 0;
    const crossedUp = prevLift <= 0.05 && currLift > 0.05;
    const crossedDown = prevLift >= -0.05 && currLift < -0.05;
    if (crossedUp || crossedDown) {
      const strong = Math.abs(currLift) >= 0.45;
      alerts.push({
        timeMs: curr.timeMs,
        hourDiff: curr.hourDiff,
        label: crossedUp ? 'Thermal lift begins' : 'Thermal drop begins',
        detail: strong
          ? (isMushroomModule() ? 'Strong switch likely. Soil moisture may shift — check shaded draws.' : 'Strong switch likely. Mature bucks often reposition.')
          : (isMushroomModule() ? 'Subtle switch. Watch micro-climate changes near water.' : 'Subtle switch. Watch micro moves.'),
        lift: currLift,
        windDir: curr.windDir,
        windSpeed: curr.windSpeed
      });
    }
  }
  return alerts.slice(0, 6);
}

function formatThermalHour(timeMs) {
  if (!Number.isFinite(timeMs)) return '--';
  return new Date(timeMs).toLocaleTimeString([], { hour: 'numeric' });
}

function ensureWeatherPanel() {
  let panel = document.getElementById('weather-panel');
  if (panel) return panel;
  panel = document.createElement('div');
  panel.id = 'weather-panel';
  panel.className = 'ht-weather-panel';
  document.body.appendChild(panel);
  return panel;
}

function renderWeatherPanel() {
  const panel = document.getElementById('weather-panel');
  if (!panel) return;
  const rows = buildThermalForecastRows(weatherForecast, 24);
  const alerts = buildThermalSwitchAlerts(rows);
  const input = getThermalInputSnapshot();
  const phase = thermalOverlayState?.phase || getThermalPhaseLabel(getThermalLift(input.temp, input.hour));
  const nowLabel = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
  // Location info display
  const geoLocation = weatherForecast?.geoLocation;
  const locationText = geoLocation?.source === 'gps' 
    ? `📍 GPS Location${geoLocation.accuracy ? ` (±${Math.round(geoLocation.accuracy)}m)` : ''}`
    : '🗺️ Map Center';
  
  const lastUpdate = weatherForecastUpdatedAt 
    ? new Date(weatherForecastUpdatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : 'Never';

  const timeline = rows.map((row) => {
    const height = Math.max(12, Math.min(58, 20 + Math.abs(row.lift) * 38));
    const tone = row.lift >= 0 ? 'rise' : 'sink';
    const active = Math.abs(row.hourDiff) < 0.5 ? 'is-now' : '';
    return `
      <div class="ht-thermal-bar ${tone} ${active}" style="height:${height}px" title="${formatThermalHour(row.timeMs)} • ${row.phase}"></div>
    `;
  }).join('');

  const alertsHtml = alerts.length
    ? alerts.map((alert) => {
      const hours = Math.max(-6, Math.min(12, Math.round(alert.hourDiff)));
      const timeLabel = formatThermalHour(alert.timeMs);
      return `
        <button class="ht-thermal-alert" data-forecast="${hours}">
          <div class="ht-thermal-alert-title">${alert.label} • ${timeLabel}</div>
          <div class="ht-thermal-alert-sub">${alert.detail}</div>
          <div class="ht-thermal-alert-meta">Wind ${alert.windSpeed || '--'} mph ${alert.windDir || '--'}</div>
        </button>
      `;
    }).join('')
    : '<div class="ht-weather-empty">No major switches detected in the next 24 hours.</div>';

  panel.innerHTML = `
    <div class="ht-weather-panel-header">
      <div>
        <div class="ht-weather-panel-title">Weather + Thermals</div>
        <div class="ht-weather-panel-sub">Live at ${nowLabel} • Phase: ${phase}</div>
        <div class="ht-weather-location">${locationText} • Updated ${lastUpdate}</div>
      </div>
      <button class="ht-weather-panel-close" type="button" onclick="closeWeatherPanel()">X</button>
    </div>
    <div class="ht-weather-controls">
      <button class="ht-weather-refresh" type="button" onclick="manualWeatherRefresh()">
        🔄 Refresh Weather
      </button>
    </div>
    <div class="ht-weather-summary">
      <div class="ht-weather-metric">
        <div class="ht-weather-metric-label">Temp</div>
        <div class="ht-weather-metric-value">${Number.isFinite(input.temp) ? `${input.temp}°` : '--'}</div>
      </div>
      <div class="ht-weather-metric">
        <div class="ht-weather-metric-label">Wind</div>
        <div class="ht-weather-metric-value">${Number.isFinite(input.windSpeed) ? `${input.windSpeed} mph` : '--'}</div>
      </div>
      <div class="ht-weather-metric">
        <div class="ht-weather-metric-label">Direction</div>
        <div class="ht-weather-metric-value">${input.windDir || '--'}</div>
      </div>
    </div>
    <div class="ht-thermal-timeline">
      ${timeline || '<div class="ht-weather-empty">Forecast unavailable. Try again soon.</div>'}
    </div>
    <div class="ht-weather-section">
      <div class="ht-weather-section-title">Thermal Switch Alerts</div>
      <div class="ht-thermal-alerts">
        ${alertsHtml}
      </div>
    </div>
    <div class="ht-weather-section">
      <div class="ht-weather-section-title">Thermal Masterclass</div>
      <div class="ht-weather-tips">
        ${isMushroomModule()
          ? `<strong>Moisture zones:</strong> low draws, north-facing slopes, and shaded creek bands hold soil moisture longest.
            <br><strong>Morning dew:</strong> check leaf litter edges and downed logs in the early hours.
            <br><strong>Afternoon warmth:</strong> south-facing hillsides may dry faster — focus on deeper shade.
            <br><strong>Rain follow-up:</strong> 2-3 days after warm rain is prime morel timing. Watch soil temp near 50°F.`
          : `<strong>Thermal hubs:</strong> bowls where multiple draws meet. Bucks use them to scent-check multiple ridges.
            <br><strong>Morning lift:</strong> move up from drains to benches and leeward pockets.
            <br><strong>Evening sink:</strong> drop into thermal drains and low bowls before dark.
            <br><strong>Switch moment:</strong> expect short elevation moves and micro repositioning along benches.`}
      </div>
      <button class="ht-thermal-hub-toggle" type="button" onclick="toggleThermalHubOverlay()">${thermalHubEnabled ? 'Hide' : 'Show'} Thermal Hubs</button>
    </div>
  `;

  panel.querySelectorAll('.ht-thermal-alert').forEach((btn) => {
    btn.addEventListener('click', () => {
      const hours = Number(btn.getAttribute('data-forecast')) || 0;
      setThermalForecastHours(hours);
    });
  });
}

function showWeatherPanel() {
  const panel = ensureWeatherPanel();
  panel.classList.add('open');
  renderWeatherPanel();
}

function closeWeatherPanel() {
  const panel = document.getElementById('weather-panel');
  if (panel) panel.classList.remove('open');
}

window.closeWeatherPanel = closeWeatherPanel;

function updateWeatherPanelIfOpen() {
  const panel = document.getElementById('weather-panel');
  if (panel && panel.classList.contains('open')) {
    renderWeatherPanel();
  }
}

function updateThermalOverlayState() {
  resolveThermalForecastSnapshot();
  const input = getThermalInputSnapshot();
  const windVecGeo = windDirToVector(input.windDir);
  const flowGeoX = windVecGeo ? -windVecGeo[0] : 0;
  const flowGeoY = windVecGeo ? -windVecGeo[1] : 0;
  const sx = flowGeoX;
  const sy = -flowGeoY;
  const mag = Math.hypot(sx, sy) || 1;
  const windVec = windVecGeo ? [sx / mag, sy / mag] : [0, 0];

  const windSpeed = Number.isFinite(input.windSpeed) ? Math.max(2, input.windSpeed) : 6;
  const windSpeedPx = Math.max(0.3, Math.min(2.6, 0.45 + windSpeed / 18));
  const lift = getThermalLift(input.temp, input.hour);
  const thermalStrength = Math.max(0.2, Math.min(2.2, Math.abs(lift) * 1.6 + 0.2));
  const phase = getThermalPhaseLabel(lift);

  thermalOverlayState = {
    windVec,
    windSpeedPx,
    lift,
    thermalStrength,
    temp: input.temp,
    windSpeed,
    windDir: input.windDir,
    hour: input.hour,
    phase
  };
  updateWeatherPanelIfOpen();
}

function ensureThermalHubLayer() {
  if (!map) return null;
  if (thermalHubLayer) return thermalHubLayer;
  thermalHubLayer = L.layerGroup().addTo(map);
  return thermalHubLayer;
}

function clearThermalHubLayer() {
  if (thermalHubLayer) {
    thermalHubLayer.clearLayers();
  }
}

function buildThermalHubSeeds() {
  const seeds = [];
  const source = Array.isArray(thermalOverlaySeeds) ? thermalOverlaySeeds : [];
  const types = new Set(['thermal_drain', 'saddle', 'leeward_pocket', 'bench', 'ridge_point']);
  source.forEach((seed) => {
    if (!seed?.latlng) return;
    if (!types.has(seed.type)) return;
    seeds.push({
      latlng: L.latLng(seed.latlng),
      type: seed.type,
      score: Number(seed.score) || 80
    });
  });
  seeds.sort((a, b) => (b.score || 0) - (a.score || 0));
  return seeds.slice(0, 10);
}

function renderThermalHubLayer() {
  if (!thermalHubEnabled) return;
  const layer = ensureThermalHubLayer();
  if (!layer) return;
  clearThermalHubLayer();
  const seeds = buildThermalHubSeeds();
  if (!seeds.length) return;

  seeds.forEach((seed) => {
    const circle = L.circle(seed.latlng, {
      radius: 120,
      color: '#ffd08a',
      weight: 2,
      fillColor: '#ffb55a',
      fillOpacity: 0.12,
      className: 'ht-thermal-hub-ring'
    });
    circle.addTo(layer);
  });
}

window.toggleThermalHubOverlay = function(forceState) {
  const nextState = typeof forceState === 'boolean' ? forceState : !thermalHubEnabled;
  thermalHubEnabled = nextState;
  if (!nextState) {
    clearThermalHubLayer();
  } else {
    renderThermalHubLayer();
  }
  updateWeatherPanelIfOpen();
};

function setThermalSeedsFromFeatures(features, options = {}) {
  const list = Array.isArray(features) ? features : [];
  const merge = Boolean(options.merge);
  const minSpacing = Number.isFinite(options.minSpacing) ? options.minSpacing : 140;
  const seeds = merge && Array.isArray(thermalOverlaySeeds) ? thermalOverlaySeeds.slice() : [];

  list.forEach((feature) => {
    const latlng = feature?.latlng ? L.latLng(feature.latlng) : null;
    if (!latlng) return;
    const tooClose = seeds.some((s) => s.latlng && s.latlng.distanceTo(latlng) < minSpacing);
    if (tooClose) return;
    seeds.push({
      latlng,
      type: feature.type || 'terrain',
      score: Number(feature.score) || 80
    });
  });

  if (options.includeCoreZones && Array.isArray(coreZones)) {
    coreZones.forEach((zone) => {
      const ll = Array.isArray(zone.coords) ? L.latLng(zone.coords[0], zone.coords[1]) : null;
      if (!ll) return;
      const tooClose = seeds.some((s) => s.latlng && s.latlng.distanceTo(ll) < minSpacing);
      if (!tooClose) {
        seeds.push({ latlng: ll, type: 'core_zone', score: Number(zone.score) || 90 });
      }
    });
  }

  thermalOverlaySeeds = seeds;
  scheduleThermalSeedRefresh(true);
  if (thermalHubEnabled) renderThermalHubLayer();
}

function addThermalAnchorsFromHotspots(hotspots) {
  const list = Array.isArray(hotspots) ? hotspots : [];
  const anchors = [];
  list.forEach((hotspot) => {
    const thermal = hotspot?.education?.thermal;
    if (!thermal || !thermal.seedType) return;
    const coords = Array.isArray(hotspot.coords) ? hotspot.coords : null;
    if (!coords) return;
    const latlng = L.latLng(coords[0], coords[1]);
    anchors.push({
      latlng,
      type: thermal.seedType,
      score: Number(hotspot?.tier) ? 86 + (5 - Math.min(5, hotspot.tier)) : 88
    });
  });

  if (anchors.length) {
    setThermalSeedsFromFeatures(anchors, { merge: true, minSpacing: 110 });
  }
}

function scheduleThermalSeedRefresh(respawnParticles = false) {
  if (thermalOverlaySeedRaf) cancelAnimationFrame(thermalOverlaySeedRaf);
  if (respawnParticles) thermalOverlaySeedRefreshNeedsRespawn = true;
  thermalOverlaySeedRaf = requestAnimationFrame(() => {
    thermalOverlaySeedRaf = null;
    refreshThermalOverlaySeedScreen();
    if (thermalOverlaySeedRefreshNeedsRespawn && thermalOverlaySpawnParticles) {
      thermalOverlaySpawnParticles();
    }
    thermalOverlaySeedRefreshNeedsRespawn = false;
  });
}

function refreshThermalOverlaySeedScreen() {
  if (!map) return;
  if (!Array.isArray(thermalOverlaySeeds) || !thermalOverlaySeeds.length) {
    thermalOverlaySeedScreen = [];
    return;
  }
  const screen = [];
  for (const seed of thermalOverlaySeeds) {
    const ll = seed?.latlng ? L.latLng(seed.latlng) : null;
    if (!ll) continue;
    const pt = map.latLngToContainerPoint(ll);
    if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) continue;
    screen.push({
      x: pt.x,
      y: pt.y,
      type: seed.type || 'terrain',
      score: Number(seed.score) || 80
    });
  }
  thermalOverlaySeedScreen = screen;
}

function ensureThermalOverlay() {
  if (!map) return;
  if (!THERMAL_OVERLAY_AVAILABLE) return;
  if (thermalOverlayRoot && thermalOverlayCanvas && thermalOverlayCtx) return;

  const root = document.createElement('div');
  root.className = 'ht-thermal-overlay';
  const canvas = document.createElement('canvas');
  canvas.className = 'ht-thermal-canvas';
  root.appendChild(canvas);
  map.getContainer().appendChild(root);

  thermalOverlayRoot = root;
  thermalOverlayCanvas = canvas;
  thermalOverlayCtx = canvas.getContext('2d', { alpha: true });

  const resize = () => {
    if (!thermalOverlayCanvas) return;
    const size = map.getSize();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    thermalOverlayCanvas.width = Math.max(1, Math.floor(size.x * dpr));
    thermalOverlayCanvas.height = Math.max(1, Math.floor(size.y * dpr));
    thermalOverlayCanvas.style.width = `${size.x}px`;
    thermalOverlayCanvas.style.height = `${size.y}px`;
    if (thermalOverlayCtx) thermalOverlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const getSeedBounds = () => {
    const bounds = selectedAreaLayer ? getSelectedAreaBounds() : null;
    if (!bounds) return null;
    const sw = map.latLngToContainerPoint(bounds.getSouthWest());
    const ne = map.latLngToContainerPoint(bounds.getNorthEast());
    const minX = Math.min(sw.x, ne.x);
    const maxX = Math.max(sw.x, ne.x);
    const minY = Math.min(sw.y, ne.y);
    const maxY = Math.max(sw.y, ne.y);
    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;
    if ((maxX - minX) < 80 || (maxY - minY) < 80) return null;
    const pad = 80;
    return {
      minX: minX - pad,
      maxX: maxX + pad,
      minY: minY - pad,
      maxY: maxY + pad
    };
  };

  const spawnParticles = () => {
    thermalOverlayParticles = [];
    const size = map.getSize();
    const seedBounds = getSeedBounds();
    const count = Math.max(160, Math.min(260, Math.round((size.x * size.y) / 5200)));
    const seedScreen = Array.isArray(thermalOverlaySeedScreen) ? thermalOverlaySeedScreen : [];
    const hasSeeds = seedScreen.length > 0;
    const jitter = 120;
    for (let i = 0; i < count; i++) {
      let x;
      let y;
      if (hasSeeds) {
        const seed = seedScreen[Math.floor(Math.random() * seedScreen.length)];
        x = seed.x + (Math.random() - 0.5) * jitter;
        y = seed.y + (Math.random() - 0.5) * jitter;
      } else {
        x = seedBounds
          ? seedBounds.minX + Math.random() * (seedBounds.maxX - seedBounds.minX)
          : Math.random() * size.x;
        y = seedBounds
          ? seedBounds.minY + Math.random() * (seedBounds.maxY - seedBounds.minY)
          : Math.random() * size.y;
      }
      thermalOverlayParticles.push({
        x,
        y,
        a: 0.18 + Math.random() * 0.45,
        w: 0.8 + Math.random() * 1.8,
        seed: Math.random() * 1000
      });
    }
  };

  resize();
  spawnParticles();
  thermalOverlaySpawnParticles = spawnParticles;
  refreshThermalOverlaySeedScreen();

  map.on('resize', () => {
    resize();
    spawnParticles();
    scheduleThermalSeedRefresh();
  });
  map.on('move', scheduleThermalSeedRefresh);
  map.on('zoom', scheduleThermalSeedRefresh);

  const seedProfile = {
    thermal_drain: { sink: 1.0, source: 0.2 },
    creek_line: { sink: 0.8, source: 0.15 },
    water_edge: { sink: 0.7, source: 0.2 },
    saddle: { sink: 0.6, source: 0.7 },
    bench: { sink: 0.45, source: 0.65 },
    ridge_point: { sink: 0.3, source: 1.0 },
    micro_nob: { sink: 0.35, source: 0.9 },
    leeward_pocket: { sink: 0.45, source: 0.9 },
    pinch: { sink: 0.5, source: 0.6 },
    core_zone: { sink: 0.4, source: 0.85 }
  };

  const step = (t) => {
    if (!thermalOverlayCtx || !thermalOverlayCanvas) return;
    const ctx = thermalOverlayCtx;
    const size = map.getSize();

    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, size.x, size.y);
    ctx.globalCompositeOperation = 'source-over';

    if (thermalOverlayEnabled && thermalOverlayState) {
      const windVec = thermalOverlayState.windVec || [0, 0];
      const windSpeedPx = thermalOverlayState.windSpeedPx || 0.6;
      const lift = thermalOverlayState.lift || 0;
      const strength = thermalOverlayState.thermalStrength || 0.6;
      const seedScreen = thermalOverlaySeedScreen || [];
      const intensity = 0.6 + Math.min(0.7, Math.abs(lift) * 0.8);
      const colorBase = lift >= 0 ? '255,210,160' : '140,190,255';

      const baseVx = windVec[0] * windSpeedPx;
      const baseVy = windVec[1] * windSpeedPx;
      const liftScale = Math.min(0.35, Math.abs(lift) * 0.22);
      const liftVy = -Math.sign(lift || 0) * liftScale * (0.5 + windSpeedPx * 0.35);
      const perp = [-windVec[1], windVec[0]];

      for (const p of thermalOverlayParticles) {
        const ox = p.x;
        const oy = p.y;

        let vx = baseVx;
        let vy = baseVy + liftVy;

        if (seedScreen.length) {
          let best = null;
          let bestDist = Infinity;
          for (let i = 0; i < seedScreen.length; i++) {
            const s = seedScreen[i];
            const dx = s.x - p.x;
            const dy = s.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < bestDist) {
              bestDist = dist;
              best = s;
            }
          }
          if (best && bestDist > 1) {
            const profile = seedProfile[best.type] || { sink: 0.5, source: 0.5 };
            const bias = lift >= 0 ? profile.source : profile.sink;
            const scale = (Math.max(40, Math.min(220, bestDist)) / 220);
            const isSourceLean = profile.source >= profile.sink;
            const pullSign = lift >= 0
              ? (isSourceLean ? -1 : 1)
              : (isSourceLean ? 1 : -1);
            const pull = bias * strength * (1 - scale) * pullSign;
            vx += (best.x - p.x) / bestDist * pull;
            vy += (best.y - p.y) / bestDist * pull;
          }
        }

        const n = Math.sin((ox + t * 0.016) * 0.012 + (oy + p.seed) * 0.01);
        vx += n * 0.32;
        vy += Math.cos((oy + t * 0.017) * 0.011 + p.seed) * 0.28;
        const swirl = Math.sin(p.seed + t * 0.002 + (ox + oy) * 0.008) * 0.35;
        vx += perp[0] * swirl;
        vy += perp[1] * swirl;

        p.x += vx * (0.6 + p.w * 0.45);
        p.y += vy * (0.6 + p.w * 0.45);

        if (p.x < -30) p.x = size.x + 30;
        if (p.x > size.x + 30) p.x = -30;
        if (p.y < -30) p.y = size.y + 30;
        if (p.y > size.y + 30) p.y = -30;

        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(p.x, p.y);
        ctx.lineWidth = 1.8 + p.w * 0.6;
        ctx.strokeStyle = `rgba(${colorBase},${Math.min(0.75, p.a * intensity)})`;
        ctx.stroke();
      }
    }

    thermalOverlayRaf = requestAnimationFrame(step);
  };

  if (!thermalOverlayRaf) thermalOverlayRaf = requestAnimationFrame(step);
}

function startThermalOverlay() {
  if (!THERMAL_OVERLAY_AVAILABLE) return;
  thermalOverlayEnabled = true;
  ensureThermalOverlay();
  updateThermalOverlayState();
  if (thermalOverlayRoot) thermalOverlayRoot.style.display = 'block';
}

function stopThermalOverlay() {
  thermalOverlayEnabled = false;
  if (thermalOverlayRoot) thermalOverlayRoot.style.display = 'none';
}

window.toggleThermalOverlay = function(forceState) {
  const nextState = typeof forceState === 'boolean' ? forceState : !thermalOverlayEnabled;
  if (!THERMAL_OVERLAY_AVAILABLE) {
    stopThermalOverlay();
    return;
  }
  if (nextState) {
    startThermalOverlay();
  } else {
    stopThermalOverlay();
  }
  try { localStorage.setItem('htThermalOverlayEnabled', nextState ? '1' : '0'); } catch {}
  updateWeatherPanelIfOpen();
};

window.setThermalForecastHours = function(value) {
  const hours = Math.max(-6, Math.min(12, Number(value) || 0));
  thermalOverlayForecastHours = hours;
  resolveThermalForecastSnapshot();
  updateThermalOverlayState();
  updateWeatherPanelIfOpen();
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


// ===================================================================
//   Strategy Panel & Plan Display
// ===================================================================
function updatePlanLoadingStatus(title, subtitle) {
  const panel = document.getElementById('strategy-panel');
  if (!panel) return;
  const titleEl = panel.querySelector('.ht-plan-loading-title');
  const subEl = panel.querySelector('.ht-plan-loading-sub');
  if (titleEl) titleEl.textContent = title || '';
  if (subEl) subEl.textContent = subtitle || '';
  planLoadingManualAt = Date.now();
}

function isPlanLoadingActive() {
  const panel = document.getElementById('strategy-panel');
  return Boolean(panel && panel.querySelector('.ht-plan-loading'));
}

function stopPlanLoadingTicker() {
  if (planLoadingTicker) {
    clearInterval(planLoadingTicker);
    planLoadingTicker = null;
  }
}

function startPlanLoadingTicker() {
  stopPlanLoadingTicker();
  planLoadingIndex = 0;
  const messages = isMushroomModule() ? [
    ['HUNTECH AI core online', 'Forage terrain signals streaming in.'],
    ['Scanning elevation lattice', 'Slope aspect and drainage mapped.'],
    ['Analyzing moisture zones', 'Canopy cover and soil conditions modeled.'],
    ['Mapping tree associations', 'Elm, ash, and poplar zones identified.'],
    ['Deploying AI forensics', 'Forage-pin confidence converging.'],
    ['Balancing pin distribution', 'Spacing resolved at micro-variance.'],
    ['Finalizing route context', 'Route-aware scoring engaged.']
  ] : [
    ['HUNTECH AI core online', 'Terrain signals streaming into the mesh.'],
    ['Scanning elevation lattice', 'Slope vectors and ridge breaks fused.'],
    ['Decoding habitat layers', 'Cover density and thermal drift modeled.'],
    ['Synthesizing movement paths', 'Corridor probabilities stabilizing.'],
    ['Deploying AI forensics', 'Hotspot confidence converging.'],
    ['Balancing pin distribution', 'Spacing resolved at micro-variance.'],
    ['Finalizing route context', 'Route-aware scoring engaged.']
  ];

  updatePlanLoadingStatus(messages[0][0], messages[0][1]);
  planLoadingTicker = setInterval(() => {
    const recentManual = Date.now() - planLoadingManualAt < 3000;
    if (recentManual) return;
    planLoadingIndex = (planLoadingIndex + 1) % messages.length;
    const msg = messages[planLoadingIndex];
    updatePlanLoadingStatus(msg[0], msg[1]);
  }, 1800);
}

// Show enhanced strategy panel
function showStrategyLoadingPanel() {
  const existing = document.getElementById('strategy-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'strategy-panel';
  panel.className = 'ht-strategy-panel';
  panel.innerHTML = `
    <h2 class="ht-panel-title">Plan + Route</h2>
    <div class="ht-plan-loading">
      <div class="ht-plan-spinner" aria-hidden="true"></div>
      <div class="ht-plan-loading-title">${isMushroomModule() ? 'Building forage plan...' : 'Building hunt plan...'}</div>
      <div class="ht-plan-loading-sub">${isMushroomModule() ? 'Mapping forage pins, moisture, and route options.' : 'Mapping hotspots, wind, and route options.'}</div>
    </div>
  `;
  document.body.appendChild(panel);
  setStrategyOpen(true);
  updateTrayToggleButton();
  startPlanLoadingTicker();
}

function showStrategyPanel(hotspots, temp, windSpeed, windDir, options = {}) {
  const existing = document.getElementById('strategy-panel');
  if (existing) existing.remove();
  stopPlanLoadingTicker();

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

  const sitRecommendations = safeHotspots
    .slice(0, 3)
    .map((h, idx) => {
      let sitAdvice;
      if (isTurkeyModule()) {
        const weapon = window._turkeyWeapon || 'shotgun';
        const dist = weapon === 'bow' ? '15-20 yd' : weapon === 'crossbow' ? '20-30 yd' : '30-40 yd';
        sitAdvice = `Set up ${dist} from sign. Back to a wide tree. Start with soft yelps.`;
      } else {
        sitAdvice = `Best with ${windDir || 'variable'} wind. Approach from downwind cover.`;
      }
      return `
      <div style="margin:6px 0;padding:6px;border:1px solid rgba(0,255,136,0.25);border-radius:8px;background:rgba(0,255,136,0.05);">
        <div style="font-weight:700;color:#7cffc7;">Setup ${idx + 1}: ${h?.education?.title || 'Priority Zone'}</div>
        <div style="font-size:12px;color:#ccc;">${sitAdvice}</div>
      </div>
    `;
    })
    .join('');

  const mode = options && options.mode ? options.mode : 'route';
  const showMissionBrief = options.showMissionBrief !== false;
  const showRouteControls = options.showRouteControls !== false;
  const showExtendedScoutingPanels = false;
  const routeMapLabel = isFlyModule() ? 'Pick Parking + Entry (Map)' : 'Select Starting Point On Map';
  const routeGpsLabel = isFlyModule() ? 'Start From My Location' : 'Start From My Location';
  const priorityTitles = safeHotspots.slice(0, 4).map((h, idx) => {
    const rank = h?.rank ?? h?.priority ?? (idx + 1);
    return `Pin ${rank}: ${h?.education?.title || 'Priority zone'}`;
  });
  const missionDistance = huntCriteria?.distance || 'medium';
  const missionTime = huntCriteria?.time || '60';
  const missionFitness = huntCriteria?.fitness || 'intermediate';
  const missionDepth = huntCriteria?.depth || 'general';
  const windLabel = windDir || 'variable';
  const tempLabel = Number.isFinite(temp) ? `${temp}F` : '--';
  const windSpeedLabel = Number.isFinite(windSpeed) ? `${windSpeed} mph` : '--';
  const pinCount = safeHotspots.length;
  const firstHotspot = safeHotspots[0] || null;
  const firstRank = firstHotspot?.rank ?? firstHotspot?.priority ?? 1;
  const firstTitle = firstHotspot?.education?.title || 'Priority 1 pin';
  const firstTitleLabel = `Pin ${firstRank}: ${firstTitle}`;
  const firstDesc = firstHotspot?.education?.description || '';
  const firstLookFor = firstHotspot?.education?.lookFor || firstHotspot?.education?.tips || '';
  const firstWhy = Array.isArray(firstHotspot?.education?.why) ? firstHotspot.education.why : [];
  const firstApproach = Array.isArray(firstHotspot?.education?.approach) ? firstHotspot.education.approach : [];
  const isMush = isMushroomModule();
  const isTurk = isTurkeyModule();
  let missionText, phaseOne, phaseTwo, phaseThree;
  if (isTurk) {
    const weapon = window._turkeyWeapon || 'shotgun';
    const setupDist = weapon === 'bow' ? '15-20' : weapon === 'crossbow' ? '20-30' : '30-40';
    missionText = `Turkey hunt plan for your ${missionTime}-minute window (${weapon}). The route prioritizes roost zones and strut areas first, then flows through travel corridors and feeding areas. Priority 1 is always the roost — be set up ${setupDist} yards away before first light. Check in at each setup to start tracking, then tap Check Out before moving to the next position.`;
    phaseOne = `Phase 1: Pre-dawn setup. Be in position at ${firstTitle} 30 minutes before shooting light. Back against a tree wider than your shoulders. ${weapon === 'shotgun' ? 'Pattern your gun at 40 yards before the hunt.' : weapon === 'bow' ? 'Range key landmarks out to 25 yards.' : 'Range landmarks out to 35 yards.'} Tap Check In when set.`;
    phaseTwo = 'Phase 2: Calling sequence. Start with soft tree yelps before flydown. After flydown, switch to clucks and purrs. Wait 15-20 minutes between calling series — patience kills more turkeys than world-class calling. If a gobbler responds, DO NOT call again until he gobbles twice more.';
    phaseThree = 'Phase 3: Mid-morning relocate. If no response by 9 AM, move to the next strut zone or travel corridor. Turkeys shift to feeding areas mid-morning. Soft yelps and scratching in the leaves can pull in a quiet gobbler. Stay mobile but set up fully at each new position.';
  } else if (isMush) {
    missionText = `Balanced route for your ${missionTime}-minute window: the path favors moisture, canopy cover, and host trees while prioritizing your top forage pins. The route may not follow priority order — start with the highest-priority pins, then flow to the nearest next pin to keep the walk efficient. Check in at each pin to start tracking, then tap Check Out to close the search shape before moving on.`;
    phaseOne = `Phase 1: Entry + check-in. Approach quietly, confirm ground moisture level, then tap Check In when you reach ${firstTitle}.`;
    phaseTwo = 'Phase 2: Forage sweep. Work each search shape in 10-20 yard lanes. Focus on downed logs, leaf litter edges, and the base of host trees. Scan at ankle level and pause often. Track tree species as you go.';
    phaseThree = 'Phase 3: Reset + adjust. If you find morels, stop and grid a tight 20-foot circle — they rarely grow alone. If cold, move to the next closest priority pin to keep distance low.';
  } else {
    missionText = `Balanced route for your ${missionTime}-minute window: the path favors easy walking while still prioritizing your top hotspots. The route may not follow priority order, so always hit Priority 1-2 pins first, then flow into the nearest next pin to keep the walk efficient. Walk the downwind side of primary doe trails to mirror mature buck travel. Check in on each pin to start tracking, then tap Check Out to close the search shape before moving on.`;
    phaseOne = `Phase 1: Entry + check-in. Approach from the downwind side, confirm wind with milkweed or powder, then tap Check In when you reach ${firstTitle}.`;
    phaseTwo = `Phase 2: Sweep. Walk each search shape in 30-60 yard lanes. Work leeward edges, trail crossings, and benches that keep your wind off likely beds. Stay 20-40 yards downwind of doe trails to follow how a mature buck checks them.`;
    phaseThree = `Phase 3: Exit + adjust. If sign is hot, tighten to micro-grids around the last find. If cold, move to the next closest priority pin to keep distance low.`;
  }
  const logo = getHuntechLogoMarkup('ht-huntech-logo ht-huntech-logo--sm');
  const missionLogo = getHuntechLogoMarkup('ht-huntech-logo ht-mission-brief-logo');
  const cardLogo = getHuntechLogoMarkup('ht-card-logo');
  const priorityIntelHtml = safeHotspots.slice(0, 3).map((hotspot, idx) => {
    const title = hotspot?.education?.title || `Priority ${idx + 1}`;
    const rank = hotspot?.rank ?? hotspot?.priority ?? (idx + 1);
    const desc = hotspot?.education?.description || '';
    const tips = hotspot?.education?.tips || '';
    const detail = [desc, tips].filter(Boolean).join(' ');
    return `
      <div class="ht-mission-brief-card">
        ${cardLogo}
        <div class="ht-mission-brief-card-title">Pin ${rank}: ${escapeHtml(title)}</div>
        <div class="ht-mission-brief-card-body">${escapeHtml(detail || 'Details loading...')}</div>
      </div>
    `;
  }).join('');
  const firstDetailLines = [];
  if (firstDesc) firstDetailLines.push(escapeHtml(firstDesc));
  if (firstLookFor) firstDetailLines.push(`Look for: ${escapeHtml(firstLookFor)}`);
  if (firstWhy.length) firstDetailLines.push(`Why: ${escapeHtml(firstWhy.slice(0, 2).join(' '))}`);
  if (firstApproach.length) firstDetailLines.push(`Approach: ${escapeHtml(firstApproach.slice(0, 2).join(' '))}`);
  const firstDetailHtml = firstDetailLines.length
    ? firstDetailLines.map((line) => `<div class="ht-mission-brief-card-body">${line}</div>`).join('')
    : '<div class="ht-mission-brief-card-body">Priority 1 details will appear when pins load.</div>';
  const panelTitle = showRouteControls ? 'Plan + Route' : 'Mission Brief';
  const missionBriefHtml = showMissionBrief ? `
    <div class="ht-mission-brief">
      <div class="ht-mission-brief-header">
        <div class="ht-mission-brief-title">${missionLogo}<span>${isTurk ? 'Huntech AI Turkey Strategy' : (isMush ? 'Huntech AI Mushroom Foraging Brief' : 'Huntech AI Shed Strategy')}</span></div>
        <button class="ht-mission-brief-close" type="button" onclick="closeStrategyPanel(); stopSpeech();" aria-label="Close mission brief">Close</button>
        <div class="ht-mission-brief-actions">
          <button class="ht-mission-brief-pill" id="missionBriefAudioBtn" type="button" onclick="toggleMissionBriefAudio()" aria-pressed="${speechActive ? 'true' : 'false'}">${speechActive ? 'Stop Audio' : 'Read to Me'}</button>
          <button class="ht-mission-brief-pill" type="button" onclick="saveCurrentHuntPlan()">${isMush ? 'Save Forage Offline' : 'Save Hunt Offline'}</button>
        </div>
      </div>
      <div class="ht-mission-brief-statement">
        ${logo}
        <div class="ht-mission-brief-statement-body">
          <div class="ht-mission-brief-statement-title">${isTurk ? 'Huntech Turkey Strategy' : (isMush ? 'Huntech Mushroom Strategy' : 'Huntech Shed Strategy')}</div>
          <span>${missionText}</span>
        </div>
      </div>
      <div class="ht-mission-brief-meta">
        <div><strong>Window:</strong> ${missionTime} min • ${missionDistance} distance</div>
        <div><strong>Profile:</strong> ${missionFitness} fitness • ${missionDepth} depth</div>
        <div><strong>Conditions:</strong> Wind ${windSpeedLabel} ${windLabel} • Temp ${tempLabel}</div>
        <div><strong>Pins:</strong> ${pinCount ? `${pinCount} loaded` : 'Pins loading...'}</div>
      </div>
      <div class="ht-mission-brief-section">
        <div class="ht-mission-brief-subtitle">Start here</div>
        <div class="ht-mission-brief-card">
          ${cardLogo}
          <div class="ht-mission-brief-card-title">${escapeHtml(firstTitleLabel)}</div>
          ${firstDetailHtml}
        </div>
        <div class="ht-mission-brief-note">When you arrive at ${escapeHtml(firstTitleLabel)}, tap Check In on the pin card to start tracking.</div>
      </div>
      <div class="ht-mission-brief-section">
        <div class="ht-mission-brief-subtitle">Priority focus</div>
        <div class="ht-mission-brief-grid">
          ${priorityIntelHtml || '<div class="ht-mission-brief-card"><div class="ht-mission-brief-card-body">Pins loading...</div></div>'}
        </div>
      </div>
      <div class="ht-mission-brief-section">
        <div class="ht-mission-brief-subtitle">Phases</div>
        <div class="ht-mission-brief-note">${phaseOne}</div>
        <div class="ht-mission-brief-note">${phaseTwo}</div>
        <div class="ht-mission-brief-note">${phaseThree}</div>
      </div>
      <div class="ht-mission-brief-nav">
        <button class="ht-mission-brief-pill ht-mission-brief-pill--ghost" type="button" onclick="closeStrategyPanel(); backToPlanRoute();">Go Back</button>
        <button class="ht-mission-brief-pill" type="button" onclick="startOver()">Start Over</button>
      </div>
      <div class="ht-mission-brief-note">Priority order: ${priorityTitles.join(' • ') || 'Pins loading...'}</div>
    </div>
  ` : '';

  let strategyText = `
    <h2 class="ht-panel-title">${panelTitle}</h2>
    ${missionBriefHtml}
  `;

  if (showRouteControls) {
    strategyText += `
      <details open>
        <summary>Route</summary>
        <div style="margin-top:10px;">
          <div style="display:grid;gap:8px;margin-top:10px;">
            <button class="ht-panel-btn primary ht-panel-btn-select" onclick="beginRouteMapSelection()" ${hasHotspots ? '' : 'disabled'}>${routeMapLabel}</button>
            <button class="ht-panel-btn secondary" onclick="startRouteFromMyLocation()" ${hasHotspots ? '' : 'disabled'}>${routeGpsLabel}</button>
          </div>

        </div>
      </details>
      <div style="margin-top:12px;">
        <button class="ht-panel-btn secondary" onclick="returnToFieldCommand()">Return to Field Command</button>
      </div>
    `;
  }

  if (mode !== 'route' && showExtendedScoutingPanels) {
    strategyText += `
      <details>
        <summary>Scouting Layer</summary>
        <div style="margin-top:10px;display:grid;gap:8px;">
          <button class="ht-panel-btn ghost" id="scoutingToggleBtn" onclick="toggleScoutingLayer()">${coreAreaEnabled ? 'Hide' : 'Show'} ${isMush ? 'Core Morel Zones' : 'Core Buck Zones'}</button>
          <div style="font-size:12px;color:#aaa;">${isMush ? 'In-depth mode surfaces core morel habitat zones for scouting and focused foraging.' : 'In-depth mode surfaces core mature buck areas for scouting and future sit calculations.'}</div>
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
          <button class="ht-panel-btn ghost" onclick="openHuntJournalPanel()">${isMush ? 'Open Forage Journal' : 'Open Hunt Journal'}</button>
        </div>
      </details>

      <details>
        <summary>Saved Plans</summary>
        <div style="margin-top:10px;display:grid;gap:8px;">
          <button class="ht-panel-btn primary" onclick="saveCurrentHuntPlan()">${isMush ? 'Save Forage Offline' : 'Save Hunt Offline'}</button>
          <div id="savedPlansList" style="font-size:12px;color:#ddd;"></div>
        </div>
      </details>

      <details>
        <summary>Audio Briefing</summary>
        <div style="margin-top:10px;">
          <button class="ht-panel-btn ghost" onclick="speakHuntPlan()" ${hasHotspots ? '' : 'disabled'}>${isMush ? 'Listen to Forage Strategy' : 'Listen to Hunt Strategy'}</button>
          <button class="ht-panel-btn ghost" onclick="stopSpeech()" style="margin-top:8px;">Stop Audio</button>
        </div>
      </details>
    `;
  }

  strategyText += `
    <button class="ht-panel-btn quiet" onclick="closeStrategyPanel()" style="margin-top:10px;">Close</button>
  `;
  
  panel.innerHTML = strategyText;
  document.body.appendChild(panel);
  updateMissionBriefAudioButton();
  setStrategyOpen(true);
  updateTrayToggleButton();

  setSelectedRoutingMode(selectedRoutingMode);
  updateRoutePinStatus();

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

function ensureAdvancedToolsTray() {
  let tray = document.getElementById('advanced-tools-tray');
  if (tray) return tray;

  tray = document.createElement('div');
  tray.id = 'advanced-tools-tray';
  tray.className = 'ht-tool-tray';
  tray.innerHTML = `
    <div class="ht-tool-tray-header">
      <div class="ht-tool-tray-title">ADVANCED FIELD TOOLS</div>
      <div class="ht-tool-tray-actions">
        <button class="ht-tool-tray-close" type="button" onclick="dockAdvancedToolsTray()">MIN</button>
        <button class="ht-tool-tray-close" type="button" onclick="closeAdvancedToolsTray()">X</button>
      </div>
    </div>
    <button class="ht-tool-btn ht-tool-btn-go ht-tool-btn-full" onclick="finalizeRoutePlan()">LET'S GO</button>
    <div class="ht-tool-tray-banner">Features coming soon</div>
    <div class="ht-tool-grid">
      <button class="ht-tool-btn" id="toolTrackerBtn" onclick="toggleTracking()" disabled aria-disabled="true">Live Tracker</button>
      <button class="ht-tool-btn" id="toolVoiceBtn" onclick="toggleVoiceCommands()" disabled aria-disabled="true">Voice Commands</button>
      <button class="ht-tool-btn" id="toolLogPinBtn" onclick="logPinOnMap()">${isMushroomModule() ? 'Log Forage Pin' : 'Log Deer Pin'}</button>
      <button class="ht-tool-btn" id="toolTurkeyPinBtn" onclick="logTurkeyPinOnMap()">Drop Turkey Pin</button>
      <button class="ht-tool-btn ht-tool-btn-coach" id="toolCoachBtn" onclick="startCoach()">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 42 C26 38 22 32 20 25 C18 19 16 17 12 15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M32 42 C38 38 42 32 44 25 C46 19 48 17 52 15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 27 C18 25 16 23 14 21" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          <path d="M42 27 C46 25 48 23 50 21" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        HUNTECH COACH
      </button>
    </div>
    <div class="ht-tool-tray-note">Hands-free ready: say "Hey Huntech" to log without touching your phone.</div>
  `;

  document.body.appendChild(tray);
  return tray;
}

function updateAdvancedToolsTrayState() {
  const tray = document.getElementById('advanced-tools-tray');
  if (!tray) return;
  tray.querySelector('#toolTrackerBtn')?.classList.toggle('active', trackingActive);
  tray.querySelector('#toolVoiceBtn')?.classList.toggle('active', voiceActive);
  tray.querySelector('#toolCoachBtn')?.classList.toggle('active', coachActive);
  const turkeyBtn = tray.querySelector('#toolTurkeyPinBtn');
  if (turkeyBtn) turkeyBtn.style.display = isTurkeyModule() ? '' : 'none';
}

function showAdvancedToolsTray() {
  const tray = ensureAdvancedToolsTray();
  tray.classList.add('open');
  updateAdvancedToolsTrayState();
}

window.showAdvancedToolsTray = showAdvancedToolsTray;

function closeAdvancedToolsTray() {
  const tray = document.getElementById('advanced-tools-tray');
  if (tray) tray.classList.remove('open');
}

window.closeAdvancedToolsTray = closeAdvancedToolsTray;

function ensureAdvancedToolsDock() {
  return null;
}

function dockAdvancedToolsTray() {
  const tray = document.getElementById('advanced-tools-tray');
  if (tray) tray.classList.remove('open');
}

window.dockAdvancedToolsTray = dockAdvancedToolsTray;

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
      if (action === 'load') previewSavedHuntPlanById(id);
      if (action === 'remove') removeSavedHuntPlan(id);
    });
  });
}

function previewSavedHuntPlanById(id) {
  const plan = savedHuntPlans.find((entry) => entry.id === id);
  if (!plan) return;
  fieldCommandFlowActive = true;
  openFieldCommandTray();
  previewSavedHuntArea({
    areaType: plan.areaType,
    center: plan.areaCenter,
    radius: plan.areaRadius,
    latlngs: plan.areaLatlngs,
    bounds: plan.bounds
  }, {
    kind: 'plan',
    id: plan.id,
    name: plan.name
  });
  setFieldCommandStep(1);
}

window.saveCurrentHuntPlan = function() {
  if (!lastPlanSnapshot) {
    showNotice('Generate a plan first.', 'warning', 3200);
    return;
  }

  let areaPayload = {};
  if (selectedAreaLayer) {
    if (selectedAreaType === 'radius' && selectedAreaLayer.getLatLng) {
      areaPayload = {
        areaType: 'radius',
        areaCenter: [selectedAreaLayer.getLatLng().lat, selectedAreaLayer.getLatLng().lng],
        areaRadius: selectedAreaLayer.getRadius()
      };
    } else if (selectedAreaLayer.getLatLngs) {
      const latlngs = selectedAreaLayer.getLatLngs();
      const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
      areaPayload = {
        areaType: selectedAreaType || 'polygon',
        areaLatlngs: ring.map((point) => [point.lat, point.lng])
      };
    }
  }

  openInputModal({
    title: isMushroomModule() ? 'Save Forage Plan Offline' : 'Save Hunt Offline',
    message: isMushroomModule() ? 'Saved foraging plans are stored offline on this device for quick access.' : 'Saved hunts are stored offline on this device for quick access.',
    placeholder: 'Example: Late Feb Ridge Loop',
    confirmLabel: 'Save Offline',
    onSubmit: (name) => {
      if (!name) return;
      const id = `plan_${Date.now()}`;
      savedHuntPlans.unshift({
        id,
        name,
        ...lastPlanSnapshot,
        ...areaPayload
      });
      saveHuntPlans();
      renderSavedPropertiesSelect();
      renderSavedPlansList();
      showNotice(isMushroomModule() ? 'Forage saved offline.' : 'Hunt saved offline.', 'success', 3200);
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
      base: getActiveEducationSet()[h.habitat] || getActiveEducationSet().transition || getActiveEducationSet().travelCorridor,
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
  // showNotice(`Loaded plan: ${plan.name}`, 'success', 3200);
  showStrategyPanel(hydratedHotspots, plan.temperature || null, plan.windSpeed || null, plan.wind || null, { mode: 'plan' });
}

function loadSavedHuntPinsOnly(plan) {
  if (!plan) return;
  clearHunt();

  const criteria = plan.criteria || huntCriteria;
  huntCriteria = criteria;
  activeWindDir = plan.wind || activeWindDir;

  const bounds = plan.bounds
    ? L.latLngBounds([plan.bounds.south, plan.bounds.west], [plan.bounds.north, plan.bounds.east])
    : null;

  const savedHotspots = Array.isArray(plan.hotspots) ? plan.hotspots : [];
  const hotspots = savedHotspots
    .map((h, index) => {
      if (!h || !Array.isArray(h.coords) || h.coords.length < 2) return null;
      const latlng = L.latLng(h.coords[0], h.coords[1]);
      const habitat = h.habitat || 'transition';
      const eduSetRestore = getActiveEducationSet();
      const base = eduSetRestore[habitat] || eduSetRestore.transition || eduSetRestore.travelCorridor;
      const education = buildCustomHotspotEducation({
        habitat,
        base,
        latlng,
        bounds,
        windDir: plan.wind || null,
        criteria
      });
      return {
        coords: [latlng.lat, latlng.lng],
        tier: h.tier,
        habitat,
        rank: h.rank ?? (index + 1),
        education
      };
    })
    .filter(Boolean);

  hotspots.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  hotspots.forEach((hotspot, index) => {
    if (!hotspot.rank) hotspot.rank = index + 1;
    const marker = createBrandedHotspotMarker(hotspot);
    hotspotMarkers.push(marker);
  });

  buildRoutePinOptions(hotspots);
  coreAreaEnabled = criteria.depth === 'deep' || criteria.depth === 'medium';
  if (plan.coreZones && plan.coreZones.length) {
    buildScoutingLayerFromZones(plan.coreZones);
  } else {
    clearScoutingLayer();
  }

  if (Array.isArray(plan.areaFeatures) && plan.areaFeatures.length) {
    const features = plan.areaFeatures
      .map((f) => {
        if (!f || !Array.isArray(f.coords) || f.coords.length < 2) return null;
        return { ...f, latlng: L.latLng(f.coords[0], f.coords[1]) };
      })
      .filter(Boolean);
    setThermalSeedsFromFeatures(features, { includeCoreZones: true, merge: false });
  }

  addThermalAnchorsFromHotspots(hotspots);
  lastPlanSnapshot = { ...plan };
}

window.savedHuntGo = function() {
  if (!savedHuntPreview) return;
  hideSavedHuntBar();
  if (savedHuntPreview.kind === 'plan') {
    const plan = savedHuntPlans.find((entry) => entry.id === savedHuntPreview.id);
    loadSavedHuntPinsOnly(plan);
    window.closeStrategyPanel();
    openPlanRouteTray();
    // showNotice('Pins loaded. Build a new route.', 'success', 3200);
    return;
  }
  if (selectedAreaLayer || currentPolygon) {
    window.lockInArea();
    return;
  }
  showNotice(isMushroomModule() ? 'Define a forage area first.' : 'Define a hunt area first.', 'warning', 3200);
};

window.savedHuntBuildNew = function() {
  if (!savedHuntPreview) return;
  hideSavedHuntBar();
  if (selectedAreaLayer || currentPolygon) {
    window.lockInArea();
    return;
  }
  showNotice(isMushroomModule() ? 'Define a forage area first.' : 'Define a hunt area first.', 'warning', 3200);
};

window.savedHuntCancel = function() {
  hideSavedHuntBar();
  savedHuntPreview = null;
  resetActiveHuntState();
  clearSelectedArea();
  const select = document.getElementById('savedPropertySelect');
  if (select) select.value = '';
  setFieldCommandStep(1);
  openFieldCommandTray();
  showNotice(isMushroomModule() ? 'Saved forage area cleared. Start a new area.' : 'Saved hunt cleared. Start a new area.', 'info', 3200);
};

function removeSavedHuntPlan(id) {
  savedHuntPlans = savedHuntPlans.filter((entry) => entry.id !== id);
  saveHuntPlans();
  renderSavedPropertiesSelect();
  renderSavedPlansList();
}

window.logJournalEntry = function() {
  openInputModal({
    title: isMushroomModule() ? 'Forage Journal Entry' : 'Hunt Journal Entry',
    message: isMushroomModule() ? 'Log a scouting note or forage journal entry.' : 'Log a scouting note or hunt journal entry.',
    placeholder: isMushroomModule() ? 'Example: Found morels near dead elm on north-facing slope.' : 'Example: Bedding area with heavy trails on north slope.',
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
    <h3>${isMushroomModule() ? 'Forage Journal' : 'Hunt Journal'}</h3>
    <div style="display:grid;gap:8px;margin-bottom:10px;">
      <label style="font-size:12px;color:#bbb;">Type</label>
      <select id="journalType" class="ht-select">
        <option value="all" selected>All Entries</option>
        <option value="waypoint">Waypoints</option>
        <option value="deer_pin">${isMushroomModule() ? 'Forage Pins' : 'Deer Pins'}</option>
        <option value="turkey_pin">Turkey Pins</option>
        <option value="shed_find">${isMushroomModule() ? 'Mushroom Finds' : 'Shed Finds'}</option>
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
        : entry.type === 'deer_pin'
          ? ` • ${entry.signType || 'sign'} • ${entry.confidence || 'medium'} confidence`
          : entry.type === 'turkey_pin'
            ? ` • ${entry.signType || 'pin'} • ${entry.confidence || 'medium'} confidence`
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

/* ═══ AUTO-ACTIVATE MAP ON DEFINE AREA ═══
   Dismisses the hero splash, centres on user GPS at ~100 ft zoom,
   then resolves so the caller can start its drawing tool. */
function activateMapForDefineArea() {
  return new Promise((resolve) => {
    // Suppress auto-area so the user can draw their own
    _suppressDefaultArea = true;
    // If there's already a selected area, clear it so user starts fresh
    if (selectedAreaLayer) {
      try { clearSelectedArea(); } catch (e) { /* ignore */ }
    }
    // 1. Activate map (dismiss hero) for mushroom / turkey / shed modules
    if (!document.body.classList.contains('ht-map-active')) {
      if (isMushroomModule()) { activateMushroomMap(); }
      else if (isTurkeyModule()) { activateTurkeyMap(); }
      else { activateShedMap(); }
    }
    // 2. Centre on user at zoom 12 (~1 mile view)
    const ZOOM_1000FT = 12;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          updateUserLocationMarker(latlng);
          map.setView(latlng, ZOOM_1000FT, { animate: true });
          setTimeout(resolve, 400);
        },
        () => { resolve(); },
        getPreciseGeolocationOptions({ timeout: 8000 })
      );
    } else {
      setTimeout(resolve, 400);
    }
  });
}

window.selectLocationRadius = function() {
  clearRadiusDraft();
  mapClickMode = 'radius-draw';
  collapseFieldCommandTray();
  showDrawHelper('radius', 'Tap the center, drag the side bubbles to size, then tap again to lock.');
};

window.selectLocationRectangle = function() {
  clearRectDraft();
  mapClickMode = 'rect-draw';
  collapseFieldCommandTray();
  showDrawHelper('rect', 'Tap the center, drag the side bubbles to size, then tap again to lock.');
};

window.selectParcelBoundary = function() {
  mapClickMode = 'parcel';
  showQuickHint('Touch the parcel to lock the boundary.', 1400);
};

window.drawHuntArea = function() {
  mapClickMode = null;
  const drawer = new L.Draw.Polygon(map, drawControl.options.draw.polygon);
  drawer.enable();
  activeDrawHandler = drawer;
  collapseFieldCommandTray();
  showQuickHint('Tap points around the area.', 1600);
  showDrawHelper('polygon', 'Tap points to outline the area. Tap the first point again to finish.');
};

window.lockPropertyBoundary = function() {
  mapClickMode = null;
  const drawer = new L.Draw.Rectangle(map, drawControl.options.draw.rectangle);
  drawer.enable();
  activeDrawHandler = drawer;
  showQuickHint('Touch a point on the map to start the box.', 1400);
  showDrawHelper('polygon', 'Tap a corner, drag to size, then tap to finish.');
};

window.selectStartPoint = function() {
  showSelectionNoticeOnce('Select a starting point from the route panel.', 'info', 4200);
};

window.selectEndPoint = function() {
  showSelectionNoticeOnce('End point is set to the furthest pin from your start.', 'info', 4200);
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
    showNotice('Drag the side bubbles to size your radius, then tap to lock it.', 'info', 5200);
  }, null, getPreciseGeolocationOptions({ timeout: 12000 }));
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
  const enabled = typeof force === 'boolean' ? force : !privateParcelsEnabled;
  setPrivateParcelsEnabled(enabled);
  updateMapToggleButtons();
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
    ridge_point: 'R',
    saddle: 'S',
    low_spot: 'S',
    bench: 'B',
    pinch: 'P',
    leeward_pocket: 'L',
    thermal_drain: 'T',
    creek_line: 'C',
    water_edge: 'W',
    micro_pinch: 'p',
    micro_exit: 'E',
    cut_through: 'X',
    micro_nob: 'N',
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

function ensureMicroFeatureLayer() {
  if (!map) return null;
  if (!microFeatureLayer) microFeatureLayer = L.layerGroup().addTo(map);
  return microFeatureLayer;
}

function clearMicroFeatures() {
  try {
    if (microFeatureLayer) microFeatureLayer.clearLayers();
  } catch {}
  microFeatureMarkers = [];
  microFeaturesActive = [];
}

function getMicroFeatureHint() {
  return 'Micro pins drop inside the search shape: micro pinch, rut funnel, saddle crossing, bench exit, ridge exit, drainage exit, creek crossing.';
}

function getMicroPinIcon(feature) {
  // Mushroom module: use mushroom-themed micro pins
  if (isMushroomModule()) {
    return getMushroomMicroPinIcon(feature);
  }
  const safeType = String(feature?.type || 'micro').toLowerCase();
  const cssType = safeType.replace(/_/g, '-');
  const label = String(feature?.icon || feature?.label || 'M').slice(0, 2).toUpperCase();
  return L.divIcon({
    html: `<div class="ht-terrain-pin ht-terrain-pin--micro ht-terrain-pin-${cssType}">${label}</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

function buildMicroHotspot(feature, parentHotspot) {
  const coords = feature?.latlng ? [feature.latlng.lat, feature.latlng.lng] : null;
  return {
    id: feature?.id || `micro_${Date.now()}`,
    coords,
    rank: '',
    priority: 3,
    isMicroFeature: true,
    parentHotspot,
    education: {
      title: feature?.label || 'Micro Feature',
      description: feature?.detail || 'Micro terrain feature worth a close sweep.',
      tips: feature?.tips || '',
      lookFor: feature?.lookFor || '',
      why: feature?.why || [],
      approach: feature?.approach || [],
      treeFocus: feature?.treeFocus || [],
      treeNotes: feature?.treeNotes || '',
      treeId: feature?.treeId || null
    }
  };
}

function getRandomPointInArea(areaLayer, areaType, bounds, existing) {
  if (!bounds) return null;
  const attempts = 40;
  const minSpacing = 45;
  for (let i = 0; i < attempts; i++) {
    let point = null;
    if (areaType === 'radius' && areaLayer?.getLatLng && areaLayer?.getRadius) {
      const center = areaLayer.getLatLng();
      const radius = areaLayer.getRadius();
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius * 0.85;
      point = offsetLatLngMeters(center, Math.cos(angle) * dist, Math.sin(angle) * dist);
    } else {
      const south = bounds.getSouth();
      const north = bounds.getNorth();
      const west = bounds.getWest();
      const east = bounds.getEast();
      const lat = south + Math.random() * (north - south);
      const lng = west + Math.random() * (east - west);
      point = L.latLng(lat, lng);
    }

    if (!point) continue;
    if (areaLayer && areaType && !isPointInAreaLayer(point, areaLayer, areaType)) continue;
    if (Array.isArray(existing) && existing.some((f) => f?.latlng && point.distanceTo(f.latlng) < minSpacing)) continue;
    return point;
  }
  return null;
}

async function dropMicroFeaturesForActiveSearchArea() {
  if (!activeSearchArea?.layer || !map) return;
  clearMicroFeatures();

  const layer = ensureMicroFeatureLayer();
  const areaLayer = activeSearchArea.layer;
  const areaType = activeSearchArea.areaType || 'polygon';
  const bounds = areaLayer.getBounds ? areaLayer.getBounds() : activeSearchArea.bounds;
  if (!layer || !bounds) return;

  const placed = [];
  const templates = getMicroFeatureTemplates();
  for (let idx = 0; idx < templates.length; idx++) {
    const template = templates[idx];
    // Try multiple random points — NLCD may reject some
    let point = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = getRandomPointInArea(areaLayer, areaType, bounds, placed);
      if (!candidate) break;
      // ═══ NLCD LAND COVER GUARDRAIL — micro pins verified too ═══
      if (NLCD_ENABLED) {
        const lcCheck = await validatePinLandCover(candidate, 'terrain');
        if (!lcCheck.valid) {
          console.log(`[NLCD REJECT] micro pin ${template.type}: ${lcCheck.reason}`);
          continue;
        }
      }
      point = candidate;
      break;
    }
    if (!point) continue;
    const feature = {
      ...template,
      id: `${template.type}_${Date.now()}_${idx}`,
      latlng: point
    };
    const icon = getMicroPinIcon(feature);
    const marker = L.marker(point, { icon }).addTo(layer);
    feature.marker = marker;
    marker.on('click', () => {
      const hotspot = buildMicroHotspot(feature, activeSearchArea?.hotspot || null);
      showEducationTile(hotspot, 'Micro feature pin');
    });
    placed.push(feature);
    microFeatureMarkers.push(marker);
  }

  microFeaturesActive = placed;
  if (placed.length) {
    showNotice('Micro pins deployed inside the search area.', 'info', 3600);
  }
}


// ===================================================================
//   Route Geometry & Elevation
// ===================================================================
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

function ensureRouteCurvature(points) {
  if (!Array.isArray(points) || points.length < 2) return Array.isArray(points) ? points.slice() : [];
  if (points.length >= 3) return points.map((p) => L.latLng(p));

  const a = L.latLng(points[0]);
  const b = L.latLng(points[1]);
  const distance = a.distanceTo(b);
  if (!Number.isFinite(distance) || distance < 30) return [a, b];

  const mid = L.latLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2);
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const mag = Math.hypot(dx, dy) || 1;
  const nx = -dy / mag;
  const ny = dx / mag;
  const offset = Math.max(35, Math.min(180, distance * 0.12));
  const curved = offsetLatLngMeters(mid, nx * offset, ny * offset);
  return [a, curved, b];
}

function addMicroMeander(points, strengthMeters = 18) {
  if (!Array.isArray(points) || points.length < 2) return Array.isArray(points) ? points.slice() : [];
  const out = [L.latLng(points[0])];
  let flip = 1;

  for (let i = 0; i < points.length - 1; i++) {
    const a = L.latLng(points[i]);
    const b = L.latLng(points[i + 1]);
    const dist = a.distanceTo(b);
    if (!Number.isFinite(dist) || dist < 80) {
      out.push(b);
      continue;
    }

    const steps = dist > 320 ? 2 : 1;
    const vec = vecFromTo(a, b);
    const nx = -vec[1];
    const ny = vec[0];
    const amp = Math.max(10, Math.min(42, strengthMeters + dist * 0.05));

    for (let s = 1; s <= steps; s++) {
      const t = s / (steps + 1);
      const lat = a.lat + (b.lat - a.lat) * t;
      const lng = a.lng + (b.lng - a.lng) * t;
      const mid = L.latLng(lat, lng);
      const sign = flip * (s % 2 === 0 ? -1 : 1);
      const wobble = offsetLatLngMeters(mid, nx * amp * sign, ny * amp * sign);
      out.push(wobble);
    }

    out.push(b);
    flip *= -1;
  }

  return out;
}

function enforceRouteCurvature(points, strengthMeters = 24) {
  if (!Array.isArray(points) || points.length < 2) return Array.isArray(points) ? points.slice() : [];
  const base = ensureRouteCurvature(points);
  const meandered = addMicroMeander(base, strengthMeters);
  const dense = densifyLatLngs(meandered, 26);
  return smoothRouteLine(dense, 14);
}

function clampRouteEndpoints(points, startCoord, endCoord) {
  if (!Array.isArray(points) || points.length < 2) return Array.isArray(points) ? points.slice() : [];
  const startLL = normalizeLatLng(startCoord) || L.latLng(points[0]);
  const endLL = normalizeLatLng(endCoord) || L.latLng(points[points.length - 1]);
  const out = points.map((p) => L.latLng(p));
  out[0] = startLL;
  out[out.length - 1] = endLL;
  return out;
}

async function avoidWaterOnRoute(points) {
  if (!HOTSPOT_WATER_AVOID_ENABLED) return Array.isArray(points) ? points.slice() : [];
  const endpoint = String(window.ELEVATION_API_URL || '').trim();
  if (!endpoint) return Array.isArray(points) ? points.slice() : [];

  const base = Array.isArray(points) ? points.map((p) => L.latLng(p)) : [];
  if (base.length < 3) return base;

  const stride = Math.max(2, Math.floor(base.length / 24));
  const baseOffset = Math.max(45, HOTSPOT_WATER_SAMPLE_OFFSET_M * 1.6);
  const adjusted = base.slice();

  for (let i = 1; i < base.length - 1; i += stride) {
    const curr = base[i];
    let isWater = false;
    try {
      isWater = await isLikelyWaterCandidate(curr);
    } catch {}

    if (!isWater) continue;

    const prev = base[i - 1];
    const next = base[i + 1];
    const vec = vecFromTo(prev, next);
    const nx = -vec[1];
    const ny = vec[0];

    const offsets = [baseOffset, baseOffset * 1.7];
    let moved = null;

    for (const offset of offsets) {
      const left = offsetLatLngMeters(curr, nx * offset, ny * offset);
      const right = offsetLatLngMeters(curr, -nx * offset, -ny * offset);
      let leftWater = true;
      let rightWater = true;
      try { leftWater = await isLikelyWaterCandidate(left); } catch {}
      try { rightWater = await isLikelyWaterCandidate(right); } catch {}

      if (!leftWater && rightWater) {
        moved = left;
        break;
      }
      if (!rightWater && leftWater) {
        moved = right;
        break;
      }
      if (!leftWater && !rightWater) {
        moved = left;
        break;
      }
    }

    if (moved) adjusted[i] = moved;
  }

  return adjusted;
}

async function clampRouteToContours(points) {
  if (!CONTOUR_CLAMP_ENABLED) return Array.isArray(points) ? points.slice() : [];
  const endpoint = String(window.ELEVATION_API_URL || '').trim();
  if (!endpoint) return Array.isArray(points) ? points.slice() : [];

  const base = densifyLatLngs(points, 45);
  const sparse = downsampleLatLngs(base, 45, 52);
  if (sparse.length < 2) return Array.isArray(points) ? points.slice() : [];

  const intervalM = Math.max(1, CONTOUR_INTERVAL_FT) * 0.3048;
  const offsetMeters = 55;
  const maxOffset = 85;

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
  let shaped = ensureRouteCurvature(base);
  try {
    shaped = await clampRouteToContours(shaped);
  } catch {
    shaped = base;
  }
  try {
    shaped = await avoidWaterOnRoute(shaped);
  } catch {}
  shaped = addMicroMeander(shaped);
  const dense = densifyLatLngs(shaped, 36);
  return smoothRouteLine(dense, 16);
}

async function buildTerrainRouteCoords(coords) {
  let base = await buildDisplayRouteCoords(coords);
  try {
    base = await clampRouteToContours(base);
  } catch {}
  try {
    base = await avoidWaterOnRoute(base);
  } catch {}
  const dense = densifyLatLngs(base, 22);
  return smoothRouteLine(dense, 22);
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

async function fetchElevationsForPoints(latlngs, fallbackAttempt = false) {
  const primary = String(window.ELEVATION_API_URL || '').trim();
  const fallback = String(window.ELEVATION_API_FALLBACK_URL || '').trim();
  const endpoint = fallbackAttempt ? fallback : primary;
  if (!endpoint) throw new Error('ELEVATION_API_URL not configured');
  if (!Array.isArray(latlngs) || !latlngs.length) return [];

  const useProxy = window.HUNTECH_ELEVATION_USE_PROXY !== undefined
    ? Boolean(window.HUNTECH_ELEVATION_USE_PROXY)
    : FORCE_PROXY;

  const maxPoints = 180;
  const points = latlngs.slice(0, maxPoints);
  const chunkSize = 90;
  const elevations = [];

  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize);
    const locations = chunk.map((p) => `${p.lat},${p.lng}`).join('|');
    const baseUrl = `${endpoint}?locations=${encodeURIComponent(locations)}`;
    const url = useProxy ? `${REG_PROXY_PATH}${encodeURIComponent(baseUrl)}` : baseUrl;
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

async function fetchElevationsForPointsBatched(latlngs, fallbackAttempt = false) {
  const primary = String(window.ELEVATION_API_URL || '').trim();
  const fallback = String(window.ELEVATION_API_FALLBACK_URL || '').trim();
  const endpoint = fallbackAttempt ? fallback : primary;
  if (!endpoint) throw new Error('ELEVATION_API_URL not configured');
  if (!Array.isArray(latlngs) || !latlngs.length) return [];

  const useProxy = window.HUNTECH_ELEVATION_USE_PROXY !== undefined
    ? Boolean(window.HUNTECH_ELEVATION_USE_PROXY)
    : FORCE_PROXY;

  const maxPoints = 160;
  const chunkSize = 90;
  const elevations = [];

  for (let i = 0; i < latlngs.length; i += maxPoints) {
    const batch = latlngs.slice(i, i + maxPoints);
    for (let j = 0; j < batch.length; j += chunkSize) {
      const chunk = batch.slice(j, j + chunkSize);
      const locations = chunk.map((p) => `${p.lat},${p.lng}`).join('|');
      const baseUrl = `${endpoint}?locations=${encodeURIComponent(locations)}`;
      const url = useProxy ? `${REG_PROXY_PATH}${encodeURIComponent(baseUrl)}` : baseUrl;
      const res = await fetchWithTimeout(url, {}, 12000);
      if (!res.ok) throw new Error(`Elevation API HTTP ${res.status}`);
      const data = await res.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      if (!results.length) throw new Error('Elevation API returned no results');
      results.forEach((r) => {
        const elev = Number(r?.elevation);
        elevations.push(Number.isFinite(elev) ? elev : null);
      });
    }
  }

  return elevations.slice(0, latlngs.length);
}

function detectTerrainFeatures(samples, elevations) {
  const features = [];
  if (!Array.isArray(samples) || samples.length < 5) return features;
  if (!Array.isArray(elevations) || elevations.length !== samples.length) return features;

  const windVec = windDirToVector(activeWindDir);
  const downwindVec = windVec ? [-windVec[0], -windVec[1]] : null;

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

  const addFeature = (idx, type, label, detail, options = {}) => {
    let p = samples[idx];
    if (!p) return;
    if (options.downwindMeters && downwindVec) {
      p = offsetLatLngMeters(p, downwindVec[0] * options.downwindMeters, downwindVec[1] * options.downwindMeters);
    }
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

  // Micro nobs: subtle high points just off the main line.
  const microProm = 4;
  for (let i = 2; i < samples.length - 2; i++) {
    if (elev[i] == null) continue;
    const prev = elev[i - 2];
    const next = elev[i + 2];
    if (prev == null || next == null) continue;
    const isHigh = elev[i] > prev + minProm && elev[i] > next + minProm;
    const isMicro = elev[i] > prev + microProm && elev[i] > next + microProm;
    if (!isHigh && isMicro) {
      addFeature(i, 'micro_nob', isMushroomModule() ? 'Micro Rise' : 'Micro Nob', isMushroomModule() ? 'Subtle rise with drainage below. Check the shaded base for moisture pockets and host trees.' : 'Small rise just off the main line. Mature bucks favor these subtle vantage points on calm, downwind approach.', { downwindMeters: 18 });
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

  // Minor pinch points and exits: subtle squeezes and easy-outs along the line.
  const minorPinchMin = 0.07;
  const minorPinchMax = 0.16;
  for (let i = 2; i < slopes.length - 2; i++) {
    const leftSlope = slopes[i - 1];
    const rightSlope = slopes[i + 1];
    if (leftSlope == null || rightSlope == null) continue;
    const leftAbs = Math.abs(leftSlope);
    const rightAbs = Math.abs(rightSlope);
    if (leftAbs >= minorPinchMin && rightAbs >= minorPinchMin && leftAbs <= minorPinchMax && rightAbs <= minorPinchMax) {
      addFeature(i, 'micro_pinch', isMushroomModule() ? 'Tight Draw' : 'Micro Pinch', isMushroomModule() ? 'Subtle narrows where moisture and debris accumulate. Scan the leaf litter edges.' : 'Subtle pinch where terrain tightens. Check downwind for quiet mature buck movement.', { downwindMeters: 16 });
    }

    const prevAbs = Math.abs(slopes[i - 1]);
    const currAbs = Math.abs(slopes[i]);
    if (prevAbs >= steepSlope && currAbs <= 0.05) {
      addFeature(i, 'micro_exit', isMushroomModule() ? 'Slope Transition' : 'Quiet Exit', isMushroomModule() ? 'Transition from steep slope to flat ground. Soil settles here and holds moisture.' : 'Easy-out transition off a steeper face. Mature bucks use these low-pressure exits just downwind.', { downwindMeters: 14 });
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

  // Cut-through points: subtle connectors between lines of travel.
  for (let i = 2; i < samples.length - 2; i++) {
    const a = samples[i - 2];
    const b = samples[i];
    const c = samples[i + 2];
    if (!a || !b || !c) continue;
    const v1 = vecFromTo(a, b);
    const v2 = vecFromTo(b, c);
    const dot = Math.max(-1, Math.min(1, dot2(v1, v2)));
    const angle = Math.acos(dot);
    const slopeAbs = Math.abs(slopes[i] ?? 0);
    if (angle >= 0.65 && slopeAbs <= 0.06) {
      addFeature(i, 'cut_through', 'Cut-Through', isMushroomModule() ? 'Subtle connector between micro-drainages. Prime for hidden mushroom patches just off the main draw.' : 'Subtle connector between travel lines. Prime for mature buck sheds just off the main corridor.', { downwindMeters: 16 });
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
  return filtered;
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
  setThermalSeedsFromFeatures(features, { merge: true, minSpacing: 120 });

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


// ===================================================================
//   Route Building & OSRM
// ===================================================================
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
  if (routeLineFlow) map.removeLayer(routeLineFlow);

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

  routeLineFlow = L.polyline(routeCoords, {
    color: '#7cffc7',
    weight: 2,
    opacity: 0.8,
    dashArray: '2, 10',
    lineCap: 'round',
    lineJoin: 'round',
    className: 'ht-route-line ht-route-line--flow'
  }).addTo(map);
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

function getHotspotRouteLatLngsOrdered(startCoord, endCoord) {
  const base = hotspotMarkers
    .slice()
    .map((m) => m.getLatLng());
  return orderHotspotsByNearest(startCoord, base, endCoord);
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

function flattenRouteLatLngs(latlngs) {
  if (!Array.isArray(latlngs)) return [];
  if (latlngs.length === 0) return [];
  if (latlngs[0] && latlngs[0].lat !== undefined && latlngs[0].lng !== undefined) return latlngs.slice();
  return latlngs.flatMap((entry) => flattenRouteLatLngs(entry));
}

function snapLatLngToRoute(latlng, routeLatLngs) {
  if (!map || !latlng) return latlng;
  const points = flattenRouteLatLngs(routeLatLngs);
  if (points.length < 2) return latlng;
  const target = map.latLngToLayerPoint(latlng);
  let bestPoint = null;
  let bestDist = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const a = map.latLngToLayerPoint(points[i]);
    const b = map.latLngToLayerPoint(points[i + 1]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const denom = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((target.x - a.x) * dx + (target.y - a.y) * dy) / denom));
    const proj = L.point(a.x + dx * t, a.y + dy * t);
    const dist = proj.distanceTo(target);
    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = proj;
    }
  }
  return bestPoint ? map.layerPointToLatLng(bestPoint) : latlng;
}

function rebuildRoutePinOptionsFromMarkers() {
  const hotspots = hotspotMarkers.map((marker) => {
    const data = marker.__hotspotData || {};
    const ll = marker.getLatLng();
    return {
      ...data,
      coords: [ll.lat, ll.lng]
    };
  });
  buildRoutePinOptions(hotspots);
}

function clampPinsToRoute(routeLatLngs) {
  if (!map || !routeLatLngs) return;
  const snappedStart = startPoint ? snapLatLngToRoute(startPoint, routeLatLngs) : null;
  if (snappedStart) {
    startPoint = snappedStart;
    if (startPointMarker) startPointMarker.setLatLng(snappedStart);
    if (startMarker) startMarker.setLatLng(snappedStart);
  }
  const snappedEnd = endPoint ? snapLatLngToRoute(endPoint, routeLatLngs) : null;
  if (snappedEnd) {
    endPoint = snappedEnd;
    if (endPointMarker) endPointMarker.setLatLng(snappedEnd);
    if (endMarker) endMarker.setLatLng(snappedEnd);
  }

  hotspotMarkers.forEach((marker) => {
    const ll = marker.getLatLng();
    const snapped = snapLatLngToRoute(ll, routeLatLngs);
    if (snapped) {
      marker.setLatLng(snapped);
      if (marker.__hotspotData) {
        marker.__hotspotData.coords = [snapped.lat, snapped.lng];
      }
    }
  });
  rebuildRoutePinOptionsFromMarkers();
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
  const detourMult = Number.isFinite(ROUTE_DETOUR_MULT) ? ROUTE_DETOUR_MULT : 3.2;
  const detourAdd = Number.isFinite(ROUTE_DETOUR_ADD_MILES) ? ROUTE_DETOUR_ADD_MILES : 2.0;
  return walkedMiles > Math.max(idealMiles * detourMult, idealMiles + detourAdd);
}

function getRouteStyle() {
  const style = String(ROUTE_STYLE || '').toLowerCase();
  const router = String(window.WALK_ROUTER_URL || '').trim();
  if (ROUTE_AVOID_ROADS) {
    if (style === 'straight' || style === 'linear') return 'display';
    return 'terrain';
  }
  if (style === 'straight' || style === 'linear') return 'display';
  if (style === 'osrm' || style === 'trail') return router ? 'osrm' : 'terrain';
  if (style === 'terrain') return router ? 'osrm' : 'terrain';
  return router ? 'osrm' : 'terrain';
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
      <div style="font-size:12px;color:#bbb;">${isTurkeyModule() ? 'Top Turkey Setup Zones' : (isMushroomModule() ? 'Top Core Morel Zones' : 'Top Core Buck Zones')}</div>
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
  if (routeLineFlow) map.removeLayer(routeLineFlow);
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
  routeLineFlow = null;
  
  const rawHotspots = hotspotMarkers.map((m) => m.getLatLng());
  if (!rawHotspots.length) return;
  const coords = [];

  let startCoord = startPoint || rawHotspots[0];
  let endCoord = endPoint || rawHotspots[rawHotspots.length - 1];
  let hotspotCoords = orderHotspotsByNearest(startCoord, rawHotspots, endCoord);

  if (type === 'loop') {
    // Loop should be: start -> nearest hotspots -> stop -> back to start.
    coords.push(startCoord);
    coords.push(...hotspotCoords);
    coords.push(startCoord);
  } else {
    // Linear should be: start -> nearest hotspots -> stop.
    coords.push(startCoord);
    coords.push(...hotspotCoords);
  }

  const idealCoords = dedupeSequentialLatLngs(coords);
  const curvedIdeal = ensureRouteCurvature(idealCoords);
  const routeStyle = getRouteStyle();
  const routeBuilder = routeStyle === 'display' ? buildDisplayRouteCoords : buildTerrainRouteCoords;
  
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

    let displayCoords = curvedIdeal;
    try {
      if (walked && walked.length >= 2) {
        const curvedWalked = ensureRouteCurvature(walked);
        displayCoords = await routeBuilder(curvedWalked);
      } else {
        displayCoords = await routeBuilder(curvedIdeal);
      }
    } catch (err) {
      const msg = err && err.message ? err.message : 'Route builder failed.';
      showNotice(`Route builder failed; using a direct line. (${msg})`, 'warning', 5200);
      displayCoords = curvedIdeal.length >= 2 ? curvedIdeal : idealCoords;
    }
    displayCoords = clampRouteEndpoints(displayCoords, coords[0], coords[coords.length - 1]);
    displayCoords = enforceRouteCurvature(displayCoords, 24);
    displayCoords = clampRouteEndpoints(displayCoords, coords[0], coords[coords.length - 1]);
    drawRouteLine(displayCoords);

    try {
      const routeLatLngs = routeLine && routeLine.getLatLngs ? routeLine.getLatLngs() : displayCoords;
      clampPinsToRoute(routeLatLngs);
    } catch {}

    try {
      const routeLatLngs = routeLine && routeLine.getLatLngs ? routeLine.getLatLngs() : null;
      if (Array.isArray(routeLatLngs) && routeLatLngs.length >= 2) {
        await analyzeTerrainAlongRoute(routeLatLngs);
      }
    } catch {}

    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  })();
  
  // Start marker
  const startForMarker = startCoord;
  startMarker = L.marker(startForMarker, {
    icon: L.divIcon({
      html: '<div class="ht-route-pin ht-route-pin--start">START</div>',
      className: 'ht-route-pin-wrap',
      iconSize: [84, 32],
      iconAnchor: [42, 32]
    })
  }).addTo(map);
  
  // End marker
  if (type === 'linear') {
    endMarker = L.marker(endCoord, {
      icon: L.divIcon({
        html: '<div class="ht-route-pin ht-route-pin--end">END</div>',
        className: 'ht-route-pin-wrap',
        iconSize: [84, 32],
        iconAnchor: [42, 32]
      })
    }).addTo(map);
  }
  
  showNotice(`${type === 'loop' ? 'Loop' : 'Linear'} route created. Follow the highlighted path.`, 'success', 4200);
};

// Custom route selection
window.selectCustomRoute = function() {
  showNotice('Custom route mode is disabled. Choose a starting point instead.', 'info', 4200);
};

// Text-to-speech hunt plan
window.speakHuntPlan = function() {
  if (!hotspotMarkers.length) return;
  
  const hotspots = hotspotMarkers
    .map((marker) => marker.__hotspotData)
    .filter(Boolean)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

  // Build speech text
  let speechText = isMushroomModule()
    ? "Welcome to your Hun-tek AI mushroom foraging strategy. Here's your priority breakdown. "
    : "Welcome to your Hun-tek AI shed hunting strategy. Here's your priority breakdown. ";
  hotspots.forEach((hotspot) => {
    const rank = hotspot?.rank ?? hotspot?.priority ?? 1;
    speechText += `Priority ${rank}: ${hotspot.education.title}. ${hotspot.education.description} Field tip: ${hotspot.education.tips}. `;
  });
  
  speechText += isMushroomModule()
    ? "Good luck and happy foraging!"
    : "Good luck and happy shed hunting!";
  
  speakText(speechText);
  showNotice('Playing audio briefing. Tap Stop Audio to end.', 'info', 4200);
};

window.toggleMissionBriefAudio = function() {
  if (speechActive && !isSpeechPlaybackActive()) {
    speechActive = false;
  }
  if (speechActive) {
    window.stopSpeech();
  } else {
    window.speakHuntPlan();
  }
  updateMissionBriefAudioButton();
};

// Clear hunt data
function clearHunt() {
  hotspotMarkers.forEach(m => map.removeLayer(m));
  hotspotMarkers = [];
  clearScoutingLayer();
  if (routeLineGlow) map.removeLayer(routeLineGlow);
  if (routeLine) map.removeLayer(routeLine);
  if (routeLineFlow) map.removeLayer(routeLineFlow);
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);
  if (startDotMarker) map.removeLayer(startDotMarker);
  if (endDotMarker) map.removeLayer(endDotMarker);
  clearTerrainFeatures();
  routeLineGlow = null;
  routeLine = null;
  routeLineFlow = null;
  coreAreaEnabled = false;
  startMarker = null;
  endMarker = null;
  startDotMarker = null;
  endDotMarker = null;
  hotspotVisited.clear();
  stopLocationWatch();
  closeEducationTile();
  closeAdvancedToolsTray();
}

window.clearRouteOnly = function() {
  if (routeLineGlow) map.removeLayer(routeLineGlow);
  if (routeLine) map.removeLayer(routeLine);
  if (routeLineFlow) map.removeLayer(routeLineFlow);
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);
  if (startDotMarker) map.removeLayer(startDotMarker);
  if (endDotMarker) map.removeLayer(endDotMarker);

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
  routeLineFlow = null;
  startMarker = null;
  endMarker = null;
  startDotMarker = null;
  endDotMarker = null;
  startPoint = null;
  endPoint = null;
  clearTerrainFeatures();

  const startSelect = document.getElementById('routeStartSelect');
  const endSelect = document.getElementById('routeEndSelect');
  if (startSelect) startSelect.value = '';
  if (endSelect) endSelect.value = '';
  updateRoutePinStatus();

  showNotice('Route cleared. Pins kept.', 'success', 3200);
  closeAdvancedToolsTray();
};

window.buildRoutePreview = function() {
  if (hotspotMarkers.length === 0 && !isFlyModule()) {
    showNotice(isMushroomModule() ? 'No pins yet. Build a forage plan first.' : 'No pins yet. Build a hunt plan first.', 'warning', 3600);
    return;
  }

  if (!startPoint) {
    showNotice(isFlyModule()
      ? 'Select parking and entry points before building the route.'
      : 'Select a starting point on the map before building the route.', 'warning', 5200);
    return;
  }
  if (!isFlyModule() && !endPoint) {
    // End at furthest pin from start — mature buck point-to-point pattern
    if (hotspotMarkers.length > 1 && startPoint) {
      const furthest = hotspotMarkers.reduce((far, m) => {
        const d = startPoint.distanceTo(m.getLatLng());
        return d > far.dist ? { dist: d, ll: m.getLatLng() } : far;
      }, { dist: 0, ll: startPoint });
      setEndPoint(furthest.ll);
    } else {
      setEndPoint(startPoint);
    }
  }
  if (isFlyModule() && !endPoint) {
    showNotice('Select parking and entry points before building the route.', 'warning', 5200);
    return;
  }

  if (isFlyModule() && hotspotMarkers.length === 0) {
    const accessRoute = enforceRouteCurvature([startPoint, endPoint], 24);
    drawRouteLine(accessRoute);
    showNotice('Access route built. Tap LET\'S FISH to continue.', 'success', 4200);
    showAdvancedToolsTray();
    return;
  }

  if (isFlyModule()) {
    createOptimalRoute('linear');
  } else {
    // Default: linear route ending at the last pin — mirrors mature buck
    // travel patterns (bucks travel point-to-point, they don't loop).
    createOptimalRoute('linear');
  }

  showNotice(isMushroomModule() ? 'Route built. Tap LET\'S GO to start foraging.' : 'Route built. Tap LET\'S GO to launch the hunt.', 'success', 4200);
  showAdvancedToolsTray();
};

window.finalizeRoutePlan = function() {
  if (hotspotMarkers.length === 0 && !isFlyModule()) {
    showNotice(isMushroomModule() ? 'No pins yet. Build a forage plan first.' : 'No pins yet. Build a hunt plan first.', 'warning', 3600);
    return;
  }

  if (!startPoint) {
    showNotice(isFlyModule()
      ? 'Select parking and entry points before launching.'
      : 'Select a starting point on the map before launching.', 'warning', 5200);
    return;
  }
  if (!isFlyModule() && !endPoint) {
    // End at furthest pin from start — mature buck point-to-point pattern
    if (hotspotMarkers.length > 1 && startPoint) {
      const furthest = hotspotMarkers.reduce((far, m) => {
        const d = startPoint.distanceTo(m.getLatLng());
        return d > far.dist ? { dist: d, ll: m.getLatLng() } : far;
      }, { dist: 0, ll: startPoint });
      setEndPoint(furthest.ll);
    } else {
      setEndPoint(startPoint);
    }
  }
  if (isFlyModule() && !endPoint) {
    showNotice('Select parking and entry points before launching.', 'warning', 5200);
    return;
  }

  if (!routeLine) {
    window.buildRoutePreview();
  }

  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
  }
  if (startPointMarker) {
    map.removeLayer(startPointMarker);
    startPointMarker = null;
  }
  if (endPointMarker) {
    map.removeLayer(endPointMarker);
    endPointMarker = null;
  }
  if (startDotMarker) {
    map.removeLayer(startDotMarker);
    startDotMarker = null;
  }
  if (endDotMarker) {
    map.removeLayer(endDotMarker);
    endDotMarker = null;
  }
  if (startPoint) {
    startDotMarker = L.circleMarker(startPoint, {
      radius: 3,
      color: '#7cffc7',
      weight: 2,
      fillColor: '#00ff88',
      fillOpacity: 0.95
    }).addTo(map);
  }
  if (endPoint) {
    endDotMarker = L.circleMarker(endPoint, {
      radius: 3,
      color: '#7cffc7',
      weight: 2,
      fillColor: '#00ff88',
      fillOpacity: 0.95
    }).addTo(map);
  }

  startLocationWatch();
  showNotice(isMushroomModule() ? 'Forage live. Alerts enabled for hotspots + terrain features.' : 'Hunt live. Alerts enabled for hotspots + terrain features.', 'success', 5200);

  const panel = document.getElementById('strategy-panel');
  if (panel) panel.remove();
  setStrategyOpen(false);
  updateTrayToggleButton();

  if (!isFlyModule()) {
    const planHotspots = hotspotMarkers.map((marker) => marker.__hotspotData).filter(Boolean);
    const planTemp = lastPlanSnapshot?.temperature ?? null;
    const planWindSpeed = lastPlanSnapshot?.windSpeed ?? null;
    const planWindDir = lastPlanSnapshot?.wind ?? activeWindDir ?? null;
    showStrategyPanel(planHotspots, planTemp, planWindSpeed, planWindDir, {
      mode: 'brief',
      showMissionBrief: true,
      showRouteControls: false
    });
  }

  dockAdvancedToolsTray();
  collapseFieldCommandTray();
};

window.letsGoFollowRoute = function() {
  window.finalizeRoutePlan();
};


// === Fly-fishing module extracted to ht-fly-fishing.js ===


// Close strategy panel
window.closeStrategyPanel = function() {
  const panel = document.getElementById('strategy-panel');
  if (panel) panel.remove();
  stopPlanLoadingTicker();
  setStrategyOpen(false);
  updateTrayToggleButton();
  openFieldCommandTray();
  dockAdvancedToolsTray();
};

// Fix Clear button
window.clearAllDrawings = function() {
  mapClickMode = null;
  radiusMilesPending = null;
  clearRadiusDraft();
  clearRectDraft();
  clearPolygonGuide();
  if (activeDrawHandler && typeof activeDrawHandler.disable === 'function') {
    activeDrawHandler.disable();
  }
  activeDrawHandler = null;
  hideDrawHelper();

  if (drawnItems) {
    drawnItems.clearLayers();
  }

  const instructionDiv = document.getElementById('drawing-instructions');
  if (instructionDiv) instructionDiv.remove();

  // Remove all drawn layers
  map.eachLayer(layer => {
    if (layer === userLocationMarker) return;
    if (layer instanceof L.Marker) {
      const className = layer?.options?.icon?.options?.className || '';
      if (className.includes('ht-drag-handle') || className.includes('leaflet-editing-icon')) {
        map.removeLayer(layer);
      }
      return;
    }
    if (layer instanceof L.Polygon
      || layer instanceof L.Rectangle
      || layer instanceof L.Polyline
      || layer instanceof L.Circle
      || layer instanceof L.CircleMarker) {
      map.removeLayer(layer);
    }
  });
  
  // Clear hunt data
  clearHunt();
  closeStrategyPanel();
  clearSelectedArea();
  pendingFieldCommandAdvance = false;
  fieldCommandFlowActive = false;
  startPoint = null;
  endPoint = null;
  if (startPointMarker) map.removeLayer(startPointMarker);
  if (endPointMarker) map.removeLayer(endPointMarker);
  startPointMarker = null;
  endPointMarker = null;
  document.body.classList.remove('ht-hunt-active');
  
  showNotice(isMushroomModule() ? 'All drawings and forage data cleared.' : 'All drawings and hunt data cleared.', 'success', 4200);
};


/* ═══ FISH NOW — showStreamPanel (TOP-LEVEL, always available) ═══ */
window.showStreamPanel = function showStreamPanel(panelId) {
  console.log('HUNTECH: showStreamPanel called with', panelId);
  try {
    // Auto-expand toolbar so user sees the panel content
    var toolbar = document.getElementById('toolbar');
    if (toolbar && toolbar.classList.contains('collapsed')) {
      if (typeof window.toggleToolbar === 'function') {
        window.toggleToolbar();
      } else {
        toolbar.classList.remove('collapsed');
        document.body.classList.remove('ht-toolbar-collapsed');
      }
    }

    // Show/hide panels
    var panelIds = ['fishNowPanel', 'mySpotsPanel', 'tripPlannerPanel', 'flyBoxPanel'];
    panelIds.forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.display = id === panelId ? '' : 'none';
    });
    document.querySelectorAll('.ht-stream-pill').forEach(function(pill) {
      pill.classList.toggle('ht-stream-pill--active', pill.getAttribute('data-panel') === panelId);
    });

    // Activate map + fade hero
    if (!document.body.classList.contains('ht-map-active')) {
      console.log('HUNTECH: Activating fly map...');
      activateFlyMap();
    }

    // If Fish Now → start the multi-step workflow, unless a quick-jump asked us to skip once
    if (panelId === 'fishNowPanel' && isFlyModule()) {
      const shouldSkipInit = window._fishNowSkipInitOnce === true;
      if (shouldSkipInit) {
        window._fishNowSkipInitOnce = false;
      } else {
        console.log('HUNTECH: Starting fishNowInit...');
        if (typeof window._fishNowInitFn === 'function') {
          window._fishNowInitFn();
        } else {
          console.warn('HUNTECH: fishNowInit not ready yet');
          // showNotice('Loading Fish Now… try again in a moment.', 'info', 2000);
        }
      }
    } else if (panelId !== 'fishNowPanel') {
      centerOnMyLocationInternal();
    }
  } catch(e) {
    console.error('HUNTECH: showStreamPanel error:', e);
    showNotice('Error: ' + e.message, 'error', 5000);
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const updateTopbarHeight = () => {
    const topbar = document.querySelector('.ht-topbar');
    if (!topbar) return;
    const nextHeight = Math.max(60, Math.round(topbar.offsetHeight));
    document.documentElement.style.setProperty('--topbar-height', `${nextHeight}px`);
  };
  updateTopbarHeight();
  window.addEventListener('resize', updateTopbarHeight);
  window.addEventListener('orientationchange', updateTopbarHeight);
  window.addEventListener('resize', updateLocateMeOffset);
  window.addEventListener('orientationchange', updateLocateMeOffset);

  setupPillFastTap();

  bindToolbarToggleButtons();

  const isFly = isFlyModule();
  const isMush = isMushroomModule();
  const isTurk = isTurkeyModule();
  const isShed = isShedModule();
  /* Mushroom: no hero splash — go straight to map */
  if (isMush) {
    mushroomMapPending = false;
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    initializeMap();
    restoreLastKnownLocation();
    updateFilterChips();
    updateWorkflowUI();
    updateLocateMeOffset();
    setTimeout(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    }, 320);
    setTimeout(() => centerOnMyLocationInternal(), 500);
  } else if (isFly) {
    /* Fly-fishing: skip hero, load map immediately, center on user GPS */
    flyMapPending = false;
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    document.body.classList.add('ht-hero-dismissed');
    initializeMap();
    updateFilterChips();
    updateWorkflowUI();
    updateLocateMeOffset();
    // Fast invalidateSize — just need one rAF for layout to settle
    requestAnimationFrame(() => {
      if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
    });
    // Center on user's GPS location on launch (tray stays closed)
    requestAnimationFrame(() => {
      setTimeout(() => {
        centerOnMyLocationInternal();
      }, 50);
    });
  } else if (isTurk) {
    turkeyMapPending = true;
    document.body.classList.add('ht-map-pending');
    document.body.classList.remove('ht-map-active');
    // Start hero slideshow — rotate images every 6s
    (function initHeroSlideshow() {
      const slides = document.querySelectorAll('.ht-hero-slide');
      if (slides.length < 2) return;
      let current = 0;
      setInterval(() => {
        // Don't rotate if hero is already faded out
        if (document.body.classList.contains('ht-map-active')) return;
        slides[current].classList.remove('ht-hero-slide--active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('ht-hero-slide--active');
      }, 6000);
    })();
  } else {
    /* Shed module: map initialises immediately, no hero overlay */
    document.body.classList.remove('ht-map-pending');
    document.body.classList.add('ht-map-active');
    document.body.classList.add('ht-hero-dismissed');
    initializeMap();
  }

  startLocationWatch();
  updateWeather();
  initializeSearch();

  // Pre-warm TTS voice list — Chrome loads voices async, this ensures
  // the best neural/online voice is cached before user taps "Read to Me"
  if ('speechSynthesis' in window) {
    const warmVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v && v.length) pickPreferredSpeechVoice(v);
    };
    warmVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = warmVoices;
    }
  }

  loadRegulationsIndex();
  loadShedCache();
  loadSavedHuntAreas();
  loadHuntJournal();
  loadHuntPlans();
  if (isFly) {
    loadFlyInventory();
    loadFlySessions();
    renderPinnedFlyWaters();
    loadFlyTroutIntel().then(refreshFlyTroutIntelList);
  }
  updateFilterChips();
  updateWorkflowUI();
  updateSaveAreaState(false);
  // Popups removed — no onboarding or quickstart callouts on load
  // showQuickStartCallout();
  // startOnboarding();
  if (!isFly && !isMush) {
    restoreLastKnownLocation();
    tryAutoCenterWithoutPrompt();
    setDefaultAreaFromLocation();
  }

  const savedPropertySelect = document.getElementById('savedPropertySelect');
  if (savedPropertySelect) {
    if (isFlyModule()) {
      renderFlyWaterSelect('');
      const handleFlyWaterSelect = () => {
        const id = savedPropertySelect.value || '';
        if (!id) return;
        const water = getFlyWaterById(id);
        if (water) focusFlyWater(water);
      };
      savedPropertySelect.addEventListener('change', handleFlyWaterSelect);
      savedPropertySelect.addEventListener('input', handleFlyWaterSelect);

      const searchInput = document.getElementById('flyWaterSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          renderFlyWaterSelect(searchInput.value);
        });
      }
      renderPinnedFlyWaters();
    } else {
      const handleSavedAreaSelect = () => {
        const choice = parseSavedSelectValue(savedPropertySelect.value);
        if (!choice) return;
        handleSavedSelection(choice, savedPropertySelect);
      };
      savedPropertySelect.addEventListener('change', handleSavedAreaSelect);
      savedPropertySelect.addEventListener('input', handleSavedAreaSelect);
    }
  }

  // Always start Field Command collapsed — except in the fly module.
  try {
    const toolbar = document.getElementById('toolbar');
    const icons = document.querySelectorAll('.ht-toggle-icon');
    if (toolbar) {
      toolbarOpen = false;
      toolbar.classList.add('collapsed');
      document.body.classList.add('ht-toolbar-collapsed');
      icons.forEach((icon) => {
        icon.textContent = '>';
      });
      localStorage.setItem('htToolbarCollapsed', '1');
    }
  } catch {
    // Ignore storage failures
  }

  // Fly module: start with tray CLOSED — user taps Fish Now to open
  // Fly module: start with tray CLOSED by default
  if (isFly) {
    try {
      const toolbar = document.getElementById('toolbar');
      if (toolbar) {
        toolbarOpen = false;
        toolbar.classList.add('collapsed');
        document.body.classList.add('ht-toolbar-collapsed');
        const icons = document.querySelectorAll('.ht-toggle-icon');
        icons.forEach(function(icon) { icon.textContent = '>'; });
        localStorage.setItem('htToolbarCollapsed', '1');
      }
    } catch {}
  }

  updateTrayMiniLabels();

  updateTrayToggleButton();

  updateLocateMeOffset();

  try {
    const toolbar = document.getElementById('toolbar');
    if (toolbar && 'ResizeObserver' in window) {
      const observer = new ResizeObserver(() => updateLocateMeOffset());
      observer.observe(toolbar);
    }
  } catch {
    // Ignore observer failures.
  }

  setMobileCompactMode(window.matchMedia('(max-width: 520px)').matches);

  try {
    const advancedOpen = localStorage.getItem('htAdvancedControlsOpen') === '1';
    setAdvancedControlsOpen(advancedOpen);
  } catch {
    // Ignore storage failures
  }

  // Update weather every 2 minutes
  setInterval(updateWeather, 120000);

  // NOTE: showStreamPanel is defined later in the Fish Now workflow engine section

  window.fishNowCheckIn = function fishNowCheckIn() {
    const waterSelect = document.getElementById('flyWaterSelect');
    const waterName = waterSelect ? waterSelect.options[waterSelect.selectedIndex]?.text : '';
    if (!waterSelect || !waterSelect.value) {
      showNotice('Select a water first — pick from the dropdown above.', 'error', 3500);
      return;
    }
    // Show live session, hide strategy
    const strategy = document.getElementById('fishNowStrategy');
    const live = document.getElementById('fishNowLive');
    if (strategy) strategy.style.display = 'none';
    if (live) live.style.display = '';
    // Set live water name
    const liveNameEl = document.getElementById('liveWaterName');
    if (liveNameEl) liveNameEl.textContent = waterName;
    // Start session timer
    let seconds = 0;
    const timerEl = document.getElementById('liveTimer');
    if (window._fishSessionTimer) clearInterval(window._fishSessionTimer);
    window._fishSessionTimer = setInterval(() => {
      seconds++;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      if (timerEl) timerEl.textContent = m + ':' + String(s).padStart(2, '0');
    }, 1000);
    showNotice('🐟 Session started — tight lines!', 'success', 3000);
  };

  // ════════════════════════════════════════════════════════════
  // ═══ FISH NOW — COMPLETE MULTI-STEP WORKFLOW ENGINE ═══════
  // ════════════════════════════════════════════════════════════

  /* ── State ── */
  const fishFlow = {
    step: 0,           // 0=idle, 1=area-action, 2=strategy, 3=route, 4=briefing, 5=live
    area: null,        // matched TROUT_WATERS entry
    method: 'fly',
    wade: 'waders',
    experience: 'learning',
    mode: 'standard',      // 'standard' | 'backcountry'
    startFrom: 'current',  // 'current' | 'map'
    routeMode: 'build',    // 'build' | 'none'
    sessionTimer: null,
    sessionSeconds: 0,
    areaMarker: null,  // Leaflet marker for area pill pin
    routeStartMarker: null,
    routeEndMarker: null,
    routePolyline: null,
  };

  /* ── Step visibility helper ── */
  function fishShowStep(stepNum) {
    fishFlow.step = stepNum;
    // Hide loading state whenever any real step (or reset) is shown
    const loadingEl = document.getElementById('fishStep0_loading');
    if (loadingEl) loadingEl.style.display = (stepNum === 0) ? '' : 'none';
    // Steps: 1=welcome, 2=strategy, 3=confirm, 4=route, 5=briefing, 6=live
    const steps = ['fishStep1_areaAction','fishStep2_strategy','fishStep2b_summary','fishStep3_route','fishStep4_briefing','fishStep5_live'];
    steps.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.style.display = (i + 1 === stepNum) ? '' : 'none';
    });
  }
  // Expose so inline onclick handlers in HTML can call it
  window.fishShowStep = fishShowStep;

  /* ── Find nearest trout water from GPS — only returns a match if user is within maxMiles ── */
  function findNearestWater(lat, lng, maxMiles) {
    const limit = (typeof maxMiles === 'number') ? maxMiles : 2.0;
    if (!window.TROUT_WATERS || !window.TROUT_WATERS.length) return null;
    let best = null, bestDist = Infinity;
    const R = 3958.8; // Earth radius in miles
    const lat1 = lat * Math.PI / 180;
    window.TROUT_WATERS.forEach(w => {
      if (!w.lat || !w.lng) return;
      const dlat = (w.lat - lat) * Math.PI / 180;
      const dlng = (w.lng - lng) * Math.PI / 180;
      const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
        Math.cos(lat1) * Math.cos(w.lat * Math.PI / 180) *
        Math.sin(dlng / 2) * Math.sin(dlng / 2);
      const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (d < bestDist) { bestDist = d; best = w; }
    });
    return (best && bestDist <= limit) ? best : null;
  }

  /* ── Create sleek area pin on map ── */
  function placeAreaPin(water) {
    if (!water || !water.lat || !water.lng || typeof map === 'undefined' || !map) return;
    // Remove old pin
    if (fishFlow.areaMarker) { map.removeLayer(fishFlow.areaMarker); fishFlow.areaMarker = null; }
    // Custom DivIcon — small sleek pill with area name
    const pillIcon = L.divIcon({
      className: 'ht-area-pin',
      html: '<div class="ht-area-pin-pill"><span class="ht-area-pin-dot"></span>' + water.name + '</div>',
      iconSize: [0, 0],
      iconAnchor: [0, 16]
    });
    fishFlow.areaMarker = L.marker([water.lat, water.lng], { icon: pillIcon, zIndexOffset: 900 }).addTo(map);
    // Click the pin → open unified action tray (no white popup)
    fishFlow.areaMarker.on('click', function() {
      var w = fishFlow.area;
      if (!w) return;
      if (typeof map !== 'undefined' && map) map.closePopup();
      if (typeof showFlyWaterActionBar === 'function') {
        showFlyWaterActionBar(w);
      }
    });
  }

  /* ═══ FISH NOW — fishNowInit registered on window for top-level showStreamPanel ═══ */
  function fishNowInit() {
    console.log('HUNTECH: fishNowInit running');
    fishShowStep(0); // show GPS scanning state
    // DEV: Lock to Bennett Spring for testing (skip real GPS)
    var water = window.TROUT_WATERS && window.TROUT_WATERS.find(function(w) { return w.id === 'bennett-spring'; });
    if (!water) {
      showNotice('Bennett Spring data not loaded.', 'error', 3500);
      return;
    }
    fishFlow.area = water;
    placeAreaPin(water);
    if (typeof map !== 'undefined' && map) {
      map.setView([water.lat, water.lng], 14, { animate: true, duration: 1.0 });
    }
    // Show the unified action tray (bottom bar)
    if (typeof showFlyWaterActionBar === 'function') {
      setTimeout(function() { showFlyWaterActionBar(water); }, 400);
    }
    // Populate step 1 welcome elements
    var ribbonEl = document.getElementById('fishAreaRibbon');
    var titleEl = document.getElementById('fishAreaTitle');
    var descEl = document.getElementById('fishAreaDesc');
    if (ribbonEl) ribbonEl.textContent = '\uD83C\uDFA3 ' + (water.ribbon || water.category || 'Trout Water');
    if (titleEl) titleEl.textContent = 'Welcome to ' + water.name;
    if (descEl) {
      var parts = [(water.streamMiles ? water.streamMiles + ' mi' : ''), (water.species || []).join(', '), (water.waterType || '')].filter(Boolean);
      descEl.textContent = parts.join(' \u00B7 ');
    }
    setTimeout(function() { fishShowStep(1); }, 500);
  }

  // Called when user taps a water in the browse list or a pin on the map
  window.fishSelectWater = function(waterId) {
    const water = window.TROUT_WATERS && window.TROUT_WATERS.find(function(w) { return w.id === waterId; });
    if (!water) return;
    fishFlow.area = water;
    placeAreaPin(water);
    if (typeof map !== 'undefined' && map && water.lat && water.lng) {
      map.setView([water.lat, water.lng], 14, { animate: true, duration: 0.8 });
    }
    const ribbonEl = document.getElementById('fishAreaRibbon');
    const titleEl = document.getElementById('fishAreaTitle');
    const descEl = document.getElementById('fishAreaDesc');
    if (ribbonEl) ribbonEl.textContent = '🎣 ' + (water.ribbon || water.category || 'Trout Water');
    if (titleEl) titleEl.textContent = 'Welcome to ' + water.name;
    if (descEl) {
      const parts = [(water.streamMiles ? water.streamMiles + ' mi' : ''), (water.species || []).join(', '), (water.waterType || '')].filter(Boolean);
      descEl.textContent = parts.join(' · ');
    }
    // Restore the loading card to its default state for next time
    const loadingEl = document.getElementById('fishStep0_loading');
    if (loadingEl) {
      loadingEl.innerHTML = '<div class="ht-fish-locate-card"><div class="ht-fish-locate-pulse">📡</div><div class="ht-fish-locate-label">Finding your water\u2026</div><div class="ht-fish-locate-sub">Scanning for nearby trout waters</div></div>';
    }
    fishShowStep(1);
  };
  // Expose on window so top-level showStreamPanel can call it
  window._fishNowInitFn = fishNowInit;

  // Allow quick-jump favorites (e.g., Montauk) to enter the Fish Now flow directly
  window.loadFavoriteWater = function(waterId) {
    try {
      if (!waterId || !window.TROUT_WATERS || !Array.isArray(window.TROUT_WATERS)) {
        showNotice('Trout waters data not loaded yet.', 'error', 3500);
        return;
      }

      const water = window.TROUT_WATERS.find(function(w) { return w.id === waterId; });
      if (!water) {
        showNotice('That trout water is not available yet.', 'error', 3500);
        return;
      }

      // Ensure map is active and hero is faded
      if (!document.body.classList.contains('ht-map-active') && typeof activateFlyMap === 'function') {
        activateFlyMap();
      }

      // Show the Fish Now panel but skip GPS-based init once
      window._fishNowSkipInitOnce = true;
      if (typeof window.showStreamPanel === 'function') {
        window.showStreamPanel('fishNowPanel');
      }

      // Center map on this water
      if (typeof map !== 'undefined' && map && water.lat && water.lng) {
        map.setView([water.lat, water.lng], 16, { animate: true, duration: 1.2 });
      }

      // Wire into Fish Now state and UI
      fishFlow.area = water;
      placeAreaPin(water);
      const ribbonEl = document.getElementById('fishAreaRibbon');
      const titleEl = document.getElementById('fishAreaTitle');
      const descEl = document.getElementById('fishAreaDesc');
      if (ribbonEl) ribbonEl.textContent = '🎣 ' + (water.ribbon || water.category || 'Trout Water');
      if (titleEl) titleEl.textContent = 'Welcome to ' + water.name;
      if (descEl) {
        const parts = [(water.streamMiles ? water.streamMiles + ' mi' : ''), (water.species || []).join(', '), (water.waterType || '')].filter(Boolean);
        descEl.textContent = parts.join(' · ');
      }

      fishShowStep(1);
      showNotice('📍 Jumped to ' + water.name, 'success', 2500);
    } catch (e) {
      console.error('HUNTECH: loadFavoriteWater error', e);
      showNotice('Error loading water: ' + e.message, 'error', 4000);
    }
  };

  /* ═══ Step 1 actions ═══ */
  window.fishStepCheckIn = function(waterId) {
    console.log('HUNTECH: fishStepCheckIn called, waterId=', waterId, 'fishFlow.area=', fishFlow.area);
    // Accept waterId param OR fall back to fishFlow.area
    var water = fishFlow.area;
    if (waterId && (!water || water.id !== waterId)) {
      water = window.TROUT_WATERS && window.TROUT_WATERS.find(function(w) { return w.id === waterId; });
      if (water) fishFlow.area = water;
    }
    if (!water) {
      console.warn('HUNTECH: fishStepCheckIn — no water found');
      showNotice('Select a water first.', 'error', 2500);
      return;
    }
    showNotice('\u2705 Checked in at ' + water.name, 'success', 2500);
    // Deploy the area's access/zone pins now that user checked in
    if (typeof window.addAccessPointsForWater === 'function') {
      window.addAccessPointsForWater(water);
    }
    // Expand the unified tray to show preferences + LET'S GO
    if (typeof window.showFlyCheckInForm === 'function') {
      console.log('HUNTECH: calling showFlyCheckInForm');
      window.showFlyCheckInForm(water);
    } else {
      console.log('HUNTECH: showFlyCheckInForm not found, falling back to step 2');
      fishShowStep(2);
    }
  };

  /* ═══ Step 2 → Deploy Pins & Advance to Route Tray ═══ */
  window.fishStepDeploy = function() {
    if (!fishFlow.area) return;
    // Deploy method-filtered zone pins (only zones matching user's selection)
    if (typeof window.deployMethodFilteredZones === 'function') {
      window.deployMethodFilteredZones(fishFlow.area, fishFlow.method);
    } else if (typeof showFlyWaterMarkers === 'function') {
      showFlyWaterMarkers();
    }
    // Zoom to the water
    if (typeof map !== 'undefined' && map && fishFlow.area.lat && fishFlow.area.lng) {
      map.setView([fishFlow.area.lat, fishFlow.area.lng], 15, { animate: true, duration: 0.8 });
    }
    showNotice('📍 Fishing zones deployed at ' + fishFlow.area.name, 'success', 2500);
    // Advance to routing tray (step 3)
    fishShowStep(3);
  };

  window.fishStepSaveSpot = function(waterId) {
    var water = fishFlow.area;
    if (waterId && (!water || water.id !== waterId)) {
      water = window.TROUT_WATERS && window.TROUT_WATERS.find(function(w) { return w.id === waterId; });
      if (water) fishFlow.area = water;
    }
    if (!water) return;
    // Save to localStorage
    try {
      const key = 'huntech_saved_fishing_spots_v1';
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (!saved.find(s => s.id === fishFlow.area.id)) {
        saved.push({ id: fishFlow.area.id, name: fishFlow.area.name, lat: fishFlow.area.lat, lng: fishFlow.area.lng, savedAt: Date.now() });
        localStorage.setItem(key, JSON.stringify(saved));
      }
      showNotice('📌 ' + fishFlow.area.name + ' saved to your spots!', 'success', 2500);
    } catch (e) { /* ignore */ }
  };

  window.fishStepStartOver = function() {
    if (fishFlow.areaMarker && typeof map !== 'undefined' && map) {
      map.removeLayer(fishFlow.areaMarker);
      fishFlow.areaMarker = null;
    }
    fishFlow.area = null;
    fishFlow.step = 0;
    fishFlow.method = 'fly';
    fishFlow.wade = 'waders';
    fishFlow.experience = 'learning';
    fishFlow.mode = 'standard';
    fishFlow.startFrom = 'current';
    fishFlow.routeMode = 'build';
    fishShowStep(0);
    fishNowInit(); // re-start
  };

  /* ═══ Step 2: Strategy pill handlers ═══ */
  window.pickFishMethod = function(btn, val) {
    fishFlow.method = val;
    btn.closest('.ht-method-row').querySelectorAll('.ht-method-btn').forEach(b => b.classList.remove('ht-method-btn--active'));
    btn.classList.add('ht-method-btn--active');
  };
  window.pickFishWade = function(btn, val) {
    fishFlow.wade = val;
    btn.closest('.ht-method-row').querySelectorAll('.ht-method-btn').forEach(b => b.classList.remove('ht-method-btn--active'));
    btn.classList.add('ht-method-btn--active');
  };
  window.pickFishExp = function(btn, val) {
    fishFlow.experience = val;
    btn.closest('.ht-method-row').querySelectorAll('.ht-method-btn').forEach(b => b.classList.remove('ht-method-btn--active'));
    btn.classList.add('ht-method-btn--active');
  };

  window.pickFishMode = function(btn, val) {
    fishFlow.mode = val;
    btn.closest('.ht-method-row').querySelectorAll('.ht-method-btn').forEach(b => b.classList.remove('ht-method-btn--active'));
    btn.classList.add('ht-method-btn--active');
  };

  window.pickFishStart = function(btn, val) {
    fishFlow.startFrom = val;
    btn.closest('.ht-method-row').querySelectorAll('.ht-method-btn').forEach(b => b.classList.remove('ht-method-btn--active'));
    btn.classList.add('ht-method-btn--active');
  };

  window.pickFishRouteMode = function(btn, val) {
    fishFlow.routeMode = val;
    btn.closest('.ht-method-row').querySelectorAll('.ht-method-btn').forEach(b => b.classList.remove('ht-method-btn--active'));
    btn.classList.add('ht-method-btn--active');
  };

  window.fishStepLetsGo = function() {
    if (!fishFlow.area) return;
    showNotice('🎯 Locking in your plan…', 'success', 2000);
    // Zoom to water area
    if (typeof map !== 'undefined' && map && fishFlow.area.lat) {
      map.setView([fishFlow.area.lat, fishFlow.area.lng], 16, { animate: true });
    }
    setTimeout(() => {
      fishShowStep(5);
      generateFishBriefing();
    }, 600);
  };

  /* ═══ Routing tray actions ═══ */
  window.fishRouteFromMyLocation = function() {
    fishFlow.startFrom = 'current';
    showNotice('📍 Route will start from your current location', 'success', 2500);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        const startLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        // Place start marker
        if (fishFlow.routeStartMarker && map) map.removeLayer(fishFlow.routeStartMarker);
        fishFlow.routeStartMarker = L.marker(startLatLng, {
          icon: L.divIcon({ className: 'ht-route-pin ht-route-pin-start', html: '📍', iconSize: [28, 28], iconAnchor: [14, 14] })
        }).addTo(map);
        showNotice('📍 Start point set — tap the map to set your destination', 'info', 4000);
        map.once('click', function(e) {
          if (fishFlow.routeEndMarker) map.removeLayer(fishFlow.routeEndMarker);
          fishFlow.routeEndMarker = L.marker(e.latlng, {
            icon: L.divIcon({ className: 'ht-route-pin ht-route-pin-end', html: '🏁', iconSize: [28, 28], iconAnchor: [14, 14] })
          }).addTo(map);
          if (fishFlow.routePolyline) map.removeLayer(fishFlow.routePolyline);
          fishFlow.routePolyline = L.polyline([startLatLng, e.latlng], {
            color: '#00FF88', weight: 3, dashArray: '8,8', opacity: 0.8
          }).addTo(map);
          showNotice('🏁 Route set! Generating briefing…', 'success', 2500);
          setTimeout(() => { fishShowStep(5); generateFishBriefing(); }, 800);
        });
      }, function() {
        showNotice('Enable location access to start from your position.', 'error', 3500);
      }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 });
    } else {
      showNotice('GPS not available on this device.', 'error', 3500);
    }
  };

  window.fishRoutePickOnMap = function() {
    fishFlow.startFrom = 'map';
    showNotice('📍 Tap the map to set your starting point', 'info', 4000);
    if (typeof map !== 'undefined' && map) {
      map.once('click', function(e) {
        if (fishFlow.routeStartMarker) map.removeLayer(fishFlow.routeStartMarker);
        fishFlow.routeStartMarker = L.marker(e.latlng, {
          icon: L.divIcon({ className: 'ht-route-pin ht-route-pin-start', html: '🅿️', iconSize: [28, 28], iconAnchor: [14, 14] })
        }).addTo(map);
        showNotice('🅿️ Start set! Now tap your destination', 'success', 3500);
        map.once('click', function(e2) {
          if (fishFlow.routeEndMarker) map.removeLayer(fishFlow.routeEndMarker);
          fishFlow.routeEndMarker = L.marker(e2.latlng, {
            icon: L.divIcon({ className: 'ht-route-pin ht-route-pin-end', html: '🏁', iconSize: [28, 28], iconAnchor: [14, 14] })
          }).addTo(map);
          if (fishFlow.routePolyline) map.removeLayer(fishFlow.routePolyline);
          fishFlow.routePolyline = L.polyline([e.latlng, e2.latlng], {
            color: '#00FF88', weight: 3, dashArray: '8,8', opacity: 0.8
          }).addTo(map);
          showNotice('🏁 Route set! Generating briefing…', 'success', 2500);
          setTimeout(() => { fishShowStep(5); generateFishBriefing(); }, 800);
        });
      });
    }
  };

  window.fishRouteNone = function() {
    fishFlow.routeMode = 'none';
    showNotice('🎯 No route — generating briefing…', 'success', 2000);
    // Clear any existing route markers
    if (fishFlow.routeStartMarker && map) map.removeLayer(fishFlow.routeStartMarker);
    if (fishFlow.routeEndMarker && map) map.removeLayer(fishFlow.routeEndMarker);
    if (fishFlow.routePolyline && map) map.removeLayer(fishFlow.routePolyline);
    fishFlow.routeStartMarker = null;
    fishFlow.routeEndMarker = null;
    fishFlow.routePolyline = null;
    setTimeout(() => { fishShowStep(5); generateFishBriefing(); }, 600);
  };

  window.fishRouteGoBack = function() {
    fishShowStep(2);
  };

  /* ═══ Step 3: Define Route ═══ */
  window.fishBeginRoute = function() {
    showNotice('📍 Tap the map to set your parking spot', 'info', 4000);
    if (typeof map !== 'undefined' && map) {
      map.once('click', function(e) {
        // Place parking marker
        if (fishFlow.routeStartMarker) map.removeLayer(fishFlow.routeStartMarker);
        fishFlow.routeStartMarker = L.marker(e.latlng, {
          icon: L.divIcon({ className: 'ht-route-pin ht-route-pin-start', html: '🅿️', iconSize: [28, 28], iconAnchor: [14, 14] })
        }).addTo(map);
        showNotice('🅿️ Parking set! Now tap your turnaround point', 'success', 3500);
        // Wait for turnaround
        map.once('click', function(e2) {
          if (fishFlow.routeEndMarker) map.removeLayer(fishFlow.routeEndMarker);
          fishFlow.routeEndMarker = L.marker(e2.latlng, {
            icon: L.divIcon({ className: 'ht-route-pin ht-route-pin-end', html: '🏁', iconSize: [28, 28], iconAnchor: [14, 14] })
          }).addTo(map);
          // Draw route line
          if (fishFlow.routePolyline) map.removeLayer(fishFlow.routePolyline);
          fishFlow.routePolyline = L.polyline([fishFlow.routeStartMarker.getLatLng(), e2.latlng], {
            color: '#00FF88', weight: 3, dashArray: '8,8', opacity: 0.8
          }).addTo(map);
          showNotice('🏁 Route set! Lock it in when ready.', 'success', 3000);
          const lockBtn = document.getElementById('fishRouteLockBtn');
          if (lockBtn) lockBtn.style.display = '';
        });
      });
    }
  };

  window.fishLockRoute = function() {
    showNotice('🔒 Route locked — generating your briefing…', 'success', 2500);
    setTimeout(() => {
      fishShowStep(5);
      generateFishBriefing();
    }, 600);
  };

  window.fishClearRoute = function() {
    if (fishFlow.routeStartMarker && map) map.removeLayer(fishFlow.routeStartMarker);
    if (fishFlow.routeEndMarker && map) map.removeLayer(fishFlow.routeEndMarker);
    if (fishFlow.routePolyline && map) map.removeLayer(fishFlow.routePolyline);
    fishFlow.routeStartMarker = null;
    fishFlow.routeEndMarker = null;
    fishFlow.routePolyline = null;
    const lockBtn = document.getElementById('fishRouteLockBtn');
    if (lockBtn) lockBtn.style.display = 'none';
    showNotice('🔄 Route cleared', 'info', 2000);
  };

  /* ═══ Step 4: AI Briefing Generator ═══ */
  function generateFishBriefing() {
    const w = fishFlow.area;
    if (!w) return;

    const introEl = document.getElementById('fishCoachIntro');
    const bodyEl = document.getElementById('fishBriefingBody');
    if (!introEl || !bodyEl) return;

    // Coach introduction
    const coachNames = ['River', 'Brooks', 'Hatch', 'Drift'];
    const coach = coachNames[Math.floor(Math.random() * coachNames.length)];
    introEl.innerHTML = '<strong>Hey — I\'m Coach ' + coach + '</strong>, your Huntech AI stream guide. ' +
      'I\'ve analyzed <em>' + w.name + '</em> and here\'s what you need to know for today\'s session.';

    // Build detailed briefing
    const method = fishFlow.method === 'fly' ? 'fly fishing' : fishFlow.method === 'spin' ? 'spin fishing' : 'bait fishing';
    const season = getCurrentSeason();
    const hatches = w.hatches ? w.hatches[season] : null;
    const topFlies = w.topFlies ? w.topFlies.slice(0, 5).join(', ') : 'General nymphs and dries';
    const tips = w.coachTips ? w.coachTips.slice(0, 3) : [];
    const regs = w.regulations || {};

    let html = '';
    html += '<div class="ht-brief-section"><strong>📍 ' + w.name + '</strong>';
    html += '<br>' + (w.description || (w.ribbon || '') + ' trout water in ' + (w.region || 'Missouri'));
    html += '<br>Species: ' + (w.species || ['rainbow']).join(', ');
    html += ' • ' + (w.streamMiles ? w.streamMiles + ' stream miles' : '') + '</div>';

    html += '<div class="ht-brief-section"><strong>🎣 Your Setup</strong>';
    html += '<br>Method: ' + method.charAt(0).toUpperCase() + method.slice(1);
    html += ' • ' + (fishFlow.wade === 'waders' ? 'Wading in' : 'Streamside');
    html += ' • ' + fishFlow.experience + ' level';
    html += '<br>Mode: ' + (fishFlow.mode === 'backcountry' ? 'Backcountry — focusing on quieter, harder-to-reach water.' : 'Standard access — focusing on known parking and easy entries.');
    html += '<br>Start: ' + (fishFlow.startFrom === 'map' ? 'You picked a starting point on the map.' : 'Starting from your current GPS location.');
    html += '<br>Route: ' + (fishFlow.routeMode === 'none' ? 'No route — you will work the water freely.' : 'Route-guided — parking to turnaround with hotspots in between.') + '</div>';

    if (hatches) {
      html += '<div class="ht-brief-section"><strong>🦟 Hatch Report (' + season + ')</strong>';
      html += '<br>' + hatches + '</div>';
    }

    html += '<div class="ht-brief-section"><strong>🪰 Top Flies</strong>';
    html += '<br>' + topFlies + '</div>';

    if (regs.method || regs.dailyLimit) {
      html += '<div class="ht-brief-section"><strong>📋 Regulations</strong>';
      if (regs.method) html += '<br>Method: ' + regs.method;
      if (regs.dailyLimit) html += '<br>Daily limit: ' + regs.dailyLimit;
      if (regs.minSize) html += ' • Min size: ' + regs.minSize;
      if (regs.specialRules) html += '<br>' + regs.specialRules;
      html += '</div>';
    }

    if (tips.length) {
      html += '<div class="ht-brief-section"><strong>💡 Coach ' + coach + '\'s Tips</strong>';
      tips.forEach(t => { html += '<br>• ' + t; });
      html += '</div>';
    }

    html += '<div class="ht-brief-section"><strong>🌊 Water Intel</strong>';
    if (w.flowSource) html += '<br>Flow: ' + w.flowSource;
    html += '<br>Difficulty: ' + (w.difficulty || 'moderate');
    html += ' • Solitude: ' + (w.solitude || 'moderate');
    if (w.familyFriendly) html += ' • Family friendly ✅';
    html += '</div>';

    // Habitat education: show two high-priority habitat types from TROUT_EDUCATION
    const edu = window.TROUT_EDUCATION || {};
    const habitatKeys = Object.keys(edu);
    if (habitatKeys.length) {
      const sorted = habitatKeys.slice().sort((a, b) => {
        const pa = edu[a] && typeof edu[a].priority === 'number' ? edu[a].priority : 999;
        const pb = edu[b] && typeof edu[b].priority === 'number' ? edu[b].priority : 999;
        return pa - pb;
      });
      const topKeys = sorted.slice(0, 2);
      topKeys.forEach((key) => {
        const block = edu[key];
        if (!block) return;
        html += '<div class="ht-brief-section"><strong>🎓 Habitat Focus: ' + (block.title || key) + '</strong>';
        if (block.description) html += '<br>' + block.description;
        if (Array.isArray(block.tips) && block.tips.length) {
          const subset = block.tips.slice(0, 3);
          subset.forEach((tip) => { html += '<br>• ' + tip; });
        }
        html += '</div>';
      });
    }

    bodyEl.innerHTML = html;
  }

  function getCurrentSeason() {
    const m = new Date().getMonth();
    if (m >= 2 && m <= 4) return 'spring';
    if (m >= 5 && m <= 7) return 'summer';
    if (m >= 8 && m <= 10) return 'fall';
    return 'winter';
  }

  /* ═══ Step 6: Start Fishing Session ═══ */
  window.fishStartSession = function() {
    fishShowStep(6);
    const nameEl = document.getElementById('liveWaterName2');
    if (nameEl && fishFlow.area) nameEl.textContent = fishFlow.area.name;

    // Start timer
    fishFlow.sessionSeconds = 0;
    if (fishFlow.sessionTimer) clearInterval(fishFlow.sessionTimer);
    fishFlow.sessionTimer = setInterval(() => {
      fishFlow.sessionSeconds++;
      const m = Math.floor(fishFlow.sessionSeconds / 60);
      const s = fishFlow.sessionSeconds % 60;
      const el = document.getElementById('liveTimer2');
      if (el) el.textContent = m + ':' + String(s).padStart(2, '0');
    }, 1000);
    showNotice('🐟 Tight lines! Streamside Command is live.', 'success', 3000);
  };

  /* ═══ Streamside Command Actions ═══ */
  window.fishLogCatch = function() {
    // Open file picker for photo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      // Save catch to log
      try {
        const key = 'huntech_catch_log_v1';
        const log = JSON.parse(localStorage.getItem(key) || '[]');
        log.push({
          water: fishFlow.area ? fishFlow.area.name : 'Unknown',
          method: fishFlow.method,
          timestamp: Date.now(),
          fileName: file.name,
          size: file.size
        });
        localStorage.setItem(key, JSON.stringify(log));
      } catch(ex) { /* */ }
      showNotice('📸 Catch logged! Nice fish! 🐟', 'success', 3000);
    };
    input.click();
  };

  window.fishLogFlyData = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const key = 'huntech_fly_data_log_v1';
        const log = JSON.parse(localStorage.getItem(key) || '[]');
        log.push({
          water: fishFlow.area ? fishFlow.area.name : 'Unknown',
          timestamp: Date.now(),
          fileName: file.name,
          type: 'streamside-observation'
        });
        localStorage.setItem(key, JSON.stringify(log));
      } catch(ex) { /* */ }
      showNotice('🦟 Fly data logged! This helps the AI learn.', 'success', 3000);
    };
    input.click();
  };

  window.fishMyFlyBox = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      showNotice('🪺 Scanning your fly box with AI… This may take a moment.', 'info', 4000);
      // Simulate AI scan
      setTimeout(() => {
        const commonFlies = ['Adams #14', 'Elk Hair Caddis #16', 'Pheasant Tail #18', 'Woolly Bugger #10', 'Zebra Midge #20', 'Hare\'s Ear #14', 'Copper John #16', 'Blue Wing Olive #18'];
        const detected = commonFlies.sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 3));
        try {
          const key = 'huntech_fly_box_v1';
          const box = JSON.parse(localStorage.getItem(key) || '[]');
          detected.forEach(f => { if (!box.includes(f)) box.push(f); });
          localStorage.setItem(key, JSON.stringify(box));
        } catch(ex) { /* */ }
        showNotice('🪺 ' + detected.length + ' flies detected: ' + detected.join(', '), 'success', 5000);
      }, 2500);
    };
    input.click();
  };

  window.fishAiRecommend = function() {
    if (!fishFlow.area) {
      showNotice('Check in to a water first for AI recommendations.', 'error', 3000);
      return;
    }
    const w = fishFlow.area;
    const season = getCurrentSeason();
    const hatches = w.hatches ? w.hatches[season] : 'general insect activity';
    const topFlies = w.topFlies ? w.topFlies.slice(0, 3) : ['Adams', 'Pheasant Tail', 'Elk Hair Caddis'];

    // Check user's fly box
    let userBox = [];
    try { userBox = JSON.parse(localStorage.getItem('huntech_fly_box_v1') || '[]'); } catch(ex) { /* */ }

    let msg = '🧠 <strong>AI Fly Coach — ' + w.name + '</strong><br>';
    msg += '<strong>Current conditions:</strong> ' + season + ' season';
    if (hatches) msg += ', ' + hatches;
    msg += '<br><strong>Top picks right now:</strong> ' + topFlies.join(', ');
    if (userBox.length) {
      const match = topFlies.filter(f => userBox.some(b => b.toLowerCase().includes(f.toLowerCase().split(' ')[0])));
      if (match.length) {
        msg += '<br>✅ <strong>You have:</strong> ' + match.join(', ') + ' — use these!';
      } else {
        msg += '<br>⚠️ Nothing in your fly box matches. Try: ' + topFlies[0];
      }
    }
    if (w.coachTips && w.coachTips[0]) {
      msg += '<br><strong>Pro tip:</strong> ' + w.coachTips[0];
    }

    // Show as a persistent notice
    showNotice(msg, 'success', 8000);
  };

  window.fishEndSession = function() {
    if (fishFlow.sessionTimer) { clearInterval(fishFlow.sessionTimer); fishFlow.sessionTimer = null; }
    const mins = Math.floor(fishFlow.sessionSeconds / 60);
    showNotice('⏹ Session ended — ' + mins + ' minutes on the water. Nice work!', 'success', 4000);
    // Save session log
    try {
      const key = 'huntech_session_log_v1';
      const log = JSON.parse(localStorage.getItem(key) || '[]');
      log.push({
        water: fishFlow.area ? fishFlow.area.name : 'Unknown',
        method: fishFlow.method,
        duration: fishFlow.sessionSeconds,
        timestamp: Date.now()
      });
      localStorage.setItem(key, JSON.stringify(log));
    } catch(ex) { /* */ }
    // Reset
    fishShowStep(0);
    fishFlow.step = 0;
    fishFlow.sessionSeconds = 0;
  };

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

// Close navigation panels
window.closePropertiesPanel = function() {
  const panel = document.getElementById('ht-properties-panel');
  if (panel) {
    panel.classList.remove('visible');
    setTimeout(() => panel.remove(), 350);
    
    // Reset nav button states
    document.querySelectorAll('.ht-nav-btn').forEach(btn => btn.classList.remove('ht-nav-active'));
    const mapBtn = document.querySelector('[onclick="showMap()"]');
    if (mapBtn) mapBtn.classList.add('ht-nav-active');
  }
};

window.closeHuntsPanel = function() {
  const panel = document.getElementById('ht-hunts-panel');
  if (panel) {
    panel.classList.remove('visible');
    setTimeout(() => panel.remove(), 350);
    
    // Reset nav button states
    document.querySelectorAll('.ht-nav-btn').forEach(btn => btn.classList.remove('ht-nav-active'));
    const mapBtn = document.querySelector('[onclick="showMap()"]');
    if (mapBtn) mapBtn.classList.add('ht-nav-active');
  }
};

// Offline status management
let offlineBanner = null;

function showOfflineBanner() {
  if (offlineBanner) return;
  
  offlineBanner = document.createElement('div');
  offlineBanner.className = 'ht-offline-banner';
  offlineBanner.innerHTML = '📡 Offline mode - Using cached data';
  
  document.body.appendChild(offlineBanner);
  setTimeout(() => offlineBanner.classList.add('visible'), 50);
}

function hideOfflineBanner() {
  if (offlineBanner) {
    offlineBanner.classList.remove('visible');
    setTimeout(() => {
      offlineBanner?.remove();
      offlineBanner = null;
    }, 300);
  }
}

// Setup offline detection
if (typeof window !== 'undefined') {
  window.addEventListener('online', hideOfflineBanner);
  window.addEventListener('offline', showOfflineBanner);
  
  // Check initial state
  if (!navigator.onLine) {
    setTimeout(showOfflineBanner, 1000);
  }
}

