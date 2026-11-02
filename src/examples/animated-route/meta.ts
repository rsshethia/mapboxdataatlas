import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'animated-route',
  order: 13,
  title: 'A route, unfolded in time',
  category: 'flows',
  blurb:
    'A vehicle marker travels the Mapbox Directions route from Seattle to San Diego, drawing the path as it goes.',
  story:
    'Fourteen hundred kilometres of coastline, one small dot with somewhere to be. Watch the whole Pacific edge unspool beneath it — the drive everyone dreams about in traffic.',
  description: [
    'A route is a line with a direction and a duration. This example animates a marker along the simplified geometry, revealing the path progressively instead of showing it all at once.',
    'The progress line is rebuilt each frame from the route coordinates, while the marker position is interpolated inside the current segment. The camera can follow along or stay fixed.',
  ],
  interactions: [
    'Press play to travel the route, or drag the progress slider.',
    'Turn on “Follow” to keep the marker centred.',
    'Read the distance and driving time from the panel as the marker moves.',
  ],
  techniques: ['Progressive line drawing', 'Distance interpolation', 'Playback controls', 'Directions geometry'],
  apis: ['Mapbox GL JS', 'Mapbox Directions API (snapshot)', 'Mapbox Light style'],
  data: [
    {
      name: 'Pacific Coast driving route',
      description: 'Simplified Directions geometry between five waypoints, with distance and duration.',
      source: 'Mapbox Directions API',
      license: 'Mapbox Terms of Service',
      url: 'https://docs.mapbox.com/api/navigation/directions/',
      retrieved: '2026-11-02',
      rows: 187,
      fields: ['geometry', 'distanceKm', 'durationHours'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'route',
  tags: ['route', 'animation', 'directions', 'time'],
};
