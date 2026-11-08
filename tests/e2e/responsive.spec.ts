import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
    PUBLIC_PAGES,
    acceptConsent,
    expectConsentBox,
    waitForPublicPage,
} from './support/consent';

/**
 * CON-002 and CON-003: the site at 375px wide. Runs in both projects; the
 * viewport is pinned so the result does not depend on the device profile.
 */

test.use({ viewport: { width: 375, height: 812 } });

async function horizontalOverflow(page: Page) {
    return page.evaluate(() => ({
        scrollWidth: document.scrollingElement?.scrollWidth ?? 0,
        innerWidth: window.innerWidth,
    }));
}

for (const { path, name } of PUBLIC_PAGES) {
    test(`CON-002 ${name} (${path}) has no horizontal scroll at 375px`, async ({
        page,
    }) => {
        await page.goto(path);
        await expectConsentBox(page);

        const withBox = await horizontalOverflow(page);
        expect(
            withBox.scrollWidth,
            'with the consent box open',
        ).toBeLessThanOrEqual(withBox.innerWidth);

        await acceptConsent(page);
        await waitForPublicPage(page);

        const afterAccept = await horizontalOverflow(page);
        expect(afterAccept.scrollWidth, 'after accepting').toBeLessThanOrEqual(
            afterAccept.innerWidth,
        );
    });
}

test('CON-003 mobile menu opens and links to the other pages', async ({
    page,
}) => {
    await page.goto('/');
    await acceptConsent(page);
    await waitForPublicPage(page);

    await page.getByRole('button', { name: /menu/i }).click();

    // The menu opens as a sheet (dialog) or a labelled mobile navigation.
    const menu = page
        .getByRole('dialog')
        .or(page.getByRole('navigation', { name: /mobile|menu/i }))
        .first();
    await expect(menu).toBeVisible();

    for (const name of [/about/i, /privacy/i, /terms/i]) {
        await expect(menu.getByRole('link', { name })).toBeVisible();
    }

    await menu.getByRole('link', { name: /about/i }).click();
    await expect(page).toHaveURL(/\/about$/);
});
