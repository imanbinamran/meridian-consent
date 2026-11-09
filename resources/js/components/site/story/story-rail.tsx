import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, RefObject } from 'react';
import { useI18n } from '@/lib/i18n';
import { saveProgress } from './reading-store';
import type { StorySection } from './types';

/** Where a section counts as "being read", down the viewport. */
const READING_LINE = 0.55;
/** Below this, a section's name would touch its neighbour's. */
const MIN_LABEL_GAP = 22;
/** The phone bar sits under the site header and is this tall. */
const PHONE_BAR = 36;

/** How far each key moves the globe, as a share of the story. */
const KEY_STEPS: Record<string, number> = {
    ArrowUp: -0.02,
    ArrowLeft: -0.02,
    ArrowDown: 0.02,
    ArrowRight: 0.02,
    PageUp: -0.1,
    PageDown: 0.1,
};

function clamp(value: number): number {
    return Math.min(1, Math.max(0, value));
}

/** Where the story starts on the page and how far it scrolls. Desktop only. */
function storyScroll(story: HTMLElement) {
    const top =
        document.querySelector('.site-header')?.getBoundingClientRect()
            .bottom ?? 0;
    const box = story.getBoundingClientRect();

    return {
        start: box.top + scrollY - top,
        range: box.height - (innerHeight - top),
    };
}

/**
 * The line beside the text. It shows the story to scale, with a small globe
 * that turns as it travels and can be dragged to scroll the story. On phones
 * it folds into a bar under the header.
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
    // Minutes, or null once finished. Worded at render, so a language switch shows.
    const [minutesLeft, setMinutesLeft] = useState<number | null>(minutes);
    const { t } = useI18n();
    const left =
        minutesLeft === null
            ? t('common.story.finished')
            : t('common.story.min_left', { minutes: minutesLeft });
    const [percent, setPercent] = useState(0);
    const [dragging, setDragging] = useState(false);
    const drag = useRef<{
        pointerY: number;
        scroll: number;
        perPixel: number;
        min: number;
        max: number;
    } | null>(null);

    const startDrag = (event: PointerEvent<HTMLDivElement>) => {
        const story = storyRef.current;
        const rail = railRef.current;

        if (event.button !== 0 || !story || !rail) {
            return;
        }

        const { start, range } = storyScroll(story);

        // The page moves under the pointer, and a browser link drag would
        // otherwise start from whatever link has landed there.
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
            pointerY: event.clientY,
            scroll: scrollY,
            perPixel: range / rail.offsetHeight,
            min: Math.min(scrollY, start),
            max: Math.max(scrollY, start + range),
        };
        setDragging(true);
    };

    const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
        const active = drag.current;

        if (!active) {
            return;
        }

        const top =
            active.scroll + (event.clientY - active.pointerY) * active.perPixel;

        scrollTo({
            top: Math.min(active.max, Math.max(active.min, top)),
            behavior: 'instant',
        });
    };

    const endDrag = () => {
        drag.current = null;
        setDragging(false);
    };

    const moveByKey = (event: KeyboardEvent<HTMLDivElement>) => {
        const story = storyRef.current;
        const step = KEY_STEPS[event.key];

        if (
            !story ||
            (step === undefined && !['Home', 'End'].includes(event.key))
        ) {
            return;
        }

        event.preventDefault();

        const { start, range } = storyScroll(story);
        const target =
            step === undefined
                ? Number(event.key === 'End')
                : clamp((scrollY - start) / range + step);

        scrollTo({ top: start + target * range, behavior: 'instant' });
    };

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
            setPercent(Math.round(progress * 100));

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
            setMinutesLeft(
                progress >= 0.995
                    ? null
                    : Math.max(1, Math.ceil((1 - progress) * minutes)),
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
            aria-label={t('common.story.sections_nav')}
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
            <div
                className="story-rail-globe"
                role="slider"
                tabIndex={0}
                title={t('common.story.drag_to_scroll')}
                aria-label={t('common.story.reading_position')}
                aria-orientation="vertical"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-valuetext={`${sections[current].name}, ${left}`}
                data-dragging={dragging || undefined}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onLostPointerCapture={endDrag}
                onKeyDown={moveByKey}
            >
                <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
