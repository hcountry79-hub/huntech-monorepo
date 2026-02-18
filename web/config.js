// HUNTECH configuration
// Override this URL if you have a better public land data source.
window.PUBLIC_LAND_TILE_URL = window.PUBLIC_LAND_TILE_URL || 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Protected_Areas/MapServer/tile/{z}/{y}/{x}';
// Missouri Department of Conservation Conservation Area boundaries.
window.MDC_CONSERVATION_AREAS_URL = window.MDC_CONSERVATION_AREAS_URL || 'https://gisblue.mdc.mo.gov/arcgis/rest/services/Discover_Nature/MDC_Administrative_Areas/FeatureServer/5';
// MDC logo used in public land popups and action buttons.
window.MDC_LOGO_URL = window.MDC_LOGO_URL || 'assets/mdc-logo.png';

// Private parcel boundaries are jurisdiction-specific (state/county/city open data portals).
// Set this to an ArcGIS tile endpoint or other XYZ tile service that you have rights to use.
// Example format: 'https://<host>/arcgis/rest/services/<service>/MapServer/tile/{z}/{y}/{x}'
window.PRIVATE_PARCELS_TILE_URL = window.PRIVATE_PARCELS_TILE_URL || '';

// Optional: LiDAR-style hillshade overlay (shown in the map layer control).
// If you have a local/state LiDAR hillshade tile service, set this to that URL.
// Default uses Esri World Hillshade.
window.LIDAR_TILE_URL = window.LIDAR_TILE_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}';

// Optional: use OSRM public router for more realistic walking routes.
window.WALK_ROUTER_URL = window.WALK_ROUTER_URL || 'https://router.project-osrm.org/route/v1/foot';

// Route styling: 'terrain' (curvy, contour-following), 'osrm' (trail routing), or 'straight'.
window.HUNTECH_ROUTE_STYLE = (window.HUNTECH_ROUTE_STYLE ?? 'terrain');

// MDC data fetch: set true to force /proxy for ArcGIS requests if CORS blocks direct calls.
window.HUNTECH_MDC_USE_PROXY = (window.HUNTECH_MDC_USE_PROXY ?? false);

// Optional: Elevation API endpoint for terrain-feature detection along routes.
// Default uses OpenTopoData SRTM 90m. If this endpoint rate-limits or blocks CORS,
// you can swap to another compatible API.
// Expected response shape:
// - OpenTopoData: { results: [{ elevation: number }] }
// - Open-Elevation: { results: [{ elevation: number }] }
// For the US, NED 10m is typically much higher detail than SRTM 90m.
// If you're outside NED coverage, switch to srtm90m or a local/state LiDAR DEM API.
window.ELEVATION_API_URL = window.ELEVATION_API_URL || 'https://api.opentopodata.org/v1/ned10m';

// Terrain scan tuning (meters)
window.TERRAIN_SCAN_SAMPLE_SPACING_M = window.TERRAIN_SCAN_SAMPLE_SPACING_M || 80;
window.TERRAIN_FEATURE_GEOFENCE_M = window.TERRAIN_FEATURE_GEOFENCE_M || 40;

// UX toggles
// Set to true if you want toast-style notices to appear.
window.HUNTECH_NOTICES_ENABLED = (window.HUNTECH_NOTICES_ENABLED ?? false);

// Set to true if you want Leaflet popups on pins/features.
window.HUNTECH_MAP_POPUPS_ENABLED = (window.HUNTECH_MAP_POPUPS_ENABLED ?? true);

// Route styling + contour behavior
// Set to true to clamp routes to contour-like elevation bands.
window.HUNTECH_CONTOUR_CLAMP = (window.HUNTECH_CONTOUR_CLAMP ?? true);

// Target contour interval in feet (10ft default).
window.HUNTECH_CONTOUR_INTERVAL_FT = (window.HUNTECH_CONTOUR_INTERVAL_FT ?? 10);

// Hotspot placement tuning
// Avoid placing hotspot pins on large flat water surfaces when elevation data is available.
window.HUNTECH_WATER_AVOID = (window.HUNTECH_WATER_AVOID ?? true);
// Elevation variance threshold (meters) used to classify a candidate as flat water.
window.HUNTECH_WATER_VARIANCE_M = (window.HUNTECH_WATER_VARIANCE_M ?? 0.9);
// Sampling offset (meters) around candidate to detect flat water surfaces.
window.HUNTECH_WATER_SAMPLE_OFFSET_M = (window.HUNTECH_WATER_SAMPLE_OFFSET_M ?? 35);
