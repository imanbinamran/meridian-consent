import { Head, Link } from '@inertiajs/react';
import { LegalDocument } from '@/components/site/legal-document';
import type { LegalSectionText } from '@/components/site/legal-document';
import { useI18n } from '@/lib/i18n';
import type { RichTags } from '@/lib/i18n';
import { about, privacy } from '@/routes';

const tags: RichTags = {
    contact: (children) => (
        <Link href={`${about.url()}#contact`}>{children}</Link>
    ),
    privacy: (children) => <Link href={privacy()}>{children}</Link>,
    legal_email: (children) => (
        <a href="mailto:legal@meridian.example">{children}</a>
    ),
};

export default function Terms() {
    const { t, list } = useI18n();

    return (
        <>
            <Head title={t('terms.title')}>
                <meta name="description" content={t('terms.description')} />
            </Head>
            <LegalDocument
                kicker={t('terms.kicker')}
                title={t('terms.title')}
                intro={<p>{t('terms.intro')}</p>}
                updated="2026-11-08"
                sections={list<LegalSectionText>('terms.sections')}
                tags={tags}
            />
        </>
    );
}
