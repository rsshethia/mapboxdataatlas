export type LngLat = [number, number];

const radians = Math.PI / 180;
const degrees = 180 / Math.PI;

function toRadians(value: number): number {
  return value * radians;
}

function toDegrees(value: number): number {
  return value * degrees;
}

/** Spherical linear interpolation between two lon/lat points. */
export function greatCircle(a: LngLat, b: LngLat, steps = 64): LngLat[] {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const lambda1 = toRadians(lon1);
  const lambda2 = toRadians(lon2);

  const delta =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((phi2 - phi1) / 2) ** 2 +
          Math.cos(phi1) * Math.cos(phi2) * Math.sin((lambda2 - lambda1) / 2) ** 2,
      ),
    );

  if (!Number.isFinite(delta) || delta === 0) return [a, b];

  const points: LngLat[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const ac = Math.sin((1 - t) * delta) / Math.sin(delta);
    const bc = Math.sin(t * delta) / Math.sin(delta);
    const x = ac * Math.cos(phi1) * Math.cos(lambda1) + bc * Math.cos(phi2) * Math.cos(lambda2);
    const y = ac * Math.cos(phi1) * Math.sin(lambda1) + bc * Math.cos(phi2) * Math.sin(lambda2);
    const z = ac * Math.sin(phi1) + bc * Math.sin(phi2);
    points.push([
      toDegrees(Math.atan2(y, x)),
      toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y))),
    ]);
  }
  return points;
}

export function pointAlongGreatCircle(a: LngLat, b: LngLat, t: number): LngLat {
  const steps = 64;
  const points = greatCircle(a, b, steps);
  const index = Math.min(steps, Math.max(0, Math.round(t * steps)));
  return points[index] ?? a;
}

export function splitAtAntimeridian(coords: LngLat[]): LngLat[][] {
  if (coords.length < 2) return [coords];
  const segments: LngLat[][] = [];
  let current: LngLat[] = [coords[0]];

  for (let index = 1; index < coords.length; index += 1) {
    const previous = coords[index - 1];
    const next = coords[index];
    const jump = next[0] - previous[0];
    if (Math.abs(jump) > 180) {
      const direction = jump > 0 ? -1 : 1;
      const boundary = direction === 1 ? 180 : -180;
      const ratio = (boundary - previous[0]) / jump;
      const crossingLat = previous[1] + (next[1] - previous[1]) * ratio;
      current.push([boundary, crossingLat]);
      segments.push(current);
      current = [[-boundary, crossingLat], next];
    } else {
      current.push(next);
    }
  }
  segments.push(current);
  return segments.filter((segment) => segment.length > 1);
}

export function arcFeature(
  a: LngLat,
  b: LngLat,
  properties: Record<string, unknown> = {},
  steps = 64,
): GeoJSON.Feature<GeoJSON.LineString> {
  const coords = greatCircle(a, b, steps);
  return {
    type: 'Feature',
    properties,
    geometry: { type: 'LineString', coordinates: coords },
  };
}

/**
 * Great-circle arc split at the antimeridian so Mapbox does not draw a line
 * across the entire world.
 */
export function greatCircleFeature(
  a: LngLat,
  b: LngLat,
  properties: Record<string, unknown> = {},
  steps = 72,
): GeoJSON.Feature<GeoJSON.MultiLineString> {
  const segments = splitAtAntimeridian(greatCircle(a, b, steps));
  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'MultiLineString',
      coordinates: segments.length ? segments : [greatCircle(a, b, steps)],
    },
  };
}

export function bboxOfCoords(coords: LngLat[]): [number, number, number, number] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }
  return [minLng, minLat, maxLng, maxLat];
}

export function unwrapLongitude(lng: number): number {
  let value = lng;
  while (value > 180) value -= 360;
  while (value < -180) value += 360;
  return value;
}

export function haversineKm(a: LngLat, b: LngLat): number {
  const radius = 6371;
  const dLat = toRadians(b[1] - a[1]);
  const dLon = toRadians(b[0] - a[0]);
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}
