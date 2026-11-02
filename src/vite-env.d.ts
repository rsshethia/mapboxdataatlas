/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAPBOX_API?: string;
  readonly VITE_MAPBOX_API?: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
