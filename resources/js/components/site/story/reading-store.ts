/**
 * How far a visitor has read each story. It always lives in memory for the
 * open tab. It is written to the browser only after they accept cookies, and
 * removed as soon as they have not. It is never sent to the server.
 */
export type ReadingEntry = { progress: number; finished: boolean };

const KEY = 'meridian.reading';
const SAVE_STEP = 0.02;

const memory = new Map<string, ReadingEntry>();
let allowed = false;
let lastSaved = new Map<string, number>();

function write(): void {
    if (!allowed) {
        return;
    }

    try {
        localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(memory)));
    } catch {
        // Private windows and full storage: memory still works for this tab.
    }
}

function restore(): void {
    try {
        const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<
            string,
            ReadingEntry
        >;

        Object.entries(saved).forEach(([slug, entry]) => {
            if (!memory.has(slug)) {
                memory.set(slug, entry);
            }
        });
    } catch {
        // Unreadable or blocked storage counts as nothing saved.
    }
}

/** Called by the consent provider whenever the visitor's choice is known. */
export function setReadingStorageAllowed(next: boolean): void {
    if (next === allowed) {
        if (!next) {
            forget();
        }

        return;
    }

    allowed = next;

    if (next) {
        restore();
        write();
    } else {
        forget();
    }
}

function forget(): void {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // Nothing to remove if storage is blocked.
    }
}

export function readEntry(slug: string): ReadingEntry | null {
    return memory.get(slug) ?? null;
}

export function saveProgress(slug: string, progress: number): void {
    const finished = memory.get(slug)?.finished ?? false;

    memory.set(slug, { progress, finished });

    if (Math.abs(progress - (lastSaved.get(slug) ?? 0)) >= SAVE_STEP) {
        lastSaved = new Map(lastSaved).set(slug, progress);
        write();
    }
}

export function markFinished(slug: string): void {
    memory.set(slug, { progress: 0, finished: true });
    write();
}

/** Worth offering "pick up where you left off"? */
export function canResume(entry: ReadingEntry | null): entry is ReadingEntry {
    return (
        entry !== null &&
        !entry.finished &&
        entry.progress > 0.02 &&
        entry.progress < 0.98
    );
}
