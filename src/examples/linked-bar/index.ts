import { max, scaleBand, scaleLinear } from 'd3';
import bbox from '@turf/bbox';
import type { Feature, FeatureCollection } from 'geojson';
import type { ExampleContext } from '../../lib/types';
import { countryFeatures, loadWorldIndicators, type CountryRecord } from '../../lib/datasets';
import { REGION_COLORS } from '../../lib/colors';
import { formatCompact, formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { loadTopology } from '../../lib/topo';
import { createChartFrame } from '../../lib/charts';

interface Row {
  feature: Feature;
  record: CountryRecord;
  population: number;
}

function shortName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 17)}…` : name;
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
      'fill-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#c8462b', '#e1d9c8'],
      'fill-opacity': 0.92,
    },
  });
  addDataLayer(map, {
    id: 'countries-line',
    type: 'line',
    source: 'countries',
    paint: { 'line-color': 'rgba(24, 22, 17, 0.3)', 'line-width': 0.5 },
  });

  const rows: Row[] = [];
  for (const feature of collection.features) {
    const record = feature.properties as CountryRecord | null;
    if (!record || feature.id == null || !record.population) continue;
    rows.push({ feature, record, population: record.population });
  }
  const top = rows.sort((a, b) => b.population - a.population).slice(0, 12);

  let highlighted: string | number | null = null;
  const highlight = (id: string | number | null) => {
    if (highlighted === id) return;
    if (highlighted != null) {
      map.setFeatureState({ source: 'countries', id: highlighted }, { hover: false });
    }
    highlighted = id;
    if (id != null) map.setFeatureState({ source: 'countries', id }, { hover: true });
  };

  const panel = document.createElement('div');
  panel.className = 'profile-panel profile-panel--side';
  panel.innerHTML = `
    <div class="profile-panel__head">
      <div>
        <p class="eyebrow">Linked ranking</p>
        <p class="profile-panel__title">Population, top 12</p>
      </div>
      <p class="profile-panel__stats">World Bank</p>
    </div>
  `;
  const chartHost = document.createElement('div');
  chartHost.className = 'profile-panel__chart';
  const status = document.createElement('p');
  status.className = 'linked-status';
  status.textContent = 'Hover a bar to highlight; click to zoom.';
  panel.append(chartHost, status);
  container.append(panel);

  const frame = createChartFrame(chartHost, {
    width: 400,
    height: 330,
    margin: { top: 10, right: 52, bottom: 10, left: 118 },
  });

  const y = scaleBand<string>()
    .domain(top.map((row) => String(row.feature.id)))
    .range([0, frame.innerHeight])
    .padding(0.22);
  const x = scaleLinear()
    .domain([0, (max(top, (row) => row.population) ?? 1) * 1.06])
    .range([0, frame.innerWidth]);

  frame.plot
    .append('line')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', frame.innerHeight)
    .attr('stroke', 'rgba(24, 22, 17, 0.3)');

  const bars = frame.plot
    .append('g')
    .selectAll<SVGRectElement, Row>('rect')
    .data(top)
    .join('rect')
    .attr('x', 0)
    .attr('y', (row) => y(String(row.feature.id)) ?? 0)
    .attr('height', y.bandwidth())
    .attr('width', (row) => x(row.population))
    .attr('fill', (row) => REGION_COLORS[row.record.region] ?? '#776f61')
    .attr('opacity', 0.82)
    .style('cursor', 'pointer');

  frame.plot
    .append('g')
    .selectAll<SVGTextElement, Row>('text')
    .data(top)
    .join('text')
    .attr('x', -8)
    .attr('y', (row) => (y(String(row.feature.id)) ?? 0) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('class', 'bar-category')
    .text((row) => shortName(row.record.name));

  frame.plot
    .append('g')
    .selectAll<SVGTextElement, Row>('text')
    .data(top)
    .join('text')
    .attr('x', (row) => x(row.population) + 6)
    .attr('y', (row) => (y(String(row.feature.id)) ?? 0) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('class', 'bar-label')
    .text((row) => formatCompact(row.population));

  bars
    .on('mouseenter', (_event, row) => {
      bars.attr('opacity', 0.36);
      bars.filter((candidate) => candidate === row).attr('opacity', 1);
      highlight(row.feature.id as string | number);
      status.textContent = `${row.record.name} · ${formatNumber(row.population)} people · ${row.record.region}`;
    })
    .on('mouseleave', () => {
      bars.attr('opacity', 0.82);
      highlight(null);
      status.textContent = 'Hover a bar to highlight; click to zoom.';
    })
    .on('click', (_event, row) => {
      const bounds = bbox(row.feature as never) as [number, number, number, number];
      map.fitBounds(bounds, { padding: 80, maxZoom: 5, duration: 700 });
    });

  bindHover(map, {
    layers: 'countries-fill',
    render: (feature) => {
      const record = feature.properties as CountryRecord | null;
      if (!record) return null;
      return tooltipRows(
        [
          { label: 'Population', value: formatNumber(record.population) },
          { label: 'Region', value: record.region },
          { label: 'Income', value: record.income },
        ],
        record.name,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
