import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests for the Angular app. The Supabase API is replaced with fixed answers
 * (e2e/mock-api.ts), so the tests need no network, no accounts and no secrets, and
 * always see the same data.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4300',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx ng serve --port 4300',
    url: 'http://localhost:4300',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
