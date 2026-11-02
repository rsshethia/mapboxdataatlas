# Example prompt: Travel time from one point (`isochrone`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Live isochrone contours from the Mapbox Isochrone API: what you can reach in 10, 20, and 30 minutes by road, bike, or on foot.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

An isochrone is a contour of equal travel time. Unlike a buffer, it respects the street network, coastlines, and one-way restrictions, so the shape is a picture of accessibility rather than distance.

This example calls the Mapbox Isochrone API each time you change the travel mode or the time bands. Requests are isolated to this page and aborted when you navigate away; no response is cached or bundled.

## Things a visitor can try

- Switch between driving, cycling, and walking.
- Change the time bands between 10–30 and 20–60 minutes.
- Hover a contour to read its travel time.

## Techniques

- Live Isochrone API
- Network travel time
- Contour polygons
- Request cancellation

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Isochrone API
- Mapbox Light style

## Data

- **Isochrone contours (live)** — Mapbox Isochrone API (Mapbox Terms of Service). <https://docs.mapbox.com/api/navigation/isochrone/> Retrieved: Live · each request. Fields: contour, geometry.
  Contour polygons requested from the Mapbox Isochrone API for a fixed origin in Copenhagen.

## Live API rules (this example calls a Mapbox web API at runtime)

- Route every request through `mapboxApi()` in `src/lib/api.ts`: it injects the token, supports abort, and returns safe error messages.
- Abort stale in-flight requests when inputs change or the page unmounts.
- Never log, render, or commit the token. Responses are not bundled; cache in memory only.
- Label the data source as live (retrieved: `Live · each request`) and keep the `live: true` flag in `meta.ts`.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/isochrone/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/isochrone
- Thumbnail: `public/thumbs/isochrone.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: isochrone, accessibility, live api, travel time.
