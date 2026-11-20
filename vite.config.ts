import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Keep React in its own chunk so the 3D libraries stay lazy-loaded.
        manualChunks(id) {
          if (id.includes('preload-helper') || id.includes('commonjsHelpers')) return 'react';
          if (!id.includes('node_modules')) return;
          if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'react';
          if (/node_modules[\/]three[\/]/.test(id)) return 'three';
          return 'r3f';
        },
      },
    },
  },
});
