import { Info } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DetailPopover } from './detail-popover';

/** Fills the card's chart area, whatever height the screen gives it. */
export const CHART_AREA = 'absolute inset-0 aspect-auto h-full w-full';

type Props = {
    title: string;
    subtitle: ReactNode;
    /** What the numbers mean. Opens on hover, tap or keyboard. */
    info: ReactNode;
    /** Sits at the end of the title row, such as a legend. */
    aside?: ReactNode;
    style?: CSSProperties;
    /** Height on phones and tablets. From xl the row sets the height. */
    bodyClassName?: string;
    children: ReactNode;
};

export function ChartCard({
    title,
    subtitle,
    info,
    aside,
    style,
    bodyClassName = 'h-48',
    children,
}: Props) {
    return (
        <Card className="h-full min-w-0 gap-2 py-3.5" style={style}>
            <div className="flex items-start justify-between gap-3 px-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-1">
                        <h2 className="text-sm font-semibold">{title}</h2>
                        <DetailPopover
                            aria-label={`About ${title}`}
                            className="-my-1 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                            trigger={<Info className="size-3.5" aria-hidden />}
                        >
                            <p className="max-w-60 text-pretty">{info}</p>
                        </DetailPopover>
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">
                        {subtitle}
                    </p>
                </div>
                {aside}
            </div>
            <div
                className={cn(
                    'relative mx-4 xl:h-auto xl:min-h-24 xl:flex-1 [&_.recharts-wrapper_*]:outline-none',
                    bodyClassName,
                )}
            >
                {children}
            </div>
        </Card>
    );
}

type TipProps = {
    title: string;
    rows: [label: string, value: string][];
    note?: string;
};

export function ChartTip({ title, rows, note }: TipProps) {
    return (
        <div className="grid min-w-36 gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl">
            <p className="font-medium">{title}</p>
            {rows.map(([label, value]) => (
                <p key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium tabular-nums">{value}</span>
                </p>
            ))}
            {note && (
                <p className="max-w-52 text-pretty text-muted-foreground">
                    {note}
                </p>
            )}
        </div>
    );
}

const noSubscribe = () => () => {};

/** Charts only follow a mouse. On a touch screen a tap shows the tooltip. */
export function useTipTrigger(): 'hover' | 'click' {
    const touch = useSyncExternalStore(
        noSubscribe,
        () => window.matchMedia('(hover: none)').matches,
        () => false,
    );

    return touch ? 'click' : 'hover';
}

type TipState = {
    active?: boolean;
    payload?: readonly { payload?: unknown }[];
};

/** Turn a chart's hovered row into tooltip content. */
export function tipContent<Row>(render: (row: Row) => ReactNode) {
    return function TipContent({ active, payload }: TipState) {
        const row = payload?.[0]?.payload;

        return active && row ? render(row as Row) : null;
    };
}
