import { Badge } from '@/components/ui/badge';
import type { ConsentStatus } from './types';

const BADGES: Record<ConsentStatus, { label: string; className: string }> = {
    active: {
        label: 'Active',
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
    expired: {
        label: 'Expired',
        className: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
    },
    withdrawn: {
        label: 'Withdrawn',
        className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    },
};

/** The words carry the meaning; the colour only backs them up. */
export function StatusBadge({ status }: { status: ConsentStatus }) {
    const { label, className } = BADGES[status];

    return (
        <Badge variant="secondary" className={className}>
            {label}
        </Badge>
    );
}
