# Example prompt: The world’s busiest air routes (`flight-arcs`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Great-circle arcs for 320 airline routes, with line width by route count and colour by distance.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Air routes are flows, not regions. Drawing them as great-circle arcs shows the actual path an aircraft takes over the sphere rather than a straight line in Mercator.

Line width encodes how many airline route records connect a pair of airports, while colour encodes distance. Together they separate short, dense shorthaul networks from long, sparse intercontinental links.

## The story

Every arc is a queue of people who decided somewhere else would be better for a while. The busiest threads stitch the same few mega-hubs together, over and over, day after day.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Hover an arc for airports, countries, route records, and distance.
- Use the threshold to hide thin routes and isolate the densest corridors.
- Notice how the arcs bend toward the poles — that is the great-circle path, not a projection error.

## Techniques

- Great-circle interpolation
- Antimeridian splitting
- Data-driven line width
- Dual line layers

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Dark style

## Data

- **Airports and routes** — OpenFlights (ODbL 1.0). <https://openflights.org/data.html> Retrieved: 2026-11-02. Rows: 320. Fields: from, to, fromIata, toIata, count, distanceKm.
  Airport coordinates and airline route records, deduplicated and counted.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/flight-arcs/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/flight-arcs
- Thumbnail: `public/thumbs/flight-arcs.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: flights, arcs, great circle, flows.
