import type { FeatureCollection, LineString, MultiLineString } from 'geojson';
import type { ExampleContext } from '../../lib/types';
import { loadFlights } from '../../lib/datasets';
import { greatCircleFeature } from '../../lib/geo';
import { createTicker } from '../../lib/animation';
import { formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createCheckbox, createMapUi, createNote, createPanel } from '../../lib/ui';

const PATTERN = [0.6, 3.4, 1.8, 2.2, 0.6, 5.2, 1.8, 3.4];

function rotatePattern(offset: number): number[] {
  const index = ((offset % PATTERN.length) + PATTERN.length) % PATTERN.length;
  return [...PATTERN.slice(index), ...PATTERN.slice(0, index)];
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [24, 24],
    zoom: 1.2,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const dataset = await loadFlights();
  const collection: FeatureCollection<MultiLineString | LineString> = {
    type: 'FeatureCollection',
    features: dataset.routes.slice(0, 200).map((route) =>
      greatCircleFeature(route.from, route.to, {
        fromIata: route.fromIata,
        toIata: route.toIata,
        fromName: route.fromName,
        toName: route.toName,
        count: route.count,
        distanceKm: route.distanceKm,
      }),
    ),
  };

  map.addSource('routes', { type: 'geojson', data: collection });

  addDataLayer(map, {
    id: 'routes-halo',
    type: 'line',
    source: 'routes',
    layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: {
      'line-color': '#d9a441',
      'line-opacity': 0.16,
      'line-width': 3.4,
      'line-blur': 3,
    },
  });

  addDataLayer(map, {
    id: 'routes-dash',
    type: 'line',
    source: 'routes',
    layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: {
      'line-color': [
        'interpolate',
        ['linear'],
        ['get', 'distanceKm'],
        500,
        '#9ecae1',
        6000,
        '#41b6c4',
        12000,
        '#d9a441',
        18000,
        '#c8462b',
      ],
      'line-opacity': 0.85,
      'line-width': ['interpolate', ['linear'], ['get', 'count'], 1, 1, 12, 2.6],
      'line-dasharray': rotatePattern(0),
    },
  });

  let phase = 0;
  let lastPaint = 0;
  const ticker = createTicker((total) => {
    if (total - lastPaint < 70) return;
    lastPaint = total;
    phase += 1;
    map.setPaintProperty('routes-dash', 'line-dasharray', rotatePattern(phase));
  });
  ctx.onCleanup(() => ticker.stop());
  if (!ctx.reducedMotion) ticker.start();

  const ui = createMapUi(container);
  const panel = createPanel('Animation');
  panel.body.append(
    createCheckbox('Animate dashes', !ctx.reducedMotion, (checked) => {
      if (checked) ticker.start();
      else ticker.stop();
    }),
    createNote(
      ctx.reducedMotion
        ? 'Reduced motion is on; the static pattern still implies a dashed route.'
        : 'Pattern shifts one step every ~70 ms.',
    ),
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: 'routes-dash',
    render: (feature) => {
      const properties = feature.properties as {
        fromIata: string;
        toIata: string;
        fromName: string;
        toName: string;
        count: number;
        distanceKm: number;
      };
      return tooltipRows(
        [
          { label: 'Route', value: `${properties.fromIata} → ${properties.toIata}` },
          { label: 'Records', value: formatNumber(properties.count) },
          { label: 'Distance', value: `${formatNumber(properties.distanceKm)} km` },
        ],
        `${properties.fromName} → ${properties.toName}`,
      );
    },
  });

  await waitForIdle(map, 4000);
  ctx.ready();
}
