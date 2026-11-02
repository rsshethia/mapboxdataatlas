import { describe, expect, it } from 'vitest';
import { binPoints, hexCollection, hexPolygon } from '../src/lib/hex';

describe('binPoints', () => {
  const locate = (point: { lng: number; lat: number }): [number, number] => [
    point.lng,
    point.lat,
  ];

  it('bins nearby points into the same cell and sums weights', () => {
    const points = [
      { lng: -122.41, lat: 37.77, value: 2 },
      { lng: -122.42, lat: 37.78, value: 3 },
    ];
    const bins = binPoints(points, locate, (point) => point.value, 5);
    expect(bins).toHaveLength(1);
    expect(bins[0]?.count).toBe(2);
    expect(bins[0]?.total).toBe(5);
    expect(bins[0]?.items).toHaveLength(2);
  });

  it('separates distant points and skips invalid coordinates', () => {
    const points = [
      { lng: -122.41, lat: 37.77, value: 1 },
      { lng: 139.69, lat: 35.68, value: 1 },
      { lng: Number.NaN, lat: 0, value: 1 },
    ];
    const bins = binPoints(points, locate, (point) => point.value, 5);
    expect(bins).toHaveLength(2);
  });
});

describe('hexPolygon', () => {
  it('returns a closed hexagon ring', () => {
    const [point] = binPoints(
      [{ lng: -122.41, lat: 37.77, value: 1 }],
      (p) => [p.lng, p.lat],
      (p) => p.value,
      5,
    );
    const polygon = hexPolygon(point?.cell ?? '');
    expect(polygon.geometry.type).toBe('Polygon');
    const ring = polygon.geometry.coordinates[0] ?? [];
    expect(ring).toHaveLength(7);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });
});

describe('hexCollection', () => {
  it('carries per-bin properties onto features', () => {
    const bins = binPoints(
      [{ lng: -122.41, lat: 37.77, value: 4 }],
      (p) => [p.lng, p.lat],
      (p) => p.value,
      5,
    );
    const collection = hexCollection(bins, (bin) => ({ total: bin.total }));
    expect(collection.features).toHaveLength(1);
    expect(collection.features[0]?.properties?.total).toBe(4);
    expect(collection.features[0]?.properties?.cell).toBe(bins[0]?.cell);
  });
});
