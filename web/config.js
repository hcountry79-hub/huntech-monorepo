// HUNTECH configuration
// Override this URL if you have a better public land data source.
window.PUBLIC_LAND_TILE_URL = window.PUBLIC_LAND_TILE_URL || 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Protected_Areas/MapServer/tile/{z}/{y}/{x}';
// Missouri Department of Conservation Conservation Area boundaries.
window.MDC_CONSERVATION_AREAS_URL = window.MDC_CONSERVATION_AREAS_URL || 'https://gisblue.mdc.mo.gov/arcgis/rest/services/Discover_Nature/MDC_Administrative_Areas/FeatureServer/5';

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

// Optional: prefer MapLibre GL (native rotate/pitch) instead of Leaflet.
// Set to true to launch the MapLibre-based map (maplibre.html).
// Recommended on iOS Safari where Leaflet CSS rotation can show tile gaps.
window.HUNTECH_USE_MAPLIBRE = true;

// Mobile rotation controls (Leaflet CSS-based, opt-in to avoid regressions).
// Default OFF for stability.
window.HUNTECH_AUTO_ROTATE_ON_HEADING = window.HUNTECH_AUTO_ROTATE_ON_HEADING ?? false;
window.HUNTECH_TOUCH_ROTATE_ENABLED = window.HUNTECH_TOUCH_ROTATE_ENABLED ?? false;

// Force-disable rotation on iOS devices for stability.
try {
	var isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '');
	if (isIOS) {
		window.HUNTECH_AUTO_ROTATE_ON_HEADING = false;
		window.HUNTECH_TOUCH_ROTATE_ENABLED = false;
	}
} catch (e) {}

// Basemap preferences: keep mobile consistent with desktop and do not lock.
window.HUNTECH_FORCE_BASEMAP_LOCK = false;
window.HUNTECH_LOCK_BASEMAP_ON_MOBILE = false;
// Default mobile basemap to Satellite to match desktop startup feel.
window.HUNTECH_MOBILE_BASEMAP = 'satellite';

// ===================================================================
//   Tree / Leaf Identification API (Mushroom Module)
// ===================================================================
// Option 1: PlantNet free tier — get a key at https://my.plantnet.org/
window.PLANTNET_API_KEY = window.PLANTNET_API_KEY || '';
// Option 2: Custom tree ID API endpoint (must accept { image: base64, api_key: string })
window.TREE_ID_API_URL = window.TREE_ID_API_URL || '';
window.TREE_ID_API_KEY = window.TREE_ID_API_KEY || '';

// ===================================================================
//   Satellite Land Cover Verification (NLCD)
// ===================================================================
// USGS National Land Cover Database — validates pin locations against
// actual satellite imagery to prevent pins on crop fields, bare ground, etc.
// Default: MRLC GeoServer WMS for NLCD 2021 (30m resolution, free/public).
window.HUNTECH_NLCD_URL = window.HUNTECH_NLCD_URL || 'https://www.mrlc.gov/geoserver/mrlc_display/NLCD_2021_Land_Cover_L48/wms';
window.HUNTECH_NLCD_ENABLED = window.HUNTECH_NLCD_ENABLED ?? true;
window.HUNTECH_NLCD_MAX_CHECKS = window.HUNTECH_NLCD_MAX_CHECKS || 200;
