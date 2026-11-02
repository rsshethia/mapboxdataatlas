import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'bivariate-world',
  order: 2,
  title: 'Income and longevity, together',
  category: 'thematic',
  blurb:
    'A bivariate choropleth: each country is placed in a 3×3 grid of GDP per capita and life expectancy.',
  story:
    'Money cannot buy happiness, but the numbers suggest it rents extra years. Nine colours ask one question: where do wealth and long life travel together, and where do they part ways?',
  description: [
    'Two variables on one map can turn a choropleth into a puzzle. A bivariate scheme solves it by mixing nine colours: the horizontal axis is GDP per capita, the vertical axis is life expectancy at birth.',
    'Countries in the lower-left corner are poor and short-lived; the upper-right corner is rich and long-lived. The diagonal is the expected path — countries that leave it are the interesting ones.',
  ],
  interactions: [
    'Hover a country to read both values and its 3×3 class.',
    'Use the legend to decode the nine colours before reading the map.',
    'Look for countries that are richer than their life expectancy suggests — or the reverse.',
  ],
  techniques: [
    'Bivariate colour scheme',
    'Tertile class breaks',
    'Match expressions',
    'TopoJSON → GeoJSON',
  ],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'World countries (1:110m)',
      description: 'Country boundaries joined by numeric ISO identifier.',
      source: 'Natural Earth via world-atlas',
      license: 'Public domain',
      url: 'https://github.com/topojson/world-atlas',
      retrieved: '2026-11-02',
      fields: ['id', 'name'],
    },
    {
      name: 'World Development Indicators',
      description: 'GDP per capita and life expectancy, latest available 2015–2024.',
      source: 'World Bank',
      license: 'CC BY 4.0',
      url: 'https://data.worldbank.org/',
      retrieved: '2026-11-02',
      fields: ['gdpPerCapita', 'lifeExpectancy'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'bivariate',
  tags: ['bivariate', 'income', 'life expectancy', 'world'],
};
