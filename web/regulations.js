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
  }
];
