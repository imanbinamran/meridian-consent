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
    /** The blocking box: the page behind it is locked and inert. */
    open: boolean;
    /** The visitor is reading Terms or Privacy, with the choice still owed. */
    docked: boolean;
    /** True when the visitor reopened the box and may close it again. */
    dismissible: boolean;
    pending: ConsentChoice | null;
    choose: (choice: ConsentChoice) => void;
    reopen: () => void;
    close: () => void;
    /** Call once a link inside the box has landed on its page. */
    followedLegalLink: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

/** Matches the class app.blade.php sets before React loads. */
const LOCK_CLASS = 'consent-locked';

function isLegalPage(url: string): boolean {
    const path = url.split(/[?#]/)[0];

    return path === terms.url() || path === privacy.url();
}

export function ConsentProvider({ children }: { children: ReactNode }) {
    const page = usePage();
    const consent = page.props.consent as ConsentProps;
    const onLegalPage = isLegalPage(page.url);
    const [reopened, setReopened] = useState(false);
    const [reading, setReading] = useState(false);
    const [pending, setPending] = useState<ConsentChoice | null>(null);
    // Guards against a double click landing before React re-renders.
    const inFlight = useRef(false);

    // Leaving the legal pages ends reading mode, so the full box comes back.
    if (reading && !onLegalPage) {
        setReading(false);
    }

    // Only a click on a link in the box docks it. Opening /terms directly, or
    // refreshing it, still shows the full box with the page locked.
    const docked =
        consent.enabled && consent.required && reading && onLegalPage;
    const open = consent.enabled && (consent.required || reopened) && !docked;

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
                    setReading(false);
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
        docked,
        dismissible: !consent.required,
        pending,
        choose,
        reopen: () => {
            setReading(false);
            setReopened(true);
        },
        close: () => {
            if (!consent.required) {
                setReopened(false);
            }
        },
        followedLegalLink: () => {
            setReopened(false);
            setReading(consent.required);
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
