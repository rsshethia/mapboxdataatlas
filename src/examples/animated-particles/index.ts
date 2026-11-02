import type { FeatureCollection, LineString, MultiLineString, Point } from 'geojson';
import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { loadFlights } from '../../lib/datasets';
import { greatCircle, greatCircleFeature, type LngLat } from '../../lib/geo';
import { createTicker } from '../../lib/animation';
import { formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

const PARTICLE_ROUTES = 140;
const STEPS = 64;

interface ParticleRoute {
  coords: LngLat[];
  count: number;
}

function buildParticles(routes: ParticleRoute[], elapsed: number, speed: number): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: routes.map((route, index) => {
      const offset = (index * 0.61803398875) % 1;
      const lengthFactor = Math.min(1, 12000 / Math.max(1200, route.count * 4000));
      const t = (offset + (elapsed / 1000) * speed * (0.35 + lengthFactor)) % 1;
      const position = route.coords[Math.min(STEPS, Math.floor(t * STEPS))] ?? route.coords[0];
      return {
        type: 'Feature',
        properties: { count: route.count },
        geometry: { type: 'Point', coordinates: position },
      };
    }),
  };
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [20, 22],
    zoom: 1.25,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const dataset = await loadFlights();
  const routes: ParticleRoute[] = dataset.routes.slice(0, PARTICLE_ROUTES).map((route) => ({
    coords: greatCircle(route.from, route.to, STEPS),
    count: route.count,
  }));

  const arcs: FeatureCollection<MultiLineString | LineString> = {
    type: 'FeatureCollection',
    features: dataset.routes
      .slice(0, PARTICLE_ROUTES)
      .map((route) =>
        greatCircleFeature(route.from, route.to, {
          fromIata: route.fromIata,
          toIata: route.toIata,
          fromName: route.fromName,
          toName: route.toName,
          fromCountry: route.fromCountry,
          toCountry: route.toCountry,
          count: route.count,
          distanceKm: route.distanceKm,
        }),
      ),
  };

  map.addSource('arcs', { type: 'geojson', data: arcs });
  map.addSource('particles', {
    type: 'geojson',
    data: buildParticles(routes, 0, 0),
  });

  addDataLayer(map, {
    id: 'arcs-line',
    type: 'line',
    source: 'arcs',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#41b6c4',
      'line-opacity': 0.22,
      'line-width': ['interpolate', ['linear'], ['get', 'count'], 1, 0.4, 12, 1.5],
    },
  });

  addDataLayer(map, {
    id: 'particles',
    type: 'circle',
    source: 'particles',
    paint: {
      'circle-color': '#f4f0e6',
      'circle-radius': 1.6,
      'circle-opacity': 0.9,
      'circle-blur': 0.2,
    },
  });

  let speed = 1;
  let elapsed = 0;
  let lastPaint = 0;
  const source = map.getSource('particles') as GeoJSONSource;
  const ticker = createTicker((total) => {
    elapsed = total;
    if (total - lastPaint < 33) return;
    lastPaint = total;
    source.setData(buildParticles(routes, elapsed, speed));
  });
  ctx.onCleanup(() => ticker.stop());

  if (ctx.reducedMotion) {
    source.setData(buildParticles(routes, 0, 0));
  } else {
    ticker.start();
  }

  const ui = createMapUi(container);
  const panel = createPanel('Motion');
  panel.body.append(
    createSegmented<'0.4' | '1' | '2.2'>(
      [
        { value: '0.4', label: 'Slow' },
        { value: '1', label: 'Normal' },
        { value: '2.2', label: 'Fast' },
      ],
      '1',
      (next) => {
        speed = Number(next);
      },
    ),
    createNote(
      ctx.reducedMotion
        ? 'Reduced motion is on, so particles are held in place.'
        : `${formatNumber(routes.length)} particles · one per route`,
    ),
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: 'arcs-line',
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
