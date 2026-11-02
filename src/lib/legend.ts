import { el, svgEl } from './dom';

export interface SteppedLegendOptions {
  title: string;
  colors: string[];
  labels: string[];
  note?: string;
}

export function createSteppedLegend(options: SteppedLegendOptions): HTMLElement {
  const root = el('div', 'legend');
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', options.title);
  root.append(el('p', 'legend__title', options.title));
  const list = el('div', 'legend__steps');
  options.colors.forEach((color, index) => {
    const item = el('div', 'legend__step');
    const swatch = el('span', 'legend__swatch');
    swatch.style.background = color;
    const label = el('span', 'legend__label', options.labels[index] ?? '');
    item.append(swatch, label);
    list.append(item);
  });
  root.append(list);
  if (options.note) root.append(el('p', 'legend__note', options.note));
  return root;
}

export interface ContinuousLegendOptions {
  title: string;
  colors: string[];
  minLabel: string;
  maxLabel: string;
  note?: string;
}

export function createContinuousLegend(options: ContinuousLegendOptions): HTMLElement {
  const root = el('div', 'legend');
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', options.title);
  root.append(el('p', 'legend__title', options.title));
  const bar = el('div', 'legend__gradient');
  bar.style.background = `linear-gradient(90deg, ${options.colors.join(', ')})`;
  root.append(bar);
  const ticks = el('div', 'legend__ticks');
  ticks.append(el('span', '', options.minLabel), el('span', '', options.maxLabel));
  root.append(ticks);
  if (options.note) root.append(el('p', 'legend__note', options.note));
  return root;
}

export interface CategoricalLegendOptions {
  title: string;
  items: Array<{ label: string; color: string }>;
  note?: string;
}

export function createCategoricalLegend(options: CategoricalLegendOptions): HTMLElement {
  const root = el('div', 'legend');
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', options.title);
  root.append(el('p', 'legend__title', options.title));
  const list = el('div', 'legend__categories');
  for (const item of options.items) {
    const row = el('div', 'legend__category');
    const swatch = el('span', 'legend__swatch legend__swatch--round');
    swatch.style.background = item.color;
    row.append(swatch, el('span', 'legend__label', item.label));
    list.append(row);
  }
  root.append(list);
  if (options.note) root.append(el('p', 'legend__note', options.note));
  return root;
}

export interface SizeLegendOptions {
  title: string;
  items: Array<{ label: string; radius: number }>;
  note?: string;
}

export function createSizeLegend(options: SizeLegendOptions): HTMLElement {
  const root = el('div', 'legend');
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', options.title);
  root.append(el('p', 'legend__title', options.title));
  const list = el('div', 'legend__sizes');
  const maxRadius = Math.max(...options.items.map((item) => item.radius), 1);
  for (const item of options.items) {
    const row = el('div', 'legend__size');
    const circle = svgEl('svg', {
      width: 42,
      height: 42,
      viewBox: '0 0 42 42',
      'aria-hidden': 'true',
    });
    circle.append(
      svgEl('circle', {
        cx: 21,
        cy: 21,
        r: (item.radius / maxRadius) * 15,
        fill: 'none',
        stroke: '#181611',
        'stroke-width': 1.25,
      }),
    );
    row.append(circle, el('span', 'legend__label', item.label));
    list.append(row);
  }
  root.append(list);
  if (options.note) root.append(el('p', 'legend__note', options.note));
  return root;
}

export interface BivariateLegendOptions {
  title: string;
  xLabel: string;
  yLabel: string;
  colors: string[];
  xTicks: [string, string];
  yTicks: [string, string];
  note?: string;
}

export function createBivariateLegend(options: BivariateLegendOptions): HTMLElement {
  const root = el('div', 'legend legend--bivariate');
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', options.title);
  root.append(el('p', 'legend__title', options.title));

  const layout = el('div', 'bivariate');
  const yAxis = el('div', 'bivariate__y');
  yAxis.append(
    el('span', 'bivariate__axis-label', options.yLabel),
    el('span', 'bivariate__tick', options.yTicks[1]),
    el('span', 'bivariate__tick', options.yTicks[0]),
  );
  const grid = el('div', 'bivariate__grid');
  for (let row = 2; row >= 0; row -= 1) {
    for (let col = 0; col < 3; col += 1) {
      const cell = el('span', 'bivariate__cell');
      cell.style.background = options.colors[row * 3 + col];
      cell.title = `${options.xLabel}: ${col + 1}/3 · ${options.yLabel}: ${row + 1}/3`;
      grid.append(cell);
    }
  }
  const xAxis = el('div', 'bivariate__x');
  xAxis.append(
    el('span', 'bivariate__tick', options.xTicks[0]),
    el('span', 'bivariate__axis-label', options.xLabel),
    el('span', 'bivariate__tick', options.xTicks[1]),
  );

  layout.append(yAxis, grid, xAxis);
  root.append(layout);
  if (options.note) root.append(el('p', 'legend__note', options.note));
  return root;
}

export function legendWithToggle(
  legend: HTMLElement,
  label = 'Legend',
  startCollapsed = false,
): HTMLElement {
  const root = el('div', 'legend-toggle');
  const toggle = el('button', 'legend-toggle__button');
  toggle.type = 'button';
  toggle.textContent = label;
  toggle.setAttribute('aria-expanded', String(!startCollapsed));
  const body = el('div', 'legend-toggle__body');
  body.append(legend);
  body.hidden = startCollapsed;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'false';
    toggle.setAttribute('aria-expanded', String(!expanded));
    body.hidden = expanded;
  });
  root.append(toggle, body);
  return root;
}
