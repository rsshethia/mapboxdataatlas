# Example prompt: Class breaks change the story (`class-break-explorer`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

The same population choropleth reclassified live with quantile, equal-interval, and natural-breaks methods.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A choropleth is an argument about classification. Quantile breaks put the same number of countries in each class; equal intervals keep the same numeric width; natural breaks (Jenks) minimise within-class variance.

Switch methods and class counts while watching the map and legend update together. The underlying values never change — only the cut points do.

## Things a visitor can try

- Compare quantile and equal-interval classes on the same data.
- Change the number of classes from three to seven.
- Hover a country to see its raw value and its current class.

## Techniques

- Quantile breaks
- Equal intervals
- Jenks natural breaks
- Dynamic reclassification

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **World countries (1:110m)** — Natural Earth via world-atlas (Public domain). <https://github.com/topojson/world-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Country boundaries joined to World Bank indicators.

- **World Development Indicators** — World Bank (CC BY 4.0). <https://data.worldbank.org/> Retrieved: 2026-11-02. Fields: population, landAreaKm2, density.
  Total population and land area, latest available 2015–2024.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/class-break-explorer/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/class-break-explorer
- Thumbnail: `public/thumbs/class-break-explorer.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: classification, jenks, quantile, choropleth.
