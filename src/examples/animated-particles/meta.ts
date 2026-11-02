import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'animated-particles',
  order: 12,
  title: 'Particles along air routes',
  category: 'flows',
  blurb:
    'Moving points travel along great-circle arcs, animating the direction and volume of the world’s air network.',
  story:
    'Static lines say routes exist; moving dots say somebody is actually up there right now, tray table down, halfway across an ocean.',
  description: [
    'Static arcs show where flows exist; moving particles show that they have a direction. Each particle follows the same great-circle path as its route, at a speed scaled to route length.',
    'The animation is a ticking GeoJSON source: every frame rewrites one point per route. It is a deliberately simple technique — no custom WebGL — that stays smooth for a few hundred particles.',
  ],
  interactions: [
    'Watch the dominant west-to-east and north-south corridors.',
    'Use the speed control to slow the animation down.',
    'Hover a faint arc to inspect the underlying route.',
  ],
  techniques: ['requestAnimationFrame ticker', 'GeoJSON source updates', 'Great-circle sampling', 'Reduced-motion fallback'],
  apis: ['Mapbox GL JS', 'Mapbox Dark style'],
  data: [
    {
      name: 'Airports and routes',
      description: 'The 320 densest airline route pairs from OpenFlights.',
      source: 'OpenFlights',
      license: 'ODbL 1.0',
      url: 'https://openflights.org/data.html',
      retrieved: '2026-11-02',
      rows: 320,
      fields: ['from', 'to', 'count', 'distanceKm'],
    },
  ],
  difficulty: 'advanced',
  thumb: 'particles',
  tags: ['animation', 'particles', 'flights', 'flows'],
};
