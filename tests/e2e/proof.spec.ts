import { expect, test } from '@playwright/test';
import {
    consentsTable,
    dataRows,
    logInAsAdmin,
    searchGuid,
} from './support/admin';
import {
    ACCEPTED_COOKIE,
    acceptConsent,
    parseAcceptedCookie,
    waitForCookie,
} from './support/consent';

/**
 * ADM-040: the one test that ties it all together. A visitor accepts on the
 * public site, and the admin finds that exact GUID, version and time in the
 * consents table. Always recorded, so the video is the proof.
 */

test.use({ video: 'on' });

test('ADM-040 a visitor acceptance shows up in the admin table under the cookie GUID', async ({
    page,
    context,
}) => {
    const accepted =
        await test.step('visitor accepts on the home page', async () => {
            await page.goto('/');

            return acceptConsent(page);
        });

    const cookie = await test.step('read the consent cookie', async () => {
        const value = parseAcceptedCookie(
            await waitForCookie(context, ACCEPTED_COOKIE),
        );
        expect(value.guid).toBe(accepted.guid);
        await test.info().attach('consent-cookie.json', {
            body: JSON.stringify(value, null, 2),
            contentType: 'application/json',
        });

        return value;
    });

    await test.step('admin logs in', async () => {
        await logInAsAdmin(page);
    });

    await test.step('admin searches the GUID from the cookie', async () => {
        await page.goto('/admin/consents');
        await searchGuid(page, cookie.guid);
    });

    await test.step('the row matches the cookie', async () => {
        const rows = dataRows(consentsTable(page));
        await expect(rows).toHaveCount(1);

        const row = rows.first();
        await expect(row).toContainText(cookie.guid);
        await expect(row.getByRole('cell').nth(1)).toHaveText(
            new RegExp(`^\\s*v?${cookie.version}\\s*$`),
        );

        const shown = await row
            .locator('time')
            .first()
            .getAttribute('datetime');
        expect(shown, 'accepted time has a datetime attribute').not.toBeNull();
        expect(Date.parse(shown as string)).toBe(
            Date.parse(cookie.accepted_at),
        );
    });
});
