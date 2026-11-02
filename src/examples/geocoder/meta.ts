import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'geocoder',
  order: 26,
  title: 'Search the world',
  category: 'apis',
  blurb:
    'A live Mapbox Geocoding search box: type a place, choose a result, and fly the map to it.',
  description: [
    'Geocoding turns text into coordinates. The Mapbox Geocoding API returns ranked places, addresses, and points of interest with bounding boxes, which is often more useful than a single point.',
    'This example debounces typing, aborts stale requests, and fits the map to the chosen result’s bounding box. The search is live and isolated to this page; nothing is pre-bundled.',
  ],
  interactions: [
    'Type a place name and press Enter, or wait for suggestions.',
    'Click a result to move the map and mark it.',
    'Try the suggested searches for dense cities, long countries, and small islands.',
  ],
  techniques: ['Live Geocoding API', 'Debounced requests', 'Abort stale searches', 'Fit to bounding box'],
  apis: ['Mapbox GL JS', 'Mapbox Geocoding API', 'Mapbox Light style'],
  data: [
    {
      name: 'Geocoding results (live)',
      description: 'Place names, coordinates, and bounding boxes returned by the Mapbox Geocoding API.',
      source: 'Mapbox Geocoding API',
      license: 'Mapbox Terms of Service',
      url: 'https://docs.mapbox.com/api/search/geocoding/',
      retrieved: 'Live · each search',
      fields: ['place_name', 'center', 'bbox', 'place_type'],
    },
  ],
  difficulty: 'intro',
  thumb: 'search',
  tags: ['geocoder', 'search', 'live api', 'fly-to'],
  live: true,
};
