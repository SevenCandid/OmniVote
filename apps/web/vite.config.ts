/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'clover', 'cobertura'],
      exclude: [
        'node_modules/',
        'src/tests/setup.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/app/**',
        'src/layouts/**',
        'src/pages/**',
        'src/providers/**',
        'src/routes/**',
        'src/stores/**',
        'src/tests/**',
        'src/components/ui/BaseDialog.tsx',
      ],
    },
  },
});
