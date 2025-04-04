import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Vite configuration
export default defineConfig({
  plugins: [react()],  // Use SWC for fast React compilation
  envPrefix: 'VITE_',  // Prefix for exposing env variables to the client
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // Your backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),  // Remove /api prefix
      },
    },
  },
});
