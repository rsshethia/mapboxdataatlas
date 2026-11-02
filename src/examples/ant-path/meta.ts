import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'ant-path',
  order: 14,
  title: 'Marching ants along trade lanes',
  category: 'flows',
  blurb:
    'An animated dash pattern sends pulses along air routes, a low-cost way to imply direction on static geometry.',
  story:
    'Ants solved logistics millions of years before airlines: just follow the glowing trail. These pulses march the same lanes real aircraft fly, giving direction to lines that never move.',
  description: [
    'A dashed line is static. Animating the dash pattern — the classic “marching ants” effect — gives the eye a direction without a particle system or custom shader.',
    'The pattern is a rotating numeric array written to `line-dasharray`. Because the array repeats, shifting it by one step produces continuous motion. The animation is throttled so the paint update stays cheap.',
  ],
  interactions: [
    'Watch the direction of travel implied by the moving dashes.',
    'Hover a route to read its airports and route count.',
    'Toggle the trail layer to compare the animated lines with plain arcs.',
  ],
  techniques: ['Animated line-dasharray', 'Paint-property animation', 'Great-circle arcs'],
  apis: ['Mapbox GL JS', 'Mapbox Dark style'],
  data: [
    {
      name: 'Airports and routes',
      description: 'Airline route pairs with record counts, used as flow geometry.',
      source: 'OpenFlights',
      license: 'ODbL 1.0',
      url: 'https://openflights.org/data.html',
      retrieved: '2026-11-02',
      rows: 320,
      fields: ['from', 'to', 'count', 'distanceKm'],
    },
  ],
  difficulty: 'intermediate',
  thumb: 'arcs',
  tags: ['animation', 'dasharray', 'flows', 'flights'],
};
