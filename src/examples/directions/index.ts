import type { FeatureCollection, LineString } from 'geojson';
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { apiMessage, mapboxApi } from '../../lib/api';
import { formatDecimal, formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { createMapUi, createMetric, createNote, createPanel, createSegmented } from '../../lib/ui';

type Profile = 'driving' | 'cycling' | 'walking';
type LngLat = [number, number];

interface Preset {
  id: string;
  label: string;
  from: LngLat;
  to: LngLat;
}

interface DirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: LineString;
  }>;
}

const PRESETS: Preset[] = [
  { id: 'west', label: 'Seattle → San Diego', from: [-122.3321, 47.6062], to: [-117.1611, 32.7157] },
  { id: 'nyc', label: 'New York → Chicago', from: [-74.006, 40.7128], to: [-87.6298, 41.8781] },
  { id: 'rockies', label: 'Denver → Moab', from: [-104.9903, 39.7392], to: [-109.5498, 38.5733] },
  { id: 'florida', label: 'Miami → Orlando', from: [-80.1918, 25.7617], to: [-81.3792, 28.5383] },
];

function emptyLine(): FeatureCollection<LineString> {
  return { type: 'FeatureCollection', features: [] };
}

function endpoints(from: LngLat, to: LngLat): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { role: 'start' }, geometry: { type: 'Point', coordinates: from } },
      { type: 'Feature', properties: { role: 'end' }, geometry: { type: 'Point', coordinates: to } },
    ],
  };
}

function durationLabel(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (!hours) return `${minutes} min`;
  return `${hours} h ${String(minutes).padStart(2, '0')} min`;
}

function fitToCoordinates(map: MapboxMap, coords: LngLat[]): void {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }
  map.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    { padding: 80, maxZoom: 12, duration: 850 },
  );
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-100, 39],
    zoom: 3.4,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  map.addSource('route', { type: 'geojson', data: emptyLine() });
  map.addSource('endpoints', {
    type: 'geojson',
    data: endpoints(PRESETS[0].from, PRESETS[0].to),
  });

  addDataLayer(map, {
    id: 'route-casing',
    type: 'line',
    source: 'route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#f4f0e6', 'line-width': 6.5, 'line-opacity': 0.9 },
  });
  addDataLayer(map, {
    id: 'route-line',
    type: 'line',
    source: 'route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#1f6f78', 'line-width': 3.4 },
  });
  addDataLayer(map, {
    id: 'endpoints',
    type: 'circle',
    source: 'endpoints',
    paint: {
      'circle-color': ['match', ['get', 'role'], 'start', '#c8462b', '#181611'],
      'circle-radius': 6,
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 2,
    },
  });

  const ui = createMapUi(container);
  const panel = createPanel('Route');
  const note = createNote('Requesting directions…');
  const distanceMetric = createMetric('Distance', '—');
  const durationMetric = createMetric('Duration', '—');
  const speedMetric = createMetric('Average speed', '—');
  const metrics = document.createElement('div');
  metrics.className = 'metric-row';
  metrics.append(distanceMetric, durationMetric, speedMetric);

  let preset = PRESETS[0];
  let profile: Profile = 'driving';
  let controller: AbortController | null = null;
  let requestId = 0;
  const cache = new Map<string, DirectionsResponse>();

  const setMetrics = (distanceKm: number | null, hours: number | null) => {
    (distanceMetric.querySelector('.metric__value') as HTMLElement).textContent =
      distanceKm == null ? '—' : `${formatNumber(distanceKm)} km`;
    (durationMetric.querySelector('.metric__value') as HTMLElement).textContent =
      hours == null ? '—' : durationLabel(hours * 3600);
    (speedMetric.querySelector('.metric__value') as HTMLElement).textContent =
      distanceKm == null || hours == null || hours <= 0
        ? '—'
        : `${formatDecimal(distanceKm / hours, 1)} km/h`;
  };

  const load = async () => {
    requestId += 1;
    const current = requestId;
    const key = `${preset.id}:${profile}`;
    const cached = cache.get(key);
    if (cached) {
      apply(cached, false);
      return;
    }
    controller?.abort();
    controller = new AbortController();
    note.textContent = `Routing ${preset.label} · ${profile}…`;
    try {
      const response = await mapboxApi<DirectionsResponse>(
        `directions/v5/mapbox/${profile}/${preset.from[0]},${preset.from[1]};${preset.to[0]},${preset.to[1]}`,
        {
          geometries: 'geojson',
          overview: 'full',
          steps: false,
        },
        controller.signal,
      );
      if (current !== requestId || ctx.signal.aborted) return;
      cache.set(key, response);
      apply(response, true);
    } catch (error) {
      if (current !== requestId || ctx.signal.aborted) return;
      note.textContent = apiMessage(error);
      setMetrics(null, null);
    }
  };

  const apply = (response: DirectionsResponse, fit: boolean) => {
    const route = response.routes[0];
    if (!route) {
      note.textContent = 'No route found for this pair and profile.';
      setMetrics(null, null);
      return;
    }
    const source = map.getSource('route') as GeoJSONSource;
    source.setData({ type: 'Feature', properties: {}, geometry: route.geometry });
    const points = map.getSource('endpoints') as GeoJSONSource;
    points.setData(endpoints(preset.from, preset.to));
    const distanceKm = route.distance / 1000;
    const hours = route.duration / 3600;
    setMetrics(distanceKm, hours);
    note.textContent = `${preset.label} · ${profile} · ${route.geometry.coordinates.length} geometry points`;
    if (fit) fitToCoordinates(map, route.geometry.coordinates as LngLat[]);
  };

  panel.body.append(
    metrics,
    createSegmented<string>(
      PRESETS.map((item) => ({ value: item.id, label: item.label })),
      preset.id,
      (next) => {
        preset = PRESETS.find((item) => item.id === next) ?? PRESETS[0];
        void load();
      },
    ),
    createSegmented<Profile>(
      [
        { value: 'driving', label: 'Drive' },
        { value: 'cycling', label: 'Cycle' },
        { value: 'walking', label: 'Walk' },
      ],
      profile,
      (next) => {
        profile = next;
        void load();
      },
    ),
    note,
    createNote('Live Directions API · responses cached in memory for this session only.'),
  );
  ui.append(panel.root);

  ctx.onCleanup(() => controller?.abort());

  await load();
  await waitForIdle(map, 8000);
  ctx.ready();
}
