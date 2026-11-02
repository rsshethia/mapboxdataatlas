import type { Feature, FeatureCollection } from 'geojson';
import type { ExampleContext } from '../../lib/types';
import { loadUsIndicators, type UsRecord } from '../../lib/datasets';
import { makeBreaks, rangeLabels, stepExpression } from '../../lib/choropleth';
import { PALETTES } from '../../lib/colors';
import { formatCompact, formatNumber } from '../../lib/format';
import { createSteppedLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { joinById, loadTopology, topologyFeatures } from '../../lib/topo';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

type Level = 'auto' | 'states' | 'counties';

function density(feature: Feature): number {
  const value = (feature.properties as UsRecord | null)?.density;
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
}

function hoverContent(feature: Feature, label: string): HTMLElement | string | null {
  const record = feature.properties as UsRecord | null;
  if (!record) return null;
  return tooltipRows(
    [
      { label: 'Population', value: formatNumber(record.population) },
      { label: 'Density', value: record.density ? `${formatNumber(record.density)}/km²` : '—' },
      {
        label: 'Median income',
        value: record.medianIncome ? `$${formatNumber(record.medianIncome)}` : '—',
      },
      { label: 'Area', value: record.landAreaKm2 ? `${formatCompact(record.landAreaKm2)} km²` : '—' },
    ],
    label,
  );
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-98, 39],
    zoom: 3.4,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const [stateTopo, countyTopo, indicators] = await Promise.all([
    loadTopology('us/states.topo.json'),
    loadTopology('us/counties.topo.json'),
    loadUsIndicators(),
  ]);

  const states: FeatureCollection = topologyFeatures(stateTopo, 'states');
  joinById(states, indicators.states as unknown as Record<string, Record<string, unknown>>);
  const counties: FeatureCollection = topologyFeatures(countyTopo, 'counties');
  joinById(counties, indicators.counties as unknown as Record<string, Record<string, unknown>>);

  const stateBreaks = makeBreaks(
    states.features.map(density),
    [...PALETTES.ylGnBu],
    'quantile',
  );
  const countyBreaks = makeBreaks(
    counties.features.map(density),
    [...PALETTES.ylGnBu],
    'quantile',
  );

  map.addSource('states', { type: 'geojson', data: states });
  map.addSource('counties', { type: 'geojson', data: counties });

  addDataLayer(map, {
    id: 'states-fill',
    type: 'fill',
    source: 'states',
    maxzoom: 6,
    paint: {
      'fill-color': stepExpression('density', stateBreaks.breaks, stateBreaks.colors),
      'fill-opacity': 0.9,
    },
  });
  addDataLayer(map, {
    id: 'states-line',
    type: 'line',
    source: 'states',
    maxzoom: 6,
    paint: { 'line-color': 'rgba(24, 22, 17, 0.32)', 'line-width': 0.6 },
  });
  addDataLayer(map, {
    id: 'counties-fill',
    type: 'fill',
    source: 'counties',
    minzoom: 5,
    paint: {
      'fill-color': stepExpression('density', countyBreaks.breaks, countyBreaks.colors),
      'fill-opacity': 0.9,
    },
  });
  addDataLayer(map, {
    id: 'counties-line',
    type: 'line',
    source: 'counties',
    minzoom: 5,
    paint: { 'line-color': 'rgba(24, 22, 17, 0.22)', 'line-width': 0.35 },
  });

  let level: Level = 'auto';
  let legend: HTMLElement | null = null;
  let legendLevel: 'states' | 'counties' = 'states';

  const activeLevel = (): 'states' | 'counties' => {
    if (level !== 'auto') return level;
    return map.getZoom() < 5.6 ? 'states' : 'counties';
  };

  const applyVisibility = () => {
    const active = activeLevel();
    for (const id of ['states-fill', 'states-line']) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', active === 'states' ? 'visible' : 'none');
    }
    for (const id of ['counties-fill', 'counties-line']) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', active === 'counties' ? 'visible' : 'none');
    }
    if (active !== legendLevel) {
      legendLevel = active;
      renderLegend();
    }
  };

  const renderLegend = () => {
    const breaks = legendLevel === 'states' ? stateBreaks : countyBreaks;
    const next = createSteppedLegend({
      title: `${legendLevel === 'states' ? 'States' : 'Counties'} · people per sq. km`,
      colors: breaks.colors,
      labels: rangeLabels(breaks.breaks, formatCompact),
      note: 'Quantile classes, computed per geography',
    });
    next.classList.add('legend--bottom-right');
    if (legend) legend.replaceWith(next);
    else container.append(next);
    legend = next;
  };

  renderLegend();
  applyVisibility();
  map.on('zoomend', applyVisibility);

  const ui = createMapUi(container);
  const panel = createPanel('Geography');
  panel.body.append(
    createSegmented<Level>(
      [
        { value: 'auto', label: 'Auto' },
        { value: 'states', label: 'States' },
        { value: 'counties', label: 'Counties' },
      ],
      level,
      (next) => {
        level = next;
        if (next !== 'auto') {
          map.easeTo({
            center: [-98, 39],
            zoom: next === 'states' ? 3.4 : 7,
            duration: 500,
          });
        }
        applyVisibility();
      },
    ),
    createNote('Auto switches to counties near zoom 5.6.'),
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: ['states-fill', 'counties-fill'],
    render: (feature) => {
      const record = feature.properties as UsRecord | null;
      if (!record) return null;
      return hoverContent(feature as Feature, record.name);
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
