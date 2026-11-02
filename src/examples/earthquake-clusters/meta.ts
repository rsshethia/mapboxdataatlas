import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'earthquake-clusters',
  order: 6,
  title: 'Clustered earthquakes',
  category: 'thematic',
  blurb:
    'The last 30 days of earthquakes as a clustered point layer: counts at low zoom, individual events up close.',
  description: [
    'Clustering is the point-layer answer to overplotting. At low zoom the map shows clusters with a count; as you zoom in, clusters split until individual earthquakes remain.',
    'The size and colour of a cluster encode how many events it contains, while unclustered points are scaled and coloured by magnitude. Clicking a cluster expands it to the zoom where it splits.',
  ],
  interactions: [
    'Click a cluster to zoom to its expansion level.',
    'Hover a cluster for its event count and dominant magnitude range.',
    'Hover an individual point for magnitude, depth, and time.',
  ],
  techniques: ['GeoJSON clustering', 'Cluster expansion zoom', 'Data-driven circle styling'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'Recent earthquakes (M2.5+, past 30 days)',
      description: 'Point features normalized from the USGS summary feed.',
      source: 'USGS Earthquake Hazards Program',
      license: 'Public domain',
      url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/',
      retrieved: '2026-11-02',
      fields: ['mag', 'place', 'time', 'depth', 'url'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'clusters',
  tags: ['earthquakes', 'clusters', 'interaction'],
};
