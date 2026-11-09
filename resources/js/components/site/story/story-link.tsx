import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { show } from '@/routes/stories';
import { cn } from '@/lib/utils';
import {
    beginMorph,
    endMorphWhenDone,
    focusHeadingOnArrival,
    morphClass,
    takeLinkFocus,
} from './morph';
import { canResume, readEntry } from './reading-store';
import type { ReadingEntry } from './reading-store';

let resumeAt: number | null = null;

/** The saved position, if the visitor arrived by choosing to resume. */
export function takeResumePosition(): number | null {
    const position = resumeAt;
    resumeAt = null;

    return position;
}

/** The visitor's reading state for a story, read after the first render. */
export function useReadingEntry(slug: string): ReadingEntry | null {
    const [entry, setEntry] = useState<ReadingEntry | null>(null);

    useEffect(() => {
        setEntry(readEntry(slug));
    }, [slug]);

    return entry;
}

type StoryLinkProps = {
    slug: string;
    className?: string;
    children: ReactNode;
    /** Open at the saved position instead of the top, with no headline move. */
    resume?: boolean;
} & Pick<ComponentProps<'a'>, 'aria-label'>;

/** A link to a story whose headline moves into the article. */
export function StoryLink({
    slug,
    className,
    children,
    resume = false,
    ...rest
}: StoryLinkProps) {
    const ref = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (takeLinkFocus(slug)) {
            ref.current?.focus({ preventScroll: true });
        }
    }, [slug]);

    return (
        <Link
            ref={ref}
            href={show.url(slug)}
            prefetch
            preserveScroll={resume}
            viewTransition={resume ? false : endMorphWhenDone}
            className={cn(morphClass(slug), className)}
            onClick={(event) => {
                focusHeadingOnArrival();

                if (resume) {
                    const entry = readEntry(slug);

                    resumeAt = canResume(entry) ? entry.progress : null;
                } else {
                    beginMorph(slug, event.currentTarget);
                }
            }}
            {...rest}
        >
            {children}
        </Link>
    );
}
