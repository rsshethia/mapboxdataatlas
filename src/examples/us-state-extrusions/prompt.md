# Example prompt: State population density, extruded (`us-state-extrusions`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

US states raised into 3D blocks by population density, with colour reinforcing the same measure.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Fill-extrusion turns a flat choropleth into a landscape. Here the height of each state is a function of population density, so the Northeast rises above the Mountain West.

Height is not area: the vertical axis uses an interpolated scale capped well below the tallest state’s raw value, and the colour ramp repeats the same variable so the map remains readable without the 3D cue.

## Things a visitor can try

- Drag with the right mouse button (or Ctrl-drag) to tilt and rotate.
- Hover a state for population, density, income, and unemployment.
- Use the height multiplier to exaggerate or flatten the extrusion.

## Techniques

- fill-extrusion
- Interpolated height
- TopoJSON join
- Pitch and bearing

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **US states (1:10m)** — U.S. Census Bureau via us-atlas (Public domain). <https://github.com/topojson/us-atlas> Retrieved: 2026-11-02. Fields: id, name.
  State boundaries from the Census Bureau cartographic boundary files.

- **State population and income** — County Health Rankings 2025 (ACS and BLS) (Free to use with attribution). <https://www.countyhealthrankings.org/> Retrieved: 2026-11-02. Fields: population, density, medianIncome, unemploymentRate.
  Population, median household income, and unemployment rate.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/us-state-extrusions/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/us-state-extrusions
- Thumbnail: `public/thumbs/us-state-extrusions.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: 3d, fill-extrusion, states, density.
