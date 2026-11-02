import mapboxgl from 'mapbox-gl';
import type { Map as MapboxMap, MapboxGeoJSONFeature } from 'mapbox-gl';
import { escapeHtml } from './dom';

export interface Tooltip {
  show: (content: string | HTMLElement, lngLat: { lng: number; lat: number }) => void;
  hide: () => void;
  destroy: () => void;
}

export function createTooltip(map: MapboxMap): Tooltip {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 14,
    maxWidth: '320px',
    className: 'viz-tooltip',
  });

  return {
    show(content, lngLat) {
      if (typeof content === 'string') {
        popup.setHTML(content);
      } else {
        popup.setDOMContent(content);
      }
      popup.setLngLat(lngLat).addTo(map);
    },
    hide() {
      popup.remove();
    },
    destroy() {
      popup.remove();
    },
  };
}

export interface HoverOptions {
  render: (feature: MapboxGeoJSONFeature) => string | HTMLElement | null;
  layers: string | string[];
  onEnter?: (feature: MapboxGeoJSONFeature) => void;
  onLeave?: (feature: MapboxGeoJSONFeature) => void;
}

export function bindHover(map: MapboxMap, options: HoverOptions): () => void {
  const tooltip = createTooltip(map);

  const move = (event: mapboxgl.MapMouseEvent & { features?: MapboxGeoJSONFeature[] }) => {
    const feature = event.features?.[0];
    if (!feature) return;
    map.getCanvas().style.cursor = 'pointer';
    const content = options.render(feature);
    if (content) tooltip.show(content, event.lngLat);
    else tooltip.hide();
    options.onEnter?.(feature);
  };

  const leave = (event: mapboxgl.MapMouseEvent & { features?: MapboxGeoJSONFeature[] }) => {
    map.getCanvas().style.cursor = '';
    tooltip.hide();
    const feature = event.features?.[0];
    if (feature) options.onLeave?.(feature);
  };

  map.on('mousemove', options.layers, move);
  map.on('mouseleave', options.layers, leave);

  return () => {
    map.off('mousemove', options.layers, move);
    map.off('mouseleave', options.layers, leave);
    tooltip.destroy();
  };
}

export function tooltipRows(
  rows: Array<{ label: string; value: string | number }>,
  title?: string,
): string {
  const header = title ? `<p class="tooltip__title">${escapeHtml(title)}</p>` : '';
  const body = rows
    .map(
      (row) =>
        `<div class="tooltip__row"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(
          String(row.value),
        )}</strong></div>`,
    )
    .join('');
  return `<div class="tooltip">${header}${body}</div>`;
}
