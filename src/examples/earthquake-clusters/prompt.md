# Example prompt: Clustered earthquakes (`earthquake-clusters`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

The last 30 days of earthquakes as a clustered point layer: counts at low zoom, individual events up close.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Clustering is the point-layer answer to overplotting. At low zoom the map shows clusters with a count; as you zoom in, clusters split until individual earthquakes remain.

The size and colour of a cluster encode how many events it contains, while unclustered points are scaled and coloured by magnitude. Clicking a cluster expands it to the zoom where it splits.

## The story

While you read this sentence, the ground is moving somewhere. This is the last month of tremors, gathered into crowds — zoom in and the crowd breaks apart into individual restless spots.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Click a cluster to zoom to its expansion level.
- Hover a cluster for its event count and dominant magnitude range.
- Hover an individual point for magnitude, depth, and time.

## Techniques

- GeoJSON clustering
- Cluster expansion zoom
- Data-driven circle styling

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **Recent earthquakes (M2.5+, past 30 days)** — USGS Earthquake Hazards Program (Public domain). <https://earthquake.usgs.gov/earthquakes/feed/v1.0/> Retrieved: 2026-11-02. Fields: mag, place, time, depth, url.
  Point features normalized from the USGS summary feed.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/earthquake-clusters/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/earthquake-clusters
- Thumbnail: `public/thumbs/earthquake-clusters.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: earthquakes, clusters, interaction.
