import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatNumber, pluralize } from './format';

type Props = {
    currentPage: number;
    lastPage: number;
    total: number;
    from: number | null;
    to: number | null;
    /** Build the URL for a page, keeping the current filters. */
    pageUrl: (page: number) => string;
    /** Props to reload; the rest of the page stays as it is. */
    only: string[];
};

const CONSENTS = { one: 'consent', other: 'consents' };

function summary(total: number, from: number | null, to: number | null) {
    if (total === 0 || from === null || to === null) {
        return 'No consents';
    }

    if (from === to) {
        return `Showing ${formatNumber(from)} of ${pluralize(total, CONSENTS)}`;
    }

    return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${pluralize(total, CONSENTS)}`;
}

/** Page numbers to show: first, last, and a window around the current page. */
function pageWindow(current: number, last: number): (number | 'gap')[] {
    const pages = new Set([1, last, current - 1, current, current + 1]);
    const sorted = [...pages]
        .filter((page) => page >= 1 && page <= last)
        .sort((a, b) => a - b);

    return sorted.flatMap((page, i) => {
        const previous = sorted[i - 1];

        if (previous === undefined || page - previous === 1) {
            return [page];
        }

        return page - previous === 2 ? [previous + 1, page] : ['gap', page];
    });
}

export function TablePagination({
    currentPage,
    lastPage,
    total,
    from,
    to,
    pageUrl,
    only,
}: Props) {
    const linkProps = { only, preserveState: true, preserveScroll: true };

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-between gap-3 sm:flex-row',
                total === 0 && 'hidden',
            )}
        >
            <p
                className="text-sm text-muted-foreground tabular-nums"
                aria-live="polite"
            >
                {summary(total, from, to)}
            </p>

            {lastPage > 1 && (
                <nav aria-label="Pagination">
                    <ul className="flex items-center gap-1">
                        <li>
                            <PageButton
                                href={pageUrl(currentPage - 1)}
                                disabled={currentPage <= 1}
                                label="Previous page"
                                linkProps={linkProps}
                            >
                                <ChevronLeft
                                    className="rtl:rotate-180"
                                    aria-hidden
                                />
                                <span className="hidden sm:inline">
                                    Previous
                                </span>
                            </PageButton>
                        </li>
                        {pageWindow(currentPage, lastPage).map((page, i) =>
                            page === 'gap' ? (
                                <li
                                    key={`gap-${i}`}
                                    aria-hidden
                                    className="hidden px-1 text-muted-foreground sm:block"
                                >
                                    …
                                </li>
                            ) : (
                                <li
                                    key={page}
                                    className={cn(
                                        page !== currentPage &&
                                            'hidden sm:block',
                                    )}
                                >
                                    <Button
                                        variant={
                                            page === currentPage
                                                ? 'outline'
                                                : 'ghost'
                                        }
                                        size="icon"
                                        className="w-auto min-w-9 px-2 tabular-nums"
                                        asChild
                                    >
                                        <Link
                                            href={pageUrl(page)}
                                            aria-label={`Page ${formatNumber(page)}`}
                                            aria-current={
                                                page === currentPage
                                                    ? 'page'
                                                    : undefined
                                            }
                                            {...linkProps}
                                        >
                                            {formatNumber(page)}
                                        </Link>
                                    </Button>
                                </li>
                            ),
                        )}
                        <li
                            className="px-1 text-sm whitespace-nowrap text-muted-foreground tabular-nums sm:hidden"
                            aria-hidden
                        >
                            of {formatNumber(lastPage)}
                        </li>
                        <li>
                            <PageButton
                                href={pageUrl(currentPage + 1)}
                                disabled={currentPage >= lastPage}
                                label="Next page"
                                linkProps={linkProps}
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight
                                    className="rtl:rotate-180"
                                    aria-hidden
                                />
                            </PageButton>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}

function PageButton({
    href,
    disabled,
    label,
    linkProps,
    children,
}: {
    href: string;
    disabled: boolean;
    label: string;
    linkProps: {
        only: string[];
        preserveState: boolean;
        preserveScroll: boolean;
    };
    children: React.ReactNode;
}) {
    if (disabled) {
        return (
            <Button variant="ghost" disabled aria-label={label}>
                {children}
            </Button>
        );
    }

    return (
        <Button variant="ghost" asChild>
            <Link href={href} aria-label={label} {...linkProps}>
                {children}
            </Link>
        </Button>
    );
}
