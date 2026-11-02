# Example prompt: A simulated moving fleet (`live-fleet`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Eighteen vehicles travel along simplified San Francisco streets, updated every frame from a local simulation — not a live feed.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Moving assets are a common map problem: vehicles, deliveries, sensors. The pattern is the same as the animated particles earlier, but the positions are stateful and the vehicles respond to a clock.

This fleet is generated locally. Each vehicle has a path, a speed, a direction, and a status; a requestAnimationFrame ticker advances positions and rewrites one GeoJSON source. No external feed is involved, and the panel says so.

## The story

Eighteen make-believe vans rattle around San Francisco on a strict timetable. They are not real — but the pattern is: this is exactly how delivery dashboards watch the world move.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Press play to start the simulation clock.
- Change the simulation speed between 0.5×, 1×, and 2×.
- Hover a vehicle for its status and speed; idle and maintenance vehicles stay put.

## Techniques

- requestAnimationFrame ticker
- Stateful vehicle simulation
- Heading geometry
- GeoJSON source updates

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **Simulated fleet** — Generated in the browser (no external feed) (Example code · CC BY 4.0). Retrieved: 2026-11-02. Fields: id, status, speedKmh, position.
  Eighteen vehicles with hand-authored paths along Market Street, the Embarcadero, Mission, Van Ness, and nearby corridors.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/live-fleet/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/live-fleet
- Thumbnail: `public/thumbs/live-fleet.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: advanced. Tags: simulation, vehicles, animation, san francisco.
