import type { MapMouseEvent, MapboxGeoJSONFeature } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { loadQuakes } from '../../lib/datasets';
import { formatDate, formatNumber } from '../../lib/format';
import { createSizeLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createNote, createPanel } from '../../lib/ui';

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-20, 10],
    zoom: 1.2,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const recent = await loadQuakes('recent');

  map.addSource('quakes', {
    type: 'geojson',
    data: recent,
    cluster: true,
    clusterMaxZoom: 7,
    clusterRadius: 42,
    clusterProperties: {
      maxMag: ['max', ['get', 'mag']],
    },
  });

  addDataLayer(map, {
    id: 'clusters',
    type: 'circle',
    source: 'quakes',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#9ecae1',
        10,
        '#41b6c4',
        40,
        '#1d91c0',
        120,
        '#225ea8',
      ],
      'circle-opacity': 0.78,
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 1.2,
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        14,
        10,
        19,
        40,
        26,
        120,
        34,
      ],
    },
  });

  addDataLayer(map, {
    id: 'cluster-count',
    type: 'symbol',
    source: 'quakes',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 11,
    },
    paint: { 'text-color': '#08243f' },
  });

  addDataLayer(map, {
    id: 'quake-point',
    type: 'circle',
    source: 'quakes',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        2.5,
        '#fcbba1',
        4,
        '#fb6a4a',
        6,
        '#cb181d',
        8,
        '#67000d',
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        2.5,
        3,
        4,
        5,
        6,
        8,
        8,
        13,
      ],
      'circle-opacity': 0.85,
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 0.8,
    },
  });

  map.on('click', 'clusters', (event: MapMouseEvent & { features?: MapboxGeoJSONFeature[] }) => {
    const feature = event.features?.[0];
    if (!feature) return;
    const clusterId = feature.properties?.cluster_id as number;
    const source = map.getSource('quakes') as unknown as {
      getClusterExpansionZoom: (
        id: number,
        callback: (error: Error | null, zoom: number) => void,
      ) => void;
    };
    source.getClusterExpansionZoom(clusterId, (error, zoom) => {
      if (error) return;
      const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
      map.easeTo({ center: [lng, lat], zoom, duration: 600 });
    });
  });

  map.on('click', 'quake-point', (event: MapMouseEvent & { features?: MapboxGeoJSONFeature[] }) => {
    const feature = event.features?.[0];
    if (!feature) return;
    const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
    map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 5.5), duration: 500 });
  });

  bindHover(map, {
    layers: ['clusters', 'quake-point'],
    render: (feature) => {
      const properties = feature.properties ?? {};
      if (properties.cluster) {
        return tooltipRows(
          [
            { label: 'Events', value: formatNumber(properties.point_count as number) },
            {
              label: 'Largest',
              value:
                typeof properties.maxMag === 'number'
                  ? `M${properties.maxMag.toFixed(1)}`
                  : '—',
            },
          ],
          'Earthquake cluster',
        );
      }
      return tooltipRows(
        [
          { label: 'Magnitude', value: (properties.mag as number | null)?.toFixed(1) ?? '—' },
          {
            label: 'Depth',
            value:
              properties.depth == null ? '—' : `${formatNumber(properties.depth as number)} km`,
          },
          { label: 'When', value: formatDate(properties.time as number) },
        ],
        String(properties.place ?? 'Earthquake'),
      );
    },
  });

  const ui = createMapUi(container);
  const panel = createPanel('Clustering');
  panel.body.append(
    createNote('Click a cluster to expand it. Cluster radius is 42 px; points split below zoom 7.'),
  );
  ui.append(panel.root);

  const legend = createSizeLegend({
    title: 'Cluster size',
    items: [
      { label: '10 events', radius: 8 },
      { label: '40 events', radius: 13 },
      { label: '120 events', radius: 18 },
    ],
    note: 'Unclustered points scale with magnitude.',
  });
  legend.classList.add('legend--bottom-right');
  container.append(legend);

  await waitForIdle(map);
  ctx.ready();
}
