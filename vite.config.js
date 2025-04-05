import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Vite configuration
export default defineConfig({
  // Enable React with SWC for faster builds
  plugins: [react()],

  // Expose only variables prefixed with VITE_ to the frontend
  envPrefix: 'VITE_',

  // Dev server configuration
  server: {
    host: 'localhost',
    port: 5173, // Default port

    proxy: {
      // Proxy requests starting with /api to backend
      '/api': {
        target: 'http://localhost:8000', // Your Express backend
        changeOrigin: true,              // Needed for virtual hosts
        secure: false,                   // Set to true if using HTTPS
        // DO NOT rewrite the path because you are keeping `/api` in backend
        // rewrite: (path) => path.replace(/^\/api/, ''), <-- ❌ remove this line
      },
    },
  },
});
