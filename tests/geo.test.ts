import { describe, expect, it } from 'vitest';
import {
  bboxOfCoords,
  greatCircle,
  haversineKm,
  splitAtAntimeridian,
  unwrapLongitude,
} from '../src/lib/geo';

describe('greatCircle', () => {
  it('starts and ends at the given points', () => {
    const points = greatCircle([-122, 37], [139, 35], 16);
    expect(points).toHaveLength(17);
    expect(points[0]?.[0]).toBeCloseTo(-122, 6);
    expect(points[0]?.[1]).toBeCloseTo(37, 6);
    expect(points[16]?.[0]).toBeCloseTo(139, 6);
    expect(points[16]?.[1]).toBeCloseTo(35, 6);
  });

  it('degenerates gracefully for identical points', () => {
    expect(greatCircle([0, 0], [0, 0])).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });
});

describe('splitAtAntimeridian', () => {
  it('splits a Pacific crossing into two segments', () => {
    const segments = splitAtAntimeridian([
      [170, 10],
      [-170, 12],
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0]?.[segments[0].length - 1]?.[0]).toBe(180);
    expect(segments[1]?.[0]?.[0]).toBe(-180);
  });

  it('leaves ordinary lines untouched', () => {
    const line: [number, number][] = [
      [-10, 0],
      [10, 5],
    ];
    expect(splitAtAntimeridian(line)).toEqual([line]);
  });
});

describe('haversineKm', () => {
  it('approximates a known intercontinental distance', () => {
    // New York to London is roughly 5,570 km.
    const distance = haversineKm([-74.006, 40.7128], [-0.1278, 51.5074]);
    expect(distance).toBeGreaterThan(5400);
    expect(distance).toBeLessThan(5750);
  });

  it('is zero for identical points', () => {
    expect(haversineKm([0, 0], [0, 0])).toBe(0);
  });
});

describe('bboxOfCoords', () => {
  it('returns [minLng, minLat, maxLng, maxLat]', () => {
    expect(
      bboxOfCoords([
        [1, 2],
        [-3, 9],
        [5, -1],
      ]),
    ).toEqual([-3, -1, 5, 9]);
  });
});

describe('unwrapLongitude', () => {
  it('wraps values into [-180, 180]', () => {
    expect(unwrapLongitude(190)).toBe(-170);
    expect(unwrapLongitude(-190)).toBe(170);
    expect(unwrapLongitude(45)).toBe(45);
  });
});
