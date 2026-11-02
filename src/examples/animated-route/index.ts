import type { FeatureCollection, Point } from 'geojson';
import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { loadRoute } from '../../lib/datasets';
import { haversineKm, type LngLat } from '../../lib/geo';
import { createTicker } from '../../lib/animation';
import { formatDecimal, formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { createCheckbox, createMapUi, createMetric, createNote, createPanel } from '../../lib/ui';

const CYCLE_MS = 24000;

interface ProgressSample {
  position: LngLat;
  slice: LngLat[];
  distanceKm: number;
}

function sampleProgress(coords: LngLat[], cumulative: number[], total: number, t: number): ProgressSample {
  const target = total * Math.min(1, Math.max(0, t));
  let index = 0;
  while (index < cumulative.length - 2 && cumulative[index + 1] < target) index += 1;
  const start = coords[index];
  const end = coords[index + 1] ?? start;
  const segment = (cumulative[index + 1] ?? total) - (cumulative[index] ?? 0);
  const local = segment > 0 ? (target - (cumulative[index] ?? 0)) / segment : 0;
  const position: LngLat = [
    start[0] + (end[0] - start[0]) * local,
    start[1] + (end[1] - start[1]) * local,
  ];
  return {
    position,
    slice: [...coords.slice(0, index + 1), position],
    distanceKm: target,
  };
}

function pointCollection(position: LngLat): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: position } },
    ],
  };
}

function lineCollection(slice: LngLat[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: slice },
      },
    ],
  };
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const route = await loadRoute();
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-121.2, 41.5],
    zoom: 4.4,
  });
  ctx.onCleanup(() => map.remove());
  await mapLoaded(map);

  const coords = route.geometry.coordinates as LngLat[];
  const cumulative = [0];
  for (let index = 1; index < coords.length; index += 1) {
    cumulative.push(cumulative[index - 1] + haversineKm(coords[index - 1], coords[index]));
  }
  const total = cumulative[cumulative.length - 1] || 1;
  const hours = route.properties.durationHours ?? null;

  map.addSource('route', { type: 'geojson', data: route });
  map.addSource('progress', {
    type: 'geojson',
    data: lineCollection(coords),
  });
  map.addSource('marker', {
    type: 'geojson',
    data: pointCollection(sampleProgress(coords, cumulative, total, 0).position),
  });

  addDataLayer(map, {
    id: 'route-base',
    type: 'line',
    source: 'route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': 'rgba(24, 22, 17, 0.18)', 'line-width': 3 },
  });

  addDataLayer(map, {
    id: 'route-progress',
    type: 'line',
    source: 'progress',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#1f6f78', 'line-width': 4.5 },
  });

  addDataLayer(map, {
    id: 'route-marker',
    type: 'circle',
    source: 'marker',
    paint: {
      'circle-color': '#c8462b',
      'circle-radius': 7,
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 2.5,
    },
  });

  // Start and end caps are separate point sources so they stay put.
  map.addSource('ends', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { role: 'start' }, geometry: { type: 'Point', coordinates: coords[0] } },
        {
          type: 'Feature',
          properties: { role: 'end' },
          geometry: { type: 'Point', coordinates: coords[coords.length - 1] },
        },
      ],
    },
  });
  addDataLayer(map, {
    id: 'route-ends',
    type: 'circle',
    source: 'ends',
    paint: {
      'circle-color': ['match', ['get', 'role'], 'start', '#c8462b', '#181611'],
      'circle-radius': 6,
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 2,
    },
  });

  const progressSource = map.getSource('progress') as GeoJSONSource;
  const markerSource = map.getSource('marker') as GeoJSONSource;

  let progress = ctx.reducedMotion ? 1 : 0;
  let playing = false;
  let follow = false;

  const distanceLabel = document.createElement('span');
  const timeLabel = document.createElement('span');
  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.className = 'play-button';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '1000';
  slider.value = String(Math.round(progress * 1000));
  slider.className = 'range';
  slider.setAttribute('aria-label', 'Route progress');

  const render = () => {
    const sample = sampleProgress(coords, cumulative, total, progress);
    progressSource.setData(lineCollection(sample.slice));
    markerSource.setData(pointCollection(sample.position));
    distanceLabel.textContent = `${formatNumber(sample.distanceKm)} km`;
    timeLabel.textContent =
      hours == null ? '—' : `${formatDecimal((sample.distanceKm / total) * hours, 1)} h`;
    slider.value = String(Math.round(progress * 1000));
    playButton.textContent = playing ? '❚❚' : '▶';
    if (follow) map.jumpTo({ center: sample.position });
  };

  const ticker = createTicker((_total, delta) => {
    if (!playing) return;
    progress += delta / CYCLE_MS;
    if (progress >= 1) {
      progress = 1;
      playing = false;
    }
    render();
  });
  ctx.onCleanup(() => ticker.stop());

  playButton.addEventListener('click', () => {
    if (!playing && progress >= 1) progress = 0;
    playing = !playing;
    if (playing && !ticker.isRunning()) ticker.start();
    render();
  });

  slider.addEventListener('input', () => {
    playing = false;
    progress = Number(slider.value) / 1000;
    render();
  });

  if (!ctx.reducedMotion) {
    playing = true;
    ticker.start();
  }

  const ui = createMapUi(container);
  const panel = createPanel('Playback');
  const metrics = document.createElement('div');
  metrics.className = 'metric-row';
  const distanceMetric = createMetric('Distance', '0 km');
  const timeMetric = createMetric('Driving time', '—');
  // Replace the value nodes so they can be updated by render().
  (distanceMetric.querySelector('.metric__value') as HTMLElement).replaceWith(distanceLabel);
  distanceLabel.className = 'metric__value';
  (timeMetric.querySelector('.metric__value') as HTMLElement).replaceWith(timeLabel);
  timeLabel.className = 'metric__value';
  metrics.append(distanceMetric, timeMetric);

  const controls = document.createElement('div');
  controls.className = 'play-row';
  controls.append(playButton, slider);

  panel.body.append(metrics, controls, createCheckbox('Follow marker', false, (checked) => {
    follow = checked;
  }), createNote('Drag the slider to scrub; press play to resume.'));
  ui.append(panel.root);

  render();
  await waitForIdle(map, 4000);
  ctx.ready();
}
