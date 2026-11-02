const STORAGE_KEY = 'mapbox-atlas-token';
const envToken = (
  (import.meta.env.MAPBOX_API as string | undefined) ??
  (import.meta.env.VITE_MAPBOX_API as string | undefined) ??
  ''
).trim();

export type TokenSource = 'env' | 'local' | 'none';

export function getToken(): string {
  const local = window.localStorage.getItem(STORAGE_KEY)?.trim() ?? '';
  return local || envToken;
}

export function getTokenSource(): TokenSource {
  if (window.localStorage.getItem(STORAGE_KEY)?.trim()) return 'local';
  return envToken ? 'env' : 'none';
}

export interface TokenValidation {
  ok: boolean;
  message?: string;
}

export function validateToken(token: string): TokenValidation {
  const value = token.trim();
  if (!value) return { ok: false, message: 'Enter a public Mapbox access token.' };
  if (value.startsWith('sk.')) {
    return {
      ok: false,
      message: 'That is a secret token. Use a public token that starts with “pk.”.',
    };
  }
  if (!value.startsWith('pk.')) {
    return {
      ok: false,
      message: 'Mapbox public tokens start with “pk.”. Copy the token from your Mapbox account.',
    };
  }
  return { ok: true };
}

export function setToken(token: string): TokenValidation {
  const validation = validateToken(token);
  if (!validation.ok) return validation;
  window.localStorage.setItem(STORAGE_KEY, token.trim());
  return validation;
}

export function clearToken(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function hasEnvToken(): boolean {
  return Boolean(envToken);
}
