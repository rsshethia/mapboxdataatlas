import type { FeatureCollection, MultiLineString, Point } from 'geojson';
import type { ExampleContext } from '../../lib/types';
import { loadCities, loadFlights } from '../../lib/datasets';
import { greatCircleFeature } from '../../lib/geo';
import { createTicker } from '../../lib/animation';
import { formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createCheckbox, createMapUi, createNote, createPanel } from '../../lib/ui';

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [20, 18],
    zoom: 1.1,
    projection: 'globe',
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const [cities, flights] = await Promise.all([loadCities(), loadFlights()]);

  map.setFog({
    color: 'rgba(24, 22, 17, 0.9)',
    'high-color': '#1f6f78',
    'space-color': '#0b0a08',
    'star-intensity': 0.7,
    'horizon-blend': 0.12,
  } as never);

  const cityPoints: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: cities.cities.slice(0, 400).map((city) => ({
      type: 'Feature',
      properties: {
        name: city.name,
        country: city.country,
        pop: city.pop,
      },
      geometry: { type: 'Point', coordinates: [city.lon, city.lat] },
    })),
  };

  const arcs: FeatureCollection<MultiLineString> = {
    type: 'FeatureCollection',
    features: flights.routes.slice(0, 120).map((route) =>
      greatCircleFeature(route.from, route.to, {
        fromIata: route.fromIata,
        toIata: route.toIata,
        fromName: route.fromName,
        toName: route.toName,
        count: route.count,
      }),
    ),
  };

  map.addSource('cities', { type: 'geojson', data: cityPoints });
  map.addSource('arcs', { type: 'geojson', data: arcs });

  addDataLayer(map, {
    id: 'arcs',
    type: 'line',
    source: 'arcs',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#d9a441',
      'line-opacity': 0.28,
      'line-width': 0.8,
    },
  });

  addDataLayer(map, {
    id: 'cities',
    type: 'circle',
    source: 'cities',
    paint: {
      'circle-color': '#f4f0e6',
      'circle-opacity': 0.9,
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'pop'],
        100000,
        1.2,
        1000000,
        2.4,
        5000000,
        4.4,
        20000000,
        7,
      ],
      'circle-stroke-color': '#c8462b',
      'circle-stroke-width': 0.6,
    },
  });

  let rotating = !ctx.reducedMotion;
  let longitude = 20;
  let lastPaint = 0;
  const ticker = createTicker((total) => {
    if (!rotating) return;
    if (total - lastPaint < 40) return;
    lastPaint = total;
    longitude += 0.12;
    if (longitude > 180) longitude -= 360;
    map.jumpTo({ center: [longitude, 18] });
  });
  ctx.onCleanup(() => ticker.stop());
  if (rotating) ticker.start();

  map.on('dragstart', () => {
    rotating = false;
  });

  const ui = createMapUi(container);
  const panel = createPanel('Globe');
  panel.body.append(
    createCheckbox('Auto-rotate', rotating, (checked) => {
      rotating = checked;
      if (checked && !ticker.isRunning()) ticker.start();
    }),
    createNote('Zoom in far enough and the globe flattens into Mercator.'),
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: 'cities',
    render: (feature) => {
      const properties = feature.properties as { name: string; country: string; pop: number };
      return tooltipRows(
        [
          { label: 'Population', value: formatNumber(properties.pop) },
          { label: 'Country', value: properties.country },
        ],
        properties.name,
      );
    },
  });

  bindHover(map, {
    layers: 'arcs',
    render: (feature) => {
      const properties = feature.properties as {
        fromIata: string;
        toIata: string;
        fromName: string;
        toName: string;
        count: number;
      };
      return tooltipRows(
        [
          { label: 'Route', value: `${properties.fromIata} → ${properties.toIata}` },
          { label: 'Records', value: formatNumber(properties.count) },
        ],
        `${properties.fromName} → ${properties.toName}`,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
