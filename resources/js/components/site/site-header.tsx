import { Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { siteNav } from './site-nav';
import { SiteLogo } from './site-logo';
import { ThemeToggle } from './theme-toggle';

// The machine-readable date must be the Kuala Lumpur date too, not UTC.
const isoDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
});

const editionDate = new Intl.DateTimeFormat('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
});

export function SiteHeader() {
    const { isCurrentUrl } = useCurrentUrl();
    const [menuOpen, setMenuOpen] = useState(false);
    // The menu slides in from the inline end: right in English, left in RTL.
    const menuSide =
        typeof document !== 'undefined' &&
        document.documentElement.dir === 'rtl'
            ? 'left'
            : 'right';

    return (
        <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
            <div className="hidden border-b border-foreground/10 sm:block">
                <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-6 text-xs text-muted-foreground lg:px-8">
                    <p>
                        <time dateTime={isoDate.format(new Date())}>
                            {editionDate.format(new Date())}
                        </time>
                        <span aria-hidden="true" className="mx-2">
                            ·
                        </span>
                        Kuala Lumpur edition
                    </p>
                    <p className="tracking-wide">
                        Independent journalism for Malaysia
                    </p>
                </div>
            </div>

            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <SiteLogo />

                <nav aria-label="Main" className="hidden md:block">
                    <ul className="flex items-center gap-1">
                        {siteNav.map((item) => {
                            const current = isCurrentUrl(item.href);

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={
                                            current ? 'page' : undefined
                                        }
                                        className={cn(
                                            'relative inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                            current &&
                                                'text-foreground after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary',
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="flex items-center gap-1">
                    <ThemeToggle />

                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-[background-color,transform] duration-150 ease-out-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.97] md:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="size-5" aria-hidden="true" />
                            </button>
                        </SheetTrigger>
                        <SheetContent
                            side={menuSide}
                            className="w-[85vw] max-w-sm pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
                        >
                            <SheetHeader className="border-b border-foreground/10">
                                <SheetTitle className="font-display text-2xl font-semibold">
                                    Meridian
                                </SheetTitle>
                                <SheetDescription>
                                    News and lifestyle from Kuala Lumpur.
                                </SheetDescription>
                            </SheetHeader>
                            <nav aria-label="Mobile" className="px-3 py-4">
                                <ul className="flex flex-col">
                                    {siteNav.map((item) => {
                                        const current = isCurrentUrl(item.href);

                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() =>
                                                        setMenuOpen(false)
                                                    }
                                                    aria-current={
                                                        current
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    className={cn(
                                                        'flex items-center justify-between rounded-xl px-3 py-3 font-display text-xl transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                                        current && 'text-brand',
                                                    )}
                                                >
                                                    {item.label}
                                                    {current && (
                                                        <span
                                                            aria-hidden="true"
                                                            className="size-1.5 rounded-full bg-primary"
                                                        />
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
