import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import type { GeoJSONSource, ExpressionSpecification } from 'mapbox-gl';
import type { ExampleContext } from '../../lib/types';
import { apiMessage, mapboxApi } from '../../lib/api';
import { formatNumber } from '../../lib/format';
import { createSteppedLegend } from '../../lib/legend';
import { addDataLayer, createMap, mapLoaded, waitForIdle } from '../../lib/map';
import { bindHover, tooltipRows } from '../../lib/tooltip';
import { createMapUi, createNote, createPanel, createSegmented } from '../../lib/ui';

type Profile = 'driving' | 'cycling' | 'walking';
type Bands = '10,20,30' | '20,40,60';

interface IsochroneResponse extends FeatureCollection<Polygon | MultiPolygon> {
  features: Array<
    FeatureCollection<Polygon | MultiPolygon>['features'][number] & {
      properties: { contour: number };
    }
  >;
}

const ORIGIN: [number, number] = [12.5683, 55.6761];
const CONTOUR_COLORS: Record<number, string> = {
  10: '#1f6f78',
  20: '#d9a441',
  30: '#c8462b',
  40: '#d9a441',
  60: '#c8462b',
};

function colorExpression(): ExpressionSpecification {
  return [
    'match',
    ['get', 'contour'],
    10,
    CONTOUR_COLORS[10],
    20,
    CONTOUR_COLORS[20],
    30,
    CONTOUR_COLORS[30],
    40,
    CONTOUR_COLORS[40],
    60,
    CONTOUR_COLORS[60],
    '#1f6f78',
  ] as unknown as ExpressionSpecification;
}

function minutesOf(bands: Bands): number[] {
  return bands.split(',').map(Number);
}

export async function mount(ctx: ExampleContext): Promise<void> {
  const { container } = ctx;
  const map = createMap(container, {
    style: 'mapbox://styles/mapbox/light-v11',
    center: ORIGIN,
    zoom: 11.2,
  });
  ctx.onCleanup(() => map.remove());

  await mapLoaded(map);

  map.addSource('origin', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: ORIGIN } },
      ],
    },
  });

  map.addSource('isochrone', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  addDataLayer(map, {
    id: 'isochrone-fill',
    type: 'fill',
    source: 'isochrone',
    paint: {
      'fill-color': colorExpression(),
      'fill-opacity': 0.22,
    },
  });

  addDataLayer(map, {
    id: 'isochrone-line',
    type: 'line',
    source: 'isochrone',
    paint: {
      'line-color': colorExpression(),
      'line-width': 1.6,
      'line-opacity': 0.9,
    },
  });

  addDataLayer(map, {
    id: 'origin',
    type: 'circle',
    source: 'origin',
    paint: {
      'circle-color': '#181611',
      'circle-radius': 6,
      'circle-stroke-color': '#f4f0e6',
      'circle-stroke-width': 2,
    },
  });

  const legend = createSteppedLegend({
    title: 'Travel time',
    colors: [CONTOUR_COLORS[10], CONTOUR_COLORS[20], CONTOUR_COLORS[30]],
    labels: ['10 min', '20 min', '30 min'],
    note: 'Live contours from the Isochrone API.',
  });
  legend.classList.add('legend--bottom-right');
  container.append(legend);

  const ui = createMapUi(container);
  const panel = createPanel('Isochrone');
  const note = createNote('Requesting contours…');
  let profile: Profile = 'driving';
  let bands: Bands = '10,20,30';
  let controller: AbortController | null = null;
  let requestId = 0;

  const replaceLegend = () => {
    const values = minutesOf(bands);
    const next = createSteppedLegend({
      title: `${profile[0]?.toUpperCase() ?? ''}${profile.slice(1)} travel time`,
      colors: values.map((value) => CONTOUR_COLORS[value] ?? '#1f6f78'),
      labels: values.map((value) => `${value} min`),
      note: 'Live contours from the Isochrone API.',
    });
    next.classList.add('legend--bottom-right');
    legendRef.current.replaceWith(next);
    legendRef.current = next;
  };

  // A tiny indirection keeps the legend replacement readable without a
  // module-level variable.
  const legendRef = { current: legend };

  const fetchContours = async () => {
    requestId += 1;
    const current = requestId;
    controller?.abort();
    controller = new AbortController();
    note.textContent = 'Requesting contours…';
    try {
      const response = await mapboxApi<IsochroneResponse>(
        `isochrone/v1/mapbox/${profile}/${ORIGIN[0]},${ORIGIN[1]}`,
        {
          contours_minutes: bands,
          polygons: true,
          denoise: 0.5,
          generalize: 40,
        },
        controller.signal,
      );
      if (current !== requestId || ctx.signal.aborted) return;
      const source = map.getSource('isochrone') as GeoJSONSource;
      source.setData(response);
      note.textContent = `${formatNumber(response.features.length)} polygons · ${minutesOf(bands)
        .map((minutes) => `${minutes} min`)
        .join(' / ')} · ${profile}`;
    } catch (error) {
      if (current !== requestId || ctx.signal.aborted) return;
      note.textContent = apiMessage(error);
    }
  };

  panel.body.append(
    createSegmented<Profile>(
      [
        { value: 'driving', label: 'Drive' },
        { value: 'cycling', label: 'Cycle' },
        { value: 'walking', label: 'Walk' },
      ],
      profile,
      (next) => {
        profile = next;
        replaceLegend();
        void fetchContours();
      },
    ),
    createSegmented<Bands>(
      [
        { value: '10,20,30', label: '10/20/30' },
        { value: '20,40,60', label: '20/40/60' },
      ],
      bands,
      (next) => {
        bands = next;
        replaceLegend();
        void fetchContours();
      },
    ),
    note,
    createNote(
      'Each change sends a new request. The previous request is aborted, so only the latest contours are drawn.',
    ),
  );
  ui.append(panel.root);

  bindHover(map, {
    layers: 'isochrone-fill',
    render: (feature) => {
      const contour = Number((feature.properties as { contour?: number } | null)?.contour);
      return tooltipRows(
        [{ label: 'Travel time', value: Number.isFinite(contour) ? `${contour} min` : '—' }],
        'Reachable area',
      );
    },
  });

  void fetchContours();

  await waitForIdle(map, 8000);
  ctx.ready();

  ctx.onCleanup(() => {
    controller?.abort();
  });
}
