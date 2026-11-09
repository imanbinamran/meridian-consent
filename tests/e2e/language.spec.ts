import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
    acceptConsent,
    consentDialog,
    getCookie,
    settleAnimations,
    waitForCookie,
} from './support/consent';

/**
 * The EN/BM switch on the public site. Cases: tests/cases/language.yaml.
 */

const KOPITIAM_PATH = '/stories/the-quiet-return-of-the-neighbourhood-kopitiam';

const BM_PAGES = [
    { path: '/', heading: /Cerita yang membentuk Malaysia/ },
    { path: '/about', heading: /Bilik berita yang dibina/ },
    { path: '/privacy', heading: 'Dasar Privasi' },
    { path: '/terms', heading: 'Terma & Syarat' },
    { path: KOPITIAM_PATH, heading: /kopitiam/i },
] as const;

const html = (page: Page) => page.locator('html');

function bmButton(scope: Page | Locator): Locator {
    return scope.getByRole('button', { name: /Bahasa Melayu/ });
}

function bmDialog(page: Page): Locator {
    return page.getByRole('alertdialog', { name: 'Persetujuan kuki' });
}

async function expectMalay(page: Page): Promise<void> {
    await expect(html(page)).toHaveAttribute('lang', 'ms');
}

/** Use the switch the current screen size shows. */
async function switchToMalay(page: Page, isMobile: boolean): Promise<void> {
    if (isMobile) {
        await page.getByRole('button', { name: 'Open menu' }).click();
        await bmButton(page.getByRole('dialog')).click();
        await expectMalay(page);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();

        return;
    }

    await bmButton(page.getByRole('banner')).click();
    await expectMalay(page);
}

/** A visitor who accepted cookies, reading in Malay. */
async function malayReader(page: Page, isMobile: boolean, path = '/') {
    await page.goto(path);
    await acceptConsent(page);
    await switchToMalay(page, isMobile);
}

test('LNG-020 the consent box has its own switch and stays open', async ({
    page,
    context,
}) => {
    await page.goto('/');
    const dialog = consentDialog(page);
    await expect(dialog).toBeVisible();

    await bmButton(dialog).click();

    await expect(bmDialog(page)).toBeVisible();
    await expectMalay(page);
    await expect(
        bmDialog(page).getByRole('button', { name: 'Terima', exact: true }),
    ).toBeVisible();
    await expect(html(page)).toHaveClass(/consent-locked/);
    expect((await waitForCookie(context, 'locale')).value).toBe('ms');
    expect(await getCookie(context, 'consent')).toBeUndefined();

    await page.reload();
    await expect(bmDialog(page)).toBeVisible();
    await expectMalay(page);
});

test.describe('a browser set to Malay', () => {
    test.use({ locale: 'ms-MY' });

    test('LNG-021 sees English until the visitor chooses BM', async ({
        page,
        context,
    }) => {
        await page.goto('/');

        await expect(consentDialog(page)).toBeVisible();
        await expect(html(page)).toHaveAttribute('lang', 'en');
        expect(await getCookie(context, 'locale')).toBeUndefined();
    });
});

for (const { path, heading } of BM_PAGES) {
    test(`LNG-022 ${path} reads in BM and stays BM after a reload`, async ({
        page,
        isMobile,
    }) => {
        await malayReader(page, isMobile, path);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
            heading,
        );

        await page.reload();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
            heading,
        );
        await expectMalay(page);
        await expect(page.getByRole('contentinfo')).toContainText(
            'Tetapan kuki',
        );
    });
}

test('LNG-023 the date and figures follow the language', async ({
    page,
}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Header date bar');

    await malayReader(page, false);

    await expect(page.getByRole('banner').locator('time')).toHaveText(
        /Isnin|Selasa|Rabu|Khamis|Jumaat|Sabtu|Ahad/,
    );
    await expect(page.getByText('2.4J', { exact: true })).toBeVisible();
});

test('LNG-024 the headline still moves into the article in BM', async ({
    page,
}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Timing, desktop');

    await malayReader(page, false);
    const row = page.locator(`a[href$="${KOPITIAM_PATH}"]`).first();
    const headline = (await row.locator('.story-word').allTextContents()).join(
        ' ',
    );
    await page.evaluate(() => {
        const seen = new Set<string>();
        const win = window as unknown as { __groups: Set<string> };
        win.__groups = seen;

        const sample = () => {
            document.getAnimations().forEach((animation) => {
                const pseudo = (animation.effect as KeyframeEffect)
                    .pseudoElement;

                if (pseudo?.startsWith('::view-transition-group(w')) {
                    seen.add(pseudo);
                }
            });
            requestAnimationFrame(sample);
        };

        sample();
    });

    await row.click();

    await expect(page).toHaveURL(new RegExp(`${KOPITIAM_PATH}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(headline);
    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    (window as unknown as { __groups: Set<string> }).__groups
                        .size,
            ),
        )
        .toBeGreaterThanOrEqual(5);
});

test('LNG-025 a page fetched ahead in English is not shown after switching', async ({
    page,
    isMobile,
}) => {
    await page.goto('/');
    await acceptConsent(page);
    const row = page.locator(`a[href$="${KOPITIAM_PATH}"]`).first();

    // Hovering fetches the article ahead of the click, in English.
    if (!isMobile) {
        await row.hover();
        await page.waitForLoadState('networkidle');
    }

    await switchToMalay(page, isMobile);
    await row.click();

    await expect(page).toHaveURL(new RegExp(`${KOPITIAM_PATH}$`));
    await expect(page.getByText('Cerita contoh.')).toBeVisible();
});

test('LNG-026 going Back after switching shows the new language', async ({
    page,
    isMobile,
}) => {
    await page.goto('/');
    await acceptConsent(page);
    await page.locator(`a[href$="${KOPITIAM_PATH}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${KOPITIAM_PATH}$`));
    await switchToMalay(page, isMobile);

    await page.goBack();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        /Cerita yang membentuk Malaysia/,
    );
});

test('LNG-027 sign-in stays in English after reading in BM', async ({
    page,
    isMobile,
}) => {
    await malayReader(page, isMobile);

    await page
        .getByRole('contentinfo')
        .getByRole('link', { name: 'Log masuk kakitangan' })
        .click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
        page.getByRole('button', { name: 'Log in', exact: true }),
    ).toBeVisible();
    await expect(html(page)).toHaveAttribute('lang', 'en');
});

test('LNG-028 accepting in BM thanks the visitor in BM', async ({ page }) => {
    await page.goto('/');
    await bmButton(consentDialog(page)).click();
    await bmDialog(page)
        .getByRole('button', { name: 'Terima', exact: true })
        .click();

    await expect(
        page.getByText('Pilihan kuki anda telah disimpan'),
    ).toBeVisible();
    await expect(bmDialog(page)).toBeHidden();
});

test.describe('at 320px', () => {
    test.use({ viewport: { width: 320, height: 640 } });

    for (const { path } of BM_PAGES) {
        test(`LNG-029 ${path} has no sideways scroll in BM`, async ({
            page,
        }) => {
            await page.goto(path);
            await bmButton(consentDialog(page)).click();
            await expect(bmDialog(page)).toBeVisible();
            await settleAnimations(page);

            const overflowWithBox = await page.evaluate(
                () =>
                    (document.scrollingElement?.scrollWidth ?? 0) -
                    window.innerWidth,
            );

            expect(overflowWithBox).toBeLessThanOrEqual(0);

            await bmDialog(page)
                .getByRole('button', { name: 'Terima', exact: true })
                .click();
            await expect(bmDialog(page)).toBeHidden();

            const overflow = await page.evaluate(
                () =>
                    (document.scrollingElement?.scrollWidth ?? 0) -
                    window.innerWidth,
            );

            expect(overflow).toBeLessThanOrEqual(0);
        });
    }
});

test('LNG-031 the back to top button follows the language', async ({
    page,
    isMobile,
}) => {
    await malayReader(page, isMobile, '/privacy');
    await page.evaluate(() => scrollTo(0, 1200));

    await expect(
        page.getByRole('button', { name: 'Kembali ke atas' }),
    ).toBeVisible();
});

test('LNG-030 the BM consent box has no serious accessibility issues', async ({
    page,
}) => {
    await page.goto('/');
    await bmButton(consentDialog(page)).click();
    await expect(bmDialog(page)).toBeVisible();
    await settleAnimations(page);

    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
    const serious = results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => v.id);

    expect(serious).toEqual([]);
});
