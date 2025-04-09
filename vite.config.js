import React from 'react';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy API requests to the serverless functions during development
        '/api': {
          target: 'http://localhost:3001', // Assuming backend runs here locally
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''), // Adjust if needed
        },
      },
    },
    define: {
      // Expose environment variables to the frontend
      // This makes non-VITE_ prefixed env vars available via import.meta.env
      'import.meta.env.TMDB_API_KEY': JSON.stringify(env.TMDB_API_KEY || ''),
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'import.meta.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || '/api'),
    },
  };
}); 