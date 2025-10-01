import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Import app name from central config
const { APP_NAME } = require('../config.js');
const BASE_PATH = process.env.VITE_BASE_PATH || `/${APP_NAME}`;

export default defineConfig({
  base: `${BASE_PATH}/`,
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      [`${BASE_PATH}/api`]: {
        target: 'http://localhost:3001/',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_BASE_PATH': JSON.stringify(BASE_PATH),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})