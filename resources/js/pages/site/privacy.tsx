import { Head, Link } from '@inertiajs/react';
import { useConsent } from '@/components/site/consent/consent-context';
import { LegalDocument } from '@/components/site/legal-document';
import type {
    LegalSectionText,
    RenderCookieTable,
} from '@/components/site/legal-document';
import { useI18n } from '@/lib/i18n';
import type { RichTags } from '@/lib/i18n';
import { about, terms } from '@/routes';

type PrivacyProps = {
    cookies: {
        accepted: string;
        declined: string;
        session: string;
        locale: string;
    };
};

type CookieRow = {
    cookie: string;
    when: string;
    holds: string;
    lasts: string;
};

export default function Privacy({ cookies }: PrivacyProps) {
    const { reopen } = useConsent();
    const { t, list } = useI18n();
    const names: Record<string, string> = cookies;

    const tags: RichTags = {
        terms: (children) => <Link href={terms()}>{children}</Link>,
        contact: (children) => (
            <Link href={`${about.url()}#contact`}>{children}</Link>
        ),
        privacy_email: (children) => (
            <a href="mailto:privacy@meridian.example">{children}</a>
        ),
        settings: (children) => (
            <button
                type="button"
                onClick={reopen}
                className="font-medium text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
                {children}
            </button>
        ),
    };

    const cookieTable: RenderCookieTable = () => (
        <div
            // Scrolls sideways on phones, so keyboard users need to reach it.
            role="region"
            aria-label={t('privacy.cookie_table.label')}
            tabIndex={0}
            className="legal-table -mx-4 overflow-x-auto overscroll-x-contain rounded-md px-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:mx-0 sm:px-0"
        >
            <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
                <caption className="sr-only">
                    {t('privacy.cookie_table.label')}
                </caption>
                <thead>
                    <tr className="border-b-2 border-foreground text-start">
                        <th
                            scope="col"
                            className="py-2.5 pe-4 text-start font-semibold"
                        >
                            {t('privacy.cookie_table.name')}
                        </th>
                        <th
                            scope="col"
                            className="py-2.5 pe-4 text-start font-semibold"
                        >
                            {t('privacy.cookie_table.set')}
                        </th>
                        <th
                            scope="col"
                            className="py-2.5 pe-4 text-start font-semibold"
                        >
                            {t('privacy.cookie_table.holds')}
                        </th>
                        <th
                            scope="col"
                            className="py-2.5 text-start font-semibold"
                        >
                            {t('privacy.cookie_table.lasts')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {list<CookieRow>('privacy.cookie_table.rows').map((row) => {
                        const name = names[row.cookie] ?? row.cookie;

                        return (
                            <tr
                                key={name}
                                className="border-b border-foreground/10 align-top"
                            >
                                <th
                                    scope="row"
                                    className="py-3 pe-4 text-start font-normal"
                                >
                                    <code>{name}</code>
                                </th>
                                <td className="py-3 pe-4">{row.when}</td>
                                <td className="py-3 pe-4">{row.holds}</td>
                                <td className="py-3 whitespace-nowrap">
                                    {row.lasts}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    return (
        <>
            <Head title={t('privacy.title')}>
                <meta name="description" content={t('privacy.description')} />
            </Head>
            <LegalDocument
                kicker={t('privacy.kicker')}
                title={t('privacy.title')}
                intro={<p>{t('privacy.intro')}</p>}
                updated="2026-11-09"
                sections={list<LegalSectionText>('privacy.sections')}
                params={{
                    accepted: cookies.accepted,
                    declined: cookies.declined,
                    locale: cookies.locale,
                }}
                tags={tags}
                renderCookieTable={cookieTable}
            />
        </>
    );
}
