import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'quake-playback',
  order: 16,
  title: 'Playing the earthquake record',
  category: 'flows',
  blurb:
    'An animated year-by-year playback of the M6+ catalogue, with a cumulative count and the largest event of each year.',
  story:
    'Press play and a quarter-century of major quakes detonates one year at a time. Some years the planet mutters; some years it shouts — the counter keeps score.',
  description: [
    'Playback turns a time series into a performance. Each tick advances one year, filters the catalogue cumulatively, and updates a readout of the largest event in that year.',
    'The animation is deliberate rather than continuous: the eye needs a moment to register each frame. Speed controls let you move from a slow survey to a quick overview.',
  ],
  interactions: [
    'Press play to step through 2000–2026.',
    'Scrub the slider to jump to a year.',
    'Read the largest event and cumulative count for the selected year.',
  ],
  techniques: ['Timed playback', 'Cumulative filtering', 'Synchronised readouts', 'Reduced-motion fallback'],
  apis: ['Mapbox GL JS', 'Mapbox Dark style'],
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
  tags: ['earthquakes', 'playback', 'time', 'animation'],
};
