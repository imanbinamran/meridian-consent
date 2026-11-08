import { test as setup } from '@playwright/test';
import { ADMIN_STORAGE_STATE, logInAsAdmin } from './support/admin';

/**
 * Log in once and save the session, so admin tests do not each hit the login
 * rate limit (5 a minute per email and IP).
 */
setup('log in as the seeded admin', async ({ page }) => {
    await logInAsAdmin(page);
    await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
