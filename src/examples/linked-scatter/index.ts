import { scaleLinear } from 'd3';
import bbox from '@turf/bbox';
import type { Feature, FeatureCollection } from 'geojson';
import type { ExampleContext } from '../../lib/types';
import { countryFeatures, loadWorldIndicators, type CountryRecord } from '../../lib/datasets';
import { REGION_COLORS } from '../../lib/colors';
import { formatCompact, formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { loadTopology } from '../../lib/topo';
import { createChartFrame, renderXAxis, renderYAxis } from '../../lib/charts';

interface PointDatum {
  feature: Feature;
  record: CountryRecord;
  gdp: number;
  life: number;
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  container.classList.add('example-map--linked');
  const mapHost = document.createElement('div');
  mapHost.className = 'linked-layout__map';
  container.append(mapHost);
  const map = createMap(mapHost, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [10, 22],
    zoom: 1,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const [topology, indicators] = await Promise.all([
    loadTopology('world/countries.topo.json'),
    loadWorldIndicators(),
  ]);
  const collection: FeatureCollection = countryFeatures(topology, indicators.countries);

  map.addSource('countries', { type: 'geojson', data: collection });
  addDataLayer(map, {
    id: 'countries-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#c8462b',
        '#e1d9c8',
      ],
      'fill-opacity': 0.92,
    },
  });
  addDataLayer(map, {
    id: 'countries-line',
    type: 'line',
    source: 'countries',
    paint: { 'line-color': 'rgba(24, 22, 17, 0.3)', 'line-width': 0.5 },
  });

  let highlighted: string | number | null = null;
  const highlight = (id: string | number | null) => {
    if (highlighted === id) return;
    if (highlighted != null) {
      map.setFeatureState({ source: 'countries', id: highlighted }, { hover: false });
    }
    highlighted = id;
    if (id != null) {
      map.setFeatureState({ source: 'countries', id }, { hover: true });
    }
  };

  const points: PointDatum[] = [];
  for (const feature of collection.features) {
    const record = feature.properties as CountryRecord | null;
    if (!record || feature.id == null) continue;
    if (!record.gdpPerCapita || record.gdpPerCapita <= 0 || record.lifeExpectancy == null) continue;
    points.push({
      feature,
      record,
      gdp: record.gdpPerCapita,
      life: record.lifeExpectancy,
    });
  }

  const panel = document.createElement('div');
  panel.className = 'profile-panel profile-panel--side';
  panel.innerHTML = `
    <div class="profile-panel__head">
      <div>
        <p class="eyebrow">Linked scatter</p>
        <p class="profile-panel__title">Income × longevity</p>
      </div>
      <p class="profile-panel__stats">${points.length} countries</p>
    </div>
  `;
  const chartHost = document.createElement('div');
  chartHost.className = 'profile-panel__chart';
  const status = document.createElement('p');
  status.className = 'linked-status';
  status.textContent = 'Hover a point to highlight a country; click to zoom.';
  panel.append(chartHost, status);
  container.append(panel);

  const frame = createChartFrame(chartHost, {
    width: 400,
    height: 300,
    margin: { top: 12, right: 16, bottom: 44, left: 52 },
  });

  const logs = points.map((point) => Math.log10(point.gdp));
  const x = scaleLinear()
    .domain([Math.floor(Math.min(...logs) * 10) / 10, Math.ceil(Math.max(...logs) * 10) / 10])
    .range([0, frame.innerWidth]);
  const lifeExtent = points.map((point) => point.life);
  const y = scaleLinear()
    .domain([Math.floor(Math.min(...lifeExtent) - 2), Math.ceil(Math.max(...lifeExtent) + 2)])
    .range([frame.innerHeight, 0]);

  const dots = frame.plot
    .append('g')
    .selectAll<SVGCircleElement, PointDatum>('circle')
    .data(points)
    .join('circle')
    .attr('cx', (point) => x(Math.log10(point.gdp)))
    .attr('cy', (point) => y(point.life))
    .attr('r', 2.8)
    .attr('fill', (point) => REGION_COLORS[point.record.region] ?? '#776f61')
    .attr('opacity', 0.72)
    .style('cursor', 'pointer');

  dots
    .on('mouseenter', (_event, point) => {
      dots.attr('opacity', 0.32);
      dots.filter((candidate) => candidate === point).attr('opacity', 1).attr('r', 5);
      highlight(point.feature.id as string | number);
      status.textContent = `${point.record.name} · $${formatNumber(
        point.gdp,
      )} per capita · ${point.life.toFixed(1)} years · ${point.record.region}`;
    })
    .on('mouseleave', () => {
      dots.attr('opacity', 0.72).attr('r', 2.8);
      highlight(null);
      status.textContent = 'Hover a point to highlight a country; click to zoom.';
    })
    .on('click', (_event, point) => {
      const bounds = bbox(point.feature as never) as [number, number, number, number];
      map.fitBounds(bounds, { padding: 80, maxZoom: 5, duration: 700 });
    });

  renderXAxis(
    frame,
    x,
    'GDP per capita · log scale',
    ((value: number) => `$${formatCompact(10 ** value)}`) as never,
  );
  renderYAxis(frame, y, 'Life expectancy (years)', (value) => `${Math.round(value)}`);

  // Allow hovering the map to reveal the same values.
  bindHover(map, {
    layers: 'countries-fill',
    render: (feature) => {
      const record = feature.properties as CountryRecord | null;
      if (!record) return null;
      return tooltipRows(
        [
          { label: 'GDP / capita', value: record.gdpPerCapita ? `$${formatNumber(record.gdpPerCapita)}` : '—' },
          { label: 'Life expectancy', value: record.lifeExpectancy ? `${record.lifeExpectancy} yrs` : '—' },
          { label: 'Region', value: record.region },
        ],
        record.name,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
