import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const e2eEnv = process.env.E2E_ENV || 'local'; // 'local' or 'staging'

export default defineConfig({
  testDir: './e2e/__tests__/',
  timeout: 30_000,
  retries: isCI ? 2 : 0,
  workers: isCI ? 3 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: './e2e/__tests__/results',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Only run setup/teardown in local dev
  // Global setup: Start servers before all tests
  globalSetup: e2eEnv === 'local' ? './e2e/global-setup' : undefined,

  // Global teardown: Stop servers after all tests
  globalTeardown: e2eEnv === 'local' ? './e2e/global-teardown' : undefined
});
