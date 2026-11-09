import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: string;
    /** A small badge beside the title, such as whether the page is live. */
    status?: ReactNode;
    actions?: ReactNode;
};

export function PageHeader({ title, description, status, actions }: Props) {
    return (
        <div
            className={
                description
                    ? 'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'
                    : 'flex items-center justify-between gap-3'
            }
        >
            <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    {status}
                </div>
                {description && (
                    <p className="max-w-prose text-sm text-pretty text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
            )}
        </div>
    );
}
