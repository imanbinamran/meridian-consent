import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** How far down the page, in pixels, before the button appears. */
const SHOW_AFTER = 400;

/** A round button in the corner that returns to the top of any long page. */
export function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const update = () => setVisible(scrollY > SHOW_AFTER);

        update();
        addEventListener('scroll', update, { passive: true });

        return () => removeEventListener('scroll', update);
    }, []);

    const goToTop = () => {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const main = document.querySelector<HTMLElement>('main');

        scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });

        // The button is about to hide, so keyboard focus needs somewhere to go.
        if (main) {
            main.tabIndex = -1;
            main.focus({ preventScroll: true });
        }
    };

    return (
        <button
            type="button"
            onClick={goToTop}
            aria-label="Back to top"
            title="Back to top"
            className={cn(
                'fixed end-[calc(1.25rem+env(safe-area-inset-right))] bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-30 inline-flex size-11 items-center justify-center rounded-full border border-foreground/15 bg-background text-foreground shadow-md transition-[opacity,transform,visibility,background-color] duration-200 ease-out-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transform-none',
                !visible && 'invisible translate-y-2 opacity-0',
            )}
        >
            <ArrowUp className="size-5" aria-hidden="true" />
        </button>
    );
}
