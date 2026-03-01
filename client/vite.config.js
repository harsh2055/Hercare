// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // ── Dev server ─────────────────────────────────────────────────────────────
  server: {
    port: 5173,
    // Proxy API requests to Express backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Service workers don't run in dev, so no SW headers needed here
  },

  // ── Build ──────────────────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: false,        // disable in prod for security
    minify: 'esbuild',

    rollupOptions: {
      output: {
        // Deterministic chunk names — prevents cache busting on every build
        // for unchanged modules
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',

        // Manual chunk splitting — vendors into separate cacheable chunk
        manualChunks: {
          react:      ['react', 'react-dom', 'react-router-dom'],
          motion:     ['framer-motion'],
          pdf:        ['jspdf', 'jspdf-autotable'],
          charts:     ['recharts'],
        },
      },
    },
  },

  // ── PWA headers (served via preview / production build server) ─────────────
  // These headers allow the service worker to control the full origin scope.
  // In production, configure these on your actual server (Nginx / Express).
  // Here they're set for `vite preview` testing:
  preview: {
    port: 4173,
    headers: {
      // Required for SharedArrayBuffer (future use), good practice
      'Cross-Origin-Opener-Policy':   'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  // ── Define ─────────────────────────────────────────────────────────────────
  define: {
    // Expose build timestamp for cache-busting display in Settings
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});