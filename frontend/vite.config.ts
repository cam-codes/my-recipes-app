/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'vitest/config'    // ← use this instead
import solid from 'vite-plugin-solid'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
// const API_BASE = process.env.VITE_API_BASE || 'http://localhost:3000';

export default defineConfig(({ command}) => {
  const isDev = command === 'serve';
  return {
    plugins: [
      solid(),
      tailwindcss(),
    ],
    server: isDev
      ? {
        port: 5173,
        host: true, // allow access from host
        proxy: {
          // Proxy all /recipes requests to backend container
          "/recipes": {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      }
      : undefined,
    build: {
      commonjsOptions: {
        requireReturnsDefault: 'auto',
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
      coverage: {
        reporter: ["text", "html"],
        exclude: ["src/main.tsx"],
      },
    },
    optimizeDeps: {
      include: ['debug', 'extend'],
      esbuildOptions: {
        plugins: [
          {
            name: 'cjs-default-export',
            setup(build) {
              build.onResolve({ filter: /^debug$/}, async () => {
                const absPath = fileURLToPath(await import.meta.resolve('debug/src/browser.js'))
                return { path: absPath }
              });
            },
          },
        ],

      },
    },
    resolve: {
      alias: {
        debug: 'debug/src/browser.js',
      },
      dedupe: ['solid-js', 'solid-js/web', 'solid-js/html']
    },
  }
});
