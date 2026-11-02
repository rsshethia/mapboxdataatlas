// Regenerate per-example agent prompts from src/examples/<id>/meta.ts.
//
// Usage: node scripts/generate-prompts.mjs [--only=id1,id2]
//
// Each example folder gets a prompt.md: a self-contained brief an AI coding
// agent (or a human) can paste into a fresh session to recreate, explain, or
// extend that example. meta.ts is the single source of truth — edit it first,
// then re-run this script.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const only = new Set(
  (onlyArg?.split('=')[1] ?? '').split(',').map((id) => id.trim()).filter(Boolean),
);

function exampleDirs() {
  const dir = path.join(root, 'src', 'examples');
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !only.size || only.has(name))
    .sort();
}

async function loadMeta(exampleId, tmpDir) {
  const metaPath = path.join(root, 'src', 'examples', exampleId, 'meta.ts');
  if (!existsSync(metaPath)) throw new Error(`Missing meta.ts for "${exampleId}".`);
  const source = readFileSync(metaPath, 'utf8');
  // Strip types via the TypeScript compiler (a direct devDependency), so the
  // metadata can be imported as plain JS. `import type` lines are elided.
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const tmpFile = path.join(tmpDir, `${exampleId}.mjs`);
  await writeFile(tmpFile, outputText);
  const module = await import(pathToFileURL(tmpFile).href);
  if (!module.meta) throw new Error(`No exported meta in "${exampleId}/meta.ts".`);
  return module.meta;
}

function dataBullet(source) {
  const fields = source.fields?.length ? ` Fields: ${source.fields.join(', ')}.` : '';
  const rows = source.rows ? ` Rows: ${source.rows.toLocaleString('en-US')}.` : '';
  const retrieved = source.retrieved ? ` Retrieved: ${source.retrieved}.` : '';
  const link = source.url ? ` <${source.url}>` : '';
  const head = `- **${source.name}** — ${source.source} (${source.license}).`;
  const desc = source.description ? `\n  ${source.description}` : '';
  return `${head}${link}${retrieved}${rows}${fields}${desc}`;
}

function promptFor(meta) {
  const maps = meta.id === 'small-multiples' ? 4 : 1;
  const lines = [
    `# Example prompt: ${meta.title} (\`${meta.id}\`)`,
    '',
    'Paste this into an AI coding agent whose working directory is the repository root.',
    '',
    '## Task',
    '',
    `${meta.blurb}`,
    '',
    'Recreate, explain, or extend this example while keeping the contract and conventions below.',
    '',
    '## Background',
    '',
    ...meta.description.flatMap((paragraph) => [paragraph, '']),
  ];

  if (meta.interactions?.length) {
    lines.push('## Things a visitor can try', '');
    for (const item of meta.interactions) lines.push(`- ${item}`);
    lines.push('');
  }

  lines.push(
    '## Techniques',
    '',
    ...meta.techniques.map((technique) => `- ${technique}`),
    '',
    '## Mapbox APIs used',
    '',
    ...meta.apis.map((api) => `- ${api}`),
    '',
    '## Data',
    '',
    ...meta.data.flatMap((source) => [dataBullet(source), '']),
  );

  if (meta.live) {
    lines.push(
      '## Live API rules (this example calls a Mapbox web API at runtime)',
      '',
      '- Route every request through `mapboxApi()` in `src/lib/api.ts`: it injects the token, supports abort, and returns safe error messages.',
      '- Abort stale in-flight requests when inputs change or the page unmounts.',
      '- Never log, render, or commit the token. Responses are not bundled; cache in memory only.',
      '- Label the data source as live (retrieved: `Live · each request`) and keep the `live: true` flag in `meta.ts`.',
      '',
    );
  }

  lines.push(
    '## Repo contract (must follow)',
    '',
    `- Framework: Vite + vanilla TypeScript, no framework. Mapbox GL JS via \`createMap\` in \`src/lib/map.ts\`.`,
    `- \`src/examples/${meta.id}/index.ts\` exports \`mount(ctx: ExampleContext)\`; register every teardown with \`ctx.onCleanup()\`; call \`ctx.ready()\` once the map and data are drawn.`,
    `- Mount exactly ${maps === 1 ? 'one map' : `${maps} maps (this is the small-multiples exception)`} and remove ${maps === 1 ? 'it' : 'them'} on cleanup.`,
    '- Keep Mapbox and OpenStreetMap attribution visible at all times, including in exports and thumbnails.',
    '- Snapshots live in `public/data/` and load via `src/lib/datasets.ts` / `loadJSON`. Do not fetch remote datasets at runtime (live API examples excepted).',
    '- Shared helpers live in `src/lib/` (choropleth, legend, tooltip, charts, colors, geo, hex, ui, animation). Reuse them; do not duplicate them per example.',
    `- If the title, techniques, data, or difficulty change, update \`meta.ts\` and re-run \`npm run prompts\` to refresh this file.`,
    '',
    '## View it',
    '',
    `- \`npm run dev\` → http://localhost:5173/#/e/${meta.id}`,
    `- Thumbnail: \`public/thumbs/${meta.id}.webp\` (regenerate with \`npm run thumbs\`).`,
    '',
    '## Done when',
    '',
    '- `npm run typecheck` passes.',
    '- The map renders with no `.map-status--error`, `data-example-ready="true"` is set, and navigating away removes all maps.',
    `- Difficulty: ${meta.difficulty}. Tags: ${(meta.tags ?? []).join(', ') || '—'}.`,
    '',
  );

  return `${lines.join('\n').trim()}\n`;
}

async function main() {
  const ids = exampleDirs();
  if (!ids.length) throw new Error('No examples found in src/examples.');
  const tmpDir = await mkdtemp(path.join(tmpdir(), 'atlas-prompts-'));
  try {
    for (const id of ids) {
      const meta = await loadMeta(id, tmpDir);
      const out = path.join(root, 'src', 'examples', id, 'prompt.md');
      await writeFile(out, promptFor({ ...meta, id }));
      console.log(`OK   ${id}`);
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
  console.log(`\nWrote ${ids.length} prompt files.`);
}

await main();
