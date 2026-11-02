const cache = new Map<string, Promise<unknown>>();

function dataUrl(path: string): string {
  const base = import.meta.env.BASE_URL || './';
  return new URL(`${base}data/${path}`, document.baseURI).toString();
}

async function fetchResource(path: string): Promise<Response> {
  const url = dataUrl(path);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${path} (HTTP ${response.status}).`);
  }
  return response;
}

export function loadJSON<T>(path: string): Promise<T> {
  const existing = cache.get(path) as Promise<T> | undefined;
  if (existing) return existing;
  const request = fetchResource(path).then((response) => response.json() as Promise<T>);
  cache.set(path, request);
  return request;
}

export function loadText(path: string): Promise<string> {
  const key = `text:${path}`;
  const existing = cache.get(key) as Promise<string> | undefined;
  if (existing) return existing;
  const request = fetchResource(path).then((response) => response.text());
  cache.set(key, request);
  return request;
}

export function clearDataCache(): void {
  cache.clear();
}
