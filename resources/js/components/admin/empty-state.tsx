import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
    return (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <div className="space-y-1">
                <h2 className="font-medium">{title}</h2>
                <p className="max-w-sm text-sm text-pretty text-muted-foreground">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}
