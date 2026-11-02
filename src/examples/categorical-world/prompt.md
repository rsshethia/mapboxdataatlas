# Example prompt: A categorical world (`categorical-world`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

Countries coloured by World Bank region, with a switch to income group — no class breaks, just categories.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Not every choropleth needs a numeric scale. Categorical maps answer “which group does this belong to?” and are the right choice for regions, income bands, or governance types.

Region is geographic by construction, so the map mostly confirms what you already know. Income group is more revealing: it cuts across continents and shows the middle-income belt that stretches from Latin America through Africa to Southeast Asia.

## Things a visitor can try

- Switch between region and income group in the panel.
- Hover a country for its region, income group, and population.
- Find the countries that are “Not classified” and ask why.

## Techniques

- Categorical fill
- Match expressions
- Join by ISO identifier

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **World countries (1:110m)** — Natural Earth via world-atlas (Public domain). <https://github.com/topojson/world-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Country boundaries joined to World Bank metadata.

- **World Bank country metadata** — World Bank (CC BY 4.0). <https://data.worldbank.org/> Retrieved: 2026-11-02. Fields: region, income, population.
  World Bank region and income classification.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/categorical-world/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/categorical-world
- Thumbnail: `public/thumbs/categorical-world.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intro. Tags: categorical, region, income, world.
