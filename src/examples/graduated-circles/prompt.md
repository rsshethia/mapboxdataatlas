# Example prompt: Cities sized by population (`graduated-circles`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Graduated circles for 1,250 populated places, scaled by population and filtered to the largest settlements.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A point layer does what a choropleth cannot: it shows where people actually live, not just which polygon they fall inside. Circle area is scaled to population so the difference between a megacity and a regional centre stays readable.

The filter switches between the 200 largest cities, the 600 largest, and every place in the snapshot. Circle size does not change between views, so the comparison stays honest.

## Things a visitor can try

- Hover a circle for its city, country, and population.
- Switch the filter to see the long tail of smaller places.
- Zoom into East Asia or South Asia and compare circle density.

## Techniques

- Circle layer
- Interpolated radius
- Feature filtering
- Natural Earth places

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **Populated places (1:50m)** — Natural Earth (Public domain). <https://www.naturalearthdata.com/downloads/50m-cultural-vectors/> Retrieved: 2026-11-02. Rows: 1,250. Fields: name, country, pop, lon, lat, capital.
  Major world cities with maximum population estimates.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/graduated-circles/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/graduated-circles
- Thumbnail: `public/thumbs/graduated-circles.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intro. Tags: cities, population, circles, world.
