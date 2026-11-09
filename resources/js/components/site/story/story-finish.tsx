import { Link } from '@inertiajs/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { home } from '@/routes';
import { Headline } from './headline';
import { markFinished } from './reading-store';
import { StoryLink } from './story-link';
import type { Story } from './types';

const QUICK_SHARE = 0.4;

/**
 * The end of a story: a mark on the last line, the time it took, and the next
 * story. The time stays on this page. It is never stored or sent anywhere.
 */
export function StoryFinish({ story }: { story: Story }) {
    const rootRef = useRef<HTMLDivElement>(null);
    // Kept as data and worded at render, so a language switch shows.
    const [finish, setFinish] = useState<{
        quick: boolean;
        readMs: number;
    } | null>(null);
    const { t } = useI18n();

    const duration = (milliseconds: number): string => {
        const seconds = Math.max(1, Math.round(milliseconds / 1000));

        return seconds < 60
            ? t('common.story.seconds', { seconds })
            : t('common.story.minutes_seconds', {
                  minutes: Math.floor(seconds / 60),
                  seconds: seconds % 60,
              });
    };

    const line =
        finish === null
            ? t('common.story.end')
            : t(
                  finish.quick
                      ? 'common.story.end_quick'
                      : 'common.story.end_promised',
                  { time: duration(finish.readMs) },
              );

    useLayoutEffect(() => {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const parts = rootRef.current?.querySelectorAll('.story-finish-part');
        const end = document.getElementById('story-end');

        if (!end || !parts) {
            return;
        }

        if (!reduced) {
            end.classList.add('pending');
            parts.forEach((part) => part.classList.add('pending'));
        }

        let readMs = 0;
        let since = document.hidden ? 0 : performance.now();

        const pause = () => {
            if (since) {
                readMs += performance.now() - since;
                since = 0;
            }
        };
        const onVisibility = () => {
            if (document.hidden) {
                pause();
            } else {
                since = performance.now();
            }
        };

        document.addEventListener('visibilitychange', onVisibility);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    return;
                }

                observer.disconnect();
                pause();
                markFinished(story.slug);
                end.classList.remove('pending');
                end.classList.add('stamped');
                parts.forEach((part) => part.classList.remove('pending'));

                const promised = story.minutes * 60_000;

                setFinish({ quick: readMs < promised * QUICK_SHARE, readMs });
            },
            { rootMargin: '0px 0px -8% 0px' },
        );

        observer.observe(end);

        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [story.slug, story.minutes]);

    return (
        <div ref={rootRef} className="story-finish">
            <p
                className="story-finish-part font-display text-xl text-muted-foreground italic"
                aria-live="polite"
            >
                {line}
            </p>
            <div className="story-finish-part border-t-2 border-foreground pt-3.5">
                <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
                    {t('common.story.next_in_edition')}
                </p>
                <StoryLink
                    slug={story.next.slug}
                    className="group mt-3 block rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                    <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        {story.next.desk} ·{' '}
                        {t('common.story.min_read', {
                            minutes: story.next.minutes,
                        })}
                    </span>
                    <span className="mt-1.5 block font-display text-3xl leading-[1.12] font-medium tracking-tight text-balance decoration-brand decoration-2 underline-offset-[5px] transition-colors group-hover:text-brand group-hover:underline sm:text-4xl">
                        <Headline text={story.next.title} />
                    </span>
                </StoryLink>
            </div>
            <Link
                href={`${home.url()}#edition`}
                className="story-finish-part justify-self-start text-sm underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
            >
                {t('common.story.back_to_edition')}
            </Link>
        </div>
    );
}
