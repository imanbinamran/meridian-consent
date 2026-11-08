import { Link } from '@inertiajs/react';
import type { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

/** A globe cut by a single meridian line. */
export function MeridianMark(props: SVGAttributes<SVGElement>) {
    return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
            <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
            />
            <ellipse
                cx="16"
                cy="16"
                rx="6"
                ry="14"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.55"
            />
            <path d="M16 2v28" stroke="currentColor" strokeWidth="2.5" />
            <path
                d="M3 16h26"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.55"
            />
        </svg>
    );
}

export function SiteLogo({ className }: { className?: string }) {
    return (
        <Link
            href={home()}
            className={cn(
                'inline-flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none',
                className,
            )}
        >
            <MeridianMark className="size-7 shrink-0 text-brand" />
            <span className="font-display text-[1.65rem] leading-none font-semibold tracking-tight">
                Meridian
            </span>
            <span className="sr-only">, home</span>
        </Link>
    );
}
