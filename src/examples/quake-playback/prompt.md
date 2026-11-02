# Example prompt: Playing the earthquake record (`quake-playback`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

An animated year-by-year playback of the M6+ catalogue, with a cumulative count and the largest event of each year.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Playback turns a time series into a performance. Each tick advances one year, filters the catalogue cumulatively, and updates a readout of the largest event in that year.

The animation is deliberate rather than continuous: the eye needs a moment to register each frame. Speed controls let you move from a slow survey to a quick overview.

## Things a visitor can try

- Press play to step through 2000–2026.
- Scrub the slider to jump to a year.
- Read the largest event and cumulative count for the selected year.

## Techniques

- Timed playback
- Cumulative filtering
- Synchronised readouts
- Reduced-motion fallback

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Dark style

## Data

- **Earthquake catalogue (M6+, 2000–2026)** — USGS Earthquake Hazards Program (Public domain). <https://earthquake.usgs.gov/earthquakes/search/> Retrieved: 2026-11-02. Rows: 3,997. Fields: mag, place, time, depth, year.
  Normalized point features with magnitude, depth, time, and year.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/quake-playback/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/quake-playback
- Thumbnail: `public/thumbs/quake-playback.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: earthquakes, playback, time, animation.
