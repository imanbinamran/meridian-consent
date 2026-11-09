import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatSignedPercent } from './format';

type Trend = {
    /** Whole percent change against the previous period. */
    value: number;
    /** Whether a rise is good news (acceptances) or bad news (declines). */
    upIsGood: boolean;
};

type Props = {
    label: string;
    value: ReactNode;
    icon: LucideIcon;
    hint?: ReactNode;
    trend?: Trend | null;
    className?: string;
};

export function StatCard({
    label,
    value,
    icon: Icon,
    hint,
    trend,
    className,
}: Props) {
    return (
        <Card className={cn('@container min-w-0 gap-2 py-4', className)}>
            <CardHeader className="flex flex-row items-start justify-between gap-1 px-3.5">
                <h3 className="min-w-0 text-sm font-medium text-muted-foreground">
                    {label}
                </h3>
                <Icon
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                />
            </CardHeader>
            <CardContent className="space-y-1 px-3.5">
                {/* Numbers never truncate: the size steps down with the card instead. */}
                <p className="text-2xl font-semibold tracking-tight tabular-nums @[13rem]:text-3xl">
                    {value}
                </p>
                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground tabular-nums">
                    {trend && <TrendPill {...trend} />}
                    {hint}
                </p>
            </CardContent>
        </Card>
    );
}

function TrendPill({ value, upIsGood }: Trend) {
    const good = value === 0 ? null : value > 0 === upIsGood;

    return (
        <span
            dir="ltr"
            className={cn(
                'inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 font-medium whitespace-nowrap tabular-nums',
                good === null && 'bg-muted text-muted-foreground',
                good === true &&
                    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                good === false &&
                    'bg-rose-500/10 text-rose-700 dark:text-rose-400',
            )}
        >
            {formatSignedPercent(value)}
        </span>
    );
}
