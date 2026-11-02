export type Route =
  | { name: 'gallery' }
  | { name: 'example'; id: string }
  | { name: 'sources' }
  | { name: 'how-it-works' }
  | { name: 'notfound' };

export function parseRoute(hash = window.location.hash): Route {
  const value = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (!value) return { name: 'gallery' };
  if (value === 'sources') return { name: 'sources' };
  if (value === 'how-it-works') return { name: 'how-it-works' };
  if (value.startsWith('e/')) {
    const id = value.slice(2).split('/')[0]?.split('?')[0] ?? '';
    if (id) return { name: 'example', id };
  }
  return { name: 'notfound' };
}

export function navigate(path: string): void {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

export function startRouter(handler: (route: Route) => void): () => void {
  const onChange = () => handler(parseRoute());
  window.addEventListener('hashchange', onChange);
  onChange();
  return () => window.removeEventListener('hashchange', onChange);
}
