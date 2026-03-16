// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// @ts-expect-error — vite-plugin-sri has no type declarations
import sri from 'vite-plugin-sri';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sri(),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
