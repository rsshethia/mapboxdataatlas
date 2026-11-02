const numberFormat = new Intl.NumberFormat('en-US');
const compactFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const decimalFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return numberFormat.format(Math.round(value));
}

export function formatDecimal(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-US', {
    maximumFractionDigits: digits,
  });
}

export function formatCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return compactFormat.format(value);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${decimalFormat.format(value)}%`;
}

export function formatDate(
  input: number | string | Date,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function formatCoord(lngLat: { lng: number; lat: number }): string {
  const lat = `${Math.abs(lngLat.lat).toFixed(2)}°${lngLat.lat >= 0 ? 'N' : 'S'}`;
  const lng = `${Math.abs(lngLat.lng).toFixed(2)}°${lngLat.lng >= 0 ? 'E' : 'W'}`;
  return `${lat}, ${lng}`;
}

export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}
