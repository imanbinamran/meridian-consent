import { Link } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { sortOption } from './consent-sort';
import { CopyButton } from './copy-button';
import { formatDevice, formatRecent, formatUtc } from './format';
import { LocalTime } from './local-time';
import { PRESSABLE } from './motion';
import { StatusBadge } from './status-badge';
import type { ConsentRow, SortColumn, SortDirection } from './types';

type Props = {
    rows: ConsentRow[];
    timeZone: string;
    sort: SortColumn;
    direction: SortDirection;
    onSort: (sort: SortColumn, direction: SortDirection) => void;
    /** Where each row's GUID links to. */
    recordUrl: (guid: string) => string;
    /** True once a reload has taken longer than a blink. */
    busy?: boolean;
};

export function ConsentsTable({
    rows,
    timeZone,
    sort,
    direction,
    onSort,
    recordUrl,
    busy = false,
}: Props) {
    const sorting = { sort, direction, onSort };

    return (
        <Table className="min-w-[56rem]" aria-busy={busy}>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <SortableHead column="guid" className="ps-4" {...sorting} />
                    <SortableHead column="version" {...sorting} />
                    <SortableHead column="status" {...sorting} />
                    <SortableHead column="device" {...sorting} />
                    <SortableHead column="accepted_at" {...sorting} />
                    <SortableHead
                        column="recorded_at"
                        className="pe-4"
                        {...sorting}
                    />
                </TableRow>
            </TableHeader>
            {/* Dim, don't swap for a skeleton: the rows keep their place, and a
                reload under the delay never shows a loading state at all. */}
            <TableBody
                className={cn(
                    'transition-opacity duration-150 ease-out',
                    busy && 'opacity-50',
                )}
            >
                {rows.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell className="ps-4">
                            <div className="flex items-center gap-1">
                                <Link
                                    href={recordUrl(row.guid)}
                                    dir="ltr"
                                    className="rounded-sm font-mono text-xs whitespace-nowrap underline decoration-muted-foreground/40 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <span className="sr-only">
                                        View record{' '}
                                    </span>
                                    {row.guid}
                                </Link>
                                <CopyButton
                                    value={row.guid}
                                    label="Copy GUID"
                                />
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge
                                variant={
                                    row.isCurrent ? 'secondary' : 'outline'
                                }
                                className="shrink-0 tabular-nums"
                                title={
                                    row.isCurrent
                                        ? 'Current version'
                                        : 'Not the current version'
                                }
                            >
                                v{row.version}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="min-w-40 whitespace-normal">
                            {formatDevice(row)}
                        </TableCell>
                        <TableCell>
                            <LocalTime
                                iso={row.acceptedAt}
                                timeZone={timeZone}
                            />
                        </TableCell>
                        <TableCell className="pe-4 whitespace-nowrap text-muted-foreground tabular-nums">
                            {row.recordedAt ? (
                                <time
                                    dir="ltr"
                                    dateTime={row.recordedAt}
                                    title={formatUtc(row.recordedAt)}
                                >
                                    {formatRecent(row.recordedAt, timeZone)}
                                </time>
                            ) : (
                                <span aria-label="Not recorded">—</span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function SortableHead({
    column,
    sort,
    direction,
    onSort,
    className,
}: {
    column: SortColumn;
    sort: SortColumn;
    direction: SortDirection;
    onSort: (sort: SortColumn, direction: SortDirection) => void;
    className?: string;
}) {
    const option = sortOption(column);
    const active = column === sort;
    const opposite = direction === 'desc' ? 'asc' : 'desc';
    const next = active ? opposite : option.first;
    const Icon = !active
        ? ArrowUpDown
        : direction === 'desc'
          ? ArrowDown
          : ArrowUp;
    const ariaSort = direction === 'desc' ? 'descending' : 'ascending';

    return (
        <TableHead
            className={className}
            aria-sort={active ? ariaSort : undefined}
        >
            <button
                type="button"
                onClick={() => onSort(column, next)}
                className={cn(
                    '-ms-2 inline-flex items-center gap-1 rounded-md px-2 py-1 whitespace-nowrap hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    PRESSABLE,
                )}
            >
                {option.label}
                <Icon
                    className={cn('size-3.5', !active && 'opacity-40')}
                    aria-hidden
                />
            </button>
        </TableHead>
    );
}
