import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'quake-time-slider',
  order: 15,
  title: 'Earthquakes through time',
  category: 'flows',
  blurb:
    'A cumulative year slider reveals the M6+ earthquake catalogue from 2000 to 2026, with size by magnitude and colour by depth.',
  story:
    'Drag twenty-six years of planetary restlessness with one finger. The dots pile up along the same guilty seams — the Ring of Fire earns its name, year after year.',
  description: [
    'Time is the third dimension most maps ignore. This example filters the earthquake catalogue with a cumulative year threshold: at 2010 the map shows every M6+ event up to that year, not just that year’s events.',
    'Circle size encodes magnitude and colour encodes depth, so the map reads as a catalogue rather than a single snapshot. Drag the slider to watch the catalogue accumulate.',
  ],
  interactions: [
    'Drag the year slider to accumulate events.',
    'Hover a circle for magnitude, depth, and date.',
    'Compare the depth colours along the Pacific subduction zones.',
  ],
  techniques: ['Cumulative time filter', 'Data-driven circle size', 'Depth colour ramp', 'Range control'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'Earthquake catalogue (M6+, 2000–2026)',
      description: 'Normalized point features with magnitude, depth, time, and year.',
      source: 'USGS Earthquake Hazards Program',
      license: 'Public domain',
      url: 'https://earthquake.usgs.gov/earthquakes/search/',
      retrieved: '2026-11-02',
      rows: 3997,
      fields: ['mag', 'place', 'time', 'depth', 'year'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'timeline',
  tags: ['earthquakes', 'time', 'slider', 'usgs'],
};
