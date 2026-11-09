/**
 * Moves a headline between a link and the article it opens, one word at a time.
 * Names exist only during the move, because the browser skips the whole
 * transition if two elements on a page share a view-transition-name.
 */
const ROOT_CLASS = 'story-morph';
const SOURCE_CLASS = 'is-morphing';

let activeSlug: string | null = null;
let focusSlug: string | null = null;
let focusHeading = false;

export function canMorph(): boolean {
    return typeof document !== 'undefined' && 'startViewTransition' in document;
}

export function beginMorph(slug: string, source: Element): void {
    if (!canMorph()) {
        return;
    }

    activeSlug = slug;
    source.classList.add(SOURCE_CLASS);
    document.documentElement.classList.add(ROOT_CLASS);
}

export function endMorph(): void {
    activeSlug = null;
    document.documentElement.classList.remove(ROOT_CLASS);
    document
        .querySelectorAll(`.${SOURCE_CLASS}`)
        .forEach((element) => element.classList.remove(SOURCE_CLASS));
}

export function morphClass(slug: string): string | undefined {
    return activeSlug === slug ? SOURCE_CLASS : undefined;
}

export function endMorphWhenDone(transition: ViewTransition): void {
    void transition.finished.finally(endMorph);
}

/** The link that was clicked is gone after the visit, so focus has to move. */
export function focusHeadingOnArrival(): void {
    focusHeading = true;
}

export function takeHeadingFocus(): boolean {
    const should = focusHeading;
    focusHeading = false;

    return should;
}

export function focusLinkOnReturn(slug: string): void {
    focusSlug = slug;
}

export function takeLinkFocus(slug: string): boolean {
    if (focusSlug !== slug) {
        return false;
    }

    focusSlug = null;

    return true;
}
