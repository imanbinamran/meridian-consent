import { Link } from '@inertiajs/react';
import { useI18n } from '@/lib/i18n';
import { about, login, privacy, terms } from '@/routes';
import { useConsent } from './consent/consent-context';
import { siteNav } from './site-nav';
import { MeridianMark } from './site-logo';

const linkClass =
    'rounded-sm text-sm text-ink-foreground/70 transition-colors hover:text-ink-foreground focus-visible:ring-2 focus-visible:ring-ink-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none';

export function SiteFooter() {
    const { reopen } = useConsent();
    const { t, list } = useI18n();

    return (
        <footer className="bg-ink pb-[env(safe-area-inset-bottom)] text-ink-foreground">
            <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
                    <div>
                        <p className="flex items-center gap-2.5 font-display text-3xl font-semibold tracking-tight">
                            <MeridianMark className="size-7 text-brand-bright" />
                            Meridian
                        </p>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-foreground/65">
                            {t('common.footer.about')}
                        </p>
                    </div>

                    <nav aria-label={t('common.site.footer_nav')}>
                        <h2 className="text-xs font-semibold tracking-[0.18em] text-ink-foreground/60 uppercase">
                            {t('common.footer.pages')}
                        </h2>
                        <ul className="mt-4 space-y-3">
                            {siteNav.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={linkClass}
                                    >
                                        {t(`common.nav.${item.key}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div>
                        <h2 className="text-xs font-semibold tracking-[0.18em] text-ink-foreground/60 uppercase">
                            {t('common.footer.your_data')}
                        </h2>
                        <ul className="mt-4 space-y-3">
                            <li>
                                <Link href={privacy()} className={linkClass}>
                                    {t('common.footer.privacy_policy')}
                                </Link>
                            </li>
                            <li>
                                <Link href={terms()} className={linkClass}>
                                    {t('common.footer.terms')}
                                </Link>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={reopen}
                                    className={linkClass}
                                >
                                    {t('common.footer.cookie_settings')}
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold tracking-[0.18em] text-ink-foreground/60 uppercase">
                            {t('common.footer.newsroom')}
                        </h2>
                        <address className="mt-4 space-y-3 text-sm leading-relaxed text-ink-foreground/70 not-italic">
                            <p>
                                {list<string>('common.footer.address').map(
                                    (line) => (
                                        <span key={line} className="block">
                                            {line}
                                        </span>
                                    ),
                                )}
                            </p>
                            <p>
                                <a
                                    href="mailto:newsroom@meridian.example"
                                    className={linkClass}
                                >
                                    newsroom@meridian.example
                                </a>
                            </p>
                            <p>
                                <a
                                    href="tel:+60321814600"
                                    className={linkClass}
                                >
                                    +60 3-2181 4600
                                </a>
                            </p>
                        </address>
                    </div>
                </div>

                <div className="mt-14 flex flex-col gap-4 border-t border-ink-foreground/15 pt-6 text-xs text-ink-foreground/60 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {t('common.footer.rights', {
                            year: new Date().getFullYear(),
                        })}
                    </p>
                    <p className="flex gap-5">
                        <Link
                            href={`${about.url()}#contact`}
                            className={linkClass}
                        >
                            {t('common.footer.send_tip')}
                        </Link>
                        <Link href={login()} className={linkClass}>
                            {t('common.footer.staff_sign_in')}
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}
