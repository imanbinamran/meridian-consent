import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Headline } from '@/components/site/story/headline';
import {
    beginMorph,
    endMorphWhenDone,
    focusLinkOnReturn,
    morphClass,
    takeHeadingFocus,
} from '@/components/site/story/morph';
import { StoryBody } from '@/components/site/story/story-body';
import { StoryFinish } from '@/components/site/story/story-finish';
import { takeResumePosition } from '@/components/site/story/story-link';
import { StoryRail } from '@/components/site/story/story-rail';
import type { Story } from '@/components/site/story/types';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

export default function StoryPage({ story }: { story: Story }) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const storyRef = useRef<HTMLDivElement>(null);
    const { t } = useI18n();

    // Section rules draw across as they arrive. Text never moves.
    useLayoutEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const rules = storyRef.current?.querySelectorAll('.story-rule') ?? [];
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (
                        entry.isIntersecting ||
                        entry.boundingClientRect.top < 0
                    ) {
                        observer.unobserve(entry.target);
                        entry.target.classList.remove('pending');
                    }
                }),
            { rootMargin: '0px 0px -30% 0px' },
        );

        rules.forEach((rule) => {
            rule.classList.add('pending');
            observer.observe(rule);
        });

        return () => observer.disconnect();
    }, [story.slug]);

    useLayoutEffect(() => {
        const position = takeResumePosition();
        const element = storyRef.current;

        if (position === null || !element) {
            return;
        }

        const header = document.querySelector('.site-header');
        const top = header?.getBoundingClientRect().bottom ?? 0;
        const box = element.getBoundingClientRect();

        scrollTo(
            0,
            box.top +
                scrollY -
                top +
                position * (box.height - innerHeight + top),
        );
    }, [story.slug]);

    useEffect(() => {
        if (takeHeadingFocus()) {
            titleRef.current?.focus({ preventScroll: true });
        }
    }, [story.slug]);

    return (
        <>
            <Head title={story.title}>
                <meta name="description" content={story.deck} />
            </Head>

            <article className="story-page mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
                <header className="mx-auto max-w-[40rem] pt-8 pb-10 sm:pt-12">
                    <Link
                        href={`${home.url()}#edition`}
                        viewTransition={endMorphWhenDone}
                        onClick={() => {
                            const title = titleRef.current;

                            if (title) {
                                beginMorph(story.slug, title);
                            }

                            focusLinkOnReturn(story.slug);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                    >
                        <ArrowLeft
                            className="size-4 rtl:-scale-x-100"
                            aria-hidden="true"
                        />
                        {t('common.story.edition')}
                    </Link>
                    <p className="mt-7 text-xs font-semibold tracking-[0.16em] text-brand uppercase">
                        {story.desk}
                        <span className="sr-only">
                            {t('common.story.desk_suffix')}
                        </span>
                        <span className="ms-3.5 font-sans font-normal tracking-normal text-muted-foreground normal-case">
                            {t('common.story.min_read', {
                                minutes: story.minutes,
                            })}
                        </span>
                    </p>
                    <h1
                        ref={titleRef}
                        tabIndex={-1}
                        className={cn(
                            'mt-3 font-display text-[2.4rem] leading-[1.06] font-medium tracking-tight text-balance outline-none sm:text-6xl',
                            morphClass(story.slug),
                        )}
                    >
                        <Headline text={story.title} />
                    </h1>
                    <p className="mt-5 font-display text-[1.375rem] leading-snug text-pretty text-muted-foreground">
                        {story.deck}
                    </p>
                    <p className="mt-5 text-sm text-muted-foreground">
                        {story.byline}
                    </p>
                    <p className="mt-2.5 inline-block rounded-full bg-muted px-2.5 py-1 text-xs text-foreground/80">
                        {t('common.story.sample_notice')}
                    </p>
                </header>

                <div className="story-grid" ref={storyRef}>
                    <StoryRail
                        storyRef={storyRef}
                        sections={story.sections}
                        slug={story.slug}
                        minutes={story.minutes}
                    />
                    <StoryBody sections={story.sections} />
                </div>

                <div className="mx-auto mt-14 max-w-[40rem]">
                    <StoryFinish story={story} />
                </div>
            </article>
        </>
    );
}
