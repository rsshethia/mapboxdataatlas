import { expect, test } from '@playwright/test';

// Terrain-backed examples can take ~20s for the style + DEM to settle, and
// the detail page marks any example ready after 30s as a fallback.
const READY_TIMEOUT = 60_000;

test('gallery lists 30 examples without loading maps', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.card')).toHaveCount(30);
  await expect(page.locator('canvas.mapboxgl-canvas')).toHaveCount(0);
  await expect(page.locator('.site-nav a[href="#/how-it-works"]')).toHaveCount(1);
});

test('how-it-works explains the pipeline without maps', async ({ page }) => {
  await page.goto('/#/how-it-works', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.how-page h1')).toContainText('spreadsheet become a map');
  await expect(page.locator('.how-step')).toHaveCount(5);
  await expect(page.locator('.how-flow__node')).toHaveCount(4);
  await expect(page.locator('canvas.mapboxgl-canvas')).toHaveCount(0);
});

test('world-choropleth renders with map attribution', async ({ page }) => {
  await page.goto('/#/e/world-choropleth', { waitUntil: 'domcontentloaded' });
  const stage = page.locator('[data-example-id="world-choropleth"]');
  await expect(stage).toHaveAttribute('data-example-ready', 'true', {
    timeout: READY_TIMEOUT,
  });
  await expect(stage.locator('canvas.mapboxgl-canvas')).toHaveCount(1);
  await expect(stage.locator('.map-status--error')).toHaveCount(0);
  const attribution = stage.locator('.mapboxgl-ctrl-attrib');
  await expect(attribution).toHaveCount(1);
  await expect(attribution).toContainText(/Mapbox|OpenStreetMap/);
});

test('small-multiples links four maps and cleans up', async ({ page }) => {
  await page.goto('/#/e/small-multiples', { waitUntil: 'domcontentloaded' });
  const stage = page.locator('[data-example-id="small-multiples"]');
  await expect(stage).toHaveAttribute('data-example-ready', 'true', {
    timeout: READY_TIMEOUT,
  });
  await expect(stage.locator('canvas.mapboxgl-canvas')).toHaveCount(4);

  await page.goto('/#/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.card')).toHaveCount(30);
  await expect(page.locator('canvas.mapboxgl-canvas')).toHaveCount(0);
});

test('gallery shows captured thumbnails', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.card')).toHaveCount(30);
  // Thumbnails load from public/thumbs/manifest.json; the SVG fallback stays
  // underneath, so every card ends up with a photo once captured.
  await expect(page.locator('.card__image[src]')).toHaveCount(30, {
    timeout: 30_000,
  });
});

test.describe('narrow viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('legends start collapsed behind their toggle', async ({ page }) => {
    await page.goto('/#/e/world-choropleth', { waitUntil: 'domcontentloaded' });
    const stage = page.locator('[data-example-id="world-choropleth"]');
    await expect(stage).toHaveAttribute('data-example-ready', 'true', {
      timeout: READY_TIMEOUT,
    });
    const toggle = stage.locator('.legend-toggle__button');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(stage.locator('.legend-toggle__body')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(stage.locator('.legend-toggle__body')).toBeVisible();
  });
});

test('geocoder is labeled live and returns results', async ({ page }) => {
  await page.goto('/#/e/geocoder', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.example-header .chip--live')).toContainText('Live API');
  const stage = page.locator('[data-example-id="geocoder"]');
  await expect(stage).toHaveAttribute('data-example-ready', 'true', {
    timeout: READY_TIMEOUT,
  });
  // The example searches for "Copenhagen" on mount via the live API.
  await expect(stage.locator('.search-result').first()).toBeVisible({
    timeout: 30_000,
  });
});
