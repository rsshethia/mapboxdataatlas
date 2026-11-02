import '@fontsource-variable/fraunces/wght.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/inter';
import './styles/global.css';

import { getExample } from './lib/registry';
import { parseRoute, startRouter } from './lib/router';
import { getTokenSource } from './lib/token';
import { renderExample } from './gallery/detail';
import { renderGallery } from './gallery/gallery';
import { renderHowItWorks } from './gallery/how-it-works';
import { renderNotFound } from './gallery/not-found';
import { renderSources } from './gallery/sources';
import { openTokenDialog } from './gallery/token-dialog';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app root.');

app.innerHTML = `
  <a class="skip-link" href="#view">Skip to content</a>
  <div class="site">
    <header class="site-header">
      <a class="wordmark" href="#/" aria-label="Mapbox Data Atlas home">
        <span class="wordmark__mark" aria-hidden="true">M</span>
        <span class="wordmark__text">Mapbox Data Atlas</span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        <a href="#/">Gallery</a>
        <a href="#/how-it-works">How it works</a>
        <a href="#/sources">Data &amp; sources</a>
      </nav>
      <button class="token-status" type="button" aria-haspopup="dialog"></button>
    </header>
    <main id="view" class="view"></main>
    <footer class="site-footer">
      <p class="site-footer__line">
        <a class="wordmark" href="#/" aria-label="Mapbox Data Atlas home">
          <span class="wordmark__mark" aria-hidden="true">M</span>
          <span class="wordmark__text">Mapbox Data Atlas</span>
        </a>
        <span aria-hidden="true">·</span>
        <span>Maps © Mapbox © OpenStreetMap</span>
        <span aria-hidden="true">·</span>
        <a href="#/sources">Data &amp; sources</a>
        <span aria-hidden="true">·</span>
        <span>Not affiliated with or endorsed by Mapbox</span>
        <span aria-hidden="true">·</span>
        <span class="site-footer__credit">Made with human curiosity and AI in Bendigo, VIC</span>
      </p>
    </footer>
  </div>
`;

function queryRequired<T extends Element>(root: ParentNode, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`Missing required element: ${selector}`);
  return node;
}

const view = queryRequired<HTMLElement>(app, '#view');
const tokenButton = queryRequired<HTMLButtonElement>(app, '.token-status');

const updateTokenStatus = () => {
  const source = getTokenSource();
  if (source === 'none') {
    tokenButton.innerHTML = '<span class="token-dot" aria-hidden="true"></span><span>Add token</span>';
    tokenButton.title = 'Add a public Mapbox token';
  } else {
    tokenButton.innerHTML = '<span class="token-dot token-dot--on" aria-hidden="true"></span><span>Token ready</span>';
    tokenButton.title =
      source === 'env' ? 'Using the token from .env' : 'Using a token saved in this browser';
  }
};

tokenButton.addEventListener('click', () => openTokenDialog());

window.addEventListener('open-token-dialog', (event) => {
  const detail = (event as CustomEvent<string | undefined>).detail;
  openTokenDialog(detail);
});

window.addEventListener('token-updated', () => {
  void renderRoute();
});

let activeCleanup: (() => void) | undefined;
let activeAbort: AbortController | undefined;
let version = 0;

async function renderRoute(): Promise<void> {
  const current = ++version;
  activeCleanup?.();
  activeCleanup = undefined;
  activeAbort?.abort();
  activeAbort = undefined;

  document.documentElement.classList.toggle(
    'is-capturing',
    new URLSearchParams(window.location.search).get('capture') === '1',
  );

  view.replaceChildren();
  window.scrollTo(0, 0);
  updateTokenStatus();

  const route = parseRoute();

  if (route.name === 'gallery') {
    document.title = 'Mapbox Data Atlas';
    renderGallery(view);
    return;
  }

  if (route.name === 'sources') {
    document.title = 'Data & sources · Mapbox Data Atlas';
    renderSources(view);
    return;
  }

  if (route.name === 'how-it-works') {
    document.title = 'How it works · Mapbox Data Atlas';
    renderHowItWorks(view);
    return;
  }

  if (route.name === 'example') {
    const meta = getExample(route.id)?.meta;
    document.title = meta ? `${meta.title} · Mapbox Data Atlas` : 'Example not found';
    const controller = new AbortController();
    activeAbort = controller;
    const cleanup = await renderExample(view, route.id, controller.signal);
    if (current !== version || controller.signal.aborted) {
      cleanup();
      return;
    }
    activeCleanup = cleanup;
    return;
  }

  document.title = 'Page not found · Mapbox Data Atlas';
  renderNotFound(view);
}

startRouter(() => {
  void renderRoute();
});

export {};
