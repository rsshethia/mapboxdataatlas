import type { Feature, FeatureCollection } from 'geojson';
import type { ExampleContext } from '../../lib/types';
import { countryFeatures, loadWorldIndicators, type CountryRecord } from '../../lib/datasets';
import {
  makeBreaks,
  rangeLabels,
  stepExpression,
  type BreakMethod,
} from '../../lib/choropleth';
import { PALETTES } from '../../lib/colors';
import { formatCompact, formatNumber } from '../../lib/format';
import { createSteppedLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { loadTopology } from '../../lib/topo';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

function pickColors(count: number): string[] {
  const palette = PALETTES.ylGnBu;
  return Array.from({ length: count }, (_, index) =>
    palette[Math.round((index * (palette.length - 1)) / Math.max(1, count - 1))],
  );
}

function population(feature: Feature): number {
  const value = (feature.properties as CountryRecord | null)?.population;
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
}

const METHODS: Array<{ value: BreakMethod; label: string; note: string }> = [
  { value: 'quantile', label: 'Quantile', note: 'Equal counts per class' },
  { value: 'equal', label: 'Equal interval', note: 'Equal numeric width' },
  { value: 'jenks', label: 'Natural breaks', note: 'Minimised within-class variance' },
];

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [12, 18],
    zoom: 1.3,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const [topology, indicators] = await Promise.all([
    loadTopology('world/countries.topo.json'),
    loadWorldIndicators(),
  ]);

  const collection: FeatureCollection = countryFeatures(topology, indicators.countries);

  let method: BreakMethod = 'quantile';
  let count = 5;
  const values = collection.features.map(population);

  map.addSource('countries', { type: 'geojson', data: collection });

  addDataLayer(map, {
    id: 'countries-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': stepExpression(
        'population',
        makeBreaks(values, pickColors(count), method).breaks,
        pickColors(count),
      ),
      'fill-opacity': 0.9,
    },
  });

  addDataLayer(map, {
    id: 'countries-line',
    type: 'line',
    source: 'countries',
    paint: { 'line-color': 'rgba(24, 22, 17, 0.28)', 'line-width': 0.5 },
  });

  let legend: HTMLElement | null = null;
  const update = () => {
    const colors = pickColors(count);
    const breaks = makeBreaks(values, colors, method);
    map.setPaintProperty(
      'countries-fill',
      'fill-color',
      stepExpression('population', breaks.breaks, colors),
    );
    const next = createSteppedLegend({
      title: `Population · ${METHODS.find((item) => item.value === method)?.label}`,
      colors,
      labels: rangeLabels(breaks.breaks, formatCompact),
      note: METHODS.find((item) => item.value === method)?.note,
    });
    next.classList.add('legend--bottom-right');
    if (legend) legend.replaceWith(next);
    else container.append(next);
    legend = next;
  };
  update();

  const ui = createMapUi(container);
  const panel = createPanel('Classification');
  const methodButtons = createSegmented<BreakMethod>(
    METHODS.map((item) => ({ value: item.value, label: item.label })),
    method,
    (next) => {
      method = next;
      update();
    },
  );
  const countButtons = createSegmented<'3' | '5' | '7'>(
    [
      { value: '3', label: '3' },
      { value: '5', label: '5' },
      { value: '7', label: '7' },
    ],
    String(count) as '5',
    (next) => {
      count = Number(next);
      update();
    },
  );
  panel.body.append(methodButtons, countButtons, createNote('Click a method to reclassify all countries.'));
  ui.append(panel.root);

  bindHover(map, {
    layers: 'countries-fill',
    render: (feature) => {
      const record = feature.properties as CountryRecord | null;
      if (!record) return null;
      return tooltipRows(
        [
          { label: 'Population', value: formatNumber(record.population) },
          { label: 'Density', value: record.density ? `${formatNumber(record.density)}/km²` : '—' },
          { label: 'Region', value: record.region },
        ],
        record.name,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
