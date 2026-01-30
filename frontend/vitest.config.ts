import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    deps: {
      inline: ['solid-js', '@solidjs/testing-library'],
    },
    // css: true,                // for future testing styled components / tailwind etc.
  },
});
