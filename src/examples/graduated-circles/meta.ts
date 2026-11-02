import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'graduated-circles',
  order: 3,
  title: 'Cities sized by population',
  category: 'thematic',
  blurb:
    'Graduated circles for 1,250 populated places, scaled by population and filtered to the largest settlements.',
  story:
    'Countries are boxes that politicians drew; people ignore them completely. These 1,250 dots are where humanity actually sleeps — and the biggest dots hold more residents than most countries.',
  description: [
    'A point layer does what a choropleth cannot: it shows where people actually live, not just which polygon they fall inside. Circle area is scaled to population so the difference between a megacity and a regional centre stays readable.',
    'The filter switches between the 200 largest cities, the 600 largest, and every place in the snapshot. Circle size does not change between views, so the comparison stays honest.',
  ],
  interactions: [
    'Hover a circle for its city, country, and population.',
    'Switch the filter to see the long tail of smaller places.',
    'Zoom into East Asia or South Asia and compare circle density.',
  ],
  techniques: ['Circle layer', 'Interpolated radius', 'Feature filtering', 'Natural Earth places'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'Populated places (1:50m)',
      description: 'Major world cities with maximum population estimates.',
      source: 'Natural Earth',
      license: 'Public domain',
      url: 'https://www.naturalearthdata.com/downloads/50m-cultural-vectors/',
      retrieved: '2026-11-02',
      rows: 1250,
      fields: ['name', 'country', 'pop', 'lon', 'lat', 'capital'],
    },
  ],
  difficulty: 'intro',
  thumb: 'bubbles',
  tags: ['cities', 'population', 'circles', 'world'],
};
