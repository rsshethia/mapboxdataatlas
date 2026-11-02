import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'terrain-hillshade',
  order: 18,
  title: 'Terrain and hillshade',
  category: 'three-d',
  blurb:
    'A raster DEM drives both a hillshade layer and true 3D terrain across the Colorado Rockies.',
  story:
    'Mountains are the planet refusing to be flat. Here one elevation model does double duty: shading the map like an old atlas while physically lifting the ground under your cursor.',
  description: [
    'A raster elevation model can do two jobs at once: a hillshade layer shades the surface for a map-like read, while `setTerrain` displaces the camera and tiles into real relief.',
    'The exaggeration slider changes only the terrain displacement, not the hillshade. At higher values the relief is dramatic but the shading stays honest, which is why the two controls are separate.',
  ],
  interactions: [
    'Tilt and rotate the map to see the Front Range in relief.',
    'Change the terrain exaggeration.',
    'Toggle the hillshade to compare shaded relief with raw 3D.',
  ],
  techniques: ['Raster DEM', 'setTerrain', 'Hillshade layer', 'Exaggeration control'],
  apis: ['Mapbox GL JS', 'Mapbox Terrain DEM', 'Mapbox Outdoors style'],
  data: [
    {
      name: 'Mapbox Terrain DEM',
      description: 'Elevation raster tiles used for displacement and hillshade.',
      source: 'Mapbox',
      license: 'Mapbox Terms of Service',
      url: 'https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/',
      retrieved: '2026-11-02',
      fields: ['elevation'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'terrain',
  tags: ['terrain', 'hillshade', 'dem', 'colorado'],
};
