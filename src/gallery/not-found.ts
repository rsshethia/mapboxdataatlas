import { el } from '../lib/dom';

export function renderNotFound(view: HTMLElement): void {
  const root = el('section', 'not-found');
  root.innerHTML = `
    <p class="eyebrow">404</p>
    <h1>This page is off the map.</h1>
    <p>The example you asked for does not exist. Browse the full gallery instead.</p>
    <a class="button button--dark" href="#/">Back to the gallery</a>
  `;
  view.append(root);
}
