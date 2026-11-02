# Example prompt: Search the world (`geocoder`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A live Mapbox Geocoding search box: type a place, choose a result, and fly the map to it.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Geocoding turns text into coordinates. The Mapbox Geocoding API returns ranked places, addresses, and points of interest with bounding boxes, which is often more useful than a single point.

This example debounces typing, aborts stale requests, and fits the map to the chosen result’s bounding box. The search is live and isolated to this page; nothing is pre-bundled.

## Things a visitor can try

- Type a place name and press Enter, or wait for suggestions.
- Click a result to move the map and mark it.
- Try the suggested searches for dense cities, long countries, and small islands.

## Techniques

- Live Geocoding API
- Debounced requests
- Abort stale searches
- Fit to bounding box

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Geocoding API
- Mapbox Light style

## Data

- **Geocoding results (live)** — Mapbox Geocoding API (Mapbox Terms of Service). <https://docs.mapbox.com/api/search/geocoding/> Retrieved: Live · each search. Fields: place_name, center, bbox, place_type.
  Place names, coordinates, and bounding boxes returned by the Mapbox Geocoding API.

## Live API rules (this example calls a Mapbox web API at runtime)

- Route every request through `mapboxApi()` in `src/lib/api.ts`: it injects the token, supports abort, and returns safe error messages.
- Abort stale in-flight requests when inputs change or the page unmounts.
- Never log, render, or commit the token. Responses are not bundled; cache in memory only.
- Label the data source as live (retrieved: `Live · each request`) and keep the `live: true` flag in `meta.ts`.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/geocoder/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/geocoder
- Thumbnail: `public/thumbs/geocoder.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intro. Tags: geocoder, search, live api, fly-to.
