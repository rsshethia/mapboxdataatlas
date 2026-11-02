import type { FeatureCollection } from 'geojson';
import type { ExampleContext } from '../../lib/types';
import { loadUsIndicators, type UsRecord } from '../../lib/datasets';
import { formatCompact, formatNumber } from '../../lib/format';
import { createSteppedLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { joinById, loadTopology, topologyFeatures } from '../../lib/topo';
import { createMapUi, createNote, createPanel, createRange } from '../../lib/ui';

const COLORS = ['#fff5f0', '#fcbba1', '#fb6a4a', '#cb181d', '#67000d'];

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-96, 38],
    zoom: 3.1,
    pitch: 45,
    bearing: -8,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const [topology, indicators] = await Promise.all([
    loadTopology('us/states.topo.json'),
    loadUsIndicators(),
  ]);

  const collection: FeatureCollection = topologyFeatures(topology, 'states');
  joinById(collection, indicators.states as unknown as Record<string, Record<string, unknown>>);

  map.addSource('states', { type: 'geojson', data: collection });

  let multiplier = 1;
  const heightExpression = (scale: number): unknown => [
    'interpolate',
    ['linear'],
    ['coalesce', ['get', 'density'], 0],
    0,
    0,
    20,
    6000 * scale,
    100,
    26000 * scale,
    300,
    62000 * scale,
    500,
    90000 * scale,
  ];

  addDataLayer(map, {
    id: 'states-extrusion',
    type: 'fill-extrusion',
    source: 'states',
    paint: {
      'fill-extrusion-height': heightExpression(multiplier) as never,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.92,
      'fill-extrusion-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'density'], 0],
        0,
        COLORS[0],
        20,
        COLORS[1],
        80,
        COLORS[2],
        200,
        COLORS[3],
        450,
        COLORS[4],
      ],
    },
  });

  addDataLayer(map, {
    id: 'states-outline',
    type: 'line',
    source: 'states',
    paint: { 'line-color': 'rgba(24, 22, 17, 0.28)', 'line-width': 0.5 },
  });

  const legend = createSteppedLegend({
    title: 'People per sq. km',
    colors: COLORS,
    labels: ['0–20', '20–80', '80–200', '200–450', '450+'],
    note: 'Height and colour use the same density scale.',
  });
  legend.classList.add('legend--bottom-right');
  container.append(legend);

  const ui = createMapUi(container);
  const panel = createPanel('Vertical exaggeration');
  panel.body.append(
    createRange({
      label: 'Height',
      min: 0.2,
      max: 2.5,
      step: 0.1,
      value: multiplier,
      format: (value) => `${value.toFixed(1)}×`,
      onInput: (value) => {
        multiplier = value;
        map.setPaintProperty(
          'states-extrusion',
          'fill-extrusion-height',
          heightExpression(multiplier) as never,
        );
      },
    }),
    createNote('Heights are meters of extrusion, not an elevation surface.'),
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: 'states-extrusion',
    render: (feature) => {
      const record = feature.properties as UsRecord | null;
      if (!record) return null;
      return tooltipRows(
        [
          { label: 'Population', value: formatNumber(record.population) },
          { label: 'Density', value: record.density ? `${formatNumber(record.density)}/km²` : '—' },
          {
            label: 'Median income',
            value: record.medianIncome ? `$${formatNumber(record.medianIncome)}` : '—',
          },
          {
            label: 'Unemployment',
            value:
              record.unemploymentRate == null ? '—' : `${record.unemploymentRate.toFixed(1)}%`,
          },
          {
            label: 'Area',
            value: record.landAreaKm2 ? `${formatCompact(record.landAreaKm2)} km²` : '—',
          },
        ],
        record.name,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
