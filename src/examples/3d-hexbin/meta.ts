import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: '3d-hexbin',
  order: 21,
  title: 'Population hexagons in 3D',
  category: 'three-d',
  blurb:
    'H3 hexagons extruded by summed city population, turning a flat hexbin into a skyline of urban regions.',
  story:
    'If every city’s population were stacked as bricks, the world would look like this skyline: a few dizzying towers over Asia, and low suburbs almost everywhere else.',
  description: [
    'Extruding a hexbin adds a second encoding without adding a second map. Each H3 cell is raised by the population of the cities inside it, so the tallest columns are the world’s largest urban agglomerations.',
    'The colour ramp repeats the same total, which keeps the map readable when the camera is low. Change the H3 resolution to see how scale changes the shape of the skyline.',
  ],
  interactions: [
    'Drag to rotate and tilt the extruded hexagons.',
    'Hover a column for its city count and summed population.',
    'Switch resolution to merge or split urban regions.',
  ],
  techniques: ['H3 aggregation', 'fill-extrusion', 'Interpolated height', 'Pitch and rotation'],
  apis: ['Mapbox GL JS', 'Mapbox Dark style'],
  data: [
    {
      name: 'Populated places (1:50m)',
      description: 'City points with maximum population estimates, binned into H3 cells.',
      source: 'Natural Earth',
      license: 'Public domain',
      url: 'https://www.naturalearthdata.com/downloads/50m-cultural-vectors/',
      retrieved: '2026-11-02',
      rows: 1250,
      fields: ['name', 'pop', 'lon', 'lat'],
    },
  ],
  difficulty: 'advanced',
  thumb: 'hex',
  tags: ['3d', 'hexbin', 'h3', 'population'],
};
