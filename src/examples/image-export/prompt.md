# Example prompt: Export the map as an image (`image-export`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A composed PNG export: Mapbox renders the WebGL canvas, then the example adds a title, legend, and attribution before download.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Mapbox renders into a WebGL canvas, so exporting a map is a canvas operation — but a raw canvas is not a finished graphic. This example composes the map with a paper-coloured title bar, a density legend, and the required Mapbox and OpenStreetMap attribution.

The map is created with `preserveDrawingBuffer: true`, which keeps the last frame readable by `toBlob`. That flag has a small performance cost, so it is used only on this page.

## The story

A map on screen is a performance; an exported PNG is the recording. This one signs its work — title, legend, attribution — before it leaves the building.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Press “Download PNG” to render and save the current view.
- Pan or zoom first: the export matches the visible map.
- Read the file size and pixel dimensions in the panel after export.

## Techniques

- preserveDrawingBuffer
- Canvas composition
- toBlob download
- Attribution in exports

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style
- Canvas API

## Data

- **World countries (1:110m)** — Natural Earth via world-atlas (Public domain). <https://github.com/topojson/world-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Country boundaries rendered as a population-density choropleth.

- **World Development Indicators** — World Bank (CC BY 4.0). <https://data.worldbank.org/> Retrieved: 2026-11-02. Fields: population, density.
  Population and land area, latest available 2015–2024.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/image-export/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/image-export
- Thumbnail: `public/thumbs/image-export.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intermediate. Tags: export, png, canvas, attribution.
