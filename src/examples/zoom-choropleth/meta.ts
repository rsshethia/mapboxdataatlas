import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'zoom-choropleth',
  order: 8,
  title: 'One metric, two geographies',
  category: 'thematic',
  blurb:
    'A choropleth that changes geography with zoom: states at the national scale, counties once you zoom in.',
  description: [
    'The same variable — people per square kilometre — is drawn at two levels of detail. At the national view the states carry the pattern; below zoom 5 the counties take over, revealing the metropolitan cores hidden inside state averages.',
    'Both layers use quantile classes computed independently, so each geography gets a legible legend. The legend swaps automatically with the visible layer.',
  ],
  interactions: [
    'Zoom into a state to watch the county layer take over.',
    'Use the level buttons to lock the map to states or counties.',
    'Hover any polygon for its name, population, density, and area.',
  ],
  techniques: ['Zoom-dependent layers', 'Dual-geography join', 'Quantile class breaks', 'Layer visibility'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'US states and counties (1:10m)',
      description: 'Cartographic boundaries for states and 3,231 counties.',
      source: 'U.S. Census Bureau via us-atlas',
      license: 'Public domain',
      url: 'https://github.com/topojson/us-atlas',
      retrieved: '2026-11-02',
      fields: ['id', 'name'],
    },
    {
      name: 'Population and area',
      description: 'Population, land area, and derived density for states and counties.',
      source: 'County Health Rankings 2025 (ACS and BLS)',
      license: 'Free to use with attribution',
      url: 'https://www.countyhealthrankings.org/',
      retrieved: '2026-11-02',
      fields: ['population', 'landAreaKm2', 'density'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'choropleth',
  tags: ['choropleth', 'zoom', 'states', 'counties'],
};
