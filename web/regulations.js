// Area rules and regulations data.
// Replace with real agency data feeds or unit-specific rules.
// Bounds are simple boxes: north/south/east/west in lat/lng.
window.PUBLIC_LAND_RULES = [
  {
    areaName: 'Missouri Statewide - Shed Hunting Guidance',
    bounds: {
      north: 40.61364,
      south: 35.99568,
      east: -89.09884,
      west: -95.77415
    },
    summary: 'Missouri does not set a statewide shed-hunting season, but access and methods vary by site. Always follow site-specific rules, posted closures, and conservation area regulations. Respect wildlife refuges, winter stress closures, and any local travel restrictions.',
    source: 'Missouri Department of Conservation (MDC): https://mdc.mo.gov | Wildlife Code of Missouri: https://mdc.mo.gov/about-us/organization/regulations'
  },
  {
    areaName: 'MDC Conservation Areas - Site Rules',
    bounds: {
      north: 40.61364,
      south: 35.99568,
      east: -89.09884,
      west: -95.77415
    },
    summary: 'Conservation areas post specific access rules. Check each area for allowed activities, seasonal closures, and travel restrictions before shed hunting.',
    source: 'Find a Conservation Area: https://mdc.mo.gov/atlas | Area Regulations: https://mdc.mo.gov/discover-nature/places'
  },

  // ---- Turkey Hunting Regulations ----
  {
    areaName: 'Missouri Statewide - Turkey Hunting Regulations (Spring 2026)',
    bounds: { north: 40.61364, south: 35.99568, east: -89.09884, west: -95.77415 },
    summary: 'Spring Turkey Season: Apr 20 - May 10, 2026. Youth Season: Apr 11-12, 2026. Public Land hours: 30 min before sunrise to 1:00 PM CDT. Private land: 30 min before sunrise to sunset. Residents: 2 bearded turkeys (only 1 during first week). Nonresidents: 1 bearded turkey. Legal methods: shotgun (shot #2-#8), bow, crossbow. No rifles or handguns during spring.',
    source: 'MDC Turkey Regulations: https://mdc.mo.gov/hunting-trapping/species/turkey/turkey-regulations | Permits: https://mdc.mo.gov/hunting-trapping/species/turkey/turkey-permits'
  },
  {
    areaName: 'Missouri Statewide - Turkey Hunting Regulations (Fall 2026)',
    bounds: { north: 40.61364, south: 35.99568, east: -89.09884, west: -95.77415 },
    summary: 'Fall Archery: Sep 15 - Nov 13, 2026 (statewide). Fall Firearms: Oct 1-31, 2026. Hours: 30 min before sunrise to sunset (firearms) or 30 min after sunset (archery). Limit: 2 turkeys either sex (archery+firearms combined). Fall firearms NOT permitted in Dunklin, McDonald, Mississippi, New Madrid, Newton, Pemiscot, and Scott counties.',
    source: 'MDC Turkey Regulations: https://mdc.mo.gov/hunting-trapping/species/turkey/turkey-regulations'
  },
  {
    areaName: 'MDC Conservation Areas - Turkey Hunting Access',
    bounds: { north: 40.61364, south: 35.99568, east: -89.09884, west: -95.77415 },
    summary: 'Most MDC conservation areas allow turkey hunting during open seasons. Check each area for specific access rules, parking restrictions, managed hunt areas (lottery), and special regulations. Some areas require daily sign-in. Spring managed hunts available at select areas by permit.',
    source: 'MDC Conservation Areas: https://mdc.mo.gov/atlas | Spring Managed Hunts: https://mdc.mo.gov/hunting-trapping/species/turkey/turkey-spring-managed-hunts'
  }
];
