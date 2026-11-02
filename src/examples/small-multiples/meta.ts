import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'small-multiples',
  order: 24,
  title: 'Four maps, one camera',
  category: 'linked',
  blurb:
    'A 2×2 small-multiple of world indicators — population, density, income, and life expectancy — with a synchronised camera.',
  story:
    'Four questions, one planet: how many, how crowded, how rich, how long-lived. Same shapes, four answers — the comparison your eyes could never make by flipping between tabs.',
  description: [
    'Small multiples trade size for comparison. Four maps share one extent and one camera, so the eye can move between them without re-orienting. Each cell answers a different question about the same country shapes.',
    'The camera is linked both ways: dragging or zooming any cell moves the other three. Hovering works independently, so you can read a value in one panel while the others provide context.',
  ],
  interactions: [
    'Drag or zoom any cell — all four maps follow.',
    'Hover a country to read the metric for that panel.',
    'Compare the density and income panels: the coastal concentration in density has no direct income equivalent.',
  ],
  techniques: ['Small multiples', 'Synchronised cameras', 'Shared geometry', 'Per-panel class breaks'],
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
      description: 'Population, density, GDP per capita, and life expectancy.',
      source: 'World Bank',
      license: 'CC BY 4.0',
      url: 'https://data.worldbank.org/',
      retrieved: '2026-11-02',
      fields: ['population', 'density', 'gdpPerCapita', 'lifeExpectancy'],
    },
  ],
  difficulty: 'advanced',
  thumb: 'multiples',
  tags: ['small multiples', 'linked', 'world', 'camera sync'],
};
