# Example prompt: Four maps, one camera (`small-multiples`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A 2×2 small-multiple of world indicators — population, density, income, and life expectancy — with a synchronised camera.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Small multiples trade size for comparison. Four maps share one extent and one camera, so the eye can move between them without re-orienting. Each cell answers a different question about the same country shapes.

The camera is linked both ways: dragging or zooming any cell moves the other three. Hovering works independently, so you can read a value in one panel while the others provide context.

## The story

Four questions, one planet: how many, how crowded, how rich, how long-lived. Same shapes, four answers — the comparison your eyes could never make by flipping between tabs.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Drag or zoom any cell — all four maps follow.
- Hover a country to read the metric for that panel.
- Compare the density and income panels: the coastal concentration in density has no direct income equivalent.

## Techniques

- Small multiples
- Synchronised cameras
- Shared geometry
- Per-panel class breaks

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **World countries (1:110m)** — Natural Earth via world-atlas (Public domain). <https://github.com/topojson/world-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Country boundaries joined to World Bank indicators.

- **World Development Indicators** — World Bank (CC BY 4.0). <https://data.worldbank.org/> Retrieved: 2026-11-02. Fields: population, density, gdpPerCapita, lifeExpectancy.
  Population, density, GDP per capita, and life expectancy.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/small-multiples/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly 4 maps (this is the small-multiples exception) and remove them on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/small-multiples
- Thumbnail: `public/thumbs/small-multiples.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: advanced. Tags: small multiples, linked, world, camera sync.
