// ═══════════════════════════════════════════════════════════════════════
// HUNTECH — Cloud Sync & Authentication Module (ht-cloud.js)
// ═══════════════════════════════════════════════════════════════════════
// Client-side auth + data-sync layer.
//
// Phase 1 (this file): All logic runs client-side with localStorage.
//   - Auth UI scaffold (login modal, profile widget)
//   - Data export / import (JSON backup)
//   - Ready for Cognito + DynamoDB when the backend is provisioned
//
// Phase 2 (backend setup needed):
//   1. Create Cognito User Pool + App Client (Amplify Console → Auth)
//   2. Create DynamoDB table  huntech-user-data  (PK: userId, SK: dataKey)
//   3. Create API Gateway + Lambda (or AppSync) for CRUD
//   4. Set HUNTECH_CLOUD_* config vars below
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';
  if (window.htCloud) return;

  // ── Config (set in config.js or Amplify env vars) ───────────────────
  const CFG = {
    cognitoPoolId:   window.HUNTECH_CLOUD_COGNITO_POOL    || '',
    cognitoClientId: window.HUNTECH_CLOUD_COGNITO_CLIENT   || '',
    cognitoRegion:   window.HUNTECH_CLOUD_COGNITO_REGION   || 'us-east-1',
    apiEndpoint:     window.HUNTECH_CLOUD_API_ENDPOINT     || '',
    enabled:         false,  // flipped to true when cognitoPoolId is set
  };
  CFG.enabled = !!(CFG.cognitoPoolId && CFG.cognitoClientId && CFG.apiEndpoint);

  const LS_KEYS = {
    session: 'huntech_cloud_session_v1',
    profile: 'huntech_cloud_profile_v1',
    syncTs:  'huntech_cloud_last_sync_v1',
  };

  // ── Session State ───────────────────────────────────────────────────
  let _session = _loadSession();
  let _profile = _loadProfile();

  // ── Public API ──────────────────────────────────────────────────────
  window.htCloud = {
    /** Is the cloud backend configured? */
    get enabled()       { return CFG.enabled; },
    /** Is the user currently signed in? */
    get signedIn()      { return !!_session?.idToken; },
    /** Current user profile (or null) */
    get profile()       { return _profile; },
    /** Show the sign-in modal */
    showSignIn,
    /** Sign out */
    signOut,
    /** Export all local data as a JSON file */
    exportData,
    /** Import a JSON backup file */
    importData,
    /** Sync local → cloud (when backend is live) */
    syncToCloud,
    /** Sync cloud → local (when backend is live) */
    syncFromCloud,
    /** Get SW cache status */
    getCacheStatus,
    /** Clear cached map tiles */
    clearTileCache,
    /** Show cloud / account settings panel */
    showPanel,
  };

  // ── Sign-In Modal ──────────────────────────────────────────────────
  function showSignIn() {
    if (CFG.enabled) {
      // Redirect to Cognito Hosted UI
      _cognitoRedirect();
      return;
    }
    // No backend yet — show offline-mode dialog
    _showOfflineAuthModal();
  }

  function _showOfflineAuthModal() {
    // Remove existing
    document.getElementById('ht-cloud-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'ht-cloud-modal';
    modal.className = 'ht-cloud-modal';
    modal.innerHTML = `
      <div class="ht-cloud-card">
        <h3>Account & Cloud Sync</h3>
        <p style="color:#aaa;font-size:13px;margin:8px 0 16px">
          Cloud accounts are coming soon. For now your data is saved
          on-device. Use Export to back up your data.
        </p>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="ht-cloud-btn" onclick="htCloud.exportData();document.getElementById('ht-cloud-modal')?.remove()">
            ↓ Export Data Backup
          </button>
          <label class="ht-cloud-btn" style="text-align:center;cursor:pointer">
            ↑ Import Backup
            <input type="file" accept=".json" style="display:none"
              onchange="htCloud.importData(this.files[0]);document.getElementById('ht-cloud-modal')?.remove()">
          </label>
          <button class="ht-cloud-btn ht-cloud-btn--dim" id="ht-clear-tiles-btn"
            onclick="htCloud.clearTileCache()">
            Clear Cached Map Tiles
          </button>
        </div>
        <div id="ht-cache-status" style="color:#666;font-size:12px;margin-top:12px"></div>
        <button class="ht-cloud-close" onclick="document.getElementById('ht-cloud-modal')?.remove()">✕</button>
      </div>`;
    document.body.appendChild(modal);
    // Show cache status
    getCacheStatus().then(s => {
      const el = document.getElementById('ht-cache-status');
      if (el && s) {
        el.textContent = `SW ${s.version} · ${s.tiles} tiles cached · ${s.shell} shell files`;
      }
    });
  }

  function showPanel() { _showOfflineAuthModal(); }

  // ── Cognito Hosted UI Redirect ─────────────────────────────────────
  function _cognitoRedirect() {
    const base = `https://${CFG.cognitoPoolId.split('_')[1]}.auth.${CFG.cognitoRegion}.amazoncognito.com`;
    const redirect = encodeURIComponent(window.location.origin + '/');
    const url = `${base}/login?client_id=${CFG.cognitoClientId}` +
      `&response_type=code&scope=openid+email+profile&redirect_uri=${redirect}`;
    window.location.href = url;
  }

  // ── Sign Out ───────────────────────────────────────────────────────
  function signOut() {
    _session = null;
    _profile = null;
    localStorage.removeItem(LS_KEYS.session);
    localStorage.removeItem(LS_KEYS.profile);
    _notifyUi();
    if (CFG.enabled) {
      const base = `https://${CFG.cognitoPoolId.split('_')[1]}.auth.${CFG.cognitoRegion}.amazoncognito.com`;
      const redirect = encodeURIComponent(window.location.origin + '/');
      window.location.href = `${base}/logout?client_id=${CFG.cognitoClientId}&logout_uri=${redirect}`;
    }
  }

  // ── Data Export (JSON) ─────────────────────────────────────────────
  function exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('huntech_')) {
        try { data[key] = JSON.parse(localStorage.getItem(key)); }
        catch { data[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `huntech-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1000);
    _toast('Data exported ✓');
  }

  // ── Data Import (JSON) ─────────────────────────────────────────────
  async function importData(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      let count = 0;
      for (const [key, val] of Object.entries(data)) {
        if (!key.startsWith('huntech_')) continue;
        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        count++;
      }
      _toast(`Imported ${count} items — reload to apply`);
    } catch (e) {
      _toast('Import failed: ' + e.message, true);
    }
  }

  // ── Cloud Sync Stubs ───────────────────────────────────────────────
  async function syncToCloud() {
    if (!CFG.enabled || !_session?.idToken) {
      _toast('Cloud sync not available yet');
      return;
    }
    // Future: POST all huntech_* keys to API Gateway
    try {
      const payload = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('huntech_') && !key.startsWith('huntech_cloud_')) {
          payload[key] = localStorage.getItem(key);
        }
      }
      const res = await fetch(CFG.apiEndpoint + '/sync', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${_session.idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: payload, ts: Date.now() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      localStorage.setItem(LS_KEYS.syncTs, Date.now().toString());
      _toast('Synced to cloud ✓');
    } catch (e) {
      _toast('Sync failed: ' + e.message, true);
    }
  }

  async function syncFromCloud() {
    if (!CFG.enabled || !_session?.idToken) {
      _toast('Cloud sync not available yet');
      return;
    }
    try {
      const res = await fetch(CFG.apiEndpoint + '/sync', {
        headers: { 'Authorization': `Bearer ${_session.idToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (body?.data) {
        for (const [key, val] of Object.entries(body.data)) {
          localStorage.setItem(key, val);
        }
        _toast('Restored from cloud ✓ — reload to apply');
      }
    } catch (e) {
      _toast('Restore failed: ' + e.message, true);
    }
  }

  // ── Service Worker Cache Helpers ───────────────────────────────────
  async function getCacheStatus() {
    if (!navigator.serviceWorker?.controller) return null;
    return new Promise((resolve) => {
      const ch = new MessageChannel();
      ch.port1.onmessage = (e) => resolve(e.data);
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_STATUS' }, [ch.port2]
      );
      setTimeout(() => resolve(null), 2000);
    });
  }

  async function clearTileCache() {
    if (!navigator.serviceWorker?.controller) {
      _toast('No active service worker');
      return;
    }
    return new Promise((resolve) => {
      const ch = new MessageChannel();
      ch.port1.onmessage = () => {
        _toast('Tile cache cleared ✓');
        resolve(true);
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_TILE_CACHE' }, [ch.port2]
      );
      setTimeout(() => resolve(false), 3000);
    });
  }

  // ── Utilities ──────────────────────────────────────────────────────
  function _loadSession() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.session)); }
    catch { return null; }
  }
  function _loadProfile() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.profile)); }
    catch { return null; }
  }
  function _notifyUi() {
    window.dispatchEvent(new CustomEvent('htcloud:authchange', {
      detail: { signedIn: !!_session?.idToken, profile: _profile }
    }));
  }

  function _toast(msg, isError) {
    // Re-use existing Huntech toast if available
    if (typeof window.showHuntechNotice === 'function') {
      window.showHuntechNotice(msg, isError ? 'error' : 'success');
      return;
    }
    // Fallback
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
      'background:#1a1a1a;color:#ffc107;padding:10px 20px;border-radius:8px;z-index:99999;' +
      'font:13px/1.4 system-ui;box-shadow:0 4px 20px rgba(0,0,0,.5)';
    if (isError) t.style.color = '#ff5252';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  // ── Handle Cognito callback (auth code in URL) ─────────────────────
  function _checkAuthCallback() {
    if (!CFG.enabled) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;
    // Exchange code for tokens
    _exchangeCode(code).then(() => {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    });
  }

  async function _exchangeCode(code) {
    try {
      const base = `https://${CFG.cognitoPoolId.split('_')[1]}.auth.${CFG.cognitoRegion}.amazoncognito.com`;
      const redirect = window.location.origin + '/';
      const res = await fetch(`${base}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: CFG.cognitoClientId,
          redirect_uri: redirect,
          code,
        }),
      });
      if (!res.ok) throw new Error(`Token exchange ${res.status}`);
      const tokens = await res.json();
      _session = {
        idToken: tokens.id_token,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
      };
      localStorage.setItem(LS_KEYS.session, JSON.stringify(_session));
      // Decode id_token for profile
      const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
      _profile = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name || payload.email?.split('@')[0] || 'Hunter',
      };
      localStorage.setItem(LS_KEYS.profile, JSON.stringify(_profile));
      _notifyUi();
      _toast('Signed in as ' + _profile.name);
    } catch (e) {
      console.error('[htCloud] Token exchange failed:', e);
    }
  }

  // ── Init ───────────────────────────────────────────────────────────
  _checkAuthCallback();

})();
