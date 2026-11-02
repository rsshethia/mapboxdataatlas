import type { ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  id: 'live-fleet',
  order: 30,
  title: 'A simulated moving fleet',
  category: 'apis',
  blurb:
    'Eighteen vehicles travel along simplified San Francisco streets, updated every frame from a local simulation — not a live feed.',
  story:
    'Eighteen make-believe vans rattle around San Francisco on a strict timetable. They are not real — but the pattern is: this is exactly how delivery dashboards watch the world move.',
  description: [
    'Moving assets are a common map problem: vehicles, deliveries, sensors. The pattern is the same as the animated particles earlier, but the positions are stateful and the vehicles respond to a clock.',
    'This fleet is generated locally. Each vehicle has a path, a speed, a direction, and a status; a requestAnimationFrame ticker advances positions and rewrites one GeoJSON source. No external feed is involved, and the panel says so.',
  ],
  interactions: [
    'Press play to start the simulation clock.',
    'Change the simulation speed between 0.5×, 1×, and 2×.',
    'Hover a vehicle for its status and speed; idle and maintenance vehicles stay put.',
  ],
  techniques: ['requestAnimationFrame ticker', 'Stateful vehicle simulation', 'Heading geometry', 'GeoJSON source updates'],
  apis: ['Mapbox GL JS', 'Mapbox Light style'],
  data: [
    {
      name: 'Simulated fleet',
      description:
        'Eighteen vehicles with hand-authored paths along Market Street, the Embarcadero, Mission, Van Ness, and nearby corridors.',
      source: 'Generated in the browser (no external feed)',
      license: 'Example code · CC BY 4.0',
      retrieved: '2026-11-02',
      fields: ['id', 'status', 'speedKmh', 'position'],
    },
  ],
  difficulty: 'advanced',
  thumb: 'live',
  tags: ['simulation', 'vehicles', 'animation', 'san francisco'],
};
