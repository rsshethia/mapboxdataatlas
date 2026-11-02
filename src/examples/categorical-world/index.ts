import type { FeatureCollection } from 'geojson';
import type { ExpressionSpecification } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { countryFeatures, loadWorldIndicators, type CountryRecord } from '../../lib/datasets';
import { REGION_COLORS } from '../../lib/colors';
import { formatNumber } from '../../lib/format';
import { createCategoricalLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { loadTopology } from '../../lib/topo';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

type Mode = 'region' | 'income';

const INCOME_COLORS: Record<string, string> = {
  'High income': '#1f6f78',
  'Upper middle income': '#4d5d8a',
  'Lower middle income': '#d9a441',
  'Low income': '#c8462b',
  'Not classified': '#b9b09e',
};

function categoriesFor(mode: Mode): Array<{ label: string; color: string }> {
  if (mode === 'region') {
    return Object.entries(REGION_COLORS).map(([label, color]) => ({ label, color }));
  }
  return Object.entries(INCOME_COLORS).map(([label, color]) => ({ label, color }));
}

function matchExpression(mode: Mode): ExpressionSpecification {
  const colors = mode === 'region' ? REGION_COLORS : INCOME_COLORS;
  const values: unknown[] = ['match', ['get', mode]];
  for (const [label, color] of Object.entries(colors)) values.push(label, color);
  values.push('#b9b09e');
  return values as unknown as ExpressionSpecification;
}

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

  let mode: Mode = 'region';

  map.addSource('countries', { type: 'geojson', data: collection });

  addDataLayer(map, {
    id: 'countries-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': matchExpression(mode),
      'fill-opacity': 0.9,
    },
  });

  addDataLayer(map, {
    id: 'countries-line',
    type: 'line',
    source: 'countries',
    paint: { 'line-color': 'rgba(24, 22, 17, 0.26)', 'line-width': 0.5 },
  });

  let legend: HTMLElement | null = null;
  const renderLegend = () => {
    const next = createCategoricalLegend({
      title: mode === 'region' ? 'World Bank region' : 'Income group',
      items: categoriesFor(mode),
      note: mode === 'region' ? 'Seven regions, plus “Other”.' : 'World Bank income classification.',
    });
    next.classList.add('legend--bottom-right');
    if (legend) legend.replaceWith(next);
    else container.append(next);
    legend = next;
  };
  renderLegend();

  const ui = createMapUi(container);
  const panel = createPanel('Categories');
  panel.body.append(
    createSegmented<Mode>(
      [
        { value: 'region', label: 'Region' },
        { value: 'income', label: 'Income' },
      ],
      mode,
      (next) => {
        mode = next;
        map.setPaintProperty('countries-fill', 'fill-color', matchExpression(mode));
        renderLegend();
      },
    ),
    createNote('Categories are nominal: there is no implied order or magnitude.'),
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: 'countries-fill',
    render: (feature) => {
      const record = feature.properties as CountryRecord | null;
      if (!record) return null;
      return tooltipRows(
        [
          { label: 'Region', value: record.region },
          { label: 'Income', value: record.income },
          { label: 'Population', value: formatNumber(record.population) },
        ],
        record.name,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
