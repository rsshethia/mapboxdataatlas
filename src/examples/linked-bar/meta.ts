import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'linked-bar',
  order: 23,
  title: 'Twelve countries, linked to the map',
  category: 'linked',
  blurb:
    'A ranked bar chart of the most populous countries, with hover highlighting and click-to-zoom on the map.',
  description: [
    'A ranked bar chart is often clearer than a choropleth for “who is biggest?”. Linking it to the map restores the geography the chart drops.',
    'Hovering a bar highlights the country geometry; clicking zooms to its bounds. The map stays neutral so the highlighted country is the only strong colour on screen.',
  ],
  interactions: [
    'Hover a bar to highlight the country.',
    'Click a bar to zoom to that country.',
    'Hover the map for the full values of any country, not just the top twelve.',
  ],
  techniques: ['Ranked bar chart', 'Linked highlight', 'Feature-state', 'Fly-to bounds'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'World Development Indicators',
      description: 'Total population by country, latest available 2015–2024.',
      source: 'World Bank',
      license: 'CC BY 4.0',
      url: 'https://data.worldbank.org/',
      retrieved: '2026-11-02',
      fields: ['population', 'region'],
    },
    {
      name: 'World countries (1:110m)',
      description: 'Country boundaries used for the map and highlight geometry.',
      source: 'Natural Earth via world-atlas',
      license: 'Public domain',
      url: 'https://github.com/topojson/world-atlas',
      retrieved: '2026-11-02',
      fields: ['id', 'name'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'bars',
  tags: ['linked', 'bar chart', 'population', 'ranking'],
};
