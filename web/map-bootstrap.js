(() => {
  const isMobile = window.matchMedia('(pointer: coarse)').matches
    || window.innerWidth <= 900
    || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');

  const loadStyle = (href) => new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load ${href}`));
    document.head.appendChild(link);
  });

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });

  const startMapLibre = async () => {
    await loadStyle('https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css');
    await loadScript('https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js');
    await loadScript('maplibre.js');
  };

  const startLeaflet = async () => {
    await loadScript('main.js?v=20260213fix');
  };

  if (isMobile) {
    startMapLibre().catch((err) => console.error(err));
  } else {
    startLeaflet().catch((err) => console.error(err));
  }
})();
