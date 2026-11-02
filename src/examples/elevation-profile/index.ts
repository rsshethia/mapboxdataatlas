import { area, bisector, line, pointer, scaleLinear } from 'd3';
import type { Point } from 'geojson';
import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { loadRoute } from '../../lib/datasets';
import { haversineKm, type LngLat } from '../../lib/geo';
import { formatDecimal, formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { createChartFrame, renderXAxis, renderYAxis } from '../../lib/charts';
import { createMapUi, createNote, createPanel } from '../../lib/ui';

interface Sample {
  distanceKm: number;
  elevation: number;
  position: LngLat;
}

function interpolate(coords: LngLat[], cumulative: number[], distance: number): LngLat {
  let index = 0;
  while (index < cumulative.length - 2 && cumulative[index + 1] < distance) index += 1;
  const start = coords[index];
  const end = coords[index + 1] ?? start;
  const span = (cumulative[index + 1] ?? distance) - (cumulative[index] ?? 0);
  const t = span > 0 ? (distance - (cumulative[index] ?? 0)) / span : 0;
  return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t];
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const route = await loadRoute();
  const coords = route.geometry.coordinates as LngLat[];

  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [-121.2, 42],
    zoom: 5.2,
    pitch: 52,
    bearing: 12,
  });
  ctx.onCleanup(() => map.remove());
  await mapLoaded(map);

  map.addSource('dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14,
  });
  map.setTerrain({ source: 'dem', exaggeration: 1.4 });

  map.addSource('route', { type: 'geojson', data: route });
  addDataLayer(map, {
    id: 'route-line',
    type: 'line',
    source: 'route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#c8462b', 'line-width': 2.4, 'line-opacity': 0.9 },
  });

  map.addSource('profile-marker', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  });
  addDataLayer(map, {
    id: 'profile-marker',
    type: 'circle',
    source: 'profile-marker',
    paint: {
      'circle-color': '#181611',
      'circle-radius': 6,
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 2,
    },
  });

  await waitForIdle(map);

  const cumulative = [0];
  for (let index = 1; index < coords.length; index += 1) {
    cumulative.push(cumulative[index - 1] + haversineKm(coords[index - 1], coords[index]));
  }
  const total = cumulative[cumulative.length - 1] || 1;

  const sampleCount = 220;
  const samples: Sample[] = [];
  let missing = 0;
  for (let index = 0; index <= sampleCount; index += 1) {
    const distance = (total * index) / sampleCount;
    const position = interpolate(coords, cumulative, distance);
    const raw = map.queryTerrainElevation(position);
    if (raw == null) missing += 1;
    samples.push({ distanceKm: distance, elevation: raw ?? 0, position });
  }

  const elevations = samples.map((sample) => sample.elevation);
  const min = Math.min(...elevations);
  const max = Math.max(...elevations);
  let gain = 0;
  for (let index = 1; index < samples.length; index += 1) {
    const delta = samples[index].elevation - samples[index - 1].elevation;
    if (delta > 0) gain += delta;
  }

  const panel = document.createElement('div');
  panel.className = 'profile-panel';
  const head = document.createElement('div');
  head.className = 'profile-panel__head';
  head.innerHTML = `
    <div>
      <p class="eyebrow">Elevation profile</p>
      <p class="profile-panel__title">Seattle → San Diego</p>
    </div>
    <div class="profile-panel__stats">
      <span><strong>${formatNumber(min)} m</strong> low</span>
      <span><strong>${formatNumber(max)} m</strong> high</span>
      <span><strong>${formatNumber(gain)} m</strong> ascent</span>
    </div>
  `;
  panel.append(head);
  const chartHost = document.createElement('div');
  chartHost.className = 'profile-panel__chart';
  panel.append(chartHost);
  container.append(panel);

  const frame = createChartFrame(chartHost, {
    width: 1000,
    height: 220,
    margin: { top: 16, right: 20, bottom: 34, left: 56 },
  });

  const x = scaleLinear().domain([0, total]).range([0, frame.innerWidth]);
  const y = scaleLinear()
    .domain([Math.max(0, min - 30), max + 80])
    .nice()
    .range([frame.innerHeight, 0]);

  const areaPath = area<Sample>()
    .x((sample) => x(sample.distanceKm))
    .y0(frame.innerHeight)
    .y1((sample) => y(sample.elevation));
  const linePath = line<Sample>()
    .x((sample) => x(sample.distanceKm))
    .y((sample) => y(sample.elevation));

  frame.plot
    .append('path')
    .datum(samples)
    .attr('fill', 'rgba(31, 111, 120, 0.16)')
    .attr('d', areaPath);

  frame.plot
    .append('path')
    .datum(samples)
    .attr('fill', 'none')
    .attr('stroke', '#1f6f78')
    .attr('stroke-width', 1.6)
    .attr('d', linePath);

  for (let index = 1; index < 5; index += 1) {
    frame.plot
      .append('line')
      .attr('x1', (frame.innerWidth * index) / 5)
      .attr('x2', (frame.innerWidth * index) / 5)
      .attr('y1', 0)
      .attr('y2', frame.innerHeight)
      .attr('stroke', 'rgba(24, 22, 17, 0.08)');
  }

  renderXAxis(frame, x, 'Distance (km)');
  renderYAxis(frame, y, 'Elevation (m)', (value) => `${Math.round(value)}`);

  const focus = frame.plot.append('g').style('display', 'none');
  const focusLine = focus
    .append('line')
    .attr('y1', 0)
    .attr('y2', frame.innerHeight)
    .attr('stroke', '#c8462b')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3 3');
  const focusDot = focus
    .append('circle')
    .attr('r', 4)
    .attr('fill', '#c8462b')
    .attr('stroke', '#f4f0e6')
    .attr('stroke-width', 1.5);
  const focusLabel = focus
    .append('text')
    .attr('class', 'profile-focus-label')
    .attr('text-anchor', 'middle');

  const markerSource = map.getSource('profile-marker') as GeoJSONSource;
  const updateMarker = (sample: Sample) => {
    const feature: Point = { type: 'Point', coordinates: sample.position };
    markerSource.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: feature }] });
  };

  const bisect = bisector<Sample, number>((sample) => sample.distanceKm).center;

  frame.plot
    .append('rect')
    .attr('width', frame.innerWidth)
    .attr('height', frame.innerHeight)
    .attr('fill', 'transparent')
    .style('cursor', 'crosshair')
    .on('pointermove', (event: PointerEvent) => {
      const [mx] = pointer(event, frame.plot.node() as SVGGElement);
      const distance = Math.max(0, Math.min(total, x.invert(mx)));
      const sample = samples[bisect(samples, distance)] ?? samples[0];
      if (!sample) return;
      focus.style('display', null);
      focusLine.attr('x1', x(sample.distanceKm)).attr('x2', x(sample.distanceKm));
      focusDot.attr('cx', x(sample.distanceKm)).attr('cy', y(sample.elevation));
      focusLabel
        .attr('x', x(sample.distanceKm))
        .attr('y', Math.max(12, y(sample.elevation) - 10))
        .text(`${formatNumber(sample.elevation)} m`);
      updateMarker(sample);
    })
    .on('pointerleave', () => {
      focus.style('display', 'none');
      markerSource.setData({ type: 'FeatureCollection', features: [] });
    });

  if (missing > sampleCount / 3) {
    const ui = createMapUi(container);
    const notePanel = createPanel('Sampling');
    notePanel.body.append(
      createNote(
        `${missing} of ${sampleCount} terrain samples were unavailable; missing values are drawn at sea level. Try reloading.`,
      ),
    );
    ui.append(notePanel.root);
  }

  if (samples[0]) updateMarker(samples[0]);

  ctx.ready();
}
