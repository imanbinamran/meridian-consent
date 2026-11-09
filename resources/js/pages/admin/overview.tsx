import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    Percent,
    Undo2,
    Users,
    XCircle,
} from 'lucide-react';
import { AcceptRateChart } from '@/components/admin/accept-rate-chart';
import { ActivityChart } from '@/components/admin/activity-chart';
import { ConsentHealth } from '@/components/admin/consent-health';
import {
    comparisonHint,
    formatNumber,
    percentChange,
    pluralize,
} from '@/components/admin/format';
import { LiveIndicator } from '@/components/admin/live-indicator';
import { PageHeader } from '@/components/admin/page-header';
import { RenewalsChart } from '@/components/admin/renewals-chart';
import { StatCard } from '@/components/admin/stat-card';
import type {
    BreakdownBucket,
    DailyPoint,
    OverviewStats,
    RealtimeConfig,
    Renewals,
    WeeklyRate,
} from '@/components/admin/types';
import { WhoAccepted } from '@/components/admin/who-accepted';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLiveOverview } from '@/hooks/use-live-overview';
import { dashboard } from '@/routes';
import { exportMethod, index as consentsIndex } from '@/routes/admin/consents';

type Props = {
    realtime: RealtimeConfig | null;
    stats: OverviewStats;
    chart: DailyPoint[];
    browsers: BreakdownBucket[];
    devices: BreakdownBucket[];
    oses: BreakdownBucket[];
    health: BreakdownBucket[];
    acceptRate: WeeklyRate[];
    renewals: Renewals;
};

export default function Overview({
    realtime,
    stats,
    chart,
    browsers,
    devices,
    oses,
    health,
    acceptRate,
    renewals,
}: Props) {
    const liveStatus = useLiveOverview(realtime);
    const acceptedTrend = percentChange(stats.accepted7d, stats.acceptedPrev7d);
    const declinedTrend = percentChange(stats.declined7d, stats.declinedPrev7d);

    return (
        <>
            <Head title="Overview" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:px-6 md:py-5">
                <PageHeader
                    title="Overview"
                    status={
                        <>
                            <Badge variant="secondary" className="tabular-nums">
                                v{stats.currentVersion}
                            </Badge>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {pluralize(stats.acceptedCurrentVersion, {
                                    one: 'acceptance',
                                    other: 'acceptances',
                                })}{' '}
                                on this version
                            </span>
                            <LiveIndicator status={liveStatus} />
                        </>
                    }
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
                    className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5"
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
                        className="col-span-2 lg:col-span-1"
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
                </section>

                <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2">
                    <div className="min-w-0 md:col-span-2">
                        <ActivityChart data={chart} />
                    </div>
                    <div className="min-w-0">
                        <ConsentHealth buckets={health} />
                    </div>
                    <div className="min-w-0">
                        <AcceptRateChart weeks={acceptRate} />
                    </div>
                    <div className="min-w-0">
                        <RenewalsChart renewals={renewals} />
                    </div>
                    <section
                        aria-label="Accepted visitors only"
                        className="min-w-0"
                    >
                        <WhoAccepted
                            groups={[
                                { title: 'Device', buckets: devices },
                                { title: 'Browser', buckets: browsers },
                                { title: 'OS', buckets: oses },
                            ]}
                        />
                    </section>
                </div>
            </div>
        </>
    );
}

Overview.layout = {
    breadcrumbs: [{ title: 'Overview', href: dashboard() }],
};
