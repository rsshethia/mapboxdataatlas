# Example prompt: Terrain and hillshade (`terrain-hillshade`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A raster DEM drives both a hillshade layer and true 3D terrain across the Colorado Rockies.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A raster elevation model can do two jobs at once: a hillshade layer shades the surface for a map-like read, while `setTerrain` displaces the camera and tiles into real relief.

The exaggeration slider changes only the terrain displacement, not the hillshade. At higher values the relief is dramatic but the shading stays honest, which is why the two controls are separate.

## Things a visitor can try

- Tilt and rotate the map to see the Front Range in relief.
- Change the terrain exaggeration.
- Toggle the hillshade to compare shaded relief with raw 3D.

## Techniques

- Raster DEM
- setTerrain
- Hillshade layer
- Exaggeration control

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Terrain DEM
- Mapbox Outdoors style

## Data

- **Mapbox Terrain DEM** — Mapbox (Mapbox Terms of Service). <https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/> Retrieved: 2026-11-02. Fields: elevation.
  Elevation raster tiles used for displacement and hillshade.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/terrain-hillshade/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/terrain-hillshade
- Thumbnail: `public/thumbs/terrain-hillshade.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: terrain, hillshade, dem, colorado.
