// ═══════════════════════════════════════════════════════════════════════
// HUNTECH — Error Handling & Crash Reporting Module
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const MAX_LOG_SIZE = 200;
  const STORAGE_KEY = 'huntech_error_log_v1';
  const CRASH_REPORT_KEY = 'huntech_crash_reports_v1';

  // ── Structured Log Ring-Buffer ──────────────────────────────────────
  const _log = [];

  function _ts() {
    return new Date().toISOString();
  }

  function _push(level, msg, extra) {
    const entry = { t: _ts(), l: level, m: String(msg) };
    if (extra) entry.x = extra;
    _log.push(entry);
    if (_log.length > MAX_LOG_SIZE) _log.shift();
  }

  // Public logging API
  window.htLog = {
    info:  (msg, extra) => { _push('INFO',  msg, extra); },
    warn:  (msg, extra) => { _push('WARN',  msg, extra); console.warn('[HT]', msg, extra || ''); },
    error: (msg, extra) => { _push('ERROR', msg, extra); console.error('[HT]', msg, extra || ''); },
    debug: (msg, extra) => { _push('DEBUG', msg, extra); },
    getLog: () => [..._log],
    clear: () => { _log.length = 0; },
  };

  // ── Crash Report Collection ─────────────────────────────────────────
  function _saveCrashReport(report) {
    try {
      const existing = JSON.parse(localStorage.getItem(CRASH_REPORT_KEY) || '[]');
      existing.push(report);
      // Keep last 50 crash reports
      while (existing.length > 50) existing.shift();
      localStorage.setItem(CRASH_REPORT_KEY, JSON.stringify(existing));
    } catch { /* quota or parse error — skip */ }
  }

  function _buildReport(type, message, source, lineno, colno, errorObj) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ts: _ts(),
      type: type,
      message: String(message || 'Unknown error'),
      source: source || '',
      line: lineno || 0,
      col: colno || 0,
      stack: errorObj?.stack ? errorObj.stack.slice(0, 2000) : '',
      url: location.href,
      ua: navigator.userAgent.slice(0, 200),
      recentLog: _log.slice(-20),
      screen: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      memory: navigator.deviceMemory || null,
      connection: navigator.connection?.effectiveType || null,
    };
  }

  // ── Global Error Handlers ───────────────────────────────────────────

  // Synchronous errors
  window.addEventListener('error', (event) => {
    const report = _buildReport(
      'uncaught',
      event.message,
      event.filename,
      event.lineno,
      event.colno,
      event.error
    );
    _push('ERROR', `Uncaught: ${event.message}`, {
      source: event.filename,
      line: event.lineno,
    });
    _saveCrashReport(report);
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || String(reason || 'Promise rejected');
    const report = _buildReport('promise', message, '', 0, 0, reason);
    _push('ERROR', `Unhandled rejection: ${message}`);
    _saveCrashReport(report);
  });

  // Resource load failures (images, scripts, CSS)
  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) {
      const tag = event.target.tagName || '';
      const src = event.target.src || event.target.href || '';
      if (src) {
        _push('WARN', `Resource failed: ${tag} ${src}`);
      }
    }
  }, true); // capture phase to catch resource errors

  // ── Performance Monitoring ──────────────────────────────────────────
  function _reportPerfMetrics() {
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        htLog.info('Page load', {
          dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
          tcp: Math.round(nav.connectEnd - nav.connectStart),
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          domReady: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
          load: Math.round(nav.loadEventEnd - nav.startTime),
        });
      }
    } catch { /* not supported */ }
  }

  if (document.readyState === 'complete') {
    setTimeout(_reportPerfMetrics, 100);
  } else {
    window.addEventListener('load', () => setTimeout(_reportPerfMetrics, 100));
  }

  // ── Long Task Detection ─────────────────────────────────────────────
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 200) {
            htLog.warn(`Long task: ${Math.round(entry.duration)}ms`, {
              name: entry.name,
              start: Math.round(entry.startTime),
            });
          }
        }
      });
      obs.observe({ type: 'longtask', buffered: true });
    } catch { /* longtask not supported */ }
  }

  // ── Crash Report Viewer ─────────────────────────────────────────────
  window.htCrashReports = {
    get: () => {
      try { return JSON.parse(localStorage.getItem(CRASH_REPORT_KEY) || '[]'); }
      catch { return []; }
    },
    clear: () => { localStorage.removeItem(CRASH_REPORT_KEY); },
    count: () => {
      try { return JSON.parse(localStorage.getItem(CRASH_REPORT_KEY) || '[]').length; }
      catch { return 0; }
    },
    /** Copy latest report to clipboard for sharing. */
    copyLatest: () => {
      const reports = window.htCrashReports.get();
      if (!reports.length) { alert('No crash reports.'); return; }
      const latest = reports[reports.length - 1];
      const text = JSON.stringify(latest, null, 2);
      navigator.clipboard?.writeText(text).then(
        () => alert('Crash report copied to clipboard.'),
        () => alert('Copy failed. Check console for report.')
      );
      console.log('HUNTECH Crash Report:', latest);
    },
    /** Show a diagnostic overlay with error summary. */
    showDiagnostics: () => {
      const reports = window.htCrashReports.get();
      const log = htLog.getLog();
      let html = '<div style="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.95);color:#fff;overflow:auto;padding:20px;font-family:monospace;font-size:12px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
      html += '<h2 style="color:#ffd400;margin:0;">HUNTECH Diagnostics</h2>';
      html += '<button onclick="this.closest(\'div[style]\').remove()" style="background:#ffd400;color:#000;border:none;padding:8px 16px;border-radius:8px;font-weight:bold;cursor:pointer;">CLOSE</button>';
      html += '</div>';

      html += `<p style="color:#aaa;">Crash reports: <strong style="color:#ff6b6b;">${reports.length}</strong> | Log entries: <strong>${log.length}</strong></p>`;

      if (reports.length) {
        html += '<h3 style="color:#ff6b6b;">Latest Crashes</h3>';
        for (const r of reports.slice(-5).reverse()) {
          html += `<div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:10px;margin-bottom:8px;">`;
          html += `<div style="color:#ffd400;">${r.type}: ${r.message}</div>`;
          html += `<div style="color:#888;font-size:10px;">${r.ts} | ${r.source}:${r.line}</div>`;
          if (r.stack) html += `<pre style="color:#ccc;font-size:10px;white-space:pre-wrap;max-height:100px;overflow:auto;">${r.stack.slice(0, 500)}</pre>`;
          html += '</div>';
        }
      }

      html += '<h3 style="color:#ffd400;">Recent Log</h3>';
      for (const e of log.slice(-30).reverse()) {
        const color = e.l === 'ERROR' ? '#ff6b6b' : e.l === 'WARN' ? '#ffb347' : '#8aff8a';
        html += `<div style="color:${color};border-bottom:1px solid #222;padding:2px 0;">[${e.l}] ${e.m}</div>`;
      }
      html += '</div>';
      document.body.insertAdjacentHTML('beforeend', html);
    }
  };

  // ── Network Status ──────────────────────────────────────────────────
  window.addEventListener('online',  () => htLog.info('Network: back online'));
  window.addEventListener('offline', () => htLog.warn('Network: went offline'));

  // ── Init ────────────────────────────────────────────────────────────
  htLog.info('HUNTECH error handler initialized', {
    build: document.querySelector('link[href*="app.css"]')?.href?.match(/v=([^&"]+)/)?.[1] || 'dev',
    pendingCrashes: window.htCrashReports.count(),
  });

})();
