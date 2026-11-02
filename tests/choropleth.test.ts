import { describe, expect, it } from 'vitest';
import { classify, makeBreaks, rangeLabels, stepExpression } from '../src/lib/choropleth';

const COLORS = ['#a', '#b', '#c', '#d', '#e'];

describe('makeBreaks', () => {
  it('returns one more break than colors, sorted from min to max', () => {
    const values = [3, 1, 9, 4, 7, 2, 8, 5, 6];
    for (const method of ['quantile', 'equal', 'jenks'] as const) {
      const result = makeBreaks(values, COLORS, method);
      expect(result.breaks).toHaveLength(COLORS.length + 1);
      expect(result.breaks[0]).toBe(1);
      expect(result.breaks[result.breaks.length - 1]).toBe(9);
      for (let i = 1; i < result.breaks.length; i += 1) {
        expect(result.breaks[i]).toBeGreaterThan(result.breaks[i - 1]);
      }
    }
  });

  it('handles empty input without NaN breaks', () => {
    const result = makeBreaks([], COLORS, 'quantile');
    expect(result.breaks).toHaveLength(COLORS.length + 1);
    for (const value of result.breaks) expect(Number.isFinite(value)).toBe(true);
  });

  it('handles constant input by widening the domain', () => {
    const result = makeBreaks([5, 5, 5], COLORS, 'quantile');
    expect(result.breaks[result.breaks.length - 1]).toBeGreaterThan(result.breaks[0]);
  });
});

describe('stepExpression', () => {
  it('builds a step expression keyed on the property', () => {
    const breaks = [0, 10, 20, 30];
    const expression = stepExpression('density', breaks, ['#a', '#b', '#c']);
    expect(expression[0]).toBe('step');
    expect(expression[1]).toEqual(['get', 'density']);
    expect(expression[2]).toBe('#a');
    // Interior breaks pair with the following color.
    expect(expression.slice(3)).toEqual([10, '#b', 20, '#c']);
  });
});

describe('rangeLabels', () => {
  it('labels each class interval', () => {
    expect(rangeLabels([0, 10, 20], (value) => String(value))).toEqual(['0 – 10', '10 – 20']);
  });
});

describe('classify', () => {
  it('places values in the first break they fall below', () => {
    const breaks = [0, 10, 20, 30];
    expect(classify(5, breaks)).toBe(0);
    expect(classify(10, breaks)).toBe(1);
    expect(classify(29.9, breaks)).toBe(2);
    expect(classify(100, breaks)).toBe(2);
    expect(classify(Number.NaN, breaks)).toBe(0);
  });
});
