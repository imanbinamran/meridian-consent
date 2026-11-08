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
};

/** A timestamp shown in local time, with the exact UTC value on hover or focus. */
export function LocalTime({ iso, timeZone, className, children }: Props) {
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
