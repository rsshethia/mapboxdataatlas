# Example prompt: Marching ants along trade lanes (`ant-path`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

An animated dash pattern sends pulses along air routes, a low-cost way to imply direction on static geometry.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

A dashed line is static. Animating the dash pattern — the classic “marching ants” effect — gives the eye a direction without a particle system or custom shader.

The pattern is a rotating numeric array written to `line-dasharray`. Because the array repeats, shifting it by one step produces continuous motion. The animation is throttled so the paint update stays cheap.

## The story

Ants solved logistics millions of years before airlines: just follow the glowing trail. These pulses march the same lanes real aircraft fly, giving direction to lines that never move.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Watch the direction of travel implied by the moving dashes.
- Hover a route to read its airports and route count.
- Toggle the trail layer to compare the animated lines with plain arcs.

## Techniques

- Animated line-dasharray
- Paint-property animation
- Great-circle arcs

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Dark style

## Data

- **Airports and routes** — OpenFlights (ODbL 1.0). <https://openflights.org/data.html> Retrieved: 2026-11-02. Rows: 320. Fields: from, to, count, distanceKm.
  Airline route pairs with record counts, used as flow geometry.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/ant-path/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/ant-path
- Thumbnail: `public/thumbs/ant-path.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: animation, dasharray, flows, flights.
