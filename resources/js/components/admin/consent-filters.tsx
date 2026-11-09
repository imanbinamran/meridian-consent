import { Search, X } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from './date-range-picker';
import type { ConsentFilters as Filters, ConsentStatus } from './types';

const SEARCH_DELAY_MS = 300;

type Props = {
    filters: Filters;
    versions: number[];
    currentVersion: number;
    onChange: (changes: Partial<Filters>) => void;
    onReset: () => void;
};

export function ConsentFilters({
    filters,
    versions,
    currentVersion,
    onChange,
    onReset,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const applySearch = useEffectEvent((value: string) =>
        onChange({ search: value || undefined }),
    );

    // Wait for a pause in typing before asking the server.
    useEffect(() => {
        const trimmed = search.trim().toLowerCase();

        if (trimmed === (filters.search ?? '')) {
            return;
        }

        const timer = window.setTimeout(
            () => applySearch(trimmed),
            SEARCH_DELAY_MS,
        );

        return () => window.clearTimeout(timer);
    }, [search, filters.search]);

    const active = Boolean(
        filters.search ||
        filters.version ||
        filters.status ||
        filters.from ||
        filters.to,
    );

    return (
        <div
            role="search"
            aria-label="Filter consents"
            className="flex flex-wrap items-start gap-3"
        >
            <div className="grid min-w-0 flex-[1_1_18rem] gap-1.5">
                <Label htmlFor="consent-search" className="sr-only">
                    Search by GUID
                </Label>
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <Input
                        id="consent-search"
                        type="search"
                        inputMode="search"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Search by GUID, e.g. 3f2a9c"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        maxLength={100}
                        className="ps-9 font-mono placeholder:font-sans"
                    />
                </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <Label htmlFor="consent-version" className="sr-only">
                    Version
                </Label>
                <Select
                    value={filters.version ? String(filters.version) : 'all'}
                    onValueChange={(value) =>
                        onChange({
                            version:
                                value === 'all' ? undefined : Number(value),
                        })
                    }
                >
                    <SelectTrigger
                        id="consent-version"
                        className="w-full sm:w-40"
                        aria-label="Version"
                    >
                        <SelectValue placeholder="All versions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All versions</SelectItem>
                        {versions.map((version) => (
                            <SelectItem key={version} value={String(version)}>
                                v{version}
                                {version === currentVersion && ' (current)'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Label htmlFor="consent-status" className="sr-only">
                    Status
                </Label>
                <Select
                    value={filters.status ?? 'all'}
                    onValueChange={(value) =>
                        onChange({
                            status:
                                value === 'all'
                                    ? undefined
                                    : (value as ConsentStatus),
                        })
                    }
                >
                    <SelectTrigger
                        id="consent-status"
                        className="w-full sm:w-40"
                        aria-label="Status"
                    >
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                </Select>

                <DateRangePicker
                    id="consent-dates"
                    value={{ from: filters.from, to: filters.to }}
                    onChange={({ from, to }) => onChange({ from, to })}
                />

                {active && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setSearch('');
                            onReset();
                        }}
                    >
                        <X aria-hidden />
                        Clear filters
                    </Button>
                )}
            </div>
        </div>
    );
}
