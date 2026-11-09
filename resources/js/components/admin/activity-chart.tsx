import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCompact, formatDay, pluralize } from './format';
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
    const accepted = data.reduce((sum, point) => sum + point.accepted, 0);
    const declined = data.reduce((sum, point) => sum + point.declined, 0);

    return (
        <Card className="h-full gap-4">
            <CardHeader>
                <CardTitle>Daily responses</CardTitle>
                <CardDescription className="max-w-prose tabular-nums">
                    Accepted and declined over the last 30 days, by Malaysia
                    date: {pluralize(accepted, ACCEPTED)},{' '}
                    {pluralize(declined, DECLINED)}.
                </CardDescription>
            </CardHeader>
            <CardContent className="relative ps-2 pe-4 sm:ps-4 sm:pe-6">
                {accepted + declined === 0 && (
                    <p className="pointer-events-none absolute inset-x-0 top-1/3 z-10 text-center text-sm text-muted-foreground">
                        No responses in the last 30 days.
                    </p>
                )}
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-64 w-full sm:h-72"
                    role="img"
                    aria-label={`Daily consent responses over the last 30 days: ${pluralize(accepted, ACCEPTED)} and ${pluralize(declined, DECLINED)}.`}
                >
                    <AreaChart
                        data={data}
                        margin={{ top: 8, left: 0, right: 8 }}
                    >
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
                            tickFormatter={(value: number) =>
                                formatCompact(value)
                            }
                        />
                        <ChartTooltip
                            cursor={false}
                            isAnimationActive={false}
                            itemSorter={(item) =>
                                item.dataKey === 'accepted' ? 0 : 1
                            }
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    labelFormatter={(value) =>
                                        formatDay(String(value), {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })
                                    }
                                />
                            }
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
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
