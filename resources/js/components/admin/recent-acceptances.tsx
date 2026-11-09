import { Link } from '@inertiajs/react';
import { ArrowRight, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index as consentsIndex } from '@/routes/admin/consents';
import { CopyButton } from './copy-button';
import { formatRecent } from './format';
import { LocalTime } from './local-time';
import type { RecentConsent } from './types';

type Props = {
    items: RecentConsent[];
    timeZone: string;
};

export function RecentAcceptances({ items, timeZone }: Props) {
    return (
        <Card className="h-full gap-4">
            <CardHeader>
                <CardTitle>Recent acceptances</CardTitle>
                <CardDescription>
                    The latest five visitors to agree.
                </CardDescription>
                <CardAction>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={consentsIndex()} prefetch>
                            View all
                            <ArrowRight
                                className="rtl:rotate-180"
                                aria-hidden
                            />
                        </Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                        <Inbox className="size-5" aria-hidden />
                        No acceptances yet.
                    </div>
                ) : (
                    <ul className="divide-y">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center gap-1">
                                        <span
                                            className="min-w-0 truncate font-mono text-xs sm:text-sm"
                                            title={item.guid}
                                        >
                                            {item.guid}
                                        </span>
                                        <CopyButton
                                            value={item.guid}
                                            label="Copy GUID"
                                        />
                                    </div>
                                    <p className="flex flex-wrap gap-x-1 text-xs text-muted-foreground">
                                        <LocalTime
                                            iso={item.acceptedAt}
                                            timeZone={timeZone}
                                        />
                                        <span aria-hidden>·</span>
                                        <span
                                            dir="ltr"
                                            className="whitespace-nowrap"
                                        >
                                            {formatRecent(
                                                item.acceptedAt,
                                                timeZone,
                                            )}
                                        </span>
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="shrink-0 tabular-nums"
                                >
                                    v{item.version}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
