/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        solid(),
        tailwindcss(),
    ],
    build: {
        commonjsOptions: {
            requireReturnsDefault: 'auto',
        },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      deps: {
        inline: [/solid-js/, /@solidjs\/testing-library/],
      },
      // css: true,                // for future testing styled components / tailwind etc.
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
});
