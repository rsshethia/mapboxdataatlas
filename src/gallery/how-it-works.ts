import { el } from '../lib/dom';

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: 'You bring the data',
    body: 'A spreadsheet where every row knows where it lives: a city, a country, a pair of numbers called latitude and longitude. Those two numbers are just X and Y for planet Earth. That is the entire prerequisite. If your data knows its address, it can be a map.',
  },
  {
    title: 'Your browser orders the planet',
    body: 'The streets, parks, and borders underneath arrive as vector tiles — tiny square packets of geography, 512 pixels of gossip about what sits where. Zoom in and the browser simply orders more packets. It is maps all the way down.',
  },
  {
    title: 'Your data puts on a costume',
    body: 'Each row dresses up: a dot, a bubble, a 3D column, a colored country. A style recipe — written in JSON, the sweatpants of data formats — decides the dress code: big numbers get big bubbles, sad numbers get grey. Nobody is checking IDs.',
  },
  {
    title: 'Your graphics card shows off',
    body: 'Everything is painted by your GPU through WebGL, roughly sixty times a second. Nudge the mouse one pixel and the whole planet is redrawn before you finish blinking. Your graphics card has been waiting its whole life for this moment.',
  },
  {
    title: 'A human goes “ohhh”',
    body: 'Patterns your spreadsheet hid for years — the coastal cluster, the empty middle, the one suspiciously enormous bubble — suddenly wave at you. That “ohhh” is the product. Everything before it was plumbing.',
  },
];

const FLOW: Array<{ node: string; caption: string }> = [
  { node: 'Your browser', caption: 'holds your data + your token' },
  { node: 'Mapbox servers', caption: 'hand over tiles, fonts, styles' },
  { node: 'Your GPU', caption: 'paints pixels, 60× a second' },
  { node: 'Your eyes', caption: 'collect the “ohhh”' },
];

export function renderHowItWorks(view: HTMLElement): void {
  const root = el('div', 'sources-page how-page');
  root.innerHTML = `
    <p class="eyebrow">No PhD required</p>
    <h1>How does a spreadsheet become a map?</h1>
    <p class="sources-page__lede">
      You have data. You want a picture that makes people go “ohhh”.
      Here is the whole magic trick — no rabbits, just rectangles.
    </p>
    <div class="how-steps"></div>
    <h2 class="how-heading">One map request, dissected</h2>
    <p class="how-sub">
      Every drag, zoom, and search on this site is some version of this relay race.
      Four runners, one baton, zero rest breaks:
    </p>
    <div class="how-flow"></div>
    <h2 class="how-heading">Cast of characters</h2>
    <div class="method-grid"></div>
    <div class="how-token">
      <p class="eyebrow">A note about keys</p>
      <p>
        Mapbox asks every map “who sent you?” — that is what the token is: a hall pass.
        This site brings its own: the author’s public key (it starts with
        <code>pk.</code>, never one starting with <code>sk.</code>) is baked into these
        pages and locked to this address, so it only works here. Prefer your own key?
        Press <strong>Add token</strong> and yours takes over — it lives in
        <em>your</em> browser only. There is no server here to steal anything from;
        this whole site is static files, basically a very clever pamphlet.
      </p>
    </div>
    <nav class="pager">
      <a class="pager__link" href="#/">
        <span>← Back to safety</span><strong>Browse the gallery</strong>
      </a>
      <a class="pager__link pager__link--next" href="#/e/world-choropleth">
        <span>See the trick live →</span><strong>A choropleth of humanity</strong>
      </a>
    </nav>
  `;

  const steps = root.querySelector('.how-steps');
  if (steps) {
    STEPS.forEach((step, index) => {
      const card = el('article', 'how-step');
      card.innerHTML = `
        <p class="how-step__num" aria-hidden="true">${String(index + 1).padStart(2, '0')}</p>
        <div>
          <h3>${step.title}</h3>
          <p>${step.body}</p>
        </div>
      `;
      steps.append(card);
      if (index < STEPS.length - 1) {
        const arrow = el('p', 'how-step__arrow', '↓');
        arrow.setAttribute('aria-hidden', 'true');
        steps.append(arrow);
      }
    });
  }

  const flow = root.querySelector('.how-flow');
  if (flow) {
    FLOW.forEach((item, index) => {
      const node = el('div', 'how-flow__node');
      node.innerHTML = `<strong>${item.node}</strong><span>${item.caption}</span>`;
      flow.append(node);
      if (index < FLOW.length - 1) {
        const arrow = el('span', 'how-flow__arrow', '→');
        arrow.setAttribute('aria-hidden', 'true');
        flow.append(arrow);
      }
    });
  }

  const grid = root.querySelector('.method-grid');
  if (grid) {
    const cast: Array<[string, string]> = [
      ['Vector tiles', 'The planet, pre-sliced into squares — like a pizza, but square, and infinite. Your browser only downloads the slices you are looking at.'],
      ['Style JSON', 'The recipe: which tiles, which fonts, which colors, in what order. Change the recipe, change the world. Nobody gets hurt.'],
      ['Sources vs layers', 'Sources are the ingredients, layers are the plating. One source can feed many layers — the same trick as a good curry.'],
      ['The camera', 'Center, zoom, pitch, bearing. A drone you fly with two fingers. Every example on this site is just choreographing this drone.'],
      ['The token', 'Your hall pass. Public keys start with pk. and are meant to be seen by browsers; secret keys start with sk. and must never leave a server. Mix them up and the bouncer is unimpressed.'],
      ['The snapshot habit', 'Live data wriggles. These examples pin their datasets down like butterfly specimens — same data, same picture, every visit. Reproducibility is a love language.'],
    ];
    for (const [title, body] of cast) {
      const section = el('section');
      section.innerHTML = `<h2>${title}</h2><p>${body}</p>`;
      grid.append(section);
    }
  }

  view.append(root);
}
