import type { FeatureCollection } from 'geojson';
import type { ExampleContext } from '../../lib/types';
import { countryFeatures, loadWorldIndicators, type CountryRecord } from '../../lib/datasets';
import { bivariateClass, bivariateExpression, makeBreaks } from '../../lib/choropleth';
import { BIVARIATE_3X3 } from '../../lib/colors';
import { formatCompact, formatNumber } from '../../lib/format';
import { createBivariateLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { loadTopology } from '../../lib/topo';

function numberOr(value: number | null): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [12, 18],
    zoom: 1.3,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const [topology, indicators] = await Promise.all([
    loadTopology('world/countries.topo.json'),
    loadWorldIndicators(),
  ]);

  const collection: FeatureCollection = countryFeatures(topology, indicators.countries);
  const usable = collection.features.filter((item) => {
    const record = item.properties as CountryRecord | null;
    return (
      record &&
      numberOr(record.gdpPerCapita) > 0 &&
      Number.isFinite(numberOr(record.lifeExpectancy))
    );
  });

  const gdpBreaks = makeBreaks(
    usable.map((item) => numberOr((item.properties as CountryRecord).gdpPerCapita)),
    ['a', 'b', 'c'],
    'quantile',
  ).breaks;
  const lifeBreaks = makeBreaks(
    usable.map((item) => numberOr((item.properties as CountryRecord).lifeExpectancy)),
    ['a', 'b', 'c'],
    'quantile',
  ).breaks;

  for (const item of collection.features) {
    const record = item.properties as CountryRecord | null;
    if (!record) continue;
    const gdp = numberOr(record.gdpPerCapita);
    const life = numberOr(record.lifeExpectancy);
    item.properties = {
      ...record,
      biv:
        Number.isFinite(gdp) && Number.isFinite(life)
          ? bivariateClass(gdp, life, gdpBreaks, lifeBreaks)
          : -1,
    };
  }

  map.addSource('countries', { type: 'geojson', data: collection });

  addDataLayer(map, {
    id: 'countries-fill',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'biv'], -1],
        'rgba(24, 22, 17, 0.10)',
        bivariateExpression('biv', [...BIVARIATE_3X3]),
      ],
      'fill-opacity': 0.94,
    },
  });

  addDataLayer(map, {
    id: 'countries-line',
    type: 'line',
    source: 'countries',
    paint: { 'line-color': 'rgba(24, 22, 17, 0.28)', 'line-width': 0.5 },
  });

  const legend = createBivariateLegend({
    title: 'GDP per capita × life expectancy',
    xLabel: 'GDP per capita',
    yLabel: 'Life expectancy',
    colors: [...BIVARIATE_3X3],
    xTicks: [formatCompact(gdpBreaks[1]), formatCompact(gdpBreaks[2])],
    yTicks: [`${Math.round(lifeBreaks[1])} yrs`, `${Math.round(lifeBreaks[2])} yrs`],
    note: 'Tertiles for 2015–2024 · lower → higher',
  });
  legend.classList.add('legend--bottom-right');
  container.append(legend);

  bindHover(map, {
    layers: 'countries-fill',
    render: (feature) => {
      const record = feature.properties as CountryRecord | null;
      if (!record) return null;
      if ((record as unknown as { biv: number }).biv < 0) {
        return tooltipRows([{ label: 'Data', value: 'Not available' }], record.name);
      }
      const bivClass = (record as unknown as { biv: number }).biv;
      const xClass = (bivClass % 3) + 1;
      const yClass = Math.floor(bivClass / 3) + 1;
      return tooltipRows(
        [
          { label: 'GDP / capita', value: `$${formatNumber(record.gdpPerCapita)}` },
          { label: 'Life expectancy', value: `${record.lifeExpectancy} yrs` },
          { label: 'Class', value: `${xClass} × ${yClass} of 3` },
          { label: 'Region', value: record.region },
        ],
        record.name,
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
