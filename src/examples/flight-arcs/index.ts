import type { FeatureCollection, MultiLineString } from 'geojson';
import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { loadFlights, type FlightRoute } from '../../lib/datasets';
import { greatCircleFeature } from '../../lib/geo';
import { formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

type Threshold = 'all' | '2' | '4';

const THRESHOLDS: Record<Threshold, number> = { all: 1, '2': 2, '4': 4 };

function routesToGeoJSON(routes: FlightRoute[], threshold: number): FeatureCollection<MultiLineString> {
  return {
    type: 'FeatureCollection',
    features: routes
      .filter((route) => route.count >= threshold)
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
  let threshold: Threshold = 'all';

  map.addSource('routes', { type: 'geojson', data: routesToGeoJSON(dataset.routes, THRESHOLDS[threshold]) });

  addDataLayer(map, {
    id: 'routes-glow',
    type: 'line',
    source: 'routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#d9a441',
      'line-opacity': 0.16,
      'line-width': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        1,
        3,
        12,
        17,
      ],
      'line-blur': 4,
    },
  });

  addDataLayer(map, {
    id: 'routes-line',
    type: 'line',
    source: 'routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': [
        'interpolate',
        ['linear'],
        ['get', 'distanceKm'],
        500,
        '#9ecae1',
        4000,
        '#41b6c4',
        9000,
        '#d9a441',
        15000,
        '#c8462b',
      ],
      'line-opacity': 0.72,
      'line-width': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        1,
        0.5,
        4,
        1.6,
        12,
        4,
      ],
    },
  });

  addDataLayer(map, {
    id: 'airports',
    type: 'circle',
    source: 'routes',
    paint: {
      'circle-color': '#f4f0e6',
      'circle-opacity': 0.55,
      'circle-radius': 1.1,
    },
  });

  const ui = createMapUi(container);
  const panel = createPanel('Route records');
  const note = createNote('');
  const updateNote = () => {
    const visible = dataset.routes.filter((route) => route.count >= THRESHOLDS[threshold]);
    note.textContent = `${formatNumber(visible.length)} of ${formatNumber(
      dataset.routes.length,
    )} routes · width = route records`;
  };
  panel.body.append(
    createSegmented<Threshold>(
      [
        { value: 'all', label: 'All' },
        { value: '2', label: '2+' },
        { value: '4', label: '4+' },
      ],
      threshold,
      (next) => {
        threshold = next;
        const source = map.getSource('routes') as GeoJSONSource;
        source.setData(routesToGeoJSON(dataset.routes, THRESHOLDS[threshold]));
        updateNote();
      },
    ),
    note,
  );
  updateNote();
  ui.append(panel.root);

  bindHover(map, {
    layers: 'routes-line',
    render: (feature) => {
      const properties = feature.properties as {
        fromIata: string;
        toIata: string;
        fromName: string;
        toName: string;
        fromCountry: string;
        toCountry: string;
        count: number;
        distanceKm: number;
      };
      return tooltipRows(
        [
          { label: 'Airports', value: `${properties.fromIata} → ${properties.toIata}` },
          { label: 'Countries', value: `${properties.fromCountry} → ${properties.toCountry}` },
          { label: 'Route records', value: formatNumber(properties.count) },
          { label: 'Distance', value: `${formatNumber(properties.distanceKm)} km` },
        ],
        `${properties.fromName} → ${properties.toName}`,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
