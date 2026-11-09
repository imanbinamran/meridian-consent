/**
 * Runs a slow task at most once per gap. A request made while the task runs or
 * the gap is open is held and run as soon as both are over, so the last request
 * is never lost and two runs never overlap.
 *
 * `start` begins the task, calls `done` when it ends and returns a way to
 * cancel it.
 */
export function trailingThrottle(
    start: (done: () => void) => () => void,
    gapMs: number,
) {
    let wanted = false;
    let running = false;
    let stopped = false;
    let gap: ReturnType<typeof setTimeout> | undefined;
    let cancel: (() => void) | undefined;

    const flush = () => {
        if (stopped || !wanted || running || gap !== undefined) {
            return;
        }

        wanted = false;
        running = true;
        gap = setTimeout(() => {
            gap = undefined;
            flush();
        }, gapMs);
        cancel = start(() => {
            running = false;
            cancel = undefined;
            flush();
        });
    };

    return {
        request() {
            wanted = true;
            flush();
        },
        stop() {
            stopped = true;
            clearTimeout(gap);
            cancel?.();
        },
    };
}
