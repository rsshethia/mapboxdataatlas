# Example prompt: Population hexagons in 3D (`3d-hexbin`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

H3 hexagons extruded by summed city population, turning a flat hexbin into a skyline of urban regions.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Extruding a hexbin adds a second encoding without adding a second map. Each H3 cell is raised by the population of the cities inside it, so the tallest columns are the world’s largest urban agglomerations.

The colour ramp repeats the same total, which keeps the map readable when the camera is low. Change the H3 resolution to see how scale changes the shape of the skyline.

## Things a visitor can try

- Drag to rotate and tilt the extruded hexagons.
- Hover a column for its city count and summed population.
- Switch resolution to merge or split urban regions.

## Techniques

- H3 aggregation
- fill-extrusion
- Interpolated height
- Pitch and rotation

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Dark style

## Data

- **Populated places (1:50m)** — Natural Earth (Public domain). <https://www.naturalearthdata.com/downloads/50m-cultural-vectors/> Retrieved: 2026-11-02. Rows: 1,250. Fields: name, pop, lon, lat.
  City points with maximum population estimates, binned into H3 cells.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/3d-hexbin/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/3d-hexbin
- Thumbnail: `public/thumbs/3d-hexbin.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: advanced. Tags: 3d, hexbin, h3, population.
