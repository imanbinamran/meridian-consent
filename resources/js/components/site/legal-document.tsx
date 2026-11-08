import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Kicker, MeridianLines } from './section-heading';

export type LegalSection = {
    id: string;
    title: string;
    body: ReactNode;
};

const updatedFormat = new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

/**
 * Shared shell for the Privacy Policy and the Terms & Conditions: a title
 * block, a table of contents that tracks the section in view, and the body.
 */
export function LegalDocument({
    kicker,
    title,
    intro,
    updated,
    sections,
}: {
    kicker: string;
    title: string;
    intro: ReactNode;
    /** ISO date, e.g. 2026-11-08. */
    updated: string;
    sections: LegalSection[];
}) {
    const active = useActiveSection(sections.map((section) => section.id));
    // Open beside the text on wide screens; folded away on phones so the
    // policy itself comes first.
    const [tocOpen, setTocOpen] = useState(
        () =>
            typeof window === 'undefined' ||
            window.matchMedia('(min-width: 1024px)').matches,
    );

    return (
        <>
            <header className="relative overflow-hidden border-b border-foreground/10">
                <MeridianLines className="absolute -end-72 -top-64 size-[48rem] text-foreground/[0.05]" />
                <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 lg:px-8">
                    <Kicker>{kicker}</Kicker>
                    <h1 className="mt-6 font-display text-[2.6rem] leading-[1.04] font-medium tracking-tight sm:text-6xl">
                        {title}
                    </h1>
                    <div className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
                        {intro}
                    </div>
                    <p className="mt-6 text-sm text-muted-foreground">
                        Last updated{' '}
                        <time
                            dateTime={updated}
                            className="font-medium text-foreground"
                        >
                            {updatedFormat.format(
                                new Date(`${updated}T00:00:00`),
                            )}
                        </time>
                    </p>
                </div>
            </header>

            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-16">
                <nav
                    aria-labelledby="toc-title"
                    className="lg:sticky lg:top-32 lg:col-span-4 lg:self-start xl:col-span-3"
                >
                    <details
                        open={tocOpen}
                        onToggle={(event) =>
                            setTocOpen(event.currentTarget.open)
                        }
                        className="group rounded-2xl border border-foreground/10 bg-muted/40 p-5 lg:border-0 lg:bg-transparent lg:p-0"
                    >
                        <summary className="flex cursor-pointer list-none items-center justify-between rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:pointer-events-none [&::-webkit-details-marker]:hidden">
                            <h2
                                id="toc-title"
                                className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                            >
                                Contents
                            </h2>
                            <ChevronDown
                                aria-hidden="true"
                                className="size-4 text-muted-foreground transition-transform group-open:rotate-180 lg:hidden"
                            />
                        </summary>
                        <ol className="mt-4 space-y-0.5 border-s border-foreground/10">
                            {sections.map((section, index) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        aria-current={
                                            active === section.id
                                                ? 'location'
                                                : undefined
                                        }
                                        className={cn(
                                            '-ms-px flex gap-3 border-s-2 border-transparent py-1.5 ps-4 text-sm leading-snug text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                            active === section.id &&
                                                'border-primary font-medium text-foreground',
                                        )}
                                    >
                                        <span className="w-5 shrink-0 text-xs leading-5 tabular-nums">
                                            {index + 1}.
                                        </span>
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </details>
                </nav>

                <article className="min-w-0 lg:col-span-8 xl:col-span-9 xl:max-w-3xl">
                    {sections.map((section, index) => (
                        <section
                            key={section.id}
                            id={section.id}
                            aria-labelledby={`${section.id}-title`}
                            className="scroll-mt-32 border-t border-foreground/10 py-10 first:border-t-0 first:pt-0"
                        >
                            <h2
                                id={`${section.id}-title`}
                                className="flex items-baseline gap-3 font-display text-2xl leading-tight font-medium tracking-tight sm:text-[1.75rem]"
                            >
                                <span
                                    aria-hidden="true"
                                    className="font-sans text-sm font-semibold text-brand tabular-nums"
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                {section.title}
                            </h2>
                            <div className="legal-prose mt-5">
                                {section.body}
                            </div>
                        </section>
                    ))}
                </article>
            </div>
        </>
    );
}

/** The id of the section nearest the top of the viewport. */
function useActiveSection(ids: string[]): string | undefined {
    const [active, setActive] = useState<string | undefined>(ids[0]);
    const key = ids.join('|');

    useEffect(() => {
        const elements = key
            .split('|')
            .map((id) => document.getElementById(id))
            .filter((element): element is HTMLElement => element !== null);

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );

                if (visible[0]) {
                    setActive(visible[0].target.id);
                }
            },
            { rootMargin: '-20% 0px -70% 0px' },
        );

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [key]);

    return active;
}
