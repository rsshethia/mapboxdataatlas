import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: '3d-buildings',
  order: 17,
  title: 'Manhattan, extruded',
  category: 'three-d',
  blurb:
    'Mapbox building footprints raised into a 3D city, coloured by height and viewed from a low pitch.',
  story:
    'Manhattan is a bar chart that learned to charge rent. Every block’s height comes from real building data — the island’s wealth, quite literally stacked.',
  description: [
    'Fill-extrusion reads height from the building tile attributes and renders each footprint as a block. The result is not a photoreal model — it is a data-driven massing study you can tilt, rotate, and inspect.',
    'Colour repeats the height variable so the skyline remains legible in a still frame. The vertical exaggeration control scales both height and the base offset, keeping the geometry consistent.',
  ],
  interactions: [
    'Right-drag (or Ctrl-drag) to tilt; drag to rotate.',
    'Hover a building for its height and type.',
    'Change the exaggeration to compress or dramatise the skyline.',
  ],
  techniques: ['fill-extrusion', 'Vector tile source layer', 'Height interpolation', 'Pitch and bearing'],
  apis: ['Mapbox GL JS', 'Mapbox Light style', 'Mapbox Streets vector tiles'],
  data: [
    {
      name: 'Building footprints',
      description: 'Mapbox Streets v8 building layer with height and minimum-height attributes.',
      source: 'Mapbox Streets vector tiles',
      license: 'Mapbox Terms of Service',
      url: 'https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/',
      retrieved: '2026-11-02',
      fields: ['height', 'min_height', 'type', 'extrude'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'extrusion',
  tags: ['3d', 'buildings', 'fill-extrusion', 'manhattan'],
};
