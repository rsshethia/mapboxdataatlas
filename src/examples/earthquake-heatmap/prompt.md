# Example prompt: Where the ground moves (`earthquake-heatmap`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A magnitude-weighted heatmap of 3,997 earthquakes, with a switch between the long catalogue and the last 30 days.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A heatmap is a density surface, not a count. Each earthquake contributes weight proportional to its magnitude, so a cluster of small tremors does not read the same as a single great quake.

The long catalogue spans 2000–2026 and is filtered to magnitude 6 and above, which reveals the tectonic plate boundaries. The 30-day view keeps smaller events and shows how the same boundaries stay active.

## The story

Nearly four thousand times in twenty-six years, the ground moved hard enough to make the history books. The glow does not scatter randomly — it traces the seams where the planet’s plates shove past each other.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Switch between the 26-year catalogue and the last 30 days.
- Zoom into the Pacific Ring of Fire and watch the heatmap sharpen.
- Hover the circle layer at high zoom for individual events.

## Techniques

- Heatmap layer
- Magnitude weighting
- Zoom interpolation
- Dark basemap

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Dark style

## Data

- **Earthquake catalogue (M6+, 2000–2026)** — USGS Earthquake Hazards Program (Public domain). <https://earthquake.usgs.gov/earthquakes/search/> Retrieved: 2026-11-02. Rows: 3,997. Fields: mag, place, time, depth, url, year.
  Normalized point features with magnitude, depth, and place.

- **Recent earthquakes (M2.5+, past 30 days)** — USGS Earthquake Hazards Program (Public domain). <https://earthquake.usgs.gov/earthquakes/feed/v1.0/> Retrieved: 2026-11-02. Fields: mag, place, time, depth, url.
  Live feed snapshot refreshed on the data preparation date.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/earthquake-heatmap/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/earthquake-heatmap
- Thumbnail: `public/thumbs/earthquake-heatmap.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intro. Tags: earthquakes, heatmap, usgs, density.
