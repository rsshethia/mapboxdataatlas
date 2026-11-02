import { el } from './dom';

export interface MapStatus {
  remove: () => void;
}

function existing(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(':scope > .map-status');
}

export function showMapLoading(container: HTMLElement, label = 'Loading map…'): MapStatus {
  existing(container)?.remove();
  const status = el('div', 'map-status map-status--loading');
  status.innerHTML = `<span class="map-status__spinner" aria-hidden="true"></span><span>${label}</span>`;
  container.append(status);
  return { remove: () => status.remove() };
}

export function showMapError(
  container: HTMLElement,
  title: string,
  message: string,
  action?: { label: string; onClick: () => void },
): MapStatus {
  existing(container)?.remove();
  const status = el('div', 'map-status map-status--error');
  const panel = el('div', 'map-status__panel');
  panel.innerHTML = `<p class="eyebrow">Map unavailable</p><h3>${title}</h3><p>${message}</p>`;
  if (action) {
    const button = el('button', 'button button--small');
    button.type = 'button';
    button.textContent = action.label;
    button.addEventListener('click', action.onClick);
    panel.append(button);
  }
  status.append(panel);
  container.append(status);
  return { remove: () => status.remove() };
}

export function showAuthError(container: HTMLElement, status?: number): MapStatus {
  const code = status ? ` (HTTP ${status})` : '';
  return showMapError(
    container,
    'The map token was rejected',
    `Mapbox could not authorize this map${code}. Check that the token is a public “pk.” token and that your account allows this URL.`,
    {
      label: 'Update token',
      onClick: () => window.dispatchEvent(new CustomEvent('open-token-dialog')),
    },
  );
}

export function markReady(container: HTMLElement): void {
  container.dataset.exampleReady = 'true';
  container.dispatchEvent(new CustomEvent('example-ready', { bubbles: true }));
}

export function showInlineError(container: HTMLElement, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  showMapError(container, 'This example could not start', message, {
    label: 'Reload example',
    onClick: () => window.location.reload(),
  });
}
