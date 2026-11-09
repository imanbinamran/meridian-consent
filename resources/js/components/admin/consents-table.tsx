import { ArrowDown, ArrowUp } from 'lucide-react';
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
import { CopyButton } from './copy-button';
import { formatDevice, formatRecent, formatUtc } from './format';
import { LocalTime } from './local-time';
import { PRESSABLE } from './motion';
import { StatusBadge } from './status-badge';
import type { ConsentRow, SortDirection } from './types';

type Props = {
    rows: ConsentRow[];
    timeZone: string;
    direction: SortDirection;
    onSort: (direction: SortDirection) => void;
    /** True once a reload has taken longer than a blink. */
    busy?: boolean;
};

export function ConsentsTable({
    rows,
    timeZone,
    direction,
    onSort,
    busy = false,
}: Props) {
    const SortIcon = direction === 'desc' ? ArrowDown : ArrowUp;

    return (
        <Table className="min-w-[56rem]" aria-busy={busy}>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="ps-4">GUID</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead
                        aria-sort={
                            direction === 'desc' ? 'descending' : 'ascending'
                        }
                    >
                        <button
                            type="button"
                            onClick={() =>
                                onSort(direction === 'desc' ? 'asc' : 'desc')
                            }
                            className={cn(
                                '-ms-2 inline-flex items-center gap-1 rounded-md px-2 py-1 whitespace-nowrap hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                PRESSABLE,
                            )}
                        >
                            Accepted at
                            <SortIcon className="size-3.5" aria-hidden />
                            <span className="sr-only">
                                {direction === 'desc'
                                    ? ', newest first. Sort oldest first'
                                    : ', oldest first. Sort newest first'}
                            </span>
                        </button>
                    </TableHead>
                    <TableHead className="pe-4">Recorded</TableHead>
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
                                <span
                                    dir="ltr"
                                    className="font-mono text-xs whitespace-nowrap"
                                >
                                    {row.guid}
                                </span>
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
