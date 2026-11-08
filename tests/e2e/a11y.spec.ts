import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
    PUBLIC_PAGES,
    acceptConsent,
    expectConsentBox,
    settleAnimations,
    waitForPublicPage,
} from './support/consent';

/**
 * CON-070: axe scan of every public page, with the consent box open and after
 * accepting, at phone and desktop sizes. Fails on serious or critical issues.
 */

const VIEWPORTS = [
    { label: 'phone', width: 375, height: 812 },
    { label: 'desktop', width: 1280, height: 800 },
] as const;

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function seriousViolations(page: Page) {
    await settleAnimations(page);
    const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();

    return results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            targets: v.nodes.map((node) => node.target.join(' ')).slice(0, 5),
        }));
}

for (const viewport of VIEWPORTS) {
    for (const { path, name } of PUBLIC_PAGES) {
        test(`CON-070 ${name} (${path}) at ${viewport.label} has no serious axe violations`, async ({
            page,
        }) => {
            await page.setViewportSize({
                width: viewport.width,
                height: viewport.height,
            });
            await page.goto(path);
            const dialog = await expectConsentBox(page);

            await test.step('focus starts inside the box', async () => {
                await expect
                    .poll(() =>
                        dialog.evaluate((el) =>
                            el.contains(document.activeElement),
                        ),
                    )
                    .toBe(true);
            });

            await test.step('box open', async () => {
                expect(await seriousViolations(page)).toEqual([]);
            });

            await test.step('after accept', async () => {
                await acceptConsent(page);
                await waitForPublicPage(page);
                expect(await seriousViolations(page)).toEqual([]);
            });
        });
    }
}
