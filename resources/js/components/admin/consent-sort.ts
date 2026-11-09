import type { SortColumn, SortDirection } from './types';

export const DEFAULT_SORT: SortColumn = 'accepted_at';

type SortOption = {
    value: SortColumn;
    label: string;
    /** The order a column starts in when it's first chosen. */
    first: SortDirection;
    asc: string;
    desc: string;
};

const DATES = {
    first: 'desc',
    asc: 'Oldest first',
    desc: 'Newest first',
} as const;
const TEXT = { first: 'asc', asc: 'A to Z', desc: 'Z to A' } as const;

export const SORT_OPTIONS: SortOption[] = [
    { value: 'accepted_at', label: 'Accepted at', ...DATES },
    { value: 'recorded_at', label: 'Recorded', ...DATES },
    { value: 'status', label: 'Status', ...TEXT },
    {
        value: 'version',
        label: 'Version',
        first: 'desc',
        asc: 'Lowest first',
        desc: 'Highest first',
    },
    { value: 'device', label: 'Device', ...TEXT },
    { value: 'guid', label: 'GUID', ...TEXT },
];

export function sortOption(column: SortColumn): SortOption {
    return (
        SORT_OPTIONS.find(({ value }) => value === column) ?? SORT_OPTIONS[0]
    );
}

/** "Newest first" for the default sort, "Status: A to Z" for the others. */
export function sortLabel(
    column: SortColumn,
    direction: SortDirection,
): string {
    const option = sortOption(column);

    return column === DEFAULT_SORT
        ? option[direction]
        : `${option.label}: ${option[direction]}`;
}
