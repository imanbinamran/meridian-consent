import { Moon, Sun } from 'lucide-react';
import { syncThemeColor } from '@/components/site/theme-toggle';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';

/** Light and dark switch for the admin sidebar. */
export function NavTheme() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const label = isDark ? 'Light mode' : 'Dark mode';
    const Icon = isDark ? Sun : Moon;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                tooltip={label}
                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                onClick={(event) => {
                    const next = isDark ? 'light' : 'dark';

                    updateAppearance(next, event.currentTarget);
                    syncThemeColor(next);
                }}
            >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
