import { expect } from '@playwright/test';
import type { Browser, Locator, Page } from '@playwright/test';
import { acceptConsent } from './consent';

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

export async function searchGuid(page: Page, guid: string): Promise<void> {
    await guidSearch(page).fill(guid);
    await guidSearch(page).press('Enter');
    await expect(page).toHaveURL(new RegExp(guid));
}

/**
 * Accept the consent box as a brand-new visitor in a throwaway context and
 * return the GUID from their cookie.
 */
export async function acceptAsNewVisitor(
    browser: Browser,
    baseURL: string | undefined,
): Promise<string> {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    try {
        await page.goto('/');

        return (await acceptConsent(page)).guid;
    } finally {
        await context.close();
    }
}
