export const CATEGORIES = [
  { id: 'thematic', label: 'Thematic maps', short: 'Thematic' },
  { id: 'flows', label: 'Flows & time', short: 'Flows' },
  { id: 'three-d', label: '3D & terrain', short: '3D' },
  { id: 'linked', label: 'Linked views', short: 'Linked' },
  { id: 'apis', label: 'APIs & export', short: 'APIs' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export type Difficulty = 'intro' | 'intermediate' | 'advanced';

export type ThumbKind =
  | 'choropleth'
  | 'bivariate'
  | 'bubbles'
  | 'hex'
  | 'heat'
  | 'clusters'
  | 'extrusion'
  | 'arcs'
  | 'particles'
  | 'route'
  | 'timeline'
  | 'scatter'
  | 'bars'
  | 'multiples'
  | 'terrain'
  | 'globe'
  | 'profile'
  | 'isochrone'
  | 'search'
  | 'directions'
  | 'export'
  | 'compare'
  | 'live';

export interface DataSource {
  name: string;
  description?: string;
  source: string;
  license: string;
  url?: string;
  retrieved?: string;
  rows?: number;
  fields?: string[];
}

export interface ExampleMeta {
  id: string;
  order: number;
  title: string;
  category: CategoryId;
  blurb: string;
  /** The human story behind the data: 1–3 sentences, plain words, no jargon. */
  story: string;
  description: string[];
  interactions?: string[];
  techniques: string[];
  apis: string[];
  data: DataSource[];
  difficulty: Difficulty;
  thumb: ThumbKind;
  tags?: string[];
  /** True for examples that call a Mapbox web API at runtime. */
  live?: boolean;
}

export interface ExampleContext {
  container: HTMLElement;
  token: string;
  reducedMotion: boolean;
  capture: boolean;
  signal: AbortSignal;
  ready: () => void;
  onCleanup: (cleanup: () => void) => void;
}

export type ExampleMount = (
  ctx: ExampleContext,
) => void | (() => void) | Promise<void | (() => void)>;

export interface RegistryEntry {
  meta: ExampleMeta;
  load: () => Promise<{ mount: ExampleMount }>;
  source: () => Promise<string>;
}

export const CATEGORY_LABELS: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label]),
) as Record<CategoryId, string>;

export const CATEGORY_SHORT: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.short]),
) as Record<CategoryId, string>;
