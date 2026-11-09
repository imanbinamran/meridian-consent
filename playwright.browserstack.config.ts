import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/**
 * Visitor journeys on the browsers listed in browserstack.yml.
 * Admin, a11y and the proof flow stay on the Chromium run in ci.yml.
 *
 * The BrowserStack SDK builds its own projects, one per browser, and drops any
 * project-level testMatch or dependencies. So the filters sit at the top level,
 * and the sign-in setup project cannot run here.
 *
 * Needs E2E_BASE_URL, because the app must already be running for the tunnel.
 */
export default defineConfig({
    ...base,
    testMatch: /(consent|responsive)\.spec\.ts/,
    // Needs the saved admin sign-in, which only the setup project creates.
    grepInvert: /CON-041 a cookie matching a real/,
    projects: [{ name: 'browserstack' }],
});
