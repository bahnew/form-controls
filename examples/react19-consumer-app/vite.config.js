import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // React 19 specific optimizations
      jsxRuntime: 'automatic',
      babel: {
        plugins: []
      }
    })
  ],
  server: {
    port: 3002, // Different port from React 18 version (3001)
    open: true,
    host: true
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          formControls: ['bahmni-form-controls']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'bahmni-form-controls']
  }
});
