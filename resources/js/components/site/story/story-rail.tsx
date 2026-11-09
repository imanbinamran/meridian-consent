import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { saveProgress } from './reading-store';
import type { StorySection } from './types';

/** Where a section counts as "being read", down the viewport. */
const READING_LINE = 0.55;
/** Below this, a section's name would touch its neighbour's. */
const MIN_LABEL_GAP = 22;
/** The phone bar sits under the site header and is this tall. */
const PHONE_BAR = 36;

function clamp(value: number): number {
    return Math.min(1, Math.max(0, value));
}

/**
 * The line beside the text. It shows the story to scale, with a small globe
 * that turns as it travels. On phones it folds into a bar under the header.
 * Scroll-driven CSS moves it where supported; otherwise measure() does.
 */
export function StoryRail({
    storyRef,
    sections,
    slug,
    minutes,
}: {
    storyRef: RefObject<HTMLDivElement | null>;
    sections: StorySection[];
    slug: string;
    minutes: number;
}) {
    const railRef = useRef<HTMLElement>(null);
    const [positions, setPositions] = useState<number[]>(() =>
        sections.map(() => 0),
    );
    const [crowded, setCrowded] = useState(false);
    const [current, setCurrent] = useState(0);
    const [left, setLeft] = useState(`${minutes} min left`);

    useEffect(() => {
        const story = storyRef.current;
        const rail = railRef.current;

        if (!story || !rail) {
            return;
        }

        const native = CSS.supports('animation-timeline', 'view()');
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const phone = matchMedia('(max-width: 1099px)');
        const header = document.querySelector('.site-header');
        const elements = [
            ...story.querySelectorAll<HTMLElement>('[data-section]'),
        ];
        let frame = 0;

        const inset = () =>
            (header?.getBoundingClientRect().bottom ?? 0) +
            (phone.matches ? PHONE_BAR : 0);

        const layout = () => {
            const box = story.getBoundingClientRect();
            const top = inset();
            const range = box.height - (innerHeight - top);
            const line = innerHeight * READING_LINE - top;
            const next = elements.map((element) =>
                clamp(
                    (element.getBoundingClientRect().top - box.top - line) /
                        range,
                ),
            );

            setPositions(next);
            setCrowded(
                next.some(
                    (position, index) =>
                        index > 0 &&
                        (position - next[index - 1]) * rail.offsetHeight <
                            MIN_LABEL_GAP,
                ),
            );
        };

        const measure = () => {
            frame = 0;

            const top = inset();
            const box = story.getBoundingClientRect();
            const progress = clamp(
                (top - box.top) / (box.height - (innerHeight - top)),
            );

            saveProgress(slug, progress);

            if (!native || reduced.matches) {
                rail.style.setProperty('--progress', progress.toFixed(4));
                rail.style.setProperty(
                    '--turn',
                    Math.cos(progress * Math.PI * 4).toFixed(3),
                );
            }

            let section = 0;

            elements.forEach((element, index) => {
                if (
                    element.getBoundingClientRect().top <=
                    innerHeight * READING_LINE
                ) {
                    section = index;
                }
            });

            setCurrent(section);
            setLeft(
                progress >= 0.995
                    ? 'Finished'
                    : `${Math.max(1, Math.ceil((1 - progress) * minutes))} min left`,
            );
        };

        const schedule = () => {
            frame ||= requestAnimationFrame(measure);
        };
        const refresh = () => {
            layout();
            measure();
        };

        refresh();
        addEventListener('scroll', schedule, { passive: true });
        addEventListener('resize', refresh);

        const resized = new ResizeObserver(refresh);

        resized.observe(story);

        return () => {
            cancelAnimationFrame(frame);
            removeEventListener('scroll', schedule);
            removeEventListener('resize', refresh);
            resized.disconnect();
        };
    }, [storyRef, slug, minutes]);

    return (
        <nav
            ref={railRef}
            className="story-rail"
            aria-label="Sections of this story"
            data-crowded={crowded || undefined}
        >
            <div className="story-rail-track" />
            <div className="story-rail-fill" />
            <ol className="story-rail-ticks">
                {sections.map((section, index) => (
                    <li key={section.id}>
                        <a
                            href={`#${section.id}`}
                            style={{ top: `${positions[index] * 100}%` }}
                            aria-current={
                                index === current ? 'true' : undefined
                            }
                            onClick={(event) => {
                                event.preventDefault();
                                document
                                    .getElementById(section.id)
                                    ?.scrollIntoView();
                            }}
                        >
                            {section.name}
                        </a>
                    </li>
                ))}
            </ol>
            <div className="story-rail-globe" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                    <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    />
                    <ellipse
                        className="story-rail-turn"
                        cx="16"
                        cy="16"
                        rx="7"
                        ry="14"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M3 16h26"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity=".55"
                    />
                </svg>
            </div>
            <p className="story-rail-left" aria-hidden="true">
                {left}
            </p>
            <p className="story-rail-now" aria-hidden="true">
                <span>{sections[current].name}</span>
                <span>{left}</span>
            </p>
        </nav>
    );
}
