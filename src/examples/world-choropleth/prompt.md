# Example prompt: World population, in class breaks (`world-choropleth`)

Paste this into an AI coding agent whose working directory is the repository root.

## Task

A quantile choropleth of population by country, with a switch between total population and people per square kilometre.

Recreate, explain, or extend this example while keeping the contract and conventions below.

## Background

Population is extremely skewed: a handful of countries hold most of the world’s people. Quantile breaks put the same number of countries in each colour class, which makes the map legible without hiding the outliers.

Switch to population density to see the same geometry tell a different story. The classes are recalculated for each metric, so the legend always matches the colours on the map.

## The story

Two countries hold more than a third of all humanity, and most maps flatten them into one boring colour. This one refuses — then flip to density and watch tiny crowded city-states outshout entire continents.

Every change to the example must keep this story true. If the story stops matching the data, update `meta.ts` and re-run `npm run prompts`.

## Things a visitor can try

- Switch between population and density in the panel.
- Hover a country to read its values and class.
- Notice how quantile classes flatten the difference between China and India, then compare with density.

## Techniques

- TopoJSON → GeoJSON
- Quantile class breaks
- Step expressions
- Interactive legend

## Mapbox APIs used

- Mapbox GL JS
- Mapbox Light style

## Data

- **World countries (1:110m)** — Natural Earth via world-atlas (Public domain). <https://github.com/topojson/world-atlas> Retrieved: 2026-11-02. Fields: id, name.
  Country boundaries and numeric ISO identifiers.

- **World Development Indicators** — World Bank (CC BY 4.0). <https://data.worldbank.org/> Retrieved: 2026-11-02. Fields: population, gdpPerCapita, lifeExpectancy, landAreaKm2, density.
  Population, GDP per capita, life expectancy, and land area, latest available 2015–2024.

## Repo contract (must follow)

- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via `createMap` in `src/lib/map.ts`.
- `src/examples/world-choropleth/index.ts` exports `mount(ctx: ExampleContext)`; register every teardown with `ctx.onCleanup()`; call `ctx.ready()` once the map and data are drawn.
- Mount exactly one map and remove it on cleanup.
- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.
- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).
- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.
- If the title, techniques, data, or difficulty change, update `meta.ts` and re-run `npm run prompts` to refresh this file.

## View it

- `npm run dev` → http://localhost:5173/#/e/world-choropleth
- Thumbnail: `public/thumbs/world-choropleth.webp` (regenerate with `npm run thumbs`).

## Done when

- `npm run typecheck` passes.
- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.
- Difficulty: intro. Tags: population, choropleth, world.
