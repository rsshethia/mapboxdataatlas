import mapboxgl from 'mapbox-gl';
import type {
  LayerSpecification,
  LngLatBoundsLike,
  LngLatLike,
  Map as MapboxMap,
  MapOptions,
} from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getToken } from './token';
import { showAuthError, showMapLoading } from './status';

export interface CreateMapOptions {
  style?: string;
  center?: LngLatLike;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  projection?: 'mercator' | 'globe';
  preserveDrawingBuffer?: boolean;
  controls?: boolean;
  interactive?: boolean;
}

function errorStatus(event: { error?: unknown }): number | undefined {
  const error = event.error as { status?: number; statusCode?: number } | undefined;
  return error?.status ?? error?.statusCode;
}

export function createMap(container: HTMLElement, options: CreateMapOptions = {}): MapboxMap {
  const token = getToken();
  if (!token) throw new Error('A Mapbox access token is required.');
  mapboxgl.accessToken = token;

  container.classList.add('map-host');
  const loading = showMapLoading(container);

  const mapOptions: MapOptions = {
    container,
    accessToken: token,
    style: options.style ?? 'mapbox://styles/mapbox/light-v11',
    center: options.center ?? [0, 20],
    zoom: options.zoom ?? 1.6,
    pitch: options.pitch ?? 0,
    bearing: options.bearing ?? 0,
    projection: options.projection,
    preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
    attributionControl: false,
    interactive: options.interactive ?? true,
  };

  const map = new mapboxgl.Map(mapOptions);

  map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
  if (options.controls !== false) {
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
  }

  map.once('load', () => loading.remove());

  map.on('error', (event) => {
    const status = errorStatus(event);
    if (status === 401 || status === 403) {
      showAuthError(container, status);
    }
  });

  const observer = new ResizeObserver(() => {
    map.resize();
  });
  observer.observe(container);
  map.once('remove', () => observer.disconnect());

  return map;
}

export function mapLoaded(map: MapboxMap, timeoutMs = 25000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (map.loaded()) {
      resolve();
      return;
    }
    let timer = 0;
    const cleanup = () => {
      window.clearTimeout(timer);
      map.off('load', onLoad);
      map.off('error', onError);
    };
    const onLoad = () => {
      cleanup();
      resolve();
    };
    const onError = (event: { error?: unknown }) => {
      const status = errorStatus(event);
      if (status === 401 || status === 403) {
        cleanup();
        reject(new Error('Mapbox rejected the access token.'));
      }
    };
    timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('The map took too long to load. Check your network and token.'));
    }, timeoutMs);
    map.on('load', onLoad);
    map.on('error', onError);
  });
}

export function waitForIdle(map: MapboxMap, timeoutMs = 12000): Promise<void> {
  return new Promise((resolve) => {
    let timer = 0;
    const done = () => {
      window.clearTimeout(timer);
      map.off('idle', done);
      resolve();
    };
    timer = window.setTimeout(done, timeoutMs);
    map.once('idle', done);
  });
}

export function firstSymbolLayerId(map: MapboxMap): string | undefined {
  return map.getStyle()?.layers?.find((layer) => layer.type === 'symbol')?.id;
}

export function addDataLayer(
  map: MapboxMap,
  layer: LayerSpecification,
  beforeId?: string,
): void {
  map.addLayer(layer, beforeId ?? firstSymbolLayerId(map));
}

export function fitToData(
  map: MapboxMap,
  bounds: LngLatBoundsLike,
  options: Parameters<MapboxMap['fitBounds']>[1] = {},
): void {
  map.fitBounds(bounds, {
    padding: { top: 64, right: 64, bottom: 64, left: 64 },
    duration: 0,
    ...options,
  });
}

export function attachPointerCursor(map: MapboxMap, layerIds: string[]): () => void {
  const enter = () => {
    map.getCanvas().style.cursor = 'pointer';
  };
  const leave = () => {
    map.getCanvas().style.cursor = '';
  };
  for (const layerId of layerIds) {
    map.on('mouseenter', layerId, enter);
    map.on('mouseleave', layerId, leave);
  }
  return () => {
    for (const layerId of layerIds) {
      map.off('mouseenter', layerId, enter);
      map.off('mouseleave', layerId, leave);
    }
    map.getCanvas().style.cursor = '';
  };
}

export function setVisibility(
  map: MapboxMap,
  layerIds: string[],
  visible: boolean,
): void {
  for (const id of layerIds) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
  }
}

export function removeLayers(map: MapboxMap, layerIds: string[]): void {
  for (const id of layerIds) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
}
