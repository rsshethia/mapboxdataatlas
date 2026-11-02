import type { ExampleContext } from '../../lib/types';
import { loadQuakes } from '../../lib/datasets';
import { createTicker } from '../../lib/animation';
import { formatDate, formatNumber } from '../../lib/format';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createMetric, createNote, createPanel, createSegmented } from '../../lib/ui';

const START_YEAR = 2000;
const END_YEAR = 2026;
const STEP_MS = { slow: 900, normal: 520, fast: 240 } as const;
type Speed = keyof typeof STEP_MS;

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [12, 6],
    zoom: 1.1,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  const quakes = await loadQuakes('history');
  const byYear = new Map<number, typeof quakes.features>();
  for (const feature of quakes.features) {
    const year = feature.properties.year ?? START_YEAR;
    const list = byYear.get(year) ?? [];
    list.push(feature);
    byYear.set(year, list);
  }

  const cumulative: number[] = [];
  let running = 0;
  for (let year = START_YEAR; year <= END_YEAR; year += 1) {
    running += byYear.get(year)?.length ?? 0;
    cumulative[year] = running;
  }

  let year = START_YEAR;
  let playing = !ctx.reducedMotion;
  let speed: Speed = 'normal';
  let accumulator = 0;

  map.addSource('quakes', { type: 'geojson', data: quakes });

  addDataLayer(map, {
    id: 'quakes-circle',
    type: 'circle',
    source: 'quakes',
    paint: {
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        6,
        '#41b6c4',
        7,
        '#d9a441',
        8,
        '#e75263',
        9,
        '#fcfdbf',
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        6,
        2,
        7,
        4,
        8,
        7,
        9,
        11,
      ],
      'circle-opacity': 0.7,
      'circle-stroke-color': 'rgba(244, 240, 230, 0.2)',
      'circle-stroke-width': 0.4,
    },
  });

  const apply = () => {
    map.setFilter('quakes-circle', ['<=', ['get', 'year'], year]);
  };

  const yearMetric = createMetric('Year', String(year));
  const countMetric = createMetric('Events so far', formatNumber(cumulative[year] ?? 0));
  const yearValue = yearMetric.querySelector('.metric__value') as HTMLElement;
  const countValue = countMetric.querySelector('.metric__value') as HTMLElement;
  const eventNote = createNote('');
  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.className = 'play-button';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = String(START_YEAR);
  slider.max = String(END_YEAR);
  slider.step = '1';
  slider.value = String(year);
  slider.className = 'range';
  slider.setAttribute('aria-label', 'Playback year');

  const update = () => {
    apply();
    yearValue.textContent = String(year);
    countValue.textContent = formatNumber(cumulative[year] ?? 0);
    slider.value = String(year);
    playButton.textContent = playing ? '❚❚' : '▶';
    const events = byYear.get(year) ?? [];
    const largest = events.reduce<(typeof events)[number] | null>(
      (best, feature) =>
        !best || (feature.properties.mag ?? 0) > (best.properties.mag ?? 0) ? feature : best,
      null,
    );
    eventNote.textContent = largest
      ? `${year} largest: M${largest.properties.mag?.toFixed(1)} — ${largest.properties.place}`
      : `${year}: no M6+ events in the catalogue`;
  };

  const advance = () => {
    year = year >= END_YEAR ? START_YEAR : year + 1;
    update();
  };

  const ticker = createTicker((_total, delta) => {
    if (!playing) return;
    accumulator += delta;
    if (accumulator >= STEP_MS[speed]) {
      accumulator = 0;
      advance();
    }
  });
  ctx.onCleanup(() => ticker.stop());
  if (playing) ticker.start();

  playButton.addEventListener('click', () => {
    playing = !playing;
    if (playing && !ticker.isRunning()) ticker.start();
    update();
  });

  slider.addEventListener('input', () => {
    playing = false;
    year = Number(slider.value);
    update();
  });

  const ui = createMapUi(container);
  const panel = createPanel('Playback');
  const metrics = document.createElement('div');
  metrics.className = 'metric-row';
  metrics.append(yearMetric, countMetric);

  const controls = document.createElement('div');
  controls.className = 'play-row';
  controls.append(playButton, slider);

  panel.body.append(
    metrics,
    controls,
    createSegmented<Speed>(
      [
        { value: 'slow', label: 'Slow' },
        { value: 'normal', label: 'Normal' },
        { value: 'fast', label: 'Fast' },
      ],
      speed,
      (next) => {
        speed = next;
      },
    ),
    eventNote,
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: 'quakes-circle',
    render: (feature) => {
      const properties = feature.properties as {
        mag: number | null;
        place: string;
        time: number;
        depth: number | null;
      };
      return tooltipRows(
        [
          { label: 'Magnitude', value: properties.mag?.toFixed(1) ?? '—' },
          { label: 'Date', value: formatDate(properties.time) },
          { label: 'Depth', value: properties.depth == null ? '—' : `${formatNumber(properties.depth)} km` },
        ],
        properties.place,
      );
    },
  });

  update();
  await waitForIdle(map);
  ctx.ready();
}
