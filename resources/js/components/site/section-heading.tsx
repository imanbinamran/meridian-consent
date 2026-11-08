import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Kicker({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <p
            className={cn(
                'flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase',
                className,
            )}
        >
            <span aria-hidden="true" className="h-px w-8 bg-primary" />
            {children}
        </p>
    );
}

export function SectionHeading({
    kicker,
    title,
    description,
    id,
    className,
}: {
    kicker: string;
    title: string;
    description?: ReactNode;
    id?: string;
    className?: string;
}) {
    return (
        <div className={cn('max-w-2xl', className)}>
            <Kicker>{kicker}</Kicker>
            <h2
                id={id}
                className="mt-4 font-display text-3xl leading-[1.1] font-medium tracking-tight text-balance sm:text-4xl"
            >
                {title}
            </h2>
            {description && (
                <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
                    {description}
                </p>
            )}
        </div>
    );
}

/** Faint longitude lines, used behind page heroes. */
export function MeridianLines({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 800 800"
            fill="none"
            aria-hidden="true"
            className={cn('pointer-events-none', className)}
        >
            {[60, 140, 220, 300, 380].map((rx) => (
                <ellipse
                    key={rx}
                    cx="400"
                    cy="400"
                    rx={rx}
                    ry="390"
                    stroke="currentColor"
                    strokeWidth="1"
                />
            ))}
            <circle cx="400" cy="400" r="390" stroke="currentColor" />
            <path d="M400 10v780" stroke="currentColor" strokeWidth="1.5" />
            {[160, 280, 400, 520, 640].map((y) => (
                <path
                    key={y}
                    d={`M${400 - Math.sqrt(390 ** 2 - (y - 400) ** 2)} ${y}H${400 + Math.sqrt(390 ** 2 - (y - 400) ** 2)}`}
                    stroke="currentColor"
                    strokeWidth="1"
                />
            ))}
        </svg>
    );
}
