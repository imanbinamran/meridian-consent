import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import {
    ConsentProvider,
    useConsent,
} from '@/components/site/consent/consent-context';
import { setBackToTopLabel } from '@/components/back-to-top';
import { ConsentDialog } from '@/components/site/consent/consent-dialog';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { LOCALE_COOKIE, useI18n } from '@/lib/i18n';

/**
 * The public site shell. It persists across page visits, so the consent
 * dialog stays mounted (and keeps focus) when a visitor follows the Terms or
 * Privacy link from inside it.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
    useFlashToast();
    useDocumentLanguage();

    return (
        <ConsentProvider>
            <SiteShell>{children}</SiteShell>
            <ConsentDialog />
        </ConsentProvider>
    );
}

/**
 * Keeps the page in step with the saved language. Inertia only sets <html lang>
 * on a full load, and the back button restores a page in the language it was
 * first shown in, so a page that disagrees with the cookie asks for itself again.
 */
function useDocumentLanguage(): void {
    const { locale, t } = useI18n();
    const { url } = usePage();

    useEffect(() => {
        document.documentElement.lang = locale;
        setBackToTopLabel(t('common.site.back_to_top'));

        // Sign-in and admin are outside this layout and stay in English.
        return () => {
            document.documentElement.lang = 'en';
            setBackToTopLabel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]);

    useEffect(() => {
        const saved = new RegExp(
            `(?:^|; )${LOCALE_COOKIE}=(en|ms)(?:;|$)`,
        ).exec(document.cookie)?.[1];

        if (saved && saved !== locale) {
            router.reload();
        }
        // Only on arriving at a page: a switch in progress has its own reload.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);
}

function SiteShell({ children }: { children: ReactNode }) {
    const { open } = useConsent();
    const { t } = useI18n();

    return (
        <div
            inert={open}
            className="flex min-h-dvh flex-col pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
        >
            <a
                href="#main"
                className="sr-only rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-lg focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-50 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
            >
                {t('common.site.skip_to_content')}
            </a>
            <SiteHeader />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
