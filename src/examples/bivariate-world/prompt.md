# Example prompt: Income and longevity, together (`bivariate-world`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A bivariate choropleth: each country is placed in a 3×3 grid of GDP per capita and life expectancy.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Two variables on one map can turn a choropleth into a puzzle. A bivariate scheme solves it by mixing nine colours: the horizontal axis is GDP per capita, the vertical axis is life expectancy at birth.

Countries in the lower-left corner are poor and short-lived; the upper-right corner is rich and long-lived. The diagonal is the expected path — countries that leave it are the interesting ones.

## Things a visitor can try

- Hover a country to read both values and its 3×3 class.
- Use the legend to decode the nine colours before reading the map.
- Look for countries that are richer than their life expectancy suggests — or the reverse.

## Techniques

- Bivariate colour scheme
- Tertile class breaks
- Match expressions
- TopoJSON → GeoJSON

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **World countries (1:110m)** — Natural Earth via world-atlas (Public domain). <https://github.com/topojson/world-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Country boundaries joined by numeric ISO identifier.

- **World Development Indicators** — World Bank (CC BY 4.0). <https://data.worldbank.org/> Retrieved: 2026-11-02. Fields: gdpPerCapita, lifeExpectancy.
  GDP per capita and life expectancy, latest available 2015–2024.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/bivariate-world/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/bivariate-world
- Thumbnail: `public/thumbs/bivariate-world.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: bivariate, income, life expectancy, world.
