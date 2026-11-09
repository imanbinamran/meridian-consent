import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const THEME_COLORS = { light: '#ffffff', dark: '#0c0a09' } as const;

/** Keep the phone's status bar in step with a manual theme switch. */
function syncThemeColor(mode: keyof typeof THEME_COLORS): void {
    const metas = document.querySelectorAll<HTMLMetaElement>(
        'meta[name="theme-color"]',
    );

    metas.forEach((meta, index) => {
        if (index > 0) {
            meta.remove();

            return;
        }

        meta.removeAttribute('media');
        meta.content = THEME_COLORS[mode];
    });
}

export function ThemeToggle({ className }: { className?: string }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <button
            type="button"
            onClick={(event) => {
                const next = isDark ? 'light' : 'dark';
                updateAppearance(next, event.currentTarget);
                syncThemeColor(next);
            }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={cn(
                'inline-flex size-10 items-center justify-center rounded-full text-foreground/70 transition-[color,background-color,transform] duration-150 ease-out-strong hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.97]',
                className,
            )}
        >
            {isDark ? (
                <Sun className="size-[1.1rem]" aria-hidden="true" />
            ) : (
                <Moon className="size-[1.1rem]" aria-hidden="true" />
            )}
        </button>
    );
}
