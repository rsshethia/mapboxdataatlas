# Mapbox Data Atlas 🗺️

Thirty working maps that turn boring spreadsheets into pictures that make people go *"ohhh"* — all built with the Mapbox API. Steal the code. Keep the "ohhh".

**Live site:** https://rsshethia.github.io/mapboxdataatlas/
**New here?** Start with [How it works](https://rsshethia.github.io/mapboxdataatlas/#/how-it-works) — a five-minute, zero-jargon tour of how a spreadsheet becomes a map.

> Independent project. Not affiliated with or endorsed by Mapbox. Mapbox® is a trademark of Mapbox, Inc.

## Keys: yours, mine, or nobody's

Maps aren't free to serve, so Mapbox asks every map *"who sent you?"* That is all a token is — a hall pass. **On the live site, you're covered:** it ships with the author's public key, locked to that address. Just open it and poke around.

Running your own copy, or curious how the sausage is made?

1. Grab a free public key at [account.mapbox.com](https://account.mapbox.com/access-tokens/) (it starts with `pk.` — never use one starting with `sk.`, that one is a secret and secrets don't belong in browsers).
2. For local dev: put it in `.env` as `MAPBOX_API` — or skip the file and press **Add token** (top right) to paste it into the browser instead. Browser-pasted keys always win and live only in *your* browser.
3. For your own live site: save the key as a `MAPBOX_API` repo secret (see Deploying below) and lock it down at Mapbox with URL restrictions + minimal scopes (Styles/Fonts read and tiles, plus Geocoding, Directions, and Isochrone if you want the three live examples). Details in `.env.example`.

## Run it on your machine

```sh
npm install
npm run data     # download the real datasets (one time)
npm run dev      # open http://localhost:5173
```

Copy `.env.example` to `.env` and put your `pk.` key in as `MAPBOX_API` — or skip it and paste the key in the browser instead. Both work. `.env` is gitignored and must stay that way.

| Command | What it does |
|---|---|
| `npm run dev` | Local playground |
| `npm run build` | Typecheck + static bundle into `dist/` |
| `npm test` | Unit tests (fast) |
| `npm run verify` | Real browsers open real maps (needs a key) |
| `npm run thumbs` | Screenshot all 30 gallery thumbnails |
| `npm run prompts` | Refresh the per-example agent briefs (see below) |

## What's inside

30 examples in 5 families: **themed maps** (choropleths, bubbles, hexagons), **flows & time** (flight arcs, earthquakes that replay history), **3D & terrain** (extruded cities, a hikeable mountain profile), **linked views** (brush a chart, watch the map obey), and **live APIs + export** (search, routing, travel-time donuts, PNG download).

Every example shows its source code *and* its data sources right next to the map. No black boxes.

## 🤖 For AI agents (yes, really)

This repo is agent-friendly on purpose:

- **`AGENTS.md`** — the field manual: commands, architecture, the example contract, hard rules.
- **`src/examples/<id>/prompt.md`** — a copy-paste brief for every single example. Paste one into a fresh agent session and it can recreate, explain, or extend that example. Generated from `meta.ts`, so run `npm run prompts` after editing metadata.

Humans: everything above works for you too. The prompts are just unusually well-organized documentation wearing a trench coat.

## How the magic works (30-second version)

Your data (rows with addresses) + Mapbox's planet (tiles of streets and borders) + a style recipe (JSON that says "big numbers = big bubbles") + your graphics card (paints it 60 times a second) = someone going "ohhh". The long, funny version lives on the [How it works](https://rsshethia.github.io/mapboxdataatlas/#/how-it-works) page.

## Put your own copy on GitHub Pages

Push to `main` — the included [workflow](.github/workflows/deploy.yml) builds and deploys automatically. Then enable it once: repo **Settings → Pages → Source: GitHub Actions**.

The build bakes in **your** public key, so visitors get working maps with zero setup. To wire that up, add it once as a repo secret: **Settings → Secrets and variables → Actions → New repository secret**, name `MAPBOX_API`, value your `pk.` key. (No secret? The build still succeeds — it just falls back to asking each visitor for their own key.)

Because any key shipped in a web page is visible by design, lock yours down at [account.mapbox.com](https://account.mapbox.com/access-tokens/): URL-restrict it to your site (e.g. `https://rsshethia.github.io/mapboxdataatlas/*`, plus `http://localhost:5173/*` if you want local dev to keep working) and keep only the scopes the gallery needs.

Hash routing (`#/…`) means no server config and no refresh-404s.

## Data & credit

Snapshots live in `public/data/` so examples load fast and never change under you: Natural Earth and US Census boundaries (public domain), World Bank indicators (CC BY 4.0), USGS earthquakes (public domain), plus live Mapbox search/routing/isochrone on three labeled examples. Full license table: the **Data & sources** page in the site footer.

Maps © Mapbox © OpenStreetMap. Dataset owners keep their rights; this gallery just borrows their numbers to make pretty pictures.
