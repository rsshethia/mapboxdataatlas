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
        <a
          class="site-nav__github"
          href="https://github.com/rsshethia/mapboxdataatlas"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository (opens in a new tab)"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </a>
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
