import type { ExampleContext } from '../../lib/types';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createNote, createPanel, createRange } from '../../lib/ui';

const HEIGHT_COLORS = ['#e9e3d5', '#d9c3a5', '#d9a441', '#c8462b', '#7f2a1c'];

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-73.985, 40.748],
    zoom: 15.4,
    pitch: 60,
    bearing: -28,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  let exaggeration = 1;

  const heightExpression = (scale: number): unknown => [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['*', ['coalesce', ['get', 'height'], 8], scale],
  ];

  addDataLayer(map, {
    id: '3d-buildings',
    type: 'fill-extrusion',
    source: 'composite',
    'source-layer': 'building',
    minzoom: 14.5,
    filter: ['==', 'extrude', 'true'],
    paint: {
      'fill-extrusion-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'height'], 0],
        0,
        HEIGHT_COLORS[0],
        25,
        HEIGHT_COLORS[1],
        80,
        HEIGHT_COLORS[2],
        180,
        HEIGHT_COLORS[3],
        320,
        HEIGHT_COLORS[4],
      ],
      'fill-extrusion-height': heightExpression(exaggeration) as never,
      'fill-extrusion-base': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['*', ['coalesce', ['get', 'min_height'], 0], exaggeration],
      ] as never,
      'fill-extrusion-opacity': 0.92,
    },
  });

  const ui = createMapUi(container);
  const panel = createPanel('Vertical exaggeration');
  panel.body.append(
    createRange({
      label: 'Height',
      min: 0.5,
      max: 2.5,
      step: 0.1,
      value: exaggeration,
      format: (value) => `${value.toFixed(1)}×`,
      onInput: (value) => {
        exaggeration = value;
        map.setPaintProperty(
          '3d-buildings',
          'fill-extrusion-height',
          heightExpression(exaggeration) as never,
        );
        map.setPaintProperty(
          '3d-buildings',
          'fill-extrusion-base',
          [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['*', ['coalesce', ['get', 'min_height'], 0], exaggeration],
          ] as never,
        );
      },
    }),
    createNote('Building heights come from the vector tile attributes, not a survey.'),
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: '3d-buildings',
    render: (feature) => {
      const properties = (feature.properties ?? {}) as Record<string, unknown>;
      const height = Number(properties.height);
      return tooltipRows(
        [
          { label: 'Height', value: Number.isFinite(height) ? `${Math.round(height)} m` : '—' },
          {
            label: 'Min height',
            value:
              properties.min_height == null ? '0 m' : `${Math.round(Number(properties.min_height))} m`,
          },
          { label: 'Type', value: String(properties.type ?? 'building') },
        ],
        'Building footprint',
      );
    },
  });

  await waitForIdle(map);
  ctx.ready();
}
