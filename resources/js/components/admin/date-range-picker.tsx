import { format, isValid, parse, subMonths } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { POPOVER_MOTION } from './motion';

const DAY = 'yyyy-MM-dd';

type Value = { from?: string; to?: string };

type Props = {
    id?: string;
    value: Value;
    onChange: (value: Value) => void;
    className?: string;
};

function toDate(day?: string): Date | undefined {
    if (!day) {
        return undefined;
    }

    const date = parse(day, DAY, new Date());

    return isValid(date) ? date : undefined;
}

function label({ from, to }: Value): string {
    const start = toDate(from);
    const end = toDate(to);

    if (start && end) {
        return start.getFullYear() === end.getFullYear()
            ? `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`
            : `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`;
    }

    if (start) {
        return `From ${format(start, 'd MMM yyyy')}`;
    }

    if (end) {
        return `Until ${format(end, 'd MMM yyyy')}`;
    }

    return 'Any date';
}

/** Pick a from/to range of Malaysia calendar days. Applies on "Apply". */
export function DateRangePicker({ id, value, onChange, className }: Props) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DateRange | undefined>();
    const active = Boolean(value.from || value.to);

    const openChange = (next: boolean) => {
        if (next) {
            const from = toDate(value.from);
            setDraft(from ? { from, to: toDate(value.to) } : undefined);
        }

        setOpen(next);
    };

    const apply = () => {
        onChange({
            from: draft?.from ? format(draft.from, DAY) : undefined,
            to: draft?.to
                ? format(draft.to, DAY)
                : draft?.from
                  ? format(draft.from, DAY)
                  : undefined,
        });
        setOpen(false);
    };

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <Popover open={open} onOpenChange={openChange}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        className={cn(
                            'w-full justify-start font-normal tabular-nums sm:w-auto',
                            !active && 'text-muted-foreground',
                        )}
                    >
                        <CalendarDays aria-hidden />
                        {label(value)}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className={cn('w-auto gap-0 p-0', POPOVER_MOTION)}
                    align="start"
                    collisionPadding={16}
                >
                    <Calendar
                        mode="range"
                        numberOfMonths={isMobile ? 1 : 2}
                        selected={draft}
                        onSelect={setDraft}
                        // Two months on desktop end on this month, not next
                        // month, which would be all disabled future days.
                        defaultMonth={
                            draft?.from ??
                            (isMobile ? new Date() : subMonths(new Date(), 1))
                        }
                        endMonth={new Date()}
                        disabled={{ after: new Date() }}
                        weekStartsOn={1}
                    />
                    <div className="flex items-center justify-end gap-2 border-t p-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDraft(undefined)}
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={apply}
                            disabled={!draft?.from && !active}
                        >
                            Apply
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
            {active && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label="Clear date range"
                    onClick={() => onChange({})}
                >
                    <X aria-hidden />
                </Button>
            )}
        </div>
    );
}
