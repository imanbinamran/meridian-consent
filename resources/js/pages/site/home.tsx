import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import {
    Kicker,
    MeridianLines,
    SectionHeading,
} from '@/components/site/section-heading';
import { Headline } from '@/components/site/story/headline';
import { canResume } from '@/components/site/story/reading-store';
import { StoryLink, useReadingEntry } from '@/components/site/story/story-link';
import type { StorySummary } from '@/components/site/story/types';
import { useI18n } from '@/lib/i18n';
import { about } from '@/routes';

type Desk = { name: string; body: string; rhythm: string };
type Figure = { value: number; label: string };
type Principle = { title: string; body: string };

function EditionRow({
    story,
    number,
}: {
    story: StorySummary;
    number: number;
}) {
    const entry = useReadingEntry(story.slug);
    const resumable = canResume(entry);
    const { t } = useI18n();

    return (
        <li>
            <StoryLink
                slug={story.slug}
                resume={resumable}
                className="group relative -mx-3 flex gap-5 rounded-lg px-3 py-5 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
                <span
                    aria-hidden="true"
                    className="font-display text-4xl leading-none font-medium text-brand/80 tabular-nums"
                >
                    {number}
                </span>
                <span className="min-w-0">
                    <span className="block text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        {story.desk}
                        <span className="sr-only">
                            {t('common.story.desk_suffix')}
                        </span>
                    </span>
                    <span className="mt-1.5 block font-display text-lg leading-snug font-medium text-pretty decoration-brand decoration-2 underline-offset-4 transition-colors group-hover:text-brand group-hover:underline">
                        <Headline text={story.title} />
                    </span>
                    <span className="mt-1.5 block text-xs text-muted-foreground">
                        {t('common.story.min_read', { minutes: story.minutes })}
                        {resumable && (
                            <span className="font-medium text-brand">
                                {' '}
                                ·{' '}
                                {t('common.story.resume', {
                                    minutes: Math.max(
                                        1,
                                        Math.ceil(
                                            (1 - entry.progress) *
                                                story.minutes,
                                        ),
                                    ),
                                })}
                            </span>
                        )}
                        {entry?.finished && (
                            <span className="font-medium">
                                {' '}
                                · {t('common.story.read')}
                            </span>
                        )}
                    </span>
                </span>
                {resumable && (
                    <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-primary rtl:origin-right"
                        style={{ transform: `scaleX(${entry.progress})` }}
                    />
                )}
            </StoryLink>
        </li>
    );
}

export default function Home({
    edition,
    longRead,
}: {
    edition: StorySummary[];
    longRead: StorySummary;
}) {
    const { t, rich, list, intlLocale } = useI18n();
    const figureFormat = new Intl.NumberFormat(intlLocale, {
        notation: 'compact',
        maximumFractionDigits: 1,
    });

    return (
        <>
            <Head title={t('home.title')}>
                <meta name="description" content={t('home.description')} />
            </Head>

            {/* Hero */}
            <section
                aria-labelledby="home-title"
                className="relative overflow-hidden border-b border-foreground/10"
            >
                <MeridianLines className="absolute -end-64 -top-40 size-[52rem] text-foreground/[0.06] sm:-end-40" />
                <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-24 lg:pb-24">
                    <div className="lg:col-span-7">
                        <Kicker>{t('home.hero.kicker')}</Kicker>
                        <h1
                            id="home-title"
                            className="mt-6 font-display text-[2.75rem] leading-[1.02] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl"
                        >
                            {rich(
                                'home.hero.title',
                                {},
                                {
                                    em: (children) => (
                                        <em className="text-brand">
                                            {children}
                                        </em>
                                    ),
                                },
                            )}
                        </h1>
                        <p className="mt-7 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
                            {t('home.hero.body')}
                        </p>
                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link
                                href={about()}
                                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                            >
                                {t('home.hero.meet')}
                                <ArrowUpRight
                                    className="size-4 rtl:-scale-x-100"
                                    aria-hidden="true"
                                />
                            </Link>
                            <Link
                                href={`${about.url()}#standards`}
                                className="inline-flex h-12 items-center rounded-full border border-foreground/20 px-6 text-sm font-semibold transition-colors hover:border-foreground/50 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            >
                                {t('home.hero.standards')}
                            </Link>
                        </div>
                    </div>

                    <aside
                        id="edition"
                        aria-labelledby="edition-title"
                        className="scroll-mt-32 lg:col-span-5 lg:border-s lg:border-foreground/10 lg:ps-10"
                    >
                        <h2
                            id="edition-title"
                            className="flex items-baseline justify-between border-b-2 border-foreground pb-3 font-display text-xl font-medium"
                        >
                            {t('home.edition.title')}
                            <span className="font-sans text-xs font-medium tracking-wide text-muted-foreground">
                                {t('home.edition.selected')}
                            </span>
                        </h2>
                        <ol className="divide-y divide-foreground/10">
                            {edition.map((story, index) => (
                                <EditionRow
                                    key={story.slug}
                                    story={story}
                                    number={index + 1}
                                />
                            ))}
                        </ol>
                    </aside>
                </div>
            </section>

            {/* Desks */}
            <section
                aria-labelledby="desks-title"
                className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
            >
                <SectionHeading
                    id="desks-title"
                    kicker={t('home.desks.kicker')}
                    title={t('home.desks.title')}
                    description={t('home.desks.description')}
                />
                <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {list<Desk>('home.desks.items').map((desk) => (
                        <li
                            key={desk.name}
                            className="group border-t-2 border-foreground pt-5"
                        >
                            <div className="flex items-baseline justify-between gap-4">
                                <h3 className="font-display text-2xl font-medium">
                                    {desk.name}
                                </h3>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {desk.rhythm}
                                </span>
                            </div>
                            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                                {desk.body}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Long read */}
            <section
                aria-labelledby="longread-title"
                className="bg-ink text-ink-foreground"
            >
                <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-28">
                    <div className="lg:col-span-5">
                        <Kicker className="text-brand-bright [&>span]:bg-brand-bright">
                            {t('home.long_read.kicker')}
                        </Kicker>
                        <h2
                            id="longread-title"
                            className="mt-5 font-display text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl"
                        >
                            <StoryLink
                                slug={longRead.slug}
                                className="rounded-sm decoration-brand-bright decoration-2 underline-offset-[6px] transition-colors hover:text-brand-bright hover:underline focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-4 focus-visible:ring-offset-ink focus-visible:outline-none"
                            >
                                <Headline text={longRead.title} />
                            </StoryLink>
                        </h2>
                        <p className="mt-5 text-sm text-ink-foreground/70">
                            {longRead.byline} ·{' '}
                            {t('common.story.min_read', {
                                minutes: longRead.minutes,
                            })}
                        </p>
                    </div>
                    <div className="lg:col-span-7 lg:ps-6">
                        <blockquote className="border-s-4 border-brand-bright ps-6">
                            <p className="font-display text-2xl leading-snug text-pretty italic sm:text-3xl">
                                {t('home.long_read.quote')}
                            </p>
                            <footer className="mt-4 text-sm text-ink-foreground/70">
                                {t('home.long_read.quote_source')}
                            </footer>
                        </blockquote>
                        <p className="mt-8 max-w-[65ch] leading-relaxed text-ink-foreground/80">
                            {t('home.long_read.body')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Figures */}
            <section
                aria-labelledby="figures-title"
                className="border-b border-foreground/10"
            >
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                    <h2 id="figures-title" className="sr-only">
                        {t('home.figures.title')}
                    </h2>
                    <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-foreground/10 rtl:lg:divide-x-reverse">
                        {list<Figure>('home.figures.items').map((figure) => (
                            <div
                                key={figure.label}
                                className="flex flex-col-reverse justify-end gap-2 pe-4 lg:px-8 lg:first:ps-0"
                            >
                                <dt className="text-sm leading-snug text-muted-foreground">
                                    {figure.label}
                                </dt>
                                <dd className="font-display text-5xl font-medium tracking-tight tabular-nums sm:text-6xl">
                                    {figureFormat.format(figure.value)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Principles */}
            <section
                aria-labelledby="principles-title"
                className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
            >
                <div className="grid gap-12 lg:grid-cols-12">
                    <SectionHeading
                        id="principles-title"
                        kicker={t('home.principles.kicker')}
                        title={t('home.principles.title')}
                        className="lg:col-span-4"
                    />
                    <ol className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
                        {list<Principle>('home.principles.items').map(
                            (principle, index) => (
                                <li key={principle.title}>
                                    <span
                                        aria-hidden="true"
                                        className="font-display text-sm text-brand tabular-nums"
                                    >
                                        0{index + 1}
                                    </span>
                                    <h3 className="mt-2 font-display text-xl leading-snug font-medium">
                                        {principle.title}
                                    </h3>
                                    <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                                        {principle.body}
                                    </p>
                                </li>
                            ),
                        )}
                    </ol>
                </div>
            </section>

            {/* Call to action */}
            <section
                aria-labelledby="tip-title"
                className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28"
            >
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-12 lg:py-16">
                    <MeridianLines className="absolute -end-32 -bottom-72 size-[36rem] text-primary-foreground/15" />
                    <div className="relative max-w-2xl">
                        <h2
                            id="tip-title"
                            className="font-display text-3xl leading-tight font-medium text-balance sm:text-4xl"
                        >
                            {t('home.tip.title')}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-primary-foreground">
                            {t('home.tip.body')}
                        </p>
                        <Link
                            href={`${about.url()}#contact`}
                            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-background/90 focus-visible:ring-3 focus-visible:ring-background/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary focus-visible:outline-none"
                        >
                            {t('home.tip.cta')}
                            <ArrowUpRight
                                className="size-4 rtl:-scale-x-100"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
