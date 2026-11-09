import { Link } from '@inertiajs/react';
import { Cookie } from 'lucide-react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/lib/i18n';
import type { RichTags } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { privacy, terms } from '@/routes';
import { LanguageSwitch } from '../language-switch';
import { useConsent } from './consent-context';
import type { ConsentChoice } from './consent-context';

const agreementLinks: RichTags = {
    terms: (children) => (
        <ConsentLink href={terms.url()}>{children}</ConsentLink>
    ),
    privacy: (children) => (
        <ConsentLink href={privacy.url()}>{children}</ConsentLink>
    ),
};

const statusTags: RichTags = {
    strong: (children) => (
        <strong className="font-medium text-foreground">{children}</strong>
    ),
};

/**
 * The cookie notice. A modal the visitor cannot dismiss on a first visit:
 * Esc and outside clicks do nothing, focus stays inside, and the page behind
 * is inert until they choose. Reopened from "Cookie settings", Esc closes it.
 * The page's language switch is inert too, so the box carries its own.
 *
 * Following a link in the box docks it instead: the visitor can read the Terms
 * or Privacy page they asked for, and still has to choose to go anywhere else.
 */
export function ConsentDialog() {
    const { consent, open, docked, dismissible, pending, choose, close } =
        useConsent();
    const contentRef = useRef<HTMLDivElement>(null);
    const { t, rich, intlLocale } = useI18n();
    const decidedFormat = new Intl.DateTimeFormat(intlLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <>
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
                        onCloseAutoFocus={(event) => {
                            // Docking: start the reader at the page they asked for.
                            if (docked) {
                                event.preventDefault();
                                document
                                    .getElementById('main')
                                    ?.focus({ preventScroll: true });
                            }
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
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">
                                    {t('common.consent.kicker')}
                                </p>
                                <AlertDialogPrimitive.Title className="mt-1 font-display text-2xl leading-tight font-medium tracking-tight sm:text-[1.75rem]">
                                    {t('common.consent.title')}
                                </AlertDialogPrimitive.Title>
                            </div>
                            <LanguageSwitch />
                        </div>

                        <AlertDialogPrimitive.Description asChild>
                            <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                                <p>{t('common.consent.intro')}</p>
                                <p>
                                    {rich(
                                        'common.consent.agreement',
                                        {},
                                        agreementLinks,
                                    )}
                                </p>
                            </div>
                        </AlertDialogPrimitive.Description>

                        {dismissible && consent.choice && consent.decidedAt && (
                            <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                                {rich(
                                    `common.consent.status_${consent.choice}`,
                                    {
                                        date: decidedFormat.format(
                                            new Date(consent.decidedAt),
                                        ),
                                    },
                                    statusTags,
                                )}
                            </p>
                        )}

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <ChoiceButton
                                choice="declined"
                                pending={pending}
                                onChoose={choose}
                            >
                                {t('common.consent.decline')}
                            </ChoiceButton>
                            <ChoiceButton
                                choice="accepted"
                                pending={pending}
                                onChoose={choose}
                            >
                                {t('common.consent.accept')}
                            </ChoiceButton>
                        </div>
                    </AlertDialogPrimitive.Content>
                </AlertDialogPrimitive.Portal>
            </AlertDialogPrimitive.Root>
            {docked && <DockedConsent />}
        </>
    );
}

/**
 * The box while the visitor reads Terms or Privacy. It sits in the page flow
 * and sticks to the bottom of the window, so it never covers the page's end.
 */
function DockedConsent() {
    const { pending, choose } = useConsent();
    const { t } = useI18n();
    const titleId = useId();
    const descriptionId = useId();

    return (
        <div
            role="dialog"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="sticky bottom-0 z-40 animate-in border-t-4 border-primary bg-background text-foreground shadow-2xl duration-300 ease-out-strong slide-in-from-bottom motion-reduce:fade-in-0 motion-reduce:slide-in-from-bottom-0"
        >
            <div className="mx-auto flex max-w-6xl flex-col gap-3 ps-[max(1.25rem,env(safe-area-inset-left))] pe-[max(1.25rem,env(safe-area-inset-right))] pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:ps-[max(1.5rem,env(safe-area-inset-left))] sm:pe-[max(1.5rem,env(safe-area-inset-right))] lg:ps-[max(2rem,env(safe-area-inset-left))] lg:pe-[max(2rem,env(safe-area-inset-right))]">
                <div className="min-w-0">
                    <p
                        id={titleId}
                        className="font-display text-lg leading-tight font-medium tracking-tight"
                    >
                        {t('common.consent.title')}
                    </p>
                    <p
                        id={descriptionId}
                        className="mt-1 text-sm leading-relaxed text-muted-foreground"
                    >
                        {t('common.consent.docked')}
                    </p>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-3 sm:w-72">
                    <ChoiceButton
                        choice="declined"
                        pending={pending}
                        onChoose={choose}
                    >
                        {t('common.consent.decline')}
                    </ChoiceButton>
                    <ChoiceButton
                        choice="accepted"
                        pending={pending}
                        onChoose={choose}
                    >
                        {t('common.consent.accept')}
                    </ChoiceButton>
                </div>
            </div>
        </div>
    );
}

function ConsentLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    const { followedLegalLink } = useConsent();

    return (
        <Link
            href={href}
            preserveScroll
            onSuccess={followedLegalLink}
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
