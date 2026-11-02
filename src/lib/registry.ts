import type { ExampleMeta, ExampleMount, RegistryEntry } from './types';

const metaModules = import.meta.glob<{ meta: ExampleMeta }>('../examples/*/meta.ts', {
  eager: true,
});

const mountModules = import.meta.glob<{ mount: ExampleMount }>('../examples/*/index.ts');

const sourceModules = import.meta.glob<string>('../examples/*/index.ts', {
  query: '?raw',
  import: 'default',
});

function exampleId(path: string): string | null {
  const match = path.match(/examples\/([^/]+)\//);
  return match?.[1] ?? null;
}

const entries: RegistryEntry[] = Object.entries(metaModules)
  .map(([path, module]) => {
    const id = exampleId(path);
    if (!id) return null;
    const mountPath = `../examples/${id}/index.ts`;
    const load = mountModules[mountPath];
    const source = sourceModules[mountPath];
    if (!load || !source) {
      console.warn(`Example "${id}" is missing index.ts or its source loader.`);
      return null;
    }
    return {
      meta: { ...module.meta, id },
      load,
      source,
    } satisfies RegistryEntry;
  })
  .filter((entry): entry is RegistryEntry => entry !== null)
  .sort((a, b) => a.meta.order - b.meta.order || a.meta.title.localeCompare(b.meta.title));

export const examples: readonly RegistryEntry[] = entries;

export function getExample(id: string): RegistryEntry | undefined {
  return examples.find((entry) => entry.meta.id === id);
}

export function getAdjacent(id: string): {
  previous?: RegistryEntry;
  next?: RegistryEntry;
} {
  const index = examples.findIndex((entry) => entry.meta.id === id);
  if (index < 0) return {};
  return {
    previous: index > 0 ? examples[index - 1] : undefined,
    next: index < examples.length - 1 ? examples[index + 1] : undefined,
  };
}

export function exampleIds(): string[] {
  return examples.map((entry) => entry.meta.id);
}
