const LOCALE = 'en-MY';

const numberFormat = new Intl.NumberFormat(LOCALE);
const compactFormat = new Intl.NumberFormat(LOCALE, {
    notation: 'compact',
    maximumFractionDigits: 1,
});
const signedPercent = new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    signDisplay: 'exceptZero',
    maximumFractionDigits: 0,
});
const pluralRules = new Intl.PluralRules(LOCALE);

export function formatNumber(value: number): string {
    return numberFormat.format(value);
}

/** "12K", for axis ticks where the exact figure is in the tooltip. */
export function formatCompact(value: number): string {
    return compactFormat.format(value);
}

/** "+17%", "−4%", "0%". Takes a whole percent. */
export function formatSignedPercent(value: number): string {
    return signedPercent.format(value / 100);
}

/**
 * "1 response", "518 responses". The count is formatted, the noun is
 * picked with Intl.PluralRules so "1 responses" can't happen.
 */
export function pluralize(
    count: number,
    forms: { one: string; other: string },
): string {
    const noun = pluralRules.select(count) === 'one' ? forms.one : forms.other;

    return `${formatNumber(count)} ${noun}`;
}

/** "8 Nov 2026, 2:32 pm" in the given timezone. */
export function formatDateTime(iso: string, timeZone: string): string {
    return new Intl.DateTimeFormat(LOCALE, {
        timeZone,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(iso));
}

/** "2026-11-08 06:32:10 UTC", for tooltips and audits. */
export function formatUtc(iso: string): string {
    return `${new Date(iso).toISOString().slice(0, 19).replace('T', ' ')} UTC`;
}

/**
 * Format a calendar day ("2026-11-08") that is already a local day.
 * Reading it as UTC midnight and formatting in UTC keeps it from shifting.
 */
export function formatDay(
    day: string,
    options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' },
): string {
    return new Intl.DateTimeFormat(LOCALE, {
        ...options,
        timeZone: 'UTC',
    }).format(new Date(`${day}T00:00:00Z`));
}

const relativeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
];

const WEEK_SECONDS = 604_800;
/** Up to this far ahead is clock skew between servers, so it reads "just now". */
const SKEW_SECONDS = 300;

/**
 * "just now", "3 hours ago", "yesterday" for the last week. Older (or
 * future, from clock skew) times switch to an absolute date, because
 * "340 days ago" makes people do maths.
 */
export function formatRecent(
    iso: string,
    timeZone: string,
    now: Date = new Date(),
): string {
    const seconds = (new Date(iso).getTime() - now.getTime()) / 1000;

    if (seconds > 0 && seconds <= SKEW_SECONDS) {
        return 'just now';
    }

    if (seconds > SKEW_SECONDS || seconds < -WEEK_SECONDS) {
        return new Intl.DateTimeFormat(LOCALE, {
            timeZone,
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(new Date(iso));
    }

    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) {
            return relativeFormat.format(Math.round(seconds / size), unit);
        }
    }

    return 'just now';
}

/** The hint under a 7-day card: what the trend pill is compared with. */
export function comparisonHint(current: number, previous: number): string {
    if (previous > 0) {
        return 'vs previous 7 days';
    }

    return current === 0
        ? 'Same as the previous 7 days'
        : 'None in the previous 7 days';
}

/** Change against the previous period, as a whole percent, or null. */
export function percentChange(
    current: number,
    previous: number,
): number | null {
    if (previous === 0) {
        return null;
    }

    return Math.round(((current - previous) / previous) * 100);
}
