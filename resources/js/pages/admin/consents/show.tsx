import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, History } from 'lucide-react';
import type { ReactNode } from 'react';
import { CopyButton } from '@/components/admin/copy-button';
import { LocalTime } from '@/components/admin/local-time';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import type { ConsentRecord } from '@/components/admin/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { show } from '@/routes/admin/consents';

type Props = {
    timezone: string;
    backUrl: string;
    consent: ConsentRecord;
};

const EVENT_LABELS: Record<string, string> = {
    accepted: 'Accepted',
    withdrawn: 'Withdrawn',
};

function Detail({
    label,
    className,
    children,
}: {
    label: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn('grid min-w-0 gap-1', className)}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-sm font-medium">{children}</dd>
        </div>
    );
}

export default function ConsentShow({ timezone, backUrl, consent }: Props) {
    return (
        <>
            <Head title="Consent record" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Consent record"
                    description={`Times are shown in Malaysia time (${timezone}); hover a time to see UTC.`}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={backUrl}>
                                <ArrowLeft
                                    className="rtl:rotate-180"
                                    aria-hidden
                                />
                                Back to consents
                            </Link>
                        </Button>
                    }
                />

                <div className="grid items-start gap-4 lg:grid-cols-2">
                    <Card className="min-w-0 gap-4">
                        <CardHeader>
                            <CardTitle>
                                <h2>Details</h2>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <Detail label="GUID" className="sm:col-span-2">
                                    <div className="flex items-start gap-1">
                                        <span
                                            dir="ltr"
                                            className="min-w-0 font-mono text-xs leading-6 font-normal break-all"
                                        >
                                            {consent.guid}
                                        </span>
                                        <CopyButton
                                            value={consent.guid}
                                            label="Copy GUID"
                                        />
                                    </div>
                                </Detail>
                                <Detail label="Status">
                                    <StatusBadge status={consent.status} />
                                </Detail>
                                <Detail label="Version">
                                    <Badge
                                        variant={
                                            consent.isCurrent
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                        className="tabular-nums"
                                        title={
                                            consent.isCurrent
                                                ? 'Current version'
                                                : 'Not the current version'
                                        }
                                    >
                                        v{consent.version}
                                    </Badge>
                                </Detail>
                                <Detail label="Device">
                                    {consent.deviceType}
                                </Detail>
                                <Detail label="Browser">
                                    {consent.browserFamily}
                                </Detail>
                                <Detail label="Operating system">
                                    {consent.osFamily}
                                </Detail>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="min-w-0 gap-4">
                        <CardHeader>
                            <CardTitle>
                                <h2>History</h2>
                            </CardTitle>
                            <CardDescription>
                                Every change to this consent, oldest first.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {consent.events.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                                    <History className="size-5" aria-hidden />
                                    No events recorded for this consent.
                                </div>
                            ) : (
                                <ol className="divide-y">
                                    {consent.events.map((event) => (
                                        <li
                                            key={event.id}
                                            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0"
                                        >
                                            <span className="text-sm font-medium">
                                                {EVENT_LABELS[event.type] ??
                                                    event.type}
                                            </span>
                                            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <LocalTime
                                                    iso={event.occurredAt}
                                                    timeZone={timezone}
                                                />
                                                <Badge
                                                    variant="outline"
                                                    className="tabular-nums"
                                                >
                                                    v{event.version}
                                                </Badge>
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ConsentShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Overview', href: dashboard() },
        { title: 'Consents', href: props.backUrl },
        { title: 'Record', href: show(props.consent.guid) },
    ],
});
