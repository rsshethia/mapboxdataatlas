import { el } from '../lib/dom';
import { examples } from '../lib/registry';
import { CATEGORIES, type CategoryId, type RegistryEntry } from '../lib/types';
import { getToken } from '../lib/token';
import { thumbnailSvg } from './thumbnail';

type Filter = 'all' | CategoryId;

function formatCount(count: number): string {
  return count === 1 ? '1 example' : `${count} examples`;
}

function card(entry: RegistryEntry): HTMLElement {
  const { meta } = entry;
  const root = el('a', 'card');
  root.href = `#/e/${meta.id}`;
  root.dataset.id = meta.id;
  root.dataset.category = meta.category;

  const thumb = el('div', 'card__thumb');
  thumb.append(thumbnailSvg(meta));
  const image = el('img', 'card__image');
  image.alt = '';
  image.loading = 'lazy';
  image.hidden = true;
  image.addEventListener('error', () => {
    image.remove();
  });
  thumb.append(image);

  const number = String(meta.order).padStart(2, '0');
  const metaRow = el('div', 'card__meta');
  metaRow.append(
    el('span', 'card__number', number),
    el('span', 'card__category', CATEGORIES.find((item) => item.id === meta.category)?.short ?? ''),
  );
  if (meta.live) metaRow.append(el('span', 'card__live', 'Live'));
  metaRow.append(el('span', 'card__arrow', '↗'));

  const title = el('h3', 'card__title', meta.title);
  const blurb = el('p', 'card__blurb', meta.blurb);
  const techniques = el('div', 'card__techniques');
  for (const technique of meta.techniques.slice(0, 2)) {
    techniques.append(el('span', 'chip chip--muted', technique));
  }

  root.append(thumb, metaRow, title, blurb, techniques);
  return root;
}

function renderEmpty(container: HTMLElement): void {
  const root = el('div', 'empty-state');
  root.innerHTML = `
    <p class="eyebrow">No matches</p>
    <h3>Try a different search or category.</h3>
    <p>Search titles, techniques, and dataset names.</p>
  `;
  container.append(root);
}

function tokenBanner(): HTMLElement {
  const root = el('div', 'token-banner');
  root.innerHTML = `
    <div>
      <p class="eyebrow">One step before the maps</p>
      <p><strong>Add a public Mapbox token</strong> to open the live examples. The gallery itself works without one.</p>
    </div>
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

export function renderGallery(view: HTMLElement): void {
  const shell = el('div', 'gallery');
  const hero = el('section', 'hero');
  hero.innerHTML = `
    <p class="eyebrow">An independent field guide · Mapbox GL JS v3</p>
    <h1>Data visualization<br /><em>with Mapbox</em></h1>
    <p class="hero__lede">
      Thirty working examples of thematic maps, flows, terrain, linked views, and
      spatial APIs — built from real data and designed to be read, copied, and changed.
    </p>
    <div class="hero__stats">
      <span><strong>${examples.length}</strong> examples</span>
      <span><strong>5</strong> families</span>
      <span><strong>1</strong> map at a time</span>
    </div>
  `;
  shell.append(hero);

  if (!getToken()) shell.append(tokenBanner());

  const controls = el('section', 'filters');
  controls.setAttribute('aria-label', 'Filter examples');
  const chips = el('div', 'filters__chips');
  let activeFilter: Filter = 'all';
  let query = '';

  const counts = new Map<Filter, number>([['all', examples.length]]);
  for (const category of CATEGORIES) {
    counts.set(
      category.id,
      examples.filter((entry) => entry.meta.category === category.id).length,
    );
  }

  const chipButtons: Array<{ filter: Filter; node: HTMLButtonElement }> = [];
  const filterOptions: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'All' },
    ...CATEGORIES.map((category) => ({ id: category.id as Filter, label: category.label })),
  ];

  for (const option of filterOptions) {
    const chip = el('button', 'filter-chip');
    chip.type = 'button';
    chip.dataset.filter = option.id;
    const optionCount = counts.get(option.id) ?? 0;
    chip.innerHTML = `${option.label}<span>${optionCount}</span>`;
    chip.setAttribute('aria-pressed', String(option.id === 'all'));
    // Counts are hidden visually on very narrow screens; keep them spoken.
    chip.setAttribute('aria-label', `${option.label}, ${optionCount} examples`);
    chip.addEventListener('click', () => {
      activeFilter = option.id;
      for (const item of chipButtons) {
        item.node.setAttribute('aria-pressed', String(item.filter === activeFilter));
      }
      update();
    });
    chipButtons.push({ filter: option.id, node: chip });
    chips.append(chip);
  }

  const searchWrap = el('label', 'search');
  searchWrap.innerHTML = `<span class="search__label">Search</span>`;
  const search = el('input', 'search__input');
  search.type = 'search';
  search.placeholder = 'choropleth, terrain, flights…';
  search.autocomplete = 'off';
  search.addEventListener('input', () => {
    query = search.value.trim().toLowerCase();
    update();
  });
  searchWrap.append(search);

  const count = el('p', 'filters__count');
  count.setAttribute('aria-live', 'polite');

  const controlRow = el('div', 'filters__row');
  controlRow.append(chips, searchWrap);
  controls.append(controlRow, count);
  shell.append(controls);

  const grid = el('section', 'card-grid');
  grid.setAttribute('aria-label', 'Example gallery');
  shell.append(grid);

  const update = () => {
    const filtered = examples.filter((entry) => {
      const { meta } = entry;
      if (activeFilter !== 'all' && meta.category !== activeFilter) return false;
      if (!query) return true;
      const haystack = [
        meta.title,
        meta.blurb,
        meta.category,
        ...meta.techniques,
        ...meta.data.map((source) => source.name),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });

    grid.replaceChildren();
    if (!filtered.length) {
      renderEmpty(grid);
    } else {
      const fragment = document.createDocumentFragment();
      for (const entry of filtered) fragment.append(card(entry));
      grid.append(fragment);
    }
    count.textContent = `${formatCount(filtered.length)} of ${examples.length}`;
    loadThumbnails(grid);
  };

  update();
  view.append(shell);
}

async function loadThumbnails(grid: HTMLElement): Promise<void> {
  try {
    const base = import.meta.env.BASE_URL || './';
    const response = await fetch(new URL(`${base}thumbs/manifest.json`, document.baseURI));
    if (!response.ok) return;
    const payload = (await response.json()) as { ids?: string[] } | string[];
    const ids = new Set(Array.isArray(payload) ? payload : payload.ids ?? []);
    if (!ids.size) return;
    for (const cardNode of grid.querySelectorAll<HTMLElement>('.card')) {
      const id = cardNode.dataset.id;
      if (!id || !ids.has(id)) continue;
      const image = cardNode.querySelector<HTMLImageElement>('.card__image');
      if (!image) continue;
      image.src = new URL(`${base}thumbs/${id}.webp`, document.baseURI).toString();
      image.hidden = false;
    }
  } catch {
    // Thumbnails are an enhancement; the generated SVG preview remains.
  }
}
