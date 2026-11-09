import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, Download, FileSearch, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConsentFilters } from '@/components/admin/consent-filters';
import { ConsentsTable } from '@/components/admin/consents-table';
import { EmptyState } from '@/components/admin/empty-state';
import { BUSY_DELAY_MS } from '@/components/admin/motion';
import { PageHeader } from '@/components/admin/page-header';
import { TablePagination } from '@/components/admin/table-pagination';
import type {
    ConsentFilters as Filters,
    ConsentRow,
    Paginated,
} from '@/components/admin/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { exportMethod, index, show } from '@/routes/admin/consents';

type Props = {
    timezone: string;
    filters: Filters;
    consents: Paginated<ConsentRow>;
    versions: number[];
    currentVersion: number;
};

/** Props that change with the filters. Everything else stays put. */
const RELOAD = ['consents', 'filters'];

/** The query string for a set of filters: empty values and defaults left out. */
function toQuery(filters: Filters, page?: number) {
    return {
        search: filters.search || undefined,
        version: filters.version || undefined,
        status: filters.status || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        direction: filters.direction === 'asc' ? 'asc' : undefined,
        page: page && page > 1 ? page : undefined,
    };
}

export default function ConsentsIndex({
    timezone,
    filters,
    consents,
    versions,
    currentVersion,
}: Props) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [busy, setBusy] = useState(false);
    const busyTimer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(busyTimer.current), []);
    const filtering = Boolean(
        filters.search ||
        filters.version ||
        filters.status ||
        filters.from ||
        filters.to,
    );

    const visit = (next: Filters) => {
        router.get(index.url(), toQuery(next), {
            only: RELOAD,
            preserveState: true,
            preserveScroll: true,
            replace: true,
            // Only show the loading state if the reload is slow enough to notice.
            onStart: () => {
                window.clearTimeout(busyTimer.current);
                busyTimer.current = window.setTimeout(
                    () => setBusy(true),
                    BUSY_DELAY_MS,
                );
            },
            onFinish: () => {
                window.clearTimeout(busyTimer.current);
                setBusy(false);
            },
        });
    };

    const update = (changes: Partial<Filters>) =>
        visit({ ...filters, ...changes });

    const reset = () => visit({ direction: filters.direction });

    const errorMessages = Object.values(errors ?? {});

    return (
        <>
            <Head title="Consents" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Consents"
                    description={`Every recorded acceptance. Open a GUID to see its history. Times are shown in Malaysia time (${timezone}); hover a time to see UTC.`}
                    actions={
                        <Button variant="outline" asChild>
                            <a
                                href={exportMethod.url({
                                    query: {
                                        ...toQuery(filters),
                                        page: undefined,
                                    },
                                })}
                            >
                                <Download aria-hidden />
                                Export CSV
                            </a>
                        </Button>
                    }
                />

                {errorMessages.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle aria-hidden />
                        <AlertTitle>Some filters were not valid</AlertTitle>
                        <AlertDescription>
                            <p>
                                We cleared them and showed every consent
                                instead.
                            </p>
                            <ul className="list-inside list-disc">
                                {errorMessages.map((message) => (
                                    <li key={message}>{message}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <ConsentFilters
                    filters={filters}
                    versions={versions}
                    currentVersion={currentVersion}
                    onChange={update}
                    onReset={reset}
                />

                <Card className="gap-0 overflow-hidden py-0">
                    {consents.data.length > 0 ? (
                        <ConsentsTable
                            rows={consents.data}
                            timeZone={timezone}
                            direction={filters.direction}
                            onSort={(direction) => update({ direction })}
                            recordUrl={(guid) =>
                                show.url(guid, {
                                    query: toQuery(
                                        filters,
                                        consents.current_page,
                                    ),
                                })
                            }
                            busy={busy}
                        />
                    ) : filtering ? (
                        <EmptyState
                            icon={FileSearch}
                            title="No consents match these filters"
                            description="Try a shorter part of the GUID, another version or status, or a wider date range."
                            action={
                                <Button variant="outline" onClick={reset}>
                                    Clear filters
                                </Button>
                            }
                        />
                    ) : (
                        <EmptyState
                            icon={ShieldCheck}
                            title="No consents yet"
                            description="When a visitor accepts the notice on the site, it shows up here."
                        />
                    )}
                </Card>

                <TablePagination
                    currentPage={consents.current_page}
                    lastPage={consents.last_page}
                    total={consents.total}
                    from={consents.from}
                    to={consents.to}
                    pageUrl={(page) =>
                        index.url({ query: toQuery(filters, page) })
                    }
                    only={RELOAD}
                />
            </div>
        </>
    );
}

ConsentsIndex.layout = {
    breadcrumbs: [
        { title: 'Overview', href: dashboard() },
        { title: 'Consents', href: index() },
    ],
};
