import { LoaderCircle, Radio, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LiveStatus } from '@/hooks/use-live-overview';

const STATES = {
    connecting: {
        label: 'Connecting',
        detail: 'Connecting to live updates.',
        icon: LoaderCircle,
        iconClassName: 'motion-safe:animate-spin',
        className: '',
    },
    live: {
        label: 'Live',
        detail: 'These numbers update on their own.',
        icon: Radio,
        iconClassName: '',
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
    disconnected: {
        label: 'Disconnected',
        detail: 'Live updates are off, so these numbers may be out of date. Reload the page to see the latest.',
        icon: WifiOff,
        iconClassName: '',
        className: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
    },
};

/**
 * Whether the numbers on the page update on their own. Shows nothing when
 * live updates are not set up. The words carry the meaning; the colour only
 * backs them up.
 */
export function LiveIndicator({ status }: { status: LiveStatus }) {
    if (status === 'off') {
        return null;
    }

    const {
        label,
        detail,
        icon: Icon,
        iconClassName,
        className,
    } = STATES[status];

    return (
        <Badge
            variant="secondary"
            role="status"
            aria-live="polite"
            title={detail}
            className={className}
        >
            <Icon aria-hidden className={iconClassName} />
            {label}
            <span className="sr-only">. {detail}</span>
        </Badge>
    );
}
