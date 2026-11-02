import type { Feature, FeatureCollection } from 'geojson';
import type { ExampleContext } from '../../lib/types';
import { loadJSON } from '../../lib/data';
import { makeBreaks, rangeLabels, stepExpression } from '../../lib/choropleth';
import { PALETTES } from '../../lib/colors';
import { formatCompact, formatNumber } from '../../lib/format';
import { createSteppedLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { joinById, loadTopology, topologyFeatures } from '../../lib/topo';
import { createMapUi, createPanel, createSegmented } from '../../lib/ui';

interface CountryValues {
  name: string;
  population: number | null;
  density: number | null;
  gdpPerCapita: number | null;
  lifeExpectancy: number | null;
  region: string;
  income: string;
  year: number | null;
}

interface WorldIndicators {
  countries: Record<string, CountryValues>;
}

type Metric = 'population' | 'density';

const METRICS: Record<
  Metric,
  { label: string; color: string; note: string; format: (value: number) => string }
> = {
  population: {
    label: 'Population',
    color: 'ylGnBu',
    note: 'Quantile classes · total population',
    format: formatCompact,
  },
  density: {
    label: 'Density',
    color: 'orRd',
    note: 'Quantile classes · people per sq. km',
    format: (value) => `${formatNumber(value)}/km²`,
  },
};

function valueOf(feature: Feature, metric: Metric): number {
  const properties = feature.properties as CountryValues | null;
  const value = properties?.[metric];
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
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
    loadJSON<WorldIndicators>('world/indicators.json'),
  ]);

  const collection: FeatureCollection = topologyFeatures(topology, 'countries');
  joinById(collection, indicators.countries as unknown as Record<string, Record<string, unknown>>);

  let metric: Metric = 'population';
  let breaks = makeBreaks(
    collection.features.map((feature) => valueOf(feature, metric)),
    [...PALETTES.ylGnBu],
    'quantile',
  );

  map.addSource('countries', {
    type: 'geojson',
    data: collection,
  });

  addDataLayer(map, {
    id: 'countries-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': stepExpression('population', breaks.breaks, breaks.colors),
      'fill-opacity': 0.9,
    },
  });

  addDataLayer(map, {
    id: 'countries-line',
    type: 'line',
    source: 'countries',
    paint: {
      'line-color': 'rgba(24, 22, 17, 0.32)',
      'line-width': 0.55,
    },
  });

  addDataLayer(map, {
    id: 'countries-hover',
    type: 'line',
    source: 'countries',
    paint: {
      'line-color': '#c8462b',
      'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2.2, 0],
    },
  });

  const ui = createMapUi(container);
  const panel = createPanel('Metric');
  panel.body.append(
    createSegmented(
      [
        { value: 'population', label: 'Population' },
        { value: 'density', label: 'Density' },
      ],
      metric,
      (next) => {
        metric = next;
        update();
      },
    ),
    Object.assign(document.createElement('p'), {
      className: 'panel__note',
      textContent: 'Hover a country for values.',
    }),
  );
  ui.append(panel.root);

  let legend = createSteppedLegend({
    title: METRICS[metric].label,
    colors: breaks.colors,
    labels: rangeLabels(breaks.breaks, METRICS[metric].format),
    note: METRICS[metric].note,
  });
  container.append(legend);

  const update = () => {
    const values = collection.features.map((feature) => valueOf(feature, metric));
    breaks = makeBreaks(values, [...PALETTES[METRICS[metric].color as 'ylGnBu' | 'orRd']], 'quantile');
    map.setPaintProperty(
      'countries-fill',
      'fill-color',
      stepExpression(metric, breaks.breaks, breaks.colors),
    );
    const nextLegend = createSteppedLegend({
      title: METRICS[metric].label,
      colors: breaks.colors,
      labels: rangeLabels(breaks.breaks, METRICS[metric].format),
      note: METRICS[metric].note,
    });
    legend.replaceWith(nextLegend);
    legend = nextLegend;
  };

  bindHover(map, {
    layers: 'countries-fill',
    render: (feature) => {
      const properties = feature.properties as CountryValues | null;
      if (!properties) return null;
      const value = properties[metric];
      return tooltipRows(
        [
          { label: 'Population', value: formatNumber(properties.population) },
          { label: 'Density', value: properties.density ? `${formatNumber(properties.density)}/km²` : '—' },
          { label: 'GDP / capita', value: properties.gdpPerCapita ? `$${formatNumber(properties.gdpPerCapita)}` : '—' },
          { label: 'Life expectancy', value: properties.lifeExpectancy ? `${properties.lifeExpectancy} yrs` : '—' },
          { label: 'Region', value: properties.region },
        ],
        properties.name,
      );
    },
    onEnter: (feature) => {
      if (feature.id == null) return;
      map.setFeatureState({ source: 'countries', id: feature.id }, { hover: true });
    },
    onLeave: (feature) => {
      if (feature.id == null) return;
      map.setFeatureState({ source: 'countries', id: feature.id }, { hover: false });
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
