# Example prompt: One metric, two geographies (`zoom-choropleth`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A choropleth that changes geography with zoom: states at the national scale, counties once you zoom in.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

The same variable — people per square kilometre — is drawn at two levels of detail. At the national view the states carry the pattern; below zoom 5 the counties take over, revealing the metropolitan cores hidden inside state averages.

Both layers use quantile classes computed independently, so each geography gets a legible legend. The legend swaps automatically with the visible layer.

## The story

Texas looks uniformly Texan until you zoom in and its cities ignite. Averages lie by smoothing everything out — so this map changes its mind about geography the closer you look.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Zoom into a state to watch the county layer take over.
- Use the level buttons to lock the map to states or counties.
- Hover any polygon for its name, population, density, and area.

## Techniques

- Zoom-dependent layers
- Dual-geography join
- Quantile class breaks
- Layer visibility

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **US states and counties (1:10m)** — U.S. Census Bureau via us-atlas (Public domain). <https://github.com/topojson/us-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Cartographic boundaries for states and 3,231 counties.

- **Population and area** — County Health Rankings 2025 (ACS and BLS) (Free to use with attribution). <https://www.countyhealthrankings.org/> Retrieved: 2026-11-02. Fields: population, landAreaKm2, density.
  Population, land area, and derived density for states and counties.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/zoom-choropleth/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/zoom-choropleth
- Thumbnail: `public/thumbs/zoom-choropleth.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: choropleth, zoom, states, counties.
