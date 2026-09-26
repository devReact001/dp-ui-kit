/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    // Emits dist/stats.html: a treemap of every module in the production
    // bundle sized by gzip weight, so we can see exactly which chunk each
    // page/dependency landed in after the React.lazy code-splitting below.
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    projects: [
      {
        // Plain unit/component tests (*.test.tsx) — jsdom, no real browser needed.
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: [path.join(dirname, 'src/test/setup.ts')],
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{
              browser: 'chromium'
            }]
          }
        }
      }
    ]
  }
});
