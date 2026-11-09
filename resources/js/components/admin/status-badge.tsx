import { Badge } from '@/components/ui/badge';
import type { ConsentStatus } from './types';

/** The words carry the meaning; the colour only backs them up. */
export function StatusBadge({ status }: { status: ConsentStatus }) {
    return status === 'withdrawn' ? (
        <Badge
            variant="secondary"
            className="bg-rose-500/10 text-rose-700 dark:text-rose-400"
        >
            Withdrawn
        </Badge>
    ) : (
        <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        >
            Active
        </Badge>
    );
}
