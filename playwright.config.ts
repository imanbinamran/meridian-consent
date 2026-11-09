import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end suite for the public site, the consent box and the admin portal.
 * Cases and the reason for each test: tests/cases/*.yaml.
 *
 * Point it at a running app with E2E_BASE_URL. Without it, Playwright starts
 * `php artisan serve` itself (or reuses one already on port 8000).
 */
const externalBaseURL = process.env.E2E_BASE_URL;
const baseURL = externalBaseURL ?? 'http://127.0.0.1:8000';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: process.env.CI
        ? [['html', { open: 'never' }], ['github'], ['list']]
        : [['html', { open: 'never' }], ['list']],
    use: {
        baseURL,
        trace: 'on-first-retry',
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'chromium-desktop',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['setup'],
        },
        {
            // Phone layout for the visitor journeys. Admin, a11y and the proof
            // flow run on desktop only (a11y sets both viewports itself).
            name: 'chromium-mobile',
            use: { ...devices['Pixel 7'] },
            testMatch: /(consent|language|responsive|stories)\.spec\.ts/,
            dependencies: ['setup'],
        },
    ],
    webServer: externalBaseURL
        ? undefined
        : {
              command: 'php artisan serve --port=8000',
              url: baseURL,
              reuseExistingServer: true,
              timeout: 120_000,
              env: { PHP_CLI_SERVER_WORKERS: '4', CONSENT_THROTTLE: '1000' },
          },
});
