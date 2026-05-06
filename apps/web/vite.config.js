import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '^/(auth|resume|jobs|cover-letters|applications|dashboard|interview|study-plan)(/.*)?$': {
        target: 'http://localhost:8000',
        // Only proxy if the request looks like an API call, not a page navigation
        bypass(req) {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        },
      },
    },
  },
});
