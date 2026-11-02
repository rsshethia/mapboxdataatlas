# Example prompt: A hexbin of world population (`hexbin-cities`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Cities are binned into H3 hexagons, summing population so dense urban regions become visible cells.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Hexbins turn thousands of overlapping points into a regular surface. Each city contributes its population to one H3 cell; the cell colour is the total population binned inside it.

Because H3 cells have equal area, the map avoids the area distortion that makes large, empty countries look important in a choropleth. The result is a quick read of where the world’s urban population concentrates.

## Things a visitor can try

- Hover a cell to see its summed population and city count.
- Compare the coastal clusters of East Asia, Europe, and the Americas.
- Switch the hex resolution to see how aggregation changes the pattern.

## Techniques

- H3 hexbins
- Point aggregation
- Quantile classes
- Step expressions

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Dark style

## Data

- **Populated places (1:50m)** — Natural Earth (Public domain). <https://www.naturalearthdata.com/downloads/50m-cultural-vectors/> Retrieved: 2026-11-02. Rows: 1,250. Fields: name, pop, lon, lat.
  City points with maximum population estimates, binned client-side.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/hexbin-cities/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/hexbin-cities
- Thumbnail: `public/thumbs/hexbin-cities.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: hexbin, h3, cities, population.
