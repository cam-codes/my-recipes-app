import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    deps: {
      inline: ['solid-js', '@solidjs/testing-library'],
    },
    // css: true,                // for future testing styled components / tailwind etc.
  },
});
