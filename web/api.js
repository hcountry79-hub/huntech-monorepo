// Placeholder API client layer.
// This file exists because index.html loads it; implement real backend calls here.

(function () {
  if (window.HUNTECH_API) return;

  window.HUNTECH_API = {
    async health() {
      return { ok: true, mode: 'stub', ts: new Date().toISOString() };
    }
  };
})();
