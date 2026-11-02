import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'image-export',
  order: 28,
  title: 'Export the map as an image',
  category: 'apis',
  blurb:
    'A composed PNG export: Mapbox renders the WebGL canvas, then the example adds a title, legend, and attribution before download.',
  description: [
    'Mapbox renders into a WebGL canvas, so exporting a map is a canvas operation — but a raw canvas is not a finished graphic. This example composes the map with a paper-coloured title bar, a density legend, and the required Mapbox and OpenStreetMap attribution.',
    'The map is created with `preserveDrawingBuffer: true`, which keeps the last frame readable by `toBlob`. That flag has a small performance cost, so it is used only on this page.',
  ],
  interactions: [
    'Press “Download PNG” to render and save the current view.',
    'Pan or zoom first: the export matches the visible map.',
    'Read the file size and pixel dimensions in the panel after export.',
  ],
  techniques: ['preserveDrawingBuffer', 'Canvas composition', 'toBlob download', 'Attribution in exports'],
  apis: ['Mapbox GL JS', 'Mapbox Light style', 'Canvas API'],
  data: [
    {
      name: 'World countries (1:110m)',
      description: 'Country boundaries rendered as a population-density choropleth.',
      source: 'Natural Earth via world-atlas',
      license: 'Public domain',
      url: 'https://github.com/topojson/world-atlas',
      retrieved: '2026-11-02',
      fields: ['id', 'name'],
    },
    {
      name: 'World Development Indicators',
      description: 'Population and land area, latest available 2015–2024.',
      source: 'World Bank',
      license: 'CC BY 4.0',
      url: 'https://data.worldbank.org/',
      retrieved: '2026-11-02',
      fields: ['population', 'density'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'export',
  tags: ['export', 'png', 'canvas', 'attribution'],
};
