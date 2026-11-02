import { extent, quantileSorted } from 'd3';
import { ckmeans } from 'simple-statistics';
import type { ExpressionSpecification } from 'mapbox-gl';
import { formatCompact } from './format';

export type BreakMethod = 'quantile' | 'equal' | 'jenks';

export interface ClassBreaks {
  method: BreakMethod;
  values: number[];
  breaks: number[];
  colors: string[];
  domain: [number, number];
}

function safeExtent(values: number[]): [number, number] {
  const [min, max] = extent(values);
  if (min == null || max == null) return [0, 1];
  if (min === max) return [min, min + 1];
  return [min, max];
}

export function makeBreaks(
  values: number[],
  colors: string[],
  method: BreakMethod = 'quantile',
): ClassBreaks {
  const clean = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  const [min, max] = safeExtent(clean);
  const count = colors.length;
  let breaks: number[];

  if (!clean.length) {
    breaks = Array.from({ length: count + 1 }, (_, index) => min + ((max - min) * index) / count);
  } else if (method === 'equal') {
    breaks = Array.from({ length: count + 1 }, (_, index) => min + ((max - min) * index) / count);
  } else if (method === 'jenks') {
    const unique = Array.from(new Set(clean));
    const clusters = ckmeans(unique.length >= count ? clean : unique, Math.min(count, unique.length));
    const upper = clusters.map((cluster) => cluster[cluster.length - 1] ?? min);
    breaks = [min, ...upper];
    while (breaks.length < count + 1) breaks.push(max);
    breaks = breaks.slice(0, count + 1);
    breaks[breaks.length - 1] = max;
  } else {
    breaks = [min];
    for (let index = 1; index < count; index += 1) {
      breaks.push(quantileSorted(clean, index / count) ?? min);
    }
    breaks.push(max);
  }

  for (let index = 1; index < breaks.length; index += 1) {
    if (breaks[index] <= breaks[index - 1]) {
      breaks[index] = breaks[index - 1] + (max - min) / count / 1000;
    }
  }

  return {
    method,
    values: clean,
    breaks,
    colors,
    domain: [min, max],
  };
}

export function rangeLabels(
  breaks: number[],
  formatter: (value: number) => string = formatCompact,
): string[] {
  const labels: string[] = [];
  for (let index = 0; index < breaks.length - 1; index += 1) {
    const lower = breaks[index];
    const upper = breaks[index + 1];
    labels.push(`${formatter(lower)} – ${formatter(upper)}`);
  }
  return labels;
}

export function stepExpression(
  property: string,
  breaks: number[],
  colors: string[],
): ExpressionSpecification {
  const stops: Array<number | string> = [];
  for (let index = 1; index < breaks.length - 1; index += 1) {
    stops.push(breaks[index], colors[index]);
  }
  return ['step', ['get', property], colors[0], ...stops] as ExpressionSpecification;
}

export function interpolateExpression(
  property: string,
  domain: [number, number],
  colors: string[],
): ExpressionSpecification {
  const stops: Array<number | string> = [];
  for (let index = 0; index < colors.length; index += 1) {
    const t = colors.length === 1 ? 0 : index / (colors.length - 1);
    stops.push(domain[0] + (domain[1] - domain[0]) * t, colors[index]);
  }
  return ['interpolate', ['linear'], ['get', property], ...stops] as ExpressionSpecification;
}

export function classify(
  value: number,
  breaks: number[],
  maxIndex = breaks.length - 2,
): number {
  if (!Number.isFinite(value)) return 0;
  for (let index = 0; index < breaks.length - 1; index += 1) {
    if (value < breaks[index + 1]) return Math.min(index, maxIndex);
  }
  return Math.max(0, Math.min(maxIndex, breaks.length - 2));
}

export function bivariateClass(
  x: number,
  y: number,
  xBreaks: number[],
  yBreaks: number[],
): number {
  const xClass = classify(x, xBreaks, 2);
  const yClass = classify(y, yBreaks, 2);
  return yClass * 3 + xClass;
}

export function bivariateExpression(
  property: string,
  colors: string[],
): ExpressionSpecification {
  const match: unknown[] = ['match', ['get', property]];
  colors.forEach((color, index) => match.push(index, color));
  match.push(colors[colors.length - 1]);
  return match as ExpressionSpecification;
}

export function bivariateLegendLabels(
  breaks: number[],
  formatter: (value: number) => string = formatCompact,
): [string, string] {
  return [formatter(breaks[1]), formatter(breaks[2])];
}
