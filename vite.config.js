// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc';

// // Vite configuration
// export default defineConfig({
//   // Enable React with SWC for faster builds
//   plugins: [react()],

//   // Expose only variables prefixed with VITE_ to the frontend
//   envPrefix: 'VITE_',

//   // Dev server configuration
//   server: {
//     host: 'localhost',
//     port: 5173, // Default port

//     proxy: {
//       // Proxy requests starting with /api to backend
//       '/api': {
//         target: 'http://localhost:8000', // Your Express backend
//         changeOrigin: true,              // Needed for virtual hosts
//         secure: false,                   // Set to true if using HTTPS
//         // DO NOT rewrite the path because you are keeping `/api` in backend
//         // rewrite: (path) => path.replace(/^\/api/, ''), <-- ❌ remove this line
//       },
//     },
//   },
// });

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
        target: 'http://localhost:8000', // Your Express backend
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
