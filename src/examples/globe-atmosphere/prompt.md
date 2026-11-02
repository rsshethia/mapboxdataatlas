# Example prompt: A globe with atmosphere (`globe-atmosphere`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

The same city and flight data on a globe projection, with atmosphere, space colour, and a slow orbit.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Mapbox GL JS can render the world as a globe rather than a plane. The projection changes how distance and direction read, and it gives the map a horizon, atmosphere, and space colour.

The data is deliberately familiar — major cities and air routes — so the projection itself is the subject. The slow orbit is a presentation aid, not a geographic claim.

## The story

Every flat map lies a little about distance; this one stops pretending. Spin the actual sphere and flight paths become what they really are — shortcuts arcing over a curved Earth.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Drag to spin the globe; scroll to zoom in until it flattens toward Mercator.
- Toggle auto-rotate in the panel.
- Hover a city for its population; hover an arc for its route.

## Techniques

- Globe projection
- Atmosphere and fog
- Orbit animation
- Layered points and arcs

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Dark style

## Data

- **Populated places (1:50m)** — Natural Earth (Public domain). <https://www.naturalearthdata.com/downloads/50m-cultural-vectors/> Retrieved: 2026-11-02. Rows: 400. Fields: name, country, pop, lon, lat.
  The 400 largest cities by maximum population estimate.

- **Airports and routes** — OpenFlights (ODbL 1.0). <https://github.com/jpatokal/openflights> Retrieved: 2026-11-02. Rows: 120. Fields: from, to, count.
  The 120 densest route pairs, drawn as great-circle arcs.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/globe-atmosphere/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/globe-atmosphere
- Thumbnail: `public/thumbs/globe-atmosphere.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: globe, atmosphere, cities, flights.
