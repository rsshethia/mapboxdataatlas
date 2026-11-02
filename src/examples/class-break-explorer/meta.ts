import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'class-break-explorer',
  order: 9,
  title: 'Class breaks change the story',
  category: 'thematic',
  blurb:
    'The same population choropleth reclassified live with quantile, equal-interval, and natural-breaks methods.',
  story:
    'Same data, three different maps — and none of them are lying. Whoever picks the buckets picks the story, which is exactly why this page hands you the bucket-picker.',
  description: [
    'A choropleth is an argument about classification. Quantile breaks put the same number of countries in each class; equal intervals keep the same numeric width; natural breaks (Jenks) minimise within-class variance.',
    'Switch methods and class counts while watching the map and legend update together. The underlying values never change — only the cut points do.',
  ],
  interactions: [
    'Compare quantile and equal-interval classes on the same data.',
    'Change the number of classes from three to seven.',
    'Hover a country to see its raw value and its current class.',
  ],
  techniques: ['Quantile breaks', 'Equal intervals', 'Jenks natural breaks', 'Dynamic reclassification'],
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
      description: 'Total population and land area, latest available 2015–2024.',
      source: 'World Bank',
      license: 'CC BY 4.0',
      url: 'https://data.worldbank.org/',
      retrieved: '2026-11-02',
      fields: ['population', 'landAreaKm2', 'density'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'choropleth',
  tags: ['classification', 'jenks', 'quantile', 'choropleth'],
};
