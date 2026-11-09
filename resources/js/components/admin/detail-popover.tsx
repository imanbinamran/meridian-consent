import type { PointerEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Props = {
    trigger: ReactNode;
    children: ReactNode;
    className?: string;
    'aria-label'?: string;
};

/**
 * More detail on demand. A tooltip never opens on a phone, so this opens on
 * hover with a mouse, and on tap or the keyboard everywhere else.
 */
export function DetailPopover({
    trigger,
    children,
    className,
    'aria-label': ariaLabel,
}: Props) {
    const [open, setOpen] = useState(false);
    const byHover = useRef(false);

    const hover = (next: boolean) => (event: PointerEvent) => {
        if (event.pointerType === 'mouse') {
            byHover.current ||= next;
            setOpen(next);
        }
    };

    const keepFocus = (event: Event) => {
        if (byHover.current) {
            event.preventDefault();
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                aria-label={ariaLabel}
                className={cn(
                    'cursor-default focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    className,
                )}
                onPointerEnter={hover(true)}
                onPointerLeave={hover(false)}
            >
                {trigger}
            </PopoverTrigger>
            <PopoverContent
                collisionPadding={12}
                sideOffset={6}
                className="pointer-events-none w-auto max-w-[min(20rem,calc(100vw-1.5rem))] p-2.5 text-xs"
                onOpenAutoFocus={keepFocus}
                onCloseAutoFocus={(event) => {
                    keepFocus(event);
                    byHover.current = false;
                }}
            >
                {children}
            </PopoverContent>
        </Popover>
    );
}
