import { getToken } from './token';

export class MapboxApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'MapboxApiError';
    this.status = status;
  }
}

type ParamValue = string | number | boolean | undefined;

/**
 * Call a Mapbox web API with the current token. The token is added here and
 * never surfaced in errors or logs.
 */
export async function mapboxApi<T>(
  path: string,
  params: Record<string, ParamValue> = {},
  signal?: AbortSignal,
): Promise<T> {
  const token = getToken();
  if (!token) throw new MapboxApiError('A Mapbox access token is required.', 401);

  const url = new URL(`https://api.mapbox.com/${path.replace(/^\/+/, '')}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  url.searchParams.set('access_token', token);

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new MapboxApiError('The Mapbox API could not be reached. Check your connection.', 0);
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { message?: string };
      detail = body.message ?? '';
    } catch {
      // Non-JSON error bodies are common for rate limits.
    }
    throw new MapboxApiError(
      detail || `The Mapbox API returned HTTP ${response.status}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function apiMessage(error: unknown): string {
  if (error instanceof MapboxApiError && error.status === 401) {
    return 'The token was rejected. Update it and try again.';
  }
  if (error instanceof Error) return error.message;
  return String(error);
}
