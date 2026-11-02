// Capture per-example thumbnails with Playwright.
//
// Spins up `vite preview` against dist/, visits each example with
// `?capture=1` (which hides map UI chrome via the `is-capturing` class but
// keeps legends and attribution visible), waits for the example readiness
// flag, and screenshots the `.example-map` stage directly to WebP.
//
// Requirements:
//   - `npm run build` has been run (serves the static bundle from dist/).
//   - A public Mapbox token was present at build time (MAPBOX_API in .env),
//     otherwise every page shows the token gate and nothing is captured.
//
// Usage: node scripts/capture-thumbs.mjs [--only=id1,id2]
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const READY_TIMEOUT = 60_000;

const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const only = new Set(
  (onlyArg?.split('=')[1] ?? '').split(',').map((id) => id.trim()).filter(Boolean),
);

function exampleIds() {
  const dir = path.join(root, 'src', 'examples');
  const ids = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const metaPath = path.join(dir, entry.name, 'meta.ts');
    if (!existsSync(metaPath)) continue;
    const text = readFileSync(metaPath, 'utf8');
    const match = text.match(/id:\s*'([^']+)'/);
    if (match?.[1] && (!only.size || only.has(match[1]))) ids.push(match[1]);
  }
  return ids.sort();
}

function startPreview() {
  // Spawn the Vite binary directly (no shell, no pipes): `server.kill()`
  // then reliably terminates it and nothing holds the event loop open.
  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  return spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: root,
    stdio: 'ignore',
  });
}

async function waitForServer(timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {
      // Not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Preview server did not start on ${BASE} within ${timeoutMs}ms.`);
}

async function main() {
  if (!existsSync(path.join(root, 'dist', 'index.html'))) {
    throw new Error('dist/ is missing. Run "npm run build" before capturing thumbnails.');
  }

  const ids = exampleIds();
  if (!ids.length) throw new Error('No examples found in src/examples.');
  console.log(`Capturing ${ids.length} thumbnails from ${BASE}.`);

  const server = startPreview();
  const failures = [];
  try {
    await waitForServer();

    const browser = await chromium.launch();
    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        reducedMotion: 'reduce',
      });
      const outDir = path.join(root, 'public', 'thumbs');
      await mkdir(outDir, { recursive: true });

      const captured = [];
      for (const id of ids) {
        const page = await context.newPage();
        try {
          await page.goto(`${BASE}/?capture=1#/e/${id}`, {
            waitUntil: 'domcontentloaded',
          });
          const gated = await page.locator('.token-gate').count();
          if (gated) {
            console.log(`SKIP ${id}: token gate is showing (no usable token in this build).`);
            failures.push(`${id} (token gate)`);
            continue;
          }
          await page.waitForSelector(
            `[data-example-id="${id}"][data-example-ready="true"]`,
            { timeout: READY_TIMEOUT },
          );
          if (await page.locator('.map-status--error').count()) {
            console.log(`SKIP ${id}: map reported an error; not capturing a broken frame.`);
            failures.push(`${id} (map error)`);
            continue;
          }
          const stage = page.locator('.example-map');
          await stage.screenshot({
            path: path.join(outDir, `${id}.webp`),
            type: 'webp',
            quality: 82,
          });
          captured.push(id);
          console.log(`OK   ${id}`);
        } catch (error) {
          console.log(`FAIL ${id}: ${error.message.split('\n')[0]}`);
          failures.push(id);
        } finally {
          await page.close();
        }
      }

      await writeFile(
        path.join(outDir, 'manifest.json'),
        `${JSON.stringify({ ids: captured }, null, 2)}\n`,
      );
      console.log(`Wrote manifest with ${captured.length}/${ids.length} thumbnails.`);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill();
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 5000);
      server.on('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  if (failures.length) {
    console.log(`\n${failures.length} captures failed or skipped: ${failures.join(', ')}`);
    process.exit(1);
  }
  console.log('\nAll thumbnails captured.');
}

await main();
