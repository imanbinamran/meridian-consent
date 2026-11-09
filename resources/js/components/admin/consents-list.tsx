import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime, formatDevice } from './format';
import { StatusBadge } from './status-badge';
import type { ConsentRow } from './types';

type Props = {
    rows: ConsentRow[];
    timeZone: string;
    /** Where each row links to. */
    recordUrl: (guid: string) => string;
    /** True once a reload has taken longer than a blink. */
    busy?: boolean;
};

/** The consents table as one column, for when the table's columns don't fit. */
export function ConsentsList({
    rows,
    timeZone,
    recordUrl,
    busy = false,
}: Props) {
    return (
        <ul
            aria-label="Consents"
            aria-busy={busy}
            className={cn(
                'divide-y transition-opacity duration-150 ease-out',
                busy && 'opacity-50',
            )}
        >
            {rows.map((row) => (
                <li key={row.id}>
                    <Link
                        href={recordUrl(row.guid)}
                        className="flex min-h-11 items-center gap-2 px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset active:bg-muted/50"
                    >
                        <div className="grid min-w-0 flex-1 gap-1.5">
                            <span
                                dir="ltr"
                                className="font-mono text-xs leading-5 wrap-anywhere"
                            >
                                <span className="sr-only">View record </span>
                                {row.guid}
                            </span>
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <StatusBadge status={row.status} />
                                <time
                                    dir="ltr"
                                    dateTime={row.acceptedAt}
                                    className="text-sm whitespace-nowrap tabular-nums"
                                >
                                    {formatDateTime(row.acceptedAt, timeZone)}
                                </time>
                            </span>
                            <span className="text-sm text-muted-foreground">
                                v{row.version} · {formatDevice(row)}
                            </span>
                        </div>
                        <ChevronRight
                            className="size-4 shrink-0 text-muted-foreground rtl:rotate-180"
                            aria-hidden
                        />
                    </Link>
                </li>
            ))}
        </ul>
    );
}
