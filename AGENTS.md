# AGENTS.md — working in this repo

Mapbox Data Atlas: an **independent** (not affiliated with or endorsed by
Mapbox) gallery of 30 data-visualization examples built with Mapbox GL JS
v3. Vite + vanilla TypeScript, no framework. Hash routing (`#/` gallery,
`#/e/:id` example, `#/sources` catalog).

## Commands

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Dev server | `npm run dev` → http://localhost:5173 |
| Data pipeline | `npm run data` (supports `--only=world,us,cities,quakes,flights,route`) |
| Typecheck | `npm run typecheck` |
| Unit tests | `npm run test` (vitest, `tests/*.test.ts`) |
| Browser tests | `npm run verify` (playwright, `tests/*.spec.ts`, needs a token) |
| Thumbnails | `npm run thumbs` (supports `--only=id1,id2`) |
| Example prompts | `npm run prompts` (supports `--only=…`, regenerates `prompt.md` files) |
| Build / preview | `npm run build` / `npm run preview` |
| Deploy | push to `main` — Actions builds **without** a token and ships `dist/` to Pages |

On Windows PowerShell, `npm` resolves to a broken `npm.ps1` shim — invoke
`npm.cmd` instead. In Node scripts, never `spawn` a `.cmd` without a shell;
`scripts/capture-thumbs.mjs` shows the working pattern (spawn `process.execPath`
on the JS entry point with `stdio: 'ignore'`). There is no `tail`/`head` in
PowerShell; use `Select-Object -Last N`.

## Repo map

- `src/main.ts` — shell, hash router, token dialog, `is-capturing` toggle.
- `src/gallery/` — gallery grid, example detail page (`detail.ts`: mount/cleanup lifecycle, 30s ready fallback), sources page, SVG fallback thumbnails.
- `src/examples/<id>/` — one folder per example: `meta.ts` (metadata, single source of truth), `index.ts` (the map), `prompt.md` (agent brief, generated).
- `src/lib/` — shared helpers only: `map`, `data`, `datasets`, `choropleth`, `legend`, `tooltip`, `charts`, `colors`, `dom`, `format`, `geo`, `hex`, `topo`, `animation`, `ui`, `api`, `token`. Reuse these; do not duplicate them per example.
- `scripts/` — `prepare-data.mjs` (snapshots → `public/data/`), `capture-thumbs.mjs` (→ `public/thumbs/` + `manifest.json`), `generate-prompts.mjs` (→ per-example `prompt.md`).
- `tests/` — vitest unit tests (`*.test.ts`) and playwright smoke tests (`*.spec.ts`; `playwright.config.ts` matches only `*.spec.ts`).

## Example contract (must follow for every example)

`index.ts` exports `mount(ctx: ExampleContext)`. Inside:

1. Build the map with `createMap(container, …)` from `src/lib/map.ts`.
2. Register every teardown with `ctx.onCleanup()` (`map.remove()`, ticker stops, abort controllers).
3. Call `ctx.ready()` once the map and data are drawn.
4. Mount exactly **one** map — `small-multiples` (four camera-linked maps) is the only exception.
5. `ctx` fields: `container`, `token`, `reducedMotion`, `capture`, `signal`, `onCleanup`, `ready`.

`meta.ts` fields: `id`, `order`, `title`, `category`, `blurb`, `description[]`,
`interactions[]`, `techniques[]`, `apis[]`, `data[]` (name, source, license, url,
retrieved, rows, fields), `difficulty`, `thumb`, `tags[]`, and `live?: true`
for the three runtime-API examples (`isochrone`, `geocoder`, `directions`).
`live-fleet` is simulated and must stay `live: false`. After editing any
`meta.ts`, run `npm run prompts`.

## Data

`npm run data` bundles real snapshots into `public/data/` (world/US
indicators, cities, flights, quakes, west-coast route). Examples load them via
`src/lib/datasets.ts` / `loadJSON` — never fetch remote datasets at runtime,
except the three `live` examples, which must use `mapboxApi()` in
`src/lib/api.ts` (token injection, abort support, safe errors) and label
sources `Live · each request`.

## Testing notes

- `elevation-profile` uses the terrain-heavy `outdoors-v12` style + raster DEM
  and can take ~25s to settle; smoke tests and capture allow 60s for the
  `data-example-ready="true"` flag.
- `detail.ts` marks any example ready after 30s as a fallback — a passing
  readiness flag with `.map-status--error` present means a broken example.
- Thumbnail capture hides `.map-ui`, nav controls, and loading states via
  `?capture=1` + the `is-capturing` class, but legends and attribution stay
  visible. Never capture a frame showing the token gate or a map error.

## Hard rules

- **Token safety:** the token lives in `.env` as `MAPBOX_API` (gitignored, never
  rename, never commit). Reject `sk.` tokens. Never print, log, render, or
  embed the token value in chat, screenshots, or files. To check presence,
  test length/emptiness only. Deployed `dist/` embeds the public token, so it
  needs URL restrictions + minimal scopes (Styles/Fonts read + tiles; plus
  Geocoding, Directions, Isochrone for the live examples).
- **Attribution:** Mapbox + OpenStreetMap attribution stays visible on every
  map, thumbnail, and exported PNG. Footer and `#/sources` state independence
  from Mapbox.
- **Hygiene:** kill only processes you started (never touch unrelated user
  processes); `vite preview` orphans hold their port — verify with
  `Get-NetTCPConnection` / `Win32_Process` before restarting capture.
