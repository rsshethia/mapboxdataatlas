import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'flight-arcs',
  order: 11,
  title: 'The world’s busiest air routes',
  category: 'flows',
  blurb:
    'Great-circle arcs for 320 airline routes, with line width by route count and colour by distance.',
  story:
    'Every arc is a queue of people who decided somewhere else would be better for a while. The busiest threads stitch the same few mega-hubs together, over and over, day after day.',
  description: [
    'Air routes are flows, not regions. Drawing them as great-circle arcs shows the actual path an aircraft takes over the sphere rather than a straight line in Mercator.',
    'Line width encodes how many airline route records connect a pair of airports, while colour encodes distance. Together they separate short, dense shorthaul networks from long, sparse intercontinental links.',
  ],
  interactions: [
    'Hover an arc for airports, countries, route records, and distance.',
    'Use the threshold to hide thin routes and isolate the densest corridors.',
    'Notice how the arcs bend toward the poles — that is the great-circle path, not a projection error.',
  ],
  techniques: ['Great-circle interpolation', 'Antimeridian splitting', 'Data-driven line width', 'Dual line layers'],
  apis: ['Mapbox GL JS', 'Mapbox Dark style'],
  data: [
    {
      name: 'Airports and routes',
      description: 'Airport coordinates and airline route records, deduplicated and counted.',
      source: 'OpenFlights',
      license: 'ODbL 1.0',
      url: 'https://openflights.org/data.html',
      retrieved: '2026-11-02',
      rows: 320,
      fields: ['from', 'to', 'fromIata', 'toIata', 'count', 'distanceKm'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'arcs',
  tags: ['flights', 'arcs', 'great circle', 'flows'],
};
