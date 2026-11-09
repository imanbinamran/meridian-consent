import { router, usePage } from '@inertiajs/react';
import {
    createContext,
    use,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import { setReadingStorageAllowed } from '@/components/site/story/reading-store';
import { privacy, terms } from '@/routes';
import { accept, decline } from '@/routes/consent';

export type ConsentChoice = 'accepted' | 'declined';
export type LegalDocumentName = 'terms' | 'privacy';

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
    /** The document being read inside the box, with the choice still owed. */
    reading: LegalDocumentName | null;
    /** Where the legal page draws its text while the box is the reader. */
    readerSlot: HTMLElement | null;
    setReaderSlot: (element: HTMLElement | null) => void;
    /** True when the visitor reopened the box and may close it again. */
    dismissible: boolean;
    pending: ConsentChoice | null;
    choose: (choice: ConsentChoice) => void;
    reopen: () => void;
    close: () => void;
    /** Call once a link inside the box has landed on its page. */
    followedLegalLink: () => void;
    stopReading: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

/** Matches the class app.blade.php sets before React loads. */
const LOCK_CLASS = 'consent-locked';

function legalDocumentAt(url: string): LegalDocumentName | null {
    const path = url.split(/[?#]/)[0];

    if (path === terms.url()) {
        return 'terms';
    }

    return path === privacy.url() ? 'privacy' : null;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
    const page = usePage();
    const consent = page.props.consent as ConsentProps;
    const legalDocument = legalDocumentAt(page.url);
    const [reopened, setReopened] = useState(false);
    const [wantsToRead, setWantsToRead] = useState(false);
    const [readerSlot, setReaderSlot] = useState<HTMLElement | null>(null);
    const [pending, setPending] = useState<ConsentChoice | null>(null);
    // Guards against a double click landing before React re-renders.
    const inFlight = useRef(false);

    // Leaving the legal pages ends reading, so the notice comes back.
    if (wantsToRead && !legalDocument) {
        setWantsToRead(false);
    }

    const open = consent.enabled && (consent.required || reopened);

    // Only a click on a link in the box turns it into the reader. Opening
    // /terms directly, or refreshing it, still shows the notice.
    const reading =
        consent.enabled && consent.required && wantsToRead
            ? legalDocument
            : null;

    useEffect(() => {
        document.documentElement.classList.toggle(LOCK_CLASS, open);

        return () => document.documentElement.classList.remove(LOCK_CLASS);
    }, [open]);

    // Layout effect: pages read saved progress in their own effects, after this.
    useLayoutEffect(() => {
        setReadingStorageAllowed(consent.choice === 'accepted');
    }, [consent.choice]);

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
                onSuccess: () => {
                    setReopened(false);
                    setWantsToRead(false);
                },
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
        reading,
        readerSlot,
        setReaderSlot,
        dismissible: !consent.required,
        pending,
        choose,
        reopen: () => {
            setWantsToRead(false);
            setReopened(true);
        },
        close: () => {
            if (!consent.required) {
                setReopened(false);
            }
        },
        followedLegalLink: () => {
            setReopened(false);
            setWantsToRead(consent.required);
        },
        stopReading: () => setWantsToRead(false),
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
