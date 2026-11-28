import { defineConfig, devices } from '@playwright/test'

// Test against a local production build by default; set BASE_URL to test a Vercel preview deploy.
//   BASE_URL=https://<preview>.vercel.app npx playwright test
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173'
const local = !process.env.BASE_URL

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'android-pixel', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-safari', use: { ...devices['iPhone 14'] } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'ipad', use: { ...devices['iPad (gen 7)'] } },
  ],
  webServer: local
    ? { command: 'npm run preview -- --port 4173 --strictPort', url: BASE_URL, reuseExistingServer: true, timeout: 120_000 }
    : undefined,
})
