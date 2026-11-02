import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'directions',
  order: 27,
  title: 'Routing between two points',
  category: 'apis',
  blurb:
    'Live Mapbox Directions routes between four city pairs, with driving, cycling, and walking profiles.',
  story:
    'Four American road trips, three ways to travel each. Driving wins on speed and walking wins on nothing whatsoever — except the story. Same endpoints, wildly different journeys.',
  description: [
    'The Directions API returns more than a line: distance, duration, and a full-resolution geometry that follows the street network. This example requests that geometry and draws it over the map with start and end markers.',
    'Each preset is a real pair of coordinates. Switching the profile or the pair sends a new request; the previous request is aborted so a slow response cannot overwrite a newer one. Responses are cached in memory for the session only.',
  ],
  interactions: [
    'Choose a city pair, then switch between driving, cycling, and walking.',
    'Read the distance, duration, and implied average speed from the panel.',
    'Notice how the route geometry changes with the profile, not just the duration.',
  ],
  techniques: ['Live Directions API', 'GeoJSON route geometry', 'Request caching', 'Fit to route'],
  apis: ['Mapbox GL JS', 'Mapbox Directions API', 'Mapbox Light style'],
  data: [
    {
      name: 'Routes (live)',
      description: 'Route geometry, distance, and duration returned by the Mapbox Directions API.',
      source: 'Mapbox Directions API',
      license: 'Mapbox Terms of Service',
      url: 'https://docs.mapbox.com/api/navigation/directions/',
      retrieved: 'Live · each request',
      fields: ['geometry', 'distance', 'duration'],
    },
  ],
  difficulty: 'intro',
  thumb: 'directions',
  tags: ['directions', 'routing', 'live api', 'navigation'],
  live: true,
};
