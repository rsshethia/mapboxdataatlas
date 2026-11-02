import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { loadCities } from '../../lib/datasets';
import { binPoints, hexCollection } from '../../lib/hex';
import { PALETTES } from '../../lib/colors';
import { formatCompact, formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

let resolution = 2;

const HEIGHT_EXPRESSION = [
  'interpolate',
  ['linear'],
  ['get', 'total'],
  0,
  0,
  2000000,
  4000,
  10000000,
  16000,
  40000000,
  48000,
  120000000,
  110000,
];

const COLOR_EXPRESSION = [
  'interpolate',
  ['linear'],
  ['get', 'total'],
  0,
  PALETTES.magma[1],
  2000000,
  PALETTES.magma[3],
  10000000,
  PALETTES.magma[5],
  40000000,
  PALETTES.magma[7],
  120000000,
  PALETTES.magma[8],
];

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [24, 24],
    zoom: 1.25,
    pitch: 46,
    bearing: -12,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const dataset = await loadCities();

  const render = () => {
    const bins = binPoints(
      dataset.cities,
      (city) => [city.lon, city.lat],
      (city) => city.pop,
      resolution,
    );
    const collection = hexCollection(bins);
    const source = map.getSource('hexes') as GeoJSONSource | undefined;
    if (source) {
      source.setData(collection);
      return;
    }
    map.addSource('hexes', { type: 'geojson', data: collection });
    addDataLayer(map, {
      id: 'hex-extrusion',
      type: 'fill-extrusion',
      source: 'hexes',
      paint: {
        'fill-extrusion-height': HEIGHT_EXPRESSION as never,
        'fill-extrusion-color': COLOR_EXPRESSION as never,
        'fill-extrusion-opacity': 0.9,
        'fill-extrusion-base': 0,
      },
    });
  };

  render();

  const ui = createMapUi(container);
  const panel = createPanel('Hex resolution');
  panel.body.append(
    createSegmented<'1' | '2' | '3'>(
      [
        { value: '1', label: 'Coarse' },
        { value: '2', label: 'Medium' },
        { value: '3', label: 'Fine' },
      ],
      String(resolution) as '2',
      (next) => {
        resolution = Number(next);
        render();
      },
    ),
    createNote('Height and colour both encode summed population per cell.'),
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: 'hex-extrusion',
    render: (feature) => {
      const properties = feature.properties as { count: number; total: number };
      return tooltipRows(
        [
          { label: 'Cities', value: formatNumber(properties.count) },
          { label: 'Population', value: formatCompact(properties.total) },
        ],
        'Urban hex',
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
