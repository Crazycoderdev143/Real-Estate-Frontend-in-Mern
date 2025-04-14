import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  // Enable React with SWC for faster builds
  plugins: [react()],

  // Expose only variables prefixed with VITE_ to the frontend
  envPrefix: 'VITE_',

  // Dev server configuration
  server: {
    host: 'localhost',
    port: 5173,

    proxy: {
      // Proxy requests starting with /api to backend
      '/api': {
        // target: "https://real-estate-backend-in-mern.onrender.com", // Your Express backend
        target: "http://localhost:8000", // Your Express backend
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    // Optional: increase chunk size warning limit (in KB) if needed
    chunkSizeWarningLimit: 700,

    rollupOptions: {
      output: {
        // 🧩 Manual chunk splitting to optimize large bundles
        manualChunks: {
          // Move React and React DOM into a separate chunk
          react: ['react', 'react-dom'],

          // Example: if you use a UI library like Ant Design or MUI
          // ui: ['@mui/material', '@emotion/react', '@emotion/styled'],

          // Example: charting libs if you're using them
          // charts: ['chart.js', 'd3'],

          // You can add more groupings based on your actual dependencies
        },
      },
    },
  },
});
