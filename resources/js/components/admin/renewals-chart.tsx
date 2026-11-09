import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import {
    ChartCard,
    CHART_AREA,
    ChartTip,
    tipContent,
    useTipTrigger,
} from './chart-card';
import { formatCompact, formatDay, formatNumber, pluralize } from './format';
import type { Renewals, RenewalMonth } from './types';

const chartConfig = {
    count: {
        label: 'Consents',
        theme: { light: 'oklch(0.55 0.17 255)', dark: 'oklch(0.72 0.14 250)' },
    },
    peak: {
        label: 'Busiest month',
        theme: { light: 'oklch(0.7 0.16 60)', dark: 'oklch(0.78 0.14 70)' },
    },
} satisfies ChartConfig;

const CONSENTS = { one: 'consent', other: 'consents' };

const monthDay = (month: string) => `${month}-01`;

type Props = {
    renewals: Renewals;
};

export function RenewalsChart({ renewals: { months, next30 } }: Props) {
    const tipTrigger = useTipTrigger();
    const peak = Math.max(...months.map((month) => month.count), 0);

    return (
        <ChartCard
            title="Renewals due"
            subtitle={`${pluralize(next30, CONSENTS)} in the next 30 days`}
            info="When today's valid consents reach one year and those visitors are asked again. Publishing a new notice version asks everyone at once, sooner than this."
            bodyClassName="h-40"
        >
            {peak === 0 ? (
                <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    Nothing due in the next 12 months.
                </p>
            ) : (
                <ChartContainer
                    config={chartConfig}
                    className={CHART_AREA}
                    role="img"
                    aria-label={`Consents expiring per month. ${pluralize(next30, CONSENTS)} in the next 30 days.`}
                >
                    <BarChart
                        data={months}
                        margin={{ top: 6, left: 0, right: 0, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                            minTickGap={16}
                            tickFormatter={(value: string) =>
                                formatDay(monthDay(value), { month: 'short' })
                            }
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={2}
                            width={34}
                            tickCount={3}
                            allowDecimals={false}
                            tickFormatter={(value: number) =>
                                formatCompact(value)
                            }
                        />
                        <ChartTooltip
                            trigger={tipTrigger}
                            cursor={false}
                            isAnimationActive={false}
                            content={tipContent<RenewalMonth>((row) => (
                                <ChartTip
                                    title={formatDay(monthDay(row.month), {
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                    rows={[
                                        ['Expiring', formatNumber(row.count)],
                                    ]}
                                    note={
                                        row.count === peak
                                            ? 'The busiest month for re-asks.'
                                            : undefined
                                    }
                                />
                            ))}
                        />
                        <Bar
                            dataKey="count"
                            radius={[3, 3, 0, 0]}
                            isAnimationActive={false}
                        >
                            {months.map((row) => (
                                <Cell
                                    key={row.month}
                                    fill={
                                        row.count === peak
                                            ? 'var(--color-peak)'
                                            : 'var(--color-count)'
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            )}
        </ChartCard>
    );
}
