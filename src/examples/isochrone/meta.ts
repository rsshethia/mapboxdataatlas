import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'isochrone',
  order: 25,
  title: 'Travel time from one point',
  category: 'apis',
  blurb:
    'Live isochrone contours from the Mapbox Isochrone API: what you can reach in 10, 20, and 30 minutes by road, bike, or on foot.',
  description: [
    'An isochrone is a contour of equal travel time. Unlike a buffer, it respects the street network, coastlines, and one-way restrictions, so the shape is a picture of accessibility rather than distance.',
    'This example calls the Mapbox Isochrone API each time you change the travel mode or the time bands. Requests are isolated to this page and aborted when you navigate away; no response is cached or bundled.',
  ],
  interactions: [
    'Switch between driving, cycling, and walking.',
    'Change the time bands between 10–30 and 20–60 minutes.',
    'Hover a contour to read its travel time.',
  ],
  techniques: ['Live Isochrone API', 'Network travel time', 'Contour polygons', 'Request cancellation'],
  apis: ['Mapbox GL JS', 'Mapbox Isochrone API', 'Mapbox Light style'],
  data: [
    {
      name: 'Isochrone contours (live)',
      description:
        'Contour polygons requested from the Mapbox Isochrone API for a fixed origin in Copenhagen.',
      source: 'Mapbox Isochrone API',
      license: 'Mapbox Terms of Service',
      url: 'https://docs.mapbox.com/api/navigation/isochrone/',
      retrieved: 'Live · each request',
      fields: ['contour', 'geometry'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'isochrone',
  tags: ['isochrone', 'accessibility', 'live api', 'travel time'],
  live: true,
};
