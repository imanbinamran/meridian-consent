import { router, usePage } from '@inertiajs/react';
import { createContext, use, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { accept, decline } from '@/routes/consent';

export type ConsentChoice = 'accepted' | 'declined';

/** Shared by HandleInertiaRequests on every Inertia response. */
export type ConsentProps = {
    enabled: boolean;
    required: boolean;
    version: number;
    choice: ConsentChoice | null;
    decidedAt: string | null;
};

type ConsentContextValue = {
    consent: ConsentProps;
    open: boolean;
    /** True when the visitor reopened the box and may close it again. */
    dismissible: boolean;
    pending: ConsentChoice | null;
    choose: (choice: ConsentChoice) => void;
    reopen: () => void;
    close: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

/** Matches the class app.blade.php sets before React loads. */
const LOCK_CLASS = 'consent-locked';

export function ConsentProvider({ children }: { children: ReactNode }) {
    const consent = usePage().props.consent as ConsentProps;
    const [reopened, setReopened] = useState(false);
    const [pending, setPending] = useState<ConsentChoice | null>(null);
    // Guards against a double click landing before React re-renders.
    const inFlight = useRef(false);

    const open = consent.enabled && (consent.required || reopened);

    useEffect(() => {
        document.documentElement.classList.toggle(LOCK_CLASS, open);

        return () => document.documentElement.classList.remove(LOCK_CLASS);
    }, [open]);

    const choose = (choice: ConsentChoice) => {
        if (inFlight.current) {
            return;
        }

        inFlight.current = true;

        const url = choice === 'accepted' ? accept.url() : decline.url();

        router.post(
            url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setPending(choice),
                onSuccess: () => setReopened(false),
                onFinish: () => {
                    inFlight.current = false;
                    setPending(null);
                },
            },
        );
    };

    const value: ConsentContextValue = {
        consent,
        open,
        dismissible: !consent.required,
        pending,
        choose,
        reopen: () => setReopened(true),
        close: () => {
            if (!consent.required) {
                setReopened(false);
            }
        },
    };

    return <ConsentContext value={value}>{children}</ConsentContext>;
}

export function useConsent(): ConsentContextValue {
    const context = use(ConsentContext);

    if (!context) {
        throw new Error('useConsent must be used inside <ConsentProvider>.');
    }

    return context;
}
