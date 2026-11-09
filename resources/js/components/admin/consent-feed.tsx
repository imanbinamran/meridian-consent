import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatNumber, pluralize } from './format';
import type { ConsentRow, Paginated } from './types';

const CONSENTS = { one: 'consent', other: 'consents' };

/** Start loading this far before the reader reaches the last row. */
const LOAD_AHEAD = '600px';

type Status = 'idle' | 'loading' | 'failed';

type Feed = { rows: ConsentRow[]; page: number };

let currentFeed: Feed | null = null;
let savedPlace: { search: string; feed: Feed; scrollY: number } | null = null;

/** Keep the reader's rows and position while they look at a record. */
export function rememberFeedPlace(): void {
    if (currentFeed) {
        savedPlace = {
            search: location.search,
            feed: currentFeed,
            scrollY,
        };
    }
}

/** The saved place, if it belongs to the list now on screen. */
function feedPlace() {
    return typeof location !== 'undefined' &&
        savedPlace?.search === location.search
        ? savedPlace
        : null;
}

/**
 * The phone list: each next page joins the rows already on screen. Any other
 * change to the consents (a filter, a sort) starts the list again.
 */
export function useConsentFeed(
    consents: Paginated<ConsentRow>,
    pageUrl: (page: number) => string,
    only: string[],
) {
    const [feed, setFeed] = useState<Feed>(
        () =>
            feedPlace()?.feed ?? {
                rows: consents.data,
                page: consents.current_page,
            },
    );
    const [status, setStatus] = useState<Status>('idle');
    const pending = useRef<number | null>(null);
    const seen = useRef(consents);

    useEffect(() => {
        currentFeed = feed;
    }, [feed]);

    // Wait a frame: Inertia resets the scroll position after the page renders.
    useEffect(() => {
        const place = feedPlace();

        savedPlace = null;

        if (place) {
            requestAnimationFrame(() =>
                scrollTo({ top: place.scrollY, behavior: 'instant' }),
            );
        }
    }, []);

    useEffect(() => {
        if (seen.current === consents) {
            return;
        }

        seen.current = consents;

        const appended = pending.current === consents.current_page;

        pending.current = null;
        setFeed((current) => {
            if (!appended) {
                return { rows: consents.data, page: consents.current_page };
            }

            // New consents can push a row onto the next page twice.
            const ids = new Set(current.rows.map((row) => row.id));

            return {
                rows: [
                    ...current.rows,
                    ...consents.data.filter((row) => !ids.has(row.id)),
                ],
                page: consents.current_page,
            };
        });
    }, [consents, setFeed]);

    const hasMore = feed.page < consents.last_page;

    const loadMore = () => {
        if (pending.current !== null || !hasMore) {
            return;
        }

        const next = feed.page + 1;

        pending.current = next;
        setStatus('loading');
        router.get(
            pageUrl(next),
            {},
            {
                only,
                preserveState: true,
                preserveScroll: true,
                preserveUrl: true,
                replace: true,
                onFinish: (visit) => {
                    if (visit.completed) {
                        setStatus('idle');

                        return;
                    }

                    pending.current = null;
                    setStatus(visit.cancelled ? 'idle' : 'failed');
                },
            },
        );
    };

    return { rows: feed.rows, hasMore, status, loadMore };
}

/** Sits under the phone list. Reaching it loads the next page. */
export function ConsentFeedFooter({
    shown,
    total,
    hasMore,
    status,
    onLoadMore,
}: {
    shown: number;
    total: number;
    hasMore: boolean;
    status: Status;
    onLoadMore: () => void;
}) {
    const sentinel = useRef<HTMLDivElement>(null);
    const load = useRef(onLoadMore);

    useEffect(() => {
        load.current = onLoadMore;
    });

    useEffect(() => {
        const element = sentinel.current;

        if (!element || !hasMore || status !== 'idle') {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    load.current();
                }
            },
            { rootMargin: `0px 0px ${LOAD_AHEAD} 0px` },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [hasMore, status, shown]);

    return (
        <div
            ref={sentinel}
            data-testid="consent-feed-footer"
            className="mx-4 flex min-h-14 flex-col items-center justify-center gap-2 border-t py-4 text-sm text-muted-foreground tabular-nums"
        >
            {status === 'loading' && (
                <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Loading more
                </span>
            )}
            {status === 'failed' && (
                <>
                    <span>Couldn&rsquo;t load more consents.</span>
                    <Button variant="outline" onClick={onLoadMore}>
                        Try again
                    </Button>
                </>
            )}
            <p aria-live="polite">
                {shown === total
                    ? `All ${pluralize(total, CONSENTS)}`
                    : `${formatNumber(shown)} of ${pluralize(total, CONSENTS)}`}
            </p>
        </div>
    );
}
