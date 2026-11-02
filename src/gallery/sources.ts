import { el, escapeHtml } from '../lib/dom';
import { examples } from '../lib/registry';
import type { DataSource } from '../lib/types';

interface SourceGroup {
  source: DataSource;
  examples: string[];
}

function collectSources(): SourceGroup[] {
  const groups = new Map<string, SourceGroup>();
  for (const entry of examples) {
    for (const source of entry.meta.data) {
      const key = `${source.name}::${source.source}`;
      const existing = groups.get(key);
      if (existing) {
        if (!existing.examples.includes(entry.meta.title)) {
          existing.examples.push(entry.meta.title);
        }
      } else {
        groups.set(key, { source, examples: [entry.meta.title] });
      }
    }
  }
  return [...groups.values()].sort((a, b) => a.source.name.localeCompare(b.source.name));
}

export function renderSources(view: HTMLElement): void {
  const groups = collectSources();
  const root = el('div', 'sources-page');
  root.innerHTML = `
    <p class="eyebrow">Methodology</p>
    <h1>Data, sources, and attribution</h1>
    <p class="sources-page__lede">
      Examples use committed snapshots so they load quickly and stay reproducible.
      Each snapshot is normalized for the gallery: fields are renamed, geometries are
      simplified, and only the rows needed by the visualization are retained.
    </p>
    <div class="method-grid">
      <section>
        <h2>Why snapshots?</h2>
        <p>
          Live feeds change underneath an example and make visual comparisons
          impossible. The snapshot date is recorded below, and the preparation script
          in <code>scripts/prepare-data.mjs</code> can rebuild each file.
        </p>
      </section>
      <section>
        <h2>Attribution</h2>
        <p>
          Basemaps, tiles, and geocoding results are provided by Mapbox and its data
          partners. Mapbox attribution remains visible on every live map. Dataset
          licenses are listed with each source.
        </p>
      </section>
      <section>
        <h2>Live APIs</h2>
        <p>
          The geocoder, directions, and isochrone examples call Mapbox web services
          directly. Their inputs and results are not stored; usage is subject to your
          Mapbox account limits.
        </p>
      </section>
    </div>
    <div class="sources-table">
      <div class="sources-table__head">
        <span>Dataset</span><span>Source</span><span>License</span><span>Used by</span>
      </div>
  `;

  for (const group of groups) {
    const row = el('div', 'sources-table__row');
    const sourceLink = group.source.url
      ? `<a href="${escapeHtml(group.source.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(
          group.source.source,
        )} ↗</a>`
      : escapeHtml(group.source.source);
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(group.source.name)}</strong>
        ${group.source.retrieved ? `<span class="sources-table__date">retrieved ${escapeHtml(group.source.retrieved)}</span>` : ''}
        ${group.source.description ? `<p>${escapeHtml(group.source.description)}</p>` : ''}
      </div>
      <div>${sourceLink}</div>
      <div>${escapeHtml(group.source.license)}</div>
      <div class="sources-table__examples">${group.examples
        .map((title) => `<span>${escapeHtml(title)}</span>`)
        .join('')}</div>
    `;
    root.append(row);
  }

  root.append(
    Object.assign(el('p', 'sources-page__note'), {
      innerHTML:
        'This is an independent project. It is not affiliated with or endorsed by Mapbox. “Mapbox” and the Mapbox logo are trademarks of Mapbox, Inc.',
    }),
  );

  view.append(root);
}
