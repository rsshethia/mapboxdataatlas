import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import { copyText, el, escapeHtml, prefersReducedMotion } from '../lib/dom';
import { getAdjacent, getExample } from '../lib/registry';
import { legendWithToggle } from '../lib/legend';
import { getToken } from '../lib/token';
import { showInlineError, markReady } from '../lib/status';
import { CATEGORY_LABELS, type DataSource, type RegistryEntry } from '../lib/types';
import { renderNotFound } from './not-found';

function dataSourceItem(source: DataSource): HTMLElement {
  const item = el('li', 'source');
  item.innerHTML = `
    <h4>${escapeHtml(source.name)}</h4>
    ${source.description ? `<p>${escapeHtml(source.description)}</p>` : ''}
    <dl class="source__facts">
      <dt>Source</dt><dd>${escapeHtml(source.source)}</dd>
      <dt>License</dt><dd>${escapeHtml(source.license)}</dd>
      ${source.retrieved ? `<dt>Retrieved</dt><dd>${escapeHtml(source.retrieved)}</dd>` : ''}
      ${source.rows ? `<dt>Rows</dt><dd>${source.rows.toLocaleString('en-US')}</dd>` : ''}
      ${source.fields?.length ? `<dt>Fields</dt><dd>${source.fields.map(escapeHtml).join(', ')}</dd>` : ''}
    </dl>
  `;
  if (source.url) {
    const link = el('a', 'source__link', 'Open source ↗');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noreferrer noopener';
    item.append(link);
  }
  return item;
}

function tokenGate(): HTMLElement {
  const root = el('div', 'token-gate');
  root.innerHTML = `
    <p class="eyebrow">Mapbox token required</p>
    <h3>Add a public token to render this map.</h3>
    <p>
      Every example is a live Mapbox GL JS map. Use a public token that starts with
      <code>pk.</code>; it stays in this browser’s local storage.
    </p>
  `;
  const action = el('button', 'button button--dark');
  action.type = 'button';
  action.textContent = 'Add token';
  action.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-token-dialog'));
  });
  root.append(action);
  return root;
}

async function codeSection(entry: RegistryEntry): Promise<HTMLElement> {
  const section = el('section', 'code-section');
  const heading = el('div', 'section-heading');
  heading.innerHTML = `
    <div>
      <p class="eyebrow">Source</p>
      <h2>The whole example</h2>
    </div>
    <p class="section-heading__note">Shared helpers live in <code>src/lib</code>.</p>
  `;
  const copy = el('button', 'button button--small');
  copy.type = 'button';
  copy.textContent = 'Copy code';
  heading.append(copy);

  const pre = el('pre', 'code-block');
  const code = el('code', 'language-typescript');
  pre.append(code);

  let raw = '';
  try {
    raw = await entry.source();
    code.innerHTML = Prism.highlight(raw, Prism.languages.typescript, 'typescript');
  } catch {
    code.textContent = 'Source unavailable.';
  }

  copy.addEventListener('click', async () => {
    const copied = await copyText(raw);
    copy.textContent = copied ? 'Copied' : 'Copy failed';
    window.setTimeout(() => {
      copy.textContent = 'Copy code';
    }, 1600);
  });

  section.append(heading, pre);
  return section;
}

const LEGEND_POSITION_MODIFIERS = [
  'legend--top-left',
  'legend--top-right',
  'legend--bottom-right',
];

/**
 * On narrow viewports the overlay legends crowd small maps, so each legend is
 * wrapped in its existing toggle and starts collapsed. Position modifiers move
 * to the wrapper so placement is unchanged.
 */
function collapseLegendsOnNarrow(stage: HTMLElement): void {
  if (!window.matchMedia('(max-width: 760px)').matches) return;
  for (const node of stage.querySelectorAll(':scope > .legend')) {
    const legend = node as HTMLElement;
    if (legend.parentElement !== stage) continue;
    const next = legend.nextSibling;
    const wrapped = legendWithToggle(legend, legend.getAttribute('aria-label') ?? 'Legend', true);
    for (const modifier of LEGEND_POSITION_MODIFIERS) {
      if (legend.classList.contains(modifier)) wrapped.classList.add(modifier);
    }
    stage.insertBefore(wrapped, next);
  }
}

export async function renderExample(
  view: HTMLElement,
  id: string,
  signal: AbortSignal,
): Promise<() => void> {
  const entry = getExample(id);
  if (!entry) {
    renderNotFound(view);
    return () => {};
  }

  const { meta } = entry;
  const article = el('article', 'example-page');
  const nav = el('nav', 'breadcrumb');
  nav.innerHTML = `<a href="#/">Gallery</a><span>/</span><span>${escapeHtml(
    CATEGORY_LABELS[meta.category],
  )}</span>`;
  article.append(nav);

  const header = el('header', 'example-header');
  header.innerHTML = `
    <p class="eyebrow">${String(meta.order).padStart(2, '0')} · ${escapeHtml(
      CATEGORY_LABELS[meta.category],
    )} · ${escapeHtml(meta.difficulty)}${meta.live ? ' · live API' : ''}</p>
    <h1>${escapeHtml(meta.title)}</h1>
    <p class="example-header__lede">${escapeHtml(meta.blurb)}</p>
    <p class="example-story"><span class="example-story__label">The story</span>${escapeHtml(meta.story)}</p>
    <div class="chips">
      ${meta.live ? '<span class="chip chip--live">Live API</span>' : ''}
      ${meta.techniques.map((technique) => `<span class="chip">${escapeHtml(technique)}</span>`).join('')}
    </div>
  `;
  article.append(header);

  const layout = el('div', 'example-layout');
  const main = el('div', 'example-main');
  const stage = el('div', 'example-map');
  stage.dataset.exampleId = meta.id;
  stage.setAttribute('aria-label', `Interactive map for ${meta.title}`);
  main.append(stage);
  const caption = el('p', 'map-caption');
  caption.innerHTML =
    'Drag to pan · scroll to zoom · hover or tap features for details. Data source and license are listed beside the map.';
  main.append(caption);

  const side = el('aside', 'example-side');
  const description = el('section', 'side-section');
  description.innerHTML = `
    <h2>About this example</h2>
    ${meta.description.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
  `;
  side.append(description);

  if (meta.interactions?.length) {
    const interactions = el('section', 'side-section');
    interactions.innerHTML = `
      <h2>Try this</h2>
      <ul class="try-list">${meta.interactions
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join('')}</ul>
    `;
    side.append(interactions);
  }

  const apis = el('section', 'side-section');
  apis.innerHTML = `
    <h2>Mapbox APIs</h2>
    <div class="chips">${meta.apis
      .map((api) => `<span class="chip chip--muted">${escapeHtml(api)}</span>`)
      .join('')}</div>
  `;
  side.append(apis);

  const data = el('section', 'side-section');
  data.innerHTML = `<h2>Data & sources</h2>`;
  const sourceList = el('ul', 'source-list');
  for (const source of meta.data) sourceList.append(dataSourceItem(source));
  data.append(sourceList);
  side.append(data);

  layout.append(main, side);
  article.append(layout);

  if (signal.aborted) return () => {};
  view.append(article);

  const code = await codeSection(entry);
  if (signal.aborted) return () => {};
  article.append(code);

  const adjacent = getAdjacent(meta.id);
  const pager = el('nav', 'pager');
  pager.setAttribute('aria-label', 'Example navigation');
  if (adjacent.previous) {
    pager.append(
      Object.assign(el('a', 'pager__link'), {
        href: `#/e/${adjacent.previous.meta.id}`,
        innerHTML: `<span>← Previous</span><strong>${escapeHtml(
          adjacent.previous.meta.title,
        )}</strong>`,
      }),
    );
  } else {
    pager.append(el('span'));
  }
  if (adjacent.next) {
    pager.append(
      Object.assign(el('a', 'pager__link pager__link--next'), {
        href: `#/e/${adjacent.next.meta.id}`,
        innerHTML: `<span>Next →</span><strong>${escapeHtml(adjacent.next.meta.title)}</strong>`,
      }),
    );
  }
  article.append(pager);

  view.append(article);

  if (!getToken()) {
    stage.append(tokenGate());
    return () => {};
  }

  const cleanups: Array<() => void> = [];
  let mountedCleanup: (() => void) | undefined;
  let readyTimer = 0;
  const ready = () => {
    window.clearTimeout(readyTimer);
    if (!signal.aborted) markReady(stage);
  };

  const context = {
    container: stage,
    token: getToken(),
    reducedMotion: prefersReducedMotion(),
    capture: new URLSearchParams(window.location.search).get('capture') === '1',
    signal,
    ready,
    onCleanup: (cleanup: () => void) => {
      cleanups.push(cleanup);
    },
  };

  try {
    const module = await entry.load();
    if (signal.aborted) return () => {};
    const result = await module.mount(context);
    mountedCleanup = typeof result === 'function' ? result : undefined;
    collapseLegendsOnNarrow(stage);
  } catch (error) {
    if (!signal.aborted) showInlineError(stage, error);
  }

  readyTimer = window.setTimeout(ready, 30000);

  return () => {
    window.clearTimeout(readyTimer);
    mountedCleanup?.();
    for (const cleanup of cleanups.reverse()) {
      try {
        cleanup();
      } catch (error) {
        console.warn('Example cleanup failed', error);
      }
    }
  };
}
