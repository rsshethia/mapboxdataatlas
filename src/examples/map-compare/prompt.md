# Example prompt: Two metrics, one map (`map-compare`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A single map that crossfades between population density and life expectancy, with a slider controlling the blend.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A side-by-side comparison splits attention and screen space. A crossfade keeps one map and one camera, letting you read the same country shapes as one variable dissolves into another.

Both layers share the same source geometry and use quantile classes computed independently. At the midpoint you see a hybrid; at either end you get a clean single-variable choropleth.

## The story

Crowded places, long lives — do the two rhyme? Drag the slider and watch one truth dissolve into the other across the exact same borders.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Drag the blend slider from density to life expectancy.
- Use the endpoint buttons to snap to either variable.
- Hover a country to read both values at once.

## Techniques

- Layer crossfade
- Two choropleth layers
- Shared geometry
- Slider-driven opacity

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **World countries (1:110m)** — Natural Earth via world-atlas (Public domain). <https://github.com/topojson/world-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Country boundaries joined to World Bank indicators.

- **World Development Indicators** — World Bank (CC BY 4.0). <https://data.worldbank.org/> Retrieved: 2026-11-02. Fields: density, lifeExpectancy.
  Population density and life expectancy at birth.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/map-compare/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/map-compare
- Thumbnail: `public/thumbs/map-compare.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: compare, crossfade, density, life expectancy.
