import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/resume': 'http://localhost:8000',
      '/jobs': 'http://localhost:8000',
      '/cover-letters': 'http://localhost:8000',
      '/applications': 'http://localhost:8000',
      '/dashboard': 'http://localhost:8000',
      '/interview': 'http://localhost:8000',
      '/study-plan': 'http://localhost:8000',
    },
  },
});
