import type { FeatureCollection } from 'geojson';
import type { ExpressionSpecification } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { countryFeatures, loadWorldIndicators, type CountryRecord } from '../../lib/datasets';
import { makeBreaks, stepExpression } from '../../lib/choropleth';
import { PALETTES } from '../../lib/colors';
import { el } from '../../lib/dom';
import { formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { loadTopology } from '../../lib/topo';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

const DENSITY_COLORS = [PALETTES.orRd[1], PALETTES.orRd[3], PALETTES.orRd[4], PALETTES.orRd[5], PALETTES.orRd[6]];
const LIFE_COLORS = [PALETTES.ylGnBu[1], PALETTES.ylGnBu[3], PALETTES.ylGnBu[4], PALETTES.ylGnBu[5], PALETTES.ylGnBu[6]];

type Snap = 'density' | 'life';

function ramp(colors: string[]): HTMLElement {
  const root = el('span', 'compare-legend__ramp');
  for (const color of colors) {
    const swatch = el('span', 'compare-legend__swatch');
    swatch.style.background = color;
    root.append(swatch);
  }
  return root;
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [12, 18],
    zoom: 1.35,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const [topology, indicators] = await Promise.all([
    loadTopology('world/countries.topo.json'),
    loadWorldIndicators(),
  ]);
  const collection: FeatureCollection = countryFeatures(topology, indicators.countries);
  const densityValues: number[] = [];
  const lifeValues: number[] = [];
  for (const feature of collection.features) {
    const record = feature.properties as CountryRecord | null;
    if (!record) continue;
    if (typeof record.density === 'number' && Number.isFinite(record.density) && record.density > 0) {
      densityValues.push(record.density);
    }
    if (
      typeof record.lifeExpectancy === 'number' &&
      Number.isFinite(record.lifeExpectancy) &&
      record.lifeExpectancy > 0
    ) {
      lifeValues.push(record.lifeExpectancy);
    }
  }
  const densityBreaks = makeBreaks(densityValues, DENSITY_COLORS, 'quantile');
  const lifeBreaks = makeBreaks(lifeValues, LIFE_COLORS, 'quantile');

  map.addSource('countries', { type: 'geojson', data: collection });

  addDataLayer(map, {
    id: 'density-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': stepExpression('density', densityBreaks.breaks, DENSITY_COLORS) as ExpressionSpecification,
      'fill-opacity': 0.94,
    },
  });

  addDataLayer(map, {
    id: 'life-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': stepExpression('lifeExpectancy', lifeBreaks.breaks, LIFE_COLORS) as ExpressionSpecification,
      'fill-opacity': 0,
    },
  });

  addDataLayer(map, {
    id: 'countries-line',
    type: 'line',
    source: 'countries',
    paint: { 'line-color': 'rgba(24, 22, 17, 0.28)', 'line-width': 0.5 },
  });

  const legend = el('div', 'legend compare-legend');
  legend.setAttribute('role', 'group');
  legend.setAttribute('aria-label', 'Blended metrics');
  legend.append(el('p', 'legend__title', 'Two metrics, one map'));
  const densityRow = el('div', 'compare-legend__row');
  densityRow.append(ramp(DENSITY_COLORS), el('span', 'legend__label', 'Population density'));
  const lifeRow = el('div', 'compare-legend__row');
  lifeRow.append(ramp(LIFE_COLORS), el('span', 'legend__label', 'Life expectancy'));
  legend.append(densityRow, lifeRow, el('p', 'legend__note', 'The slider blends the two fills.'));
  legend.classList.add('legend--bottom-right');
  container.append(legend);

  let mix = 0;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.step = '1';
  slider.value = '0';
  slider.className = 'range';
  slider.setAttribute('aria-label', 'Blend between population density and life expectancy');

  const ui = createMapUi(container);
  const panel = createPanel('Blend');
  const note = createNote('');
  const readout = el('p', 'compare-legend__readout');

  const apply = () => {
    const t = mix / 100;
    map.setPaintProperty('life-fill', 'fill-opacity', t);
    const densityShare = Math.round((1 - t) * 100);
    const lifeShare = 100 - densityShare;
    readout.textContent = `${densityShare}% density · ${lifeShare}% life expectancy`;
    note.textContent =
      mix === 0
        ? 'Showing population density.'
        : mix === 100
          ? 'Showing life expectancy.'
          : t < 0.5
            ? 'Mostly density; life expectancy is fading in.'
            : 'Mostly life expectancy; density is fading out.';
    slider.value = String(mix);
  };

  slider.addEventListener('input', () => {
    mix = Number(slider.value);
    apply();
  });

  const segmented = createSegmented<Snap>(
    [
      { value: 'density', label: 'Density' },
      { value: 'life', label: 'Life expectancy' },
    ],
    'density',
    (next) => {
      mix = next === 'density' ? 0 : 100;
      apply();
    },
  );

  panel.body.append(segmented, slider, readout, note);
  ui.append(panel.root);

  bindHover(map, {
    layers: ['life-fill', 'density-fill'],
    render: (feature) => {
      const record = feature.properties as CountryRecord | null;
      if (!record) return null;
      return tooltipRows(
        [
          {
            label: 'Density',
            value: record.density ? `${formatNumber(record.density)}/km²` : '—',
          },
          {
            label: 'Life expectancy',
            value: record.lifeExpectancy ? `${record.lifeExpectancy.toFixed(1)} yrs` : '—',
          },
          { label: 'Population', value: formatNumber(record.population) },
        ],
        record.name,
      );
    },
  });

  apply();
  await waitForIdle(map);
  ctx.ready();
}
