# Copilot Instructions (Huntech)

## FIRST: Read the deployment handoff
Before doing ANYTHING else, read this file for current deployment state and context:
- `C:\Users\hcoun\Desktop\Huntech\AMPLIFY-RECOVERY\HANDOFF.md`

This contains: Amplify deployment details, GitHub repo location, how to push changes, pending work, and recovery steps. Every new chat MUST read this first.

## Architecture overview
- Single-page, static app: [index.html] loads global scripts and uses inline `onclick` handlers; no bundler/modules.
- Core UI + map logic lives in [main.js] (~3k lines): Leaflet map setup, drawing tools, hotspots, Plan + Route panel, local storage, and onboarding.
- Styling lives in [app.css]; PWA shell is [manifest.json] and minimal [sw.js] (no caching yet).
- Regulations data is local in [regulations.js]; config endpoints are globals in [config.js].
- Local dev server + proxy is [server.js] (Node HTTP server, CORS-safe proxy for MDC hosts).

## Data flow + state
- Map state is in module-scope globals (e.g., `map`, `hotspotMarkers`, `routeLine`, `workflowState`).
- Persistence uses `localStorage` keys: `huntech_saved_hunt_areas_v1`, `huntech_hunt_journal_v1`, `huntech_saved_hunt_plans_v1`.
- Shed-hunting allowed layer caches in-memory + `localStorage` (`huntech_shed_rules_cache_v1`) with TTL logic.
- Hotspots are generated client-side with `SHED_EDUCATION` priority data and rendered via Leaflet markers.

## Dev workflows
- Run locally: `node server.js` (serves static files on :8080 and enables `/proxy?url=` for `mdc.mo.gov`).
- No build/test steps or package manager; edits are direct file changes.
- `server.js` also spawns [auto-chatlog-backup.js] (chat + file backups into [backups/]).

## Conventions and patterns
- HTML uses inline handlers; any new UI actions should be exposed on `window` (see [main.js]).
- UI state is mostly DOM-driven (class toggles + `details` elements) rather than a framework.
- New map layers should follow existing enable/disable patterns and set `*_Enabled` flags.
- Keep configuration overrides in [config.js] (tile URLs, router endpoints) rather than hardcoding.

## Integration points
- Leaflet + Leaflet.draw via CDN (see [index.html]); be careful when changing versions.
- Optional OSRM routing is configured via `window.WALK_ROUTER_URL` in [config.js].
- MDC rules fetch uses ArcGIS REST endpoints; cross-origin access is via `/proxy` in [server.js].
