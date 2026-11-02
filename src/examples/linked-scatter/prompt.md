# Example prompt: Income, longevity, and the map (`linked-scatter`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A country scatter of GDP per capita against life expectancy, linked to the map by hover and click.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A scatter shows the relationship; the map shows where it happens. Hovering a point highlights the country, and clicking a point flies the map to its bounds.

GDP per capita is plotted on a log scale because the distribution spans four orders of magnitude. That choice makes the curvature of the income–longevity relationship visible instead of compressing most countries into a corner.

## Things a visitor can try

- Hover a point to highlight its country on the map.
- Click a point to zoom to that country.
- Look for the flattening of the curve at high incomes.

## Techniques

- Linked hover
- Log-scaled scatter
- Feature-state highlight
- Fly-to bounds

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **World Development Indicators** — World Bank (CC BY 4.0). <https://data.worldbank.org/> Retrieved: 2026-11-02. Fields: gdpPerCapita, lifeExpectancy, region.
  GDP per capita and life expectancy by country, latest 2015–2024.

- **World countries (1:110m)** — Natural Earth via world-atlas (Public domain). <https://github.com/topojson/world-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Country boundaries used for the map and the highlight geometry.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/linked-scatter/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/linked-scatter
- Thumbnail: `public/thumbs/linked-scatter.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: advanced. Tags: linked, scatter, income, life expectancy.
