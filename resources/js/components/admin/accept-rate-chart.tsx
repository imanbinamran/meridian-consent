import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import {
    ChartCard,
    CHART_AREA,
    ChartTip,
    tipContent,
    useTipTrigger,
} from './chart-card';
import { formatDay, formatNumber } from './format';
import type { WeeklyRate } from './types';

const chartConfig = {
    rate: {
        label: 'Accept rate',
        theme: { light: 'oklch(0.55 0.17 255)', dark: 'oklch(0.72 0.14 250)' },
    },
} satisfies ChartConfig;

type Props = {
    weeks: WeeklyRate[];
};

export function AcceptRateChart({ weeks }: Props) {
    const tipTrigger = useTipTrigger();
    const known = weeks.filter((week) => week.rate !== null);
    const latest = known.at(-1)?.rate ?? null;
    const previous = known.at(-2)?.rate ?? null;
    const change =
        latest !== null && previous !== null ? latest - previous : null;

    return (
        <ChartCard
            title="Accept rate"
            subtitle={
                latest === null
                    ? 'Weekly, last 12 weeks'
                    : `${latest}% this week${change === null ? '' : `, ${change >= 0 ? '+' : '−'}${Math.abs(change).toFixed(1)} pts`}`
            }
            info="Of everyone who answered in each 7-day stretch, how many accepted. A dip after a wording change is the signal to look for. The scale zooms in, so small moves look bigger."
            bodyClassName="h-40"
        >
            {known.length === 0 ? (
                <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    No responses in the last 12 weeks.
                </p>
            ) : (
                <ChartContainer
                    config={chartConfig}
                    className={CHART_AREA}
                    role="img"
                    aria-label={`Weekly accept rate over the last 12 weeks, latest ${latest}%.`}
                >
                    <LineChart
                        data={weeks}
                        margin={{ top: 6, left: 0, right: 6, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="end"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                            minTickGap={28}
                            tickFormatter={(value: string) => formatDay(value)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={2}
                            width={34}
                            tickCount={3}
                            domain={[
                                (min: number) =>
                                    Math.max(0, Math.floor(min - 5)),
                                (max: number) =>
                                    Math.min(100, Math.ceil(max + 5)),
                            ]}
                            tickFormatter={(value: number) => `${value}%`}
                        />
                        <ChartTooltip
                            trigger={tipTrigger}
                            cursor={false}
                            isAnimationActive={false}
                            content={tipContent<WeeklyRate>((week) => (
                                <ChartTip
                                    title={`${formatDay(week.start)} to ${formatDay(week.end)}`}
                                    rows={[
                                        [
                                            'Accept rate',
                                            week.rate === null
                                                ? '—'
                                                : `${week.rate}%`,
                                        ],
                                        [
                                            'Accepted',
                                            formatNumber(week.accepted),
                                        ],
                                        [
                                            'Declined',
                                            formatNumber(week.declined),
                                        ],
                                    ]}
                                />
                            ))}
                        />
                        <Line
                            dataKey="rate"
                            type="monotone"
                            stroke="var(--color-rate)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ChartContainer>
            )}
        </ChartCard>
    );
}
