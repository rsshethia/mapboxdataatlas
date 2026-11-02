# Example prompt: Elevation along a route (`elevation-profile`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Sample Mapbox terrain along the Pacific Coast route and draw the elevation profile, linked to a marker on the map.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A terrain map answers “how high?” only approximately. This example samples the DEM at regular intervals along a route and turns those samples into a profile chart.

Hovering the chart moves a marker on the map, connecting the abstract profile to the actual place. The same route geometry powers both views, so distance and position stay consistent.

## The story

Seattle sits at sea level, and the road south immediately starts misbehaving — climbing passes, diving valleys, flirting with clouds. The chart walks every metre of it while the marker keeps its feet on the ground.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Hover the profile to move the marker along the route.
- Compare the coastal lowlands with the Oregon and California ranges.
- Tilt the map to see the terrain the profile is sampling.

## Techniques

- Terrain sampling
- Linked chart and map
- D3 area profile
- Directions geometry

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Terrain DEM
- Mapbox Directions API (snapshot)

## Data

- **Mapbox Terrain DEM** — Mapbox (Mapbox Terms of Service). <https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/> Retrieved: 2026-11-02. Fields: elevation.
  Elevation samples queried from the raster DEM at 220 points.

- **Pacific Coast driving route** — Mapbox Directions API (Mapbox Terms of Service). <https://docs.mapbox.com/api/navigation/directions/> Retrieved: 2026-11-02. Rows: 187. Fields: geometry, distanceKm, durationHours.
  Simplified Directions geometry between five waypoints.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/elevation-profile/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/elevation-profile
- Thumbnail: `public/thumbs/elevation-profile.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: advanced. Tags: terrain, elevation, profile, linked.
