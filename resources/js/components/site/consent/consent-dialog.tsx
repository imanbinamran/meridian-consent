import { Link } from '@inertiajs/react';
import { ArrowLeft, Cookie } from 'lucide-react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/lib/i18n';
import type { RichTags } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { privacy, terms } from '@/routes';
import { LanguageSwitch } from '../language-switch';
import { useConsent } from './consent-context';
import type { ConsentChoice, LegalDocumentName } from './consent-context';

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
 * Following a link in the box turns the box into a reader for that page, so
 * the visitor can read what they are agreeing to while the page stays locked.
 */
export function ConsentDialog() {
    const {
        consent,
        open,
        reading,
        readerSlot,
        dismissible,
        pending,
        choose,
        close,
    } = useConsent();
    const contentRef = useRef<HTMLDivElement>(null);
    const { t, rich, intlLocale } = useI18n();
    const decidedFormat = new Intl.DateTimeFormat(intlLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    // The link that was clicked is gone, so focus moves with the content.
    useEffect(() => {
        (readerSlot ?? contentRef.current)?.focus({ preventScroll: true });
    }, [readerSlot]);

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
                        // Reader: nearly full height, and only the text scrolls.
                        reading &&
                            'flex h-[calc(100dvh-1.5rem)] max-h-none flex-col overflow-hidden sm:h-[min(85dvh,48rem)] sm:max-w-2xl',
                    )}
                >
                    {reading ? (
                        <ConsentReader legalDocument={reading} />
                    ) : (
                        <>
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

                            {dismissible &&
                                consent.choice &&
                                consent.decidedAt && (
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
                        </>
                    )}
                </AlertDialogPrimitive.Content>
            </AlertDialogPrimitive.Portal>
        </AlertDialogPrimitive.Root>
    );
}

/**
 * The box while the visitor reads Terms or Privacy. The legal page draws its
 * own text into the scrolling area, so its links and tables keep working.
 */
function ConsentReader({
    legalDocument,
}: {
    legalDocument: LegalDocumentName;
}) {
    const { pending, choose, setReaderSlot, stopReading } = useConsent();
    const { t } = useI18n();
    const title = t(`${legalDocument}.title`);

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={stopReading}
                    className="-ms-1 inline-flex items-center gap-1.5 rounded-sm px-1 py-1 text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <ArrowLeft
                        aria-hidden="true"
                        className="size-4 rtl:rotate-180"
                    />
                    {t('common.consent.back')}
                </button>
                <LanguageSwitch />
            </div>

            <div className="mt-3">
                <AlertDialogPrimitive.Title className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">
                    {t('common.consent.title')}
                </AlertDialogPrimitive.Title>
                <AlertDialogPrimitive.Description className="mt-1 font-display text-2xl leading-tight font-medium tracking-tight sm:text-[1.75rem]">
                    {title}
                </AlertDialogPrimitive.Description>
            </div>

            <div
                key={legalDocument}
                ref={setReaderSlot}
                role="region"
                aria-label={title}
                tabIndex={0}
                className="-mx-5 mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain border-y border-foreground/10 px-5 py-6 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:-mx-8 sm:px-8"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
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
        </>
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
