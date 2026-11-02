# Example prompt: A route, unfolded in time (`animated-route`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A vehicle marker travels the Mapbox Directions route from Seattle to San Diego, drawing the path as it goes.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A route is a line with a direction and a duration. This example animates a marker along the simplified geometry, revealing the path progressively instead of showing it all at once.

The progress line is rebuilt each frame from the route coordinates, while the marker position is interpolated inside the current segment. The camera can follow along or stay fixed.

## Things a visitor can try

- Press play to travel the route, or drag the progress slider.
- Turn on “Follow” to keep the marker centred.
- Read the distance and driving time from the panel as the marker moves.

## Techniques

- Progressive line drawing
- Distance interpolation
- Playback controls
- Directions geometry

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Directions API (snapshot)
- Mapbox Light style

## Data

- **Pacific Coast driving route** — Mapbox Directions API (Mapbox Terms of Service). <https://docs.mapbox.com/api/navigation/directions/> Retrieved: 2026-11-02. Rows: 187. Fields: geometry, distanceKm, durationHours.
  Simplified Directions geometry between five waypoints, with distance and duration.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/animated-route/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/animated-route
- Thumbnail: `public/thumbs/animated-route.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: route, animation, directions, time.
