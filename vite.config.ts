import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  envPrefix: ['VITE_', 'MAPBOX_'],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2200,
  },
});
