import { Cell, Pie, PieChart } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { ChartCard, ChartTip, tipContent, useTipTrigger } from './chart-card';
import { formatNumber, pluralize } from './format';
import type { BreakdownBucket } from './types';

const chartConfig = {
    valid: {
        label: 'Valid',
        theme: { light: 'oklch(0.55 0.17 255)', dark: 'oklch(0.72 0.14 250)' },
    },
    expired: {
        label: 'Expired',
        theme: { light: 'oklch(0.7 0.16 60)', dark: 'oklch(0.78 0.14 70)' },
    },
    withdrawn: {
        label: 'Withdrawn',
        theme: { light: 'oklch(0.58 0.2 20)', dark: 'oklch(0.72 0.16 20)' },
    },
} satisfies ChartConfig;

const NOTES: Record<string, string> = {
    Valid: 'Under a year old, on the current version and not withdrawn.',
    Expired: 'Over a year old, or given for an older version.',
    Withdrawn: 'The visitor took their consent back.',
};

const colour = (label: string) => `var(--color-${label.toLowerCase()})`;

type Props = {
    buckets: BreakdownBucket[];
};

export function ConsentHealth({ buckets }: Props) {
    const tipTrigger = useTipTrigger();
    const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
    const valid = buckets.find((bucket) => bucket.label === 'Valid');

    return (
        <ChartCard
            title="Consent health"
            subtitle={`${pluralize(total, { one: 'consent', other: 'consents' })}, right now`}
            info="What every consent on record counts as today. Valid is the number you can rely on."
            bodyClassName="h-36"
        >
            {total === 0 ? (
                <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    No consents yet.
                </p>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center gap-5">
                    <div className="relative aspect-square h-full max-h-44">
                        <ChartContainer
                            config={chartConfig}
                            className="absolute inset-0 aspect-auto h-full w-full"
                            role="img"
                            aria-label={buckets
                                .map(
                                    (bucket) =>
                                        `${bucket.label} ${bucket.percent}%`,
                                )
                                .join(', ')}
                        >
                            <PieChart
                                margin={{
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                }}
                            >
                                <ChartTooltip
                                    trigger={tipTrigger}
                                    cursor={false}
                                    isAnimationActive={false}
                                    content={tipContent<BreakdownBucket>(
                                        (bucket) => (
                                            <ChartTip
                                                title={bucket.label}
                                                rows={[
                                                    [
                                                        'Consents',
                                                        formatNumber(
                                                            bucket.count,
                                                        ),
                                                    ],
                                                    [
                                                        'Share',
                                                        `${bucket.percent.toFixed(1)}%`,
                                                    ],
                                                ]}
                                                note={NOTES[bucket.label]}
                                            />
                                        ),
                                    )}
                                />
                                <Pie
                                    data={buckets}
                                    dataKey="count"
                                    nameKey="label"
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    paddingAngle={2}
                                    stroke="none"
                                    isAnimationActive={false}
                                >
                                    {buckets.map((bucket) => (
                                        <Cell
                                            key={bucket.label}
                                            fill={colour(bucket.label)}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums">
                            {Math.round(valid?.percent ?? 0)}%
                        </p>
                    </div>
                    <ul className="min-w-0 space-y-1.5 text-xs">
                        {buckets.map((bucket) => (
                            <li
                                key={bucket.label}
                                className="flex items-center gap-2 tabular-nums"
                            >
                                <span
                                    aria-hidden
                                    className="size-2 shrink-0 rounded-[2px]"
                                    style={{ background: SWATCH[bucket.label] }}
                                />
                                <span className="text-muted-foreground">
                                    {bucket.label}
                                </span>
                                <span className="font-medium">
                                    {formatNumber(bucket.count)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </ChartCard>
    );
}

const SWATCH: Record<string, string> = {
    Valid: 'oklch(0.6 0.16 255)',
    Expired: 'oklch(0.74 0.15 65)',
    Withdrawn: 'oklch(0.64 0.18 20)',
};
