import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    FileCheck2,
    Percent,
    Undo2,
    Users,
    XCircle,
} from 'lucide-react';
import { ActivityChart } from '@/components/admin/activity-chart';
import { BreakdownCard } from '@/components/admin/breakdown-card';
import {
    comparisonHint,
    formatNumber,
    percentChange,
    pluralize,
} from '@/components/admin/format';
import { LiveIndicator } from '@/components/admin/live-indicator';
import { PageHeader } from '@/components/admin/page-header';
import { RecentAcceptances } from '@/components/admin/recent-acceptances';
import { StatCard } from '@/components/admin/stat-card';
import type {
    BreakdownBucket,
    DailyPoint,
    OverviewStats,
    RealtimeConfig,
    RecentConsent,
} from '@/components/admin/types';
import { Button } from '@/components/ui/button';
import { useLiveOverview } from '@/hooks/use-live-overview';
import { dashboard } from '@/routes';
import { exportMethod, index as consentsIndex } from '@/routes/admin/consents';

type Props = {
    timezone: string;
    realtime: RealtimeConfig | null;
    stats: OverviewStats;
    chart: DailyPoint[];
    browsers: BreakdownBucket[];
    devices: BreakdownBucket[];
    recent: RecentConsent[];
};

export default function Overview({
    timezone,
    realtime,
    stats,
    chart,
    browsers,
    devices,
    recent,
}: Props) {
    const liveStatus = useLiveOverview(realtime);
    const acceptedTrend = percentChange(stats.accepted7d, stats.acceptedPrev7d);
    const declinedTrend = percentChange(stats.declined7d, stats.declinedPrev7d);

    return (
        <>
            <Head title="Overview" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Overview"
                    description="How visitors are responding to the consent notice."
                    status={<LiveIndicator status={liveStatus} />}
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <a href={exportMethod.url()}>
                                    <Download aria-hidden />
                                    Export CSV
                                </a>
                            </Button>
                            <Button asChild>
                                <Link href={consentsIndex()} prefetch>
                                    Browse consents
                                </Link>
                            </Button>
                        </>
                    }
                />

                <section
                    aria-label="Key numbers"
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"
                >
                    <StatCard
                        label="Total accepted"
                        icon={Users}
                        value={formatNumber(stats.totalAccepted)}
                        hint={`All time, ${pluralize(stats.totalDeclined, { one: 'decline', other: 'declines' })}`}
                    />
                    <StatCard
                        label="Accepted, 7 days"
                        icon={CheckCircle2}
                        value={formatNumber(stats.accepted7d)}
                        trend={
                            acceptedTrend === null
                                ? null
                                : { value: acceptedTrend, upIsGood: true }
                        }
                        hint={comparisonHint(
                            stats.accepted7d,
                            stats.acceptedPrev7d,
                        )}
                    />
                    <StatCard
                        label="Declined, 7 days"
                        icon={XCircle}
                        value={formatNumber(stats.declined7d)}
                        trend={
                            declinedTrend === null
                                ? null
                                : { value: declinedTrend, upIsGood: false }
                        }
                        hint={comparisonHint(
                            stats.declined7d,
                            stats.declinedPrev7d,
                        )}
                    />
                    <StatCard
                        label="Withdrawn, 30 days"
                        icon={Undo2}
                        value={formatNumber(stats.withdrawn30d)}
                        hint={`${formatNumber(stats.totalWithdrawn)} all time`}
                    />
                    <StatCard
                        label="Accept rate, 30d"
                        icon={Percent}
                        value={
                            stats.acceptRate30d === null
                                ? '—'
                                : `${stats.acceptRate30d}%`
                        }
                        hint={
                            stats.responses30d === 0
                                ? 'No responses yet'
                                : `Of ${pluralize(stats.responses30d, { one: 'response', other: 'responses' })}`
                        }
                    />
                    <StatCard
                        label="Current version"
                        icon={FileCheck2}
                        value={`v${stats.currentVersion}`}
                        hint={`${pluralize(stats.acceptedCurrentVersion, { one: 'acceptance', other: 'acceptances' })} on this version`}
                    />
                </section>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="min-w-0 lg:col-span-2">
                        <ActivityChart data={chart} />
                    </div>
                    <div className="min-w-0">
                        <RecentAcceptances items={recent} timeZone={timezone} />
                    </div>
                </div>

                <section
                    aria-labelledby="breakdowns-heading"
                    className="flex flex-col gap-3"
                >
                    <div className="space-y-1">
                        <h2
                            id="breakdowns-heading"
                            className="text-lg font-semibold tracking-tight"
                        >
                            Accepted visitors only
                        </h2>
                        <p className="max-w-prose text-sm text-pretty text-muted-foreground">
                            Consents accepted in the last 30 days, including any
                            later withdrawn. Declines are anonymous and carry no
                            device data, so they are not counted here.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <BreakdownCard title="Browser" buckets={browsers} />
                        <BreakdownCard title="Device" buckets={devices} />
                    </div>
                </section>
            </div>
        </>
    );
}

Overview.layout = {
    breadcrumbs: [{ title: 'Overview', href: dashboard() }],
};
