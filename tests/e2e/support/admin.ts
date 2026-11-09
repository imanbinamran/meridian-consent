import { devices, expect } from '@playwright/test';
import type { Browser, Locator, Page } from '@playwright/test';
import { acceptConsent, declineConsent, waitForPublicPage } from './consent';

/** Signed-in admin session saved by auth.setup.ts (gitignored). */
export const ADMIN_STORAGE_STATE = 'playwright/.auth/admin.json';

/** Seeded by DatabaseSeeder. Override in CI or locally with env vars. */
export const ADMIN = {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@meridian.test',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'password',
};

export async function logInAsAdmin(page: Page): Promise<void> {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(ADMIN.email);
    await page.getByLabel('Password', { exact: true }).fill(ADMIN.password);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/?$/);
}

/** The GUID search box on /admin/consents. */
export function guidSearch(page: Page): Locator {
    return page
        .getByRole('searchbox', { name: /guid|search/i })
        .or(page.getByLabel(/search by guid/i))
        .first();
}

export function consentsTable(page: Page): Locator {
    return page.getByRole('table');
}

/** Body rows only (the header row holds column headers, not cells). */
export function dataRows(table: Locator): Locator {
    return table
        .getByRole('row')
        .filter({ has: table.page().getByRole('cell') });
}

/** The one-column list that replaces the table on narrow screens. */
export function consentsList(page: Page): Locator {
    return page.getByRole('list', { name: 'Consents' });
}

export function listRows(page: Page): Locator {
    return consentsList(page).getByRole('listitem');
}

export async function searchGuid(page: Page, guid: string): Promise<void> {
    await guidSearch(page).fill(guid);
    await guidSearch(page).press('Enter');
    await expect(page).toHaveURL(new RegExp(guid));
}

/** A fixed browser, so tests know what the Device column should say. */
export const VISITOR_DEVICE = 'Desktop · Chrome on Windows';

/**
 * Accept the consent box as a brand-new visitor in a throwaway context and
 * return the GUID from their cookie. With `withdraw`, they then change their
 * mind through Cookie settings, as a real visitor would.
 */
export async function acceptAsNewVisitor(
    browser: Browser,
    baseURL: string | undefined,
    { withdraw = false }: { withdraw?: boolean } = {},
): Promise<string> {
    const context = await browser.newContext({
        baseURL,
        userAgent: devices['Desktop Chrome'].userAgent,
    });
    const page = await context.newPage();

    try {
        await page.goto('/');
        const { guid } = await acceptConsent(page);

        if (withdraw) {
            await waitForPublicPage(page);
            await page
                .getByRole('contentinfo')
                .getByRole('button', { name: 'Cookie settings' })
                .click();
            await declineConsent(page);
        }

        return guid;
    } finally {
        await context.close();
    }
}

/** Pick an option in the shadcn status filter on /admin/consents. */
export async function chooseStatus(page: Page, option: string): Promise<void> {
    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: option, exact: true }).click();
}
