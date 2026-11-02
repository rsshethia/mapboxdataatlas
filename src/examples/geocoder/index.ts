import type { LngLatBoundsLike } from 'mapbox-gl';
import type { GeoJSONSource } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { apiMessage, mapboxApi } from '../../lib/api';
import { el } from '../../lib/dom';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { createMapUi, createNote, createPanel } from '../../lib/ui';

interface GeocodeFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  bbox?: [number, number, number, number];
  place_type: string[];
}

interface GeocodeResponse {
  features: GeocodeFeature[];
}

const SUGGESTIONS = ['Tokyo', 'Nairobi', 'Buenos Aires', 'Reykjavík', 'Sahara', 'Manhattan'];

function markerCollection(feature: GeocodeFeature | null): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: feature
      ? [
          {
            type: 'Feature',
            properties: { name: feature.place_name },
            geometry: { type: 'Point', coordinates: feature.center },
          },
        ]
      : [],
  };
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [10, 24],
    zoom: 1.5,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  map.addSource('result', { type: 'geojson', data: markerCollection(null) });
  addDataLayer(map, {
    id: 'result-halo',
    type: 'circle',
    source: 'result',
    paint: {
      'circle-color': '#c8462b',
      'circle-radius': 20,
      'circle-opacity': 0.12,
    },
  });
  addDataLayer(map, {
    id: 'result-point',
    type: 'circle',
    source: 'result',
    paint: {
      'circle-color': '#c8462b',
      'circle-radius': 7,
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 2,
    },
  });
  addDataLayer(map, {
    id: 'result-label',
    type: 'symbol',
    source: 'result',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 11,
      'text-anchor': 'top',
      'text-offset': [0, 1.1],
      'text-max-width': 14,
    },
    paint: {
      'text-color': '#181611',
      'text-halo-color': '#f4f0e6',
      'text-halo-width': 1.4,
    },
  });

  const ui = createMapUi(container);
  const panel = createPanel('Search places');
  const form = el('form', 'search-box');
  const input = el('input', 'search-box__input');
  input.type = 'search';
  input.placeholder = 'City, address, or landmark';
  input.autocomplete = 'off';
  input.setAttribute('aria-label', 'Search for a place');
  const submit = el('button', 'button button--small', 'Go');
  submit.type = 'submit';
  form.append(input, submit);

  const results = el('div', 'search-results');
  const note = createNote('Type at least two characters. Results come from the live Geocoding API.');
  panel.body.append(form, results, note);
  ui.append(panel.root);

  const suggestionRow = el('div', 'search-suggestions');
  for (const suggestion of SUGGESTIONS) {
    const chip = el('button', 'chip chip--muted', suggestion);
    chip.type = 'button';
    chip.addEventListener('click', () => {
      input.value = suggestion;
      void runSearch(suggestion);
    });
    suggestionRow.append(chip);
  }
  panel.body.append(suggestionRow);

  let controller: AbortController | null = null;
  let debounce = 0;
  let selected: GeocodeFeature | null = null;
  let requestId = 0;

  const choose = (feature: GeocodeFeature) => {
    selected = feature;
    const source = map.getSource('result') as GeoJSONSource;
    source.setData(markerCollection(feature));
    if (feature.bbox) {
      map.fitBounds(feature.bbox as LngLatBoundsLike, {
        padding: { top: 70, right: 70, bottom: 70, left: 70 },
        maxZoom: 14,
        duration: 900,
      });
    } else {
      map.flyTo({ center: feature.center, zoom: 12, duration: 900 });
    }
    note.textContent = `${feature.place_name} · ${feature.place_type.join(', ')}`;
    results.replaceChildren();
  };

  const renderResults = (features: GeocodeFeature[]) => {
    results.replaceChildren();
    if (!features.length) {
      note.textContent = 'No matches. Try a broader name.';
      return;
    }
    for (const feature of features) {
      const button = el('button', 'search-result');
      button.type = 'button';
      button.append(el('strong', '', feature.text), el('span', '', feature.place_name));
      button.addEventListener('click', () => choose(feature));
      results.append(button);
    }
  };

  const runSearch = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      results.replaceChildren();
      note.textContent = 'Type at least two characters.';
      return;
    }
    requestId += 1;
    const current = requestId;
    controller?.abort();
    controller = new AbortController();
    note.textContent = `Searching for “${trimmed}”…`;
    try {
      const response = await mapboxApi<GeocodeResponse>(
        `geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json`,
        {
          autocomplete: true,
          limit: 6,
          language: 'en',
          types: 'country,region,place,address,poi',
        },
        controller.signal,
      );
      if (current !== requestId || ctx.signal.aborted) return;
      renderResults(response.features);
      note.textContent = `${response.features.length} results from the live Geocoding API.`;
      const first = response.features[0];
      if (first && !selected) {
        const source = map.getSource('result') as GeoJSONSource;
        source.setData(markerCollection(first));
      }
    } catch (error) {
      if (current !== requestId || ctx.signal.aborted) return;
      note.textContent = apiMessage(error);
    }
  };

  input.addEventListener('input', () => {
    window.clearTimeout(debounce);
    const value = input.value;
    debounce = window.setTimeout(() => void runSearch(value), 420);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearTimeout(debounce);
    void runSearch(input.value);
  });

  ctx.onCleanup(() => {
    window.clearTimeout(debounce);
    controller?.abort();
  });

  input.value = 'Copenhagen';
  void runSearch('Copenhagen');

  await waitForIdle(map, 8000);
  ctx.ready();
}
