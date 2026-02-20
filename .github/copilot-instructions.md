# Copilot Instructions (Huntech)

## MANDATORY DEBUGGING PROTOCOL — NEVER SKIP

### Rule 1: TRACE BEFORE YOU PATCH
When a bug is reported, you MUST trace the FULL execution path from user action to expected outcome BEFORE writing any fix. This means:
1. Find the HTML element the user clicks (the `onclick` handler, the event listener).
2. Follow the function call chain: what does the handler call? What does THAT call? Trace every hop.
3. Check each function actually EXISTS on `window` at runtime — is it defined inside `DOMContentLoaded`? Could init errors prevent it from being assigned?
4. Check for SILENT KILLERS: flags like `UI_NOTICES_ENABLED`, `pointer-events: none`, `display: none`, `z-index` overlaps, `return` guards that exit early.
5. Run the code with `node --check` for syntax, but also READ the execution path line by line.

### Rule 2: NEVER GUESS — VERIFY
- Do NOT hypothesize what "might" be wrong and deploy a speculative fix.
- DO read the actual code, find the actual failure point, and confirm it before touching anything.
- If you can't find the bug in 2 minutes of reading, widen your search — check CSS, check load order, check global flags, check the ENTIRE init chain.

### Rule 3: ONE ROOT CAUSE, ONE FIX, VERIFY
- Find the single root cause. Fix that one thing.
- Add defensive layers (failsafes, error handlers) to prevent future silent failures.
- Verify the fix is in the deployed files BEFORE telling the user it's done.
- NEVER deploy more than 2 speculative fix attempts. If the first two don't work, STOP and do a full execution trace.

### Rule 4: THINK BIGGER — SYSTEMIC CHECKS
Before fixing any bug, scan for systemic issues that could affect ALL features:
- Is `UI_NOTICES_ENABLED` set to `true`?
- Are there `pointer-events: none` on parent containers?
- Is the service worker serving stale cached files?
- Are functions defined inside `DOMContentLoaded` that should be global?
- Are there unhandled exceptions in the init chain that silently kill everything after them?

### Rule 5: NEVER WASTE THE USER'S TIME
- One attempt, maximum two. If the second attempt doesn't work, switch to the full trace methodology.
- Never say "try clearing your cache" as a fix — fix the root cause AND bust the cache programmatically.
- Always bump cache busters and SW versions when deploying fixes.
- Always verify deployed files match your edits using HTTP requests before reporting success.

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

## Known Landmines — CHECK THESE FIRST ON ANY BUG
These are past issues that wasted hours. Always check them before debugging:
1. **`UI_NOTICES_ENABLED`** (main.js ~line 827) — Must be `true`. If `false`, ALL toast notifications are silently swallowed. Functions appear to "do nothing" when they're actually running but showing no feedback.
2. **Functions inside `DOMContentLoaded`** — Any function assigned to `window` inside the DOMContentLoaded handler (lines ~15706-16690) will NOT exist if ANY prior line in that handler throws an unhandled error. Always check if the function is on `window` at call time. Critical functions should have a failsafe definition.
3. **Service Worker caching** — SW version must be bumped on every deploy. Cache busters (`?v=`) must be bumped on every deploy. Current versions: SW `huntech-sw-v6`, cache buster `v=20260220j`. NEVER deploy without bumping both.
4. **`pointer-events: none`** in app.css — Multiple elements have this. If a button "does nothing," check if a parent overlay is blocking clicks.
5. **Script load order** — fly-fishing.html loads: regulations.js → fly-fishing-data.js → ht-fly-fishing.js → main.js. Functions in main.js cannot be called during ht-fly-fishing.js parse time.

## Quality gates before every deploy
1. `node --check <file>` on every modified JS file
2. Verify `UI_NOTICES_ENABLED === true` in main.js
3. Bump cache buster in the HTML file's `<script>` tags
4. Bump SW version in sw.js if any cached file changed
5. Copy files to monorepo, commit, push
6. HTTP-fetch deployed files and confirm changes are live

## MANDATORY — Amenity Pin Data Quality Rules
**NEVER place a map pin for a real-world amenity (parking, restroom, store, hatchery, etc.) unless you have EXACT, VERIFIED coordinates.**
1. **Verification required**: Every non-zone amenity pin MUST have `verified: true` in its data entry. The `addAccessPointsForWater()` function will skip any amenity pin without this flag.
2. **Acceptable verification sources**: OSM Overpass API query, official park maps with GPS coordinates, Google Maps satellite confirmation with coordinates extracted.
3. **NEVER estimate or interpolate**: Do not guess coordinates from a park name, street address, or general area. If you cannot find exact coordinates, DO NOT PIN IT.
4. **Satellite cross-check**: Before adding any amenity pin, visually confirm on satellite imagery that a structure/parking lot actually exists at those coordinates. A pin in the middle of woods = immediate removal.
5. **OSM query template**: Use Overpass API: `[out:json];(node["amenity"](bbox););out body;` to find verified amenity nodes.
6. **Document the source**: Add the verification source in the `notes` field, e.g., `(OSM node 37.9595/-91.5315 verified)`.
7. **Zone pins are exempt**: Stream zone pins (type: 'zone') are placed on the waterway itself and don't need building verification.
