import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'hexbin-cities',
  order: 4,
  title: 'A hexbin of world population',
  category: 'thematic',
  blurb:
    'Cities are binned into H3 hexagons, summing population so dense urban regions become visible cells.',
  story:
    'Humanity does not spread out — it clumps along rivers, coasts, and deltas. Each hexagon adds up everyone living inside it, so the great clumps of the Ganges, the Nile, and eastern China light up like embers.',
  description: [
    'Hexbins turn thousands of overlapping points into a regular surface. Each city contributes its population to one H3 cell; the cell colour is the total population binned inside it.',
    'Because H3 cells have equal area, the map avoids the area distortion that makes large, empty countries look important in a choropleth. The result is a quick read of where the world’s urban population concentrates.',
  ],
  interactions: [
    'Hover a cell to see its summed population and city count.',
    'Compare the coastal clusters of East Asia, Europe, and the Americas.',
    'Switch the hex resolution to see how aggregation changes the pattern.',
  ],
  techniques: ['H3 hexbins', 'Point aggregation', 'Quantile classes', 'Step expressions'],
  apis: ['Mapbox GL JS', 'Mapbox Dark style'],
  data: [
    {
      name: 'Populated places (1:50m)',
      description: 'City points with maximum population estimates, binned client-side.',
      source: 'Natural Earth',
      license: 'Public domain',
      url: 'https://www.naturalearthdata.com/downloads/50m-cultural-vectors/',
      retrieved: '2026-11-02',
      rows: 1250,
      fields: ['name', 'pop', 'lon', 'lat'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'hex',
  tags: ['hexbin', 'h3', 'cities', 'population'],
};
