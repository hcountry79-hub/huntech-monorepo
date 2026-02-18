// ═══════════════════════════════════════════════════════════════════════
// HUNTECH — GPS Track Recording & GPX Export Module
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const STORAGE_KEY = 'huntech_recorded_tracks_v1';
  const ACTIVE_KEY  = 'huntech_active_track_v1';
  const MIN_POINT_DISTANCE_M = 5;   // ignore GPS jitter < 5m
  const MIN_POINT_INTERVAL_MS = 2000; // max 1 point every 2s

  // ── State ───────────────────────────────────────────────────────────
  let recording = false;
  let paused = false;
  let currentTrack = null; // { id, name, startedAt, points:[], distanceM, elapsedMs }
  let trackPolyline = null;
  let lastRecordedPoint = null;
  let lastRecordedAt = 0;
  let trackStartTime = 0;
  let trackPausedTime = 0;
  let pauseStartedAt = 0;
  let trackWatchId = null;

  // ── Helpers ─────────────────────────────────────────────────────────
  function _haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function _formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  }

  function _formatDistance(meters) {
    if (meters >= 1609.34) return (meters / 1609.34).toFixed(2) + ' mi';
    if (meters >= 100) return Math.round(meters) + ' m';
    return meters.toFixed(1) + ' m';
  }

  // ── Track Persistence ───────────────────────────────────────────────
  function _loadTracks() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function _saveTracks(tracks) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks)); }
    catch (e) { if (window.htLog) htLog.error('Track save failed', e.message); }
  }

  function _saveActiveTrack() {
    if (!currentTrack) {
      localStorage.removeItem(ACTIVE_KEY);
      return;
    }
    try {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify({
        track: currentTrack,
        paused: paused,
        trackStartTime: trackStartTime,
        trackPausedTime: trackPausedTime,
      }));
    } catch { /* quota */ }
  }

  function _restoreActiveTrack() {
    try {
      const data = JSON.parse(localStorage.getItem(ACTIVE_KEY));
      if (data && data.track && data.track.points?.length) {
        currentTrack = data.track;
        paused = true; // Always resume paused
        trackStartTime = data.trackStartTime || Date.now();
        trackPausedTime = data.trackPausedTime || 0;
        recording = true;
        pauseStartedAt = Date.now();
        _drawTrackOnMap();
        if (window.htLog) htLog.info('Restored active track', { points: currentTrack.points.length });
        return true;
      }
    } catch { /* no active track */ }
    return false;
  }

  // ── Recording Logic ─────────────────────────────────────────────────
  function _onPosition(pos) {
    if (!recording || paused) return;

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const ele = pos.coords.altitude || null;
    const acc = pos.coords.accuracy || null;
    const now = Date.now();

    // Filter jitter
    if (lastRecordedPoint) {
      const dist = _haversine(lastRecordedPoint.lat, lastRecordedPoint.lon, lat, lon);
      if (dist < MIN_POINT_DISTANCE_M) return;
      if (now - lastRecordedAt < MIN_POINT_INTERVAL_MS) return;
      currentTrack.distanceM += dist;
    }

    const point = { lat, lon, ele, acc, t: now };
    currentTrack.points.push(point);
    lastRecordedPoint = point;
    lastRecordedAt = now;

    // Update polyline on map
    if (trackPolyline && typeof map !== 'undefined' && map) {
      trackPolyline.addLatLng([lat, lon]);
    }

    // Periodic save (every 30 points)
    if (currentTrack.points.length % 30 === 0) {
      _saveActiveTrack();
    }

    // Update UI
    _updateTrackingUI();
  }

  function _onPositionError(err) {
    if (window.htLog) htLog.warn('Track GPS error', { code: err.code, msg: err.message });
  }

  function _drawTrackOnMap() {
    if (typeof map === 'undefined' || !map || !currentTrack?.points?.length) return;
    const latlngs = currentTrack.points.map(p => [p.lat, p.lon]);

    if (trackPolyline) {
      try { map.removeLayer(trackPolyline); } catch {}
    }

    trackPolyline = L.polyline(latlngs, {
      color: '#ffd400',
      weight: 4,
      opacity: 0.85,
      dashArray: '8 4',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
  }

  function _updateTrackingUI() {
    const el = document.getElementById('htTrackStatus');
    if (!el || !currentTrack) return;

    const elapsed = paused
      ? trackPausedTime
      : (Date.now() - trackStartTime - trackPausedTime);

    el.innerHTML = `
      <span class="ht-track-stat">${_formatDistance(currentTrack.distanceM)}</span>
      <span class="ht-track-stat">${_formatDuration(elapsed)}</span>
      <span class="ht-track-stat">${currentTrack.points.length} pts</span>
    `;
  }

  // ── Public API ──────────────────────────────────────────────────────

  /** Start recording a new track. */
  function startTrack(name) {
    if (recording) return;
    if (!navigator.geolocation) {
      if (typeof showNotice === 'function') showNotice('GPS not available.', 'error', 3000);
      return;
    }

    currentTrack = {
      id: _generateId(),
      name: name || `Track ${new Date().toLocaleDateString()}`,
      startedAt: new Date().toISOString(),
      points: [],
      distanceM: 0,
    };
    recording = true;
    paused = false;
    trackStartTime = Date.now();
    trackPausedTime = 0;
    lastRecordedPoint = null;
    lastRecordedAt = 0;

    trackWatchId = navigator.geolocation.watchPosition(_onPosition, _onPositionError, {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 15000,
    });

    _saveActiveTrack();
    _showTrackingPanel();
    if (typeof showNotice === 'function') showNotice('Track recording started.', 'success', 2500);
    if (window.htLog) htLog.info('Track started', { id: currentTrack.id });
  }

  /** Pause recording. */
  function pauseTrack() {
    if (!recording || paused) return;
    paused = true;
    pauseStartedAt = Date.now();
    _saveActiveTrack();
    _showTrackingPanel();
    if (typeof showNotice === 'function') showNotice('Track paused.', 'info', 2000);
  }

  /** Resume recording. */
  function resumeTrack() {
    if (!recording || !paused) return;
    trackPausedTime += Date.now() - pauseStartedAt;
    paused = false;
    _saveActiveTrack();
    _showTrackingPanel();
    if (typeof showNotice === 'function') showNotice('Track resumed.', 'success', 2000);
  }

  /** Stop recording and save. */
  function stopTrack() {
    if (!recording) return;

    if (trackWatchId !== null) {
      navigator.geolocation.clearWatch(trackWatchId);
      trackWatchId = null;
    }

    const elapsed = paused
      ? trackPausedTime
      : (Date.now() - trackStartTime - trackPausedTime);
    currentTrack.elapsedMs = elapsed;
    currentTrack.endedAt = new Date().toISOString();

    // Save to library
    const tracks = _loadTracks();
    tracks.push(currentTrack);
    _saveTracks(tracks);

    if (typeof showNotice === 'function') {
      showNotice(`Track saved: ${_formatDistance(currentTrack.distanceM)} / ${_formatDuration(elapsed)}`, 'success', 4000);
    }
    if (window.htLog) htLog.info('Track saved', {
      id: currentTrack.id,
      points: currentTrack.points.length,
      distance: currentTrack.distanceM,
    });

    recording = false;
    paused = false;
    currentTrack = null;
    localStorage.removeItem(ACTIVE_KEY);
    _hideTrackingPanel();
  }

  /** Discard current track without saving. */
  function discardTrack() {
    if (!recording) return;

    if (trackWatchId !== null) {
      navigator.geolocation.clearWatch(trackWatchId);
      trackWatchId = null;
    }

    recording = false;
    paused = false;
    currentTrack = null;
    localStorage.removeItem(ACTIVE_KEY);

    if (trackPolyline && typeof map !== 'undefined' && map) {
      try { map.removeLayer(trackPolyline); } catch {}
      trackPolyline = null;
    }

    _hideTrackingPanel();
    if (typeof showNotice === 'function') showNotice('Track discarded.', 'info', 2500);
  }

  // ── GPX Export ──────────────────────────────────────────────────────

  /** Export a track to GPX format and trigger download. */
  function exportTrackGPX(trackId) {
    const tracks = _loadTracks();
    const track = trackId
      ? tracks.find(t => t.id === trackId)
      : tracks[tracks.length - 1]; // latest

    if (!track || !track.points?.length) {
      if (typeof showNotice === 'function') showNotice('No track data to export.', 'warning', 3000);
      return;
    }

    const name = track.name || 'HUNTECH Track';
    const pts = track.points.map(p => {
      let trkpt = `      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}">`;
      if (p.ele != null) trkpt += `\n        <ele>${p.ele.toFixed(1)}</ele>`;
      if (p.t) trkpt += `\n        <time>${new Date(p.t).toISOString()}</time>`;
      trkpt += '\n      </trkpt>';
      return trkpt;
    }).join('\n');

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="HUNTECH Field Command"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${name}</name>
    <time>${track.startedAt || new Date().toISOString()}</time>
    <desc>Recorded with HUNTECH Field Command System</desc>
  </metadata>
  <trk>
    <name>${name}</name>
    <trkseg>
${pts}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.gpx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);

    if (typeof showNotice === 'function') showNotice('GPX exported.', 'success', 2500);
    if (window.htLog) htLog.info('GPX exported', { id: track.id, points: track.points.length });
  }

  /** Get all saved tracks. */
  function getTrackList() {
    return _loadTracks().map(t => ({
      id: t.id,
      name: t.name,
      startedAt: t.startedAt,
      endedAt: t.endedAt,
      distance: _formatDistance(t.distanceM || 0),
      duration: _formatDuration(t.elapsedMs || 0),
      points: t.points?.length || 0,
    }));
  }

  /** Delete a saved track. */
  function deleteTrack(trackId) {
    let tracks = _loadTracks();
    tracks = tracks.filter(t => t.id !== trackId);
    _saveTracks(tracks);
    if (typeof showNotice === 'function') showNotice('Track deleted.', 'info', 2000);
  }

  /** Show a saved track on the map. */
  function showTrackOnMap(trackId) {
    const tracks = _loadTracks();
    const track = tracks.find(t => t.id === trackId);
    if (!track?.points?.length || typeof map === 'undefined' || !map) return;

    const latlngs = track.points.map(p => [p.lat, p.lon]);
    const line = L.polyline(latlngs, {
      color: '#ffd400',
      weight: 3,
      opacity: 0.75,
      dashArray: '6 4',
    }).addTo(map);

    map.fitBounds(line.getBounds(), { padding: [40, 40] });
    if (typeof showNotice === 'function') {
      showNotice(`Showing: ${track.name} (${_formatDistance(track.distanceM || 0)})`, 'info', 3000);
    }
    return line;
  }

  // ── Tracking Panel UI ───────────────────────────────────────────────
  function _showTrackingPanel() {
    let panel = document.getElementById('htTrackPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'htTrackPanel';
      panel.className = 'ht-track-panel';
      document.body.appendChild(panel);
    }

    const isPaused = paused;
    panel.innerHTML = `
      <div class="ht-track-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4444"><circle cx="12" cy="12" r="8"/></svg>
        <span class="ht-track-title">${isPaused ? 'PAUSED' : 'RECORDING'}</span>
      </div>
      <div id="htTrackStatus" class="ht-track-stats"></div>
      <div class="ht-track-actions">
        ${isPaused
          ? '<button class="ht-track-btn ht-track-btn-resume" onclick="window.htTrack.resume()">RESUME</button>'
          : '<button class="ht-track-btn ht-track-btn-pause" onclick="window.htTrack.pause()">PAUSE</button>'
        }
        <button class="ht-track-btn ht-track-btn-stop" onclick="window.htTrack.stop()">STOP & SAVE</button>
        <button class="ht-track-btn ht-track-btn-discard" onclick="if(confirm('Discard track?')) window.htTrack.discard()">✕</button>
      </div>
    `;
    panel.style.display = 'block';
    _updateTrackingUI();
  }

  function _hideTrackingPanel() {
    const panel = document.getElementById('htTrackPanel');
    if (panel) panel.style.display = 'none';
  }

  // ── Expose API ──────────────────────────────────────────────────────
  window.htTrack = {
    start: startTrack,
    pause: pauseTrack,
    resume: resumeTrack,
    stop: stopTrack,
    discard: discardTrack,
    export: exportTrackGPX,
    list: getTrackList,
    delete: deleteTrack,
    show: showTrackOnMap,
    isRecording: () => recording,
    isPaused: () => paused,
  };

  // Auto-restore active track on page load
  if (document.readyState === 'complete') {
    _restoreActiveTrack();
  } else {
    window.addEventListener('load', () => setTimeout(_restoreActiveTrack, 500));
  }

  if (window.htLog) htLog.info('Track recording module loaded');

})();
