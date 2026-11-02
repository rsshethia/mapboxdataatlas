import type { FeatureCollection, LineString, Point } from 'geojson';
import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { createTicker } from '../../lib/animation';
import { formatDecimal, formatNumber } from '../../lib/format';
import { haversineKm, type LngLat } from '../../lib/geo';
import { createCategoricalLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createMetric, createNote, createPanel, createSegmented } from '../../lib/ui';

type Status = 'moving' | 'idle' | 'maintenance';

interface Path {
  coords: LngLat[];
  cumulative: number[];
  length: number;
}

interface Vehicle {
  id: string;
  path: Path;
  t: number;
  direction: 1 | -1;
  speedKmh: number;
  status: Status;
}

const PATHS: LngLat[][] = [
  [
    [-122.3965, 37.7935],
    [-122.4018, 37.7915],
    [-122.4075, 37.7896],
    [-122.4130, 37.7876],
    [-122.4185, 37.7855],
    [-122.4235, 37.7835],
    [-122.4290, 37.7810],
  ],
  [
    [-122.3960, 37.7890],
    [-122.4005, 37.7865],
    [-122.4050, 37.7840],
    [-122.4095, 37.7812],
    [-122.4140, 37.7780],
    [-122.4220, 37.7720],
  ],
  [
    [-122.3930, 37.7950],
    [-122.3922, 37.7985],
    [-122.3912, 37.8022],
    [-122.3903, 37.8060],
    [-122.3900, 37.8098],
    [-122.3930, 37.8135],
  ],
  [
    [-122.4195, 37.7790],
    [-122.4203, 37.7820],
    [-122.4215, 37.7855],
    [-122.4227, 37.7895],
    [-122.4235, 37.7930],
    [-122.4245, 37.8020],
  ],
  [
    [-122.3890, 37.7770],
    [-122.3905, 37.7800],
    [-122.3920, 37.7825],
    [-122.3935, 37.7852],
    [-122.3950, 37.7880],
  ],
  [
    [-122.4090, 37.7865],
    [-122.4150, 37.7862],
    [-122.4220, 37.7860],
    [-122.4350, 37.7855],
    [-122.4400, 37.7838],
    [-122.4470, 37.7810],
  ],
  [
    [-122.3900, 37.7650],
    [-122.3950, 37.7650],
    [-122.4000, 37.7650],
    [-122.4050, 37.7650],
    [-122.4100, 37.7650],
  ],
  [
    [-122.3920, 37.7850],
    [-122.3970, 37.7820],
    [-122.4020, 37.7790],
    [-122.4065, 37.7762],
    [-122.4110, 37.7735],
  ],
];

const STATUS_COLORS: Record<Status, string> = {
  moving: '#1f6f78',
  idle: '#d9a441',
  maintenance: '#c8462b',
};

const SIM_ACCEL = 8;

function buildPath(coords: LngLat[]): Path {
  const cumulative = [0];
  for (let index = 1; index < coords.length; index += 1) {
    cumulative.push(cumulative[index - 1] + haversineKm(coords[index - 1], coords[index]));
  }
  return { coords, cumulative, length: cumulative[cumulative.length - 1] || 1 };
}

const paths = PATHS.map(buildPath);

function sample(path: Path, t: number): LngLat {
  const target = Math.max(0, Math.min(1, t)) * path.length;
  let index = 0;
  while (index < path.cumulative.length - 2 && path.cumulative[index + 1] < target) index += 1;
  const start = path.coords[index];
  const end = path.coords[index + 1] ?? start;
  const span = (path.cumulative[index + 1] ?? path.length) - (path.cumulative[index] ?? 0);
  const local = span > 0 ? (target - (path.cumulative[index] ?? 0)) / span : 0;
  return [start[0] + (end[0] - start[0]) * local, start[1] + (end[1] - start[1]) * local];
}

const vehicles: Vehicle[] = Array.from({ length: 18 }, (_, index) => {
  const status: Status = index === 3 || index === 11 ? 'idle' : index === 7 ? 'maintenance' : 'moving';
  return {
    id: `SF-${String(index + 1).padStart(2, '0')}`,
    path: paths[index % paths.length],
    t: (index * 0.173) % 1,
    direction: index % 2 === 0 ? 1 : -1,
    speedKmh: status === 'moving' ? 16 + ((index * 7) % 26) : 0,
    status,
  };
});

function formatClock(seconds: number): string {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-122.4085, 37.7895],
    zoom: 12.9,
    pitch: 38,
    bearing: -22,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const pathCollection: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: paths.map((path, index) => ({
      type: 'Feature',
      properties: { id: index },
      geometry: { type: 'LineString', coordinates: path.coords },
    })),
  };

  map.addSource('paths', { type: 'geojson', data: pathCollection });
  map.addSource('vehicles', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addSource('headings', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  addDataLayer(map, {
    id: 'paths',
    type: 'line',
    source: 'paths',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': 'rgba(24, 22, 17, 0.22)',
      'line-width': 2.2,
      'line-dasharray': [2, 2],
    },
  });

  addDataLayer(map, {
    id: 'headings',
    type: 'line',
    source: 'headings',
    layout: { 'line-cap': 'round' },
    paint: {
      'line-color': [
        'match',
        ['get', 'status'],
        'moving',
        STATUS_COLORS.moving,
        'idle',
        STATUS_COLORS.idle,
        STATUS_COLORS.maintenance,
      ],
      'line-width': 1.6,
      'line-opacity': 0.7,
    },
  });

  addDataLayer(map, {
    id: 'vehicles-halo',
    type: 'circle',
    source: 'vehicles',
    paint: {
      'circle-color': [
        'match',
        ['get', 'status'],
        'moving',
        STATUS_COLORS.moving,
        'idle',
        STATUS_COLORS.idle,
        STATUS_COLORS.maintenance,
      ],
      'circle-radius': 12,
      'circle-opacity': 0.16,
    },
  });

  addDataLayer(map, {
    id: 'vehicles',
    type: 'circle',
    source: 'vehicles',
    paint: {
      'circle-color': [
        'match',
        ['get', 'status'],
        'moving',
        STATUS_COLORS.moving,
        'idle',
        STATUS_COLORS.idle,
        STATUS_COLORS.maintenance,
      ],
      'circle-radius': ['case', ['==', ['get', 'status'], 'moving'], 5.5, 4.5],
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 1.8,
    },
  });

  const vehicleSource = map.getSource('vehicles') as GeoJSONSource;
  const headingSource = map.getSource('headings') as GeoJSONSource;

  const pointFeatures = (): FeatureCollection<Point> => ({
    type: 'FeatureCollection',
    features: vehicles.map((vehicle) => ({
      type: 'Feature',
      properties: {
        id: vehicle.id,
        status: vehicle.status,
        speedKmh: vehicle.speedKmh,
      },
      geometry: { type: 'Point', coordinates: sample(vehicle.path, vehicle.t) },
    })),
  });

  const headingFeatures = (): FeatureCollection<LineString> => ({
    type: 'FeatureCollection',
    features: vehicles
      .filter((vehicle) => vehicle.status === 'moving')
      .map((vehicle) => {
        const position = sample(vehicle.path, vehicle.t);
        const ahead = sample(vehicle.path, vehicle.t + vehicle.direction * 0.012);
        const end =
          Math.abs(ahead[0] - position[0]) < 1e-9 && Math.abs(ahead[1] - position[1]) < 1e-9
            ? sample(vehicle.path, vehicle.t - vehicle.direction * 0.012)
            : ahead;
        return {
          type: 'Feature',
          properties: { id: vehicle.id, status: vehicle.status },
          geometry: { type: 'LineString', coordinates: [position, end] },
        };
      }),
  });

  const vehicleMetric = createMetric('Vehicles', formatNumber(vehicles.length));
  const speedMetric = createMetric('Average speed', '—');
  const clockMetric = createMetric('Sim clock', '00:00');
  const metrics = document.createElement('div');
  metrics.className = 'metric-row';
  metrics.append(vehicleMetric, speedMetric, clockMetric);

  const speedValue = speedMetric.querySelector('.metric__value') as HTMLElement;
  const clockValue = clockMetric.querySelector('.metric__value') as HTMLElement;

  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.className = 'play-button';

  let playing = !ctx.reducedMotion;
  let speedFactor = 1;
  let simSeconds = 0;
  let lastMetrics = 0;

  let pending = 0;
  const update = () => {
    vehicleSource.setData(pointFeatures());
    headingSource.setData(headingFeatures());
  };

  const ticker = createTicker((_elapsed, delta) => {
    if (!playing) return;
    simSeconds += (delta / 1000) * SIM_ACCEL * speedFactor;
    for (const vehicle of vehicles) {
      if (vehicle.status !== 'moving') continue;
      const step = (vehicle.speedKmh * (delta / 3_600_000) * SIM_ACCEL * speedFactor) / vehicle.path.length;
      vehicle.t += step * vehicle.direction;
      if (vehicle.t >= 1) {
        vehicle.t = 1;
        vehicle.direction = -1;
      } else if (vehicle.t <= 0) {
        vehicle.t = 0;
        vehicle.direction = 1;
      }
    }
    pending += delta;
    if (pending >= 32) {
      pending = 0;
      update();
    }
    if (simSeconds - lastMetrics > 0.4) {
      lastMetrics = simSeconds;
      const moving = vehicles.filter((vehicle) => vehicle.status === 'moving');
      speedValue.textContent = moving.length
        ? `${formatDecimal(
            moving.reduce((sum, vehicle) => sum + vehicle.speedKmh, 0) / moving.length,
            1,
          )} km/h`
        : '—';
      clockValue.textContent = formatClock(simSeconds);
    }
  });
  ctx.onCleanup(() => ticker.stop());

  const setPlaying = (next: boolean) => {
    playing = next;
    playButton.textContent = playing ? '❚❚' : '▶';
    playButton.setAttribute('aria-label', playing ? 'Pause simulation' : 'Play simulation');
    if (playing) {
      if (!ticker.isRunning()) ticker.start();
      ticker.setPaused(false);
    } else {
      ticker.setPaused(true);
    }
  };

  playButton.addEventListener('click', () => setPlaying(!playing));

  const ui = createMapUi(container);
  const panel = createPanel('Simulation');
  const controls = document.createElement('div');
  controls.className = 'play-row';
  controls.append(playButton);

  panel.body.append(
    metrics,
    controls,
    createSegmented<'0.5' | '1' | '2'>(
      [
        { value: '0.5', label: '0.5×' },
        { value: '1', label: '1×' },
        { value: '2', label: '2×' },
      ],
      '1',
      (next) => {
        speedFactor = Number(next);
      },
    ),
    createNote(
      `Simulated locally at ${SIM_ACCEL}× real time. These are not live vehicle positions.`,
    ),
  );
  ui.append(panel.root);

  const legend = createCategoricalLegend({
    title: 'Fleet status',
    items: [
      { label: 'Moving', color: STATUS_COLORS.moving },
      { label: 'Idle', color: STATUS_COLORS.idle },
      { label: 'Maintenance', color: STATUS_COLORS.maintenance },
    ],
    note: 'Eighteen simulated vehicles.',
  });
  legend.classList.add('legend--bottom-right');
  container.append(legend);

  bindHover(map, {
    layers: 'vehicles',
    render: (feature) => {
      const properties = feature.properties as {
        id: string;
        status: Status;
        speedKmh: number;
      };
      return tooltipRows(
        [
          { label: 'Status', value: properties.status },
          {
            label: 'Speed',
            value: properties.status === 'moving' ? `${properties.speedKmh} km/h` : 'Stationary',
          },
        ],
        properties.id,
      );
    },
  });

  update();
  setPlaying(playing);
  if (playing) ticker.start();

  await waitForIdle(map, 4000);
  ctx.ready();
}
