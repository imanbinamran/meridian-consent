import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
    acceptConsent,
    declineConsent,
    expectConsentBox,
    settleAnimations,
    waitForPublicPage,
} from './support/consent';

/**
 * Article pages and reading motion. Cases: tests/cases/stories.yaml.
 */

const KOPITIAM = 'the-quiet-return-of-the-neighbourhood-kopitiam';
const KOPITIAM_TITLE = 'The quiet return of the neighbourhood kopitiam';
const KOPITIAM_PATH = `/stories/${KOPITIAM}`;
const STORAGE_KEY = 'meridian.reading';

const SLUGS = [
    'why-penangs-chip-boom-is-finally-reaching-the-factory-floor',
    'flood-season-explained-what-has-changed-since-the-2021-floods',
    KOPITIAM,
    'inside-the-ipoh-studio-reviving-hand-painted-cinema-posters',
    'kampung-to-cloud-the-quiet-digitisation-of-rural-sabah',
];

async function accepted(page: Page, path: string) {
    await page.goto(path);
    await acceptConsent(page);
    await waitForPublicPage(page);
    await settleAnimations(page);
}

const row = (page: Page) =>
    page.getByRole('link', { name: new RegExp(KOPITIAM_TITLE) }).first();

const heading = (page: Page) => page.getByRole('heading', { level: 1 });

async function scrollToSection(page: Page, id: string) {
    await page.evaluate((target) => {
        const element = document.getElementById(target);

        if (element) {
            scrollTo(
                0,
                element.getBoundingClientRect().top +
                    scrollY -
                    innerHeight * 0.4,
            );
        }
    }, id);
    await page.waitForTimeout(200);
}

async function scrollToEnd(page: Page) {
    await page.evaluate(() =>
        document
            .getElementById('story-end')
            ?.scrollIntoView({ block: 'center' }),
    );
}

const stored = (page: Page) =>
    page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);

test('STR-010 clicking a story moves its headline into the article', async ({
    page,
}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Timing, desktop');

    await accepted(page, '/');
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

    await row(page).click();
    await expect(page).toHaveURL(new RegExp(`${KOPITIAM_PATH}$`));
    await expect(heading(page)).toHaveText(KOPITIAM_TITLE);
    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    (window as unknown as { __groups: Set<string> }).__groups
                        .size,
            ),
        )
        .toBeGreaterThanOrEqual(7);
    await expect
        .poll(
            () =>
                page.evaluate(() =>
                    document.documentElement.classList.contains('story-morph'),
                ),
            { timeout: 2_000 },
        )
        .toBe(false);
    await expect(heading(page)).toBeFocused();
});

test('STR-011 browser Back returns to the same place on the home page', async ({
    page,
}) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await accepted(page, '/');
    await row(page).scrollIntoViewIfNeeded();
    // A person pauses before clicking; Inertia records scroll after a short debounce.
    await page.waitForTimeout(300);

    const before = await page.evaluate(() => scrollY);

    await row(page).click();
    await expect(page).toHaveURL(new RegExp(`${KOPITIAM_PATH}$`));
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(row(page)).toBeInViewport();
    await expect
        .poll(() => page.evaluate(() => scrollY))
        .toBeGreaterThanOrEqual(before - 40);
    expect(await page.evaluate(() => scrollY)).toBeLessThanOrEqual(before + 40);
});

test('STR-012 a direct article link shows the consent box and locks scrolling', async ({
    page,
}) => {
    await page.goto(KOPITIAM_PATH);
    await expectConsentBox(page);
    await page.mouse.move(100, 100);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('STR-013 text stays still while the reader scrolls', async ({
    page,
}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Wheel, desktop');

    await accepted(page, KOPITIAM_PATH);
    await page.evaluate(async () => {
        await document.fonts.ready;

        const win = window as unknown as { __shift: number };
        win.__shift = 0;
        new PerformanceObserver((list) =>
            list
                .getEntries()
                .forEach(
                    (entry) =>
                        (win.__shift += (
                            entry as unknown as { value: number }
                        ).value),
                ),
        ).observe({ type: 'layout-shift' });
    });
    await page.mouse.move(640, 400);

    for (let step = 0; step < 30; step++) {
        await page.mouse.wheel(0, 160);
        await page.waitForTimeout(40);

        const moving = await page.evaluate(
            () =>
                [...document.querySelectorAll('.story-body p')].filter(
                    (element) => {
                        const style = getComputedStyle(element);

                        return (
                            style.transform !== 'none' ||
                            style.opacity !== '1' ||
                            element.getAnimations().length > 0
                        );
                    },
                ).length,
        );

        expect(moving).toBe(0);
    }

    expect(
        await page.evaluate(
            () => (window as unknown as { __shift: number }).__shift,
        ),
    ).toBeLessThan(0.001);
});

test('STR-014 the margin line tracks progress, section and time left', async ({
    page,
}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Wide layout');

    await page.setViewportSize({ width: 1280, height: 800 });
    await accepted(page, KOPITIAM_PATH);
    await scrollToSection(page, 'what-stays');

    const rail = page.getByRole('navigation', {
        name: 'Sections of this story',
    });

    await expect(rail.locator('a[aria-current="true"]')).toHaveText(
        'What stays',
    );

    const fill = await rail.locator('.story-rail-fill').evaluate((element) => {
        const box = element.getBoundingClientRect();
        const parent = element.parentElement!.getBoundingClientRect();

        return box.height / parent.height;
    });

    expect(fill).toBeGreaterThan(0.2);
    expect(fill).toBeLessThan(0.8);
    await expect(rail.locator('.story-rail-left')).toHaveText(
        /^[1-3] min left$/,
    );
});

test('STR-015 on a phone the line folds into a bar under the header', async ({
    page,
}) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await accepted(page, KOPITIAM_PATH);
    await scrollToSection(page, 'the-handover');

    const bar = page.locator('.story-rail');
    const barBox = await bar.boundingBox();
    const headerBox = await page.locator('.site-header').boundingBox();

    expect(
        Math.abs(barBox!.y - (headerBox!.y + headerBox!.height)),
    ).toBeLessThan(2);
    expect(barBox!.width).toBeGreaterThan(300);
    await expect(bar.locator('.story-rail-now')).toContainText('The handover');
    await expect(bar.locator('.story-rail-now')).toContainText(/\d min left/);
});

test('STR-016 reaching the last line shows the end and the next story', async ({
    page,
}) => {
    await accepted(page, KOPITIAM_PATH);
    await scrollToEnd(page);
    await expect(page.getByText(/on this story/)).toBeVisible();

    const next = page.getByRole('link', {
        name: /Inside the Ipoh studio reviving hand-painted cinema posters/,
    });

    await next.scrollIntoViewIfNeeded();
    await expect(next).toBeVisible();
    await next.click();
    await expect(page).toHaveURL(/inside-the-ipoh-studio/);
    await expect(heading(page)).toHaveText(
        'Inside the Ipoh studio reviving hand-painted cinema posters',
    );
});

test('STR-017 accepting saves the position and it can be resumed', async ({
    page,
}) => {
    await accepted(page, KOPITIAM_PATH);
    await scrollToSection(page, 'who-its-for');
    await expect
        .poll(async () => {
            const value = JSON.parse((await stored(page)) ?? '{}') as Record<
                string,
                { progress: number }
            >;

            return value[KOPITIAM]?.progress ?? 0;
        })
        .toBeGreaterThan(0.2);

    await page.goto('/');
    await waitForPublicPage(page);
    await expect(row(page)).toContainText('pick up where you left off');
    await row(page).click();
    await expect(page).toHaveURL(new RegExp(`${KOPITIAM_PATH}$`));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
});

test('STR-018 declining removes the saved position and nothing more is saved', async ({
    page,
}) => {
    await accepted(page, KOPITIAM_PATH);
    await scrollToSection(page, 'what-stays');
    await expect.poll(() => stored(page)).not.toBeNull();

    await page.getByRole('button', { name: 'Cookie settings' }).click();
    await declineConsent(page);
    await expect.poll(() => stored(page)).toBeNull();

    await scrollToSection(page, 'closing-time');
    await page.waitForTimeout(300);
    expect(await stored(page)).toBeNull();
});

test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('STR-019 nothing travels and everything shows', async ({ page }) => {
        await accepted(page, '/');
        await row(page).click();
        await expect(heading(page)).toHaveText(KOPITIAM_TITLE);
        await scrollToSection(page, 'what-stays');

        await expect(page.locator('.story-rail-globe')).toBeHidden();
        expect(
            await page
                .locator('.story-rail')
                .evaluate((element) =>
                    parseFloat(
                        (element as HTMLElement).style.getPropertyValue(
                            '--progress',
                        ),
                    ),
                ),
        ).toBeGreaterThan(0);

        await scrollToEnd(page);

        const next = page.locator('.story-finish-part').nth(1);

        await expect(next).toHaveCSS('opacity', '1');
        await expect(page.locator('.story-rule').first()).toHaveCSS(
            'transform',
            'none',
        );
    });
});

for (const mode of ['light', 'dark', 'rtl'] as const) {
    test(`STR-020 every story fits 320px wide (${mode})`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 });
        await page.emulateMedia({
            colorScheme: mode === 'dark' ? 'dark' : 'light',
        });
        await accepted(page, '/');

        for (const slug of SLUGS) {
            await page.goto(`/stories/${slug}`);
            await waitForPublicPage(page);

            if (mode === 'rtl') {
                await page.evaluate(() => {
                    document.documentElement.dir = 'rtl';
                });
            }

            await page.waitForTimeout(100);

            const size = await page.evaluate(() => ({
                scroll: document.scrollingElement?.scrollWidth ?? 0,
                inner: innerWidth,
            }));

            expect(size.scroll, slug).toBeLessThanOrEqual(size.inner);
        }
    });
}

for (const viewport of [
    { label: 'phone', width: 375, height: 812 },
    { label: 'desktop', width: 1280, height: 800 },
]) {
    test(`STR-021 an article has no serious accessibility issues (${viewport.label})`, async ({
        page,
    }) => {
        await page.setViewportSize({
            width: viewport.width,
            height: viewport.height,
        });
        await accepted(page, KOPITIAM_PATH);
        await scrollToEnd(page);
        await expect(page.getByText(/on this story/)).toBeVisible();
        await page.waitForTimeout(900);
        await settleAnimations(page);

        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
        const serious = results.violations
            .filter((v) => v.impact === 'serious' || v.impact === 'critical')
            .map((v) => ({
                id: v.id,
                targets: v.nodes.map((node) => node.target.join(' ')),
            }));

        expect(serious).toEqual([]);
    });
}

test('STR-022 the Privacy page names the saved reading position', async ({
    page,
}) => {
    await accepted(page, '/privacy');
    await expect(page.getByText('meridian.reading')).toBeVisible();
});
