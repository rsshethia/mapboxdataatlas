import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';
import { loadJSON } from './data';

export async function loadTopology(path: string): Promise<Topology> {
  return loadJSON<Topology>(path);
}

export function topologyFeatures(
  topology: Topology,
  objectName: string,
): FeatureCollection {
  const object = topology.objects[objectName];
  if (!object) throw new Error(`Topology object "${objectName}" not found.`);
  return feature(topology, object) as unknown as FeatureCollection;
}

export function joinById(
  collection: FeatureCollection,
  table: Record<string, Record<string, unknown>>,
  key: (feature: Feature<Geometry, Record<string, unknown>>) => string = (item) =>
    String(item.id ?? ''),
): FeatureCollection {
  for (const item of collection.features) {
    const id = key(item as Feature<Geometry, Record<string, unknown>>);
    const values = table[id];
    if (values) {
      item.properties = Object.assign(item.properties ?? {}, values);
    }
  }
  return collection;
}

export function featureId(item: Feature): string {
  return String(item.id ?? (item.properties as { id?: string } | null)?.id ?? '');
}
