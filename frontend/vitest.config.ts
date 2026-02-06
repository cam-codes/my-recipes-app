import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    deps: {
      inline: [/solid-js/, /@solidjs\/.*/, /@solidjs\/router/],
    },
    // css: true,                // for future testing styled components / tailwind etc.
  },
});
