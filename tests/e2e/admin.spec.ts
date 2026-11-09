import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
    ADMIN_STORAGE_STATE,
    VISITOR_DEVICE,
    acceptAsNewVisitor,
    chooseStatus,
    consentsTable,
    dataRows,
    logInAsAdmin,
    searchGuid,
} from './support/admin';
import {
    EXPIRED_CONSENT,
    consentDialog,
    settleAnimations,
} from './support/consent';

const CSV_HEADER =
    'guid,version,accepted_at_utc,status,withdrawn_at,device_type,browser_family,os_family';

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

    test('ADM-046 a signed-out visitor cannot open a record', async ({
        page,
        browser,
        baseURL,
    }) => {
        const guid = await acceptAsNewVisitor(browser, baseURL);

        await page.goto(`/admin/consents/${guid}`);

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.locator('body')).not.toContainText(guid);
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

        expect(lines[0]).toBe(CSV_HEADER);
        expect(lines).toHaveLength(2);
        expect(lines[1].startsWith(`${guid},`)).toBe(true);
    });

    test('ADM-041 a row shows its status and device', async ({
        page,
        browser,
        baseURL,
    }) => {
        const active = await acceptAsNewVisitor(browser, baseURL);
        const withdrawn = await acceptAsNewVisitor(browser, baseURL, {
            withdraw: true,
        });

        await page.goto('/admin/consents');
        const table = consentsTable(page);
        for (const header of ['Status', 'Device']) {
            await expect(
                table.getByRole('columnheader', { name: header, exact: true }),
            ).toBeVisible();
        }

        await searchGuid(page, active);
        await expect(dataRows(table)).toHaveCount(1);
        await expect(dataRows(table).first()).toContainText('Active');
        await expect(dataRows(table).first()).toContainText(VISITOR_DEVICE);

        await searchGuid(page, withdrawn);
        await expect(dataRows(table).first()).toContainText(withdrawn);
        await expect(dataRows(table).first()).toContainText('Withdrawn');
    });

    test('ADM-043 the status filter narrows the table and stays in the URL and paging', async ({
        page,
        browser,
        baseURL,
    }) => {
        const withdrawn = await acceptAsNewVisitor(browser, baseURL, {
            withdraw: true,
        });

        await page.goto('/admin/consents');
        const table = consentsTable(page);
        await searchGuid(page, withdrawn);
        await expect(dataRows(table)).toHaveCount(1);

        await chooseStatus(page, 'Active');
        await expect(page).toHaveURL(/status=active/);
        await expect(page.getByText('No consents match')).toBeVisible();

        await chooseStatus(page, 'Withdrawn');
        await expect(page).toHaveURL(/status=withdrawn/);
        await expect(dataRows(table)).toHaveCount(1);

        await page.reload();
        await expect(page.getByRole('combobox', { name: 'Status' })).toHaveText(
            'Withdrawn',
        );
        await expect(dataRows(table)).toHaveCount(1);

        await page.goto('/admin/consents?status=active');
        await page.getByRole('link', { name: 'Page 2', exact: true }).click();
        await expect(page).toHaveURL(/status=active/);
        await expect(page).toHaveURL(/page=2/);
        await expect(table).not.toContainText('Withdrawn');

        await page.getByRole('button', { name: 'Clear filters' }).click();
        await expect(page).not.toHaveURL(/status=/);
    });

    test.describe('in a browser far from Malaysia', () => {
        test.use({ timezoneId: 'America/New_York' });

        test('ADM-045 the record opens from the keyboard and shows its history in Malaysia time', async ({
            page,
            browser,
            baseURL,
        }) => {
            const guid = await acceptAsNewVisitor(browser, baseURL, {
                withdraw: true,
            });

            await page.goto('/admin/consents');
            await searchGuid(page, guid);
            const link = dataRows(consentsTable(page))
                .first()
                .getByRole('link', { name: `View record ${guid}` });
            await link.focus();
            await page.keyboard.press('Enter');

            await expect(page).toHaveURL(
                new RegExp(`/admin/consents/${guid}\\?search=${guid}$`),
            );
            await expect(
                page.getByRole('heading', { name: 'Consent record' }),
            ).toBeVisible();

            const detail = (term: string) =>
                page
                    .locator('dt', { hasText: new RegExp(`^${term}$`) })
                    .locator('+ dd');
            await expect(detail('GUID')).toContainText(guid);
            await expect(detail('Status')).toHaveText('Withdrawn');
            await expect(detail('Version')).toHaveText('v1');
            await expect(detail('Device')).toHaveText('Desktop');
            await expect(detail('Browser')).toHaveText('Chrome');
            await expect(detail('Operating system')).toHaveText('Windows');

            const events = page.getByRole('listitem').filter({
                has: page.locator('time'),
            });
            await expect(events).toHaveCount(2);
            await expect(events.nth(0)).toContainText('Accepted');
            await expect(events.nth(1)).toContainText('Withdrawn');

            const time = events.nth(0).locator('time');
            const iso = (await time.getAttribute('datetime')) as string;
            const malaysiaTime = await page.evaluate(
                (value) =>
                    new Intl.DateTimeFormat('en-MY', {
                        timeZone: 'Asia/Kuala_Lumpur',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                    }).format(new Date(value)),
                iso,
            );
            await expect(time).toHaveText(malaysiaTime);

            await page
                .getByRole('main')
                .getByRole('link', { name: 'Back to consents' })
                .click();
            await expect(page).toHaveURL(new RegExp(`search=${guid}`));
            await expect(dataRows(consentsTable(page))).toHaveCount(1);
        });
    });

    test('ADM-048 the CSV adds status and device columns and honours the status filter', async ({
        page,
        browser,
        baseURL,
    }) => {
        const guid = await acceptAsNewVisitor(browser, baseURL, {
            withdraw: true,
        });

        await page.goto('/admin/consents?status=withdrawn');
        await searchGuid(page, guid);
        await expect(dataRows(consentsTable(page))).toHaveCount(1);

        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: 'Export CSV' }).click();
        const download = await downloadPromise;

        const lines = (await readFile(await download.path(), 'utf8'))
            .trim()
            .split(/\r?\n/);

        expect(lines[0]).toBe(CSV_HEADER);
        expect(lines).toHaveLength(2);
        expect(lines[1]).toMatch(
            new RegExp(
                `^${guid},1,[^,]+Z,withdrawn,[^,]+Z,Desktop,Chrome,Windows$`,
            ),
        );
    });

    test('ADM-054 a consent past its lifetime reads Expired in the table, filter, record and CSV', async ({
        page,
    }) => {
        const { guid } = EXPIRED_CONSENT;

        await page.goto('/admin/consents');
        await chooseStatus(page, 'Expired');
        await expect(page).toHaveURL(/status=expired/);
        await searchGuid(page, guid);

        const row = dataRows(consentsTable(page)).first();
        await expect(row).toContainText(guid);
        await expect(row).toContainText('Expired');

        const response = await page.request.get(
            `/admin/consents/export?status=expired&search=${guid}`,
        );
        expect((await response.text()).trim().split(/\r?\n/)[1]).toBe(
            `${guid},1,${EXPIRED_CONSENT.accepted_at},expired,,Desktop,Chrome,Windows`,
        );

        await page.goto(`/admin/consents/${guid}`);
        await expect(
            page.locator('dt', { hasText: /^Status$/ }).locator('+ dd'),
        ).toHaveText('Expired');
    });

    test('ADM-049 the overview shows withdrawals and labelled device breakdowns', async ({
        page,
    }) => {
        await page.goto('/admin');

        await expect(page.getByText('Withdrawn, 30 days')).toBeVisible();

        const section = page.getByRole('region', {
            name: 'Accepted visitors only',
        });
        await expect(section).toContainText('Declines are anonymous');

        const percentages = await section
            .getByRole('list')
            .evaluateAll((lists) =>
                lists.map((list) => ({
                    labels: Array.from(list.children).map((item) =>
                        item.querySelector('span')?.textContent?.trim(),
                    ),
                    total: Array.from(
                        list.textContent?.matchAll(/([\d.]+)%/g) ?? [],
                    ).reduce((sum, match) => sum + Number(match[1]), 0),
                })),
            );

        expect(percentages).toHaveLength(2);
        for (const { labels, total } of percentages) {
            expect(labels).toContain('Unknown');
            expect(total).toBeCloseTo(100, 5);
        }
    });

    for (const colorScheme of ['light', 'dark'] as const) {
        for (const [label, width] of [
            ['320px', 320],
            ['desktop', 1280],
        ] as const) {
            test(`ADM-053 admin pages at ${label} in ${colorScheme} mode fit the screen and pass axe`, async ({
                page,
                browser,
                baseURL,
            }) => {
                const guid = await acceptAsNewVisitor(browser, baseURL, {
                    withdraw: true,
                });

                await page.emulateMedia({ colorScheme });
                await page.setViewportSize({ width, height: 800 });

                for (const path of [
                    '/admin',
                    '/admin/consents',
                    `/admin/consents/${guid}`,
                    '/admin/consents?status=expired',
                    `/admin/consents/${EXPIRED_CONSENT.guid}`,
                ]) {
                    await page.goto(path);
                    await expect(
                        page.getByRole('heading', { level: 1 }).first(),
                    ).toBeVisible();
                    await page.waitForLoadState('networkidle');
                    await settleAnimations(page);

                    const { scrollWidth, innerWidth } = await page.evaluate(
                        () => ({
                            scrollWidth:
                                document.scrollingElement?.scrollWidth ?? 0,
                            innerWidth: window.innerWidth,
                        }),
                    );
                    expect(scrollWidth, path).toBeLessThanOrEqual(innerWidth);

                    const results = await new AxeBuilder({ page })
                        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                        .analyze();
                    expect(
                        results.violations
                            .filter((violation) =>
                                ['serious', 'critical'].includes(
                                    violation.impact ?? '',
                                ),
                            )
                            .map((violation) => ({
                                id: violation.id,
                                targets: violation.nodes
                                    .map((node) => node.target.join(' '))
                                    .slice(0, 5),
                            })),
                        path,
                    ).toEqual([]);
                }
            });
        }
    }
});
