// Clean-room fly fishing dataset (seed data, replace with official feeds).
// Coordinates are placeholders and should be verified before relying on them.
// Optional: add usgsSiteId to enable live flow (NWIS) in strategy output.
window.FLY_WATERS = [
  {
    id: 'bennett-spring',
    name: 'Bennett Spring State Park',
    waterType: 'Trout Park',
    ribbon: 'Trout Park',
    lat: 37.7259,
    lng: -92.8445,
    access: 'State park access with on-site amenities.',
    solitude: 'low',
    confidence: 'low'
  },
  {
    id: 'montauk',
    name: 'Montauk State Park',
    waterType: 'Trout Park',
    ribbon: 'Trout Park',
    lat: 37.4549,
    lng: -91.6412,
    access: 'State park access with on-site amenities.',
    solitude: 'low',
    confidence: 'low'
  },
  {
    id: 'roaring-river',
    name: 'Roaring River State Park',
    waterType: 'Trout Park',
    ribbon: 'Trout Park',
    lat: 36.5773,
    lng: -93.8313,
    access: 'State park access with on-site amenities.',
    solitude: 'low',
    confidence: 'low'
  },
  {
    id: 'maramec-spring',
    name: 'Maramec Spring Park',
    waterType: 'Trout Park',
    ribbon: 'Trout Park',
    lat: 37.9348,
    lng: -91.0798,
    access: 'Park access with managed trout water.',
    solitude: 'low',
    confidence: 'low'
  },
  {
    id: 'lake-taneycomo',
    name: 'Lake Taneycomo',
    waterType: 'Tailwater',
    ribbon: 'Special Management',
    lat: 36.6419,
    lng: -93.2441,
    access: 'Tailwater access with dynamic flows.',
    solitude: 'medium',
    confidence: 'low'
  },
  {
    id: 'blue-springs',
    name: 'Blue Springs Creek',
    waterType: 'Wild Stream',
    ribbon: 'Blue Ribbon',
    lat: 37.3386,
    lng: -92.1652,
    access: 'Public stream access varies by segment.',
    solitude: 'high',
    confidence: 'low'
  },
  {
    id: 'crane-creek',
    name: 'Crane Creek',
    waterType: 'Wild Stream',
    ribbon: 'Blue Ribbon',
    lat: 36.6954,
    lng: -93.3327,
    access: 'Public stream access varies by segment.',
    solitude: 'high',
    confidence: 'low'
  },
  {
    id: 'current-river',
    name: 'Current River',
    waterType: 'River',
    ribbon: 'White/Blue Mix',
    lat: 37.3059,
    lng: -91.4094,
    access: 'Multiple public access points and float options.',
    solitude: 'medium',
    confidence: 'low'
  },
  {
    id: 'eleven-point',
    name: 'Eleven Point River',
    waterType: 'River',
    ribbon: 'White/Blue Mix',
    lat: 36.7861,
    lng: -91.8186,
    access: 'Public access via riverways and forest lands.',
    solitude: 'high',
    confidence: 'low'
  },
  {
    id: 'north-fork-white',
    name: 'North Fork of the White River',
    waterType: 'River',
    ribbon: 'Red/Blue Mix',
    lat: 36.7699,
    lng: -92.5295,
    access: 'Public access with mixed regulations.',
    solitude: 'medium',
    confidence: 'low'
  }
];

window.FLY_REGULATIONS = [
  {
    id: 'mo-trout-stamp',
    title: 'Trout Permit Reminder',
    summary: 'A trout permit is required on designated Missouri trout waters, including certain tailwaters and trout parks. Verify current rules before fishing.',
    source: 'Missouri Department of Conservation (MDC): https://mdc.mo.gov/fishing'
  },
  {
    id: 'method-restrictions',
    title: 'Method Restrictions',
    summary: 'Some waters limit methods to flies and lures only. Soft plastics can be restricted on wild or trophy trout areas.',
    source: 'Check local regulations for the selected water.'
  },
  {
    id: 'harvest-limits',
    title: 'Harvest Limits',
    summary: 'Creel limits and size limits vary by ribbon class and park seasons. Always confirm on-site or with MDC resources.',
    source: 'Missouri Department of Conservation (MDC): https://mdc.mo.gov/fishing'
  }
];

window.FLY_WATER_SAFETY = [
  {
    id: 'tailwater',
    title: 'Tailwater Safety',
    summary: 'Tailwaters can rise quickly when generation starts. Check flow releases before wading and keep a rapid-exit plan.',
    source: 'USGS + dam release schedules.'
  }
];

// Staged Missouri trout source files (stored for future ingestion).
window.FLY_TROUT_DATA_FILES = [
  'data/trout/missouri_trout_full.json',
  'data/trout/missouri_trout_full (1).json',
  'data/trout/missouri_trout_data.json',
  'data/trout/missouri_trout_data (1).json',
  'data/trout/missouri_trout_full_text.txt',
  'data/trout/missouri_trout_full_text (1).txt',
  'data/trout/missouri_trout_full_text (2).txt',
  'data/trout/missouri_trout_full_text (3).txt',
  'data/trout/missouri_trout_full_text (4).txt',
  'data/trout/missouri_trout_full_text (5).txt',
  'data/trout/missouri_trout_full_text (6).txt',
  'data/trout/missouri_trout_full_text (7).txt',
  'data/trout/missouri_trout_full_text (8).txt',
  'data/trout/missouri_trout_full_text (9).txt',
  'data/trout/missouri_trout_full_text (10).txt'
];

// Normalized trout repo manifest for future module ingestion.
window.FLY_TROUT_REPO_MANIFEST = 'data/trout-repo/manifest.json';
window.FLY_TROUT_INDEX_PATH = 'data/trout-repo/normalized/trout-index.json';
