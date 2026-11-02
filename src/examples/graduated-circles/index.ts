import type { FeatureCollection, Point } from 'geojson';
import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { loadCities, type CityRecord } from '../../lib/datasets';
import { formatCompact, formatNumber } from '../../lib/format';
import { createSizeLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

type SizeFilter = 'top200' | 'top600' | 'all';

const FILTERS: Record<SizeFilter, number> = {
  top200: 200,
  top600: 600,
  all: Number.POSITIVE_INFINITY,
};

function citiesToGeoJSON(cities: CityRecord[], limit: number): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: cities.slice(0, limit).map((city) => ({
      type: 'Feature',
      properties: {
        name: city.name,
        country: city.country,
        pop: city.pop,
        capital: city.capital ? 1 : 0,
        rank: city.rank,
      },
      geometry: { type: 'Point', coordinates: [city.lon, city.lat] },
    })),
  };
}

function radiusExpression(): unknown {
  return [
    'interpolate',
    ['linear'],
    ['get', 'pop'],
    50000,
    2.5,
    250000,
    4,
    1000000,
    6.5,
    5000000,
    13,
    20000000,
    24,
  ];
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [18, 16],
    zoom: 1.25,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const dataset = await loadCities();
  let filter: SizeFilter = 'top200';

  map.addSource('cities', { type: 'geojson', data: citiesToGeoJSON(dataset.cities, FILTERS[filter]) });

  addDataLayer(map, {
    id: 'cities-glow',
    type: 'circle',
    source: 'cities',
    paint: {
      'circle-color': '#1f6f78',
      'circle-opacity': 0.14,
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'pop'],
        50000,
        5,
        250000,
        8,
        1000000,
        13,
        5000000,
        24,
        20000000,
        42,
      ],
    },
  });

  addDataLayer(map, {
    id: 'cities-circle',
    type: 'circle',
    source: 'cities',
    paint: {
      'circle-color': '#1f6f78',
      'circle-opacity': 0.78,
      'circle-radius': radiusExpression() as never,
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 0.6,
    },
  });

  addDataLayer(map, {
    id: 'cities-hover',
    type: 'circle',
    source: 'cities',
    paint: {
      'circle-color': 'transparent',
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'pop'],
        50000,
        7,
        250000,
        11,
        1000000,
        17,
        5000000,
        30,
        20000000,
        50,
      ],
      'circle-stroke-color': '#c8462b',
      'circle-stroke-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2, 0],
    },
  });

  const ui = createMapUi(container);
  const panel = createPanel('Places shown');
  panel.body.append(
    createSegmented<SizeFilter>(
      [
        { value: 'top200', label: 'Top 200' },
        { value: 'top600', label: 'Top 600' },
        { value: 'all', label: 'All' },
      ],
      filter,
      (next) => {
        filter = next;
        const source = map.getSource('cities') as GeoJSONSource;
        source.setData(citiesToGeoJSON(dataset.cities, FILTERS[filter]));
      },
    ),
    createNote('Natural Earth places with a positive population estimate.'),
  );
  ui.append(panel.root);

  const legend = createSizeLegend({
    title: 'Population',
    items: [
      { label: '1 million', radius: 6.5 },
      { label: '5 million', radius: 13 },
      { label: '20 million', radius: 24 },
    ],
    note: 'Circle area is scaled to population, not radius.',
  });
  legend.classList.add('legend--bottom-right');
  container.append(legend);

  bindHover(map, {
    layers: 'cities-circle',
    render: (feature) => {
      const properties = feature.properties as {
        name: string;
        country: string;
        pop: number;
        capital: number;
      };
      return tooltipRows(
        [
          { label: 'Population', value: formatNumber(properties.pop) },
          { label: 'Country', value: properties.country },
          { label: 'Role', value: properties.capital ? 'National capital' : 'City' },
        ],
        properties.name,
      );
    },
    onEnter: (feature) => {
      if (feature.id == null) return;
      map.setFeatureState({ source: 'cities', id: feature.id }, { hover: true });
    },
    onLeave: (feature) => {
      if (feature.id == null) return;
      map.setFeatureState({ source: 'cities', id: feature.id }, { hover: false });
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
