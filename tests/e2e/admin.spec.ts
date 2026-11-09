import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import {
    ADMIN_STORAGE_STATE,
    acceptAsNewVisitor,
    consentsTable,
    dataRows,
    logInAsAdmin,
    searchGuid,
} from './support/admin';
import { consentDialog } from './support/consent';

/** Admin portal. Case ids refer to tests/cases/admin.yaml. */

test.describe('as a guest', () => {
    test('ADM-001 /admin redirects to /login', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).toHaveURL(/\/login$/);
    });

    test('ADM-004 /register is 404 and the login page offers no sign up', async ({
        page,
    }) => {
        const response = await page.goto('/register');
        expect(response?.status()).toBe(404);

        await page.goto('/login');
        await expect(
            page.getByRole('button', { name: 'Log in', exact: true }),
        ).toBeVisible();
        await expect(page.getByRole('link', { name: /sign up/i })).toHaveCount(
            0,
        );
    });

    test('ADM-002 admin logs in and lands on /admin', async ({ page }) => {
        await logInAsAdmin(page);

        await page.reload();
        await expect(page).toHaveURL(/\/admin\/?$/);
    });

    test('ADM-032 no consent box on the login page', async ({ page }) => {
        await page.goto('/login');
        await expect(
            page.getByRole('button', { name: 'Log in', exact: true }),
        ).toBeVisible();
        await page.waitForLoadState('networkidle');
        await expect(consentDialog(page)).toBeHidden();
    });
});

test.describe('as the admin', () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    test('ADM-010 overview shows stats and the 30-day chart', async ({
        page,
    }) => {
        await page.goto('/admin');
        await expect(
            page.getByRole('heading', { level: 1 }).first(),
        ).toBeVisible();

        await expect(page.getByText(/accept/i).first()).toBeVisible();
        await expect(page.getByText(/declin/i).first()).toBeVisible();
        await expect(
            page
                .getByRole('img', { name: /30 days/i })
                .or(page.getByRole('figure', { name: /30 days/i }))
                .first(),
        ).toBeVisible();
    });

    test('ADM-032 no consent box on admin pages', async ({ page }) => {
        for (const path of ['/admin', '/admin/consents']) {
            await page.goto(path);
            await expect(
                page.getByRole('heading', { level: 1 }).first(),
            ).toBeVisible();
            await page.waitForLoadState('networkidle');
            await expect(consentDialog(page), path).toBeHidden();
        }
    });

    test('ADM-020 consents table lists rows and GUID search narrows to one', async ({
        page,
        browser,
        baseURL,
    }) => {
        const first = await acceptAsNewVisitor(browser, baseURL);
        const second = await acceptAsNewVisitor(browser, baseURL);

        await page.goto('/admin/consents');
        const table = consentsTable(page);
        await expect(table).toBeVisible();
        for (const header of [/guid/i, /version/i, /accepted/i]) {
            await expect(
                table.getByRole('columnheader', { name: header }),
            ).toBeVisible();
        }
        await expect(dataRows(table).first()).toBeVisible();

        await searchGuid(page, first);

        await expect(dataRows(table)).toHaveCount(1);
        await expect(dataRows(table).first()).toContainText(first);
        await expect(table).not.toContainText(second);
    });

    test('ADM-030 CSV export has the agreed header and honours the GUID filter', async ({
        page,
        browser,
        baseURL,
    }) => {
        const guid = await acceptAsNewVisitor(browser, baseURL);
        await acceptAsNewVisitor(browser, baseURL);

        await page.goto('/admin/consents');
        await searchGuid(page, guid);
        await expect(dataRows(consentsTable(page))).toHaveCount(1);

        const downloadPromise = page.waitForEvent('download');
        await page
            .getByRole('link', { name: /export/i })
            .or(page.getByRole('button', { name: /export/i }))
            .first()
            .click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.csv$/);

        const csv = await readFile(await download.path(), 'utf8');
        const lines = csv.replace(/^﻿/, '').trim().split(/\r?\n/);

        expect(lines[0]).toBe(
            'guid,version,accepted_at_utc,status,withdrawn_at,device_type,browser_family,os_family',
        );
        expect(lines).toHaveLength(2);
        expect(lines[1].startsWith(`${guid},`)).toBe(true);
    });
});
