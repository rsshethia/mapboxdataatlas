import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'us-state-extrusions',
  order: 7,
  title: 'State population density, extruded',
  category: 'thematic',
  blurb:
    'US states raised into 3D blocks by population density, with colour reinforcing the same measure.',
  description: [
    'Fill-extrusion turns a flat choropleth into a landscape. Here the height of each state is a function of population density, so the Northeast rises above the Mountain West.',
    'Height is not area: the vertical axis uses an interpolated scale capped well below the tallest state’s raw value, and the colour ramp repeats the same variable so the map remains readable without the 3D cue.',
  ],
  interactions: [
    'Drag with the right mouse button (or Ctrl-drag) to tilt and rotate.',
    'Hover a state for population, density, income, and unemployment.',
    'Use the height multiplier to exaggerate or flatten the extrusion.',
  ],
  techniques: ['fill-extrusion', 'Interpolated height', 'TopoJSON join', 'Pitch and bearing'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'US states (1:10m)',
      description: 'State boundaries from the Census Bureau cartographic boundary files.',
      source: 'U.S. Census Bureau via us-atlas',
      license: 'Public domain',
      url: 'https://github.com/topojson/us-atlas',
      retrieved: '2026-11-02',
      fields: ['id', 'name'],
    },
    {
      name: 'State population and income',
      description: 'Population, median household income, and unemployment rate.',
      source: 'County Health Rankings 2025 (ACS and BLS)',
      license: 'Free to use with attribution',
      url: 'https://www.countyhealthrankings.org/',
      retrieved: '2026-11-02',
      fields: ['population', 'density', 'medianIncome', 'unemploymentRate'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'extrusion',
  tags: ['3d', 'fill-extrusion', 'states', 'density'],
};
