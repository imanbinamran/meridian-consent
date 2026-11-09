import { Inbox } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatNumber, pluralize } from './format';
import type { BreakdownBucket } from './types';

type Props = {
    title: string;
    buckets: BreakdownBucket[];
};

/** Same blue as "Accepted" in the daily chart: these are the same people. */
const BAR = 'bg-[oklch(0.55_0.17_255)] dark:bg-[oklch(0.72_0.14_250)]';

export function BreakdownCard({ title, buckets }: Props) {
    const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

    return (
        <Card className="min-w-0 gap-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {total === 0
                        ? 'Accepted visitors only, last 30 days'
                        : `Accepted visitors only, last 30 days, ${pluralize(total, { one: 'consent', other: 'consents' })}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {total === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                        <Inbox className="size-5" aria-hidden />
                        No accepted consents in the last 30 days.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {buckets.map((bucket) => (
                            <li key={bucket.label} className="space-y-1">
                                <div className="flex items-baseline justify-between gap-3 text-sm">
                                    <span className="min-w-0">
                                        {bucket.label}
                                    </span>
                                    <span className="shrink-0 text-muted-foreground tabular-nums">
                                        {formatNumber(bucket.count)}
                                        <span className="sr-only">, </span>
                                        <span className="inline-block min-w-[3.25rem] text-end font-medium text-foreground">
                                            {bucket.percent.toFixed(1)}%
                                        </span>
                                    </span>
                                </div>
                                <div
                                    className="h-2 overflow-hidden rounded-full bg-muted"
                                    aria-hidden
                                >
                                    <div
                                        className={cn(
                                            'h-full rounded-full',
                                            bucket.label === 'Unknown'
                                                ? 'bg-muted-foreground/60'
                                                : BAR,
                                        )}
                                        style={{ width: `${bucket.percent}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
