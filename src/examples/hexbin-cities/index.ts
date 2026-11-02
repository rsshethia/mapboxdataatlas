import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { loadCities } from '../../lib/datasets';
import { binPoints, hexCollection } from '../../lib/hex';
import { makeBreaks, rangeLabels, stepExpression } from '../../lib/choropleth';
import { PALETTES } from '../../lib/colors';
import { formatCompact, formatNumber } from '../../lib/format';
import { createSteppedLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

let resolution = 2;

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [16, 16],
    zoom: 1.3,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const dataset = await loadCities();

  let legend: HTMLElement | null = null;
  const render = () => {
    const bins = binPoints(
      dataset.cities,
      (city) => [city.lon, city.lat],
      (city) => city.pop,
      resolution,
    );
    const values = bins.map((bin) => bin.total);
    const breaks = makeBreaks(values, [...PALETTES.viridis], 'quantile');
    const collection = hexCollection(bins);

    const source = map.getSource('hexes') as GeoJSONSource | undefined;
    if (source) {
      source.setData(collection);
    } else {
      map.addSource('hexes', { type: 'geojson', data: collection });
      addDataLayer(map, {
        id: 'hex-fill',
        type: 'fill',
        source: 'hexes',
        paint: {
          'fill-color': stepExpression('total', breaks.breaks, breaks.colors),
          'fill-opacity': 0.82,
        },
      });
      addDataLayer(map, {
        id: 'hex-line',
        type: 'line',
        source: 'hexes',
        paint: { 'line-color': 'rgba(244, 240, 230, 0.14)', 'line-width': 0.4 },
      });
    }
    map.setPaintProperty(
      'hex-fill',
      'fill-color',
      stepExpression('total', breaks.breaks, breaks.colors),
    );

    const next = createSteppedLegend({
      title: 'Urban population per cell',
      colors: breaks.colors,
      labels: rangeLabels(breaks.breaks, formatCompact),
      note: `H3 resolution ${resolution} · quantile classes`,
    });
    next.classList.add('legend--bottom-right');
    if (legend) {
      legend.replaceWith(next);
    } else {
      container.append(next);
    }
    legend = next;
  };

  render();

  const ui = createMapUi(container);
  const panel = createPanel('Hex resolution');
  const note = createNote('Higher resolution = smaller cells and more detail.');
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
        note.textContent = `H3 resolution ${resolution} · ${Math.round(
          (resolution === 1 ? 4200000 : resolution === 2 ? 610000 : 86000) / 1000,
        ).toLocaleString('en-US')}k km² per cell (approx).`;
        render();
      },
    ),
    note,
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: 'hex-fill',
    render: (feature) => {
      const properties = feature.properties as { count: number; total: number };
      return tooltipRows(
        [
          { label: 'Cities', value: formatNumber(properties.count) },
          { label: 'Population', value: formatCompact(properties.total) },
        ],
        'Hex cell',
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
