import { defineConfig } from '@playwright/test';

const devCommand =
  process.platform === 'win32'
    ? 'npm.cmd run dev -- --port 5173 --strictPort'
    : 'npm run dev -- --port 5173 --strictPort';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  // Terrain-backed examples (outdoors style + raster DEM) can take ~20s to
  // reach idle in CI-like environments; the detail page also has a 30s
  // fallback that marks any example ready.
  timeout: 120_000,
  expect: {
    timeout: 65_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: devCommand,
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
