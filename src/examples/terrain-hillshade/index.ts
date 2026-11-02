import type { ExampleContext } from '../../lib/types';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { createCheckbox, createMapUi, createNote, createPanel, createRange } from '../../lib/ui';

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [-105.6, 39.7],
    zoom: 7.6,
    pitch: 62,
    bearing: 18,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  map.addSource('dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14,
  });

  addDataLayer(map, {
    id: 'hillshade',
    type: 'hillshade',
    source: 'dem',
    paint: {
      'hillshade-exaggeration': 0.55,
      'hillshade-shadow-color': '#3a2f22',
      'hillshade-highlight-color': '#f6f1e4',
      'hillshade-accent-color': '#8a6a4a',
      'hillshade-illumination-direction': 330,
    },
  });

  let exaggeration = 1.3;
  map.setTerrain({ source: 'dem', exaggeration });

  const ui = createMapUi(container);
  const panel = createPanel('Terrain');
  panel.body.append(
    createRange({
      label: 'Relief',
      min: 0.2,
      max: 2.5,
      step: 0.1,
      value: exaggeration,
      format: (value) => `${value.toFixed(1)}×`,
      onInput: (value) => {
        exaggeration = value;
        map.setTerrain({ source: 'dem', exaggeration });
      },
    }),
    createCheckbox('Hillshade', true, (checked) => {
      map.setLayoutProperty('hillshade', 'visibility', checked ? 'visible' : 'none');
    }),
    createNote('Terrain exaggeration changes displacement only; hillshade is independent.'),
  );
  ui.append(panel.root);

  await waitForIdle(map);
  ctx.ready();
}
