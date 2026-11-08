import type { ReactNode } from 'react';
import {
    ConsentProvider,
    useConsent,
} from '@/components/site/consent/consent-context';
import { ConsentDialog } from '@/components/site/consent/consent-dialog';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useFlashToast } from '@/hooks/use-flash-toast';

/**
 * The public site shell. It persists across page visits, so the consent
 * dialog stays mounted (and keeps focus) when a visitor follows the Terms or
 * Privacy link from inside it.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
    useFlashToast();

    return (
        <ConsentProvider>
            <SiteShell>{children}</SiteShell>
            <ConsentDialog />
        </ConsentProvider>
    );
}

function SiteShell({ children }: { children: ReactNode }) {
    const { open } = useConsent();

    return (
        <div
            inert={open}
            className="flex min-h-dvh flex-col pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
        >
            <a
                href="#main"
                className="sr-only rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-lg focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-50 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
            >
                Skip to content
            </a>
            <SiteHeader />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
