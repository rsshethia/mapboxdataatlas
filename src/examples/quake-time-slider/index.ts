import type { ExampleContext } from '../../lib/types';
import { loadQuakes } from '../../lib/datasets';
import { createSizeLegend, createSteppedLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { formatDate, formatNumber } from '../../lib/format';
import { createMapUi, createNote, createPanel, createRange } from '../../lib/ui';

const START_YEAR = 2000;
const END_YEAR = 2026;

const DEPTH_COLORS = ['#fee8c8', '#fdbb84', '#fc8d59', '#d7301f', '#7f0000'];

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [12, 6],
    zoom: 1.1,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const quakes = await loadQuakes('history');
  const countsByYear = new Map<number, number>();
  for (const feature of quakes.features) {
    const year = feature.properties.year ?? START_YEAR;
    countsByYear.set(year, (countsByYear.get(year) ?? 0) + 1);
  }
  const cumulative: number[] = [];
  let running = 0;
  for (let year = START_YEAR; year <= END_YEAR; year += 1) {
    running += countsByYear.get(year) ?? 0;
    cumulative[year] = running;
  }

  let year = START_YEAR;

  map.addSource('quakes', { type: 'geojson', data: quakes });

  addDataLayer(map, {
    id: 'quakes-circle',
    type: 'circle',
    source: 'quakes',
    paint: {
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'depth'],
        0,
        DEPTH_COLORS[0],
        70,
        DEPTH_COLORS[1],
        150,
        DEPTH_COLORS[2],
        300,
        DEPTH_COLORS[3],
        600,
        DEPTH_COLORS[4],
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        6,
        2.5,
        7,
        4.5,
        8,
        7.5,
        9,
        11,
      ],
      'circle-opacity': 0.72,
      'circle-stroke-color': 'rgba(24, 22, 17, 0.35)',
      'circle-stroke-width': 0.4,
    },
  });

  const applied = () => {
    map.setFilter('quakes-circle', ['<=', ['get', 'year'], year]);
  };
  applied();

  const countLabel = document.createElement('span');
  countLabel.className = 'panel__value';
  const yearLabel = document.createElement('span');
  yearLabel.className = 'panel__value';

  const ui = createMapUi(container);
  const panel = createPanel('Timeline');
  const rows = document.createElement('div');
  rows.className = 'control-stack';

  const yearRow = document.createElement('div');
  yearRow.className = 'panel__row';
  yearRow.append(Object.assign(document.createElement('span'), { textContent: 'Year', className: 'panel__title' }), yearLabel);

  const countRow = document.createElement('div');
  countRow.className = 'panel__row';
  countRow.append(
    Object.assign(document.createElement('span'), { textContent: 'Events', className: 'panel__title' }),
    countLabel,
  );

  const update = () => {
    yearLabel.textContent = String(year);
    countLabel.textContent = formatNumber(cumulative[year] ?? 0);
    applied();
  };

  rows.append(
    createRange({
      label: 'Year',
      min: START_YEAR,
      max: END_YEAR,
      step: 1,
      value: year,
      format: (value) => String(value),
      onInput: (value) => {
        year = value;
        update();
      },
    }),
    yearRow,
    countRow,
  );
  panel.body.append(rows, createNote('Cumulative: shows every event up to the selected year.'));
  ui.append(panel.root);

  const depthLegend = createSteppedLegend({
    title: 'Depth (km)',
    colors: DEPTH_COLORS,
    labels: ['0–70', '70–150', '150–300', '300–600', '600+'],
  });
  container.append(depthLegend);

  const sizeLegend = createSizeLegend({
    title: 'Magnitude',
    items: [
      { label: 'M6', radius: 3 },
      { label: 'M7', radius: 6 },
      { label: 'M8+', radius: 10 },
    ],
  });
  sizeLegend.classList.add('legend--bottom-right');
  container.append(sizeLegend);

  bindHover(map, {
    layers: 'quakes-circle',
    render: (feature) => {
      const properties = feature.properties as {
        mag: number | null;
        place: string;
        time: number;
        depth: number | null;
        year: number | null;
      };
      return tooltipRows(
        [
          { label: 'Magnitude', value: properties.mag?.toFixed(1) ?? '—' },
          { label: 'Depth', value: properties.depth == null ? '—' : `${formatNumber(properties.depth)} km` },
          { label: 'Date', value: formatDate(properties.time) },
        ],
        properties.place,
      );
    },
  });

  update();
  await waitForIdle(map);
  ctx.ready();
}
