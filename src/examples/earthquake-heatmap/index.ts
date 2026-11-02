import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { loadQuakes } from '../../lib/datasets';
import { formatDate, formatNumber } from '../../lib/format';
import { createContinuousLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

type Period = 'catalogue' | 'recent';

const HEAT_COLORS = [
  'rgba(0, 0, 0, 0)',
  '#1d1147',
  '#822681',
  '#e75263',
  '#fc8961',
  '#fcfdbf',
];

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [10, 5],
    zoom: 1.15,
    projection: 'mercator',
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const [catalogue, recent] = await Promise.all([loadQuakes('history'), loadQuakes('recent')]);
  let period: Period = 'catalogue';

  map.addSource('quakes', {
    type: 'geojson',
    data: period === 'catalogue' ? catalogue : recent,
  });

  addDataLayer(map, {
    id: 'quakes-heat',
    type: 'heatmap',
    source: 'quakes',
    maxzoom: 9,
    paint: {
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        2.5,
        0.05,
        5,
        0.4,
        7,
        0.85,
        9,
        1,
      ],
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        0.9,
        4,
        1.6,
        8,
        3.2,
      ],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        HEAT_COLORS[0],
        0.18,
        HEAT_COLORS[1],
        0.36,
        HEAT_COLORS[2],
        0.56,
        HEAT_COLORS[3],
        0.78,
        HEAT_COLORS[4],
        1,
        HEAT_COLORS[5],
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        3,
        3,
        14,
        6,
        32,
        9,
        56,
      ],
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,
        0.92,
        9,
        0,
      ],
    },
  });

  addDataLayer(map, {
    id: 'quakes-point',
    type: 'circle',
    source: 'quakes',
    minzoom: 5,
    paint: {
      'circle-color': '#fcfdbf',
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        5,
        0,
        7,
        0.7,
        9,
        0.9,
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        2.5,
        1.5,
        5,
        3,
        7,
        6,
        9,
        10,
      ],
      'circle-stroke-color': 'rgba(252, 253, 191, 0.35)',
      'circle-stroke-width': 0.6,
    },
  });

  const legend = createContinuousLegend({
    title: 'Earthquake density',
    colors: ['#1d1147', '#822681', '#e75263', '#fc8961', '#fcfdbf'],
    minLabel: 'Low',
    maxLabel: 'High',
    note: 'Weighted by magnitude',
  });
  legend.classList.add('legend--bottom-right');
  container.append(legend);

  const ui = createMapUi(container);
  const panel = createPanel('Catalogue');
  const note = createNote('');
  const updateNote = () => {
    const collection = period === 'catalogue' ? catalogue : recent;
    note.textContent =
      period === 'catalogue'
        ? `${formatNumber(collection.features.length)} events · M6+ · 2000–2026`
        : `${formatNumber(collection.features.length)} events · M2.5+ · past 30 days`;
  };
  panel.body.append(
    createSegmented<Period>(
      [
        { value: 'catalogue', label: '2000–2026' },
        { value: 'recent', label: '30 days' },
      ],
      period,
      (next) => {
        period = next;
        const source = map.getSource('quakes') as GeoJSONSource;
        source.setData(period === 'catalogue' ? catalogue : recent);
        updateNote();
      },
    ),
    note,
  );
  updateNote();
  ui.append(panel.root);

  bindHover(map, {
    layers: 'quakes-point',
    render: (feature) => {
      const properties = feature.properties as {
        mag: number | null;
        place: string;
        time: number;
        depth: number | null;
      };
      return tooltipRows(
        [
          { label: 'Magnitude', value: properties.mag?.toFixed(1) ?? '—' },
          { label: 'Depth', value: properties.depth == null ? '—' : `${properties.depth} km` },
          { label: 'When', value: formatDate(properties.time) },
        ],
        properties.place,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
