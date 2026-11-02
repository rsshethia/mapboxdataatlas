# Example prompt: Routing between two points (`directions`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Live Mapbox Directions routes between four city pairs, with driving, cycling, and walking profiles.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

The Directions API returns more than a line: distance, duration, and a full-resolution geometry that follows the street network. This example requests that geometry and draws it over the map with start and end markers.

Each preset is a real pair of coordinates. Switching the profile or the pair sends a new request; the previous request is aborted so a slow response cannot overwrite a newer one. Responses are cached in memory for the session only.

## Things a visitor can try

- Choose a city pair, then switch between driving, cycling, and walking.
- Read the distance, duration, and implied average speed from the panel.
- Notice how the route geometry changes with the profile, not just the duration.

## Techniques

- Live Directions API
- GeoJSON route geometry
- Request caching
- Fit to route

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Directions API
- Mapbox Light style

## Data

- **Routes (live)** — Mapbox Directions API (Mapbox Terms of Service). <https://docs.mapbox.com/api/navigation/directions/> Retrieved: Live · each request. Fields: geometry, distance, duration.
  Route geometry, distance, and duration returned by the Mapbox Directions API.

## Live API rules (this example calls a Mapbox web API at runtime)

- Route every request through `mapboxApi()` in `src/lib/api.ts`: it injects the token, supports abort, and returns safe error messages.
- Abort stale in-flight requests when inputs change or the page unmounts.
- Never log, render, or commit the token. Responses are not bundled; cache in memory only.
- Label the data source as live (retrieved: `Live · each request`) and keep the `live: true` flag in `meta.ts`.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/directions/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/directions
- Thumbnail: `public/thumbs/directions.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intro. Tags: directions, routing, live api, navigation.
