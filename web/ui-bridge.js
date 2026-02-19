// Minimal UI bridge to keep Field Command tray and buttons functional on MapLibre
(function(){
  try { console.log('HUNTECH BUILD 20260215b (ui-bridge)'); } catch (e) {}
  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

  function toggleToolbar(){
    const toolbar = qs('#toolbar');
    if (!toolbar) return;
    const collapsed = toolbar.classList.toggle('collapsed');
    document.body.classList.toggle('ht-toolbar-open', !collapsed);
  }

  // Expose expected globals used by HTML
  if (!window.toggleToolbar) window.toggleToolbar = toggleToolbar;
  if (!window.showAdvancedToolsTray) window.showAdvancedToolsTray = function(){ toggleToolbar(); };
  if (!window.showMap) window.showMap = function(){};
  if (!window.showProperties) window.showProperties = function(){ toggleToolbar(); };
  if (!window.showWeather) window.showWeather = function(){ toggleToolbar(); };
  if (!window.startOver) window.startOver = function(){};
  if (!window.beginRouteMapSelection) window.beginRouteMapSelection = function(){};
  if (!window.startRouteFromMyLocation) window.startRouteFromMyLocation = function(){};
  if (!window.letsGoFollowRoute) window.letsGoFollowRoute = function(){};
  if (!window.logPinOnMap) window.logPinOnMap = function(){};
  if (!window.logSignVoice) window.logSignVoice = function(){ alert('Log Sign: voice capture not wired yet.'); };
  if (!window.exitHunt) window.exitHunt = function(){ toggleToolbar(); };
  if (!window.showMissionSummary) window.showMissionSummary = function(){ alert('Mission Summary: not yet wired.'); };
  if (!window.loadSavedSelectionFromTray) window.loadSavedSelectionFromTray = function(){ alert('Load Hunt: not yet wired.'); };
  if (!window.deleteSelectedSavedHunt) window.deleteSelectedSavedHunt = function(){ alert('Delete Hunt: not yet wired.'); };
  if (!window.clearAllSavedHuntsAndAreas) window.clearAllSavedHuntsAndAreas = function(){ window.startOver?.(); };
  if (!window.centerOnMyLocation) window.centerOnMyLocation = function(){ try { window.htLocate?.(); } catch(e){} };

  // Wire Field Command toggle buttons
  function bindFieldCommand(){
    qsa('.ht-field-command-btn').forEach((btn)=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault(); e.stopPropagation();
        toggleToolbar();
      });
      btn.addEventListener('touchstart', (e)=>{
        e.preventDefault(); e.stopPropagation();
        toggleToolbar();
      }, { passive: false });
    });
  }

  // Bind immediately (script is at end of body) and also on DOMContentLoaded
  // for any edge cases where the DOM wasn't fully ready yet.
  try { bindFieldCommand(); } catch(e) {}
  document.addEventListener('DOMContentLoaded', () => {
    try { bindFieldCommand(); } catch(e) {}
  });
})();
