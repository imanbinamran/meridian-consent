import { Link } from '@inertiajs/react';
import { Cookie } from 'lucide-react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { privacy, terms } from '@/routes';
import { useConsent } from './consent-context';
import type { ConsentChoice } from './consent-context';

const decidedFormat = new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

/**
 * The cookie notice. A modal the visitor cannot dismiss on a first visit:
 * Esc and outside clicks do nothing, focus stays inside, and the page behind
 * is inert until they choose. Reopened from "Cookie settings", Esc closes it.
 */
export function ConsentDialog() {
    const { consent, open, dismissible, pending, choose, close } = useConsent();
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <AlertDialogPrimitive.Root
            open={open}
            onOpenChange={(next) => !next && close()}
        >
            <AlertDialogPrimitive.Portal>
                <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=closed]:ease-out-strong data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:duration-400 data-[state=open]:ease-drawer data-[state=open]:fade-in-0 sm:data-[state=closed]:duration-150 sm:data-[state=open]:duration-200 sm:data-[state=open]:ease-out-strong" />
                <AlertDialogPrimitive.Content
                    ref={contentRef}
                    onOpenAutoFocus={(event) => {
                        // Land on the dialog itself so screen readers announce
                        // the title and the full notice before any control.
                        event.preventDefault();
                        contentRef.current?.focus();
                    }}
                    onEscapeKeyDown={(event) => {
                        if (!dismissible) {
                            event.preventDefault();
                        }
                    }}
                    className={cn(
                        // Phone: a bottom sheet that travels its full height on
                        // the iOS drawer curve, and leaves faster than it came.
                        'fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto overscroll-contain border-t-4 border-primary bg-background text-foreground shadow-2xl outline-none',
                        'rounded-t-3xl ps-[max(1.25rem,env(safe-area-inset-left))] pe-[max(1.25rem,env(safe-area-inset-right))] pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
                        'data-[state=open]:animate-in data-[state=open]:duration-400 data-[state=open]:ease-drawer data-[state=open]:slide-in-from-bottom',
                        'data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=closed]:ease-out-strong data-[state=closed]:slide-out-to-bottom',
                        'motion-reduce:data-[state=closed]:fade-out-0 motion-reduce:data-[state=open]:fade-in-0',
                        // Wider screens: a centred modal that settles from 96%.
                        'sm:inset-x-auto sm:start-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-3rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-t-4 sm:border-foreground/10 sm:border-t-primary sm:p-8 sm:rtl:translate-x-1/2',
                        'sm:data-[state=open]:duration-200 sm:data-[state=open]:ease-out-strong sm:data-[state=open]:fade-in-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-96',
                        'sm:data-[state=closed]:duration-150 sm:data-[state=closed]:fade-out-0 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-96',
                    )}
                >
                    <div className="flex items-start gap-4">
                        <span
                            aria-hidden="true"
                            className="mt-1 hidden size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-brand sm:flex"
                        >
                            <Cookie className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">
                                Your privacy
                            </p>
                            <AlertDialogPrimitive.Title className="mt-1 font-display text-2xl leading-tight font-medium tracking-tight sm:text-[1.75rem]">
                                Cookie consent
                            </AlertDialogPrimitive.Title>
                        </div>
                    </div>

                    <AlertDialogPrimitive.Description asChild>
                        <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                            <p>
                                Cookies are necessary for this website to
                                function properly, for performance measurement,
                                and to provide you with the best experience.
                            </p>
                            <p>
                                By continuing to access or use this site, you
                                acknowledge and consent to our use of cookies in
                                accordance with our{' '}
                                <ConsentLink href={terms.url()}>
                                    Terms &amp; Conditions
                                </ConsentLink>{' '}
                                and{' '}
                                <ConsentLink href={privacy.url()}>
                                    Privacy Statement
                                </ConsentLink>
                                .
                            </p>
                        </div>
                    </AlertDialogPrimitive.Description>

                    {dismissible && consent.choice && consent.decidedAt && (
                        <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                            You{' '}
                            <strong className="font-medium text-foreground">
                                {consent.choice}
                            </strong>{' '}
                            on{' '}
                            {decidedFormat.format(new Date(consent.decidedAt))}.
                            Choose again to change it.
                        </p>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <ChoiceButton
                            choice="declined"
                            pending={pending}
                            onChoose={choose}
                        >
                            Decline
                        </ChoiceButton>
                        <ChoiceButton
                            choice="accepted"
                            pending={pending}
                            onChoose={choose}
                        >
                            Accept
                        </ChoiceButton>
                    </div>
                </AlertDialogPrimitive.Content>
            </AlertDialogPrimitive.Portal>
        </AlertDialogPrimitive.Root>
    );
}

function ConsentLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            preserveScroll
            className="rounded-sm font-medium text-foreground underline decoration-brand/50 underline-offset-4 transition-colors hover:decoration-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
            {children}
        </Link>
    );
}

/**
 * Both choices share one style on purpose: neither is nudged.
 */
function ChoiceButton({
    choice,
    pending,
    onChoose,
    children,
}: {
    choice: ConsentChoice;
    pending: ConsentChoice | null;
    onChoose: (choice: ConsentChoice) => void;
    children: ReactNode;
}) {
    const busy = pending === choice;

    return (
        <button
            type="button"
            onClick={() => onChoose(choice)}
            disabled={pending !== null}
            aria-busy={busy || undefined}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-[transform,opacity,background-color] duration-150 ease-out-strong hover:bg-foreground/85 focus-visible:ring-3 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.97] disabled:cursor-wait disabled:opacity-60"
        >
            {busy && (
                <Spinner
                    className="size-4"
                    role="presentation"
                    aria-hidden="true"
                    aria-label={undefined}
                />
            )}
            {children}
        </button>
    );
}
