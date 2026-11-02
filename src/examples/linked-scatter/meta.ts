import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'linked-scatter',
  order: 22,
  title: 'Income, longevity, and the map',
  category: 'linked',
  blurb:
    'A country scatter of GDP per capita against life expectancy, linked to the map by hover and click.',
  description: [
    'A scatter shows the relationship; the map shows where it happens. Hovering a point highlights the country, and clicking a point flies the map to its bounds.',
    'GDP per capita is plotted on a log scale because the distribution spans four orders of magnitude. That choice makes the curvature of the income–longevity relationship visible instead of compressing most countries into a corner.',
  ],
  interactions: [
    'Hover a point to highlight its country on the map.',
    'Click a point to zoom to that country.',
    'Look for the flattening of the curve at high incomes.',
  ],
  techniques: ['Linked hover', 'Log-scaled scatter', 'Feature-state highlight', 'Fly-to bounds'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'World Development Indicators',
      description: 'GDP per capita and life expectancy by country, latest 2015–2024.',
      source: 'World Bank',
      license: 'CC BY 4.0',
      url: 'https://data.worldbank.org/',
      retrieved: '2026-11-02',
      fields: ['gdpPerCapita', 'lifeExpectancy', 'region'],
    },
    {
      name: 'World countries (1:110m)',
      description: 'Country boundaries used for the map and the highlight geometry.',
      source: 'Natural Earth via world-atlas',
      license: 'Public domain',
      url: 'https://github.com/topojson/world-atlas',
      retrieved: '2026-11-02',
      fields: ['id', 'name'],
    },
  ],
  difficulty: 'advanced',
  thumb: 'scatter',
  tags: ['linked', 'scatter', 'income', 'life expectancy'],
};
