/* Huntech MapLibre Preview: Smooth rotation + basic geolocation */
(function(){
  window.HUNTECH_BUILD = '20260215b';
  try { console.log('HUNTECH BUILD 20260215b (maplibre)'); } catch (e) {}
  const satelliteStyle = {
    version: 8,
    sources: {
      esri: {
        type: 'raster',
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Tiles © Esri'
      },
      lidar: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Hillshade © Esri'
      },
      topo: {
        type: 'raster',
        tiles: ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'USGS National Map'
      }
    },
    layers: [
      { id: 'base-satellite', type: 'raster', source: 'esri', layout: { visibility: 'visible' } },
      { id: 'base-lidar', type: 'raster', source: 'lidar', layout: { visibility: 'none' } },
      { id: 'base-topo', type: 'raster', source: 'topo', layout: { visibility: 'none' } }
    ]
  };

  const fallbackStyle = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      { id: 'osm', type: 'raster', source: 'osm' }
    ]
  };

  const parseCenter = (value) => {
    if (!value) return null;
    const parts = String(value).split(',').map((p) => Number(p.trim()));
    if (parts.length < 2) return null;
    const a = parts[0];
    const b = parts[1];
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    // Accept either "lat,lng" or "lng,lat".
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return [b, a];
    if (Math.abs(a) <= 180 && Math.abs(b) <= 90) return [a, b];
    return null;
  };

  const defaultCenter = parseCenter(window.HUNTECH_MAPLIBRE_CENTER) || [-93.5, 38.5];
  const defaultZoom = Number.isFinite(Number(window.HUNTECH_MAPLIBRE_ZOOM))
    ? Number(window.HUNTECH_MAPLIBRE_ZOOM)
    : 6.5;
  const geoZoom = Number.isFinite(Number(window.HUNTECH_MAPLIBRE_GEO_ZOOM))
    ? Number(window.HUNTECH_MAPLIBRE_GEO_ZOOM)
    : 14;

  const map = new maplibregl.Map({
    container: 'map',
    style: satelliteStyle,
    center: defaultCenter,
    zoom: defaultZoom,
    pitch: 0,
    bearing: 0,
    attributionControl: true
  });

  const statusEl = document.getElementById('status');
  const lockBtn = document.getElementById('lockBtn');
  const locateBtn = document.getElementById('locateBtn');

  let headingUp = false; // false = NORTH UP, true = HEADING UP
  let lastHeadingDeg = null;
  let windValueEl = null;
  let windPillEl = null;
  let layerPillEl = null;
  let layerPanelEl = null;
  let lastWindLat = null;
  let lastWindLng = null;
  let drawMode = null;
  let drawPoints = [];
  let drawCenter = null;
  let drawActive = false;
  let drawDragActive = false;
  let drawDragStart = null;
  let drawDragLast = null;
  let routeStart = null;
  let routeEnd = null;
  let geoWatchId = null;
  let currentAreaFeature = null;
  let pinsData = { type: 'FeatureCollection', features: [] };
  const SAVED_AREAS_KEY = 'huntech_saved_hunt_areas_v1';
  const JOURNAL_KEY = 'huntech_hunt_journal_v1';
  let initialGeoCentered = false;
  let lastTouchAt = 0;
  let handlersBound = false;
  const locateUser = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos?.coords?.latitude);
        const lng = Number(pos?.coords?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const zoom = initialGeoCentered ? map.getZoom() : geoZoom;
        initialGeoCentered = true;
        map.easeTo({ center: [lng, lat], zoom, duration: 900 });
        updateWind(lat, lng);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );
  };

  // Expose for UI bridge
  window.htLocate = locateUser;

  function setLockUI(){
    if (!lockBtn) return;
    lockBtn.textContent = headingUp ? 'HEADING UP' : 'NORTH UP';
    lockBtn.setAttribute('aria-pressed', headingUp ? 'false' : 'true');
  }

  function setStatus(text){
    if (statusEl) statusEl.textContent = text;
  }

  function normalizeHeading(deg){
    if (!Number.isFinite(deg)) return null;
    let d = deg % 360; if (d < 0) d += 360; return d;
  }

  function applyBearingFromHeading(deg){
    const h = normalizeHeading(deg);
    if (!Number.isFinite(h)) return;
    // Smooth rotate for better feel
    map.rotateTo(h, { duration: 180 });
  }

  // Device orientation → heading
  function onDeviceOrientation(event){
    let heading = null;
    if (Number.isFinite(event?.webkitCompassHeading)) {
      heading = event.webkitCompassHeading;
    } else if (Number.isFinite(event?.alpha)) {
      const screenAngle = Number.isFinite(window?.screen?.orientation?.angle)
        ? window.screen.orientation.angle
        : (Number.isFinite(window.orientation) ? window.orientation : 0);
      heading = (360 - event.alpha + screenAngle) % 360;
    }
    lastHeadingDeg = heading;
    setStatus(`Heading: ${Number.isFinite(heading) ? Math.round(heading) : '--'}`);
    if (headingUp && Number.isFinite(heading)) {
      applyBearingFromHeading(heading);
    }
  }

  // UI wiring
  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      headingUp = !headingUp;
      setLockUI();
      if (!headingUp) {
        map.rotateTo(0, { duration: 160 });
      } else if (Number.isFinite(lastHeadingDeg)) {
        applyBearingFromHeading(lastHeadingDeg);
      }
    });
  }

  if (locateBtn) {
    locateBtn.addEventListener('click', () => {
      locateUser();
    });
  }

  // Start orientation watch
  if (window.DeviceOrientationEvent) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then((state) => {
        if (state === 'granted') {
          window.addEventListener('deviceorientation', onDeviceOrientation, true);
        }
      }).catch(() => {});
    } else {
      window.addEventListener('deviceorientation', onDeviceOrientation, true);
    }
  }

  // Fallback style if the remote style fails or stalls
  let loaded = false;
  const initializeRuntime = () => {
    try { map.resize(); } catch {}
    setupLayerPills();
    ensureDrawLayers();
    if (!handlersBound) {
      bindMapDrawHandlers();
      handlersBound = true;
    }
    startGeoWatch();
  };

  map.on('load', () => {
    loaded = true;
    locateUser();
    initializeRuntime();
  });
  map.on('styledata', () => {
    initializeRuntime();
  });
  map.on('error', (e) => {
    try {
      if (!loaded) {
        map.setStyle(fallbackStyle);
      }
    } catch {}
  });
  setTimeout(() => {
    try {
      if (!loaded) {
        map.setStyle(fallbackStyle);
      }
    } catch {}
  }, 3500);

  setTimeout(() => {
    initializeRuntime();
  }, 1500);

  setLockUI();
  setStatus('Heading: --');
  window.htMap = map;
  window.drawHuntArea = () => startDraw('polygon');
  window.selectLocationRadius = () => startDraw('radius');
  window.selectLocationRectangle = () => startDraw('rect');
  window.beginRouteMapSelection = () => startDraw('route');
  window.startRouteFromMyLocation = () => startRouteFromLocation();
  window.letsGoFollowRoute = () => followRoute();
  window.logPinOnMap = () => dropPinAtCenter();
  window.startOver = () => clearAllDrawings();
  window.centerOnMyLocation = () => locateUser();
  window.loadSavedSelectionFromTray = () => loadSavedSelectionFromTray();
  window.deleteSelectedSavedHunt = () => deleteSelectedSavedHunt();
  window.clearAllSavedHuntsAndAreas = () => clearAllSavedHuntsAndAreas();
  window.logSignVoice = () => logSignVoice();
  window.showMissionSummary = () => showMissionSummary();

  function setupLayerPills() {
    const mapContainer = map.getContainer();
    if (!mapContainer) return;
    let stack = mapContainer.querySelector('.ht-map-layer-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'ht-map-layer-stack ht-map-layer-stack--maplibre';
      mapContainer.appendChild(stack);
    }

    windPillEl = stack.querySelector('.ht-map-wind-pill');
    if (!windPillEl) {
      windPillEl = document.createElement('div');
      windPillEl.className = 'ht-map-wind-pill';
      windPillEl.innerHTML = '<span class="ht-map-wind-label">Wind</span><span class="ht-map-wind-value">--</span>';
      stack.appendChild(windPillEl);
    }
    windValueEl = windPillEl.querySelector('.ht-map-wind-value');
    if (Number.isFinite(lastWindLat) && Number.isFinite(lastWindLng)) {
      updateWind(lastWindLat, lastWindLng);
    }

    layerPillEl = stack.querySelector('.ht-map-layer-pill');
    if (!layerPillEl) {
      layerPillEl = document.createElement('button');
      layerPillEl.type = 'button';
      layerPillEl.className = 'ht-map-layer-pill';
      layerPillEl.textContent = 'Layers';
      stack.appendChild(layerPillEl);
    }

    layerPanelEl = stack.querySelector('.ht-map-layer-panel');
    if (!layerPanelEl) {
      layerPanelEl = document.createElement('div');
      layerPanelEl.className = 'ht-map-layer-panel';
      layerPanelEl.innerHTML = [
        '<button class="ht-map-layer-option" data-layer="satellite">HD Satellite</button>',
        '<button class="ht-map-layer-option" data-layer="lidar">HD Lidar</button>',
        '<button class="ht-map-layer-option" data-layer="topo">USGS Topo</button>'
      ].join('');
      stack.appendChild(layerPanelEl);
    }

    const stored = (localStorage.getItem('huntech_maplibre_base') || '').trim();
    const initial = stored || 'satellite';
    setBaseLayer(initial);

    layerPillEl.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = layerPanelEl.classList.toggle('is-open');
      layerPillEl.classList.toggle('is-open', isOpen);
    });

    layerPanelEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.ht-map-layer-option');
      if (!btn) return;
      const layer = btn.getAttribute('data-layer');
      if (!layer) return;
      setBaseLayer(layer);
    });

    document.addEventListener('click', (e) => {
      if (!layerPanelEl.contains(e.target) && e.target !== layerPillEl) {
        layerPanelEl.classList.remove('is-open');
        layerPillEl.classList.remove('is-open');
      }
    });
  }

  function setBaseLayer(name) {
    const layers = {
      satellite: 'base-satellite',
      lidar: 'base-lidar',
      topo: 'base-topo'
    };
    Object.keys(layers).forEach((key) => {
      const layerId = layers[key];
      const visibility = key === name ? 'visible' : 'none';
      try { map.setLayoutProperty(layerId, 'visibility', visibility); } catch {}
    });
    if (layerPanelEl) {
      layerPanelEl.querySelectorAll('.ht-map-layer-option').forEach((btn) => {
        const isActive = btn.getAttribute('data-layer') === name;
        btn.classList.toggle('is-active', isActive);
      });
    }
    try { localStorage.setItem('huntech_maplibre_base', name); } catch {}
  }

  function updateWind(lat, lng) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    lastWindLat = lat;
    lastWindLng = lng;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph`;
    fetch(url)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const speed = data?.current?.wind_speed_10m;
        const dir = data?.current?.wind_direction_10m;
        if (!Number.isFinite(speed) || !Number.isFinite(dir)) return;
        const dirLabel = degToCompass(dir);
        if (windValueEl) windValueEl.textContent = `${Math.round(speed)} mph ${dirLabel}`;
      })
      .catch(() => {});
  }

  function degToCompass(deg) {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const idx = Math.round(((deg % 360) / 22.5)) % 16;
    return dirs[idx] || 'N';
  }

  function startGeoWatch() {
    if (!navigator.geolocation || geoWatchId !== null) return;
    geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Number(pos?.coords?.latitude);
        const lng = Number(pos?.coords?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        updateWind(lat, lng);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  function ensureDrawLayers() {
    if (!map) return;
    if (!map.getSource('huntech-draw')) {
      map.addSource('huntech-draw', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.addLayer({
        id: 'huntech-draw-fill',
        type: 'fill',
        source: 'huntech-draw',
        paint: { 'fill-color': '#ffc107', 'fill-opacity': 0.15 }
      });
      map.addLayer({
        id: 'huntech-draw-line',
        type: 'line',
        source: 'huntech-draw',
        paint: { 'line-color': '#ffc107', 'line-width': 2 }
      });
    }
    if (!map.getSource('huntech-draw-line')) {
      map.addSource('huntech-draw-line', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.addLayer({
        id: 'huntech-draw-line-preview',
        type: 'line',
        source: 'huntech-draw-line',
        paint: { 'line-color': '#ffd86b', 'line-width': 2, 'line-dasharray': [1.5, 1.2] }
      });
    }
    if (!map.getSource('huntech-route')) {
      map.addSource('huntech-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.addLayer({
        id: 'huntech-route-line',
        type: 'line',
        source: 'huntech-route',
        paint: { 'line-color': '#00ff88', 'line-width': 3 }
      });
    }
    if (!map.getSource('huntech-route-pins')) {
      map.addSource('huntech-route-pins', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.addLayer({
        id: 'huntech-route-pins-circle',
        type: 'circle',
        source: 'huntech-route-pins',
        paint: { 'circle-radius': 6, 'circle-color': '#00ff88', 'circle-stroke-color': '#0a0a0a', 'circle-stroke-width': 2 }
      });
    }
    if (!map.getSource('huntech-pins')) {
      map.addSource('huntech-pins', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.addLayer({
        id: 'huntech-pins-circle',
        type: 'circle',
        source: 'huntech-pins',
        paint: { 'circle-radius': 5, 'circle-color': '#ffc107', 'circle-stroke-color': '#0a0a0a', 'circle-stroke-width': 2 }
      });
    }
  }

  function bindMapDrawHandlers() {
    if (!map) return;
    const handleTap = (lngLat) => {
      if (!drawMode || !drawActive) return;
      if (drawMode === 'polygon') {
        if (drawPoints.length >= 3 && isNearPoint(lngLat, drawPoints[0], 18)) {
          setDrawFeature({ type: 'Polygon', coordinates: [[...drawPoints, drawPoints[0]]] });
          stopDraw();
          return;
        }
        drawPoints.push(lngLat);
        updateDrawPreview();
      } else if (drawMode === 'radius') {
        if (!drawCenter) {
          drawCenter = lngLat;
          drawDragStart = lngLat;
          drawDragLast = lngLat;
          drawDragActive = true;
          if (map.dragPan && map.dragPan.isEnabled()) map.dragPan.disable();
          setDrawFeature(buildCircle(drawCenter, lngLat));
        } else if (drawDragActive) {
          const edge = drawDragLast || lngLat;
          setDrawFeature(buildCircle(drawCenter, edge));
          stopDraw();
        }
      } else if (drawMode === 'rect') {
        if (!drawCenter) {
          drawCenter = lngLat;
          drawDragStart = lngLat;
          drawDragLast = lngLat;
          drawDragActive = true;
          if (map.dragPan && map.dragPan.isEnabled()) map.dragPan.disable();
          setDrawFeature(buildRectangle(drawCenter, lngLat));
        } else if (drawDragActive) {
          const edge = drawDragLast || lngLat;
          setDrawFeature(buildRectangle(drawCenter, edge));
          stopDraw();
        }
      } else if (drawMode === 'route') {
        if (!routeStart) {
          routeStart = lngLat;
          updateRoute();
          updateRouteStatus();
        } else if (!routeEnd) {
          routeEnd = lngLat;
          updateRoute();
          updateRouteStatus();
          stopDraw();
        }
      }
    };

    map.on('click', (e) => {
      const now = Date.now();
      if (now - lastTouchAt < 450) return;
      handleTap([e.lngLat.lng, e.lngLat.lat]);
    });

    map.on('mousemove', (e) => {
      if (!drawDragActive || (drawMode !== 'rect' && drawMode !== 'radius')) return;
      drawDragLast = [e.lngLat.lng, e.lngLat.lat];
      if (drawMode === 'rect') {
        setDrawFeature(buildRectangle(drawDragStart, drawDragLast));
      } else if (drawMode === 'radius') {
        setDrawFeature(buildCircle(drawDragStart, drawDragLast));
      }
    });

    const canvas = map.getCanvas();
    if (canvas) {
      canvas.addEventListener('touchmove', (event) => {
        if (!drawDragActive || !event.touches || event.touches.length !== 1) return;
        const t = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const point = [t.clientX - rect.left, t.clientY - rect.top];
        const lngLat = map.unproject(point);
        drawDragLast = [lngLat.lng, lngLat.lat];
        if (drawMode === 'rect') {
          setDrawFeature(buildRectangle(drawDragStart, drawDragLast));
        } else if (drawMode === 'radius') {
          setDrawFeature(buildCircle(drawDragStart, drawDragLast));
        }
      }, { passive: true });

      canvas.addEventListener('touchend', (event) => {
        if (!event.changedTouches || !event.changedTouches.length) return;
        lastTouchAt = Date.now();
        const t = event.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const point = [t.clientX - rect.left, t.clientY - rect.top];
        const lngLat = map.unproject(point);
        handleTap([lngLat.lng, lngLat.lat]);
      }, { passive: true });
    }

    map.on('dblclick', (e) => {
      if (drawMode !== 'polygon' || !drawActive) return;
      e.preventDefault();
      if (drawPoints.length >= 3) {
        setDrawFeature({ type: 'Polygon', coordinates: [[...drawPoints, drawPoints[0]]] });
      }
      stopDraw();
    });
  }

  function startDraw(mode) {
    drawMode = mode;
    drawPoints = [];
    drawCenter = null;
    drawActive = true;
    if (mode === 'route') {
      routeStart = null;
      routeEnd = null;
      updateRoute();
      updateRouteStatus();
    }
  }

  function stopDraw() {
    drawActive = false;
    drawDragActive = false;
    drawDragStart = null;
    drawDragLast = null;
    if (map.dragPan && !map.dragPan.isEnabled()) map.dragPan.enable();
    clearPreviewLine();
  }

  function updateDrawPreview() {
    if (!map || drawPoints.length === 0) return;
    const coords = [...drawPoints];
    setPreviewLine({ type: 'LineString', coordinates: coords });
  }

  function setDrawFeature(geometry) {
    const feature = geometry ? [{ type: 'Feature', properties: {}, geometry }] : [];
    const data = { type: 'FeatureCollection', features: feature };
    const src = map.getSource('huntech-draw');
    if (src && src.setData) src.setData(data);
    currentAreaFeature = feature.length ? feature[0] : null;
  }

  function setPreviewLine(geometry) {
    const feature = geometry ? [{ type: 'Feature', properties: {}, geometry }] : [];
    const data = { type: 'FeatureCollection', features: feature };
    const src = map.getSource('huntech-draw-line');
    if (src && src.setData) src.setData(data);
  }

  function clearPreviewLine() {
    setPreviewLine(null);
  }

  function buildRectangle(a, b) {
    const minLng = Math.min(a[0], b[0]);
    const maxLng = Math.max(a[0], b[0]);
    const minLat = Math.min(a[1], b[1]);
    const maxLat = Math.max(a[1], b[1]);
    return { type: 'Polygon', coordinates: [[[minLng, minLat], [maxLng, minLat], [maxLng, maxLat], [minLng, maxLat], [minLng, minLat]]] };
  }

  function buildCircle(center, edge) {
    const steps = 64;
    const lat = center[1];
    const lng = center[0];
    const distM = distanceMeters(center, edge);
    const coords = [];
    const latRad = lat * Math.PI / 180;
    const mPerDegLat = 111320;
    const mPerDegLng = Math.cos(latRad) * 111320;
    for (let i = 0; i <= steps; i += 1) {
      const angle = (i / steps) * Math.PI * 2;
      const dx = Math.cos(angle) * distM;
      const dy = Math.sin(angle) * distM;
      coords.push([lng + dx / mPerDegLng, lat + dy / mPerDegLat]);
    }
    return { type: 'Polygon', coordinates: [coords] };
  }

  function distanceMeters(a, b) {
    const toRad = (v) => v * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function isNearPoint(a, b, meters) {
    if (!a || !b) return false;
    return distanceMeters(a, b) <= meters;
  }

  function updateRoute() {
    const features = [];
    if (routeStart && routeEnd) {
      features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [routeStart, routeEnd] } });
    }
    const routeSrc = map.getSource('huntech-route');
    if (routeSrc && routeSrc.setData) {
      routeSrc.setData({ type: 'FeatureCollection', features });
    }
    const pins = [];
    if (routeStart) pins.push({ type: 'Feature', properties: { role: 'start' }, geometry: { type: 'Point', coordinates: routeStart } });
    if (routeEnd) pins.push({ type: 'Feature', properties: { role: 'end' }, geometry: { type: 'Point', coordinates: routeEnd } });
    const pinSrc = map.getSource('huntech-route-pins');
    if (pinSrc && pinSrc.setData) {
      pinSrc.setData({ type: 'FeatureCollection', features: pins });
    }
  }

  function updateRouteStatus() {
    const el = document.getElementById('routePinStatus');
    if (!el) return;
    const startLabel = routeStart ? 'Start set' : 'Start --';
    const endLabel = routeEnd ? 'End set' : 'Loop back';
    el.textContent = `${startLabel} • ${endLabel}`;
  }

  function startRouteFromLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos?.coords?.latitude);
        const lng = Number(pos?.coords?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        routeStart = [lng, lat];
        updateRoute();
        updateRouteStatus();
        map.easeTo({ center: [lng, lat], zoom: geoZoom, duration: 800 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );
  }

  function followRoute() {
    if (!routeStart || !routeEnd) return;
    const bounds = [routeStart, routeEnd].reduce((b, c) => [
      [Math.min(b[0][0], c[0]), Math.min(b[0][1], c[1])],
      [Math.max(b[1][0], c[0]), Math.max(b[1][1], c[1])]
    ], [[routeStart[0], routeStart[1]], [routeStart[0], routeStart[1]]]);
    map.fitBounds(bounds, { padding: 80, duration: 800 });
  }

  function dropPinAtCenter() {
    const center = map.getCenter();
    if (!center) return;
    const src = map.getSource('huntech-pins');
    if (!src || !src.setData) return;
    pinsData.features.push({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [center.lng, center.lat] } });
    src.setData(pinsData);
  }

  function clearAllDrawings() {
    setDrawFeature(null);
    clearPreviewLine();
    routeStart = null;
    routeEnd = null;
    updateRoute();
    updateRouteStatus();
    const pinSrc = map.getSource('huntech-pins');
    if (pinSrc && pinSrc.setData) {
      pinsData = { type: 'FeatureCollection', features: [] };
      pinSrc.setData(pinsData);
    }
  }

  function getSavedAreas() {
    try {
      const raw = localStorage.getItem(SAVED_AREAS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setSavedAreas(list) {
    try {
      localStorage.setItem(SAVED_AREAS_KEY, JSON.stringify(list));
    } catch {}
    renderSavedAreas(list);
  }

  function renderSavedAreas(list = getSavedAreas()) {
    const select = document.getElementById('savedPropertySelect');
    if (!select) return;
    select.innerHTML = '<option value="">Select hunt</option>';
    list.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name || 'Saved Hunt';
      select.appendChild(opt);
    });
  }

  function loadSavedSelectionFromTray() {
    const select = document.getElementById('savedPropertySelect');
    if (!select) return;
    const id = select.value;
    if (!id) return;
    const list = getSavedAreas();
    const match = list.find((item) => item.id === id);
    if (!match || !match.geometry) return;
    setDrawFeature(match.geometry);
    fitGeometry(match.geometry);
  }

  function deleteSelectedSavedHunt() {
    const select = document.getElementById('savedPropertySelect');
    if (!select) return;
    const id = select.value;
    if (!id) return;
    const list = getSavedAreas().filter((item) => item.id !== id);
    setSavedAreas(list);
  }

  function clearAllSavedHuntsAndAreas() {
    setSavedAreas([]);
    clearAllDrawings();
  }

  function logSignVoice() {
    const note = prompt('Log sign (note)');
    if (note === null) return;
    const center = map.getCenter();
    if (!center) return;
    dropPinAtCenter();
    try {
      const raw = localStorage.getItem(JOURNAL_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        id: `sign_${Date.now()}`,
        note: String(note || ''),
        lat: center.lat,
        lng: center.lng,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(list));
    } catch {}
  }

  function showMissionSummary() {
    const hunts = getSavedAreas().length;
    const pins = pinsData.features.length;
    alert(`Saved hunts: ${hunts}\nPins: ${pins}`);
  }

  function fitGeometry(geometry) {
    if (!geometry) return;
    const coords = [];
    if (geometry.type === 'Polygon') {
      geometry.coordinates[0].forEach((c) => coords.push(c));
    } else if (geometry.type === 'LineString') {
      geometry.coordinates.forEach((c) => coords.push(c));
    } else if (geometry.type === 'Point') {
      coords.push(geometry.coordinates);
    }
    if (!coords.length) return;
    const bounds = coords.reduce((b, c) => [
      [Math.min(b[0][0], c[0]), Math.min(b[0][1], c[1])],
      [Math.max(b[1][0], c[0]), Math.max(b[1][1], c[1])]
    ], [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]);
    map.fitBounds(bounds, { padding: 80, duration: 700 });
  }
})();
