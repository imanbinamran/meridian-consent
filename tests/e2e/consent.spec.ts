import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ADMIN_STORAGE_STATE } from './support/admin';
import {
    ACCEPTED_COOKIE,
    COPY,
    DAY_SECONDS,
    DECLINED_COOKIE,
    EXPIRED_CONSENT,
    ISO_UTC,
    PUBLIC_PAGES,
    UUID_V4,
    acceptConsent,
    addAcceptedCookie,
    consentDialog,
    declineConsent,
    decodeCookieValue,
    expectConsentBox,
    expectDockedConsentBox,
    expectNoConsentBox,
    getCookie,
    nowSeconds,
    parseAcceptedCookie,
    settleAnimations,
    waitForCookie,
    waitForPublicPage,
} from './support/consent';

/**
 * Consent box behaviour. Case ids refer to tests/cases/consent.yaml.
 * Every test gets a fresh browser context, so it starts with no cookies.
 *
 * Not here on purpose: raising CONSENT_VERSION (CON-043) needs a config
 * change per test, so Pest covers it. The version 0 test below is the
 * browser-side half of the same rule.
 */

const CLOCK_TOLERANCE_MS = 30_000;

async function scrollOverflow(page: Page) {
    return page.evaluate(() => ({
        html: getComputedStyle(document.documentElement).overflowY,
        body: getComputedStyle(document.body).overflowY,
    }));
}

test.describe('first visit', () => {
    for (const { path, name } of PUBLIC_PAGES) {
        test(`CON-001/010 ${name} (${path}) loads and shows the consent box`, async ({
            page,
        }) => {
            const response = await page.goto(path);
            expect(response?.status()).toBe(200);
            // The open box makes the page behind it inert (hidden from the
            // accessibility tree), so look for the heading including hidden.
            await expect(
                page
                    .getByRole('heading', { level: 1, includeHidden: true })
                    .first(),
            ).toBeAttached();
            await expectConsentBox(page);
        });
    }

    test('CON-011 box shows the required copy word for word', async ({
        page,
    }) => {
        await page.goto('/');
        const dialog = await expectConsentBox(page);
        const text = (await dialog.innerText()).replace(/\s+/g, ' ');

        expect(text).toContain(COPY.first);
        expect(text).toContain(COPY.second);
    });

    test('CON-012 box links go to the Terms and Privacy pages', async ({
        page,
    }) => {
        await page.goto('/');
        const dialog = await expectConsentBox(page);

        const termsLink = dialog.getByRole('link', {
            name: 'Terms & Conditions',
            exact: true,
        });
        const privacyLink = dialog.getByRole('link', {
            name: 'Privacy Statement',
            exact: true,
        });
        await expect(termsLink).toHaveAttribute('href', /\/terms$/);
        await expect(privacyLink).toHaveAttribute('href', /\/privacy$/);

        await termsLink.click();
        await expect(page).toHaveURL(/\/terms$/);
        await expectDockedConsentBox(page);

        await page.goBack();
        await expect(page).toHaveURL(/\/$/);
        await consentDialog(page)
            .getByRole('link', { name: 'Privacy Statement', exact: true })
            .click();
        await expect(page).toHaveURL(/\/privacy$/);
        await expectDockedConsentBox(page);
    });
});

test.describe('reading Terms or Privacy before choosing', () => {
    const html = (page: Page) => page.locator('html');

    async function followTermsLink(page: Page) {
        await page.goto('/');
        await expectConsentBox(page);
        await consentDialog(page)
            .getByRole('link', { name: 'Terms & Conditions', exact: true })
            .click();
        await expect(page).toHaveURL(/\/terms$/);
        await expect(html(page)).not.toHaveClass(/consent-locked/);
    }

    test('CON-013 following a box link docks the box and the page scrolls', async ({
        page,
    }) => {
        const viewport = page.viewportSize() ?? { width: 1280, height: 800 };
        await page.setViewportSize({ width: viewport.width, height: 500 });
        await followTermsLink(page);

        const dialog = await expectDockedConsentBox(page);
        await expect(page.locator('main')).not.toHaveAttribute('inert');
        await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);

        await page.mouse.move(viewport.width / 2, 100);
        await expect
            .poll(async () => {
                await page.mouse.wheel(0, 600);

                return page.evaluate(() => window.scrollY);
            })
            .toBeGreaterThan(0);

        // Still pinned in view, and nothing recorded until they choose.
        await expect(dialog).toBeInViewport();
        expect(
            await getCookie(page.context(), ACCEPTED_COOKIE),
        ).toBeUndefined();
        expect(
            await getCookie(page.context(), DECLINED_COOKIE),
        ).toBeUndefined();
    });

    test('CON-014 the bottom of the page is not hidden by the docked box', async ({
        page,
    }) => {
        await followTermsLink(page);
        await expectDockedConsentBox(page);
        await page.evaluate(() =>
            window.scrollTo(0, document.documentElement.scrollHeight),
        );

        const footer = await page.locator('footer').last().boundingBox();
        const box = await consentDialog(page).boundingBox();

        expect(footer && box).toBeTruthy();
        expect(footer!.y + footer!.height).toBeLessThanOrEqual(box!.y + 1);
    });

    for (const [label, leave] of [
        ['going back', (page: Page) => page.goBack()],
        ['refreshing', (page: Page) => page.reload()],
    ] as const) {
        test(`CON-015 ${label} brings back the full box and the lock`, async ({
            page,
        }) => {
            await followTermsLink(page);
            await expectDockedConsentBox(page);
            await leave(page);

            await expect(page.locator('[role="alertdialog"]')).toBeVisible();
            await expect(html(page)).toHaveClass(/consent-locked/);
        });
    }

    for (const [label, choose, cookie] of [
        ['Accept', 'Accept', ACCEPTED_COOKIE],
        ['Decline', 'Decline', DECLINED_COOKIE],
    ] as const) {
        test(`CON-016 ${label} from the docked box records the choice`, async ({
            page,
            context,
        }) => {
            await followTermsLink(page);
            const dialog = await expectDockedConsentBox(page);
            await dialog
                .getByRole('button', { name: choose, exact: true })
                .click();

            await waitForCookie(context, cookie);
            await expectNoConsentBox(page);
            await expect(page).toHaveURL(/\/terms$/);

            await page.goto('/');
            await waitForPublicPage(page);
            await expectNoConsentBox(page);
        });
    }

    test('CON-018 the docked box has no serious accessibility issues', async ({
        page,
    }) => {
        await followTermsLink(page);
        await expectDockedConsentBox(page);
        await settleAnimations(page);

        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
        const serious = results.violations
            .filter((v) => v.impact === 'serious' || v.impact === 'critical')
            .map((v) => v.id);

        expect(serious).toEqual([]);
    });

    test('CON-017 a link in the reopened box closes it so the page can be read', async ({
        page,
    }) => {
        await page.goto('/');
        await acceptConsent(page);
        await page
            .getByRole('button', { name: 'Cookie settings' })
            .first()
            .click();
        const dialog = await expectConsentBox(page);

        await dialog
            .getByRole('link', { name: 'Terms & Conditions', exact: true })
            .click();
        await expect(page).toHaveURL(/\/terms$/);
        await expectNoConsentBox(page);
    });
});

test.describe('scroll lock and dismissal', () => {
    test('CON-020 page cannot scroll while the box is open', async ({
        page,
    }) => {
        await page.goto('/privacy');
        await expectConsentBox(page);

        await page.mouse.move(20, 20);
        await page.mouse.wheel(0, 1500);
        await page.keyboard.press('End');
        await page.keyboard.press('PageDown');
        // Give a smooth scroll time to move, if it was going to.
        await page.waitForTimeout(400);

        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        const overflow = await scrollOverflow(page);
        expect(
            [overflow.html, overflow.body].some((value) =>
                ['hidden', 'clip'].includes(value),
            ),
            `html or body overflow-y should be hidden, got ${JSON.stringify(overflow)}`,
        ).toBe(true);
    });

    test('CON-021 scrolling works again after Accept', async ({ page }) => {
        const viewport = page.viewportSize() ?? { width: 1280, height: 800 };
        // A short window guarantees the page is taller than the viewport.
        await page.setViewportSize({ width: viewport.width, height: 400 });
        await page.goto('/privacy');
        await acceptConsent(page);

        await expect
            .poll(async () => (await scrollOverflow(page)).body)
            .not.toBe('hidden');

        await page.mouse.move(viewport.width / 2, 200);
        await expect
            .poll(async () => {
                await page.mouse.wheel(0, 600);

                return page.evaluate(() => window.scrollY);
            })
            .toBeGreaterThan(0);
    });

    test('CON-022 Escape and clicking outside do not close the box', async ({
        page,
        context,
    }) => {
        await page.goto('/');
        const dialog = await expectConsentBox(page);

        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
        await expect(dialog).toBeVisible();

        await page.mouse.click(5, 5);
        await page.waitForTimeout(400);
        await expect(dialog).toBeVisible();

        expect(await getCookie(context, ACCEPTED_COOKIE)).toBeUndefined();
        expect(await getCookie(context, DECLINED_COOKIE)).toBeUndefined();
    });
});

test.describe('accept', () => {
    test('CON-030/031 Accept sets a readable consent cookie that lasts a year', async ({
        page,
        context,
    }) => {
        await page.goto('/');
        const before = Date.now();
        const dialog = await expectConsentBox(page);
        await dialog
            .getByRole('button', { name: 'Accept', exact: true })
            .click();
        await expect(dialog).toBeHidden();

        const cookie = await waitForCookie(context, ACCEPTED_COOKIE);
        expect(cookie.httpOnly).toBe(true);
        const value = parseAcceptedCookie(cookie);

        expect(Object.keys(value).sort()).toEqual([
            'accepted_at',
            'guid',
            'version',
        ]);
        expect(value.guid).toMatch(UUID_V4);
        expect(value.version).toBe(1);
        expect(value.accepted_at).toMatch(ISO_UTC);
        const acceptedAt = Date.parse(value.accepted_at);
        expect(Math.abs(acceptedAt - before)).toBeLessThan(CLOCK_TOLERANCE_MS);

        // Expires one year out, give or take a day; never a session cookie.
        expect(cookie.expires).toBeGreaterThan(0);
        const expected = nowSeconds() + 365 * DAY_SECONDS;
        expect(Math.abs(cookie.expires - expected)).toBeLessThanOrEqual(
            DAY_SECONDS,
        );
    });

    test('CON-033 after Accept the box stays hidden on reload and other pages', async ({
        page,
        context,
    }) => {
        await page.goto('/');
        const accepted = await acceptConsent(page);

        await page.reload();
        await expectNoConsentBox(page);
        const afterReload = parseAcceptedCookie(
            await waitForCookie(context, ACCEPTED_COOKIE),
        );
        expect(afterReload.guid).toBe(accepted.guid);

        await page.goto('/about');
        await expectNoConsentBox(page);
    });
});

test.describe('accept cookie missing, expired or invalid', () => {
    test('CON-040 clearing cookies after Accept brings the box back', async ({
        page,
        context,
    }) => {
        await page.goto('/');
        await acceptConsent(page);

        await context.clearCookies();
        await page.reload();
        await expectConsentBox(page);
    });

    test('CON-041 an expired consent cookie brings the box back', async ({
        page,
        context,
        baseURL,
    }) => {
        const value = JSON.stringify({
            guid: crypto.randomUUID(),
            accepted_at: new Date(Date.now() - 2 * DAY_SECONDS * 1000)
                .toISOString()
                .replace(/\.\d{3}Z$/, 'Z'),
            version: 1,
        });
        await addAcceptedCookie(context, baseURL as string, value, -3600);

        await page.goto('/');
        await expectConsentBox(page);
    });

    test('CON-041 a cookie matching a real row accepted over a year ago brings the box back', async ({
        page,
        context,
        browser,
        baseURL,
    }) => {
        // The row is really there and everything but its age matches the
        // cookie, so the one-year rule is what brings the box back.
        const admin = await browser.newContext({
            baseURL,
            storageState: ADMIN_STORAGE_STATE,
        });
        const adminPage = await admin.newPage();
        await adminPage.goto(`/admin/consents/${EXPIRED_CONSENT.guid}`);
        await expect(
            adminPage.locator('dt', { hasText: /^Status$/ }).locator('+ dd'),
        ).toHaveText('Expired');
        await admin.close();

        await addAcceptedCookie(
            context,
            baseURL as string,
            JSON.stringify(EXPIRED_CONSENT),
            30 * DAY_SECONDS,
        );

        await page.goto('/');
        await expectConsentBox(page);
    });

    const tampered = [
        { label: 'not JSON', value: 'not-json' },
        {
            label: 'bad GUID',
            value: JSON.stringify({
                guid: 'abc',
                accepted_at: new Date().toISOString(),
                version: 1,
            }),
        },
        { label: 'missing fields', value: JSON.stringify({ version: 1 }) },
    ];

    for (const { label, value } of tampered) {
        test(`CON-042 a tampered consent cookie (${label}) brings the box back`, async ({
            page,
            context,
            baseURL,
        }) => {
            await addAcceptedCookie(
                context,
                baseURL as string,
                value,
                30 * DAY_SECONDS,
            );

            await page.goto('/');
            await expectConsentBox(page);
        });
    }

    test('CON-072 a well-formed cookie with no database row brings the box back', async ({
        page,
        context,
        baseURL,
    }) => {
        const value = JSON.stringify({
            guid: crypto.randomUUID(),
            accepted_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
            version: 1,
        });
        await addAcceptedCookie(
            context,
            baseURL as string,
            value,
            30 * DAY_SECONDS,
        );

        await page.goto('/');
        await expectConsentBox(page);
    });

    test('CON-073 Accept with a forged cookie replaces its GUID', async ({
        page,
        context,
        baseURL,
    }) => {
        const forgedGuid = crypto.randomUUID();
        await addAcceptedCookie(
            context,
            baseURL as string,
            JSON.stringify({
                guid: forgedGuid,
                accepted_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
                version: 99,
            }),
            30 * DAY_SECONDS,
        );

        await page.goto('/');
        const dialog = await expectConsentBox(page);
        await dialog
            .getByRole('button', { name: 'Accept', exact: true })
            .click();
        await expect(dialog).toBeHidden();

        await expect
            .poll(
                async () =>
                    parseAcceptedCookie(
                        await waitForCookie(context, ACCEPTED_COOKIE),
                    ).guid,
            )
            .not.toBe(forgedGuid);
        const accepted = parseAcceptedCookie(
            await waitForCookie(context, ACCEPTED_COOKIE),
        );
        expect(accepted.guid).toMatch(UUID_V4);
        expect(accepted.version).toBe(1);

        await page.reload();
        await expectNoConsentBox(page);
    });

    test('CON-043 (browser half) a cookie from an older version brings the box back', async ({
        page,
        context,
        baseURL,
    }) => {
        const value = JSON.stringify({
            guid: crypto.randomUUID(),
            accepted_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
            version: 0,
        });
        await addAcceptedCookie(
            context,
            baseURL as string,
            value,
            30 * DAY_SECONDS,
        );

        await page.goto('/');
        await expectConsentBox(page);
    });
});

test.describe('decline', () => {
    test('CON-050 Decline sets a consent_declined cookie that lasts one day', async ({
        page,
        context,
    }) => {
        await page.goto('/');
        const before = Date.now();
        const cookie = await declineConsent(page);

        expect(cookie.httpOnly).toBe(true);
        const value = decodeCookieValue(cookie.value);
        expect(value).toMatch(ISO_UTC);
        expect(Math.abs(Date.parse(value) - before)).toBeLessThan(
            CLOCK_TOLERANCE_MS,
        );

        expect(cookie.expires).toBeGreaterThan(0);
        const expected = nowSeconds() + DAY_SECONDS;
        expect(Math.abs(cookie.expires - expected)).toBeLessThanOrEqual(
            DAY_SECONDS,
        );

        expect(await getCookie(context, ACCEPTED_COOKIE)).toBeUndefined();
    });

    test('CON-051 box stays hidden while the decline cookie is present', async ({
        page,
        context,
    }) => {
        await page.goto('/');
        const declined = await declineConsent(page);

        await page.reload();
        await expectNoConsentBox(page);
        expect((await getCookie(context, DECLINED_COOKIE))?.value).toBe(
            declined.value,
        );
    });

    test('CON-052 box comes back once the decline cookie is cleared', async ({
        page,
        context,
    }) => {
        await page.goto('/');
        await declineConsent(page);

        await context.clearCookies();
        await page.reload();
        await expectConsentBox(page);
    });

    test('CON-052 box comes back once the decline cookie has expired', async ({
        page,
        context,
        baseURL,
    }) => {
        await context.addCookies([
            {
                name: DECLINED_COOKIE,
                value: encodeURIComponent(
                    new Date(Date.now() - 2 * DAY_SECONDS * 1000).toISOString(),
                ),
                url: baseURL as string,
                expires: Math.floor(nowSeconds()) - 3600,
                sameSite: 'Lax',
            },
        ]);

        await page.goto('/');
        await expectConsentBox(page);
    });
});

test.describe('withdrawing consent', () => {
    test('CON-083 a cookie replayed after withdrawing brings the box back', async ({
        page,
        context,
        baseURL,
    }) => {
        await page.goto('/');
        await acceptConsent(page);
        const accepted = await waitForCookie(context, ACCEPTED_COOKIE);
        await waitForPublicPage(page);

        await page
            .getByRole('contentinfo')
            .getByRole('button', { name: 'Cookie settings' })
            .click();
        await declineConsent(page);
        await expect
            .poll(() => getCookie(context, ACCEPTED_COOKIE))
            .toBeUndefined();

        await context.clearCookies({ name: DECLINED_COOKIE });
        await addAcceptedCookie(
            context,
            baseURL as string,
            decodeCookieValue(accepted.value),
            30 * DAY_SECONDS,
        );

        await page.reload();
        await expectConsentBox(page);
    });
});

test.describe('privacy statement', () => {
    test('CON-090 says what device details we keep and what withdrawing does', async ({
        page,
    }) => {
        await page.goto('/privacy');
        const main = page.locator('body');

        await expect(main).toContainText('Browser family');
        await expect(main).toContainText('Device type');
        await expect(main).toContainText('Operating system family');
        await expect(main).toContainText('mark your record in our database as');
        await expect(main).not.toContainText('IP address or device');
    });

    test('CON-093 says the session record exists and claims nothing it cannot back up', async ({
        page,
    }) => {
        await page.goto('/privacy');
        const main = page.locator('body');

        await expect(main).toContainText('session record in our database');
        await expect(main).toContainText('browser header (user agent)');
        await expect(main).toContainText(
            'This session record is separate from your consent record',
        );
        await expect(main).toContainText('work out the broad device details');
        await expect(main).not.toContainText('we keep only the time');
        await expect(main).not.toContainText('could identify you');
        await expect(main).not.toContainText('only to deliver the site');
    });
});

test.describe('cookie settings', () => {
    test('CON-060 footer Cookie settings reopens the box after a choice', async ({
        page,
    }) => {
        await page.goto('/');
        await acceptConsent(page);
        await waitForPublicPage(page);

        await page
            .getByRole('contentinfo')
            .getByRole('button', { name: 'Cookie settings' })
            .click();
        await expectConsentBox(page);
    });
});
