import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'world-choropleth',
  order: 1,
  title: 'World population, in class breaks',
  category: 'thematic',
  blurb:
    'A quantile choropleth of population by country, with a switch between total population and people per square kilometre.',
  story:
    'Two countries hold more than a third of all humanity, and most maps flatten them into one boring colour. This one refuses — then flip to density and watch tiny crowded city-states outshout entire continents.',
  description: [
    'Population is extremely skewed: a handful of countries hold most of the world’s people. Quantile breaks put the same number of countries in each colour class, which makes the map legible without hiding the outliers.',
    'Switch to population density to see the same geometry tell a different story. The classes are recalculated for each metric, so the legend always matches the colours on the map.',
  ],
  interactions: [
    'Switch between population and density in the panel.',
    'Hover a country to read its values and class.',
    'Notice how quantile classes flatten the difference between China and India, then compare with density.',
  ],
  techniques: [
    'TopoJSON → GeoJSON',
    'Quantile class breaks',
    'Step expressions',
    'Interactive legend',
  ],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'World countries (1:110m)',
      description: 'Country boundaries and numeric ISO identifiers.',
      source: 'Natural Earth via world-atlas',
      license: 'Public domain',
      url: 'https://github.com/topojson/world-atlas',
      retrieved: '2026-11-02',
      fields: ['id', 'name'],
    },
    {
      name: 'World Development Indicators',
      description: 'Population, GDP per capita, life expectancy, and land area, latest available 2015–2024.',
      source: 'World Bank',
      license: 'CC BY 4.0',
      url: 'https://data.worldbank.org/',
      retrieved: '2026-11-02',
      fields: ['population', 'gdpPerCapita', 'lifeExpectancy', 'landAreaKm2', 'density'],
    },
  ],
  difficulty: 'intro',
  thumb: 'choropleth',
  tags: ['population', 'choropleth', 'world'],
};
