import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'categorical-world',
  order: 10,
  title: 'A categorical world',
  category: 'thematic',
  blurb:
    'Countries coloured by World Bank region, with a switch to income group — no class breaks, just categories.',
  description: [
    'Not every choropleth needs a numeric scale. Categorical maps answer “which group does this belong to?” and are the right choice for regions, income bands, or governance types.',
    'Region is geographic by construction, so the map mostly confirms what you already know. Income group is more revealing: it cuts across continents and shows the middle-income belt that stretches from Latin America through Africa to Southeast Asia.',
  ],
  interactions: [
    'Switch between region and income group in the panel.',
    'Hover a country for its region, income group, and population.',
    'Find the countries that are “Not classified” and ask why.',
  ],
  techniques: ['Categorical fill', 'Match expressions', 'Join by ISO identifier'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'World countries (1:110m)',
      description: 'Country boundaries joined to World Bank metadata.',
      source: 'Natural Earth via world-atlas',
      license: 'Public domain',
      url: 'https://github.com/topojson/world-atlas',
      retrieved: '2026-11-02',
      fields: ['id', 'name'],
    },
    {
      name: 'World Bank country metadata',
      description: 'World Bank region and income classification.',
      source: 'World Bank',
      license: 'CC BY 4.0',
      url: 'https://data.worldbank.org/',
      retrieved: '2026-11-02',
      fields: ['region', 'income', 'population'],
    },
  ],
  difficulty: 'intro',
  thumb: 'choropleth',
  tags: ['categorical', 'region', 'income', 'world'],
};
