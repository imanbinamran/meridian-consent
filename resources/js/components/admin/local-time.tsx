import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDateTime, formatUtc } from './format';

type Props = {
    iso: string;
    timeZone: string;
    className?: string;
    /** Visible text; defaults to the full local date and time. */
    children?: React.ReactNode;
    /** Print the UTC value under the time instead of in a tooltip. */
    showUtc?: boolean;
};

/** A timestamp shown in local time, with the exact UTC value on hover or focus. */
export function LocalTime({
    iso,
    timeZone,
    className,
    children,
    showUtc = false,
}: Props) {
    if (showUtc) {
        return (
            <span className="grid gap-0.5">
                <time
                    dateTime={iso}
                    dir="ltr"
                    className={cn('whitespace-nowrap tabular-nums', className)}
                >
                    {children ?? formatDateTime(iso, timeZone)}
                </time>
                <span
                    dir="ltr"
                    className="font-mono text-xs whitespace-nowrap tabular-nums"
                >
                    {formatUtc(iso)}
                </span>
            </span>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <time
                    dateTime={iso}
                    dir="ltr"
                    tabIndex={0}
                    className={cn(
                        'cursor-default rounded-sm whitespace-nowrap tabular-nums underline decoration-muted-foreground/40 decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        className,
                    )}
                >
                    {children ?? formatDateTime(iso, timeZone)}
                </time>
            </TooltipTrigger>
            <TooltipContent>
                <span className="font-mono tabular-nums">{formatUtc(iso)}</span>
            </TooltipContent>
        </Tooltip>
    );
}
