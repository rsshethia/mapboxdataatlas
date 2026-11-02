# Example prompt: Twelve countries, linked to the map (`linked-bar`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A ranked bar chart of the most populous countries, with hover highlighting and click-to-zoom on the map.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A ranked bar chart is often clearer than a choropleth for “who is biggest?”. Linking it to the map restores the geography the chart drops.

Hovering a bar highlights the country geometry; clicking zooms to its bounds. The map stays neutral so the highlighted country is the only strong colour on screen.

## Things a visitor can try

- Hover a bar to highlight the country.
- Click a bar to zoom to that country.
- Hover the map for the full values of any country, not just the top twelve.

## Techniques

- Ranked bar chart
- Linked highlight
- Feature-state
- Fly-to bounds

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **World Development Indicators** — World Bank (CC BY 4.0). <https://data.worldbank.org/> Retrieved: 2026-11-02. Fields: population, region.
  Total population by country, latest available 2015–2024.

- **World countries (1:110m)** — Natural Earth via world-atlas (Public domain). <https://github.com/topojson/world-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Country boundaries used for the map and highlight geometry.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/linked-bar/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/linked-bar
- Thumbnail: `public/thumbs/linked-bar.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: linked, bar chart, population, ranking.
