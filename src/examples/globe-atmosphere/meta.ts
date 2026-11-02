import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'globe-atmosphere',
  order: 19,
  title: 'A globe with atmosphere',
  category: 'three-d',
  blurb:
    'The same city and flight data on a globe projection, with atmosphere, space colour, and a slow orbit.',
  description: [
    'Mapbox GL JS can render the world as a globe rather than a plane. The projection changes how distance and direction read, and it gives the map a horizon, atmosphere, and space colour.',
    'The data is deliberately familiar — major cities and air routes — so the projection itself is the subject. The slow orbit is a presentation aid, not a geographic claim.',
  ],
  interactions: [
    'Drag to spin the globe; scroll to zoom in until it flattens toward Mercator.',
    'Toggle auto-rotate in the panel.',
    'Hover a city for its population; hover an arc for its route.',
  ],
  techniques: ['Globe projection', 'Atmosphere and fog', 'Orbit animation', 'Layered points and arcs'],
  apis: ['Mapbox GL JS', 'Mapbox Dark style'],
  data: [
    {
      name: 'Populated places (1:50m)',
      description: 'The 400 largest cities by maximum population estimate.',
      source: 'Natural Earth',
      license: 'Public domain',
      url: 'https://www.naturalearthdata.com/downloads/50m-cultural-vectors/',
      retrieved: '2026-11-02',
      rows: 400,
      fields: ['name', 'country', 'pop', 'lon', 'lat'],
    },
    {
      name: 'Airports and routes',
      description: 'The 120 densest route pairs, drawn as great-circle arcs.',
      source: 'OpenFlights',
      license: 'ODbL 1.0',
      url: 'https://openflights.org/data.html',
      retrieved: '2026-11-02',
      rows: 120,
      fields: ['from', 'to', 'count'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'globe',
  tags: ['globe', 'atmosphere', 'cities', 'flights'],
};
