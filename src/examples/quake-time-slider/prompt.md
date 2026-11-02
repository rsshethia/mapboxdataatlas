# Example prompt: Earthquakes through time (`quake-time-slider`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A cumulative year slider reveals the M6+ earthquake catalogue from 2000 to 2026, with size by magnitude and colour by depth.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Time is the third dimension most maps ignore. This example filters the earthquake catalogue with a cumulative year threshold: at 2010 the map shows every M6+ event up to that year, not just that year’s events.

Circle size encodes magnitude and colour encodes depth, so the map reads as a catalogue rather than a single snapshot. Drag the slider to watch the catalogue accumulate.

## Things a visitor can try

- Drag the year slider to accumulate events.
- Hover a circle for magnitude, depth, and date.
- Compare the depth colours along the Pacific subduction zones.

## Techniques

- Cumulative time filter
- Data-driven circle size
- Depth colour ramp
- Range control

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **Earthquake catalogue (M6+, 2000–2026)** — USGS Earthquake Hazards Program (Public domain). <https://earthquake.usgs.gov/earthquakes/search/> Retrieved: 2026-11-02. Rows: 3,997. Fields: mag, place, time, depth, year.
  Normalized point features with magnitude, depth, time, and year.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/quake-time-slider/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/quake-time-slider
- Thumbnail: `public/thumbs/quake-time-slider.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: earthquakes, time, slider, usgs.
