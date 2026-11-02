import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'elevation-profile',
  order: 20,
  title: 'Elevation along a route',
  category: 'three-d',
  blurb:
    'Sample Mapbox terrain along the Pacific Coast route and draw the elevation profile, linked to a marker on the map.',
  description: [
    'A terrain map answers “how high?” only approximately. This example samples the DEM at regular intervals along a route and turns those samples into a profile chart.',
    'Hovering the chart moves a marker on the map, connecting the abstract profile to the actual place. The same route geometry powers both views, so distance and position stay consistent.',
  ],
  interactions: [
    'Hover the profile to move the marker along the route.',
    'Compare the coastal lowlands with the Oregon and California ranges.',
    'Tilt the map to see the terrain the profile is sampling.',
  ],
  techniques: ['Terrain sampling', 'Linked chart and map', 'D3 area profile', 'Directions geometry'],
  apis: ['Mapbox GL JS', 'Mapbox Terrain DEM', 'Mapbox Directions API (snapshot)'],
  data: [
    {
      name: 'Mapbox Terrain DEM',
      description: 'Elevation samples queried from the raster DEM at 220 points.',
      source: 'Mapbox',
      license: 'Mapbox Terms of Service',
      url: 'https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/',
      retrieved: '2026-11-02',
      fields: ['elevation'],
    },
    {
      name: 'Pacific Coast driving route',
      description: 'Simplified Directions geometry between five waypoints.',
      source: 'Mapbox Directions API',
      license: 'Mapbox Terms of Service',
      url: 'https://docs.mapbox.com/api/navigation/directions/',
      retrieved: '2026-11-02',
      rows: 187,
      fields: ['geometry', 'distanceKm', 'durationHours'],
    },
  ],
  difficulty: 'advanced',
  thumb: 'profile',
  tags: ['terrain', 'elevation', 'profile', 'linked'],
};
