import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'map-compare',
  order: 29,
  title: 'Two metrics, one map',
  category: 'apis',
  blurb:
    'A single map that crossfades between population density and life expectancy, with a slider controlling the blend.',
  description: [
    'A side-by-side comparison splits attention and screen space. A crossfade keeps one map and one camera, letting you read the same country shapes as one variable dissolves into another.',
    'Both layers share the same source geometry and use quantile classes computed independently. At the midpoint you see a hybrid; at either end you get a clean single-variable choropleth.',
  ],
  interactions: [
    'Drag the blend slider from density to life expectancy.',
    'Use the endpoint buttons to snap to either variable.',
    'Hover a country to read both values at once.',
  ],
  techniques: ['Layer crossfade', 'Two choropleth layers', 'Shared geometry', 'Slider-driven opacity'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'World countries (1:110m)',
      description: 'Country boundaries joined to World Bank indicators.',
      source: 'Natural Earth via world-atlas',
      license: 'Public domain',
      url: 'https://github.com/topojson/world-atlas',
      retrieved: '2026-11-02',
      fields: ['id', 'name'],
    },
    {
      name: 'World Development Indicators',
      description: 'Population density and life expectancy at birth.',
      source: 'World Bank',
      license: 'CC BY 4.0',
      url: 'https://data.worldbank.org/',
      retrieved: '2026-11-02',
      fields: ['density', 'lifeExpectancy'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'compare',
  tags: ['compare', 'crossfade', 'density', 'life expectancy'],
};
