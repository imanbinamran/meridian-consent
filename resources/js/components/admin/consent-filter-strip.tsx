import { format } from 'date-fns';
import { ChevronDown, Filter } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import {
    DEFAULT_SORT,
    SORT_OPTIONS,
    sortLabel,
    sortOption,
} from './consent-sort';
import { DAY, dateRangeLabel, toDate } from './date-range-picker';
import type {
    ConsentFilters as Filters,
    ConsentStatus,
    SortColumn,
    SortDirection,
} from './types';

type Scope = 'all' | 'sort' | 'version' | 'status' | 'dates';
type Draft = Pick<
    Filters,
    'version' | 'status' | 'from' | 'to' | 'sort' | 'direction'
>;

const TITLES: Record<Scope, string> = {
    all: 'Filters',
    sort: 'Sort',
    version: 'Version',
    status: 'Status',
    dates: 'Date range',
};

const ALL = 'all';

/** Keeps the strip compact while each control still has a 44px tap height. */
const TAP_AREA = 'relative before:absolute before:inset-x-0 before:-inset-y-1';

const STATUS_OPTIONS: { value: ConsentStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'withdrawn', label: 'Withdrawn' },
];

function toDraft({
    version,
    status,
    from,
    to,
    sort,
    direction,
}: Filters): Draft {
    return { version, status, from, to, sort, direction };
}

type Props = {
    filters: Filters;
    versions: number[];
    currentVersion: number;
    onChange: (changes: Partial<Filters>) => void;
};

/** Sort, version, status and date controls as chips, for narrow screens. */
export function ConsentFilterStrip({
    filters,
    versions,
    currentVersion,
    onChange,
}: Props) {
    const [open, setOpen] = useState(false);
    // Stays set while the sheet animates out, so its content doesn't jump.
    const [scope, setScope] = useState<Scope>('all');
    const [draft, setDraft] = useState<Draft>(() => toDraft(filters));
    const opener = useRef<HTMLButtonElement | null>(null);

    const hasDates = Boolean(filters.from || filters.to);
    const activeCount = [filters.version, filters.status, hasDates].filter(
        Boolean,
    ).length;

    const show = (next: Scope, button: HTMLButtonElement) => {
        opener.current = button;
        setDraft(toDraft(filters));
        setScope(next);
        setOpen(true);
    };

    const apply = (next: Draft) => {
        onChange(next);
        setOpen(false);
    };

    // A chip's single choice applies at once. The other sheets wait for Apply.
    const choose = (changes: Partial<Draft>) => {
        const next = { ...draft, ...changes };
        setDraft(next);

        if (scope === 'version' || scope === 'status') {
            apply(next);
        }
    };

    const titled = scope === 'all';
    const showVersion = scope === 'all' || scope === 'version';
    const showStatus = scope === 'all' || scope === 'status';
    const showDates = scope === 'all' || scope === 'dates';
    const showSort = scope === 'all' || scope === 'sort';
    const showFooter = scope === 'all' || scope === 'sort' || scope === 'dates';
    const sortedByDefault =
        filters.sort === DEFAULT_SORT && filters.direction === 'desc';
    const draftOption = sortOption(draft.sort);

    const reset = () =>
        setDraft(
            scope === 'sort'
                ? { ...draft, sort: DEFAULT_SORT, direction: 'desc' }
                : {
                      sort: draft.sort,
                      direction: draft.direction,
                      version: scope === 'all' ? undefined : draft.version,
                      status: scope === 'all' ? undefined : draft.status,
                  },
        );

    const range: DateRange | undefined = toDate(draft.from)
        ? { from: toDate(draft.from), to: toDate(draft.to) }
        : undefined;

    return (
        <div className="flex w-full min-w-0 items-center gap-2 @4xl/consents:hidden">
            <Button
                type="button"
                variant="outline"
                aria-haspopup="dialog"
                aria-label={
                    activeCount > 0
                        ? `Filters, ${activeCount} active`
                        : 'Filters'
                }
                className={cn(
                    TAP_AREA,
                    activeCount > 0 && 'border-foreground/30 bg-muted',
                )}
                onClick={(event) => show('all', event.currentTarget)}
            >
                <Filter aria-hidden />
                {activeCount > 0 && (
                    <span className="tabular-nums">{activeCount}</span>
                )}
            </Button>

            <div className="-mx-1 -my-1 flex min-w-0 flex-1 [scrollbar-width:none] gap-2 overflow-x-auto px-1 py-1 [&::-webkit-scrollbar]:hidden">
                <Chip
                    label="Sort"
                    value={sortLabel(filters.sort, filters.direction)}
                    quiet={sortedByDefault}
                    onClick={(button) => show('sort', button)}
                />
                <Chip
                    label="Version"
                    value={filters.version ? `v${filters.version}` : undefined}
                    onClick={(button) => show('version', button)}
                />
                <Chip
                    label="Status"
                    value={
                        STATUS_OPTIONS.find(
                            ({ value }) => value === filters.status,
                        )?.label
                    }
                    onClick={(button) => show('status', button)}
                />
                <Chip
                    label="Date"
                    value={
                        hasDates
                            ? dateRangeLabel({
                                  from: filters.from,
                                  to: filters.to,
                              })
                            : undefined
                    }
                    onClick={(button) => show('dates', button)}
                />
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="bottom"
                    className="mx-auto max-h-[85dvh] max-w-lg rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
                    onCloseAutoFocus={(event) => {
                        // Controlled, so Radix has no trigger to go back to.
                        event.preventDefault();
                        opener.current?.focus();
                    }}
                >
                    <SheetHeader className="p-4 pe-14">
                        <SheetTitle>{TITLES[scope]}</SheetTitle>
                        <SheetDescription className="sr-only">
                            {scope === 'sort'
                                ? 'Choose the order consents are listed in.'
                                : 'Choose which consents to show.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-4 pb-4">
                        {showVersion && (
                            <Section title="Version" titled={titled}>
                                <Options
                                    label="Version"
                                    value={
                                        draft.version
                                            ? String(draft.version)
                                            : ALL
                                    }
                                    options={[
                                        { value: ALL, label: 'All versions' },
                                        ...versions.map((version) => ({
                                            value: String(version),
                                            label:
                                                version === currentVersion
                                                    ? `v${version} (current)`
                                                    : `v${version}`,
                                        })),
                                    ]}
                                    onSelect={(value) =>
                                        choose({
                                            version:
                                                value === ALL
                                                    ? undefined
                                                    : Number(value),
                                        })
                                    }
                                />
                            </Section>
                        )}

                        {showStatus && (
                            <Section title="Status" titled={titled}>
                                <Options
                                    label="Status"
                                    value={draft.status ?? ALL}
                                    options={[
                                        { value: ALL, label: 'All statuses' },
                                        ...STATUS_OPTIONS,
                                    ]}
                                    onSelect={(value) =>
                                        choose({
                                            status:
                                                value === ALL
                                                    ? undefined
                                                    : (value as ConsentStatus),
                                        })
                                    }
                                />
                            </Section>
                        )}

                        {showSort && (
                            <>
                                <Section title="Sort by" titled>
                                    <Options
                                        label="Sort by"
                                        value={draft.sort}
                                        options={SORT_OPTIONS}
                                        onSelect={(value) =>
                                            choose({
                                                sort: value as SortColumn,
                                                direction: sortOption(
                                                    value as SortColumn,
                                                ).first,
                                            })
                                        }
                                    />
                                </Section>
                                <Section title="Order" titled>
                                    <Options
                                        label="Order"
                                        value={draft.direction}
                                        options={[
                                            {
                                                value: 'desc',
                                                label: draftOption.desc,
                                            },
                                            {
                                                value: 'asc',
                                                label: draftOption.asc,
                                            },
                                        ]}
                                        onSelect={(value) =>
                                            choose({
                                                direction:
                                                    value as SortDirection,
                                            })
                                        }
                                    />
                                </Section>
                            </>
                        )}

                        {showDates && (
                            <Section title="Date range" titled={titled}>
                                <Calendar
                                    className="p-0"
                                    classNames={{ root: 'w-full' }}
                                    mode="range"
                                    numberOfMonths={1}
                                    selected={range}
                                    onSelect={(next) =>
                                        choose({
                                            from: next?.from
                                                ? format(next.from, DAY)
                                                : undefined,
                                            // A lone first tap is one day.
                                            to:
                                                next?.to || next?.from
                                                    ? format(
                                                          (next.to ??
                                                              next.from) as Date,
                                                          DAY,
                                                      )
                                                    : undefined,
                                        })
                                    }
                                    defaultMonth={range?.from ?? new Date()}
                                    endMonth={new Date()}
                                    disabled={{ after: new Date() }}
                                    weekStartsOn={1}
                                />
                            </Section>
                        )}
                    </div>

                    {showFooter && (
                        <SheetFooter className="mt-0 flex-row border-t p-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-11 flex-1"
                                onClick={reset}
                            >
                                Reset
                            </Button>
                            <Button
                                type="button"
                                className="h-11 flex-1"
                                onClick={() => apply(draft)}
                            >
                                Apply
                            </Button>
                        </SheetFooter>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function Chip({
    label,
    value,
    quiet = false,
    onClick,
}: {
    label: string;
    value?: string;
    /** Shows the value without marking it as something the admin changed. */
    quiet?: boolean;
    onClick: (button: HTMLButtonElement) => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            aria-haspopup="dialog"
            aria-label={value ? `${label}: ${value}` : label}
            className={cn(
                TAP_AREA,
                'font-normal tabular-nums',
                value && !quiet
                    ? 'border-foreground/30 bg-muted'
                    : 'text-muted-foreground',
            )}
            onClick={(event) => onClick(event.currentTarget)}
        >
            {value ?? label}
            <ChevronDown data-icon="inline-end" aria-hidden />
        </Button>
    );
}

function Section({
    title,
    titled,
    children,
}: {
    title: string;
    /** Off when the sheet's own title already says it. */
    titled: boolean;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            {titled && <h3 className="text-sm font-medium">{title}</h3>}
            {children}
        </div>
    );
}

function Options({
    label,
    value,
    options,
    onSelect,
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onSelect: (value: string) => void;
}) {
    return (
        <ToggleGroup
            type="single"
            variant="outline"
            aria-label={label}
            value={value}
            // Radix sends '' when the chosen item is tapped again. Keep it.
            onValueChange={(next) => next && onSelect(next)}
            className="w-full flex-wrap"
        >
            {options.map((option) => (
                <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-11 px-4 data-[state=on]:border-foreground/40"
                >
                    {option.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}
