import type { CSSProperties } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import {
    ChartCard,
    ChartTip,
    CHART_AREA,
    tipContent,
    useTipTrigger,
} from './chart-card';
import { formatCompact, formatDay, formatNumber, pluralize } from './format';
import type { DailyPoint } from './types';

// Blue and amber: tell apart in both themes and for red-green colour blindness.
const chartConfig = {
    accepted: {
        label: 'Accepted',
        theme: { light: 'oklch(0.55 0.17 255)', dark: 'oklch(0.72 0.14 250)' },
    },
    declined: {
        label: 'Declined',
        theme: { light: 'oklch(0.7 0.16 60)', dark: 'oklch(0.78 0.14 70)' },
    },
} satisfies ChartConfig;

/** Same two colours as the lines, for the legend in the card header. */
const LEGEND_COLOURS = {
    '--legend-accepted': 'oklch(0.55 0.17 255)',
    '--legend-declined': 'oklch(0.7 0.16 60)',
} as CSSProperties;

const ACCEPTED = { one: 'acceptance', other: 'acceptances' };
const DECLINED = { one: 'decline', other: 'declines' };

type Props = {
    data: DailyPoint[];
};

/**
 * No draw-in animation: an admin opens this page many times a day, and a
 * line that replays its 1.5s sweep on every visit only delays the read.
 */
export function ActivityChart({ data }: Props) {
    const tipTrigger = useTipTrigger();
    const accepted = data.reduce((sum, point) => sum + point.accepted, 0);
    const declined = data.reduce((sum, point) => sum + point.declined, 0);

    return (
        <ChartCard
            title="Daily responses"
            subtitle={`Last 30 days: ${pluralize(accepted, ACCEPTED)}, ${pluralize(declined, DECLINED)}`}
            info="Every accept and decline per day, by Malaysia date. Withdrawals are not counted here."
            aside={
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {(['accepted', 'declined'] as const).map((key) => (
                        <span key={key} className="flex items-center gap-1.5">
                            <span
                                aria-hidden
                                className="size-2 rounded-[2px]"
                                style={{ background: `var(--legend-${key})` }}
                            />
                            {chartConfig[key].label}
                        </span>
                    ))}
                </div>
            }
            style={LEGEND_COLOURS}
        >
            {accepted + declined === 0 && (
                <p className="pointer-events-none absolute inset-x-0 top-1/3 z-10 text-center text-sm text-muted-foreground">
                    No responses in the last 30 days.
                </p>
            )}
            <ChartContainer
                config={chartConfig}
                className={CHART_AREA}
                role="img"
                aria-label={`Daily consent responses over the last 30 days: ${pluralize(accepted, ACCEPTED)} and ${pluralize(declined, DECLINED)}.`}
            >
                <AreaChart data={data} margin={{ top: 8, left: 0, right: 8 }}>
                    <defs>
                        {(['accepted', 'declined'] as const).map((key) => (
                            <linearGradient
                                key={key}
                                id={`fill-${key}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={`var(--color-${key})`}
                                    stopOpacity={0.35}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={`var(--color-${key})`}
                                    stopOpacity={0.02}
                                />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={24}
                        tickFormatter={(value: string) => formatDay(value)}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={4}
                        width={40}
                        allowDecimals={false}
                        tickFormatter={(value: number) => formatCompact(value)}
                    />
                    <ChartTooltip
                        trigger={tipTrigger}
                        cursor={false}
                        isAnimationActive={false}
                        content={tipContent<DailyPoint>((day) => (
                            <ChartTip
                                title={formatDay(day.date, {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                                rows={[
                                    ['Accepted', formatNumber(day.accepted)],
                                    ['Declined', formatNumber(day.declined)],
                                    ['Accept rate', dayRate(day)],
                                ]}
                            />
                        ))}
                    />
                    <Area
                        dataKey="declined"
                        type="monotone"
                        fill="url(#fill-declined)"
                        stroke="var(--color-declined)"
                        strokeWidth={2}
                        isAnimationActive={false}
                    />
                    <Area
                        dataKey="accepted"
                        type="monotone"
                        fill="url(#fill-accepted)"
                        stroke="var(--color-accepted)"
                        strokeWidth={2}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ChartContainer>
        </ChartCard>
    );
}

function dayRate({ accepted, declined }: DailyPoint): string {
    const responses = accepted + declined;

    return responses === 0
        ? '—'
        : `${((accepted / responses) * 100).toFixed(1)}%`;
}
