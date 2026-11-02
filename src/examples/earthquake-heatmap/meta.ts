import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'earthquake-heatmap',
  order: 5,
  title: 'Where the ground moves',
  category: 'thematic',
  blurb:
    'A magnitude-weighted heatmap of 3,997 earthquakes, with a switch between the long catalogue and the last 30 days.',
  description: [
    'A heatmap is a density surface, not a count. Each earthquake contributes weight proportional to its magnitude, so a cluster of small tremors does not read the same as a single great quake.',
    'The long catalogue spans 2000–2026 and is filtered to magnitude 6 and above, which reveals the tectonic plate boundaries. The 30-day view keeps smaller events and shows how the same boundaries stay active.',
  ],
  interactions: [
    'Switch between the 26-year catalogue and the last 30 days.',
    'Zoom into the Pacific Ring of Fire and watch the heatmap sharpen.',
    'Hover the circle layer at high zoom for individual events.',
  ],
  techniques: ['Heatmap layer', 'Magnitude weighting', 'Zoom interpolation', 'Dark basemap'],
  apis: ['Mapbox GL JS', 'Mapbox Dark style'],
  data: [
    {
      name: 'Earthquake catalogue (M6+, 2000–2026)',
      description: 'Normalized point features with magnitude, depth, and place.',
      source: 'USGS Earthquake Hazards Program',
      license: 'Public domain',
      url: 'https://earthquake.usgs.gov/earthquakes/search/',
      retrieved: '2026-11-02',
      rows: 3997,
      fields: ['mag', 'place', 'time', 'depth', 'url', 'year'],
    },
    {
      name: 'Recent earthquakes (M2.5+, past 30 days)',
      description: 'Live feed snapshot refreshed on the data preparation date.',
      source: 'USGS Earthquake Hazards Program',
      license: 'Public domain',
      url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/',
      retrieved: '2026-11-02',
      fields: ['mag', 'place', 'time', 'depth', 'url'],
    },
  ],
  difficulty: 'intro',
  thumb: 'heat',
  tags: ['earthquakes', 'heatmap', 'usgs', 'density'],
};
