# Example prompt: Manhattan, extruded (`3d-buildings`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Mapbox building footprints raised into a 3D city, coloured by height and viewed from a low pitch.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Fill-extrusion reads height from the building tile attributes and renders each footprint as a block. The result is not a photoreal model — it is a data-driven massing study you can tilt, rotate, and inspect.

Colour repeats the height variable so the skyline remains legible in a still frame. The vertical exaggeration control scales both height and the base offset, keeping the geometry consistent.

## The story

Manhattan is a bar chart that learned to charge rent. Every block’s height comes from real building data — the island’s wealth, quite literally stacked.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Right-drag (or Ctrl-drag) to tilt; drag to rotate.
- Hover a building for its height and type.
- Change the exaggeration to compress or dramatise the skyline.

## Techniques

- fill-extrusion
- Vector tile source layer
- Height interpolation
- Pitch and bearing

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style
- Mapbox Streets vector tiles

## Data

- **Building footprints** — Mapbox Streets vector tiles (Mapbox Terms of Service). <https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/> Retrieved: 2026-11-02. Fields: height, min_height, type, extrude.
  Mapbox Streets v8 building layer with height and minimum-height attributes.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/3d-buildings/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/3d-buildings
- Thumbnail: `public/thumbs/3d-buildings.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: 3d, buildings, fill-extrusion, manhattan.
