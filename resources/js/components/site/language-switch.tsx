import { router } from '@inertiajs/react';
import { useRef } from 'react';
import { LOCALE_COOKIE, useI18n } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Locale; short: string }[] = [
    { value: 'en', short: 'EN' },
    { value: 'ms', short: 'BM' },
];

const ONE_YEAR = 60 * 60 * 24 * 365;

function saveLocale(locale: Locale): void {
    const secure = location.protocol === 'https:' ? ';Secure' : '';

    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${ONE_YEAR};SameSite=Lax${secure}`;
}

/**
 * The EN/BM pill. Saves the choice, drops pages fetched ahead in the old
 * language, then asks the server for this page again. React state survives,
 * so the consent box stays open and a half-written form keeps its text.
 */
export function LanguageSwitch({ className }: { className?: string }) {
    const { locale, t } = useI18n();
    // Two quick clicks must not race: the older answer could land last.
    const switching = useRef(false);

    const choose = (next: Locale) => {
        if (next === locale || switching.current) {
            return;
        }

        switching.current = true;
        saveLocale(next);
        router.flushAll();
        router.reload({
            onFinish: () => {
                switching.current = false;
            },
        });
    };

    return (
        <div
            role="group"
            aria-label={t('common.language.label')}
            className={cn(
                'inline-flex shrink-0 items-center rounded-full border border-foreground/15 p-0.5',
                className,
            )}
        >
            {OPTIONS.map((option) => {
                const current = option.value === locale;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => choose(option.value)}
                        aria-pressed={current}
                        lang={option.value}
                        aria-label={`${option.short} (${t(`common.language.${option.value}`)})`}
                        className={cn(
                            'inline-flex h-8 min-w-9 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            current
                                ? 'bg-foreground text-background'
                                : 'text-foreground/70 hover:text-foreground',
                        )}
                    >
                        {option.short}
                    </button>
                );
            })}
        </div>
    );
}
