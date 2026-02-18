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

// Optional: USGS NWIS Instantaneous Values endpoint for flow + gage data.
// Example site ids can be added per water in fly-fishing-data.js.
window.HUNTECH_USGS_NWIS_IV_URL = window.HUNTECH_USGS_NWIS_IV_URL || 'https://waterservices.usgs.gov/nwis/iv/';
window.HUNTECH_USGS_USE_PROXY = window.HUNTECH_USGS_USE_PROXY || false;
window.HUNTECH_FLY_FLOW_CACHE_TTL_MS = window.HUNTECH_FLY_FLOW_CACHE_TTL_MS || (10 * 60 * 1000);

// GPS accuracy tuning (shed module).
window.HUNTECH_GPS_MIN_MOVE_M = window.HUNTECH_GPS_MIN_MOVE_M || 2.5;
window.HUNTECH_GPS_JITTER_FACTOR = window.HUNTECH_GPS_JITTER_FACTOR || 0.6;
window.HUNTECH_GPS_MAP_LOCK_MIN_M = window.HUNTECH_GPS_MAP_LOCK_MIN_M || 3;
window.HUNTECH_GPS_ACCURACY_NOTICE_MS = window.HUNTECH_GPS_ACCURACY_NOTICE_MS || (60 * 1000);
