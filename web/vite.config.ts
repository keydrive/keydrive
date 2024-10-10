import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendUrl = 'http://localhost:5555';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': backendUrl,
      '/oauth2': backendUrl,
      '/docs': backendUrl
    }
  }
});
