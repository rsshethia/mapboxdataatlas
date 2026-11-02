# Example prompt: Particles along air routes (`animated-particles`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Moving points travel along great-circle arcs, animating the direction and volume of the world’s air network.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Static arcs show where flows exist; moving particles show that they have a direction. Each particle follows the same great-circle path as its route, at a speed scaled to route length.

The animation is a ticking GeoJSON source: every frame rewrites one point per route. It is a deliberately simple technique — no custom WebGL — that stays smooth for a few hundred particles.

## Things a visitor can try

- Watch the dominant west-to-east and north-south corridors.
- Use the speed control to slow the animation down.
- Hover a faint arc to inspect the underlying route.

## Techniques

- requestAnimationFrame ticker
- GeoJSON source updates
- Great-circle sampling
- Reduced-motion fallback

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Dark style

## Data

- **Airports and routes** — OpenFlights (ODbL 1.0). <https://openflights.org/data.html> Retrieved: 2026-11-02. Rows: 320. Fields: from, to, count, distanceKm.
  The 320 densest airline route pairs from OpenFlights.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/animated-particles/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/animated-particles
- Thumbnail: `public/thumbs/animated-particles.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: advanced. Tags: animation, particles, flights, flows.
