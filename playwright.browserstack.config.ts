import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/**
 * Visitor journeys on the browsers listed in browserstack.yml.
 * The BrowserStack SDK picks the browser, so projects here set no device.
 * Admin, a11y and the proof flow stay on the Chromium run in ci.yml.
 *
 * Needs E2E_BASE_URL, because the app must already be running for the tunnel.
 */
export default defineConfig({
    ...base,
    projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
        },
        {
            name: 'visitor',
            testMatch: /(consent|responsive)\.spec\.ts/,
            dependencies: ['setup'],
        },
    ],
});
