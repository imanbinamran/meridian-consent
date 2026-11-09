import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { ADMIN_STORAGE_STATE, acceptAsNewVisitor } from './support/admin';
import { settleAnimations } from './support/consent';
import {
    REALTIME,
    fakeReverb,
    setRealtime,
    watchRefetches,
} from './support/live';

/**
 * The live admin overview. Case ids refer to tests/cases/admin.yaml. A fake
 * socket stands in for Reverb, so CI needs no server. Only the last test uses
 * a real one, and it runs only with E2E_REVERB=1.
 */

function indicator(page: Page): Locator {
    return page
        .getByRole('status')
        .filter({ hasText: /live|connecting|disconnected/i });
}

function totalAccepted(page: Page): Locator {
    return page
        .getByRole('heading', { name: 'Total accepted', level: 3 })
        .locator('xpath=../following-sibling::*[1]/p[1]');
}

async function readNumber(locator: Locator): Promise<number> {
    return Number((await locator.innerText()).replace(/\D/g, ''));
}

function collectPageErrors(page: Page): Error[] {
    const errors: Error[] = [];
    page.on('pageerror', (error) => errors.push(error));

    return errors;
}

async function seriousViolations(page: Page) {
    await settleAnimations(page);
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

    return results.violations
        .filter((violation) =>
            ['serious', 'critical'].includes(violation.impact ?? ''),
        )
        .map((violation) => violation.id);
}

test.describe('with a fake socket', () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    test('ADM-059 shows Live once subscribed and refetches only the numbers on a change', async ({
        page,
        browser,
        baseURL,
    }) => {
        const errors = collectPageErrors(page);
        const refetches = watchRefetches(page);
        await setRealtime(page, REALTIME);
        const reverb = await fakeReverb(page);

        await page.goto('/admin');
        await expect(indicator(page)).toHaveText(/^Live/);
        await expect(indicator(page)).toHaveAttribute('aria-live', 'polite');
        await page.waitForLoadState('networkidle');

        const before = await readNumber(totalAccepted(page));
        await acceptAsNewVisitor(browser, baseURL);
        reverb.announce();

        await expect
            .poll(() => readNumber(totalAccepted(page)))
            .toBeGreaterThan(before);
        expect(refetches.fields[0].split(',').sort()).toEqual([
            'chart',
            'recent',
            'stats',
        ]);
        await expect(page).toHaveURL(/\/admin\/?$/);
        expect(errors).toEqual([]);
    });

    test('ADM-060 a burst makes one refetch now and one after two seconds, and no more', async ({
        page,
    }) => {
        const refetches = watchRefetches(page);
        await setRealtime(page, REALTIME);
        const reverb = await fakeReverb(page);

        await page.goto('/admin');
        await expect(indicator(page)).toHaveText(/^Live/);
        await page.waitForLoadState('networkidle');

        for (let i = 0; i < 10; i++) {
            reverb.announce();
            await page.waitForTimeout(50);
        }

        await expect.poll(() => refetches.times.length).toBe(2);
        await page.waitForTimeout(2500);

        expect(refetches.times).toHaveLength(2);
        expect(refetches.times[1] - refetches.times[0]).toBeGreaterThanOrEqual(
            1900,
        );
    });

    test('ADM-060 a change during a slow refetch waits for it, then refetches', async ({
        page,
    }) => {
        const refetches = watchRefetches(page);
        await setRealtime(page, REALTIME);
        const reverb = await fakeReverb(page);
        let inFlight = 0;
        let most = 0;

        await page.route(/\/admin\/?$/, async (route) => {
            if (!route.request().headers()['x-inertia-partial-data']) {
                await route.fallback();
                return;
            }

            most = Math.max(most, ++inFlight);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            inFlight--;
            await route.continue();
        });

        await page.goto('/admin');
        await expect(indicator(page)).toHaveText(/^Live/);
        await page.waitForLoadState('networkidle');

        reverb.announce();
        await expect.poll(() => refetches.times.length).toBe(1);
        reverb.announce();

        await expect
            .poll(() => refetches.times.length, { timeout: 8000 })
            .toBe(2);
        expect(refetches.times[1] - refetches.times[0]).toBeGreaterThanOrEqual(
            2900,
        );
        expect(most).toBe(1);
    });

    test('ADM-059 shows Disconnected when the socket drops, then refetches on reconnect', async ({
        page,
    }) => {
        const errors = collectPageErrors(page);
        const refetches = watchRefetches(page);
        await setRealtime(page, REALTIME);
        const reverb = await fakeReverb(page);

        await page.goto('/admin');
        await expect(indicator(page)).toHaveText(/^Live/);
        await page.waitForLoadState('networkidle');
        expect(refetches.times).toHaveLength(0);

        await reverb.drop();
        await expect(indicator(page)).toHaveText(/^Disconnected/);
        await expect(
            page.getByRole('heading', { name: 'Total accepted' }),
        ).toBeVisible();

        reverb.allowReconnect();
        await expect(indicator(page)).toHaveText(/^Live/, { timeout: 30_000 });
        await expect.poll(() => refetches.times.length).toBe(1);
        expect(errors).toEqual([]);
    });

    test('ADM-059 leaving the page closes the socket', async ({ page }) => {
        await setRealtime(page, REALTIME);
        const reverb = await fakeReverb(page);

        await page.goto('/admin');
        await expect(indicator(page)).toHaveText(/^Live/);

        await page.getByRole('link', { name: 'Browse consents' }).click();
        await expect(page).toHaveURL(/\/admin\/consents/);
        await expect.poll(() => reverb.closed()).toBe(true);
    });

    for (const colorScheme of ['light', 'dark'] as const) {
        test(`ADM-059 the indicator fits 320px and passes axe in ${colorScheme} mode`, async ({
            page,
        }) => {
            await page.emulateMedia({ colorScheme });
            await page.setViewportSize({ width: 320, height: 800 });
            await setRealtime(page, REALTIME);
            const reverb = await fakeReverb(page);

            await page.goto('/admin');
            await expect(indicator(page)).toHaveText(/^Live/);
            await page.waitForLoadState('networkidle');
            expect(await seriousViolations(page)).toEqual([]);

            await reverb.drop();
            await expect(indicator(page)).toHaveText(/^Disconnected/);
            expect(await seriousViolations(page)).toEqual([]);

            const { scrollWidth, innerWidth } = await page.evaluate(() => ({
                scrollWidth: document.scrollingElement?.scrollWidth ?? 0,
                innerWidth: window.innerWidth,
            }));
            expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
        });
    }
});

test.describe('without a socket', () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    test('ADM-059 with no server to reach, it says Disconnected and the page still works', async ({
        page,
    }) => {
        const errors = collectPageErrors(page);
        await setRealtime(page, REALTIME);
        await page.route('**/broadcasting/auth', (route) => route.abort());

        await page.goto('/admin');

        await expect(indicator(page)).toHaveText(/^Disconnected/, {
            timeout: 30_000,
        });
        await expect(totalAccepted(page)).toBeVisible();
        await page.getByRole('link', { name: 'Browse consents' }).click();
        await expect(page).toHaveURL(/\/admin\/consents/);
        expect(errors).toEqual([]);
    });

    test('ADM-059 with live updates not set up, no indicator shows and no socket opens', async ({
        page,
    }) => {
        const errors = collectPageErrors(page);
        const sockets: string[] = [];
        page.on('websocket', (socket) => sockets.push(socket.url()));
        await setRealtime(page, null);

        await page.goto('/admin');
        await expect(totalAccepted(page)).toBeVisible();
        await page.waitForLoadState('networkidle');

        await expect(indicator(page)).toHaveCount(0);
        expect(sockets).toEqual([]);
        expect(errors).toEqual([]);
    });
});

test.describe('with a real Reverb server', () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });
    test.skip(
        process.env.E2E_REVERB !== '1',
        'Needs Reverb and a queue worker, with BROADCAST_CONNECTION=reverb. Set E2E_REVERB=1 to run it.',
    );

    test('ADM-061 an accept in one browser updates the overview in another', async ({
        page,
        browser,
        baseURL,
    }) => {
        await page.goto('/admin');
        await expect(indicator(page)).toHaveText(/^Live/, { timeout: 15_000 });

        const before = await readNumber(totalAccepted(page));
        await acceptAsNewVisitor(browser, baseURL);

        await expect
            .poll(() => readNumber(totalAccepted(page)), { timeout: 15_000 })
            .toBeGreaterThan(before);
    });
});
