import type { FeatureCollection } from 'geojson';
import type { Map as MapboxMap } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { countryFeatures, loadWorldIndicators, type CountryRecord } from '../../lib/datasets';
import { makeBreaks, stepExpression } from '../../lib/choropleth';
import { PALETTES } from '../../lib/colors';
import { formatCompact, formatDecimal, formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { loadTopology } from '../../lib/topo';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { el } from '../../lib/dom';

interface Metric {
  key: 'population' | 'density' | 'gdpPerCapita' | 'lifeExpectancy';
  label: string;
  palette: readonly string[];
  format: (value: number) => string;
  note: string;
}

const METRICS: Metric[] = [
  {
    key: 'population',
    label: 'Population',
    palette: PALETTES.ylGnBu,
    format: (value) => formatCompact(value),
    note: 'Total residents',
  },
  {
    key: 'density',
    label: 'Density',
    palette: PALETTES.orRd,
    format: (value) => `${formatNumber(value)}/km²`,
    note: 'People per sq. km',
  },
  {
    key: 'gdpPerCapita',
    label: 'GDP per capita',
    palette: PALETTES.purples,
    format: (value) => `$${formatNumber(value)}`,
    note: 'Current US$',
  },
  {
    key: 'lifeExpectancy',
    label: 'Life expectancy',
    palette: PALETTES.greens,
    format: (value) => `${formatDecimal(value, 1)} yrs`,
    note: 'At birth',
  },
];

function pickColors(palette: readonly string[]): string[] {
  const count = 5;
  return Array.from({ length: count }, (_, index) =>
    palette[Math.round((index * (palette.length - 1)) / (count - 1))],
  );
}

function valueOf(record: CountryRecord, key: Metric['key']): number | null {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function collectionFor(
  features: FeatureCollection,
  key: Metric['key'],
): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: features.features.map((feature) => {
      const record = feature.properties as CountryRecord | null;
      const value = record ? valueOf(record, key) : null;
      return {
        ...feature,
        properties: {
          name: record?.name ?? 'Unknown',
          value,
        },
      };
    }),
  };
}

function ramp(colors: string[]): HTMLElement {
  const row = el('div', 'multiples__ramp');
  for (const color of colors) {
    const swatch = el('span', 'multiples__swatch');
    swatch.style.background = color;
    row.append(swatch);
  }
  return row;
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const [topology, indicators] = await Promise.all([
    loadTopology('world/countries.topo.json'),
    loadWorldIndicators(),
  ]);
  const base = countryFeatures(topology, indicators.countries);

  container.classList.add('example-map--multiples');
  const grid = el('div', 'multiples');
  container.append(grid);

  const maps: MapboxMap[] = [];
  const cells: HTMLElement[] = [];

  for (const [index, metric] of METRICS.entries()) {
    const cell = el('div', 'multiples__cell');
    const label = el('div', 'multiples__label');
    label.innerHTML = `
      <p class="eyebrow">${String(index + 1).padStart(2, '0')}</p>
      <p class="multiples__title">${metric.label}</p>
      <p class="multiples__note">${metric.note}</p>
    `;
    cell.append(label);
    grid.append(cell);
    cells.push(cell);
  }

  for (const [index, metric] of METRICS.entries()) {
    const cell = cells[index];
    if (!cell) continue;
    const map = createMap(cell, {
      style: 'mapbox://styles/mapbox/light-v11',
      center: [10, 16],
      zoom: 1.05,
      controls: false,
    });
    maps.push(map);
    ctx.onCleanup(() => map.remove());
  }

  await Promise.all(maps.map((map) => mapLoaded(map)));

  for (const [index, metric] of METRICS.entries()) {
    const map = maps[index];
    const cell = cells[index];
    if (!map || !cell) continue;

    const collection = collectionFor(base, metric.key);
    const values = collection.features
      .map((feature) => (feature.properties as { value: number | null }).value)
      .filter((value): value is number => value != null);
    const colors = pickColors(metric.palette);
    const breaks = makeBreaks(values, colors, 'quantile');

    map.addSource('countries', { type: 'geojson', data: collection });
    addDataLayer(map, {
      id: 'countries-fill',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'value'], null],
          '#d8d1c2',
          stepExpression('value', breaks.breaks, colors),
        ],
        'fill-opacity': 0.92,
      },
    });
    addDataLayer(map, {
      id: 'countries-line',
      type: 'line',
      source: 'countries',
      paint: { 'line-color': 'rgba(24, 22, 17, 0.3)', 'line-width': 0.4 },
    });

    const legend = el('div', 'multiples__legend');
    legend.append(
      ramp(colors),
      el(
        'p',
        'multiples__range',
        `${metric.format(breaks.breaks[0])} – ${metric.format(
          breaks.breaks[breaks.breaks.length - 1],
        )}`,
      ),
    );
    cell.append(legend);

    bindHover(map, {
      layers: 'countries-fill',
      render: (feature) => {
        const properties = feature.properties as { name: string; value: number | null };
        return tooltipRows(
          [
            {
              label: metric.label,
              value: properties.value == null ? 'Not available' : metric.format(properties.value),
            },
          ],
          properties.name,
        );
      },
    });
  }

  // Camera linking: compare targets before jumping so the maps converge without
  // echoing moves back and forth.
  let syncing = false;
  const sync = (source: MapboxMap) => {
    if (syncing) return;
    const center = source.getCenter();
    const zoom = source.getZoom();
    syncing = true;
    for (const other of maps) {
      if (other === source) continue;
      const otherCenter = other.getCenter();
      const moved =
        Math.abs(otherCenter.lng - center.lng) > 1e-6 ||
        Math.abs(otherCenter.lat - center.lat) > 1e-6 ||
        Math.abs(other.getZoom() - zoom) > 1e-6;
      if (moved) other.jumpTo({ center, zoom });
    }
    syncing = false;
  };

  for (const map of maps) map.on('move', () => sync(map));

  await Promise.all(maps.map((map) => waitForIdle(map, 8000)));
  ctx.ready();
}
