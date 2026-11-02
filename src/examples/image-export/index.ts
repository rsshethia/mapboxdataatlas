import type { FeatureCollection } from 'geojson';
import type { Map as MapboxMap } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { countryFeatures, loadWorldIndicators, type CountryRecord } from '../../lib/datasets';
import { makeBreaks, rangeLabels, stepExpression } from '../../lib/choropleth';
import { PALETTES } from '../../lib/colors';
import { formatNumber } from '../../lib/format';
import { createSteppedLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { loadTopology } from '../../lib/topo';
import { createMapUi, createNote, createPanel } from '../../lib/ui';

const COLORS = [PALETTES.orRd[1], PALETTES.orRd[3], PALETTES.orRd[4], PALETTES.orRd[5], PALETTES.orRd[6]];

function nextFrame(map: MapboxMap): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    map.once('render', finish);
    map.triggerRepaint();
    window.setTimeout(finish, 900);
  });
}

function compose(source: HTMLCanvasElement, breaks: number[], colors: string[]): HTMLCanvasElement {
  const width = source.width;
  const height = source.height;
  const scale = Math.min(2, Math.max(1, width / 1000));
  const header = Math.round(84 * scale);
  const footer = Math.round(38 * scale);
  const output = document.createElement('canvas');
  output.width = width;
  output.height = header + height + footer;

  const context = output.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable in this browser.');

  context.fillStyle = '#f4f0e6';
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(source, 0, header);

  const pad = Math.round(24 * scale);
  context.fillStyle = '#181611';
  context.font = `${Math.round(26 * scale)}px Fraunces, Georgia, serif`;
  context.textBaseline = 'alphabetic';
  context.fillText('Population density', pad, Math.round(40 * scale));

  context.fillStyle = '#6d6659';
  context.font = `${Math.round(10 * scale)}px "Inter", Arial, sans-serif`;
  context.fillText(
    'People per square kilometre · World Bank, Natural Earth · Mapbox Data Atlas',
    pad,
    Math.round(60 * scale),
  );

  const rampWidth = Math.min(230 * scale, width * 0.28);
  const rampX = width - pad - rampWidth;
  const swatch = rampWidth / colors.length;
  colors.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(rampX + index * swatch, Math.round(26 * scale), swatch, Math.round(9 * scale));
  });
  context.fillStyle = '#6d6659';
  context.font = `${Math.round(9 * scale)}px "Inter", Arial, sans-serif`;
  context.textAlign = 'left';
  context.fillText(formatNumber(breaks[0]), rampX, Math.round(52 * scale));
  context.textAlign = 'right';
  context.fillText(formatNumber(breaks[breaks.length - 1]), rampX + rampWidth, Math.round(52 * scale));

  context.textAlign = 'left';
  context.fillStyle = 'rgba(24, 22, 17, 0.16)';
  context.fillRect(0, header + height, width, 1);
  context.fillStyle = '#6d6659';
  context.font = `${Math.round(9.5 * scale)}px "Inter", Arial, sans-serif`;
  context.fillText('© Mapbox  © OpenStreetMap', pad, header + height + Math.round(24 * scale));
  context.textAlign = 'right';
  context.fillText(
    'Independent example · not affiliated with Mapbox',
    width - pad,
    header + height + Math.round(24 * scale),
  );

  return output;
}

function download(canvas: HTMLCanvasElement, filename: string): Promise<number> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('The browser could not encode the canvas.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      resolve(blob.size);
    }, 'image/png');
  });
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [14, 22],
    zoom: 1.35,
    preserveDrawingBuffer: true,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const [topology, indicators] = await Promise.all([
    loadTopology('world/countries.topo.json'),
    loadWorldIndicators(),
  ]);
  const collection: FeatureCollection = countryFeatures(topology, indicators.countries);
  const values = collection.features
    .map((feature) => (feature.properties as CountryRecord | null)?.density)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const breaks = makeBreaks(values, COLORS, 'quantile');

  map.addSource('countries', { type: 'geojson', data: collection });
  addDataLayer(map, {
    id: 'countries-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': stepExpression('density', breaks.breaks, COLORS),
      'fill-opacity': 0.94,
    },
  });
  addDataLayer(map, {
    id: 'countries-line',
    type: 'line',
    source: 'countries',
    paint: { 'line-color': 'rgba(24, 22, 17, 0.28)', 'line-width': 0.5 },
  });

  const legend = createSteppedLegend({
    title: 'People per sq. km',
    colors: COLORS,
    labels: rangeLabels(breaks.breaks, (value) => formatNumber(value)),
    note: 'Included in the exported image.',
  });
  legend.classList.add('legend--bottom-right');
  container.append(legend);

  const ui = createMapUi(container);
  const panel = createPanel('Export');
  const note = createNote('The PNG includes the map, title, legend, and attribution.');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button button--dark';
  button.textContent = 'Download PNG';
  let busy = false;

  button.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    button.disabled = true;
    button.textContent = 'Rendering…';
    try {
      await waitForIdle(map, 5000);
      await nextFrame(map);
      const composed = compose(map.getCanvas(), breaks.breaks, COLORS);
      const bytes = await download(composed, 'mapbox-data-atlas-population-density.png');
      note.textContent = `Saved ${composed.width} × ${composed.height} px · ${(
        bytes / 1024
      ).toFixed(0)} KB · attribution included.`;
    } catch (error) {
      note.textContent = error instanceof Error ? error.message : 'The export failed.';
    } finally {
      busy = false;
      button.disabled = false;
      button.textContent = 'Download PNG';
    }
  });

  panel.body.append(button, note, createNote('The map uses preserveDrawingBuffer only on this page.'));
  ui.append(panel.root);

  bindHover(map, {
    layers: 'countries-fill',
    render: (feature) => {
      const record = feature.properties as CountryRecord | null;
      if (!record) return null;
      return tooltipRows(
        [
          { label: 'Density', value: record.density ? `${formatNumber(record.density)}/km²` : '—' },
          { label: 'Population', value: formatNumber(record.population) },
        ],
        record.name,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
