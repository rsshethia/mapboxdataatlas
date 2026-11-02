import { cellToBoundary, latLngToCell } from 'h3-js';
import type { Feature, Polygon } from 'geojson';

export interface HexBin<T> {
  cell: string;
  count: number;
  total: number;
  center: [number, number];
  items: T[];
}

/**
 * Bin points into H3 cells. `locate` returns [lng, lat]; weights are summed.
 */
export function binPoints<T>(
  points: readonly T[],
  locate: (point: T) => [number, number],
  weight: (point: T) => number,
  resolution: number,
): HexBin<T>[] {
  const bins = new Map<string, HexBin<T>>();
  for (const point of points) {
    const [lng, lat] = locate(point);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    const cell = latLngToCell(lat, lng, resolution);
    let bin = bins.get(cell);
    if (!bin) {
      const ring = cellToBoundary(cell);
      let sumLng = 0;
      let sumLat = 0;
      for (const [ringLat, ringLng] of ring) {
        sumLat += ringLat;
        sumLng += ringLng;
      }
      bin = {
        cell,
        count: 0,
        total: 0,
        center: [sumLng / ring.length, sumLat / ring.length],
        items: [],
      };
      bins.set(cell, bin);
    }
    bin.count += 1;
    bin.total += weight(point);
    bin.items.push(point);
  }
  return [...bins.values()];
}

export function hexPolygon(cell: string): Feature<Polygon, Record<string, unknown>> {
  const ring = cellToBoundary(cell).map(([lat, lng]) => [lng, lat] as [number, number]);
  if (ring.length) ring.push(ring[0]);
  return {
    type: 'Feature',
    properties: { cell },
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}

export function hexCollection<T>(
  bins: readonly HexBin<T>[],
  properties: (bin: HexBin<T>) => Record<string, unknown> = () => ({}),
): GeoJSON.FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: bins.map((bin) => {
      const polygon = hexPolygon(bin.cell);
      polygon.properties = {
        cell: bin.cell,
        count: bin.count,
        total: bin.total,
        center: bin.center,
        ...properties(bin),
      };
      return polygon;
    }),
  };
}
