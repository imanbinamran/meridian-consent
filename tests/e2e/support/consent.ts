import { expect } from '@playwright/test';
import type { BrowserContext, Cookie, Locator, Page } from '@playwright/test';

export const PUBLIC_PAGES = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
] as const;

export const COPY = {
    first: 'Cookies are necessary for this website to function properly, for performance measurement, and to provide you with the best experience.',
    second: 'By continuing to access or use this site, you acknowledge and consent to our use of cookies in accordance with our Terms & Conditions and Privacy Statement.',
};

export const ACCEPTED_COOKIE = 'consent';
export const DECLINED_COOKIE = 'consent_declined';

export const DAY_SECONDS = 24 * 60 * 60;

/** UUID v4: version nibble 4, variant 8, 9, a or b. */
export const UUID_V4 =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** ISO 8601 in UTC, with or without fractions, as Z or +00:00. */
export const ISO_UTC =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|\+00:00)$/;

export type AcceptedValue = {
    guid: string;
    accepted_at: string;
    version: number;
};

/** The consent box, whether built as a dialog or an alertdialog. */
export function consentDialog(page: Page): Locator {
    return page
        .getByRole('dialog', { name: 'Cookie consent' })
        .or(page.getByRole('alertdialog', { name: 'Cookie consent' }));
}

/**
 * Wait until a public page has rendered (the footer "Cookie settings" button
 * is in the same layout as the box), so "box hidden" is not checked too early.
 * Hidden elements count, because an open box makes the page behind it inert.
 */
export async function waitForPublicPage(page: Page): Promise<void> {
    await expect(
        page
            .getByRole('contentinfo', { includeHidden: true })
            .getByRole('button', {
                name: 'Cookie settings',
                includeHidden: true,
            }),
    ).toBeAttached();
    await page.waitForLoadState('networkidle');
}

export async function expectConsentBox(page: Page): Promise<Locator> {
    const dialog = consentDialog(page);
    await expect(dialog).toBeVisible();
    await expect(
        dialog.getByRole('button', { name: 'Accept', exact: true }),
    ).toBeVisible();
    await expect(
        dialog.getByRole('button', { name: 'Decline', exact: true }),
    ).toBeVisible();

    return dialog;
}

export async function expectNoConsentBox(page: Page): Promise<void> {
    await waitForPublicPage(page);
    await expect(consentDialog(page)).toBeHidden();
}

/** Wait for running CSS animations (dialog fade/slide) to finish. */
export async function settleAnimations(page: Page): Promise<void> {
    await page.evaluate(() =>
        Promise.all(
            document
                .getAnimations()
                .filter((animation) => animation.playState === 'running')
                .map((animation) => animation.finished.catch(() => undefined)),
        ),
    );
}

export async function getCookie(
    context: BrowserContext,
    name: string,
): Promise<Cookie | undefined> {
    const cookies = await context.cookies();

    return cookies.find((cookie) => cookie.name === name);
}

/** Poll until the cookie exists, then return it. */
export async function waitForCookie(
    context: BrowserContext,
    name: string,
): Promise<Cookie> {
    await expect
        .poll(async () => (await getCookie(context, name))?.value ?? null, {
            message: `cookie "${name}" should be set`,
        })
        .not.toBeNull();

    return (await getCookie(context, name)) as Cookie;
}

export function decodeCookieValue(value: string): string {
    return decodeURIComponent(value);
}

export function parseAcceptedCookie(cookie: Cookie): AcceptedValue {
    const raw = decodeCookieValue(cookie.value);

    try {
        return JSON.parse(raw) as AcceptedValue;
    } catch {
        throw new Error(
            `"${ACCEPTED_COOKIE}" cookie is not readable JSON (encrypted?): ${raw.slice(0, 80)}`,
        );
    }
}

/** Click Accept and wait for the box to close and the cookie to land. */
export async function acceptConsent(page: Page): Promise<AcceptedValue> {
    const dialog = await expectConsentBox(page);
    await dialog.getByRole('button', { name: 'Accept', exact: true }).click();
    await expect(dialog).toBeHidden();
    const cookie = await waitForCookie(page.context(), ACCEPTED_COOKIE);

    return parseAcceptedCookie(cookie);
}

export async function declineConsent(page: Page): Promise<Cookie> {
    const dialog = await expectConsentBox(page);
    await dialog.getByRole('button', { name: 'Decline', exact: true }).click();
    await expect(dialog).toBeHidden();

    return waitForCookie(page.context(), DECLINED_COOKIE);
}

/**
 * Put a consent cookie straight into the browser, URL-encoded like PHP sends it.
 * No database row is created, so the server treats it as forged: use it only
 * where the box is expected to come back. To get a real cookie, click Accept.
 */
/** A real row past its one-year lifetime, from ExpiredConsentSeeder. */
export const EXPIRED_CONSENT = {
    guid: '00000000-0000-4000-8000-000000000365',
    accepted_at: '2025-01-01T00:00:00Z',
    version: 1,
};

export async function addAcceptedCookie(
    context: BrowserContext,
    baseURL: string,
    value: string,
    expiresInSeconds: number,
): Promise<void> {
    await context.addCookies([
        {
            name: ACCEPTED_COOKIE,
            value: encodeURIComponent(value),
            url: baseURL,
            expires: Math.floor(Date.now() / 1000) + expiresInSeconds,
            httpOnly: true,
            sameSite: 'Lax',
        },
    ]);
}

export function nowSeconds(): number {
    return Date.now() / 1000;
}
