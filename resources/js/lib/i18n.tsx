import { usePage } from '@inertiajs/react';
import { Fragment } from 'react';
import type { ReactNode } from 'react';

export type Locale = 'en' | 'ms';

/** Must match HandleLocale::COOKIE. */
export const LOCALE_COOKIE = 'locale';

export type Params = Record<string, string | number>;

/** Wraps the words between <name> and </name> in a piece of translated text. */
export type RichTags = Record<string, (children: ReactNode) => ReactNode>;

const TAG = /<([a-z_]+)>([\s\S]*?)<\/\1>/g;

const defaultTags: RichTags = {
    strong: (children) => <strong>{children}</strong>,
    em: (children) => <em>{children}</em>,
    code: (children) => <code>{children}</code>,
};

function fill(text: string, params: Params): string {
    return text.replace(/:([a-z_]+)/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    );
}

/**
 * Turns marked-up translated text into React nodes. Builds elements directly,
 * so the text can never inject HTML, and an unknown tag shows only its words.
 */
export function richText(
    text: string,
    params: Params = {},
    tags: RichTags = {},
): ReactNode[] {
    const nodes: ReactNode[] = [];
    let cursor = 0;

    for (const match of text.matchAll(TAG)) {
        const [whole, name, inner] = match;
        const render = tags[name] ?? defaultTags[name];
        const children = richText(inner, params, tags);

        nodes.push(
            fill(text.slice(cursor, match.index), params),
            <Fragment key={match.index}>
                {render ? render(children) : children}
            </Fragment>,
        );
        cursor = match.index + whole.length;
    }

    nodes.push(fill(text.slice(cursor), params));

    return nodes;
}

function lookup(tree: unknown, key: string): unknown {
    return key
        .split('.')
        .reduce<unknown>(
            (node, part) =>
                node !== null && typeof node === 'object'
                    ? (node as Record<string, unknown>)[part]
                    : undefined,
            tree,
        );
}

/** Reads the words HandleInertiaRequests shared for the current page. */
export function useI18n() {
    const { locale, translations } = usePage().props as unknown as {
        locale: Locale;
        translations: Record<string, unknown>;
    };

    const value = (key: string): unknown => lookup(translations, key);

    const text = (key: string): string => {
        const found = value(key);

        return typeof found === 'string' ? found : key;
    };

    return {
        locale,
        /** The locale for dates and numbers. */
        intlLocale: locale === 'ms' ? 'ms-MY' : 'en-MY',
        t: (key: string, params: Params = {}): string =>
            fill(text(key), params),
        rich: (key: string, params: Params = {}, tags: RichTags = {}) =>
            richText(text(key), params, tags),
        list: <T,>(key: string): T[] => {
            const found = value(key);

            return Array.isArray(found) ? (found as T[]) : [];
        },
    };
}
