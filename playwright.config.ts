import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    // Always start a fresh server so the E2E env vars below are guaranteed to
    // apply (a developer's already-running `npm run dev` won't have them).
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      // The app is behind Supabase auth. E2E runs have no Supabase project, so
      // enable the dev-only stub session (see src/context/AuthContext.tsx).
      VITE_E2E_AUTH_BYPASS: 'true',
      // Point at a port nothing listens on so backend calls fail fast and the
      // pages fall back to their seed/localStorage data.
      VITE_API_URL: 'http://127.0.0.1:9/api',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
